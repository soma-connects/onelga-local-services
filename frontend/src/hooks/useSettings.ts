import { useState } from 'react';

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

  const updateUserSettings = (updates: Partial<UserSettings>) => {
    setState((prev) => ({ ...prev, userSettings: { ...prev.userSettings, ...updates } }));
  };
  const updateNotificationSettings = (updates: Partial<NotificationSettings>) => {
    setState((prev) => ({ ...prev, notificationSettings: { ...prev.notificationSettings, ...updates } }));
  };
  const updatePrivacySettings = (updates: Partial<PrivacySettings>) => {
    setState((prev) => ({ ...prev, privacySettings: { ...prev.privacySettings, ...updates } }));
  };
  const updateSecuritySettings = (updates: Partial<SecuritySettings>) => {
    setState((prev) => ({ ...prev, securitySettings: { ...prev.securitySettings, ...updates } }));
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
