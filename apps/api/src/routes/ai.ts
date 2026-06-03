import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { encryptSecret } from '../lib/crypto.js';
import { runAi } from '../services/ai.js';
import { HttpError } from '../middleware/error.js';

export const aiRouter = Router();
aiRouter.use(requireAuth);

aiRouter.post('/key', async (req, res) => {
  const body = z.object({ apiKey: z.string().min(20) }).parse(req.body);
  await prisma.user.update({ where: { id: req.user!.id }, data: { aiApiKeyEncrypted: encryptSecret(body.apiKey) } });
  res.json({ ok: true });
});

aiRouter.post('/generate', async (req, res) => {
  const body = z.object({
    mode: z.enum(['cold_email', 'follow_up', 'sales', 'partnership', 'subject_lines', 'personalization', 'spam_score', 'rewrite', 'ab_test']),
    offer: z.string().optional(),
    targetAudience: z.string().optional(),
    tone: z.string().optional(),
    goal: z.string().optional(),
    email: z.string().optional(),
    name: z.string().optional(),
    company: z.string().optional(),
    jobTitle: z.string().optional(),
    website: z.string().optional()
  }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { aiApiKeyEncrypted: true } });
  if (!user?.aiApiKeyEncrypted) throw new HttpError(400, 'Connect your OpenAI API key first in Settings or AI Writer');
  const output = await runAi({ ...body, apiKeyEncrypted: user.aiApiKeyEncrypted });
  res.json({ output });
});
