import { Response } from 'express';
import { prisma } from '../lib/db';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types/auth';
import { sendApplicationStatusEmail } from '../utils/emailService';

// List all Birth Certificate applications (Admin/Staff)
export const getAllBirthApplications = async (req: AuthRequest, res: Response): Promise<Response> => {
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

    const where: any = { type: 'BIRTH_CERTIFICATE' };
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
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
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
          user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
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
    logger.error('Error fetching birth certificate applications:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

// Get a single Birth Certificate application (Admin/Staff)
export const getBirthApplicationById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !['ADMIN', 'STAFF'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { id } = req.params as any;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Application ID is required' });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
        documents: { select: { id: true, name: true, mimeType: true, sizeBytes: true, uploadedAt: true } },
      },
    });

    if (!application || application.type !== 'BIRTH_CERTIFICATE') {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.json({ success: true, data: application });
  } catch (error) {
    logger.error('Error fetching birth certificate application by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch application' });
  }
};

// Update Birth Certificate application status (Admin/Staff)
export const updateBirthApplicationStatus = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !['ADMIN', 'STAFF'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { id } = req.params as any;
    const { status, additionalInfo } = req.body as any;

    const allowedStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const application = await prisma.application.findUnique({ where: { id }, include: { user: true } });
    if (!application || application.type !== 'BIRTH_CERTIFICATE') {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status, updatedAt: new Date() },
      select: { id: true, type: true, status: true, createdAt: true, updatedAt: true, data: true, userId: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'BIRTH_CERTIFICATE_STATUS_UPDATED',
        entity: 'Application',
        entityId: id,
        newData: JSON.stringify({ status }),
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown',
        createdAt: new Date(),
      },
    });

    // Notify applicant via email (best-effort)
    try {
      if (application.user?.email) {
        await sendApplicationStatusEmail(
          application.user.email,
          application.user.firstName || '',
          'Birth Certificate',
          status,
          application.id,
          additionalInfo
        );
      }
    } catch (e) {
      logger.warn('Failed to send birth certificate status email:', e);
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Error updating birth certificate application status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};
