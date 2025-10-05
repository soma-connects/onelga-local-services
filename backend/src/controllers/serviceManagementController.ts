import { Response } from 'express';
import { prisma } from '../lib/db';
import { AuthRequest } from '../types/auth';
import { logger } from '../utils/logger';
import { sendApplicationStatusEmail } from '../utils/emailService';

// Generate unique reference number based on application type
const generateReferenceNumber = (type: string): string => {
  const prefix = (type || 'APP').substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
};

const mapServiceToType = (serviceParam: string): string | null => {
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

export class ServiceManagementController {
  // Citizen: create application for a service
  async createApplication(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Auth required' });
      const { service } = req.params as any;
      const type = mapServiceToType(service);
      if (!type) return res.status(400).json({ success: false, message: 'Invalid service' });

      const data = typeof req.body?.data === 'string' ? req.body.data : JSON.stringify(req.body?.data || req.body || {});

      // Generate a unique reference number (max 5 attempts)
      let referenceNumber = '';
      for (let i = 0; i < 5; i++) {
        const candidate = generateReferenceNumber(type);
        // eslint-disable-next-line no-await-in-loop
        const exists = await prisma.application.findUnique({ where: { referenceNumber: candidate } });
        if (!exists) {
          referenceNumber = candidate;
          break;
        }
      }
      if (!referenceNumber) {
        return res.status(500).json({ success: false, message: 'Failed to generate reference number' });
      }

      const created = await prisma.application.create({
        data: { userId: req.user.id, type, referenceNumber, status: 'PENDING', data },
        select: { id: true, type: true, status: true, createdAt: true, updatedAt: true, data: true },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'APPLICATION_CREATED',
          entity: 'Application',
          entityId: created.id,
          newData: JSON.stringify({ type }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      return res.status(201).json({ success: true, data: created });
    } catch (e) {
      logger.error('createApplication error:', e);
      return res.status(500).json({ success: false, message: 'Failed to create application' });
    }
  }

  // Citizen: list own applications by service
  async listOwn(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Auth required' });
      const { service } = req.params as any;
      const type = mapServiceToType(service);
      if (!type) return res.status(400).json({ success: false, message: 'Invalid service' });

      const { page = '1', limit = '10', status } = req.query as any;
      const pageNum = Math.max(parseInt(page), 1);
      const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { userId: req.user.id, type };
      if (status) where.status = status;

      const [applications, total] = await Promise.all([
        prisma.application.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limitNum }),
        prisma.application.count({ where }),
      ]);

      return res.json({ success: true, data: { applications, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
    } catch (e) {
      logger.error('listOwn error:', e);
      return res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
  }

  // Admin/Staff: list applications for a service
  async adminList(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Auth required' });
      const { service } = req.params as any;
      const type = mapServiceToType(service);
      if (!type) return res.status(400).json({ success: false, message: 'Invalid service' });

      const { page = '1', limit = '10', status, search } = req.query as any;
      const pageNum = Math.max(parseInt(page), 1);
      const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { type };
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { data: { contains: search, mode: 'insensitive' } },
          { user: { OR: [ { firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } } ] } },
        ];
      }

      const [applications, total] = await Promise.all([
        prisma.application.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limitNum, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } }),
        prisma.application.count({ where }),
      ]);

      return res.json({ success: true, data: { applications, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
    } catch (e) {
      logger.error('adminList error:', e);
      return res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
  }

  // Admin/Staff: get application detail by id
  async adminGet(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as any;
      const application = await prisma.application.findUnique({ where: { id }, include: { user: true, documents: true } });
      if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
      return res.json({ success: true, data: application });
    } catch (e) {
      logger.error('adminGet error:', e);
      return res.status(500).json({ success: false, message: 'Failed to fetch application' });
    }
  }

  // Admin/Staff: update status
  async adminUpdateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as any;
      const { status, additionalInfo } = req.body as any;
      const allowed = ['PENDING','UNDER_REVIEW','APPROVED','REJECTED','COMPLETED'];
      if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

      const app = await prisma.application.findUnique({ where: { id }, include: { user: true } });
      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

      const updated = await prisma.application.update({ where: { id }, data: { status, updatedAt: new Date() } });

      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'APPLICATION_STATUS_UPDATED',
          entity: 'Application',
          entityId: id,
          newData: JSON.stringify({ status }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      try {
        if (app.user?.email) {
          await sendApplicationStatusEmail(app.user.email, app.user.firstName || '', app.type, status, app.id, additionalInfo);
        }
      } catch (e) {
        logger.warn('Failed to send status email:', e);
      }

      return res.json({ success: true, data: updated });
    } catch (e) {
      logger.error('adminUpdateStatus error:', e);
      return res.status(500).json({ success: false, message: 'Failed to update status' });
    }
  }
}

export default new ServiceManagementController();
