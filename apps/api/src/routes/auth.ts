import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signJwt, requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';

export const authRouter = Router();

const authSchema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().optional() });

authRouter.post('/register', async (req, res) => {
  const body = authSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (exists) throw new HttpError(409, 'Email already registered');
  const user = await prisma.user.create({
    data: { email: body.email.toLowerCase(), name: body.name, passwordHash: await bcrypt.hash(body.password, 12), role: 'ADMIN' },
    select: { id: true, email: true, role: true, name: true }
  });
  const token = signJwt(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.status(201).json({ user, token });
});

authRouter.post('/login', async (req, res) => {
  const body = authSchema.omit({ name: true }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) throw new HttpError(401, 'Invalid credentials');
  const payload = { id: user.id, email: user.email, role: user.role };
  const token = signJwt(payload);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ user: payload, token, requires2fa: user.twoFactorEnabled });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true } });
  res.json({ user });
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});
