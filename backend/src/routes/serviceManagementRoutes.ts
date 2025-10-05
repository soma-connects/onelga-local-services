import { Router } from 'express';
import { authenticateToken, requireAdminOrStaff, requireStaffService } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import serviceController from '../controllers/serviceManagementController';

const router = Router();

// Auth for all routes
router.use(authenticateToken);

// Citizen flows
router.post(
  '/:service/applications',
  [body('data').optional()],
  validateRequest,
  (req: import('express').Request & import('../types/auth').AuthRequest, res: import('express').Response) => serviceController.createApplication(req as any, res)
);

router.get(
  '/:service/applications',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isString(),
  ],
  validateRequest,
  (req: import('express').Request & import('../types/auth').AuthRequest, res: import('express').Response) => serviceController.listOwn(req as any, res)
);

// Admin/Staff flows (service-restricted for Staff)
router.get(
  '/:service/admin/applications',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isString(),
    query('search').optional().isString(),
  ],
  validateRequest,
  requireAdminOrStaff,
  requireStaffService((req) => String((req.params as any).service).toUpperCase().includes('BIRTH') ? 'BIRTH_CERTIFICATE' :
    String((req.params as any).service).toLowerCase() === 'identification' ? 'IDENTIFICATION_LETTER' :
    String((req.params as any).service).toLowerCase() === 'health' ? 'HEALTH_APPOINTMENT' :
    String((req.params as any).service).toLowerCase() === 'business' ? 'BUSINESS_REGISTRATION' :
    String((req.params as any).service).toLowerCase() === 'transport' ? 'VEHICLE_REGISTRATION' :
    String((req.params as any).service).toLowerCase() === 'education' ? 'EDUCATION_APPLICATION' :
    String((req.params as any).service).toLowerCase() === 'housing' ? 'HOUSING_APPLICATION' :
    String((req.params as any).service).toLowerCase() === 'social' ? 'SOCIAL_SERVICE' : ''),
  (req: import('express').Request & import('../types/auth').AuthRequest, res: import('express').Response) => serviceController.adminList(req as any, res)
);

router.get(
  '/:service/admin/applications/:id',
  [param('id').isString()],
  validateRequest,
  requireAdminOrStaff,
  requireStaffService((req) => String((req.params as any).service).toUpperCase().includes('BIRTH') ? 'BIRTH_CERTIFICATE' :
    String((req.params as any).service).toLowerCase() === 'identification' ? 'IDENTIFICATION_LETTER' :
    String((req.params as any).service).toLowerCase() === 'health' ? 'HEALTH_APPOINTMENT' :
    String((req.params as any).service).toLowerCase() === 'business' ? 'BUSINESS_REGISTRATION' :
    String((req.params as any).service).toLowerCase() === 'transport' ? 'VEHICLE_REGISTRATION' :
    String((req.params as any).service).toLowerCase() === 'education' ? 'EDUCATION_APPLICATION' :
    String((req.params as any).service).toLowerCase() === 'housing' ? 'HOUSING_APPLICATION' :
    String((req.params as any).service).toLowerCase() === 'social' ? 'SOCIAL_SERVICE' : ''),
  (req: import('express').Request & import('../types/auth').AuthRequest, res: import('express').Response) => serviceController.adminGet(req as any, res)
);

router.put(
  '/:service/admin/applications/:id/status',
  [param('id').isString(), body('status').isString()],
  validateRequest,
  requireAdminOrStaff,
  requireStaffService((req) => String((req.params as any).service).toUpperCase().includes('BIRTH') ? 'BIRTH_CERTIFICATE' :
    String((req.params as any).service).toLowerCase() === 'identification' ? 'IDENTIFICATION_LETTER' :
    String((req.params as any).service).toLowerCase() === 'health' ? 'HEALTH_APPOINTMENT' :
    String((req.params as any).service).toLowerCase() === 'business' ? 'BUSINESS_REGISTRATION' :
    String((req.params as any).service).toLowerCase() === 'transport' ? 'VEHICLE_REGISTRATION' :
    String((req.params as any).service).toLowerCase() === 'education' ? 'EDUCATION_APPLICATION' :
    String((req.params as any).service).toLowerCase() === 'housing' ? 'HOUSING_APPLICATION' :
    String((req.params as any).service).toLowerCase() === 'social' ? 'SOCIAL_SERVICE' : ''),
  (req: import('express').Request & import('../types/auth').AuthRequest, res: import('express').Response) => serviceController.adminUpdateStatus(req as any, res)
);

export default router;
