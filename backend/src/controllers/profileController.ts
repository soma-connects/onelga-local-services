import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';
import { prisma } from '../lib/db';
import { AuthRequest } from '../types/auth';

export class ProfileController {
  async getStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Get user's application statistics
      const [
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        unreadNotifications,
        recentActivities
      ] = await Promise.all([
        prisma.application.count({ where: { userId } }),
        prisma.application.count({ where: { userId, status: 'PENDING' } }),
        prisma.application.count({ where: { userId, status: 'APPROVED' } }),
        prisma.application.count({ where: { userId, status: 'REJECTED' } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
        prisma.auditLog.count({ 
          where: { 
            userId,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
          }
        })
      ]);

      const stats = {
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
        },
        unreadNotifications,
        recentActivities,
      };

      return res.json({ success: true, data: stats });
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  async getProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          isVerified: true,
          phoneNumber: true,
          dateOfBirth: true,
          address: true,
          profilePicture: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      logger.info(`Profile accessed by user: ${userId}`);
      return res.json({ success: true, data: user });
    } catch (error) {
      logger.error('Error getting profile:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { firstName, lastName, phoneNumber, dateOfBirth, address } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      if (!firstName || !lastName) {
        return res.status(400).json({ success: false, message: 'First name and last name are required' });
      }

      // Handle empty strings by converting to null/undefined
      const cleanPhoneNumber = phoneNumber && phoneNumber.trim() !== '' ? phoneNumber.trim() : null;
      const cleanDateOfBirth = dateOfBirth && dateOfBirth.trim() !== '' ? new Date(dateOfBirth) : null;
      const cleanAddress = address && address.trim() !== '' ? address.trim() : null;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: cleanPhoneNumber,
          dateOfBirth: cleanDateOfBirth,
          address: cleanAddress,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          isVerified: true,
          phoneNumber: true,
          dateOfBirth: true,
          address: true,
          profilePicture: true,
          lastLogin: true,
          updatedAt: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'PROFILE_UPDATED',
          entity: 'User',
          entityId: userId,
          newData: JSON.stringify({ firstName, lastName, phoneNumber, dateOfBirth, address }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`Profile updated by user: ${userId}`);
      return res.json({ success: true, message: 'Profile updated successfully', data: updatedUser });
    } catch (error) {
      logger.error('Error updating profile:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword, updatedAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'PASSWORD_CHANGED',
          entity: 'User',
          entityId: userId,
          newData: JSON.stringify({ password: 'REDACTED' }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`Password changed by user: ${userId}`);
      return res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Error changing password:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getApplications(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { type, status, page = '1', limit = '50' } = req.query as any;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: any = { userId };
      if (type) where.type = type;
      if (status) where.status = status;

      const [applications, total] = await Promise.all([
        prisma.application.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
          select: { id: true, type: true, status: true, createdAt: true, updatedAt: true, data: true },
        }),
        prisma.application.count({ where }),
      ]);

      return res.json({ success: true, data: { applications, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
    } catch (error) {
      logger.error('Error getting applications:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async createApplication(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { type, data, serviceId } = req.body as any;
      if (!type || !data) {
        return res.status(400).json({ success: false, message: 'type and data are required' });
      }

      const allowed = [
        'IDENTIFICATION_LETTER',
        'BIRTH_CERTIFICATE',
        'HEALTH_APPOINTMENT',
        'BUSINESS_REGISTRATION',
        'VEHICLE_REGISTRATION',
        'COMPLAINT',
        'EDUCATION_APPLICATION',
        'HOUSING_APPLICATION',
        'SOCIAL_SERVICE',
        'TRANSPORT_SERVICE',
      ];
      if (!allowed.includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid application type' });
      }

      const payloadData = typeof data === 'string' ? data : JSON.stringify(data);

      const created = await prisma.application.create({
        data: {
          userId,
          type,
          status: 'PENDING',
          data: payloadData,
          // serviceId may or may not exist in schema; include via data blob for safety
        } as any,
        select: { id: true, type: true, status: true, createdAt: true, updatedAt: true, data: true },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'APPLICATION_CREATED',
          entity: 'Application',
          entityId: created.id,
          newData: JSON.stringify({ type, serviceId }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      logger.error('Error creating application:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getApplicationById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const { id } = req.params as any;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Application ID is required' });
      }

      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          documents: { select: { id: true, name: true, mimeType: true, sizeBytes: true, uploadedAt: true } },
        },
      });
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      if (application.userId !== user.id && !['ADMIN', 'STAFF'].includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      return res.json({ success: true, data: application });
    } catch (error) {
      logger.error('Error getting application by id:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getAllApplications(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      if (!['ADMIN', 'STAFF'].includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { type, status, page = '1', limit = '50' } = req.query as any;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (type) where.type = type;
      if (status) where.status = status;

      const [applications, total] = await Promise.all([
        prisma.application.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
          select: {
            id: true,
            type: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            data: true,
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
          },
        }),
        prisma.application.count({ where }),
      ]);

      return res.json({ success: true, data: { applications, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
    } catch (error) {
      logger.error('Error getting all applications:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updateApplicationStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'User not authenticated' });
      if (!['ADMIN', 'STAFF'].includes(user.role)) return res.status(403).json({ success: false, message: 'Admin access required' });

      const { id } = req.params as any;
      const { status } = req.body as any;
      const allowedStatuses = ['PENDING','UNDER_REVIEW','APPROVED','REJECTED','COMPLETED'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }

      const exists = await prisma.application.findUnique({ where: { id } });
      if (!exists) return res.status(404).json({ success: false, message: 'Application not found' });

      const updated = await prisma.application.update({ where: { id }, data: { status, updatedAt: new Date() }, select: { id: true, type: true, status: true, createdAt: true, updatedAt: true, data: true, userId: true } });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'APPLICATION_STATUS_UPDATED',
          entity: 'Application',
          entityId: id,
          newData: JSON.stringify({ status }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      return res.json({ success: true, data: updated });
    } catch (error) {
      logger.error('Error updating application status:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async uploadApplicationDocument(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { applicationId } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      if (!applicationId) {
        return res.status(400).json({ success: false, message: 'Application ID is required' });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const application = await prisma.application.findFirst({
        where: { id: applicationId, userId },
      });

      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found or access denied' });
      }

      // Create a Document record and associate with the application
      const document = await prisma.document.create({
        data: {
          userId,
          applicationId: applicationId,
          name: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          // For diskStorage uploads, file.filename is the stored filename under uploads/
          storagePath: file.filename || file.path,
          uploadedBy: userId,
        },
      });

      // Update application.data to store array of document IDs
      const dataObj = application.data ? (() => { try { return JSON.parse(application.data); } catch { return {}; } })() : {};
      const docIds: string[] = Array.isArray(dataObj.documents) ? dataObj.documents : [];
      if (!docIds.includes(document.id)) docIds.push(document.id);
      dataObj.documents = docIds;

      const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: { data: JSON.stringify(dataObj), updatedAt: new Date() },
        select: { id: true, type: true, status: true, data: true, createdAt: true, updatedAt: true },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'DOCUMENT_UPLOADED',
          entity: 'Application',
          entityId: applicationId,
          newData: JSON.stringify({ documentId: document.id, documentName: file.originalname }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`Document uploaded by user: ${userId}, application: ${applicationId}, document: ${document.id}`);
      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: updatedApplication,
      });
    } catch (error) {
      logger.error('Error uploading document:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async deleteApplicationDocument(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { applicationId, documentName } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      if (!applicationId || !documentName) {
        return res.status(400).json({ success: false, message: 'Application ID and document name are required' });
      }

      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          OR: [{ userId }, { user: { role: { in: ['ADMIN', 'STAFF'] } } }],
        },
      });

      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found or access denied' });
      }

      const data = application.data ? JSON.parse(application.data) : { documents: [] };
      data.documents = data.documents.filter((doc: any) => doc.name !== documentName);

      await prisma.application.update({
        where: { id: applicationId },
        data: { data: JSON.stringify(data), updatedAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'DOCUMENT_DELETED',
          entity: 'Application',
          entityId: applicationId,
          newData: JSON.stringify({ documentName }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`Document deleted by user: ${userId}, application: ${applicationId}, document: ${documentName}`);
      return res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
      logger.error('Error deleting document:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async downloadApplicationDocument(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { applicationId, documentName } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      if (!applicationId || !documentName) {
        return res.status(400).json({ success: false, message: 'Application ID and document name are required' });
      }

      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          OR: [{ userId }, { user: { role: { in: ['ADMIN', 'STAFF'] } } }],
        },
      });

      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found or access denied' });
      }

      if (application.status !== 'APPROVED' && application.userId === userId) {
        return res.status(400).json({
          success: false,
          message: 'Application is not yet approved for document download',
        });
      }

      const data = application.data ? JSON.parse(application.data) : { documents: [] };
      const document = data.documents.find((doc: any) => doc.name === documentName);

      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'DOCUMENT_DOWNLOADED',
          entity: 'Application',
          entityId: applicationId,
          newData: JSON.stringify({ documentName }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`Document downloaded by user: ${userId}, application: ${applicationId}, document: ${documentName}`);
      return res.json({
        success: true,
        message: 'Document accessed successfully',
        data: { id: application.id, documentName: document.name, downloadUrl: document.url },
      });
    } catch (error) {
      logger.error('Error downloading document:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getActivityLogs(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { page = '1', limit = '10' } = req.query;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const activities = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          newData: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
        },
      });

      const totalCount = await prisma.auditLog.count({ where: { userId } });

      return res.json({
        success: true,
        data: {
          activities,
          pagination: { page: pageNum, limit: limitNum, total: totalCount, pages: Math.ceil(totalCount / limitNum) },
        },
      });
    } catch (error) {
      logger.error('Error getting activity logs:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getDocuments(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const documents = await prisma.document.findMany({
        where: { userId },
        orderBy: { uploadedAt: 'desc' },
        select: {
          id: true,
          name: true,
          mimeType: true,
          sizeBytes: true,
          storagePath: true,
          uploadedAt: true,
          createdAt: true,
        },
      });

      return res.json({ success: true, data: documents });
    } catch (error) {
      logger.error('Error getting documents:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updateProfilePicture(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // Save the profile picture URL to the user record
      const profilePictureUrl = `/uploads/${file.filename}`;
      
      await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: profilePictureUrl, updatedAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'PROFILE_PICTURE_UPDATED',
          entity: 'User',
          entityId: userId,
          newData: JSON.stringify({ profilePictureUrl }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`Profile picture updated by user: ${userId}`);
      return res.json({ 
        success: true, 
        message: 'Profile picture updated successfully',
        data: { profilePictureUrl }
      });
    } catch (error) {
      logger.error('Error updating profile picture:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new ProfileController();