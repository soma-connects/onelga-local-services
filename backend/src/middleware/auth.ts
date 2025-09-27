import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { prisma } from '../lib/db';
import { AuthRequest, User, JWTPayload, UserRole, Permission, ROLE_PERMISSIONS } from '../types/auth';

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED',
      });
      return;
    }

    if (!process.env['JWT_SECRET']) {
      logger.error('JWT_SECRET is not defined');
      res.status(500).json({
        success: false,
        message: 'Server configuration error',
        code: 'JWT_SECRET_MISSING',
      });
      return;
    }

    const decoded = jwt.verify(token, process.env['JWT_SECRET']) as JWTPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isVerified: true,
        isActive: true,
        lastLogin: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED',
      });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        message: 'Account is suspended',
        code: 'ACCOUNT_SUSPENDED',
      });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    }).catch((error: unknown) => {
      logger.error('Failed to update last login:', error);
    });

    req.user = user as User;
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
    return;
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      logger.warn(`Unauthorized access attempt: User ${req.user.id} (${req.user.role}) attempted to access ${req.method} ${req.path}`);
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
};

export const requirePermission = (requiredPermissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role as UserRole] || [];
    const hasPermission = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn(`Insufficient permissions: User ${req.user.id} (${req.user.role}) attempted to access ${req.method} ${req.path}`);
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredPermissions,
        current: userPermissions,
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['ADMIN']);
export const requireAdminOrStaff = requireRole(['ADMIN', 'STAFF']);
export const requireOfficialOrAdmin = requireRole(['ADMIN', 'STAFF']);
export const requireCitizen = requireRole(['CITIZEN']);

// Permission-based middleware
export const requireApplicationManagement = requirePermission(['READ_APPLICATIONS', 'WRITE_APPLICATIONS']);
export const requireUserManagement = requirePermission(['READ_USERS', 'WRITE_USERS']);
export const requireAnalyticsAccess = requirePermission(['READ_ANALYTICS']);
export const requireSettingsAccess = requirePermission(['READ_SETTINGS', 'WRITE_SETTINGS']);

export const requireEmailVerification = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  if (!req.user.isVerified) {
    res.status(403).json({
      success: false,
      message: 'Email verification required',
      code: 'EMAIL_VERIFICATION_REQUIRED',
    });
    return;
  }

  next();
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token || !process.env['JWT_SECRET']) {
      return next();
    }

    const decoded = jwt.verify(token, process.env['JWT_SECRET']) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isVerified: true,
        isActive: true,
      },
    });

    if (user && user.isActive && user.status !== 'SUSPENDED') {
      req.user = user as User;
    }
  } catch (error: unknown) {
    logger.debug('Optional auth failed:', error);
  }

  next();
};

export const requireOwnership = (resourceUserIdField = 'userId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (req.user.role === 'ADMIN' || req.user.role === 'STAFF') {
      return next();
    }

    const paramKeys = Object.keys(req.params);
    const resourceId = paramKeys.length > 0 ? req.params[paramKeys[0]!] : undefined;

    if (!resourceId) {
      res.status(400).json({
        success: false,
        message: 'Resource ID required',
        code: 'RESOURCE_ID_REQUIRED',
      });
      return;
    }

    if (resourceUserIdField === 'userId' && resourceId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own resources',
        code: 'OWNERSHIP_REQUIRED',
      });
      return;
    }

    next();
  };
};

export const userRateLimit = (_req: AuthRequest, _res: Response, next: NextFunction): void => {
  next();
};

export const auditLog = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;

    res.send = function (body) {
      if (req.user) {
        prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            entity: req.path.split('/')[1] || 'N/A',
            entityId: req.params['id'] || req.params['applicationId'] || req.params['documentId'] || 'N/A',
            ipAddress: req.ip || 'Unknown',
            userAgent: req.get('User-Agent') || 'Unknown',
            createdAt: new Date(),
          },
        }).catch((error: unknown) => {
          logger.error('Failed to create audit log:', error);
        });
      }

      return originalSend.call(this, body);
    };

    next();
  };
};

export default {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireAdminOrStaff,
  requireCitizen,
  requireEmailVerification,
  optionalAuth,
  requireOwnership,
  userRateLimit,
  auditLog,
};
