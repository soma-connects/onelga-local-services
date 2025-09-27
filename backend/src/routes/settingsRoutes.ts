import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, query } from 'express-validator';
import settingsController from '../controllers/settingsController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// User Settings Routes
router.get('/user', settingsController.getUserSettings);
router.put(
  '/user',
  [
    body('theme')
      .optional()
      .isIn(['light', 'dark', 'system'])
      .withMessage('Theme must be light, dark, or system'),
    body('language')
      .optional()
      .isLength({ min: 2, max: 5 })
      .withMessage('Language code must be 2-5 characters'),
    body('fontSize')
      .optional()
      .isIn(['small', 'medium', 'large'])
      .withMessage('Font size must be small, medium, or large'),
    body('soundEnabled')
      .optional()
      .isBoolean()
      .withMessage('Sound enabled must be a boolean'),
    body('autoSave')
      .optional()
      .isBoolean()
      .withMessage('Auto save must be a boolean'),
    body('compactMode')
      .optional()
      .isBoolean()
      .withMessage('Compact mode must be a boolean'),
  ],
  validateRequest,
  settingsController.updateUserSettings
);

// Notification Settings Routes
router.get('/notifications', settingsController.getNotificationSettings);
router.put(
  '/notifications',
  [
    body('emailNotifications')
      .optional()
      .isBoolean()
      .withMessage('Email notifications must be a boolean'),
    body('smsNotifications')
      .optional()
      .isBoolean()
      .withMessage('SMS notifications must be a boolean'),
    body('pushNotifications')
      .optional()
      .isBoolean()
      .withMessage('Push notifications must be a boolean'),
    body('applicationUpdates')
      .optional()
      .isBoolean()
      .withMessage('Application updates must be a boolean'),
    body('paymentReminders')
      .optional()
      .isBoolean()
      .withMessage('Payment reminders must be a boolean'),
    body('systemAnnouncements')
      .optional()
      .isBoolean()
      .withMessage('System announcements must be a boolean'),
    body('documentExpiry')
      .optional()
      .isBoolean()
      .withMessage('Document expiry must be a boolean'),
    body('serviceUpdates')
      .optional()
      .isBoolean()
      .withMessage('Service updates must be a boolean'),
    body('accountSecurity')
      .optional()
      .isBoolean()
      .withMessage('Account security must be a boolean'),
    body('weeklyDigest')
      .optional()
      .isBoolean()
      .withMessage('Weekly digest must be a boolean'),
    body('quietHours.enabled')
      .optional()
      .isBoolean()
      .withMessage('Quiet hours enabled must be a boolean'),
    body('quietHours.start')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Quiet hours start time must be in HH:MM format'),
    body('quietHours.end')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Quiet hours end time must be in HH:MM format'),
  ],
  validateRequest,
  settingsController.updateNotificationSettings
);

// Privacy Settings Routes
router.get('/privacy', settingsController.getPrivacySettings);
router.put(
  '/privacy',
  [
    body('profileVisibility')
      .optional()
      .isIn(['public', 'limited', 'private'])
      .withMessage('Profile visibility must be public, limited, or private'),
    body('dataSharing')
      .optional()
      .isBoolean()
      .withMessage('Data sharing must be a boolean'),
    body('analyticsOptOut')
      .optional()
      .isBoolean()
      .withMessage('Analytics opt-out must be a boolean'),
    body('locationTracking')
      .optional()
      .isBoolean()
      .withMessage('Location tracking must be a boolean'),
    body('cookiesAccepted')
      .optional()
      .isBoolean()
      .withMessage('Cookies accepted must be a boolean'),
    body('marketingEmails')
      .optional()
      .isBoolean()
      .withMessage('Marketing emails must be a boolean'),
    body('thirdPartyIntegrations')
      .optional()
      .isBoolean()
      .withMessage('Third party integrations must be a boolean'),
  ],
  validateRequest,
  settingsController.updatePrivacySettings
);

// Security Settings Routes
router.get('/security', settingsController.getSecuritySettings);
router.put(
  '/security',
  [
    body('twoFactorEnabled')
      .optional()
      .isBoolean()
      .withMessage('Two factor enabled must be a boolean'),
    body('loginNotifications')
      .optional()
      .isBoolean()
      .withMessage('Login notifications must be a boolean'),
    body('sessionTimeout')
      .optional()
      .isInt({ min: 5, max: 1440 })
      .withMessage('Session timeout must be between 5 and 1440 minutes'),
  ],
  validateRequest,
  settingsController.updateSecuritySettings
);

// Data Management Routes
router.get('/export-data', settingsController.exportUserData);
router.post(
  '/delete-account',
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required for account deletion'),
    body('reason')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Reason must be a string with maximum 500 characters'),
  ],
  validateRequest,
  settingsController.deleteAccount
);

// Storage Routes
router.get('/storage', settingsController.getStorageUsage);

// Utility Routes
router.post(
  '/test-notification',
  [
    body('type')
      .isIn(['email', 'sms', 'push'])
      .withMessage('Notification type must be email, sms, or push'),
  ],
  validateRequest,
  settingsController.testNotification
);

// Two-Factor Authentication Routes (Placeholder implementations)
router.post('/2fa/enable', (_req, res) => {
  res.json({
    success: false,
    message: 'Two-factor authentication is not yet implemented. Coming soon!',
  });
});

router.post('/2fa/disable', (_req, res) => {
  res.json({
    success: false,
    message: 'Two-factor authentication is not yet implemented. Coming soon!',
  });
});

router.post('/2fa/verify', (_req, res) => {
  res.json({
    success: false,
    message: 'Two-factor authentication is not yet implemented. Coming soon!',
  });
});

// Session Management Routes (Placeholder implementations)
router.get('/sessions', (_req, res) => {
  res.json({
    success: true,
    data: [], // Return empty array for now
  });
});

router.post('/sessions/logout-all', (_req, res) => {
  res.json({
    success: false,
    message: 'Session management is not yet implemented. Coming soon!',
  });
});

router.delete('/sessions/:deviceId', (_req, res) => {
  res.json({
    success: false,
    message: 'Session management is not yet implemented. Coming soon!',
  });
});

// Login History Route (Placeholder implementation)
router.get(
  '/login-history',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        history: [],
        total: 0,
      },
    });
  }
);

// Backup and Restore Routes (Placeholder implementations)
router.post('/backup', (_req, res) => {
  res.json({
    success: false,
    message: 'Backup functionality is not yet implemented. Coming soon!',
  });
});

router.post('/restore', (_req, res) => {
  res.json({
    success: false,
    message: 'Restore functionality is not yet implemented. Coming soon!',
  });
});

// Email Verification Routes (Placeholder implementations)
router.post('/verify-email', (_req, res) => {
  res.json({
    success: false,
    message: 'Email verification resend is not yet implemented. Coming soon!',
  });
});

router.post('/verify-email/confirm', (_req, res) => {
  res.json({
    success: false,
    message: 'Email verification confirmation is not yet implemented. Coming soon!',
  });
});

// Data Report Route (Placeholder implementation)
router.get(
  '/data-report',
  [
    query('format')
      .optional()
      .isIn(['json', 'csv', 'pdf'])
      .withMessage('Format must be json, csv, or pdf'),
  ],
  validateRequest,
  (_req: Request, res: Response) => {
    res.json({
      success: false,
      message: 'Data report generation is not yet implemented. Coming soon!',
    });
  }
);

export default router;