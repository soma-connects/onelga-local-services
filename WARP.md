# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

The **Onelga Comprehensive Local Services Application** is a multi-platform government digitization project serving the citizens of Onelga Local Government Area. It provides a centralized platform for accessing essential local government services including identification letters, birth certificates, health services, business registrations, and more.

## Development Commands

### Root Project Commands
```bash
# Start both frontend and backend concurrently
npm run dev

# Start individual services
npm run dev:frontend    # React app at http://localhost:3000
npm run dev:backend     # Express API at http://localhost:5000

# Install all dependencies
npm run install:all

# Build all applications
npm run build

# Run all tests
npm test

# Lint all code
npm run lint

# Clean all dependencies
npm run clean
```

### Backend Commands (from backend/)
```bash
# Development
npm run dev             # Start with nodemon
npm run build          # Compile TypeScript
npm start              # Run compiled JS

# Database
npm run migrate        # Run Prisma migrations
npm run migrate:deploy # Deploy migrations (production)
npm run generate       # Generate Prisma client
npm run studio         # Open Prisma Studio
npm run seed           # Seed database with test data

# Testing & Quality
npm test               # Run Jest tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
npm run lint           # ESLint check
npm run lint:fix       # ESLint auto-fix
```

### Frontend Commands (from frontend/)
```bash
# Development
npm start              # Start React dev server
npm run build          # Production build
npm test               # Run React tests
npm run lint           # ESLint check
npm run lint:fix       # ESLint auto-fix
npm run type-check     # TypeScript check without compilation
```

### Mobile Commands (from mobile/)
```bash
# Development
flutter pub get                                              # Install dependencies
flutter run                                                  # Run debug mode
flutter run --release                                       # Run release mode
flutter packages pub run build_runner build                 # Code generation

# Testing & Quality
flutter test                                                 # Run unit tests
flutter test --coverage                                     # Run tests with coverage
flutter analyze                                             # Lint check
dart fix --apply                                            # Auto-fix issues

# Build
flutter build apk --release                                 # Android APK
flutter build appbundle --release                          # Android Bundle
flutter build ios --release                                # iOS build
```

### Docker Commands
```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up postgres redis          # Database services only
docker-compose up --build                 # Rebuild and start
docker-compose down                        # Stop all services

# Database management
docker-compose exec postgres psql -U onelga_user -d onelga_services
docker-compose exec redis redis-cli

# PgAdmin (database GUI)
# Access at http://localhost:8080 (admin@onelga.gov.ng / admin123)
```

### Single Test Examples
```bash
# Backend single test
cd backend && npm test -- --testNamePattern="Auth Controller"
cd backend && npm test src/controllers/authController.test.ts

# Frontend single test  
cd frontend && npm test -- --testNamePattern="Login Component"
cd frontend && npm test src/components/LoginForm.test.tsx

# Mobile single test
cd mobile && flutter test test/models/user_test.dart
```

## Architecture Overview

### Multi-Platform Architecture
This is a **monorepo** containing three connected applications:
- **Frontend**: React.js TypeScript web application
- **Backend**: Node.js Express.js API server  
- **Mobile**: Flutter cross-platform mobile app

### Backend Architecture Pattern
The backend follows a **layered architecture** with clear separation of concerns:

```
Controllers → Routes → Middleware → Services → Database (Prisma ORM)
```

Key architectural decisions:
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Documentation**: Swagger/OpenAPI auto-generated docs at `/api/docs`
- **Validation**: Joi schemas for request validation
- **Logging**: Winston logger with structured logging
- **Rate Limiting**: Express rate limiter to prevent abuse

### Frontend Architecture Pattern
The frontend uses a **component-based architecture** with Redux Toolkit for state management:

```
Components → Pages → Services (API) → Store (Redux) → UI Updates
```

Key architectural decisions:
- **State Management**: Redux Toolkit with React-Redux
- **Routing**: React Router v6 with protected routes
- **UI Library**: Material-UI (MUI) components
- **Form Handling**: React Hook Form with Yup validation
- **Data Fetching**: React Query for server state management
- **Notifications**: React Hot Toast for user feedback

