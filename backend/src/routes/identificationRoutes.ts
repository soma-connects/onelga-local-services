import { Router } from 'express';
import { authenticateToken, staffOrAdmin } from '../middleware/authMiddleware';
import {
  applyForIdentificationLetter,
  getUserApplications,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus,
  downloadLetter,
  getApplicationStats,
} from '../controllers/identificationController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     IdentificationApplication:
 *       type: object
 *       required:
 *         - purpose
 *         - documents
 *       properties:
 *         purpose:
 *           type: string
 *           description: Purpose for requesting identification letter
 *         documents:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of document URLs
 *     IdentificationResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         purpose:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, UNDER_REVIEW, APPROVED, REJECTED, COMPLETED]
 *         letterNumber:
 *           type: string
 *         issuedDate:
 *           type: string
 *           format: date-time
 *         expiryDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/identification/apply:
 *   post:
 *     summary: Apply for identification letter
 *     tags: [Identification Letters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IdentificationApplication'
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Validation error or pending application exists
 *       401:
 *         description: Authentication required
 */
router.post('/apply', authenticateToken, applyForIdentificationLetter);

/**
 * @swagger
 * /api/identification/applications:
 *   get:
 *     summary: Get user's identification letter applications
 *     tags: [Identification Letters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, UNDER_REVIEW, APPROVED, REJECTED, COMPLETED]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/applications', authenticateToken, getUserApplications);

/**
 * @swagger
 * /api/identification/applications/{id}:
 *   get:
 *     summary: Get specific application by ID
 *     tags: [Identification Letters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 *       404:
 *         description: Application not found
 *       401:
 *         description: Authentication required
 */
router.get('/applications/:id', authenticateToken, getApplicationById);

/**
 * @swagger
 * /api/identification/download/{id}:
 *   get:
 *     summary: Download identification letter
 *     tags: [Identification Letters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Letter data retrieved successfully
 *       404:
 *         description: Approved letter not found
 *       401:
 *         description: Authentication required
 */
router.get('/download/:id', authenticateToken, downloadLetter);

// Admin routes
/**
 * @swagger
 * /api/identification/admin/applications:
 *   get:
 *     summary: Get all identification letter applications (Admin)
 *     tags: [Identification Letters - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, UNDER_REVIEW, APPROVED, REJECTED, COMPLETED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in purpose, letter number, or user details
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/admin/applications', authenticateToken, staffOrAdmin, getAllApplications);

/**
 * @swagger
 * /api/identification/admin/applications/{id}/status:
 *   put:
 *     summary: Update application status (Admin)
 *     tags: [Identification Letters - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, UNDER_REVIEW, APPROVED, REJECTED, COMPLETED]
 *               notes:
 *                 type: string
 *                 description: Additional notes for the applicant
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Application not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.put('/admin/applications/:id/status', authenticateToken, staffOrAdmin, updateApplicationStatus);

/**
 * @swagger
 * /api/identification/admin/stats:
 *   get:
 *     summary: Get application statistics (Admin)
 *     tags: [Identification Letters - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/admin/stats', authenticateToken, staffOrAdmin, getApplicationStats);

export default router;
