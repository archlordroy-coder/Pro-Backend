// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Pagination types
export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

// Auth types
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Timestamp types
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
