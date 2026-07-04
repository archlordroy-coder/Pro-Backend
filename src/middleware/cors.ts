import cors, { CorsOptions } from 'cors';
import logger from '../lib/logger';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

// Default allowed origins if none provided in env
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8000',
  'https://proinformatique.dev',
  'https://api.proinformatique.dev'
];

const finalAllowedOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman, mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (finalAllowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      logger.warn(`CORS rejection for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600, // 10 minutes
};

export function corsMiddleware() {
  return cors(corsOptions);
}
