import { Response } from 'express';
import { ApiResponse, PaginatedResponse, ApiError } from '../types/common';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Success',
  statusCode: number = 200
): Response {
  const pages = Math.ceil(total / limit);
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
    },
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  error: ApiError | Error | string,
  statusCode: number = 500
): Response {
  if (error instanceof ApiError) {
    const response: ApiResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    return res.status(error.statusCode).json(response);
  }

  const message = error instanceof Error ? error.message : String(error);
  const response: ApiResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): Response {
  return sendError(res, new ApiError(404, message), 404);
}

export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
): Response {
  return sendError(res, new ApiError(401, message), 401);
}

export function sendBadRequest(
  res: Response,
  message: string = 'Bad request'
): Response {
  return sendError(res, new ApiError(400, message), 400);
}

export function sendForbidden(
  res: Response,
  message: string = 'Forbidden'
): Response {
  return sendError(res, new ApiError(403, message), 403);
}
