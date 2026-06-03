import { Queue } from 'bullmq';
import { env } from '../env.js';

export type EmailJob = {
  ownerId: string;
  campaignId: string;
  leadId: string;
  stepId?: string;
};

export const emailQueue = new Queue<EmailJob>('email-send', { connection: { url: env.REDIS_URL } });

export async function enqueueEmail(job: EmailJob, delayMs = 0) {
  return emailQueue.add('send-email', job, {
    delay: delayMs,
    attempts: 3,
    backoff: { type: 'exponential', delay: 30_000 },
    removeOnComplete: { age: 60 * 60 * 24 * 7 },
    removeOnFail: { age: 60 * 60 * 24 * 14 }
  });
}
