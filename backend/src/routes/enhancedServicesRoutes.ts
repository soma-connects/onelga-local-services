import { Router, Response } from 'express';
import { prisma } from '../lib/db';
import { body, param } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { validate } from '../middleware/validation';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import path from 'path';

const router = Router();


// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/enhanced-services/applications:
 *   post:
 *     summary: Submit a service application
 *     tags: [Enhanced Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [IDENTIFICATION_LETTER, BIRTH_CERTIFICATE, HEALTH_APPOINTMENT, BUSINESS_REGISTRATION, VEHICLE_REGISTRATION, COMPLAINT, EDUCATION_APPLICATION, HOUSING_APPLICATION]
 *               data:
 *                 type: object
 *                 description: Service-specific data
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 */
router.post('/applications', [
  body('type').isString().withMessage('Application type is required'),
  body('data').optional().isObject().withMessage('Data must be an object')
], validate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, data } = req.body;
    
    // Create application
    const application = await prisma.application.create({
      data: {
        userId: req.user!.id,
        type,
        data: data ? JSON.stringify(data) : null,
        status: 'PENDING'
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'APPLICATION_SUBMITTED',
        entity: 'Application',
        entityId: application.id,
        newData: JSON.stringify({ type, applicationId: application.id }),
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown'
      }
    });

    logger.info(`Application submitted: ${type} by user ${req.user!.id}`);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });

  } catch (error) {
    logger.error('Error submitting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
});

/**
 * @swagger
 * /api/enhanced-services/applications:
 *   get:
 *     summary: Get user's applications
 *     tags: [Enhanced Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by application type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 */
router.get('/applications', async (req: AuthRequest, res: Response) => {
  try {
    const { type, status } = req.query;
    const where: any = { userId: req.user!.id };

    if (type) where.type = type;
    if (status) where.status = status;

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        documents: {
          select: {
            id: true,
            name: true,
            mimeType: true,
            sizeBytes: true,
            uploadedAt: true
          }
        },
        payments: {
          select: {
            id: true,
            reference: true,
            amount: true,
            status: true,
            paidAt: true
          }
        }
      }
    });

    return res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    logger.error('Error fetching applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

/**
 * @swagger
 * /api/enhanced-services/stats:
 *   get:
 *     summary: Get user's service statistics
 *     tags: [Enhanced Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      completedApplications,
      totalDocuments,
      recentApplications
    ] = await Promise.all([
      prisma.application.count({ where: { userId } }),
      prisma.application.count({ where: { userId, status: 'PENDING' } }),
      prisma.application.count({ where: { userId, status: 'APPROVED' } }),
      prisma.application.count({ where: { userId, status: 'REJECTED' } }),
      prisma.application.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.document.count({ where: { userId } }),
      prisma.application.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true
        }
      })
    ]);

    return res.json({
      success: true,
      data: {
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
          completed: completedApplications
        },
        documents: {
          total: totalDocuments
        },
        recent: recentApplications
      }
    });

  } catch (error) {
    logger.error('Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// =============================================================================
// STAFF ROUTES - Require ADMIN or STAFF roles
// =============================================================================

/**
 * @swagger
 * /api/enhanced-services/staff/applications:
 *   get:
 *     summary: Get applications for staff review (staff/admin only)
 *     tags: [Enhanced Services - Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by service type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       403:
 *         description: Insufficient permissions
 */
router.get('/staff/applications', requireRole(['ADMIN', 'STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { type, status } = req.query;
    const userRole = req.user!.role;
    let where: any = {};

    // Apply filters
    if (type) where.type = type;
    if (status) where.status = status;

    // If user is STAFF (not ADMIN), check service assignments
    if (userRole === 'STAFF') {
      const assignments = await prisma.serviceAssignment.findMany({
        where: { userId: req.user!.id },
        select: { serviceType: true }
      });

      if (assignments.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No services assigned to your account'
        });
      }

      const assignedTypes = assignments.map(a => a.serviceType);
      const typeFilter = type as string;
      where.type = typeFilter ? { in: [typeFilter].filter(t => assignedTypes.includes(t)) } : { in: assignedTypes };
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        },
        documents: {
          select: {
            id: true,
            name: true,
            mimeType: true,
            sizeBytes: true,
            uploadedAt: true
          }
        },
        staffActions: {
          orderBy: { createdAt: 'desc' },
          include: {
            actor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          }
        }
      }
    });

    return res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    logger.error('Error fetching staff applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

/**
 * @swagger
 * /api/enhanced-services/applications/{id}/approve:
 *   post:
 *     summary: Approve an application (staff/admin only)
 *     tags: [Enhanced Services - Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Application approved successfully
 *       404:
 *         description: Application not found
 *       403:
 *         description: Insufficient permissions
 */
router.post('/applications/:id/approve', [
  param('id').isUUID().withMessage('Invalid application ID')
], validate, requireRole(['ADMIN', 'STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { id: applicationId } = req.params;
    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'Application ID is required.' });
    }
    const userRole = req.user!.role;
    
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check service assignment for STAFF users
    if (userRole === 'STAFF') {
      const assignment = await prisma.serviceAssignment.findFirst({
        where: {
          userId: req.user!.id,
          serviceType: application.type
        }
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Service not assigned to your account'
        });
      }
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'APPROVED' }
    });

    // Record staff action
    await prisma.staffAction.create({
      data: {
        actorId: req.user!.id,
        applicationId: applicationId,
        action: 'APPROVE',
        details: JSON.stringify({ timestamp: new Date().toISOString() })
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'APPLICATION_APPROVED',
        entity: 'Application',
        entityId: applicationId,
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown'
      }
    });

    logger.info(`Application ${applicationId} approved by ${req.user!.role} ${req.user!.id}`);

    return res.json({
      success: true,
      message: 'Application approved successfully',
      data: updatedApplication
    });

  } catch (error) {
    logger.error('Error approving application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve application'
    });
  }
});

