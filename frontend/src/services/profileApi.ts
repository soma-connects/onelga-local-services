import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth interceptor
const profileApi = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
profileApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  role: string;
  department?: string;
  employeeId?: string;
  isVerified: boolean;
  status: string;
  profilePicture?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  type: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDocument {
  id: string;
  userId: string;
  name: string;
  type: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadDate: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  expiryDate?: string;
  notes?: string;
}

// Profile API functions
export const profileService = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await profileApi.get('/profile');
    return response.data.data || response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await profileApi.put('/profile', data);
    return response.data.data || response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await profileApi.put('/change-password', data);
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<{ success: boolean; message: string; data: { profilePictureUrl: string } }> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await profileApi.post('/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get activity logs
  getActivityLogs: async (page = 1, limit = 10): Promise<{
    logs: ActivityLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await profileApi.get(`/profile/activity?page=${page}&limit=${limit}`);
    return {
      logs: response.data.data?.activities || [],
      pagination: response.data.data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
    };
  },

  // Get user documents
  getDocuments: async (): Promise<UserDocument[]> => {
    const response = await profileApi.get('/profile/documents');
    return response.data.data || [];
  },

  // Upload document
  uploadDocument: async (file: File, type: string, name: string): Promise<UserDocument> => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    formData.append('name', name);
    
    const response = await profileApi.post('/profile/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.document;
  },

  // Download document
  downloadDocument: async (documentId: string, password: string): Promise<Blob> => {
    const response = await profileApi.get(`/profile/documents/${documentId}/download`, {
      params: { password },
      responseType: 'blob',
    });
    
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId: string): Promise<void> => {
    await profileApi.delete(`/profile/documents/${documentId}`);
  },

  // Get notification preferences
  getNotificationPreferences: async (): Promise<NotificationPreference[]> => {
    const response = await profileApi.get('/profile/notifications');
    return response.data.data?.notifications || [];
  },

  // Update notification preferences
  updateNotificationPreferences: async (
    preferences: Array<{
      type: string;
      email: boolean;
      sms: boolean;
      push: boolean;
    }>
  ): Promise<NotificationPreference[]> => {
    const response = await profileApi.put('/profile/notifications', { preferences });
    return response.data.preferences;
  },

  // Verify account with password (for sensitive operations)
  verifyPassword: async (password: string): Promise<{ valid: boolean }> => {
    const response = await profileApi.post('/profile/verify-password', { password });
    return response.data;
  },

  // Get profile statistics
  getProfileStats: async (): Promise<{
    documentsCount: number;
    verifiedDocuments: number;
    pendingDocuments: number;
    lastLogin: string;
    accountAge: number;
  }> => {
    const response = await profileApi.get('/profile/stats');
    return response.data.data || {};
  },
};

export default profileService;
