import { apiService } from './api';

const settingsService = {
  async changePassword({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) {
    return apiService.put('/profile/change-password', { currentPassword, newPassword });
  },
  
  async enable2FA() {
    return apiService.post('/profile/2fa/enable');
  },
  
  async disable2FA() {
    return apiService.post('/profile/2fa/disable');
  },
  
  async exportUserData() {
    const response = await apiService.get('/profile/export');
    return response.data;
  },
  
  async logoutAllDevices() {
    return apiService.post('/auth/logout-all');
  },
  
  async deleteAccount({ password, reason }: { password: string; reason: string }) {
    return apiService.delete('/profile', {
      data: { password, reason }
    });
  },
  
  async getSettings() {
    return apiService.get('/settings');
  },
  
  async updateSettings(settingsType: string, settings: any) {
    return apiService.put('/settings', { type: settingsType, settings });
  },
};

export default settingsService;
