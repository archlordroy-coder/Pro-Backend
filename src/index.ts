import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { initializeFirebase } from './lib/firebase.js';
import { corsMiddleware } from './middleware/cors.js';
import { requestLogger } from './middleware/logging.js';
import { errorHandler } from './middleware/error.js';
import { swaggerSpec } from './lib/swagger.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import servicesRoutes from './routes/services.js';
import productsRoutes from './routes/products.js';
import promotionsRoutes from './routes/promotions.js';
import reviewsRoutes from './routes/reviews.js';
import ticketsRoutes from './routes/tickets.js';
import computersRoutes from './routes/computers.js';
import usersRoutes from './routes/users.js';
import { sendSuccess } from './lib/responses.js';
import logger from './lib/logger.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const app = express();

// Handle OPTIONS requests FIRST for CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,X-Requested-With,Accept');
  res.header('Access-Control-Max-Age', '600');
  res.sendStatus(200);
});

// Initialize Firebase
initializeFirebase().catch(err => {
  logger.error('Failed to initialize Firebase:', err);
});

// Middleware
app.use(corsMiddleware()); // CORS protection
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers with CORS support
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL encoded body parser

// Logging
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Root endpoint
app.get('/', (req, res) => {
  sendSuccess(res, {
    message: 'Pro Informatique API',
    version: '1.0.0',
    status: 'running',
  });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: '/swagger.json',
  },
}));
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health routes
app.use('/health', healthRoutes);

// API routes (v1)
app.use('/v1/auth', authRoutes);
app.use('/v1/services', servicesRoutes);
app.use('/v1/products', productsRoutes);
app.use('/v1/promotions', promotionsRoutes);
app.use('/v1/reviews', reviewsRoutes);
app.use('/v1/cyber-tickets', ticketsRoutes);
app.use('/v1/computers', computersRoutes);
app.use('/v1/users', usersRoutes);

// Compatibility aliases (without v1)
app.use('/services', servicesRoutes);
app.use('/products', productsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Pro Informatique API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
