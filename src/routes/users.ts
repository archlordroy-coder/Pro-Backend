import { Router, Request, Response } from 'express';
import { getDB } from '../lib/firebase.js';
import { sendSuccess, sendPaginated, sendError, sendNotFound } from '../lib/responses.js';
import { verifyAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { User } from '../types/entities.js';
import { parsePaginationQuery, paginateArray } from '../utils/pagination.js';
import { paginationSchema } from '../lib/validation.js';
import logger from '../lib/logger.js';
import { ApiError } from '../types/common.js';
import { z } from 'zod';

const router = Router();

/**
 * @route GET /users
 * @description Get all users (admin only)
 */
router.get('/', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const paginationData = paginationSchema.parse(req.query);
    const { page, limit } = parsePaginationQuery(paginationData);

    const db = getDB();
    let users: (User & { id: string })[] = [];

    if (db) {
      const snapshot = await db.collection('users').where('deletedAt', '==', null).get();
      users = snapshot.docs.map(doc => {
        const user = doc.data() as User;
        const { password, id: _id, ...userWithoutPassword } = user as any;
        return { id: doc.id, ...userWithoutPassword } as any;
      });
    }

    const paginatedData = paginateArray(users, page, limit);
    sendPaginated(res, paginatedData, page, limit, users.length);
  } catch (error) {
    logger.error('Error fetching users:', error);
    sendError(res, new ApiError(500, 'Failed to fetch users'), 500);
  }
}));

/**
 * @route GET /users/:id
 * @description Get user by ID (admin only)
 */
router.get('/:id', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists || doc.data()?.deletedAt) {
      return sendNotFound(res, 'User not found');
    }

    const user = doc.data() as User;
    const { password, id: _id, ...userWithoutPassword } = user as any;
    sendSuccess(res, { id: userId, ...userWithoutPassword });
  } catch (error) {
    logger.error('Error fetching user:', error);
    sendError(res, new ApiError(500, 'Failed to fetch user'), 500);
  }
}));

/**
 * @route PUT /users/:id/role
 * @description Update user role (admin only)
 */
router.put('/:id/role', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;
    const { role } = req.body;

    if (!['user', 'admin', 'moderator'].includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Invalid role',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const db = getDB();
    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      return sendNotFound(res, 'User not found');
    }

    await db.collection('users').doc(userId).update({
      role,
      updatedAt: new Date().toISOString(),
    });

    sendSuccess(res, { id: userId, role }, 'User role updated successfully');
  } catch (error) {
    logger.error('Error updating user role:', error);
    sendError(res, new ApiError(500, 'Failed to update user role'), 500);
  }
}));

/**
 * @route PUT /users/:id/deactivate
 * @description Deactivate user account (admin only)
 */
router.put('/:id/deactivate', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      return sendNotFound(res, 'User not found');
    }

    await db.collection('users').doc(userId).update({
      isActive: false,
      updatedAt: new Date().toISOString(),
    });

    sendSuccess(res, { id: userId }, 'User deactivated successfully');
  } catch (error) {
    logger.error('Error deactivating user:', error);
    sendError(res, new ApiError(500, 'Failed to deactivate user'), 500);
  }
}));

/**
 * @route DELETE /users/:id
 * @description Soft delete user (admin only)
 */
router.delete('/:id', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      return sendNotFound(res, 'User not found');
    }

    await db.collection('users').doc(userId).update({
      deletedAt: new Date().toISOString(),
      isActive: false,
      updatedAt: new Date().toISOString(),
    });

    sendSuccess(res, { id: userId }, 'User deleted successfully');
  } catch (error) {
    logger.error('Error deleting user:', error);
    sendError(res, new ApiError(500, 'Failed to delete user'), 500);
  }
}));

export default router;
