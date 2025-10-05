import { Router } from 'express';
import { requireAdmin, authenticateToken } from '../middleware/auth';
import systemVerificationController from '../controllers/systemVerificationController';

const router = Router();

// Only admins can run system-wide verification
router.use(authenticateToken);
/**
 * @swagger
 * tags:
 *   - name: System
 *     description: System verification and diagnostics
 */
/**
 * @swagger
 * /api/system/verify:
 *   get:
 *     summary: Verify implemented features and integrations
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification report
 */
router.get('/verify', requireAdmin, (req, res) => systemVerificationController.verifyFeatures(req, res));

export default router;
