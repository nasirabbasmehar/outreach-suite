import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const templatesRouter = Router();
templatesRouter.use(requireAuth);

const schema = z.object({ name: z.string().min(1), subject: z.string().min(1), body: z.string().min(1), contentType: z.enum(['HTML', 'PLAIN_TEXT']).default('HTML') });

templatesRouter.get('/', async (req, res) => {
  const templates = await prisma.template.findMany({ where: { ownerId: req.user!.id }, orderBy: { updatedAt: 'desc' } });
  res.json({ templates });
});

templatesRouter.post('/', async (req, res) => {
  const body = schema.parse(req.body);
  const template = await prisma.template.create({ data: { ...body, ownerId: req.user!.id } });
  res.status(201).json({ template });
});

templatesRouter.patch('/:id', async (req, res) => {
  const body = schema.partial().parse(req.body);
  const template = await prisma.template.update({ where: { id: String(req.params.id), ownerId: req.user!.id }, data: body });
  res.json({ template });
});

templatesRouter.delete('/:id', async (req, res) => {
  await prisma.template.delete({ where: { id: String(req.params.id), ownerId: req.user!.id } });
  res.json({ ok: true });
});
