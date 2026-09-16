import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { db } from '../db/index.js';

export function logAudit(action: string, entity: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Attach audit helper to response finish
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        db.auditLogs.push({
          id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          userId: req.user?.userId,
          userEmail: req.user?.email,
          action,
          entity,
          entityId: req.params.id || req.body?.id,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.get('user-agent'),
          changes: req.method !== 'GET' ? req.body : undefined,
          createdAt: new Date().toISOString()
        });
      }
    });
    next();
  };
}
