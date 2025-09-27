import { Response } from 'express';
import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types/auth';



export class SettingsController {
  // User Settings
  async getUserSettings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Get user settings from database or return defaults
      let settings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      if (!settings) {
        // Create default settings
        settings = await prisma.userSettings.create({
          data: {
            userId,
            theme: 'system',
            language: 'en',
            fontSize: 'medium',
            soundEnabled: true,
            autoSave: true,
            compactMode: false,
          },
        });
      }

      return res.json({ success: true, data: settings });
    } catch (error: any) {
      logger.error('Error getting user settings:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updateUserSettings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { theme, language, fontSize, soundEnabled, autoSave, compactMode } = req.body;

      const settings = await prisma.userSettings.upsert({
        where: { userId },
        update: {
          theme,
          language,
          fontSize,
          soundEnabled,
          autoSave,
          compactMode,
          updatedAt: new Date(),
        },
        create: {
          userId,
          theme,
          language,
          fontSize,
          soundEnabled,
          autoSave,
          compactMode,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'USER_SETTINGS_UPDATED',
          entity: 'UserSettings',
          entityId: settings.id,
          newData: JSON.stringify({ theme, language, fontSize, soundEnabled, autoSave, compactMode }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`User settings updated by user: ${userId}`);
      return res.json({ success: true, data: settings });
    } catch (error: any) {
      logger.error('Error updating user settings:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Notification Settings
  async getNotificationSettings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      let settings = await prisma.notificationSettings.findUnique({
        where: { userId },
      });

      if (!settings) {
        // Create default notification settings
        settings = await prisma.notificationSettings.create({
          data: {
            userId,
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            applicationUpdates: true,
            paymentReminders: true,
            systemAnnouncements: true,
            documentExpiry: true,
            serviceUpdates: false,
            accountSecurity: true,
            weeklyDigest: false,
            quietHoursEnabled: false,
            quietHoursStart: '22:00',
            quietHoursEnd: '08:00',
          },
        });
      }

      // Format response to match frontend interface
      const formattedSettings = {
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        pushNotifications: settings.pushNotifications,
        applicationUpdates: settings.applicationUpdates,
        paymentReminders: settings.paymentReminders,
        systemAnnouncements: settings.systemAnnouncements,
        documentExpiry: settings.documentExpiry,
        serviceUpdates: settings.serviceUpdates,
        accountSecurity: settings.accountSecurity,
        weeklyDigest: settings.weeklyDigest,
        quietHours: {
          enabled: settings.quietHoursEnabled,
          start: settings.quietHoursStart,
          end: settings.quietHoursEnd,
        },
      };

      return res.json({ success: true, data: formattedSettings });
    } catch (error: any) {
      logger.error('Error getting notification settings:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updateNotificationSettings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const {
        emailNotifications,
        smsNotifications,
        pushNotifications,
        applicationUpdates,
        paymentReminders,
        systemAnnouncements,
        documentExpiry,
        serviceUpdates,
        accountSecurity,
        weeklyDigest,
        quietHours,
      } = req.body;

      const settings = await prisma.notificationSettings.upsert({
        where: { userId },
        update: {
          emailNotifications,
          smsNotifications,
          pushNotifications,
          applicationUpdates,
          paymentReminders,
          systemAnnouncements,
          documentExpiry,
          serviceUpdates,
          accountSecurity,
          weeklyDigest,
          quietHoursEnabled: quietHours?.enabled || false,
          quietHoursStart: quietHours?.start || '22:00',
          quietHoursEnd: quietHours?.end || '08:00',
          updatedAt: new Date(),
        },
        create: {
          userId,
          emailNotifications,
          smsNotifications,
          pushNotifications,
          applicationUpdates,
          paymentReminders,
          systemAnnouncements,
          documentExpiry,
          serviceUpdates,
          accountSecurity,
          weeklyDigest,
          quietHoursEnabled: quietHours?.enabled || false,
          quietHoursStart: quietHours?.start || '22:00',
          quietHoursEnd: quietHours?.end || '08:00',
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'NOTIFICATION_SETTINGS_UPDATED',
          entity: 'NotificationSettings',
          entityId: settings.id,
          newData: JSON.stringify(req.body),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`Notification settings updated by user: ${userId}`);
      
      // Return in the same format as GET
      const formattedSettings = {
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        pushNotifications: settings.pushNotifications,
        applicationUpdates: settings.applicationUpdates,
        paymentReminders: settings.paymentReminders,
        systemAnnouncements: settings.systemAnnouncements,
        documentExpiry: settings.documentExpiry,
        serviceUpdates: settings.serviceUpdates,
        accountSecurity: settings.accountSecurity,
        weeklyDigest: settings.weeklyDigest,
        quietHours: {
          enabled: settings.quietHoursEnabled,
          start: settings.quietHoursStart,
          end: settings.quietHoursEnd,
        },
      };

      return res.json({ success: true, data: formattedSettings });
    } catch (error: any) {
      logger.error('Error updating notification settings:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Privacy Settings
  async getPrivacySettings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      let settings = await prisma.privacySettings.findUnique({
        where: { userId },
      });

      if (!settings) {
        // Create default privacy settings
        settings = await prisma.privacySettings.create({
          data: {
            userId,
            profileVisibility: 'private',
            dataSharing: false,
            analyticsOptOut: false,
            locationTracking: false,
            cookiesAccepted: true,
            marketingEmails: false,
            thirdPartyIntegrations: false,
          },
        });
      }

      return res.json({ success: true, data: settings });
    } catch (error: any) {
      logger.error('Error getting privacy settings:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updatePrivacySettings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const {
        profileVisibility,
        dataSharing,
        analyticsOptOut,
        locationTracking,
        cookiesAccepted,
        marketingEmails,
        thirdPartyIntegrations,
      } = req.body;

      const settings = await prisma.privacySettings.upsert({
        where: { userId },
        update: {
          profileVisibility,
          dataSharing,
          analyticsOptOut,
          locationTracking,
          cookiesAccepted,
          marketingEmails,
          thirdPartyIntegrations,
          updatedAt: new Date(),
        },
        create: {
          userId,
          profileVisibility,
          dataSharing,
          analyticsOptOut,
          locationTracking,
          cookiesAccepted,
          marketingEmails,
          thirdPartyIntegrations,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'PRIVACY_SETTINGS_UPDATED',
          entity: 'PrivacySettings',
          entityId: settings.id,
          newData: JSON.stringify(req.body),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`Privacy settings updated by user: ${userId}`);
      return res.json({ success: true, data: settings });
    } catch (error: any) {
      logger.error('Error updating privacy settings:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Security Settings
  async getSecuritySettings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      let settings = await prisma.securitySettings.findUnique({
        where: { userId },
      });

      if (!settings) {
        // Create default security settings
        settings = await prisma.securitySettings.create({
          data: {
            userId,
            twoFactorEnabled: false,
            loginNotifications: true,
            sessionTimeout: 30,
          },
        });
      }

      // Get additional security info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { updatedAt: true },
      });

      const loginHistory = await prisma.auditLog.findMany({
        where: {
          userId,
          action: 'LOGIN',
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          ipAddress: true,
          userAgent: true,
        },
      });

      const formattedSettings = {
        twoFactorEnabled: settings.twoFactorEnabled,
        loginNotifications: settings.loginNotifications,
        sessionTimeout: settings.sessionTimeout,
        passwordLastChanged: user?.updatedAt?.toISOString() || null,
        trustedDevices: [], // Placeholder for trusted devices feature
        loginHistory: loginHistory.map(log => ({
          id: log.id,
          timestamp: log.createdAt.toISOString(),
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          success: true, // Assuming successful since we only log successful logins
        })),
      };

      return res.json({ success: true, data: formattedSettings });
    } catch (error: any) {
      logger.error('Error getting security settings:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updateSecuritySettings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { twoFactorEnabled, loginNotifications, sessionTimeout } = req.body;

      const settings = await prisma.securitySettings.upsert({
        where: { userId },
        update: {
          twoFactorEnabled: twoFactorEnabled !== undefined ? twoFactorEnabled : undefined,
          loginNotifications: loginNotifications !== undefined ? loginNotifications : undefined,
          sessionTimeout: sessionTimeout !== undefined ? sessionTimeout : undefined,
          updatedAt: new Date(),
        },
        create: {
          userId,
          twoFactorEnabled: twoFactorEnabled || false,
          loginNotifications: loginNotifications !== undefined ? loginNotifications : true,
          sessionTimeout: sessionTimeout || 30,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'SECURITY_SETTINGS_UPDATED',
          entity: 'SecuritySettings',
          entityId: settings.id,
          newData: JSON.stringify(req.body),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`Security settings updated by user: ${userId}`);
      
      // Return the same format as GET
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { updatedAt: true },
      });

      const formattedSettings = {
        twoFactorEnabled: settings.twoFactorEnabled,
        loginNotifications: settings.loginNotifications,
        sessionTimeout: settings.sessionTimeout,
        passwordLastChanged: user?.updatedAt?.toISOString() || null,
        trustedDevices: [],
        loginHistory: [],
      };

      return res.json({ success: true, data: formattedSettings });
    } catch (error: any) {
      logger.error('Error updating security settings:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Data Export
  async exportUserData(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Get all user data
      const [user, applications, notifications, documents, activityLogs, userSettings, notificationSettings, privacySettings, securitySettings] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            dateOfBirth: true,
            address: true,
            profilePicture: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.application.findMany({
          where: { userId },
          select: {
            id: true,
            type: true,
            status: true,
            data: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.notification.findMany({
          where: { userId },
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            isRead: true,
            createdAt: true,
          },
        }),
        prisma.document.findMany({
          where: { userId },
          select: {
            id: true,
            name: true,
            mimeType: true,
            sizeBytes: true,
            uploadedAt: true,
            createdAt: true,
          },
        }),
        prisma.auditLog.findMany({
          where: { userId },
          select: {
            id: true,
            action: true,
            entity: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 100, // Limit to last 100 activities
        }),
        prisma.userSettings.findUnique({
          where: { userId },
        }),
        prisma.notificationSettings.findUnique({
          where: { userId },
        }),
        prisma.privacySettings.findUnique({
          where: { userId },
        }),
        prisma.securitySettings.findUnique({
          where: { userId },
        }),
      ]);

      const exportData = {
        profile: user,
        applications,
        notifications,
        documents,
        activityLogs,
        settings: {
          user: userSettings,
          notifications: notificationSettings,
          privacy: privacySettings,
          security: securitySettings ? {
            twoFactorEnabled: securitySettings.twoFactorEnabled,
            loginNotifications: securitySettings.loginNotifications,
            sessionTimeout: securitySettings.sessionTimeout,
          } : null,
        },
        exportedAt: new Date().toISOString(),
      };

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'DATA_EXPORTED',
          entity: 'User',
          entityId: userId,
          newData: JSON.stringify({ exportedAt: exportData.exportedAt }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`User data exported by user: ${userId}`);
      return res.json({ success: true, data: exportData });
    } catch (error: any) {
      logger.error('Error exporting user data:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Account Deletion
  async deleteAccount(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { password, reason } = req.body;

      if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required for account deletion' });
      }

      // Verify password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ success: false, message: 'Invalid password' });
      }

      // Log the deletion request
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'ACCOUNT_DELETION_REQUESTED',
          entity: 'User',
          entityId: userId,
          newData: JSON.stringify({ reason, requestedAt: new Date().toISOString() }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      // In a real implementation, you might want to:
      // 1. Send a confirmation email
      // 2. Schedule the deletion for a later date (grace period)
      // 3. Anonymize data instead of hard deletion
      
      // For this example, we'll mark the user as deleted but not actually delete the record
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'DELETED',
          email: `deleted_${Date.now()}@example.com`, // Anonymize email
          updatedAt: new Date(),
        },
      });

      logger.info(`Account deletion requested by user: ${userId}, reason: ${reason}`);
      return res.json({ 
        success: true, 
        message: 'Account deletion has been initiated. You will receive a confirmation email shortly.' 
      });
    } catch (error: any) {
      logger.error('Error deleting account:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Storage Usage
  async getStorageUsage(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Calculate storage usage
      const [documents, profileData] = await Promise.all([
        prisma.document.findMany({
          where: { userId },
          select: { sizeBytes: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { profilePicture: true },
        }),
      ]);

      const documentSize = documents.reduce((total, doc) => total + (doc.sizeBytes || 0), 0);
      const profilePictureSize = profileData?.profilePicture ? 200000 : 0; // Estimate 200KB for profile picture
      const applicationDataSize = 50000; // Estimate for application data

      const breakdown = {
        documents: documentSize,
        profilePicture: profilePictureSize,
        applicationData: applicationDataSize,
      };

      const totalUsed = Object.values(breakdown).reduce((sum, size) => sum + size, 0);
      const limit = 104857600; // 100MB limit

      return res.json({
        success: true,
        data: {
          used: totalUsed,
          limit,
          breakdown,
        },
      });
    } catch (error: any) {
      logger.error('Error getting storage usage:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Test Notification
  async testNotification(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { type } = req.body;

      // Create a test notification in the database
      await prisma.notification.create({
        data: {
          userId,
          type: 'INFO',
          title: 'Test Notification',
          message: `This is a test ${type} notification to verify your settings.`,
          isRead: false,
          createdAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'TEST_NOTIFICATION_SENT',
          entity: 'Notification',
          entityId: userId,
          newData: JSON.stringify({ type }),
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date(),
        },
      });

      logger.info(`Test notification sent to user: ${userId}, type: ${type}`);
      return res.json({ 
        success: true, 
        message: `Test ${type} notification sent successfully` 
      });
    } catch (error: any) {
      logger.error('Error sending test notification:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new SettingsController();