import { Router, Request, Response } from 'express';
import { sendSuccess } from '../lib/responses';
import { getDB } from '../lib/firebase';
import logger from '../lib/logger';

const router = Router();

/**
 * @route GET /health
 * @description Health check endpoint
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDB();
    sendSuccess(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: db ? 'connected' : 'disconnected (mock mode)',
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      success: false,
      error: 'Service unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route GET /health/db
 * @description Database health check
 */
router.get('/db', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    
    if (!db) {
      return sendSuccess(res, { status: 'disconnected', mode: 'mock' });
    }

    // Try a simple read operation
    const testDoc = await db.collection('_health').doc('check').get();
    sendSuccess(res, { 
      status: 'connected', 
      lastCheck: new Date().toISOString() 
    });
  } catch (error) {
    logger.error('Database health check error:', error);
    res.status(503).json({
      success: false,
      error: 'Database unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