### Database Schema Architecture
The Prisma schema defines a **comprehensive government services data model** with these core entities:

1. **User Management**: Users with role-based access (CITIZEN, ADMIN, STAFF variants)
2. **Service Applications**: Each government service has dedicated tables:
   - `IdentificationLetter`, `BirthCertificate`, `HealthAppointment`
   - `BusinessRegistration`, `VehicleRegistration`, `Complaint`
   - `EducationApplication`, `HousingApplication`
3. **Supporting Entities**: `HealthCenter`, `Notification`, `AuditLog`
4. **Status Tracking**: Standardized enums for application statuses and workflow states

All entities follow consistent patterns:
- CUID primary keys for security
- Timestamps (`createdAt`, `updatedAt`)
- User relationships via foreign keys
- Document arrays for file attachments
- Status enums for workflow management

### Mobile Architecture Pattern
The mobile app follows **Flutter's recommended patterns**:

```
Screens → Widgets → Providers (State) → Services (API) → Models
```

Key architectural decisions:
- **State Management**: Provider pattern for state management
- **Navigation**: Flutter's navigation 2.0
- **Storage**: Secure storage for JWT tokens
- **Code Generation**: JSON serialization and API client generation

### Cross-Platform Integration
All three platforms share:
- **API Contracts**: Consistent REST API endpoints
- **Authentication Flow**: JWT token-based auth across web and mobile
- **Data Models**: Shared TypeScript/Dart models that mirror Prisma schema
- **Environment Configuration**: Development/production environment handling

### Development Environment
The project supports **containerized development** with Docker Compose providing:
- PostgreSQL database with initialization scripts
- Redis for session management and caching  
- PgAdmin for database management GUI
- Hot-reload for both frontend and backend during development

### Key Configuration Files
- `backend/tsconfig.json`: Path mapping with `@/` aliases for clean imports
- `backend/.env.example`: Comprehensive environment variables template
- `docker-compose.yml`: Multi-service development environment
- `prisma/schema.prisma`: Single source of truth for database structure

### API Structure
The API follows RESTful conventions with these main endpoint groups:
- `/api/auth` - Authentication (login, register, password reset)
- `/api/users` - User management and profiles  
- `/api/services` - General service listings
- `/api/identification` - ID letter applications
- `/api/health-services` - Health appointments and centers

Each endpoint group has full CRUD operations where appropriate, with proper HTTP status codes and error handling.

## Project-Specific Patterns

### File Organization
- Use **barrel exports** (index.ts files) in major directories
- Backend uses **path mapping** (`@/controllers`, `@/middleware`, etc.) 
- Frontend follows **feature-based folder structure** under `/pages`
- All configuration files use **TypeScript** for type safety

### State Management Patterns
- Backend: Use Prisma transactions for multi-table operations
- Frontend: Redux Toolkit slices for feature-based state organization
- Mobile: Provider pattern with proper separation of UI and business logic

### Error Handling
- Backend: Express async error middleware catches all async route errors
- Frontend: React Error Boundaries with user-friendly error messages
- All platforms: Structured error responses with consistent format

### Environment Handling
- Development: Uses Docker Compose for local services
- Environment files are **never committed** (use .env.example templates)
- Mobile app has separate config files for dev/prod API URLs

### Testing Strategy
- Backend: Jest unit tests focusing on controllers and services
- Frontend: React Testing Library for component testing
- Mobile: Widget tests and unit tests for business logic
- Integration tests in dedicated `/tests` directory

### Security Considerations
- JWT tokens with appropriate expiration times
- Password hashing with bcrypt (12 rounds)
- Rate limiting on API endpoints
- CORS properly configured for frontend domains
- Input validation on all user inputs
- Audit logging for sensitive operations

### Government Service Workflow
Applications follow a standardized workflow:
1. **PENDING** → Initial submission
2. **UNDER_REVIEW** → Staff review process  
3. **APPROVED/REJECTED** → Decision made
4. **COMPLETED** → Service delivered (if approved)

Each service type may have additional workflow steps specific to government requirements.
