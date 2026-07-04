// API Version
export const API_VERSION = 'v1';

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
  CONFLICT: 'Conflict',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database error',
  VALIDATION_ERROR: 'Validation error',
};

// User roles
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

// Ticket statuses
export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

// Ticket priorities
export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Computer statuses
export enum ComputerStatus {
  AVAILABLE = 'available',
  IN_USE = 'in-use',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
}
