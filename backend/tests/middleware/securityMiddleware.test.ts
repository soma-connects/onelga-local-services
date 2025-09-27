import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  createRateLimit,
  corsOptions,
  validateInput,
  emailValidation,
  passwordValidation,
  phoneValidation,
  nameValidation,
  sanitizeInput,
  requestLogger,
  securityHeaders,
  errorHandler,
  apiResponse,
} from '../../src/middleware/securityMiddleware';

describe('Security Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Rate Limiting', () => {
    it('should create rate limiter with default settings', async () => {
      const rateLimiter = createRateLimit();
      app.use('/api', rateLimiter);
      app.get('/api/test', (_req, res) => res.json({ success: true }));

      for (let i = 0; i < 100; i++) {
        await request(app).get('/api/test');
      }

      const response = await request(app).get('/api/test');
      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many requests');
    });

    it('should create rate limiter with custom settings', async () => {
      const rateLimiter = createRateLimit(60000, 2, 'Custom rate limit message');
      app.use('/api', rateLimiter);
      app.get('/api/test', (_req, res) => res.json({ success: true }));

      await request(app).get('/api/test');
      await request(app).get('/api/test');
      
      const response = await request(app).get('/api/test');
      expect(response.status).toBe(429);
      expect(response.body.error).toBe('Custom rate limit message');
    });

    it('should skip rate limiting for webhook endpoints', async () => {
      const rateLimiter = createRateLimit(60000, 1);
      app.use(rateLimiter);
      app.get('/webhook/test', (_req, res) => res.json({ success: true }));

      const response1 = await request(app).get('/webhook/test');
      const response2 = await request(app).get('/webhook/test');
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      app.post('/test', validateInput([emailValidation]), (_req, res) => {
        res.json({ success: true });
      });

      // Valid email
      const validResponse = await request(app)
        .post('/test')
        .send({ email: 'test@example.com' });
      expect(validResponse.status).toBe(200);

      // Invalid email
      const invalidResponse = await request(app)
        .post('/test')
        .send({ email: 'invalid-email' });
      expect(invalidResponse.status).toBe(400);
      expect(invalidResponse.body.message).toBe('Validation error');
    });

    it('should validate password strength', async () => {
      app.post('/test', validateInput([passwordValidation]), (_req, res) => {
        res.json({ success: true });
      });

      // Valid password
      const validResponse = await request(app)
        .post('/test')
        .send({ password: 'StrongPass123' });
      expect(validResponse.status).toBe(200);

      // Weak password
      const weakResponse = await request(app)
        .post('/test')
        .send({ password: 'weak' });
      expect(weakResponse.status).toBe(400);
    });

    it('should validate Nigerian phone numbers', async () => {
      app.post('/test', validateInput([phoneValidation]), (_req, res) => {
        res.json({ success: true });
      });

      // Valid Nigerian phone number
      const validResponse = await request(app)
        .post('/test')
        .send({ phoneNumber: '+2348012345678' });
      expect(validResponse.status).toBe(200);

      // No phone number (optional)
      const noPhoneResponse = await request(app)
        .post('/test')
        .send({});
      expect(noPhoneResponse.status).toBe(200);

      // Invalid phone number
      const invalidResponse = await request(app)
        .post('/test')
        .send({ phoneNumber: '1234567890' });
      expect(invalidResponse.status).toBe(400);
    });

    it('should validate name fields', async () => {
      app.post('/test', validateInput([nameValidation('firstName')]), (_req, res) => {
        res.json({ success: true });
      });

      // Valid name
      const validResponse = await request(app)
        .post('/test')
        .send({ firstName: 'John' });
      expect(validResponse.status).toBe(200);

      // Invalid name (too short)
      const shortResponse = await request(app)
        .post('/test')
        .send({ firstName: 'A' });
      expect(shortResponse.status).toBe(400);

      // Invalid name (contains numbers)
      const numberResponse = await request(app)
        .post('/test')
        .send({ firstName: 'John123' });
      expect(numberResponse.status).toBe(400);
    });

    it('should return multiple validation errors', async () => {
      app.post('/test', validateInput([
        emailValidation,
        passwordValidation,
        nameValidation('firstName')
      ]), (_req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .send({
          email: 'invalid',
          password: 'weak',
          firstName: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(3);
    });
  });

  describe('Input Sanitization', () => {
    it('should remove MongoDB injection attempts from request body', async () => {
      app.use(sanitizeInput);
      app.post('/test', (req, res) => {
        res.json({ body: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          $where: 'malicious code',
          nested: {
            $gt: 'injection',
            name: 'valid'
          }
        });

      expect(response.body.body.email).toBe('test@example.com');
      expect(response.body.body.$where).toBeUndefined();
      expect(response.body.body.nested.$gt).toBeUndefined();
      expect(response.body.body.nested.name).toBe('valid');
    });

    it('should remove script tags from string inputs', async () => {
      app.use(sanitizeInput);
      app.post('/test', (req, res) => {
        res.json({ body: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({
          content: '<script>alert("xss")</script>Hello World',
          description: 'Normal content'
        });

      expect(response.body.body.content).toBe('Hello World');
      expect(response.body.body.description).toBe('Normal content');
    });

    it('should sanitize query parameters', async () => {
      app.use(sanitizeInput);
      app.get('/test', (req, res) => {
        res.json({ query: req.query });
      });

      const response = await request(app)
        .get('/test?name=John&$where=injection&content=<script>xss</script>clean');

      expect(response.body.query.name).toBe('John');
      expect(response.body.query.$where).toBeUndefined();
      expect(response.body.query.content).toBe('clean');
    });
  });

  describe('Security Headers', () => {
    it('should add security headers', async () => {
      app.use(securityHeaders);
      app.get('/test', (_req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should add no-cache headers for auth endpoints', async () => {
      app.use(securityHeaders);
      app.get('/api/auth/profile', (_req, res) => {
        res.json({ success: true });
      });
      app.get('/api/admin/users', (_req, res) => {
        res.json({ success: true });
      });
      app.get('/api/public', (_req, res) => {
        res.json({ success: true });
      });

      const authResponse = await request(app).get('/api/auth/profile');
      const adminResponse = await request(app).get('/api/admin/users');
      const publicResponse = await request(app).get('/api/public');

      expect(authResponse.headers['cache-control']).toContain('no-store');
      expect(adminResponse.headers['cache-control']).toContain('no-store');
      expect(publicResponse.headers['cache-control']).toBeUndefined();
    });
  });

  describe('Error Handler', () => {
    it('should handle JWT errors', async () => {
      app.use((_req, _res, next) => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        next(error);
      });
      app.use(errorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });

    it('should handle token expired errors', async () => {
      app.use((_req, _res, next) => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        next(error);
      });
      app.use(errorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token expired');
    });

    it('should handle Prisma unique constraint errors', async () => {
      app.use((_req, _res, next) => {
        const error: any = new Error('Unique constraint failed');
        error.code = 'P2002';
        next(error);
      });
      app.use(errorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('A record with this value already exists');
    });

    it('should handle Prisma record not found errors', async () => {
      app.use((_req, _res, next) => {
        const error: any = new Error('Record not found');
        error.code = 'P2025';
        next(error);
      });
      app.use(errorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Record not found');
    });

    it('should handle CORS errors', async () => {
      app.use((_req, _res, next) => {
        const error = new Error('Not allowed by CORS');
        next(error);
      });
      app.use(errorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('CORS error: Origin not allowed');
    });

    it('should handle generic errors', async () => {
      app.use((_req, _res, next) => {
        const error = new Error('Generic error');
        next(error);
      });
      app.use(errorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('API Response Helper', () => {
    it('should create success responses', async () => {
      app.get('/test', (_req, res) => {
        apiResponse.success(res, { id: 1, name: 'Test' }, 'Data retrieved successfully');
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Data retrieved successfully');
      expect(response.body.data).toEqual({ id: 1, name: 'Test' });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should create error responses', async () => {
      app.get('/test', (_req, res) => {
        apiResponse.error(res, 'Something went wrong', 400, { field: 'email' });
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Something went wrong');
      expect(response.body.details).toEqual({ field: 'email' });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should create paginated responses', async () => {
      app.get('/test', (_req, res) => {
        const data = [{ id: 1 }, { id: 2 }];
        const pagination = { page: 1, limit: 10, total: 2, pages: 1 };
        apiResponse.paginated(res, data, pagination, 'Data retrieved');
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Data retrieved');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Request Logger', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log request and response', async () => {
      app.use(requestLogger);
      app.get('/test', (_req, res) => {
        res.json({ success: true });
      });

      await request(app).get('/test');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('GET /test')
      );
    });
  });
});

describe('CORS Configuration', () => {
  it('should allow requests from allowed origins', () => {
    const callback = jest.fn();
    if (typeof corsOptions.origin === 'function') {
      corsOptions.origin('http://localhost:3000', callback);
    }
    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('should reject requests from disallowed origins', () => {
    const callback = jest.fn();
    if (typeof corsOptions.origin === 'function') {
      corsOptions.origin('http://malicious-site.com', callback);
    }
    expect(callback).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should allow requests with no origin', () => {
    const callback = jest.fn();
    if (typeof corsOptions.origin === 'function') {
      corsOptions.origin(undefined as any, callback);
    }
    expect(callback).toHaveBeenCalledWith(null, true);
  });
});

// describe('File Upload Security', () => {
//   // Note: File upload tests would require mock files and more complex setup
//   // These would be integration tests in a real scenario
  
//   it('should be configured with proper file size limits', () => {
//     expect(uploadMiddleware.options.limits?.fileSize).toBe(5 * 1024 * 1024); // 5MB
//     expect(uploadMiddleware.options.limits?.files).toBe(5);
//   });
// });