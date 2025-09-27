# Security Features Documentation

This document outlines the security features implemented in the Onelga Local Services API to protect against common web vulnerabilities and ensure data integrity.

## Overview

The API implements multiple layers of security including:

- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Input Validation**: Server-side validation using express-validator
- **Input Sanitization**: Protection against NoSQL injection and XSS
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Security Headers**: HTTP security headers via Helmet.js
- **File Upload Security**: Secure file handling with type validation
- **Error Handling**: Consistent error responses without information leakage
- **Request Logging**: Comprehensive request/response logging

## Rate Limiting

### Configuration

The API uses different rate limits for different endpoints:

| Endpoint Type | Window | Max Requests | Description |
|---------------|--------|--------------|-------------|
| Authentication | 15 minutes | 5 | Login/password changes |
| API General | 15 minutes | 100 | General API endpoints |
| File Upload | 1 hour | 20 | File upload operations |
| Payment | 1 hour | 10 | Payment processing |

### Implementation

```typescript
import { authRateLimit, apiRateLimit, uploadRateLimit, paymentRateLimit } from '../middleware/securityMiddleware';

// Apply to routes
router.use('/auth', authRateLimit);
router.use('/upload', uploadRateLimit);
router.use('/payment', paymentRateLimit);
```

### Rate Limit Headers

When rate limits are approached or exceeded, the API returns these headers:

- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests in current window
- `RateLimit-Reset`: When the rate limit window resets

### Error Response

```json
{
  "error": "Too many requests from this IP, please try again later.",
  "status": 429,
  "retryAfter": 900
}
```

## Input Validation

### Available Validators

#### Email Validation
```typescript
emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');
```

#### Password Validation
```typescript
passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');
```

#### Nigerian Phone Number Validation
```typescript
phoneValidation = body('phoneNumber')
  .optional()
  .isMobilePhone('en-NG')
  .withMessage('Please provide a valid Nigerian phone number');
```

#### Name Validation
```typescript
nameValidation = (field: string) =>
  body(field)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${field} must be between 2 and 50 characters`)
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(`${field} can only contain letters, spaces, hyphens, and apostrophes`);
```

### Usage Example

```typescript
router.post('/register', 
  validateInput([
    emailValidation,
    passwordValidation,
    nameValidation('firstName'),
    nameValidation('lastName'),
    phoneValidation
  ]),
  register
);
```

### Validation Error Response

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "type": "field",
      "msg": "Please provide a valid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```

## Input Sanitization

### NoSQL Injection Prevention

The sanitization middleware removes dangerous MongoDB operators:

```typescript
// Before sanitization
{
  "email": "user@example.com",
  "$where": "malicious code",
  "nested": {
    "$gt": "injection"
  }
}

// After sanitization
{
  "email": "user@example.com",
  "nested": {}
}
```

### XSS Protection

Basic XSS protection removes script tags:

```typescript
// Before: "<script>alert('xss')</script>Hello"
// After: "Hello"
```

### Implementation

The sanitization runs automatically on all requests through the `sanitizeInput` middleware and processes:

- Request body (`req.body`)
- Query parameters (`req.query`)
- Route parameters (`req.params`)

## CORS Configuration

### Allowed Origins

| Environment | Allowed Origins |
|-------------|-----------------|
| Development | `http://localhost:3000`, `http://localhost:3001` |
| Production | `https://onelga-services.vercel.app` |

### Configuration

```typescript
export const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'https://onelga-services.vercel.app',
    ];

    if (!origin) return callback(null, true); // Allow no origin (mobile apps)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-paystack-signature', 'verif-hash'],
};
```

## Security Headers

### Applied Headers

The API applies these security headers to all responses:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Enable XSS filtering |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Enforce HTTPS |

### Content Security Policy

```typescript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    scriptSrc: ["'self'", 'https://js.paystack.co', 'https://checkout.flutterwave.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: [
      "'self'",
      'https://api.paystack.co',
      'https://api.flutterwave.com',
      'https://fcm.googleapis.com',
      'https://api.sendgrid.com',
    ],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ['https://js.paystack.co', 'https://checkout.flutterwave.com'],
  },
}
```

### Sensitive Endpoints

Auth and admin endpoints receive additional cache control headers:

