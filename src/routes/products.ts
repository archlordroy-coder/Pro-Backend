import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDB } from '../lib/firebase.js';
import { createProductSchema, updateProductSchema, paginationSchema } from '../lib/validation.js';
import { sendSuccess, sendPaginated, sendBadRequest, sendError, sendCreated, sendNotFound } from '../lib/responses.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { mockProducts } from '../lib/mock-data.js';
import { Product } from '../types/entities.js';
import { parsePaginationQuery, paginateArray } from '../utils/pagination.js';
import logger from '../lib/logger.js';
import { ApiError } from '../types/common.js';

const router = Router();

/**
 * @route GET /products
 * @description Get all products with pagination and filtering
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const paginationData = paginationSchema.parse(req.query);
    const { page, limit } = parsePaginationQuery(paginationData);
    const { category, search } = req.query;

    const db = getDB();
    let products: (Product & { id: string })[] = [];

    if (db) {
      let query = db.collection('products').where('deletedAt', '==', null);
      
      if (category && typeof category === 'string') {
        query = query.where('category', '==', category);
      }

      const snapshot = await query.get();
      products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product & { id: string }));
    }

    // Use mock data if empty
    if (products.length === 0) {
      products = mockProducts as any;
    }

    // Search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }

    const paginatedData = paginateArray(products, page, limit);
    sendPaginated(res, paginatedData, page, limit, products.length);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Invalid pagination parameters');
    }
    logger.error('Error fetching products:', error);
    sendError(res, new ApiError(500, 'Failed to fetch products'), 500);
  }
}));

/**
 * @route GET /products/:id
 * @description Get product by ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Array.isArray(id) ? id[0] : id;
    const db = getDB();

    let product: (Product & { id: string }) | null = null;

    if (db) {
      const doc = await db.collection('products').doc(productId).get();
      if (doc.exists && !doc.data()?.deletedAt) {
        product = { id: doc.id, ...doc.data() } as Product & { id: string };
      }
    }

    // Check mock data
    if (!product) {
      const mockProduct = mockProducts.find((p: any) => p.id === productId);
      product = mockProduct as any;
    }

    if (!product) {
      return sendNotFound(res, 'Product not found');
    }

    sendSuccess(res, product);
  } catch (error) {
    logger.error('Error fetching product:', error);
    sendError(res, new ApiError(500, 'Failed to fetch product'), 500);
  }
}));

/**
 * @route POST /products
 * @description Create a new product (admin only)
 */
router.post('/', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const newProduct: Product = {
      ...validatedData,
      id: `product-${Date.now()}`,
      priceDisplay: `${validatedData.price.toLocaleString()} FCFA`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stock: validatedData.stock || 0,
    };

    await db.collection('products').doc(newProduct.id).set(newProduct);
    sendCreated(res, newProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Validation failed');
    }
    logger.error('Error creating product:', error);
    sendError(res, new ApiError(500, 'Failed to create product'), 500);
  }
}));

/**
 * @route PUT /products/:id
 * @description Update a product (admin only)
 */
router.put('/:id', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Array.isArray(id) ? id[0] : id;
    const validatedData = updateProductSchema.parse(req.body);
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists || doc.data()?.deletedAt) {
      return sendNotFound(res, 'Product not found');
    }

    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('products').doc(productId).update(updateData);
    sendSuccess(res, { id: productId, ...updateData }, 'Product updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Validation failed');
    }
    logger.error('Error updating product:', error);
    sendError(res, new ApiError(500, 'Failed to update product'), 500);
  }
}));

/**
 * @route DELETE /products/:id
 * @description Soft delete a product (admin only)
 */
router.delete('/:id', verifyAdmin, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Array.isArray(id) ? id[0] : id;
    const db = getDB();

    if (!db) {
      return sendError(res, new ApiError(503, 'Database not available'), 503);
    }

    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists) {
      return sendNotFound(res, 'Product not found');
    }

    // Soft delete
    await db.collection('products').doc(productId).update({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    sendSuccess(res, { id: productId }, 'Product deleted successfully');
  } catch (error) {
    logger.error('Error deleting product:', error);
    sendError(res, new ApiError(500, 'Failed to delete product'), 500);
  }
}));

export default router;
