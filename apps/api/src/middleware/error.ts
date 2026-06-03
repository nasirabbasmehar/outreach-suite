import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : 500;
  const payload = {
    error: err.message || 'Internal server error',
    details: err instanceof HttpError ? err.details : undefined
  };
  if (status >= 500) console.error(err);
  res.status(status).json(payload);
};
