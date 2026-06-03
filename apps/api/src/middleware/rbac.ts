import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './error.js';

const order = { TEAM_MEMBER: 1, MANAGER: 2, ADMIN: 3 } as const;

export function requireRole(minRole: keyof typeof order) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, 'Authentication required'));
    if (order[req.user.role] < order[minRole]) return next(new HttpError(403, 'Insufficient permissions'));
    next();
  };
}
