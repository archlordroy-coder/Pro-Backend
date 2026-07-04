import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDB } from '../lib/firebase.js';
import { createReviewSchema, paginationSchema } from '../lib/validation.js';
import { sendSuccess, sendPaginated, sendBadRequest, sendError, sendCreated, sendNotFound } from '../lib/responses.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { Review } from '../types/entities.js';
import { parsePaginationQuery, paginateArray } from '../utils/pagination.js';
import logger from '../lib/logger.js';
import { ApiError } from '../types/common.js';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const paginationData = paginationSchema.parse(req.query);
    const { page, limit } = parsePaginationQuery(paginationData);
    const { productId } = req.query;

    const db = getDB();
    let reviews: (Review & { id: string })[] = [];

    if (db) {
      let query = db.collection('reviews').where('deletedAt', '==', null);
      
      if (productId && typeof productId === 'string') {
        query = query.where('productId', '==', productId);
      }

      const snapshot = await query.get();
      reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Review & { id: string }));
    }

    const paginatedData = paginateArray(reviews, page, limit);
    sendPaginated(res, paginatedData, page, limit, reviews.length);
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    sendError(res, new ApiError(500, 'Failed to fetch reviews'), 500);
  }
}));

router.post('/', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const validatedData = createReviewSchema.parse(req.body);
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    if (!req.user) {
      return sendBadRequest(res, 'User not authenticated');
    }

    const newReview: Review = {
      ...validatedData,
      id: `review-${Date.now()}`,
      userId: req.user.userId,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('reviews').doc(newReview.id).set(newReview);
    sendCreated(res, newReview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Validation failed');
    }
    logger.error('Error creating review:', error);
    sendError(res, new ApiError(500, 'Failed to create review'), 500);
  }
}));

router.delete('/:id', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviewId = Array.isArray(id) ? id[0] : id;
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    if (!req.user) {
      return sendBadRequest(res, 'User not authenticated');
    }

    const doc = await db.collection('reviews').doc(reviewId).get();
    if (!doc.exists) {
      return sendNotFound(res, 'Review not found');
    }

    const review = doc.data() as Review;
    // Only allow deletion by review owner or admin
    if (review.userId !== req.user.userId && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    await db.collection('reviews').doc(reviewId).update({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    sendSuccess(res, { id: reviewId }, 'Review deleted successfully');
  } catch (error) {
    logger.error('Error deleting review:', error);
    sendError(res, new ApiError(500, 'Failed to delete review'), 500);
  }
}));

export default router;
