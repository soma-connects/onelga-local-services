import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  keyPattern?: any;
  errors?: any;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Log error
  logger.error('Error Handler:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Mongoose duplicate key error
  if (error.code === '11000') {
    statusCode = 400;
    const field = Object.keys(error.keyPattern || {})[0];
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(error.errors || {}).map((val: any) => val.message);
    message = errors.join(', ');
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Prisma errors
  if (error.code === 'P2002') {
    statusCode = 400;
    message = 'A record with this information already exists';
  }

  if (error.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // Development vs Production error response
  const errorResponse: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development
  if (process.env['NODE_ENV'] === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.error = error;
  }

  return res.status(statusCode).json(errorResponse);
};
