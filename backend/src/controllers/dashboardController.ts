import { Response } from 'express';
import { prisma } from '../lib/db';
import { AuthRequest } from '../types/auth';

const mapServiceParamToType = (serviceParam: string): string | null => {
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

export class DashboardController {
  async citizen(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Auth required' });
      const userId = req.user.id;

      const [total, pending, approved, rejected, completed, recentApps, unreadNotifs] = await Promise.all([
        prisma.application.count({ where: { userId } }),
        prisma.application.count({ where: { userId, status: 'PENDING' } }),
        prisma.application.count({ where: { userId, status: 'APPROVED' } }),
        prisma.application.count({ where: { userId, status: 'REJECTED' } }),
        prisma.application.count({ where: { userId, status: 'COMPLETED' } }),
        prisma.application.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, type: true, status: true, createdAt: true } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

      return res.json({ success: true, data: {
        applications: { total, pending, approved, rejected, completed },
        recent: recentApps,
        notifications: { unread: unreadNotifs },
      }});
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to load dashboard' });
    }
  }

  async admin(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Auth required' });

      const [totalUsers, activeUsers, suspendedUsers, totalApplications, pendingApplications, approvedApplications, rejectedApplications] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { status: 'SUSPENDED' } }),
        prisma.application.count(),
        prisma.application.count({ where: { status: 'PENDING' } }),
        prisma.application.count({ where: { status: 'APPROVED' } }),
        prisma.application.count({ where: { status: 'REJECTED' } }),
      ]);

      return res.json({ success: true, data: {
        users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers },
        applications: { total: totalApplications, pending: pendingApplications, approved: approvedApplications, rejected: rejectedApplications },
      }});
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to load admin dashboard' });
    }
  }

  async staff(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Auth required' });
      const { service } = req.params as any;
      const type = mapServiceParamToType(service);
      if (!type) return res.status(400).json({ success: false, message: 'Invalid service' });

      const [total, pending, approved, rejected, underReview, recentApps] = await Promise.all([
        prisma.application.count({ where: { type } }),
        prisma.application.count({ where: { type, status: 'PENDING' } }),
        prisma.application.count({ where: { type, status: 'APPROVED' } }),
        prisma.application.count({ where: { type, status: 'REJECTED' } }),
        prisma.application.count({ where: { type, status: 'UNDER_REVIEW' } }),
        prisma.application.findMany({ where: { type }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, type: true, status: true, createdAt: true, user: { select: { firstName: true, lastName: true, email: true } } } })
      ]);

      return res.json({ success: true, data: {
        service: type,
        applications: { total, pending, approved, rejected, underReview },
        recent: recentApps,
      }});
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to load staff dashboard' });
    }
  }

  async official(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Auth required' });

      const [byType, byStatus] = await Promise.all([
        prisma.application.groupBy({ by: ['type'], _count: { type: true } }),
        prisma.application.groupBy({ by: ['status'], _count: { status: true } }),
      ]);

      return res.json({ success: true, data: {
        usageByType: byType.map(x => ({ type: x.type, count: (x as any)._count.type })),
        usageByStatus: byStatus.map(x => ({ status: x.status, count: (x as any)._count.status })),
      }});
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to load official dashboard' });
    }
  }
}

export default new DashboardController();