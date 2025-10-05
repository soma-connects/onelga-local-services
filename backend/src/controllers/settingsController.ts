import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Extend Request interface to include user property
interface RequestWithUser extends Request {
  user?: any;
}

const prisma = new PrismaClient();

export class SettingsController {
  // Helper methods for getting settings data
  private async getUserSettingsData(userId: string) {
    let settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (!settings) {
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
    return settings;
  }

  private async getNotificationSettingsData(userId: string) {
    let settings = await prisma.notificationSettings.findUnique({ where: { userId } });
    if (!settings) {
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
    return settings;
  }

  private async getPrivacySettingsData(userId: string) {
    let settings = await prisma.privacySettings.findUnique({ where: { userId } });
    if (!settings) {
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
    return settings;
  }

  private async getSecuritySettingsData(userId: string) {
    let settings = await prisma.securitySettings.findUnique({ where: { userId } });
    if (!settings) {
      settings = await prisma.securitySettings.create({
        data: {
          userId,
          twoFactorEnabled: false,
          loginNotifications: true,
          sessionTimeout: 30,
        },
      });
    }
    return settings;
  }

  // Helper methods for updating settings data
  private async updateUserSettingsData(userId: string, settings: any) {
    return await prisma.userSettings.upsert({
      where: { userId },
      update: { ...settings, updatedAt: new Date() },
      create: { userId, ...settings },
    });
  }

  private async updateNotificationSettingsData(userId: string, settings: any) {
    return await prisma.notificationSettings.upsert({
      where: { userId },
      update: { ...settings, updatedAt: new Date() },
      create: { userId, ...settings },
    });
  }

  private async updatePrivacySettingsData(userId: string, settings: any) {
    return await prisma.privacySettings.upsert({
      where: { userId },
      update: { ...settings, updatedAt: new Date() },
      create: { userId, ...settings },
    });
  }

  private async updateSecuritySettingsData(userId: string, settings: any) {
    return await prisma.securitySettings.upsert({
      where: { userId },
      update: { ...settings, updatedAt: new Date() },
      create: { userId, ...settings },
    });
  }

  async getSettings(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      const [userSettings, notificationSettings, privacySettings, securitySettings] = await Promise.all([
        this.getUserSettingsData(userId),
        this.getNotificationSettingsData(userId),
        this.getPrivacySettingsData(userId),
        this.getSecuritySettingsData(userId),
      ]);

      res.json({
        user: userSettings,
        notifications: notificationSettings,
        privacy: privacySettings,
        security: securitySettings,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateSettings(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      // Handle both 'category' (expected) and 'type' (from frontend) formats
      const { category, type, settings } = req.body;
      const settingsType = category || type;

      console.log('Update settings request:', { userId, category, type, settingsType, settings, body: req.body });

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      if (!settingsType) {
        res.status(400).json({ error: 'Category or type is required' }); return;
      }

      if (!settings) {
        res.status(400).json({ error: 'Settings data is required' }); return;
      }

      let updatedSettings;
      
      // Map frontend types to backend categories
      const categoryMap: Record<string, string> = {
        'userSettings': 'user',
        'notificationSettings': 'notifications',
        'privacySettings': 'privacy',
        'securitySettings': 'security',
        // Also support direct category names
        'user': 'user',
        'notifications': 'notifications',
        'privacy': 'privacy',
        'security': 'security',
      };
      
      const mappedCategory = categoryMap[settingsType];
      if (!mappedCategory) {
        console.log('Invalid settings type received:', settingsType);
        res.status(400).json({ error: `Invalid settings type: ${settingsType}. Valid types are: userSettings, notificationSettings, privacySettings, securitySettings` }); return;
      }

      switch (mappedCategory) {
        case 'user':
          updatedSettings = await this.updateUserSettingsData(userId, settings);
          break;
        case 'notifications':
          updatedSettings = await this.updateNotificationSettingsData(userId, settings);
          break;
        case 'privacy':
          updatedSettings = await this.updatePrivacySettingsData(userId, settings);
          break;
        case 'security':
          updatedSettings = await this.updateSecuritySettingsData(userId, settings);
          break;
        default:
          res.status(400).json({ error: 'Invalid category mapping' }); return;
      }

      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserSettings(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      const settings = await this.getUserSettingsData(userId);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching user settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateUserSettings(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      const updatedSettings = await this.updateUserSettingsData(userId, req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getNotificationSettings(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      const settings = await this.getNotificationSettingsData(userId);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateNotificationSettings(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      const updatedSettings = await this.updateNotificationSettingsData(userId, req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPrivacySettings(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      const settings = await this.getPrivacySettingsData(userId);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updatePrivacySettings(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      const updatedSettings = await this.updatePrivacySettingsData(userId, req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSecuritySettings(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      const settings = await this.getSecuritySettingsData(userId);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching security settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateSecuritySettings(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      const updatedSettings = await this.updateSecuritySettingsData(userId, req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating security settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all settings for a user - direct implementation
  async getAllSettings(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      // Direct Prisma calls instead of relying on potentially problematic method bindings
      const [userSettings, notificationSettings, privacySettings, securitySettings] = await Promise.all([
        prisma.userSettings.findFirst({ where: { userId } }).then(settings => {
          if (!settings) {
            return prisma.userSettings.create({
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
          return settings;
        }),
        prisma.notificationSettings.findFirst({ where: { userId } }).then(settings => {
          if (!settings) {
            return prisma.notificationSettings.create({
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
          return settings;
        }),
        prisma.privacySettings.findFirst({ where: { userId } }).then(settings => {
          if (!settings) {
            return prisma.privacySettings.create({
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
          return settings;
        }),
        prisma.securitySettings.findFirst({ where: { userId } }).then(settings => {
          if (!settings) {
            return prisma.securitySettings.create({
              data: {
                userId,
                twoFactorEnabled: false,
                loginNotifications: true,
                sessionTimeout: 30,
              },
            });
          }
          return settings;
        }),
      ]);

      res.json({
        user: userSettings,
        notifications: notificationSettings,
        privacy: privacySettings,
        security: securitySettings,
      });
    } catch (error) {
      console.error('Error fetching all settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async exportUserData(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      // TODO: Implement actual data export functionality
      res.json({
        success: false,
        message: 'Data export functionality is not yet implemented. Coming soon!'
      });
    } catch (error) {
      console.error('Error exporting user data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteAccount(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { password, reason } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      // TODO: Implement actual account deletion functionality
      // - Verify password
      // - Log deletion reason
      // - Delete user data
      res.json({
        success: false,
        message: 'Account deletion functionality is not yet implemented. Coming soon!'
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStorageUsage(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      // TODO: Implement actual storage usage calculation
      res.json({
        success: true,
        data: {
          totalStorage: 0,
          usedStorage: 0,
          availableStorage: 0,
          breakdown: {
            documents: 0,
            images: 0,
            applications: 0,
            other: 0
          }
        }
      });
    } catch (error) {
      console.error('Error fetching storage usage:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async testNotification(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { type } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' }); return;
      }

      // TODO: Implement actual notification testing
      res.json({
        success: false,
        message: `Test ${type} notification functionality is not yet implemented. Coming soon!`
      });
    } catch (error) {
      console.error('Error testing notification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

}

export default new SettingsController();
