import 'express-async-errors';
import express from 'express';
import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

// Import middleware
// import { errorHandler } from './middleware/errorHandler';
// import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import {
  corsOptions,
  helmetConfig,
  sanitizeInput,
  requestLogger,
  securityHeaders,
  apiRateLimit,
  errorHandler as securityErrorHandler
} from './middleware/securityMiddleware';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import servicesRoutes from './routes/servicesRoutes';
import serviceManagementRoutes from './routes/serviceManagementRoutes';
import identificationRoutes from './routes/identificationRoutes';
import ninVerificationRoutes from './routes/ninVerificationRoutes';
import healthRoutes from './routes/healthRoutes';
import uploadRoutes from './routes/uploadRoutes';
import documentRoutes from './routes/documentRoutes';
import enhancedServicesRoutes from './routes/enhancedServicesRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import settingsRoutes from './routes/settingsRoutes';
import newsRoutes from './routes/newsRoutes';
import birthRoutes from './routes/birthRoutes';
import systemRoutes from './routes/systemRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 5000;

// Enhanced security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(sanitizeInput);

// General middleware
app.use(compression());
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', apiRateLimit);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Onelga Local Services API is running',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', userRoutes);
app.use('/api/admin', adminRoutes);
// Service management routes (must come before static services listing)
app.use('/api/services', serviceManagementRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/identification', identificationRoutes);
app.use('/api/identification', ninVerificationRoutes);
app.use('/api/health-services', healthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/enhanced-services', enhancedServicesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/birth', birthRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Welcome endpoint
app.get('/api', (_req, res) => {
  res.json({
    message: 'Welcome to Onelga Local Services API',
    documentation: '/api/docs',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      profile: '/api/profile',
      admin: '/api/admin',
      services: '/api/services',
      identification: '/api/identification',
      health: '/api/health-services',
      upload: '/api/upload',
      documents: '/api/documents',
      'enhanced-services': '/api/enhanced-services',
      analytics: '/api/analytics',
      settings: '/api/settings',
      news: '/api/news',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(securityErrorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Onelga Local Services API server running on port ${PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api/docs`);
  logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
  
  if (process.env['NODE_ENV'] === 'development') {
    logger.info(`🔧 Development mode - CORS enabled for localhost:3000`);
  }
});

export default app;
