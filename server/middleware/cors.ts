import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin as string | undefined;
  const isProd = config.env === 'production';
  const allowedOrigins = config.allowedOrigins;

  let allowOrigin: string | null = null;

  if (!origin) {
    // Same-origin or non-browser request (e.g., server-to-server, curl)
    allowOrigin = '*';
  } else if (!isProd || allowedOrigins.length === 0) {
    // In development or when no strict origins are configured, allow the requesting origin
    allowOrigin = origin;
  } else {
    // In production with configured allowedOrigins
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === '*' || allowed === origin) return true;
      try {
        const allowedUrl = new URL(allowed);
        const requestUrl = new URL(origin);
        return allowedUrl.hostname === requestUrl.hostname;
      } catch {
        return false;
      }
    });

    if (isAllowed) {
      allowOrigin = origin;
    }
  }

  if (allowOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours preflight cache
  }

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    if (!allowOrigin && isProd && allowedOrigins.length > 0) {
      res.status(403).json({ error: 'CORS origin not allowed' });
      return;
    }
    res.status(204).end();
    return;
  }

  if (origin && !allowOrigin && isProd && allowedOrigins.length > 0) {
    res.status(403).json({ error: 'CORS policy: Access from this origin is restricted in production.' });
    return;
  }

  next();
}
