import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { parsePastedLeads, parseTableByFilename } from '../utils/importers.js';
import { HttpError } from '../middleware/error.js';

export const leadsRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
leadsRouter.use(requireAuth);

const standardKeys = new Set(['name', 'firstName', 'first_name', 'lastName', 'last_name', 'company', 'website', 'location', 'jobTitle', 'job_title', 'phone', 'email']);
const leadSchema = z.object({
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email(),
  customFields: z.record(z.unknown()).default({})
});

function normalizeLead(row: Record<string, unknown>) {
  const customFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (!standardKeys.has(key) && value !== '' && value != null) customFields[key] = value;
  }
  const parsed = leadSchema.parse({
    name: row.name ?? row.Name,
    firstName: row.firstName ?? row.first_name ?? row['First Name'],
    lastName: row.lastName ?? row.last_name ?? row['Last Name'],
    company: row.company ?? row.Company,
    website: row.website ?? row.Website,
    location: row.location ?? row.Location,
    jobTitle: row.jobTitle ?? row.job_title ?? row['Job Title'],
    phone: row.phone ?? row.Phone,
    email: row.email ?? row.Email,
    customFields: { ...customFields, ...(typeof row.customFields === 'object' && row.customFields ? row.customFields : {}) }
  });
  return { ...parsed, customFields: parsed.customFields as Prisma.InputJsonValue };
}

leadsRouter.get('/', async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const take = Math.min(Number(req.query.take ?? 50), 200);
  const q = String(req.query.q ?? '');
  const where = {
    ownerId: req.user!.id,
    ...(q ? { OR: [{ email: { contains: q, mode: 'insensitive' as const } }, { company: { contains: q, mode: 'insensitive' as const } }, { name: { contains: q, mode: 'insensitive' as const } }] } : {})
  };
  const [items, total] = await Promise.all([
    prisma.lead.findMany({ where, skip: (page - 1) * take, take, orderBy: { createdAt: 'desc' } }),
    prisma.lead.count({ where })
  ]);
  res.json({ leads: items, total, page, take });
});

leadsRouter.post('/', async (req, res) => {
  const body = normalizeLead(req.body);
  const lead = await prisma.lead.upsert({
    where: { ownerId_email: { ownerId: req.user!.id, email: body.email.toLowerCase() } },
    create: { ...body, email: body.email.toLowerCase(), ownerId: req.user!.id },
    update: { ...body, email: body.email.toLowerCase() }
  });
  res.status(201).json({ lead });
});

leadsRouter.post('/import', upload.single('file'), async (req, res) => {
  let rows: Record<string, unknown>[] = [];
  if (req.file) rows = await parseTableByFilename(req.file.originalname, req.file.buffer);
  else if (req.body.text) rows = parsePastedLeads(String(req.body.text));
  else if (req.body.googleSheetsUrl) {
    const url = String(req.body.googleSheetsUrl).replace('/edit#gid=', '/export?format=csv&gid=');
    const csv = await fetch(url).then((r) => r.text());
    rows = await parseTableByFilename('sheet.csv', Buffer.from(csv));
  } else throw new HttpError(400, 'Provide a file, pasted text, or public Google Sheets URL');

  let imported = 0;
  const errors: Array<{ row: number; error: string }> = [];
  for (let i = 0; i < rows.length; i++) {
    try {
      const lead = normalizeLead(rows[i]);
      await prisma.lead.upsert({
        where: { ownerId_email: { ownerId: req.user!.id, email: lead.email.toLowerCase() } },
        create: { ...lead, email: lead.email.toLowerCase(), ownerId: req.user!.id },
        update: { ...lead, email: lead.email.toLowerCase() }
      });
      imported++;
    } catch (error) {
      errors.push({ row: i + 1, error: error instanceof Error ? error.message : 'Invalid row' });
    }
  }
  res.status(201).json({ imported, errors });
});

leadsRouter.delete('/:id', async (req, res) => {
  await prisma.lead.delete({ where: { id: String(req.params.id), ownerId: req.user!.id } });
  res.json({ ok: true });
});

leadsRouter.post('/:id/unsubscribe', async (req, res) => {
  const lead = await prisma.lead.update({ where: { id: String(req.params.id), ownerId: req.user!.id }, data: { unsubscribed: true } });
  await prisma.suppression.upsert({ where: { ownerId_email: { ownerId: req.user!.id, email: lead.email } }, create: { ownerId: req.user!.id, email: lead.email }, update: {} });
  res.json({ lead });
});
