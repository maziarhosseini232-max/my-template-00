import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('[API Error]:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'خطای داخلی سرور رخ داد.';

  res.status(status).json({
    success: false,
    code: err.code || (status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : 'SERVER_ERROR'),
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
