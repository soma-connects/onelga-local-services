import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { logger } from '../utils/logger';

// Main validation middleware that processes express-validator results
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : error.type,
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
      location: error.type === 'field' ? error.location : undefined
    }));

    logger.info(`Validation failed for ${req.method} ${req.path}:`, formattedErrors);

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors
    });
    return;
  }

  next();
};

// Sanitize request data middleware
export const sanitizeRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Remove any fields that start with '$' (MongoDB injection prevention)
  const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof key === 'string' && !key.startsWith('$') && !key.includes('..')) {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  };

  // Sanitize body, query, and params
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// File upload validation middleware
export const validateFileUpload = (
  allowedTypes: string[] = ['image/*', 'application/pdf'],
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const files = req.files as Express.Multer.File[] | Express.Multer.File | undefined;
    
    if (!files) {
      return next();
    }

    const fileArray = Array.isArray(files) ? files : [files];
    
    for (const file of fileArray) {
      // Check file size
      if (file.size > maxSizeBytes) {
        res.status(400).json({
          success: false,
          message: `File ${file.originalname} exceeds maximum size of ${maxSizeBytes / (1024 * 1024)}MB`,
          code: 'FILE_TOO_LARGE'
        });
        return;
      }

      // Check file type
      const fileTypeMatch = allowedTypes.some(allowedType => {
        if (allowedType.endsWith('/*')) {
          const typePrefix = allowedType.slice(0, -2);
          return file.mimetype.startsWith(typePrefix);
        }
        return file.mimetype === allowedType;
      });

      if (!fileTypeMatch) {
        res.status(400).json({
          success: false,
          message: `File ${file.originalname} type ${file.mimetype} is not allowed`,
          code: 'INVALID_FILE_TYPE',
          allowedTypes
        });
        return;
      }
    }

    next();
  };
};

// Custom validation result handler with enhanced error formatting
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const groupedErrors: { [key: string]: string[] } = {};
    const errorList = errors.array();

    // Group errors by field
    errorList.forEach((error: ValidationError) => {
      const field = error.type === 'field' ? error.path : 'general';
      if (!groupedErrors[field]) {
        groupedErrors[field] = [];
      }
      groupedErrors[field].push(error.msg);
    });

    logger.warn(`Validation errors for ${req.method} ${req.path}:`, groupedErrors);

    res.status(400).json({
      success: false,
      message: 'Request validation failed',
      code: 'VALIDATION_FAILED',
      errors: groupedErrors,
      details: errorList.map((error: ValidationError) => ({
        type: error.type,
        message: error.msg,
        field: error.type === 'field' ? error.path : undefined,
        value: error.type === 'field' ? error.value : undefined,
        location: error.type === 'field' ? error.location : undefined
      }))
    });
    return;
  }

  next();
};

// Pagination validation helper
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { page = '1', limit = '10' } = req.query;
  
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    res.status(400).json({
      success: false,
      message: 'Page must be a positive integer',
      code: 'INVALID_PAGE'
    });
    return;
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100',
      code: 'INVALID_LIMIT'
    });
    return;
  }

  // Attach validated pagination to request
  req.query['page'] = pageNum.toString();
  req.query['limit'] = limitNum.toString();

  next();
};

// Request body size validation
export const validateRequestSize = (maxSizeBytes: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get('content-length');
    
    if (contentLength && parseInt(contentLength, 10) > maxSizeBytes) {
      res.status(413).json({
        success: false,
        message: `Request body too large. Maximum size: ${maxSizeBytes / 1024}KB`,
        code: 'REQUEST_TOO_LARGE'
      });
      return;
    }

    next();
  };
};

// UUID validation helper
export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const paramValue = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!paramValue || !uuidRegex.test(paramValue)) {
      res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
        code: 'INVALID_UUID'
      });
      return;
    }

    next();
  };
};

// Date range validation
export const validateDateRange = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format',
        code: 'INVALID_DATE_FORMAT'
      });
      return;
    }

    if (start > end) {
      res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date',
        code: 'INVALID_DATE_RANGE'
      });
      return;
    }

    // Add 30 days maximum range limit (optional)
    const maxRangeDays = 30;
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > maxRangeDays) {
      res.status(400).json({
        success: false,
        message: `Date range cannot exceed ${maxRangeDays} days`,
        code: 'DATE_RANGE_TOO_LARGE'
      });
      return;
    }
  }

  next();
};

// Alias for V2 compatibility
export const validate = validateRequest;

export default {
  validateRequest,
  validate,
  sanitizeRequest,
  validateFileUpload,
  handleValidationErrors,
  validatePagination,
  validateRequestSize,
  validateUUID,
  validateDateRange
};
