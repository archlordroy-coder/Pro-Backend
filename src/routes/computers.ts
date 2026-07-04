import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDB } from '../lib/firebase.js';
import { createComputerSchema, updateComputerSchema, paginationSchema } from '../lib/validation.js';
import { sendSuccess, sendPaginated, sendBadRequest, sendError, sendCreated, sendNotFound } from '../lib/responses.js';
import { verifyAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { Computer } from '../types/entities.js';
import { parsePaginationQuery, paginateArray } from '../utils/pagination.js';
import logger from '../lib/logger.js';
import { ApiError } from '../types/common.js';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const paginationData = paginationSchema.parse(req.query);
    const { page, limit } = parsePaginationQuery(paginationData);
    const { status } = req.query;

    const db = getDB();
    let computers: (Computer & { id: string })[] = [];

    if (db) {
      let query = db.collection('computers').where('deletedAt', '==', null);
      
      if (status && typeof status === 'string') {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.get();
      computers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Computer & { id: string }));
    }

    const paginatedData = paginateArray(computers, page, limit);
    sendPaginated(res, paginatedData, page, limit, computers.length);
  } catch (error) {
    logger.error('Error fetching computers:', error);
    sendError(res, new ApiError(500, 'Failed to fetch computers'), 500);
  }
}));

router.post('/', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const validatedData = createComputerSchema.parse(req.body);
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const newComputer: Computer = {
      ...validatedData,
      id: `computer-${Date.now()}`,
      status: validatedData.status || 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('computers').doc(newComputer.id).set(newComputer);
    sendCreated(res, newComputer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Validation failed');
    }
    logger.error('Error creating computer:', error);
    sendError(res, new ApiError(500, 'Failed to create computer'), 500);
  }
}));

router.put('/:id', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const computerId = Array.isArray(id) ? id[0] : id;
    const validatedData = updateComputerSchema.parse(req.body);
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const doc = await db.collection('computers').doc(computerId).get();
    if (!doc.exists || doc.data()?.deletedAt) {
      return sendNotFound(res, 'Computer not found');
    }

    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('computers').doc(computerId).update(updateData);
    sendSuccess(res, { id: computerId, ...updateData }, 'Computer updated successfully');
  } catch (error) {
    logger.error('Error updating computer:', error);
    sendError(res, new ApiError(500, 'Failed to update computer'), 500);
  }
}));

router.delete('/:id', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const computerId = Array.isArray(id) ? id[0] : id;
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const doc = await db.collection('computers').doc(computerId).get();
    if (!doc.exists) {
      return sendNotFound(res, 'Computer not found');
    }

    await db.collection('computers').doc(computerId).update({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    sendSuccess(res, { id: computerId }, 'Computer deleted successfully');
  } catch (error) {
    logger.error('Error deleting computer:', error);
    sendError(res, new ApiError(500, 'Failed to delete computer'), 500);
  }
}));

export default router;
