import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqId = (req.headers['x-request-id'] as string) || uuidv4();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      reqId,
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
    }, `HTTP ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });

  next();
};
