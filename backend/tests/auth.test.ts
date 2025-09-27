import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { prisma } from '../src/lib/db';
import * as authController from '../src/controllers/authController';
import bcrypt from 'bcryptjs';

// Mock the email service to prevent sending actual emails during tests
jest.mock('../src/utils/emailService', () => ({
  sendWelcomeEmail: jest.fn(),
  sendVerificationEmail: jest.fn(),
}));

const app = express();
app.use(express.json());
app.post('/api/auth/login', authController.login);

const TEST_USER = {
  email: 'test-lockout@example.com',
  password: 'SecurePassword123!',
  firstName: 'Test',
  lastName: 'User',
};

describe('Auth Controller - Login Fraud Detection', () => {

  beforeEach(async () => {
    // Clean up before each test
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
    // Create a test user
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 12);
    await prisma.user.create({
      data: {
        ...TEST_USER,
        password: hashedPassword,
      },
    });
  });

  afterEach(async () => {
    // Clean up the database after each test
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
    jest.useRealTimers(); // Restore real timers
  });

  it('should allow a user to log in with correct credentials and reset attempts', async () => {
    // First, create a failed attempt
    await prisma.user.update({ where: { email: TEST_USER.email }, data: { failedLoginAttempts: 2 } });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const dbUser = await prisma.user.findUnique({ where: { email: TEST_USER.email } });
    expect(dbUser?.failedLoginAttempts).toBe(0);
    expect(dbUser?.lockoutUntil).toBeNull();
  });

  it('should increment failed login attempts on incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'wrong-password' });

    expect(response.status).toBe(401);

    const dbUser = await prisma.user.findUnique({ where: { email: TEST_USER.email } });
    expect(dbUser?.failedLoginAttempts).toBe(1);
  });

  it('should lock the account after 5 failed login attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: 'wrong-password' });
    }

    const dbUser = await prisma.user.findUnique({ where: { email: TEST_USER.email } });
    expect(dbUser?.failedLoginAttempts).toBe(5);
    expect(dbUser?.lockoutUntil).not.toBeNull();

    // Check that lockoutUntil is in the future
    const now = new Date();
    expect(dbUser?.lockoutUntil).toBeInstanceOf(Date);
    if (dbUser?.lockoutUntil) {
        expect(dbUser.lockoutUntil.getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it('should prevent login from a locked account', async () => {
    // Lock the account
    const lockoutTime = new Date();
    lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
    await prisma.user.update({
      where: { email: TEST_USER.email },
      data: { failedLoginAttempts: 5, lockoutUntil: lockoutTime },
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(response.status).toBe(429);
    expect(response.body.message).toContain('Account is locked');
  });

  it('should allow login after the lockout period has expired', async () => {
    jest.useFakeTimers();

    // Lock the account
    const lockoutTime = new Date();
    lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
    await prisma.user.update({
      where: { email: TEST_USER.email },
      data: { failedLoginAttempts: 5, lockoutUntil: lockoutTime },
    });

    // Advance time by 16 minutes
    jest.advanceTimersByTime(16 * 60 * 1000);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const dbUser = await prisma.user.findUnique({ where: { email: TEST_USER.email } });
    expect(dbUser?.failedLoginAttempts).toBe(0);
    expect(dbUser?.lockoutUntil).toBeNull();

    jest.useRealTimers();
  });

});