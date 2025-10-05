import { Router } from 'express';
import { authenticateToken, requireAdminOrStaff, requireStaffService } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { getAllBirthApplications, getBirthApplicationById, updateBirthApplicationStatus } from '../controllers/birthCertificateController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Admin/Staff: List Birth Certificate applications
router.get(
  '/admin/applications',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isString(),
    query('search').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('sortBy').optional().isString(),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
validateRequest,
  requireAdminOrStaff,
  requireStaffService(() => 'BIRTH_CERTIFICATE'),
  getAllBirthApplications
);

// Admin/Staff: Get Birth Certificate application by ID
router.get(
  '/admin/applications/:id',
  [param('id').isString().withMessage('Invalid application ID')],
validateRequest,
  requireAdminOrStaff,
  requireStaffService(() => 'BIRTH_CERTIFICATE'),
  getBirthApplicationById
);

// Admin/Staff: Update Birth Certificate application status
router.put(
  '/admin/applications/:id/status',
  [
    param('id').isString().withMessage('Invalid application ID'),
    body('status').isIn(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED']).withMessage('Invalid status'),
    body('additionalInfo').optional().isString(),
  ],
validateRequest,
  requireAdminOrStaff,
  requireStaffService(() => 'BIRTH_CERTIFICATE'),
  updateBirthApplicationStatus
);

export default router;
