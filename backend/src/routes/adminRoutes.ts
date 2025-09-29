import { Router, Request, Response } from 'express';
import adminController from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Apply authentication and admin role requirement to all admin routes
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// Dashboard Statistics
router.get('/dashboard/stats', adminController.getDashboardStats.bind(adminController));

// Admin: Get all applications
router.get('/applications', async (req, res) => {
  try {
    // Only admins can access (middleware already applied)
  const { page = 1, limit = 20, status, priority, serviceType, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where: Record<string, any> = {};
  if (status) (where as any).status = status;
  if (priority) (where as any).priority = priority;
  if (serviceType) (where as any).type = serviceType;

  // Add search by applicant name or email
  if (search) {
    where.user = {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [applications, total] = await Promise.all([
    req.app.locals['prisma'].application.findMany({
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      where,
    }),
    req.app.locals['prisma'].application.count({ where }),
  ]);

  res.json({
    success: true,
    data: { applications, total, page: Number(page), limit: Number(limit) },
  });
  } catch (error: unknown) {
    let errorMessage = 'Unknown error';
    if (typeof error === 'object' && error && 'message' in error) {
      errorMessage = (error as any).message;
    }
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: errorMessage });
  }
});

// User Management Routes
router.get('/users', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().trim(),
    query('role').optional().isIn(['CITIZEN', 'ADMIN', 'OFFICIAL']).withMessage('Invalid role'),
    query('status').optional().isIn(['ACTIVE', 'SUSPENDED', 'PENDING']).withMessage('Invalid status'),
    query('sortBy').optional().isIn(['createdAt', 'firstName', 'lastName', 'email', 'lastLogin']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
  ],
  validateRequest,
  adminController.getUsers.bind(adminController)
);

router.get('/users/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID format')
  ],
  validateRequest,
  adminController.getUserDetails.bind(adminController)
);

router.put('/users/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID format'),
    body('firstName').optional().isString().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').optional().isString().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('phoneNumber').optional().isMobilePhone('any').withMessage('Invalid phone number'),
    body('role').optional().isIn(['CITIZEN', 'ADMIN', 'OFFICIAL']).withMessage('Invalid role'),
    body('status').optional().isIn(['ACTIVE', 'SUSPENDED', 'PENDING']).withMessage('Invalid status'),
    body('department').optional().isString().trim(),
    body('employeeId').optional().isString().trim(),
    body('isVerified').optional().isBoolean()
  ],
  validateRequest,
  adminController.updateUser.bind(adminController)
);

router.delete('/users/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID format')
  ],
  validateRequest,
  adminController.deleteUser.bind(adminController)
);

// User Actions
router.post('/users/:userId/suspend',
  [
    param('userId').isUUID().withMessage('Invalid user ID format'),
    body('reason').isString().trim().isLength({ min: 10 }).withMessage('Suspension reason must be at least 10 characters'),
    body('duration').optional().isString().trim()
  ],
  validateRequest,
  adminController.suspendUser.bind(adminController)
);

router.post('/users/:userId/reactivate',
  [
    param('userId').isUUID().withMessage('Invalid user ID format'),
    body('reason').optional().isString().trim()
  ],
  validateRequest,
  adminController.reactivateUser.bind(adminController)
);

// Communication Routes
router.post('/users/:userId/message',
  [
    param('userId').isUUID().withMessage('Invalid user ID format'),
    body('subject').isString().trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
    body('message').isString().trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    body('type').optional().isIn(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).withMessage('Invalid message type')
  ],
  validateRequest,
  adminController.sendMessage.bind(adminController)
);

router.post('/notifications/bulk',
  [
    body('title').isString().trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
    body('message').isString().trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    body('type').optional().isIn(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).withMessage('Invalid notification type'),
    body('recipients').optional().isIn(['ALL', 'CITIZENS', 'ADMINS', 'OFFICIALS', 'ACTIVE']).withMessage('Invalid recipient group'),
    body('channels').optional().isArray().custom((channels) => {
      const validChannels = ['EMAIL', 'IN_APP', 'SMS'];
      return channels.every((channel: string) => validChannels.includes(channel));
    }).withMessage('Invalid notification channels')
  ],
  validateRequest,
  adminController.sendBulkNotification.bind(adminController)
);

// Audit and Monitoring Routes
router.get('/audit-logs',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('userId').optional().isUUID().withMessage('Invalid user ID format'),
    query('action').optional().isString().trim(),
    query('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid severity level'),
    query('category').optional().isIn(['USER_MANAGEMENT', 'SYSTEM', 'SECURITY', 'COMMUNICATION', 'REPORTING', 'DATA_ACCESS']).withMessage('Invalid category'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format')
  ],
  validateRequest,
  adminController.getAuditLogs.bind(adminController)
);

// Reporting Routes
router.post('/reports/generate',
  [
    body('reportType').isIn(['USER_ACTIVITY', 'SERVICE_USAGE', 'SYSTEM_PERFORMANCE', 'COMPLIANCE']).withMessage('Invalid report type'),
    body('startDate').isISO8601().withMessage('Invalid start date format'),
    body('endDate').isISO8601().withMessage('Invalid end date format'),
    body('filters').optional().isObject().withMessage('Filters must be an object')
  ],
  validateRequest,
  adminController.generateReport.bind(adminController)
);

// Service Request Management (additional admin oversight)
router.get('/service-requests',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED']).withMessage('Invalid status'),
    query('serviceType').optional().isString().trim(),
    query('assignedTo').optional().isUUID().withMessage('Invalid assignee ID format'),
    query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority level')
  ],
  validateRequest,
  async (_req: Request, res: Response) => {
    // This would integrate with a service request controller
    // For now, return a placeholder response
    res.status(501).json({
      success: false,
      message: 'Service request management endpoint not fully implemented'
    });
  }
);

// System Settings and Configuration
router.get('/system/settings', async (_req: Request, res: Response) => {
  // Placeholder for system settings management
  res.status(501).json({
    success: false,
    message: 'System settings endpoint not implemented'
  });
});

router.put('/system/settings', 
  [
    body('maintenanceMode').optional().isBoolean(),
    body('registrationEnabled').optional().isBoolean(),
    body('emailNotifications').optional().isBoolean(),
    body('smsNotifications').optional().isBoolean(),
    body('maxFileUploadSize').optional().isInt({ min: 1 }),
    body('sessionTimeout').optional().isInt({ min: 1 })
  ],
  validateRequest,
  async (_req: Request, res: Response) => {
    // Placeholder for system settings update
    res.status(501).json({
      success: false,
      message: 'System settings update endpoint not implemented'
    });
  }
);

// Backup and Data Management
router.post('/data/backup', async (_req: Request, res: Response) => {
  // Placeholder for data backup
  res.status(501).json({
    success: false,
    message: 'Data backup endpoint not implemented'
  });
});

router.get('/data/export',
  [
    query('dataType').isIn(['USERS', 'SERVICE_REQUESTS', 'AUDIT_LOGS', 'ALL']).withMessage('Invalid data type'),
    query('format').optional().isIn(['JSON', 'CSV', 'XML']).withMessage('Invalid export format'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format')
  ],
  validateRequest,
  async (_req: Request, res: Response) => {
    // Placeholder for data export
    res.status(501).json({
      success: false,
      message: 'Data export endpoint not implemented'
    });
  }
);

export default router;
