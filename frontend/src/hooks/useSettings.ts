import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

export interface UserSettings {
  language: string;
  fontSize: string;
  compactMode: boolean;
  autoSave: boolean;
  soundEnabled: boolean;
  theme: string;
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
  profileVisibility: string;
  dataSharing: boolean;
  analyticsOptOut: boolean;
  locationTracking: boolean;
  marketingEmails: boolean;
  thirdPartyIntegrations: boolean;
}

export interface SecuritySettings {
  passwordLastChanged?: string;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
}

export interface SettingsState {
  userSettings: UserSettings;
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  securitySettings: SecuritySettings;
  isLoading: boolean;
  isSaving: boolean;
}

const defaultState: SettingsState = {
  userSettings: {
    language: 'en',
    fontSize: 'medium',
    compactMode: false,
    autoSave: false,
    soundEnabled: true,
    theme: 'light',
  },
  notificationSettings: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: false,
    applicationUpdates: true,
    paymentReminders: true,
    systemAnnouncements: true,
    documentExpiry: true,
    serviceUpdates: true,
    accountSecurity: true,
    weeklyDigest: false,
    quietHours: { enabled: false, start: '22:00', end: '06:00' },
  },
  privacySettings: {
    profileVisibility: 'public',
    dataSharing: false,
    analyticsOptOut: false,
    locationTracking: false,
    marketingEmails: false,
    thirdPartyIntegrations: false,
  },
  securitySettings: {
    passwordLastChanged: undefined,
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
  },
  isLoading: false,
  isSaving: false,
};

const useSettings = () => {
  const [state, setState] = useState<SettingsState>(defaultState);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await apiService.get('/settings');
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          userSettings: { ...prev.userSettings, ...response.data.userSettings },
          notificationSettings: { ...prev.notificationSettings, ...response.data.notificationSettings },
          privacySettings: { ...prev.privacySettings, ...response.data.privacySettings },
          securitySettings: { ...prev.securitySettings, ...response.data.securitySettings },
        }));
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      // Continue with default settings
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveSettings = async (settingsType: string, settings: any) => {
    setState(prev => ({ ...prev, isSaving: true }));
    try {
      await apiService.put('/settings', {
        type: settingsType,
        settings
      });
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Changes are kept locally.');
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    const newSettings = { ...state.userSettings, ...updates };
    setState((prev) => ({ ...prev, userSettings: newSettings }));
    await saveSettings('userSettings', newSettings);
  };
  
  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...state.notificationSettings, ...updates };
    setState((prev) => ({ ...prev, notificationSettings: newSettings }));
    await saveSettings('notificationSettings', newSettings);
  };
  
  const updatePrivacySettings = async (updates: Partial<PrivacySettings>) => {
    const newSettings = { ...state.privacySettings, ...updates };
    setState((prev) => ({ ...prev, privacySettings: newSettings }));
    await saveSettings('privacySettings', newSettings);
  };
  
  const updateSecuritySettings = async (updates: Partial<SecuritySettings>) => {
    const newSettings = { ...state.securitySettings, ...updates };
    setState((prev) => ({ ...prev, securitySettings: newSettings }));
    await saveSettings('securitySettings', newSettings);
  };

  return {
    state,
    updateUserSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updateSecuritySettings,
  };
};

export default useSettings;
