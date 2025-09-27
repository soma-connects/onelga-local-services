
import React from 'react';
import { Card, CardHeader, CardContent, FormControlLabel, Switch, Stack, CircularProgress } from '@mui/material';
import { useSettings } from '../../contexts/SettingsContext';

const NotificationSettings: React.FC = () => {
  const { state, updateNotificationSettings } = useSettings();
  const { notificationSettings, isSaving } = state;

  return (
    <Card>
      <CardHeader title="Notifications" />
      <CardContent>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={!!notificationSettings.emailNotifications}
                onChange={e => updateNotificationSettings({ emailNotifications: e.target.checked })}
                disabled={isSaving}
              />
            }
            label="Email Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!notificationSettings.smsNotifications}
                onChange={e => updateNotificationSettings({ smsNotifications: e.target.checked })}
                disabled={isSaving}
              />
            }
            label="SMS Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!notificationSettings.pushNotifications}
                onChange={e => updateNotificationSettings({ pushNotifications: e.target.checked })}
                disabled={isSaving}
              />
            }
            label="Push Notifications"
          />
          {isSaving && <CircularProgress size={20} />}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
