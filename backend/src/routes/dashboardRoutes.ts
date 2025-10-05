import { Router } from 'express';
import dashboardController from '../controllers/dashboardController';
import { authenticateToken, requireAdmin, requireCitizen, requireOfficialOrAdmin, requireAdminOrStaff, requireStaffService } from '../middleware/auth';

const router = Router();

const serviceToType = (serviceParam: string): string | null => {
  const key = (serviceParam || '').toLowerCase();
  const map: Record<string, string> = {
    identification: 'IDENTIFICATION_LETTER',
    birth: 'BIRTH_CERTIFICATE',
    health: 'HEALTH_APPOINTMENT',
    business: 'BUSINESS_REGISTRATION',
    transport: 'VEHICLE_REGISTRATION',
    education: 'EDUCATION_APPLICATION',
    housing: 'HOUSING_APPLICATION',
    social: 'SOCIAL_SERVICE',
  };
  return map[key] || null;
};

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Role-based dashboards
 */
router.use(authenticateToken);

// Citizen dashboard
/**
 * @swagger
 * /api/dashboard/citizen:
 *   get:
 *     summary: Get citizen dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Citizen dashboard payload
 */
router.get('/citizen', requireCitizen, (req, res) => dashboardController.citizen(req, res));

// Admin dashboard
/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin', requireAdmin, (req, res) => dashboardController.admin(req, res));

// Staff dashboard for a specific service
/**
 * @swagger
 * /api/dashboard/staff/{service}:
 *   get:
 *     summary: Get staff dashboard for a specific service
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema:
 *           type: string
 *           enum: [identification, birth, health, business, transport, education, housing, social]
 *     security:
 *       - bearerAuth: []
 */
router.get('/staff/:service', requireAdminOrStaff, requireStaffService((req) => {
  const t = serviceToType((req.params as any).service);
  return t || '';
}), (req, res) => dashboardController.staff(req, res));

// Government official dashboard
/**
 * @swagger
 * /api/dashboard/official:
 *   get:
 *     summary: Get government official dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/official', requireOfficialOrAdmin, (req, res) => dashboardController.official(req, res));

export default router;