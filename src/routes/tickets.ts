import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDB } from '../lib/firebase.js';
import { createTicketSchema, updateTicketSchema, paginationSchema } from '../lib/validation.js';
import { sendSuccess, sendPaginated, sendBadRequest, sendError, sendCreated, sendNotFound } from '../lib/responses.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { CyberTicket } from '../types/entities.js';
import { parsePaginationQuery, paginateArray } from '../utils/pagination.js';
import logger from '../lib/logger.js';
import { ApiError } from '../types/common.js';

const router = Router();

router.get('/', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const paginationData = paginationSchema.parse(req.query);
    const { page, limit } = parsePaginationQuery(paginationData);

    const db = getDB();
    let tickets: (CyberTicket & { id: string })[] = [];

    if (db) {
      let query = db.collection('cyber_tickets').where('deletedAt', '==', null);
      
      // Non-admin users only see their own tickets
      if (req.user?.role !== 'admin') {
        query = query.where('userId', '==', req.user?.userId || '');
      }

      const snapshot = await query.get();
      tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as CyberTicket & { id: string }));
    }

    const paginatedData = paginateArray(tickets, page, limit);
    sendPaginated(res, paginatedData, page, limit, tickets.length);
  } catch (error) {
    logger.error('Error fetching tickets:', error);
    sendError(res, new ApiError(500, 'Failed to fetch tickets'), 500);
  }
}));

router.post('/', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const validatedData = createTicketSchema.parse(req.body);
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    if (!req.user) {
      return sendBadRequest(res, 'User not authenticated');
    }

    const newTicket: CyberTicket = {
      ...validatedData,
      id: `ticket-${Date.now()}`,
      userId: req.user.userId,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('cyber_tickets').doc(newTicket.id).set(newTicket);
    sendCreated(res, newTicket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Validation failed');
    }
    logger.error('Error creating ticket:', error);
    sendError(res, new ApiError(500, 'Failed to create ticket'), 500);
  }
}));

router.put('/:id', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticketId = Array.isArray(id) ? id[0] : id;
    const validatedData = updateTicketSchema.parse(req.body);
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const doc = await db.collection('cyber_tickets').doc(ticketId).get();
    if (!doc.exists || doc.data()?.deletedAt) {
      return sendNotFound(res, 'Ticket not found');
    }

    const ticket = doc.data() as CyberTicket;
    // Only admin or ticket owner can update
    if (ticket.userId !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('cyber_tickets').doc(ticketId).update(updateData);
    sendSuccess(res, { id: ticketId, ...updateData }, 'Ticket updated successfully');
  } catch (error) {
    logger.error('Error updating ticket:', error);
    sendError(res, new ApiError(500, 'Failed to update ticket'), 500);
  }
}));

export default router;
