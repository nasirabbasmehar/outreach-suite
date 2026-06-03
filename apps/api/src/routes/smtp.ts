import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { prisma } from '../lib/prisma.js';
import { encryptSecret } from '../lib/crypto.js';
import { HttpError } from '../middleware/error.js';
import { testSmtp } from '../services/smtp.js';
import { parseTableByFilename } from '../utils/importers.js';

export const smtpRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

smtpRouter.use(requireAuth);

const smtpSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535),
  username: z.string().min(1),
  password: z.string().min(1),
  encryption: z.enum(['SSL', 'TLS', 'STARTTLS', 'NONE']).default('STARTTLS'),
  senderName: z.string().min(1),
  senderEmail: z.string().email(),
  dailyLimit: z.coerce.number().int().positive().default(500),
  hourlyLimit: z.coerce.number().int().positive().default(50),
  group: z.string().default('default')
});

smtpRouter.get('/', async (req, res) => {
  const accounts = await prisma.smtpAccount.findMany({ where: { ownerId: req.user!.id }, orderBy: { createdAt: 'desc' } });
  res.json({ accounts: accounts.map(({ passwordEncrypted, ...account }) => account) });
});

smtpRouter.post('/', requireRole('MANAGER'), async (req, res) => {
  const body = smtpSchema.parse(req.body);
  const account = await prisma.smtpAccount.create({
    data: { ...body, ownerId: req.user!.id, passwordEncrypted: encryptSecret(body.password) }
  });
  const { passwordEncrypted, ...safe } = account;
  res.status(201).json({ account: safe });
});

smtpRouter.post('/import', requireRole('MANAGER'), upload.single('file'), async (req, res) => {
  if (!req.file) throw new HttpError(400, 'File required');
  const rows = await parseTableByFilename(req.file.originalname, req.file.buffer);
  const results = [];
  for (const row of rows) {
    const body = smtpSchema.parse({
      host: row.host ?? row.smtpHost ?? row['SMTP Host'],
      port: row.port ?? row.Port,
      username: row.username ?? row.Username,
      password: row.password ?? row.Password,
      encryption: row.encryption ?? row.Encryption ?? 'STARTTLS',
      senderName: row.senderName ?? row['Sender Name'] ?? row.name,
      senderEmail: row.senderEmail ?? row['Sender Email'] ?? row.email,
      dailyLimit: row.dailyLimit ?? row['Daily Limit'] ?? 500,
      hourlyLimit: row.hourlyLimit ?? row['Hourly Limit'] ?? 50,
      group: row.group ?? 'default'
    });
    const account = await prisma.smtpAccount.create({ data: { ...body, ownerId: req.user!.id, passwordEncrypted: encryptSecret(body.password) } });
    results.push(account.id);
  }
  res.status(201).json({ imported: results.length, ids: results });
});

smtpRouter.patch('/:id', requireRole('MANAGER'), async (req, res) => {
  const data = { ...req.body } as Record<string, unknown>;
  if (typeof data.password === 'string' && data.password) {
    data.passwordEncrypted = encryptSecret(data.password);
    delete data.password;
  }
  const account = await prisma.smtpAccount.update({ where: { id: String(req.params.id), ownerId: req.user!.id }, data });
  const { passwordEncrypted, ...safe } = account;
  res.json({ account: safe });
});

smtpRouter.delete('/:id', requireRole('MANAGER'), async (req, res) => {
  await prisma.smtpAccount.delete({ where: { id: String(req.params.id), ownerId: req.user!.id } });
  res.json({ ok: true });
});

smtpRouter.post('/:id/test', requireRole('MANAGER'), async (req, res) => {
  const account = await prisma.smtpAccount.findFirst({ where: { id: String(req.params.id), ownerId: req.user!.id } });
  if (!account) throw new HttpError(404, 'SMTP account not found');
  res.json(await testSmtp(account));
});

smtpRouter.post('/:id/pause', requireRole('MANAGER'), async (req, res) => {
  const account = await prisma.smtpAccount.update({ where: { id: String(req.params.id), ownerId: req.user!.id }, data: { isPaused: true, healthStatus: 'PAUSED' } });
  res.json({ account });
});

smtpRouter.post('/:id/resume', requireRole('MANAGER'), async (req, res) => {
  const account = await prisma.smtpAccount.update({ where: { id: String(req.params.id), ownerId: req.user!.id }, data: { isPaused: false, healthStatus: 'HEALTHY' } });
  res.json({ account });
});
