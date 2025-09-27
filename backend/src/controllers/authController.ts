import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { prisma } from '../lib/db';
import { sendWelcomeEmail, sendVerificationEmail } from '../utils/emailService';
import { validateRegistration, validateLogin } from '../utils/validation';
import { AuthRequest, JWTPayload } from '../types/auth';

// --- Constants for Fraud Detection ---
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// Define allowed expiresIn values as a type
type ExpiresInValue = '1s' | '5s' | '10s' | '30s' | '1m' | '5m' | '10m' | '30m' | '1h' | '2h' | '6h' | '12h' | '1d' | '7d' | '30d';

// Generate JWT token
const generateToken = (userId: string): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    logger.error('JWT_SECRET is not defined');
    throw new Error('JWT_SECRET is not defined');
  }

  const validExpiresInFormats: ExpiresInValue[] = ['1s', '5s', '10s', '30s', '1m', '5m', '10m', '30m', '1h', '2h', '6h', '12h', '1d', '7d', '30d'];
  const expiresInInput = process.env['JWT_EXPIRES_IN'] || '7d';

  if (!validExpiresInFormats.includes(expiresInInput as ExpiresInValue)) {
    logger.error(`Invalid JWT_EXPIPIRES_IN format: ${expiresInInput}. Must be one of: ${validExpiresInFormats.join(', ')}`);
    throw new Error('Invalid JWT_EXPIRES_IN format');
  }

  const expiresIn: ExpiresInValue = expiresInInput as ExpiresInValue;

  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign({ userId }, secret as Secret, options);
};

// Register new user
export const register = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { error } = validateRegistration(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail: any) => detail.message),
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      address,
      role = 'CITIZEN'
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        role: role.toUpperCase(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        role: true,
        isVerified: true,
        isActive: true,
        status: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);

    try {
      await sendWelcomeEmail(user.email, user.firstName);
      await sendVerificationEmail(user.email, user.firstName, token);
    } catch (emailError) {
      logger.warn('Failed to send welcome email:', emailError);
    }

    logger.info(`New user registered: ${user.email}`);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          ...user,
          role: user.role.toLowerCase(),
          status: user.status || 'active'
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

// Login user
export const login = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.details.map((detail: any) => detail.message) });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      logger.warn(`Locked account login attempt: ${user.email}`);
      return res.status(429).json({ success: false, message: `Account is locked due to too many failed login attempts. Please try again later.` });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
      let updateData: any = { failedLoginAttempts: newFailedAttempts };

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        logger.warn(`Account locked for user: ${user.email}`);
        const lockoutUntil = new Date();
        lockoutUntil.setMinutes(lockoutUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
        updateData = { ...updateData, lockoutUntil };
      }

      await prisma.user.update({ where: { id: user.id }, data: updateData });

      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // If login is successful, reset failed attempts and lockout
    if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockoutUntil: null, lastLogin: new Date() },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    }

    const token = generateToken(user.id);

    logger.info(`User logged in: ${user.email}`);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          role: user.role.toLowerCase(),
          isVerified: user.isVerified,
          status: user.status || 'active',
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// Get current user profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: { user } });
  } catch (error) {
    logger.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { firstName, lastName, phoneNumber, dateOfBirth, address } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        role: true,
        isVerified: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return res.json({ success: true, message: 'Profile updated successfully', data: { user: updatedUser } });
  } catch (error) {
    logger.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword },
    });

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

// Verify email token
export const verifyEmail = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { token } = req.params;
    const secret = process.env['JWT_SECRET'];

    if (!token || !secret) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    const decoded = jwt.verify(token, secret as Secret) as JWTPayload;

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { isVerified: true },
    });

    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error:', error);
    return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
  }
};

// Logout (mainly for clearing tokens on frontend)
export const logout = (_req: AuthRequest, res: Response): Response => {
  return res.json({
    success: true,
    message: 'Logout successful',
  });
};