/**
 * @swagger
 * /api/enhanced-services/applications/{id}/reject:
 *   post:
 *     summary: Reject an application (staff/admin only)
 *     tags: [Enhanced Services - Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *             required:
 *               - reason
 *     responses:
 *       200:
 *         description: Application rejected successfully
 *       404:
 *         description: Application not found
 *       403:
 *         description: Insufficient permissions
 */
router.post('/applications/:id/reject', [
  param('id').isUUID().withMessage('Invalid application ID'),
  body('reason').isString().isLength({ min: 10 }).withMessage('Rejection reason must be at least 10 characters')
], validate, requireRole(['ADMIN', 'STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { id: applicationId } = req.params;
    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'Application ID is required.' });
    }
    const { reason } = req.body;
    const userRole = req.user!.role;
    
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check service assignment for STAFF users
    if (userRole === 'STAFF') {
      const assignment = await prisma.serviceAssignment.findFirst({
        where: {
          userId: req.user!.id,
          serviceType: application.type
        }
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Service not assigned to your account'
        });
      }
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' }
    });

    // Record staff action
    await prisma.staffAction.create({
      data: {
        actorId: req.user!.id,
        applicationId: applicationId,
        action: 'REJECT',
        details: JSON.stringify({ reason, timestamp: new Date().toISOString() })
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'APPLICATION_REJECTED',
        entity: 'Application',
        entityId: applicationId,
        newData: JSON.stringify({ reason }),
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown'
      }
    });

    logger.info(`Application ${applicationId} rejected by ${req.user!.role} ${req.user!.id}: ${reason}`);

    return res.json({
      success: true,
      message: 'Application rejected successfully',
      data: updatedApplication
    });

  } catch (error) {
    logger.error('Error rejecting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject application'
    });
  }
});

/**
 * @swagger
 * /api/enhanced-services/applications/{id}:
 *   delete:
 *     summary: Delete an application and its documents (staff/admin only)
 *     tags: [Enhanced Services - Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *       404:
 *         description: Application not found
 *       403:
 *         description: Insufficient permissions
 */
router.delete('/applications/:id', [
  param('id').isUUID().withMessage('Invalid application ID')
], validate, requireRole(['ADMIN', 'STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { id: applicationId } = req.params;
    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'Application ID is required.' });
    }
    const userRole = req.user!.role;
    
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { documents: true }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check service assignment for STAFF users
    if (userRole === 'STAFF') {
      const assignment = await prisma.serviceAssignment.findFirst({
        where: {
          userId: req.user!.id,
          serviceType: application.type
        }
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Service not assigned to your account'
        });
      }
    }

    // Clean up documents from storage
    for (const document of application.documents) {
      try {
        const storagePath = process.env['STORAGE_DRIVER'] === 's3' 
          ? document.storagePath 
          : path.resolve(process.cwd(), process.env['UPLOAD_DIR'] || 'uploads', document.storagePath);
        
        await storage.remove(storagePath);
      } catch (error) {
        logger.warn(`Failed to delete document ${document.id} from storage:`, error);
      }
    }

    // Delete documents from database
    await prisma.document.deleteMany({
      where: { applicationId: applicationId }
    });

    // Delete application
    await prisma.application.delete({
      where: { id: applicationId }
    });

    // Record staff action (note: this will be orphaned after deletion, but kept for audit)
    await prisma.staffAction.create({
      data: {
        actorId: req.user!.id,
        applicationId: applicationId,
        action: 'DELETE',
        details: JSON.stringify({ 
          deletedType: application.type,
          documentsDeleted: application.documents.length,
          timestamp: new Date().toISOString() 
        })
      }
    }).catch(() => {}); // Ignore if it fails due to foreign key constraint

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'APPLICATION_DELETED',
        entity: 'Application',
        entityId: applicationId,
        oldData: JSON.stringify({ 
          type: application.type,
          userId: application.userId,
          documentsCount: application.documents.length 
        }),
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown'
      }
    });

    logger.info(`Application ${applicationId} deleted by ${req.user!.role} ${req.user!.id}`);

    return res.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete application'
    });
  }
});

export default router;