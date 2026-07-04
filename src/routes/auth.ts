import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getDB } from '../lib/firebase';
import { loginSchema, registerSchema, refreshTokenSchema } from '../lib/validation';
import { sendSuccess, sendBadRequest, sendError, sendCreated } from '../lib/responses';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  verifyToken 
} from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { mockUsers } from '../lib/mock-data';
import { User } from '../types/entities';
import logger from '../lib/logger';
import { ApiError } from '../types/common';

const router = Router();

/**
 * @route POST /auth/register
 * @description Register a new user
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name } = validatedData;

    const db = getDB();

    // Check if user already exists
    if (db) {
      const existingUser = await db.collection('users').where('email', '==', email).get();
      if (!existingUser.empty) {
        return sendBadRequest(res, 'User with this email already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database if available
    if (db) {
      await db.collection('users').doc(newUser.id).set(newUser);
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    sendCreated(res, {
      user: userWithoutPassword,
      message: 'User registered successfully',
    }, 'User registered successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Validation failed');
    }
    logger.error('Registration error:', error);
    sendError(res, new ApiError(500, 'Registration failed'), 500);
  }
}));

/**
 * @route POST /auth/login
 * @description Login user
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const db = getDB();
    let user: (User & { id: string }) | null = null;

    // Try to find user in database
    if (db) {
      const userSnapshot = await db.collection('users').where('email', '==', email).get();
      if (!userSnapshot.empty) {
        const doc = userSnapshot.docs[0];
        user = { id: doc.id, ...doc.data() } as User & { id: string };
      }
    }

    // In mock mode, check mock data
    if (!user && !db) {
      const mockUser = mockUsers.find(u => u.email === email);
      if (mockUser) {
        user = mockUser;
      }
    }

    if (!user) {
      return sendBadRequest(res, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendBadRequest(res, 'Invalid email or password');
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Update lastLogin
    if (db) {
      await db.collection('users').doc(user.id).update({
        lastLogin: new Date().toISOString(),
      });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
      },
    }, 'Login successful');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendBadRequest(res, 'Validation failed');
    }
    logger.error('Login error:', error);
    sendError(res, new ApiError(500, 'Login failed'), 500);
  }
}));

/**
 * @route POST /auth/refresh
 * @description Refresh access token
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);
    const { refreshToken } = validatedData;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    sendSuccess(res, {
      accessToken,
    }, 'Token refreshed successfully');
  } catch (error) {
    logger.error('Token refresh error:', error);
    sendError(res, new ApiError(401, 'Invalid refresh token'), 401);
  }
}));

/**
 * @route GET /auth/me
 * @description Get current user info
 */
router.get('/me', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendBadRequest(res, 'User not authenticated');
    }

    const db = getDB();
    let user: User | null = null;

    // Try to get from database
    if (db) {
      const userDoc = await db.collection('users').doc(req.user.userId).get();
      if (userDoc.exists) {
        user = userDoc.data() as User;
      }
    }

    if (!user) {
      return sendBadRequest(res, 'User not found');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    sendSuccess(res, userWithoutPassword);
  } catch (error) {
    logger.error('Get user error:', error);
    sendError(res, new ApiError(500, 'Failed to fetch user'), 500);
  }
}));

export default router;
