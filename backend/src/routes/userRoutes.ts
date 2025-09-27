import { Router, Response } from 'express';
import multer from 'multer';
import { prisma } from '../lib/db';
import { ProfileController } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { validateRequest } from '../middleware/validation';
import { logger } from '../utils/logger';
import { body, query, param } from 'express-validator';

const router = Router();

const profileController = new ProfileController();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.use(authenticateToken);
// Remove global role restriction to allow all authenticated users to access profile
// router.use(requireCitizen);
// router.use(requireEmailVerification);

router.get('/', profileController.getProfile.bind(profileController));
router.get('/stats', profileController.getStats.bind(profileController));
router.get('/documents', profileController.getDocuments.bind(profileController));

router.put(
  '/',
  [
    body('firstName').isString().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').isString().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('phoneNumber')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value) => {
        if (!value || value.trim() === '') return true;
        // Basic phone validation for Nigerian numbers
        const phoneRegex = /^(\+234|0)[7-9][0-9]{9}$/;
        return phoneRegex.test(value.replace(/\s/g, ''));
      })
      .withMessage('Invalid phone number format. Use format: +2348012345678 or 08012345678'),
    body('dateOfBirth')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value) => {
        if (!value || value.trim() === '') return true;
        const date = new Date(value);
        return !isNaN(date.getTime());
      })
      .withMessage('Invalid date format'),
    body('address')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value) => {
        if (!value || value.trim() === '') return true;
        return value.trim().length >= 10;
      })
      .withMessage('Address must be at least 10 characters'),
  ],
  validateRequest,
  profileController.updateProfile.bind(profileController)
);

router.put(
  '/change-password',
  [
    body('currentPassword').isString().withMessage('Current password is required'),
    body('newPassword').isString().isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validateRequest,
  profileController.changePassword.bind(profileController)
);

router.get(
  '/applications',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('type')
      .optional()
      .isIn([
        'IDENTIFICATION_LETTER',
        'BIRTH_CERTIFICATE',
        'HEALTH_APPOINTMENT',
        'BUSINESS_REGISTRATION',
        'VEHICLE_REGISTRATION',
        'COMPLAINT',
        'EDUCATION_APPLICATION',
        'HOUSING_APPLICATION',
      ])
      .withMessage('Invalid application type'),
    query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED']).withMessage('Invalid status'),
  ],
  validateRequest,
  profileController.getApplications.bind(profileController)
);

router.post(
  '/applications/:applicationId/documents',
  [param('applicationId').isString().withMessage('Invalid application ID format')],
  validateRequest,
  upload.single('file'),
  profileController.uploadApplicationDocument.bind(profileController)
);

router.get(
  '/applications/:applicationId/documents/:documentName',
  [
    param('applicationId').isString().withMessage('Invalid application ID format'),
    param('documentName').isString().withMessage('Invalid document name'),
  ],
  validateRequest,
  profileController.downloadApplicationDocument.bind(profileController)
);

router.delete(
  '/applications/:applicationId/documents/:documentName',
  [
    param('applicationId').isString().withMessage('Invalid application ID format'),
    param('documentName').isString().withMessage('Invalid document name'),
  ],
  validateRequest,
  profileController.deleteApplicationDocument.bind(profileController)
);

router.get(
  '/activity',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  ],
  validateRequest,
  profileController.getActivityLogs.bind(profileController)
);

router.get(
  '/notifications',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('isRead').optional().isBoolean().withMessage('isRead must be a boolean'),
    query('type')
      .optional()
      .isIn(['ACCOUNT_UPDATE', 'APPLICATION_UPDATE', 'INFO'])
      .withMessage('Invalid notification type'),
  ],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { page = '1', limit = '10', isRead, type } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const whereClause: any = { userId };
      if (isRead !== undefined) whereClause.isRead = isRead === 'true';
      if (type) whereClause.type = type;

      const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      });

      const totalCount = await prisma.notification.count({ where: whereClause });

      return res.json({
        success: true,
        data: {
          notifications,
          pagination: { page: pageNum, limit: limitNum, total: totalCount, pages: Math.ceil(totalCount / limitNum) },
        },
      });
    } catch (error) {
      logger.error('Error getting notifications:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

router.put(
  '/notifications/:notificationId/read',
  [param('notificationId').isString().withMessage('Invalid notification ID format')],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      if (!notificationId) {
        return res.status(400).json({ success: false, message: 'Notification ID is required' });
      }

      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found or access denied' });
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'NOTIFICATION_MARKED_READ',
          entity: 'Notification',
          entityId: notificationId,
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      return res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// These endpoints are now handled by ProfileController

// Profile picture upload
router.post('/picture', upload.single('profilePicture'), profileController.updateProfilePicture.bind(profileController));

export default router;
