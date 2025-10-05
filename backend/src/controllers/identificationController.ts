import { Response } from 'express';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types/auth';
import { prisma } from '../lib/db';
import { sendApplicationStatusEmail } from '../utils/emailService';
import { logAudit } from '../utils/auditLogger';

// Generate unique letter number
const generateLetterNumber = (): string => {
  const prefix = 'OLG-ID';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
};

// Apply for identification letter
interface IdentificationLetterBody {
  // Define expected fields for the application body here, e.g.:
  purpose?: string;
  documents?: string[];
  [key: string]: any;
}

interface IdParam extends Record<string, string> {
  id: string;
}

export const applyForIdentificationLetter = async (req: AuthRequest<IdentificationLetterBody>, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Generate a unique reference number
    let referenceNumber: string;
    let isUnique = false;
    let attempts = 0;
    do {
      referenceNumber = generateLetterNumber();
      // Check uniqueness in DB
      // eslint-disable-next-line no-await-in-loop
      const existing = await prisma.application.findUnique({ where: { referenceNumber } });
      if (!existing) isUnique = true;
      attempts++;
      if (attempts > 5) {
        logger.error('Failed to generate unique reference number after 5 attempts');
        return res.status(500).json({
          success: false,
          message: 'Failed to generate unique reference number',
        });
      }
    } while (!isUnique);

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: req.user.id,
        type: 'IDENTIFICATION_LETTER',
        referenceNumber,
        status: 'PENDING',
        data: JSON.stringify(req.body),
      },
    });

    logger.info(`Identification letter application created by user ${req.user.id} with reference ${referenceNumber}`);
    // Audit log
    logAudit('application_created', req.user.id, { referenceNumber, applicationId: application.id });

    return res.status(201).json({
      success: true,
      message: 'Identification letter application submitted successfully',
      data: { application },
    });
  } catch (error) {
    logger.error('Apply identification letter error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit identification letter application',
    });
  }
};

// Get user's identification letter applications
export const getUserApplications = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userId = req.user.id;
    const {
      page = '1',
      limit = '10',
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query as any;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      userId,
      type: 'IDENTIFICATION_LETTER',
    };
    if (status) where.status = status;

    const [applications, totalCount] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limitNum,
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          data: true,
        },
      }),
      prisma.application.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: pageNum,
          total: Math.ceil(totalCount / limitNum),
          count: applications.length,
          totalCount,
        },
      },
    });
  } catch (error) {
    logger.error('Get user applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
    });
  }
};

// Get specific application by ID
export const getApplicationById = async (req: AuthRequest<any, IdParam>, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Application ID is required' });
    }

    // Fetch the application and ensure it's an identification letter
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        documents: { select: { id: true, name: true, mimeType: true, sizeBytes: true, uploadedAt: true } },
      },
    });

    if (!application || application.type !== 'IDENTIFICATION_LETTER') {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Authorization: owner or ADMIN/STAFF can view
    if (application.userId !== req.user.id && !['ADMIN', 'STAFF'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({ success: true, data: {
      id: application.id,
      userId: application.userId,
      user: application.user,
      type: application.type,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      data: application.data,
      documents: application.documents,
    }});
  } catch (error) {
    logger.error('Get application by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
    });
  }
};

// Admin: Get all applications (with filters)
export const getAllApplications = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !['ADMIN', 'STAFF'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const {
      page = '1',
      limit = '10',
      status,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query as any;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { type: 'IDENTIFICATION_LETTER' };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { data: { contains: search, mode: 'insensitive' } },
        { user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        }},
      ];
    }

    const [applications, totalCount] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limitNum,
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          data: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: pageNum,
          total: Math.ceil(totalCount / limitNum),
          count: applications.length,
          totalCount,
        },
      },
    });
  } catch (error) {
    logger.error('Get all applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
    });
  }
};

// Admin: Update application status
interface UpdateStatusBody {
  status: string;
  additionalInfo?: string;
}
export const updateApplicationStatus = async (req: AuthRequest<UpdateStatusBody, IdParam>, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const { status, additionalInfo } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and new status are required',
      });
    }

    // Find application and user
    const application = await prisma.application.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!application || !application.user) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Update status
    const updated = await prisma.application.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });

    logger.info(`Application status updated: ${id} to ${status} by user ${req.user.id}`);

    // Send email notification
    try {
      await sendApplicationStatusEmail(
        application.user.email,
        application.user.firstName || '',
        application.type || 'Service',
        status,
        application.id,
        additionalInfo
      );
      logger.info(`Status update email sent to ${application.user.email} for application ${id}`);
    } catch (emailError) {
      logger.error('Failed to send status update email:', emailError);
    }

    return res.json({
      success: true,
      message: 'Application status updated and user notified',
      data: updated,
    });
  } catch (error) {
    logger.error('Update application status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status',
    });
  }
};

// Download identification letter
export const downloadLetter = async (req: AuthRequest<any, IdParam>, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required',
      });
    }

    // Placeholder implementation
    return res.status(501).json({
      success: false,
      message: 'Download letter service is temporarily unavailable',
    });
  } catch (error) {
    logger.error('Download letter error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download letter',
    });
  }
};

// Get application statistics
export const getApplicationStats = async (_req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Placeholder implementation
    return res.json({
      success: true,
      data: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        thisMonth: 0,
      },
    });
  } catch (error) {
    logger.error('Get application stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics',
    });
  }
};

// Keep the generate letter number function available for future use
export { generateLetterNumber };