```
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
Pragma: no-cache
Expires: 0
```

## File Upload Security

### File Type Restrictions

Only these file types are allowed:

| Type | Extensions | MIME Types |
|------|------------|------------|
| Images | `.jpg`, `.jpeg`, `.png`, `.gif` | `image/jpeg`, `image/png`, `image/gif` |
| Documents | `.pdf`, `.doc`, `.docx` | `application/pdf`, `application/msword`, etc. |
| Spreadsheets | `.xls`, `.xlsx` | `application/vnd.ms-excel`, etc. |

### File Size Limits

- **Maximum file size**: 5MB per file
- **Maximum files**: 5 files per request
- **Total request size**: 10MB

### Storage Security

- Files are stored outside the web root
- Unique filenames prevent conflicts and enumeration
- Directory traversal protection
- User-based directory isolation

### Upload Endpoint

```
POST /api/upload/{service}
Content-Type: multipart/form-data
Authorization: Bearer {token}

Rate Limit: 20 uploads per hour
```

### File Access

Files are served through a controlled endpoint with:

- Path validation
- Directory traversal protection
- Proper Content-Type headers
- Security headers

## Error Handling

### Error Types

The error handler manages these error types:

| Error Type | Status | Message |
|------------|--------|---------|
| JWT Invalid | 401 | "Invalid token" |
| JWT Expired | 401 | "Token expired" |
| Prisma P2002 | 400 | "A record with this value already exists" |
| Prisma P2025 | 404 | "Record not found" |
| CORS Error | 403 | "CORS error: Origin not allowed" |
| Multer File Size | 400 | "File size too large. Maximum size is 5MB." |
| Multer File Count | 400 | "Too many files. Maximum is 5 files." |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "details": {}, // Optional additional details
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Production vs Development

- **Production**: Generic error messages to prevent information leakage
- **Development**: Detailed error messages for debugging

## Request Logging

### Log Format

```
[2024-01-15T10:30:00.000Z] POST /api/auth/login - IP: 192.168.1.100 - UA: Mozilla/5.0...
[2024-01-15T10:30:00.150Z] POST /api/auth/login - 200 - 150ms
```

### Logged Information

- HTTP method and URL
- Client IP address
- User agent
- Response status code
- Response time
- Error details (for 4xx/5xx responses)

## API Response Helpers

### Success Response

```typescript
apiResponse.success(res, data, message, statusCode)
```

Example:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {...},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response

```typescript
apiResponse.error(res, message, statusCode, details)
```

### Paginated Response

```typescript
apiResponse.paginated(res, data, pagination, message)
```

Example:
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Environment Variables

### Required Security Configuration

```env
# CORS
FRONTEND_URL=https://onelga-services.vercel.app

# File Upload
UPLOAD_DIR=uploads

# Environment
NODE_ENV=production
```

## Best Practices

### For Developers

1. **Always use validation middleware** for user inputs
2. **Apply appropriate rate limiting** based on endpoint sensitivity
3. **Use API response helpers** for consistent responses
4. **Log security events** for monitoring
5. **Test error handling** thoroughly
6. **Keep dependencies updated** for security patches

### For Deployment

1. **Set proper environment variables**
2. **Configure reverse proxy** (nginx) with additional security
3. **Enable HTTPS** with proper certificates
4. **Monitor rate limiting** and adjust as needed
5. **Regular security audits** of uploaded files
6. **Backup and rotation** of log files

## Security Monitoring

### Key Metrics to Monitor

- Rate limiting violations
- Failed authentication attempts
- File upload attempts and failures
- CORS violations
- Error rates by endpoint

### Recommended Tools

- **Application logs**: Winston logger with structured logging
- **Error tracking**: Sentry or similar service
- **Security monitoring**: OWASP ZAP for vulnerability scanning
- **Rate limiting**: Redis for distributed rate limiting in production

## Security Headers Testing

Use these tools to verify security headers:

- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [OWASP ZAP](https://www.zaproxy.org/)

## Compliance

This implementation helps achieve compliance with:

- **OWASP Top 10** security risks
- **GDPR** data protection requirements
- **PCI DSS** for payment processing
- **WCAG 2.1** accessibility guidelines (frontend)
- **Nigerian Data Protection Regulation (NDPR)**
