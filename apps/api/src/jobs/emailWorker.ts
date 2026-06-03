import { Worker } from 'bullmq';
import { env } from '../env.js';
import { prisma } from '../lib/prisma.js';
import { randomToken } from '../lib/crypto.js';
import { chooseSmtp, createTransport } from '../services/smtp.js';
import { renderMailMerge } from '../utils/mailMerge.js';

function injectTracking(htmlOrText: string, token: string, isHtml: boolean) {
  const base = env.API_BASE_URL;
  if (!isHtml) return `${htmlOrText}\n\n--\nUnsubscribe: ${base}/t/unsubscribe/${token}`;
  const withLinks = htmlOrText.replace(/href=["']([^"']+)["']/gi, (_m, url) => {
    if (String(url).startsWith(`${base}/t/`)) return `href="${url}"`;
    return `href="${base}/t/click/${token}?url=${encodeURIComponent(url)}"`;
  });
  return `${withLinks}<img src="${base}/t/open/${token}.png" width="1" height="1" alt="" style="display:none" /><p style="font-size:12px;color:#64748b">Don't want these emails? <a href="${base}/t/unsubscribe/${token}">Unsubscribe</a>.</p>`;
}

export const emailWorker = new Worker('email-send', async (job) => {
  const { ownerId, campaignId, leadId, stepId } = job.data;
  const [campaign, lead] = await Promise.all([
    prisma.campaign.findFirst({ where: { id: campaignId, ownerId }, include: { steps: true } }),
    prisma.lead.findFirst({ where: { id: leadId, ownerId } })
  ]);
  if (!campaign || !lead || lead.unsubscribed) return;

  const suppressed = await prisma.suppression.findUnique({ where: { ownerId_email: { ownerId, email: lead.email } } });
  if (suppressed) return;

  const step = stepId ? campaign.steps.find((s) => s.id === stepId) : undefined;
  if (step) {
    const history = await prisma.emailEvent.findMany({ where: { campaignId, leadId } });
    const hasReply = history.some((e) => e.status === 'REPLIED' || e.repliedAt);
    const hasOpen = history.some((e) => e.openCount > 0);
    const hasClick = history.some((e) => e.clickCount > 0);
    if (step.condition === 'NOT_REPLIED' && hasReply) return;
    if (step.condition === 'NOT_OPENED' && (hasOpen || hasReply)) return;
    if (step.condition === 'OPENED_NO_REPLY' && (!hasOpen || hasReply)) return;
    if (step.condition === 'CLICKED_NO_REPLY' && (!hasClick || hasReply)) return;
  }

  const subjectTemplate = step?.subject ?? campaign.subject;
  const bodyTemplate = step?.body ?? campaign.body;
  const contentType = step?.contentType ?? campaign.contentType;

  const subject = renderMailMerge(subjectTemplate, lead);
  const token = randomToken();
  const event = await prisma.emailEvent.create({
    data: { ownerId, campaignId, leadId, status: 'QUEUED', trackingToken: token, subject }
  });

  try {
    const smtp = await chooseSmtp(ownerId, campaign.smtpGroup, campaign.smtpAccountIds);
    const transport = createTransport(smtp);
    const rawBody = renderMailMerge(bodyTemplate, lead);
    const tracked = injectTracking(rawBody, token, contentType === 'HTML');
    const message = await transport.sendMail({
      from: `"${smtp.senderName}" <${smtp.senderEmail}>`,
      to: lead.email,
      subject,
      html: contentType === 'HTML' ? tracked : undefined,
      text: contentType === 'PLAIN_TEXT' ? tracked : undefined,
      headers: {
        'List-Unsubscribe': `<${env.API_BASE_URL}/t/unsubscribe/${token}>`,
        'X-Campaign-ID': campaign.id
      }
    });
    transport.close();
    await Promise.all([
      prisma.emailEvent.update({ where: { id: event.id }, data: { status: 'SENT', sentAt: new Date(), smtpAccountId: smtp.id, messageId: message.messageId } }),
      prisma.smtpAccount.update({ where: { id: smtp.id }, data: { sentToday: { increment: 1 } } })
    ]);
  } catch (error) {
    await prisma.emailEvent.update({
      where: { id: event.id },
      data: { status: 'FAILED', bounceReason: error instanceof Error ? error.message : 'Send failed' }
    });
    throw error;
  }
}, { connection: { url: env.REDIS_URL }, concurrency: 10 });

emailWorker.on('failed', (_job, err) => console.error('Email job failed:', err));
emailWorker.on('completed', (job) => console.log(`Email job ${job.id} completed`));

if (import.meta.url === `file://${process.argv[1]}`) console.log('Email worker running');
