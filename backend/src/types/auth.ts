import { Request } from 'express';

// User interface for authentication
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CITIZEN' | 'ADMIN' | 'STAFF';
  isVerified: boolean;
  isActive: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  profilePicture?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  permissions?: string[];
  department?: string; // For admin and staff roles
  employeeId?: string; // For admin and staff roles
}

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extended Request interface with user
export interface AuthRequest<T = any, P = any> extends Request {
  user?: User;
  body: T;
  params: P;
}

// Authentication response interface
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: Omit<User, 'password'>;
    token: string;
  };
  error?: string;
}

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Register request interface
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  role?: 'CITIZEN' | 'ADMIN' | 'STAFF';
}

// Password change request interface
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Profile update request interface
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  profilePicture?: string;
}

// Role-based access control types
export type UserRole = 'CITIZEN' | 'ADMIN' | 'STAFF';

export type Permission = 
  | 'READ_APPLICATIONS'
  | 'WRITE_APPLICATIONS'
  | 'DELETE_APPLICATIONS'
  | 'READ_USERS'
  | 'WRITE_USERS'
  | 'DELETE_USERS'
  | 'READ_ANALYTICS'
  | 'WRITE_ANALYTICS'
  | 'READ_SETTINGS'
  | 'WRITE_SETTINGS'
  | 'MANAGE_SERVICES'
  | 'MANAGE_PAYMENTS'
  | 'MANAGE_NOTIFICATIONS'
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_ROLES';

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CITIZEN: [
    'READ_APPLICATIONS',
    'WRITE_APPLICATIONS',
  ],
  STAFF: [
    'READ_APPLICATIONS',
    'WRITE_APPLICATIONS',
    'READ_USERS',
    'MANAGE_SERVICES',
    'MANAGE_PAYMENTS',
    'MANAGE_NOTIFICATIONS',
  ],
  ADMIN: [
    'READ_APPLICATIONS',
    'WRITE_APPLICATIONS',
    'DELETE_APPLICATIONS',
    'READ_USERS',
    'WRITE_USERS',
    'DELETE_USERS',
    'READ_ANALYTICS',
    'WRITE_ANALYTICS',
    'READ_SETTINGS',
    'WRITE_SETTINGS',
    'MANAGE_SERVICES',
    'MANAGE_PAYMENTS',
    'MANAGE_NOTIFICATIONS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_ROLES',
  ],
};

// Token types
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Session interface
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
}

// Authentication middleware options
export interface AuthMiddlewareOptions {
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  allowInactive?: boolean;
  requireEmailVerification?: boolean;
}

// API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error response interface
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  location?: 'body' | 'query' | 'params' | 'headers';
}

// Pagination interface
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search and filter interface
export interface SearchOptions extends PaginationOptions {
  search?: string;
  filters?: Record<string, any>;
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
}

// Export all types
export type {
  Request,
  Response,
  NextFunction,
} from 'express';