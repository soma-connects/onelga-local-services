# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development Workflow
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint TypeScript files
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Database Commands
```bash
# Generate Prisma client after schema changes
npm run generate

# Create and apply database migration
npm run migrate

# Deploy migrations to production database
npm run migrate:deploy

# Open Prisma Studio (database GUI)
npm run studio

# Seed database with initial data
npm run seed
```

### Testing Individual Components
```bash
# Run specific test file
npm test -- tests/middleware/securityMiddleware.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="auth"

# Run tests in a specific directory
npm test tests/middleware/

# Debug tests
npm test -- --verbose --detectOpenHandles
```

## Architecture Overview

### High-Level Structure
This is a **Node.js/Express REST API** for Nigerian local government services, built with **TypeScript** and **Prisma ORM**. The architecture follows a **layered approach** with clear separation of concerns:

- **Routes Layer**: Express routes with validation and middleware
- **Controller Layer**: Business logic and request handling
- **Service Layer**: Reusable business services (limited implementation)
- **Data Layer**: Prisma ORM with SQLite database
- **Middleware Layer**: Security, authentication, and request processing

### Key Architectural Patterns

#### 1. Security-First Design
The application implements **comprehensive security middleware** (`src/middleware/securityMiddleware.ts`) with:
- **Rate limiting** (different limits per endpoint type: auth=5/15min, uploads=20/hour, payments=10/hour)
- **Input validation** using express-validator with Nigerian-specific validators
- **Input sanitization** against NoSQL injection and XSS
- **CORS configuration** with environment-specific origins
- **Security headers** via Helmet.js with CSP for payment gateways

#### 2. Multi-Service Government Portal
The system manages various **government services** through dedicated route modules:
- **Authentication & User Management** (`/api/auth`, `/api/users`)
- **Document Services** (Birth certificates, ID letters, uploads)
- **Health Services** (Appointments, health centers)
- **Business Services** (Registration, licensing)
- **Complaint Management** (Public complaints and tracking)
- **Analytics & Admin** (Staff dashboard, reporting)

#### 3. Database Design
Uses **Prisma ORM** with a **comprehensive schema** supporting:
- **User management** with role-based access (CITIZEN, ADMIN, STAFF variants)
- **Service applications** with status tracking and document attachments
- **Payment integration** with Paystack/Flutterwave
- **Audit logging** and fraud detection (failed login attempts, lockouts)
- **Notification system** with user preferences
- **Settings management** (user preferences, privacy, security)

### Critical Implementation Details

#### Database Connection (`src/lib/db.ts`)
- Uses **global instance pattern** for development to prevent connection exhaustion
- Includes **transaction helpers**, **pagination utilities**, and **soft delete patterns**
- **Health check functionality** for monitoring

#### Authentication System
- **JWT-based authentication** with configurable expiration
- **Account lockout protection** (5 failed attempts → 15min lockout)
- **Refresh token support** and **password reset tokens**
- **Rate limiting on auth endpoints** (5 requests per 15 minutes)

#### File Upload Security
- **Type validation** (images, PDFs, Office docs only)
- **Size limits** (5MB per file, 5 files max)
- **Path sanitization** and **directory traversal protection**
- **Upload rate limiting** (20 uploads per hour)

#### Error Handling Strategy
- **Centralized error handler** with environment-specific responses
- **Structured error responses** with consistent format
- **Security-conscious error messages** (no information leakage in production)
- **Comprehensive logging** with different levels

### Key Files to Understand

#### Core Infrastructure
- `src/index.ts` - Main server setup and middleware configuration
- `src/lib/db.ts` - Database connection and utilities
- `src/middleware/securityMiddleware.ts` - Comprehensive security implementation
- `prisma/schema.prisma` - Complete data model for all services

#### Authentication Flow
- `src/routes/authRoutes.ts` - Auth endpoints with validation
- `src/controllers/authController.ts` - Login/register logic with fraud protection
- `src/middleware/auth.ts` - JWT verification middleware

#### Service Architecture
- `src/routes/` - All service endpoints (12 different service types)
- `src/controllers/` - Request handling and business logic
- `src/types/auth.ts` - TypeScript definitions for auth system

### Environment Configuration

#### Required Environment Variables
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="your-secure-secret-key"
JWT_EXPIRES_IN="7d"

# Security
BCRYPT_ROUNDS="12"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Email Services
SENDGRID_API_KEY="your-sendgrid-key"

# File Uploads
UPLOAD_DIR="uploads"

# Payment Gateways
PAYSTACK_SECRET_KEY="your-paystack-key"
FLUTTERWAVE_SECRET_KEY="your-flutterwave-key"
```

### Development Guidelines

#### Security Implementation
- **All routes require validation** - Use validators from `securityMiddleware.ts`
- **Apply appropriate rate limits** - Auth endpoints get `authRateLimit`, uploads get `uploadRateLimit`
- **Use API response helpers** - Import from `securityMiddleware.ts` for consistent responses
- **Implement fraud detection** - Check existing patterns in `authController.ts`

#### Database Patterns
- **Always use Prisma transactions** for multi-model operations
- **Use the pagination helper** from `db.ts` for list endpoints
- **Implement soft deletes** where appropriate using `dbUtils.softDelete`
- **Add audit logging** for sensitive operations

#### TypeScript Issues to Be Aware Of
The codebase has **known TypeScript configuration issues** mentioned in security documentation:
- Missing `esModuleInterop` flag causing module import errors
- Authentication type issues with `AuthRequest` interface
- Some service files have missing database imports

#### Testing Strategy
- **Security middleware has comprehensive tests** in `tests/middleware/`
- **Test rate limiting behavior** for different endpoint types
- **Validate input sanitization** against NoSQL injection and XSS
- **Test file upload restrictions** and security measures

### API Documentation
- **Swagger documentation** available at `/api/docs` when running
- **Health check** endpoint at `/health`
- **API overview** at `/api` root endpoint
- All routes include **comprehensive Swagger annotations**

### Known Issues and Technical Debt
1. **TypeScript configuration needs fixing** - Enable `esModuleInterop`
2. **Service layer is incomplete** - Most business logic is in controllers
3. **Rate limiting uses in-memory store** - Should use Redis for production
4. **Limited service files** - Some services mentioned in routes don't have implementations
5. **Database migrations** - Schema includes unused fields for some services

This architecture supports **comprehensive government services** with a **security-first approach**, but requires attention to the TypeScript configuration and completion of the service layer implementation.