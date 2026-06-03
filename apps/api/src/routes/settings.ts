import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { prisma } from '../lib/prisma.js';
import { encryptSecret } from '../lib/crypto.js';

export const settingsRouter = Router();
settingsRouter.use(requireAuth);

settingsRouter.get('/', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true, aiApiKeyEncrypted: true } });
  res.json({ user: user ? { ...user, aiApiKeyEncrypted: undefined, hasOpenAiKey: Boolean(user.aiApiKeyEncrypted) } : null });
});

settingsRouter.patch('/profile', async (req, res) => {
  const body = z.object({ name: z.string().min(1).optional() }).parse(req.body);
  const user = await prisma.user.update({ where: { id: req.user!.id }, data: body, select: { id: true, email: true, name: true, role: true } });
  res.json({ user });
});

settingsRouter.post('/openai-key', async (req, res) => {
  const body = z.object({ apiKey: z.string().min(20) }).parse(req.body);
  await prisma.user.update({ where: { id: req.user!.id }, data: { aiApiKeyEncrypted: encryptSecret(body.apiKey) } });
  res.json({ ok: true });
});

settingsRouter.post('/2fa/enable', async (req, res) => {
  // Production: generate TOTP secret/QR with otplib or equivalent and require verification.
  const secret = `dev-${crypto.randomUUID()}`;
  await prisma.user.update({ where: { id: req.user!.id }, data: { twoFactorEnabled: true, twoFactorSecret: secret } });
  res.json({ ok: true, secret });
});

settingsRouter.post('/team/invite', requireRole('ADMIN'), async (req, res) => {
  const body = z.object({ email: z.string().email(), name: z.string().optional(), role: z.enum(['MANAGER', 'TEAM_MEMBER']) }).parse(req.body);
  // Minimal team bootstrap: creates a locked placeholder user to be claimed via password reset in production.
  const user = await prisma.user.create({ data: { email: body.email.toLowerCase(), name: body.name, role: body.role, passwordHash: await bcrypt.hash(crypto.randomUUID(), 12) }, select: { id: true, email: true, role: true } });
  res.status(201).json({ user });
});
