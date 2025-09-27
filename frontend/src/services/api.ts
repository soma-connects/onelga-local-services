import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      const errorMessage = (data as any)?.message || 'An error occurred';
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
      toast.error('Session expired. Please login again.');
          break;
          
        case 403:
          toast.error('Access denied. You do not have permission to perform this action.');
          break;
          
        case 404:
          toast.error('Resource not found.');
          break;
          
        case 422:
          // Validation errors
          const validationErrors = (data as any)?.errors;
          if (validationErrors && Array.isArray(validationErrors)) {
            validationErrors.forEach((err: any) => {
              toast.error(err.message || 'Validation error');
            });
          } else {
            toast.error(errorMessage);
          }
          break;
          
        case 429:
      toast.error('Too many requests. Please try again later.');
          break;

        case 500:
      toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(errorMessage);
    }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Generic API methods
export const apiService = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.get(url, config);
    return response.data;
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.post(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.patch(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.delete(url, config);
    return response.data;
  },

  // File upload
  upload: async <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data;
  },
};

// Authentication API
export const authAPI = {
  // Login
  login: async (credentials: { email: string; password: string }) => {
    return apiService.post<{
      user: any;
      token: string;
    }>('/auth/login', credentials);
  },

  // Register
  register: async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  }) => {
    return apiService.post<{
      user: any;
      token: string;
    }>('/auth/register', userData);
  },

  // Get current user profile
  getProfile: async () => {
    return apiService.get<any>('/profile');
  },

  // Update profile
  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  }) => {
    return apiService.put<any>('/profile', profileData);
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return apiService.put('/profile/change-password', passwordData);
  },

  // Verify email
  verifyEmail: async (token: string) => {
    return apiService.get(`/auth/verify/${token}`);
  },

  // Logout
  logout: async () => {
    return apiService.post('/auth/logout');
  },
};

// Services API
export const servicesAPI = {
  // Get all services
  getServices: async () => {
    return apiService.get<any[]>('/services');
  },

  // Get service by ID
  getService: async (id: string) => {
    return apiService.get<any>(`/services/${id}`);
  },
};

// Applications API
export const applicationsAPI = {
  // Get user applications
  getApplications: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    
    const url = `/applications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<any[]>(url);
  },

  // Get application by ID
  getApplication: async (id: string) => {
    return apiService.get<any>(`/applications/${id}`);
  },

  // Create application
  createApplication: async (applicationData: any) => {
    return apiService.post<any>('/applications', applicationData);
  },

  // Update application
  updateApplication: async (id: string, applicationData: any) => {
    return apiService.put<any>(`/applications/${id}`, applicationData);
  },

  // Delete application
  deleteApplication: async (id: string) => {
    return apiService.delete(`/applications/${id}`);
  },

  // Get birth certificate applications
  getBirthCertificateApplications: async () => {
    return apiService.get<any[]>('/applications/birth-certificate');
  },

  // Submit birth certificate application
  submitBirthCertificateApplication: async (applicationData: any) => {
    return apiService.post<any>('/applications/birth-certificate', applicationData);
  },

  // Get identification applications
  getIdentificationApplications: async () => {
    return apiService.get<any[]>('/applications/identification');
  },

  // Submit identification application
  submitIdentificationApplication: async (applicationData: any) => {
    return apiService.post<any>('/applications/identification', applicationData);
  },
};

// Identification API
export const identificationAPI = {
  // Apply for identification letter
  apply: async (applicationData: {
    purpose: string;
    documents?: string;
  }) => {
    return apiService.post<any>('/identification/apply', applicationData);
  },

  // Get user's identification applications
  getApplications: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `/identification/applications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<any[]>(url);
  },

  // Get application by ID
  getApplication: async (id: string) => {
    return apiService.get<any>(`/identification/applications/${id}`);
  },

  // Download letter
  downloadLetter: async (id: string) => {
    return apiService.get<any>(`/identification/applications/${id}/download`);
  },
};

// Health Services API
export const healthAPI = {
  // Get health centers
  getHealthCenters: async () => {
    return apiService.get<any[]>('/health/centers');
  },

  // Book appointment
  bookAppointment: async (appointmentData: {
    healthCenterId: string;
    appointmentDate: string;
    serviceType: string;
    notes?: string;
  }) => {
    return apiService.post<any>('/health/appointments', appointmentData);
  },

  // Get user appointments
  getAppointments: async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `/health/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<any[]>(url);
  },

  // Cancel appointment
  cancelAppointment: async (id: string) => {
    return apiService.delete(`/health/appointments/${id}`);
  },
};

// Business Services API
export const businessAPI = {
  // Register business
  registerBusiness: async (businessData: {
    businessName: string;
    businessType: string;
    businessAddress: string;
    documents?: string;
  }) => {
    return apiService.post<any>('/business/register', businessData);
  },

  // Get business registrations
  getRegistrations: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `/business/registrations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<any[]>(url);
  },
};

// File Upload API
export const uploadAPI = {
  // Upload file
  uploadFile: async (file: File, serviceType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('serviceType', serviceType);
    
    return apiService.upload<any>('/upload', formData);
  },

  // Upload multiple files
  uploadFiles: async (files: File[], serviceType: string) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    formData.append('serviceType', serviceType);
    
    return apiService.upload<any>('/upload/multiple', formData);
  },
};

// Notifications API
export const notificationsAPI = {
  // Get notifications
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
    
    const url = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<any[]>(url);
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    return apiService.patch(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiService.patch('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id: string) => {
    return apiService.delete(`/notifications/${id}`);
  },
};

// Admin API
export const adminAPI = {
  // Get dashboard stats
  getDashboardStats: async () => {
    return apiService.get<any>('/admin/dashboard/stats');
  },

  // Get users
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<any[]>(url);
  },

  // Update user
  updateUser: async (id: string, userData: any) => {
    return apiService.put<any>(`/admin/users/${id}`, userData);
  },

  // Suspend user
  suspendUser: async (id: string, reason: string) => {
    return apiService.post(`/admin/users/${id}/suspend`, { reason });
  },

  // Reactivate user
  reactivateUser: async (id: string, reason?: string) => {
    return apiService.post(`/admin/users/${id}/reactivate`, { reason });
  },

  // Delete user
  deleteUser: async (userId: string) => {
    return apiService.delete(`/admin/users/${userId}`);
  },
};

export default api;
