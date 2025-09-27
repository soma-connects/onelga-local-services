
import React from 'react';
import { Card, CardHeader, CardContent, Button, Stack, FormControlLabel, Switch, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useSettings } from '../../contexts/SettingsContext';

const SecuritySettings: React.FC = () => {
  const { state, updateSecuritySettings } = useSettings();
  const { securitySettings, isSaving } = state;
  const [loginHistoryOpen, setLoginHistoryOpen] = React.useState(false);
  const [devicesOpen, setDevicesOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader title="Security" />
      <CardContent>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={!!securitySettings.twoFactorEnabled}
                onChange={e => updateSecuritySettings({ twoFactorEnabled: e.target.checked })}
                disabled={isSaving}
              />
            }
            label="Two-Factor Authentication (2FA)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!securitySettings.loginNotifications}
                onChange={e => updateSecuritySettings({ loginNotifications: e.target.checked })}
                disabled={isSaving}
              />
            }
            label="Login Notifications"
          />
          <Button variant="outlined" onClick={() => setLoginHistoryOpen(true)}>View Login History</Button>
          <Button variant="outlined" onClick={() => setDevicesOpen(true)}>Manage Devices</Button>
          {isSaving && <CircularProgress size={20} />}
        </Stack>
      </CardContent>

      {/* Login History Dialog (placeholder) */}
      <Dialog open={loginHistoryOpen} onClose={() => setLoginHistoryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Login History</DialogTitle>
        <DialogContent>
          <Typography>Login history details coming soon.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginHistoryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Device Management Dialog (placeholder) */}
      <Dialog open={devicesOpen} onClose={() => setDevicesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Devices</DialogTitle>
        <DialogContent>
          <Typography>Device management coming soon.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDevicesOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SecuritySettings;
