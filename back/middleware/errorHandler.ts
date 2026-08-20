import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[Error]', err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: err.message,
      code: err.code
    });
  }

  return res.status(500).json({
    ok: false,
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR'
  });
}
