import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/error.js';

export const trackingRouter = Router();
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=', 'base64');

function meta(req: import('express').Request) {
  const ua = new UAParser(req.headers['user-agent']).getResult();
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '').split(',')[0].trim();
  const geo = geoip.lookup(ip);
  return {
    deviceType: ua.device.type ?? 'desktop',
    operatingSystem: ua.os.name ?? 'unknown',
    country: String(req.headers['cf-ipcountry'] ?? geo?.country ?? 'unknown')
  };
}

trackingRouter.get('/open/:token.png', async (req, res) => {
  const event = await prisma.emailEvent.findUnique({ where: { trackingToken: String(req.params.token) } });
  if (event) {
    await prisma.emailEvent.update({
      where: { id: event.id },
      data: { status: event.status === 'SENT' ? 'OPENED' : event.status, openedAt: event.openedAt ?? new Date(), openCount: { increment: 1 }, ...meta(req) }
    });
  }
  res.setHeader('content-type', 'image/png');
  res.setHeader('cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.end(pixel);
});

trackingRouter.get('/click/:token', async (req, res) => {
  const url = String(req.query.url ?? '');
  if (!url) throw new HttpError(400, 'Missing url');
  const event = await prisma.emailEvent.findUnique({ where: { trackingToken: String(req.params.token) } });
  if (event) {
    const clickedLinks = Array.isArray(event.clickedLinks) ? event.clickedLinks as Prisma.JsonArray : [];
    clickedLinks.push({ url, clickedAt: new Date().toISOString(), ...meta(req) });
    await prisma.emailEvent.update({ where: { id: event.id }, data: { status: 'CLICKED', clickCount: { increment: 1 }, clickedLinks: clickedLinks as Prisma.InputJsonValue } });
  }
  res.redirect(url);
});

trackingRouter.get('/unsubscribe/:token', async (req, res) => {
  const event = await prisma.emailEvent.findUnique({ where: { trackingToken: String(req.params.token) }, include: { lead: true } });
  if (event) {
    await Promise.all([
      prisma.lead.update({ where: { id: event.leadId }, data: { unsubscribed: true } }),
      prisma.emailEvent.update({ where: { id: event.id }, data: { status: 'UNSUBSCRIBED' } }),
      prisma.suppression.upsert({ where: { ownerId_email: { ownerId: event.ownerId, email: event.lead.email } }, create: { ownerId: event.ownerId, email: event.lead.email, reason: 'unsubscribe' }, update: { reason: 'unsubscribe' } })
    ]);
  }
  res.setHeader('content-type', 'text/html');
  res.send('<main style="font-family:system-ui;max-width:560px;margin:80px auto"><h1>You are unsubscribed</h1><p>Your email address has been removed from future campaigns.</p></main>');
});

trackingRouter.post('/bounce', async (req, res) => {
  const body = req.body as { messageId?: string; token?: string; type?: 'HARD' | 'SOFT'; reason?: string };
  if (!body.token && !body.messageId) throw new HttpError(400, 'messageId or token required');
  const result = body.token
    ? await prisma.emailEvent.updateMany({ where: { trackingToken: body.token }, data: { status: 'BOUNCED', bouncedAt: new Date(), bounceType: body.type ?? 'SOFT', bounceReason: body.reason } })
    : await prisma.emailEvent.updateMany({ where: { messageId: body.messageId }, data: { status: 'BOUNCED', bouncedAt: new Date(), bounceType: body.type ?? 'SOFT', bounceReason: body.reason } });
  res.json({ ok: true, updated: result.count });
});

trackingRouter.post('/reply', async (req, res) => {
  const body = req.body as { messageId?: string; token?: string; preview?: string };
  if (!body.token && !body.messageId) throw new HttpError(400, 'messageId or token required');
  const result = body.token
    ? await prisma.emailEvent.updateMany({ where: { trackingToken: body.token }, data: { status: 'REPLIED', repliedAt: new Date(), replyPreview: body.preview?.slice(0, 500) } })
    : await prisma.emailEvent.updateMany({ where: { messageId: body.messageId }, data: { status: 'REPLIED', repliedAt: new Date(), replyPreview: body.preview?.slice(0, 500) } });
  res.json({ ok: true, updated: result.count });
});
