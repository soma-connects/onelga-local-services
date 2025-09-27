import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { createTheme, Theme } from '@mui/material/styles';
import { settingsService, UserSettings, NotificationSettings, PrivacySettings, SecuritySettings } from '../services/settingsApi';
import toast from 'react-hot-toast';

// Base theme configuration
const baseTheme = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5', 
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#dc004e',
    light: '#ff5983',
    dark: '#9a0036',
    contrastText: '#ffffff',
  },
  error: { main: '#f44336' },
  warning: { main: '#ff9800' },
  info: { main: '#2196f3' },
  success: { main: '#4caf50' },
};

// Create light and dark themes
const createAppTheme = (mode: 'light' | 'dark', fontSize: string): Theme => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      ...baseTheme,
      background: {
        default: isDark ? '#121212' : '#f5f5f5',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#212121',
        secondary: isDark ? '#b0b0b0' : '#757575',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontSize: fontSize === 'small' ? 12 : fontSize === 'large' ? 16 : 14,
      h1: { fontWeight: 600, fontSize: '2.5rem' },
      h2: { fontWeight: 600, fontSize: '2rem' },
      h3: { fontWeight: 500, fontSize: '1.75rem' },
      h4: { fontWeight: 500, fontSize: '1.5rem' },
      h5: { fontWeight: 500, fontSize: '1.25rem' },
      h6: { fontWeight: 500, fontSize: '1rem' },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 20px',
            fontWeight: 500,
            textTransform: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: 12,
            '&:hover': {
              boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
    spacing: 8,
    shape: { borderRadius: 8 },
  });
};

// Settings State
interface SettingsState {
  userSettings: UserSettings;
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  securitySettings: SecuritySettings;
  theme: Theme;
  isLoading: boolean;
  isSaving: boolean;
}

// Settings Actions
type SettingsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_USER_SETTINGS'; payload: UserSettings }
  | { type: 'SET_NOTIFICATION_SETTINGS'; payload: NotificationSettings }
  | { type: 'SET_PRIVACY_SETTINGS'; payload: PrivacySettings }
  | { type: 'SET_SECURITY_SETTINGS'; payload: SecuritySettings }
  | { type: 'UPDATE_THEME'; payload: { mode?: 'light' | 'dark' | 'system'; fontSize?: string } };

// Default settings
const defaultUserSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  fontSize: 'medium',
  soundEnabled: true,
  autoSave: true,
  compactMode: false,
};

const defaultNotificationSettings: NotificationSettings = {
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

const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'private',
  dataSharing: false,
  analyticsOptOut: false,
  locationTracking: false,
  cookiesAccepted: true,
  marketingEmails: false,
  thirdPartyIntegrations: false,
};

const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  loginNotifications: true,
  sessionTimeout: 30,
  passwordLastChanged: null,
  trustedDevices: [],
  loginHistory: [],
};

// Get system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Determine effective theme mode
const getEffectiveThemeMode = (themeMode: 'light' | 'dark' | 'system'): 'light' | 'dark' => {
  if (themeMode === 'system') {
    return getSystemTheme();
  }
  return themeMode;
};

// Initial state
const initialState: SettingsState = {
  userSettings: defaultUserSettings,
  notificationSettings: defaultNotificationSettings,
  privacySettings: defaultPrivacySettings,
  securitySettings: defaultSecuritySettings,
  theme: createAppTheme(getEffectiveThemeMode('system'), 'medium'),
  isLoading: false,
  isSaving: false,
};

// Settings reducer
const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_USER_SETTINGS':
      const effectiveMode = getEffectiveThemeMode(action.payload.theme);
      return {
        ...state,
        userSettings: action.payload,
        theme: createAppTheme(effectiveMode, action.payload.fontSize),
      };
    case 'SET_NOTIFICATION_SETTINGS':
      return { ...state, notificationSettings: action.payload };
    case 'SET_PRIVACY_SETTINGS':
      return { ...state, privacySettings: action.payload };
    case 'SET_SECURITY_SETTINGS':
      return { ...state, securitySettings: action.payload };
    case 'UPDATE_THEME':
      const newMode = action.payload.mode || state.userSettings.theme;
      const newFontSize = action.payload.fontSize || state.userSettings.fontSize;
      const newEffectiveMode = getEffectiveThemeMode(newMode);
      return {
        ...state,
        theme: createAppTheme(newEffectiveMode, newFontSize),
      };
    default:
      return state;
  }
};

// Settings Context
interface SettingsContextType {
  state: SettingsState;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  loadAllSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Settings Provider
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load all settings from backend
  const loadAllSettings = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [userSettings, notificationSettings, privacySettings, securitySettings] = await Promise.all([
        settingsService.getUserSettings(),
        settingsService.getNotificationSettings(),
        settingsService.getPrivacySettings(),
        settingsService.getSecuritySettings(),
      ]);

      dispatch({ type: 'SET_USER_SETTINGS', payload: userSettings });
      dispatch({ type: 'SET_NOTIFICATION_SETTINGS', payload: notificationSettings });
      dispatch({ type: 'SET_PRIVACY_SETTINGS', payload: privacySettings });
      dispatch({ type: 'SET_SECURITY_SETTINGS', payload: securitySettings });
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update user settings
  const updateUserSettings = async (newSettings: Partial<UserSettings>) => {
    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      const updatedSettings = { ...state.userSettings, ...newSettings };
      const result = await settingsService.updateUserSettings(updatedSettings);
      dispatch({ type: 'SET_USER_SETTINGS', payload: result });
      toast.success('Settings updated successfully');
    } catch (error: any) {
      console.error('Failed to update user settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (newSettings: Partial<NotificationSettings>) => {
    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      const updatedSettings = { ...state.notificationSettings, ...newSettings };
      const result = await settingsService.updateNotificationSettings(updatedSettings);
      dispatch({ type: 'SET_NOTIFICATION_SETTINGS', payload: result });
      toast.success('Notification settings updated');
    } catch (error: any) {
      console.error('Failed to update notification settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update notification settings');
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  // Update privacy settings
  const updatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      const updatedSettings = { ...state.privacySettings, ...newSettings };
      const result = await settingsService.updatePrivacySettings(updatedSettings);
      dispatch({ type: 'SET_PRIVACY_SETTINGS', payload: result });
      toast.success('Privacy settings updated');
    } catch (error: any) {
      console.error('Failed to update privacy settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update privacy settings');
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  // Update security settings
  const updateSecuritySettings = async (newSettings: Partial<SecuritySettings>) => {
    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      const updatedSettings = { ...state.securitySettings, ...newSettings };
      const result = await settingsService.updateSecuritySettings(updatedSettings);
      dispatch({ type: 'SET_SECURITY_SETTINGS', payload: result });
      toast.success('Security settings updated');
    } catch (error: any) {
      console.error('Failed to update security settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update security settings');
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    if (state.userSettings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        dispatch({ type: 'UPDATE_THEME', payload: {} });
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [state.userSettings.theme]);

  // Load settings on mount (for authenticated users)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadAllSettings();
    }
  }, []);

  const contextValue: SettingsContextType = {
    state,
    updateUserSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updateSecuritySettings,
    loadAllSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;