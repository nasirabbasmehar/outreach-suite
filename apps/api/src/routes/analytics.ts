import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

function pct(part: number, total: number) {
  return total ? Math.round((part / total) * 10_000) / 100 : 0;
}

analyticsRouter.get('/overview', async (req, res) => {
  const campaignId = req.query.campaignId ? String(req.query.campaignId) : undefined;
  const smtpAccountId = req.query.smtpAccountId ? String(req.query.smtpAccountId) : undefined;
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;
  const where = { ownerId: req.user!.id, ...(campaignId ? { campaignId } : {}), ...(smtpAccountId ? { smtpAccountId } : {}), ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) };
  const [total, sent, opened, clicked, replied, bounced, unsubscribed, failed] = await Promise.all([
    prisma.emailEvent.count({ where }),
    prisma.emailEvent.count({ where: { ...where, status: { in: ['SENT', 'OPENED', 'CLICKED', 'REPLIED'] } } }),
    prisma.emailEvent.count({ where: { ...where, openCount: { gt: 0 } } }),
    prisma.emailEvent.count({ where: { ...where, clickCount: { gt: 0 } } }),
    prisma.emailEvent.count({ where: { ...where, status: 'REPLIED' } }),
    prisma.emailEvent.count({ where: { ...where, status: 'BOUNCED' } }),
    prisma.emailEvent.count({ where: { ...where, status: 'UNSUBSCRIBED' } }),
    prisma.emailEvent.count({ where: { ...where, status: 'FAILED' } })
  ]);
  res.json({
    totals: { total, sent, opened, clicked, replied, bounced, unsubscribed, failed },
    rates: { deliveryRate: pct(sent, total), openRate: pct(opened, sent), clickRate: pct(clicked, sent), replyRate: pct(replied, sent), bounceRate: pct(bounced, total) }
  });
});

analyticsRouter.get('/smtp-performance', async (req, res) => {
  const accounts = await prisma.smtpAccount.findMany({ where: { ownerId: req.user!.id }, select: { id: true, host: true, senderEmail: true, healthStatus: true, isPaused: true, sentToday: true } });
  const rows = await Promise.all(accounts.map(async (a) => {
    const [sent, bounces, replies] = await Promise.all([
      prisma.emailEvent.count({ where: { smtpAccountId: a.id, status: { in: ['SENT', 'OPENED', 'CLICKED', 'REPLIED'] } } }),
      prisma.emailEvent.count({ where: { smtpAccountId: a.id, status: 'BOUNCED' } }),
      prisma.emailEvent.count({ where: { smtpAccountId: a.id, status: 'REPLIED' } })
    ]);
    return { ...a, sent, bounces, replies, bounceRate: pct(bounces, sent + bounces), replyRate: pct(replies, sent) };
  }));
  res.json({ accounts: rows });
});

analyticsRouter.get('/export.csv', async (req, res) => {
  const events = await prisma.emailEvent.findMany({ where: { ownerId: req.user!.id }, include: { lead: true, campaign: true, smtpAccount: true }, orderBy: { createdAt: 'desc' }, take: 10_000 });
  const header = ['campaign', 'lead_email', 'smtp', 'status', 'sentAt', 'openCount', 'clickCount', 'repliedAt', 'bounceType'].join(',');
  const lines = events.map((e) => [e.campaign.name, e.lead.email, e.smtpAccount?.senderEmail ?? '', e.status, e.sentAt?.toISOString() ?? '', e.openCount, e.clickCount, e.repliedAt?.toISOString() ?? '', e.bounceType ?? ''].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','));
  res.setHeader('content-type', 'text/csv');
  res.setHeader('content-disposition', 'attachment; filename="outreach-report.csv"');
  res.send([header, ...lines].join('\n'));
});
