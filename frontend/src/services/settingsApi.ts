import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interfaces
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  autoSave: boolean;
  compactMode: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  applicationUpdates: boolean;
  paymentReminders: boolean;
  systemAnnouncements: boolean;
  documentExpiry: boolean;
  serviceUpdates: boolean;
  accountSecurity: boolean;
  weeklyDigest: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'limited' | 'private';
  dataSharing: boolean;
  analyticsOptOut: boolean;
  locationTracking: boolean;
  cookiesAccepted: boolean;
  marketingEmails: boolean;
  thirdPartyIntegrations: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  passwordLastChanged: string | null;
  trustedDevices: TrustedDevice[];
  loginHistory: LoginHistory[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  type: string;
  lastUsed: string;
  location?: string;
}

export interface LoginHistory {
  id: string;
  timestamp: string;
  ipAddress: string;
  location?: string;
  userAgent: string;
  success: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason: string;
}

export interface UserDataExport {
  profile: any;
  applications: any[];
  notifications: any[];
  documents: any[];
  activityLogs: any[];
  settings: {
    user: UserSettings;
    notifications: NotificationSettings;
    privacy: PrivacySettings;
    security: Partial<SecuritySettings>;
  };
  exportedAt: string;
}

// Settings API Service
class SettingsService {
  // User Settings
  async getUserSettings(): Promise<UserSettings> {
    try {
      const response = await apiClient.get('/settings/user');
      return response.data.data;
    } catch (error) {
      // Return default settings if API fails
      return {
        theme: 'system',
        language: 'en',
        fontSize: 'medium',
        soundEnabled: true,
        autoSave: true,
        compactMode: false,
      };
    }
  }

