import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { body, param, query } from 'express-validator';
import { prisma } from '../lib/db';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { validateRequest } from '../middleware/validation';
import { storage } from '../utils/storage';
import { getPresignedGetUrl } from '../utils/presign';
import { logger } from '../utils/logger';

const router = Router();


// Configure multer for file uploads
const upload = multer({
  dest: 'temp/', // Temporary storage
  limits: {
    fileSize: parseInt(process.env['MAX_UPLOAD_MB'] || '10') * 1024 * 1024, // Default 10MB
    files: 5 // Max 5 files per upload
  },
  fileFilter: (_req, file, cb) => {
    // Allow common document types
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, Word documents, and text files are allowed.'));
    }
  }
});

// Apply authentication to all document routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               applicationId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional application ID to associate document
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid file or missing data
 *       401:
 *         description: Authentication required
 */
router.post('/upload', upload.single('file'), [
  body('applicationId').optional().isUUID().withMessage('Invalid application ID')
], validateRequest, async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const { applicationId } = req.body;

    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file provided' 
      });
    }

    // Validate application exists if provided
    if (applicationId) {
      const application = await prisma.application.findUnique({ 
        where: { id: applicationId } 
      });
      
      if (!application) {
        return res.status(404).json({ 
          success: false, 
          message: 'Application not found' 
        });
      }
      
      // Check if user owns the application or is admin/staff
      const userRole = req.user?.role;
      if (application.userId !== req.user!.id && !['ADMIN', 'STAFF'].includes(userRole!)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied' 
        });
      }
    }

    // Generate safe filename
    const timestamp = Date.now();
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedFileName = `${timestamp}-${safeOriginalName}`;

    // Upload to storage (local or S3)
    const stored = await storage.upload(file.path, storedFileName);

    // Create document record
    const document = await prisma.document.create({
      data: {
        userId: req.user!.id,
        applicationId: applicationId || null,
        name: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storagePath: process.env['STORAGE_DRIVER'] === 's3' ? stored.key : storedFileName,
        uploadedBy: req.user!.id
      }
    });

    // Clean up temp file
    try {
      await fs.promises.unlink(file.path);
    } catch (error) {
      logger.warn(`Failed to delete temp file: ${file.path}`, error);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DOCUMENT_UPLOADED',
        entity: 'Document',
        entityId: document.id,
        newData: JSON.stringify({ name: document.name, size: document.sizeBytes }),
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown'
      }
    });

    logger.info(`Document uploaded: ${document.name} by user ${req.user!.id}`);

    return res.status(201).json({
      success: true,
      data: document
    });

  } catch (error) {
    logger.error('Document upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
});

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get user's documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: applicationId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by application ID
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 */
router.get('/', [
  query('applicationId').optional().isUUID().withMessage('Invalid application ID')
], validateRequest, async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.query;
    const where: any = { userId: req.user!.id };
    
    if (applicationId) {
      where.applicationId = applicationId as string;
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      include: {
        application: {
          select: { id: true, type: true, status: true }
        }
      }
    });

    return res.json({
      success: true,
      data: documents
    });

  } catch (error) {
    logger.error('Error fetching documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

/**
 * @swagger
 * /api/documents/{id}/download:
 *   get:
 *     summary: Download document
 *     tags: [Documents]
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
 *         description: Document download URL or file stream
 *       404:
 *         description: Document not found
 */
router.get('/:id/download', [
  param('id').isUUID().withMessage('Invalid document ID')
], validateRequest, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }
    
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permissions
    const userRole = req.user?.role;
    if (document.userId !== req.user!.id && !['ADMIN', 'STAFF'].includes(userRole!)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DOCUMENT_DOWNLOADED',
        entity: 'Document',
        entityId: document.id,
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown'
      }
    });

    // Handle S3 storage
    if (process.env['STORAGE_DRIVER'] === 's3') {
      const isPublic = !!process.env['AWS_S3_PUBLIC_URL'];
      
      if (isPublic) {
        const base = process.env['AWS_S3_PUBLIC_URL'] || `https://${process.env['AWS_S3_BUCKET']}.s3.amazonaws.com`;
        return res.json({
          success: true,
          data: {
            downloadUrl: `${base}/${document.storagePath}`,
            name: document.name,
            mimeType: document.mimeType
          }
        });
      }

      // Generate presigned URL for private S3 bucket
      const downloadUrl = await getPresignedGetUrl(document.storagePath, 300); // 5 minutes
      return res.json({
        success: true,
        data: {
          downloadUrl,
          name: document.name,
          mimeType: document.mimeType
        }
      });
    }

    // Handle local storage
    const uploadDir = process.env['UPLOAD_DIR'] || 'uploads';
    const filePath = path.resolve(process.cwd(), uploadDir, document.storagePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    return res.download(filePath, document.name);

  } catch (error) {
    logger.error('Document download error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
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
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 */
router.delete('/:id', [
  param('id').isUUID().withMessage('Invalid document ID')
], validateRequest, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }
    
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permissions
    const userRole = req.user?.role;
    if (document.userId !== req.user!.id && !['ADMIN', 'STAFF'].includes(userRole!)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove from storage
    const storagePath = process.env['STORAGE_DRIVER'] === 's3' 
      ? document.storagePath 
      : path.resolve(process.cwd(), process.env['UPLOAD_DIR'] || 'uploads', document.storagePath);

    await storage.remove(storagePath);

    // Delete from database
    await prisma.document.delete({
      where: { id: document.id }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DOCUMENT_DELETED',
        entity: 'Document',
        entityId: document.id,
        oldData: JSON.stringify({ name: document.name }),
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown'
      }
    });

    logger.info(`Document deleted: ${document.name} by user ${req.user!.id}`);

    return res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    logger.error('Document deletion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

export default router;