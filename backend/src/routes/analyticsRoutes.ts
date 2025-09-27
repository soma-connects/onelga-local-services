import { Router } from 'express';
import { authenticateToken, requireAdmin, requireOfficialOrAdmin } from '../middleware/auth';
import analyticsController from '../controllers/analyticsController';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Admin dashboard routes
router.get('/admin/dashboard', requireAdmin, analyticsController.getAdminDashboard.bind(analyticsController));

// Government official dashboard routes
router.get('/official/dashboard', requireOfficialOrAdmin, analyticsController.getOfficialDashboard.bind(analyticsController));

// System health routes (admin only)
router.get('/system/health', requireAdmin, analyticsController.getSystemHealth.bind(analyticsController));

export default router;