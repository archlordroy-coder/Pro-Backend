import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDB } from '../lib/firebase';
import { createServiceSchema, updateServiceSchema, paginationSchema } from '../lib/validation';
import { sendSuccess, sendPaginated, sendBadRequest, sendError, sendCreated, sendNotFound } from '../lib/responses';
import { verifyToken, verifyAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { mockServices } from '../lib/mock-data';
import { Service } from '../types/entities';
import { parsePaginationQuery, paginateArray } from '../utils/pagination';
import logger from '../lib/logger';
import { ApiError } from '../types/common';

const router = Router();

/**
 * @route GET /services
 * @description Get all services with pagination
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const paginationData = paginationSchema.parse(req.query);
    const { page, limit } = parsePaginationQuery(paginationData);

    const db = getDB();
    let services: (Service & { id: string })[] = [];

    if (db) {
      const snapshot = await db.collection('services').get();
      services = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Service & { id: string }));
    }

    // Use mock data if empty or no DB
    if (services.length === 0) {
      services = mockServices as any;
    }

    const paginatedData = paginateArray(services, page, limit);
    sendPaginated(res, paginatedData, page, limit, services.length);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Invalid pagination parameters');
    }
    logger.error('Error fetching services:', error);
    sendError(res, new ApiError(500, 'Failed to fetch services'), 500);
  }
}));

/**
 * @route GET /services/:id
 * @description Get service by ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const serviceId = Array.isArray(id) ? id[0] : id;
    const db = getDB();

    let service: (Service & { id: string }) | null = null;

    if (db) {
      const doc = await db.collection('services').doc(serviceId).get();
      if (doc.exists) {
        service = { id: doc.id, ...doc.data() } as Service & { id: string };
      }
    }

    // Check mock data
    if (!service) {
      const mockService = mockServices.find((s: any) => s.id === serviceId);
      service = mockService as any;
    }

    if (!service) {
      return sendNotFound(res, 'Service not found');
    }

    sendSuccess(res, service);
  } catch (error) {
    logger.error('Error fetching service:', error);
    sendError(res, new ApiError(500, 'Failed to fetch service'), 500);
  }
}));

/**
 * @route POST /services
 * @description Create a new service (admin only)
 */
router.post('/', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const validatedData = createServiceSchema.parse(req.body);
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const newService: Service = {
      ...validatedData,
      id: `service-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('services').doc(newService.id).set(newService);
    sendCreated(res, newService);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Validation failed');
    }
    logger.error('Error creating service:', error);
    sendError(res, new ApiError(500, 'Failed to create service'), 500);
  }
}));

/**
 * @route PUT /services/:id
 * @description Update a service (admin only)
 */
router.put('/:id', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const serviceId = Array.isArray(id) ? id[0] : id;
    const validatedData = updateServiceSchema.parse(req.body);
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    // Check if service exists
    const doc = await db.collection('services').doc(serviceId).get();
    if (!doc.exists) {
      return sendNotFound(res, 'Service not found');
    }

    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('services').doc(serviceId).update(updateData);
    sendSuccess(res, { id: serviceId, ...updateData }, 'Service updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Validation failed');
    }
    logger.error('Error updating service:', error);
    sendError(res, new ApiError(500, 'Failed to update service'), 500);
  }
}));

/**
 * @route DELETE /services/:id
 * @description Delete a service (admin only)
 */
router.delete('/:id', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const serviceId = Array.isArray(id) ? id[0] : id;
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    // Check if service exists
    const doc = await db.collection('services').doc(serviceId).get();
    if (!doc.exists) {
      return sendNotFound(res, 'Service not found');
    }

    await db.collection('services').doc(serviceId).delete();
    sendSuccess(res, { id: serviceId }, 'Service deleted successfully');
  } catch (error) {
    logger.error('Error deleting service:', error);
    sendError(res, new ApiError(500, 'Failed to delete service'), 500);
  }
}));

export default router;
