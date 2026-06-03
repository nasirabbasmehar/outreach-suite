import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { prisma } from '../lib/prisma.js';
import { HttpError } from './error.js';

export type AuthUser = { id: string; email: string; role: 'ADMIN' | 'MANAGER' | 'TEAM_MEMBER' };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signJwt(user: AuthUser) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: '7d' });
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
    if (!token) throw new HttpError(401, 'Authentication required');
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, email: true, role: true } });
    if (!user) throw new HttpError(401, 'Invalid session');
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, 'Invalid or expired token'));
  }
}