  async updateUserSettings(settings: UserSettings): Promise<UserSettings> {
    const response = await apiClient.put('/settings/user', settings);
    return response.data.data;
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await apiClient.get('/settings/notifications');
      return response.data.data;
    } catch (error) {
      // Return default settings if API fails
      return {
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
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
      };
    }
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    const response = await apiClient.put('/settings/notifications', settings);
    return response.data.data;
  }

  // Privacy Settings
  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const response = await apiClient.get('/settings/privacy');
      return response.data.data;
    } catch (error) {
      // Return default settings if API fails
      return {
        profileVisibility: 'private',
        dataSharing: false,
        analyticsOptOut: false,
        locationTracking: false,
        cookiesAccepted: true,
        marketingEmails: false,
        thirdPartyIntegrations: false,
      };
    }
  }

  async updatePrivacySettings(settings: PrivacySettings): Promise<PrivacySettings> {
    const response = await apiClient.put('/settings/privacy', settings);
    return response.data.data;
  }

  // Security Settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await apiClient.get('/settings/security');
      return response.data.data;
    } catch (error) {
      // Return default settings if API fails
      return {
        twoFactorEnabled: false,
        loginNotifications: true,
        sessionTimeout: 30,
        passwordLastChanged: null,
        trustedDevices: [],
        loginHistory: [],
      };
    }
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const response = await apiClient.put('/settings/security', settings);
    return response.data.data;
  }

  // Password Management
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.put('/profile/change-password', request);
  }

  // Two-Factor Authentication
  async enable2FA(): Promise<{ qrCode: string; backupCodes: string[] }> {
    const response = await apiClient.post('/settings/2fa/enable');
    return response.data.data;
  }

  async disable2FA(): Promise<void> {
    await apiClient.post('/settings/2fa/disable');
  }

  async verify2FA(token: string): Promise<void> {
    await apiClient.post('/settings/2fa/verify', { token });
  }

  // Session Management
  async getActiveSessions(): Promise<TrustedDevice[]> {
    const response = await apiClient.get('/settings/sessions');
    return response.data.data;
  }

  async logoutAllDevices(): Promise<void> {
    await apiClient.post('/settings/sessions/logout-all');
  }

  async revokeSession(deviceId: string): Promise<void> {
    await apiClient.delete(`/settings/sessions/${deviceId}`);
  }

  // Login History
  async getLoginHistory(page: number = 1, limit: number = 20): Promise<{ history: LoginHistory[]; total: number }> {
    const response = await apiClient.get('/settings/login-history', {
      params: { page, limit },
    });
    return response.data.data;
  }

  // Data Management
  async exportUserData(): Promise<UserDataExport> {
    const response = await apiClient.get('/settings/export-data');
    return response.data.data;
  }

  async deleteAccount(request: DeleteAccountRequest): Promise<void> {
    await apiClient.post('/settings/delete-account', request);
  }

  // Storage and Usage
  async getStorageUsage(): Promise<{ used: number; limit: number; breakdown: Record<string, number> }> {
    try {
      const response = await apiClient.get('/settings/storage');
      return response.data.data;
    } catch (error) {
      // Return mock data if API fails
      return {
        used: 1200000, // 1.2MB in bytes
        limit: 104857600, // 100MB in bytes
        breakdown: {
          documents: 800000,
          profilePicture: 200000,
          applicationData: 200000,
        },
      };
    }
  }

  // Backup and Restore
  async createBackup(): Promise<{ backupId: string; downloadUrl: string }> {
    const response = await apiClient.post('/settings/backup');
    return response.data.data;
  }

  async restoreFromBackup(backupId: string): Promise<void> {
    await apiClient.post('/settings/restore', { backupId });
  }

  // Account Verification
  async sendVerificationEmail(): Promise<void> {
    await apiClient.post('/settings/verify-email');
  }

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/settings/verify-email/confirm', { token });
  }

  // Theme and Appearance (Client-side helper methods)
  applyTheme(theme: 'light' | 'dark' | 'system'): void {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    
    root.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#121212' : '#ffffff');
    }
  }

  applyFontSize(fontSize: 'small' | 'medium' | 'large'): void {
    const root = document.documentElement;
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.fontSize = fontSizeMap[fontSize];
  }

  applyCompactMode(enabled: boolean): void {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }

  // Notification Permissions (Browser API)
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }
    
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      return permission;
    }
    
    return Notification.permission;
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }

  // Local Storage Helpers
  saveSettingsToLocalStorage(key: string, settings: any): void {
    try {
      localStorage.setItem(`onelga_settings_${key}`, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }

  loadSettingsFromLocalStorage(key: string): any {
    try {
      const stored = localStorage.getItem(`onelga_settings_${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
      return null;
    }
  }

  clearLocalSettings(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('onelga_settings_'));
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Utility Methods
  async testNotificationDelivery(type: 'email' | 'sms' | 'push'): Promise<void> {
    await apiClient.post('/settings/test-notification', { type });
  }

  async downloadDataReport(format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Blob> {
    const response = await apiClient.get('/settings/data-report', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  formatStorageSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  calculateSecurityScore(settings: SecuritySettings, user: any): number {
    let score = 0;
    
    // Email verified (20 points)
    if (user?.isVerified) score += 20;
    
    // Strong password (20 points) - assume true if password was changed recently
    if (settings.passwordLastChanged) {
      const lastChanged = new Date(settings.passwordLastChanged);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      if (lastChanged > sixMonthsAgo) score += 20;
    } else {
      score += 10; // Partial credit for having a password
    }
    
    // Two-factor authentication (30 points)
    if (settings.twoFactorEnabled) score += 30;
    
    // Login notifications enabled (10 points)
    if (settings.loginNotifications) score += 10;
    
    // Session timeout configured (10 points)
    if (settings.sessionTimeout <= 30) score += 10;
    
    // Recent activity monitoring (10 points)
    if (settings.loginHistory && settings.loginHistory.length > 0) score += 10;
    
    return Math.min(score, 100);
  }
}

// Export singleton instance
export const settingsService = new SettingsService();
export default settingsService;