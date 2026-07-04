import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random()}`;

  // Log incoming request
  logger.info(`[${requestId}] ${req.method} ${req.path}`, {
    query: req.query,
    body: req.body && req.body.password ? { ...req.body, password: '***' } : req.body,
  });

  // Capture response
  const originalSend = res.send;
  let statusCode = res.statusCode;

  res.send = function (data) {
    statusCode = res.statusCode;
    const duration = Date.now() - start;

    logger.info(`[${requestId}] Response: ${statusCode} (${duration}ms)`, {
      method: req.method,
      path: req.path,
      statusCode,
      duration,
    });

    return originalSend.call(this, data);
  };

  res.on('finish', () => {
    if (!res.headersSent) {
      const duration = Date.now() - start;
      logger.info(`[${requestId}] Finished: ${res.statusCode} (${duration}ms)`);
    }
  });

  next();
}
