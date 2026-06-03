import nodemailer from 'nodemailer';
import type { SmtpAccount } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { decryptSecret } from '../lib/crypto.js';
import { HttpError } from '../middleware/error.js';

export function createTransport(account: SmtpAccount) {
  return nodemailer.createTransport({
    host: account.host,
    port: account.port,
    secure: account.encryption === 'SSL' || account.port === 465,
    requireTLS: account.encryption === 'TLS' || account.encryption === 'STARTTLS',
    auth: {
      user: account.username,
      pass: decryptSecret(account.passwordEncrypted)
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 20_000,
    greetingTimeout: 15_000,
    socketTimeout: 45_000
  });
}

export async function testSmtp(account: SmtpAccount) {
  const transport = createTransport(account);
  try {
    await transport.verify();
    await prisma.smtpAccount.update({
      where: { id: account.id },
      data: { healthStatus: 'HEALTHY', lastTestedAt: new Date(), lastError: null, isPaused: false }
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SMTP verification failed';
    await prisma.smtpAccount.update({
      where: { id: account.id },
      data: { healthStatus: 'FAILED', lastTestedAt: new Date(), lastError: message, isPaused: true }
    });
    return { ok: false, error: message };
  } finally {
    transport.close();
  }
}

export async function chooseSmtp(ownerId: string, smtpGroup: string, smtpAccountIds: unknown) {
  const ids = Array.isArray(smtpAccountIds) ? smtpAccountIds.filter((id): id is string => typeof id === 'string') : [];
  const candidates = await prisma.smtpAccount.findMany({
    where: {
      ownerId,
      isPaused: false,
      healthStatus: { in: ['HEALTHY', 'WARNING'] },
      ...(ids.length ? { id: { in: ids } } : { group: smtpGroup })
    },
    orderBy: [{ sentToday: 'asc' }, { updatedAt: 'asc' }]
  });

  for (const account of candidates) {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [sentHour, sentToday] = await Promise.all([
      prisma.emailEvent.count({ where: { smtpAccountId: account.id, sentAt: { gte: hourAgo } } }),
      prisma.emailEvent.count({ where: { smtpAccountId: account.id, sentAt: { gte: startOfUtcDay() } } })
    ]);
    if (sentHour < account.hourlyLimit && sentToday < account.dailyLimit) return account;
  }
  throw new HttpError(429, 'No SMTP account available under the configured hourly/daily limits');
}

function startOfUtcDay() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
