import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { prisma } from '../lib/prisma.js';
import { enqueueEmail } from '../services/queue.js';
import { HttpError } from '../middleware/error.js';
import { extractVariables } from '../utils/mailMerge.js';

export const campaignsRouter = Router();
campaignsRouter.use(requireAuth);

const campaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  contentType: z.enum(['HTML', 'PLAIN_TEXT']).default('HTML'),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED']).default('DRAFT'),
  smtpGroup: z.string().default('default'),
  smtpAccountIds: z.array(z.string()).default([]),
  dailyLimit: z.coerce.number().int().positive().default(500),
  timezone: z.string().default('UTC'),
  scheduledAt: z.coerce.date().optional(),
  businessHours: z.object({ start: z.number(), end: z.number(), days: z.array(z.number()) }).optional(),
  steps: z.array(z.object({ position: z.number(), delayDays: z.number(), condition: z.string(), subject: z.string(), body: z.string(), contentType: z.enum(['HTML', 'PLAIN_TEXT']).default('HTML') })).default([])
});

campaignsRouter.get('/', async (req, res) => {
  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { emailEvents: true } } }
  });
  res.json({ campaigns });
});

campaignsRouter.post('/', requireRole('MANAGER'), async (req, res) => {
  const body = campaignSchema.parse(req.body);
  const campaign = await prisma.campaign.create({
    data: {
      ownerId: req.user!.id,
      name: body.name,
      subject: body.subject,
      body: body.body,
      contentType: body.contentType,
      status: body.status,
      smtpGroup: body.smtpGroup,
      smtpAccountIds: body.smtpAccountIds,
      dailyLimit: body.dailyLimit,
      timezone: body.timezone,
      scheduledAt: body.scheduledAt,
      businessHours: body.businessHours,
      steps: { create: body.steps }
    },
    include: { steps: true }
  });
  res.status(201).json({ campaign, variables: extractVariables(`${campaign.subject}\n${campaign.body}`) });
});

campaignsRouter.get('/:id', async (req, res) => {
  const campaign = await prisma.campaign.findFirst({ where: { id: String(req.params.id), ownerId: req.user!.id }, include: { steps: true, emailEvents: { take: 100, orderBy: { createdAt: 'desc' } } } });
  if (!campaign) throw new HttpError(404, 'Campaign not found');
  res.json({ campaign });
});

campaignsRouter.patch('/:id', requireRole('MANAGER'), async (req, res) => {
  const body = campaignSchema.partial().parse(req.body);
  const campaign = await prisma.campaign.update({ where: { id: String(req.params.id), ownerId: req.user!.id }, data: { ...body, steps: undefined } });
  res.json({ campaign });
});

campaignsRouter.post('/:id/send', requireRole('MANAGER'), async (req, res) => {
  const campaign = await prisma.campaign.findFirst({ where: { id: String(req.params.id), ownerId: req.user!.id }, include: { steps: true } });
  if (!campaign) throw new HttpError(404, 'Campaign not found');
  const leadIds: string[] | undefined = Array.isArray(req.body.leadIds) ? req.body.leadIds : undefined;
  const leads = await prisma.lead.findMany({ where: { ownerId: req.user!.id, unsubscribed: false, ...(leadIds ? { id: { in: leadIds } } : {}) }, take: campaign.dailyLimit });
  for (const lead of leads) {
    await enqueueEmail({ ownerId: req.user!.id, campaignId: campaign.id, leadId: lead.id });
    for (const step of campaign.steps) {
      const delayMs = step.delayDays * 24 * 60 * 60 * 1000;
      await enqueueEmail({ ownerId: req.user!.id, campaignId: campaign.id, leadId: lead.id, stepId: step.id }, delayMs);
    }
  }
  await prisma.campaign.update({ where: { id: campaign.id }, data: { status: 'ACTIVE', startedAt: new Date() } });
  res.json({ queued: leads.length });
});

campaignsRouter.post('/:id/pause', requireRole('MANAGER'), async (req, res) => {
  const campaign = await prisma.campaign.update({ where: { id: String(req.params.id), ownerId: req.user!.id }, data: { status: 'PAUSED' } });
  res.json({ campaign });
});

campaignsRouter.post('/:id/resume', requireRole('MANAGER'), async (req, res) => {
  const campaign = await prisma.campaign.update({ where: { id: String(req.params.id), ownerId: req.user!.id }, data: { status: 'ACTIVE' } });
  res.json({ campaign });
});
