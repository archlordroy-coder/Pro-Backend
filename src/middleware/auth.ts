import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/common';
import { sendUnauthorized } from '../lib/responses';
import logger from '../lib/logger';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'Missing or invalid authorization header');
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    if (error instanceof jwt.TokenExpiredError) {
      sendUnauthorized(res, 'Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      sendUnauthorized(res, 'Invalid token');
    } else {
      sendUnauthorized(res, 'Authentication failed');
    }
  }
}

export function verifyAdmin(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'Missing or invalid authorization header');
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    if (decoded.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Admin token verification failed:', error);
    sendUnauthorized(res, 'Authentication failed');
  }
}

export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(payload, secret, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  return jwt.verify(token, secret) as JwtPayload;
}
