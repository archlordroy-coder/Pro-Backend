import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDB } from '../lib/firebase.js';
import { createPromotionSchema, updatePromotionSchema, paginationSchema } from '../lib/validation.js';
import { sendSuccess, sendPaginated, sendBadRequest, sendError, sendCreated, sendNotFound } from '../lib/responses.js';
import { verifyAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { mockPromotions } from '../lib/mock-data.js';
import { Promotion } from '../types/entities.js';
import { parsePaginationQuery, paginateArray } from '../utils/pagination.js';
import logger from '../lib/logger.js';
import { ApiError } from '../types/common.js';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const paginationData = paginationSchema.parse(req.query);
    const { page, limit } = parsePaginationQuery(paginationData);

    const db = getDB();
    let promotions: (Promotion & { id: string })[] = [];

    if (db) {
      const snapshot = await db.collection('promotions').where('deletedAt', '==', null).get();
      promotions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Promotion & { id: string }));
    }

    if (promotions.length === 0) {
      promotions = mockPromotions as any;
    }

    const paginatedData = paginateArray(promotions, page, limit);
    sendPaginated(res, paginatedData, page, limit, promotions.length);
  } catch (error) {
    logger.error('Error fetching promotions:', error);
    sendError(res, new ApiError(500, 'Failed to fetch promotions'), 500);
  }
}));

router.post('/', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const validatedData = createPromotionSchema.parse(req.body);
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const newPromotion: Promotion = {
      ...validatedData,
      id: `promo-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('promotions').doc(newPromotion.id).set(newPromotion);
    sendCreated(res, newPromotion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Validation failed');
    }
    logger.error('Error creating promotion:', error);
    sendError(res, new ApiError(500, 'Failed to create promotion'), 500);
  }
}));

router.put('/:id', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promoId = Array.isArray(id) ? id[0] : id;
    const validatedData = updatePromotionSchema.parse(req.body);
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const doc = await db.collection('promotions').doc(promoId).get();
    if (!doc.exists || doc.data()?.deletedAt) {
      return sendNotFound(res, 'Promotion not found');
    }

    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('promotions').doc(promoId).update(updateData);
    sendSuccess(res, { id: promoId, ...updateData }, 'Promotion updated successfully');
  } catch (error) {
    logger.error('Error updating promotion:', error);
    sendError(res, new ApiError(500, 'Failed to update promotion'), 500);
  }
}));

router.delete('/:id', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promoId = Array.isArray(id) ? id[0] : id;
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const doc = await db.collection('promotions').doc(promoId).get();
    if (!doc.exists) {
      return sendNotFound(res, 'Promotion not found');
    }

    await db.collection('promotions').doc(promoId).update({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    sendSuccess(res, { id: promoId }, 'Promotion deleted successfully');
  } catch (error) {
    logger.error('Error deleting promotion:', error);
    sendError(res, new ApiError(500, 'Failed to delete promotion'), 500);
  }
}));

export default router;
