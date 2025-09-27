import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface DashboardStats {
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  recentActivities: number;
  unreadNotifications: number;
}

export interface Application {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  data?: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  applicationId?: string;
  createdAt: string;
  data?: any;
}

export interface Activity {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  newData?: string;
}

export interface Document {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  uploadedAt: string;
  createdAt: string;
}

// Dashboard Stats Hook
export const useDashboardStats = () => {
  return useQuery<DashboardStats>(
    'dashboard-stats',
    async () => {
      const response = await apiClient.get('/profile/stats');
      return response.data.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
      onError: (error: any) => {
        console.error('Failed to fetch dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      },
    }
  );
};

// Applications Hook
export const useApplications = (limit: number = 10) => {
  return useQuery<Application[]>(
    ['applications', { limit }],
    async () => {
      const response = await apiClient.get(`/profile/applications?limit=${limit}&page=1`);
      return response.data.data?.applications || [];
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error: any) => {
        console.error('Failed to fetch applications:', error);
      },
    }
  );
};

// Notifications Hook
export const useNotifications = (limit: number = 5) => {
  return useQuery<{ notifications: Notification[]; pagination: any }>(
    ['notifications', { limit }],
    async () => {
      const response = await apiClient.get(`/profile/notifications?limit=${limit}&page=1`);
      return response.data.data || { notifications: [], pagination: {} };
    },
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchOnWindowFocus: true,
      onError: (error: any) => {
        console.error('Failed to fetch notifications:', error);
      },
    }
  );
};

// Activity Hook
export const useActivity = (limit: number = 5) => {
  return useQuery<{ activities: Activity[]; pagination: any }>(
    ['activity', { limit }],
    async () => {
      const response = await apiClient.get(`/profile/activity?limit=${limit}&page=1`);
      return response.data.data || { activities: [], pagination: {} };
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error: any) => {
        console.error('Failed to fetch activity:', error);
      },
    }
  );
};

// Documents Hook
export const useDocuments = () => {
  return useQuery<Document[]>(
    'documents',
    async () => {
      const response = await apiClient.get('/profile/documents');
      return response.data.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: any) => {
        console.error('Failed to fetch documents:', error);
      },
    }
  );
};

// Mark notification as read
export const useMarkNotificationAsRead = () => {
  return async (notificationId: string) => {
    try {
      await apiClient.put(`/profile/notifications/${notificationId}/read`);
      // Invalidate and refetch notifications
      // This would typically be done with react-query's queryClient
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to update notification');
    }
  };
};

// Real-time data hook with polling
export const useRealTimeStats = (interval: number = 30000) => {
  const [isPolling, setIsPolling] = useState(true);
  
  const statsQuery = useQuery<DashboardStats>(
    'dashboard-stats-realtime',
    async () => {
      const response = await apiClient.get('/profile/stats');
      return response.data.data;
    },
    {
      enabled: isPolling,
      refetchInterval: interval,
      refetchIntervalInBackground: true,
      onError: (error: any) => {
        console.error('Failed to fetch real-time stats:', error);
        setIsPolling(false); // Stop polling on error
      },
    }
  );

  const notificationsQuery = useQuery<{ notifications: Notification[] }>(
    'notifications-realtime',
    async () => {
      const response = await apiClient.get('/profile/notifications?limit=5&page=1');
      return response.data.data;
    },
    {
      enabled: isPolling,
      refetchInterval: interval,
      refetchIntervalInBackground: true,
      onError: (error: any) => {
        console.error('Failed to fetch real-time notifications:', error);
      },
    }
  );

  return {
    stats: statsQuery.data,
    notifications: notificationsQuery.data?.notifications || [],
    isLoading: statsQuery.isLoading || notificationsQuery.isLoading,
    error: statsQuery.error || notificationsQuery.error,
    startPolling: () => setIsPolling(true),
    stopPolling: () => setIsPolling(false),
    isPolling,
  };
};

// Utility functions
export const formatApplicationType = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'IDENTIFICATION_LETTER': 'Identification Letter',
    'BIRTH_CERTIFICATE': 'Birth Certificate',
    'HEALTH_APPOINTMENT': 'Health Appointment',
    'BUSINESS_REGISTRATION': 'Business Registration',
    'VEHICLE_REGISTRATION': 'Vehicle Registration',
    'COMPLAINT': 'Complaint',
    'EDUCATION_APPLICATION': 'Education Application',
    'HOUSING_APPLICATION': 'Housing Application',
  };
  return typeMap[type] || type;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};