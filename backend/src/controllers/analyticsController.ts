import { Response } from 'express';
import { prisma } from '../lib/db';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types/auth';



export class AnalyticsController {
  // Get admin dashboard statistics
  async getAdminDashboard(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const [
        totalUsers,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        recentUsers,
        totalDocuments,
        totalRevenue,
        monthlyStats,
        applicationsByType,
        usersByRole,
        recentActivities,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.application.count(),
        prisma.application.count({ where: { status: 'PENDING' } }),
        prisma.application.count({ where: { status: 'APPROVED' } }),
        prisma.application.count({ where: { status: 'REJECTED' } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
        prisma.document.count(),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'completed' },
        }),
        this.getMonthlyApplicationStats(),
        this.getApplicationsByType(),
        this.getUsersByRole(),
        prisma.auditLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const dashboardData = {
        overview: {
          totalUsers,
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          recentUsers,
          totalDocuments,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
        charts: {
          monthlyStats,
          applicationsByType,
          usersByRole,
        },
        recentActivities: recentActivities.map((activity: any) => ({
          id: activity.id,
          action: activity.action,
          entity: activity.entity,
          entityId: activity.entityId,
          userId: activity.userId,
          createdAt: activity.createdAt,
        })),
      };

      logger.info(`Admin dashboard data fetched by user: ${req.user?.id}`);
      return res.json({ success: true, data: dashboardData });
    } catch (error) {
      logger.error('Error fetching admin dashboard:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Get government official dashboard statistics
  async getOfficialDashboard(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      
      // Get applications assigned to this official
      const [
        assignedApplications,
        pendingReviews,
        reviewedToday,
        totalProcessed,
        applicationsByStatus,
        recentActions,
        workloadStats,
      ] = await Promise.all([
        prisma.application.findMany({
          where: {
            staffActions: {
              some: { actorId: userId },
            },
          },
          take: 20,
          orderBy: { updatedAt: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            staffActions: {
              where: { actorId: userId },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        }),
        prisma.application.count({
          where: {
            status: 'PENDING',
            staffActions: {
              some: { actorId: userId },
            },
          },
        }),
        prisma.staffAction.count({
          where: {
            actorId: userId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.staffAction.count({
          where: { actorId: userId },
        }),
        this.getApplicationsByStatusForOfficial(userId),
        prisma.staffAction.findMany({
          where: { actorId: userId },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            application: {
              select: { id: true, type: true },
            },
          },
        }),
        this.getOfficialWorkloadStats(userId),
      ]);

      const dashboardData = {
        overview: {
          assignedApplications: assignedApplications.length,
          pendingReviews,
          reviewedToday,
          totalProcessed,
        },
        applications: assignedApplications.map(app => ({
          id: app.id,
          type: app.type,
          status: app.status,
          applicant: app.user ? `${app.user.firstName} ${app.user.lastName}` : 'Unknown',
          submittedAt: app.createdAt,
          lastAction: app.staffActions[0]?.createdAt || null,
        })),
        charts: {
          applicationsByStatus,
          workloadStats,
        },
        recentActions: recentActions.map(action => ({
          id: action.id,
          action: action.action,
          applicationId: action.applicationId,
          applicationType: action.application?.type,
          createdAt: action.createdAt,
          details: action.details ? JSON.parse(action.details) : null,
        })),
      };

      logger.info(`Official dashboard data fetched by user: ${userId}`);
      return res.json({ success: true, data: dashboardData });
    } catch (error) {
      logger.error('Error fetching official dashboard:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Get system health metrics
  async getSystemHealth(_req: AuthRequest, res: Response): Promise<Response> {
    try {
      const [
        dbHealth,
        recentErrors,
        activeUsers,
        systemMetrics,
      ] = await Promise.all([
        this.checkDatabaseHealth(),
        this.getRecentErrors(),
        this.getActiveUsers(),
        this.getSystemMetrics(),
      ]);

      const healthData = {
        database: dbHealth,
        errors: recentErrors,
        activeUsers,
        metrics: systemMetrics,
        status: dbHealth.connected ? 'healthy' : 'degraded',
        timestamp: new Date(),
      };

      return res.json({ success: true, data: healthData });
    } catch (error) {
      logger.error('Error fetching system health:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Private helper methods
  private async getMonthlyApplicationStats() {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const monthlyData = await prisma.application.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      _count: true,
    });

    // Process data by month
    const monthlyStats: { [key: string]: number } = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const key = date.toISOString().slice(0, 7); // YYYY-MM format
      monthlyStats[key] = 0;
    }

    monthlyData.forEach(item => {
      const month = item.createdAt.toISOString().slice(0, 7);
      if (monthlyStats[month] !== undefined) {
        monthlyStats[month] += item._count;
      }
    });

    return Object.entries(monthlyStats).map(([month, count]) => ({
      month,
      count,
    }));
  }

  private async getApplicationsByType() {
    return prisma.application.groupBy({
      by: ['type'],
      _count: true,
    }).then(result => 
      result.map(item => ({
        type: item.type,
        count: item._count,
      }))
    );
  }

  private async getUsersByRole() {
    return prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }).then(result => 
      result.map(item => ({
        role: item.role,
        count: item._count,
      }))
    );
  }

  private async getApplicationsByStatusForOfficial(userId: string) {
    const applications = await prisma.application.findMany({
      where: {
        staffActions: {
          some: { actorId: userId },
        },
      },
    });

    const statusCount = applications.reduce((acc: { [key: string]: number }, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
    }));
  }

  private async getOfficialWorkloadStats(userId: string) {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const dailyActions = await prisma.staffAction.groupBy({
      by: ['createdAt'],
      where: {
        actorId: userId,
        createdAt: { gte: last7Days },
      },
      _count: true,
    });

    // Process into daily stats
    const dailyStats: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10); // YYYY-MM-DD format
      dailyStats[key] = 0;
    }

    dailyActions.forEach(item => {
      const day = item.createdAt.toISOString().slice(0, 10);
      if (dailyStats[day] !== undefined) {
        dailyStats[day] += item._count;
      }
    });

    return Object.entries(dailyStats).map(([day, count]) => ({
      day,
      count,
    }));
  }

  private async checkDatabaseHealth() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        connected: true,
        responseTime: Date.now(),
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async getRecentErrors() {
    // This would typically come from a logging system
    // For now, return empty array
    return [];
  }

  private async getActiveUsers() {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    return prisma.user.count({
      where: {
        lastLogin: { gte: last24Hours },
      },
    });
  }

  private async getSystemMetrics() {
    return {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
    };
  }
}

export default new AnalyticsController();
