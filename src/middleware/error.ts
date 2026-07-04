import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../types/common';
import logger from '../lib/logger';

export function errorHandler(
  err: Error | ApiError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: (err as any).errors?.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      })) || [],
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // API error
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Generic error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
}

// Async error wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
