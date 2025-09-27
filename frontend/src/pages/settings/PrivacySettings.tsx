
import React from 'react';
import { Card, CardHeader, CardContent, FormControlLabel, Switch, Stack, CircularProgress } from '@mui/material';
import { useSettings } from '../../contexts/SettingsContext';

const PrivacySettings: React.FC = () => {
  const { state, updatePrivacySettings } = useSettings();
  const { privacySettings, isSaving } = state;

  return (
    <Card>
      <CardHeader title="Privacy" />
      <CardContent>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={!!privacySettings.profileVisibility && privacySettings.profileVisibility === 'public'}
                onChange={e => updatePrivacySettings({ profileVisibility: e.target.checked ? 'public' : 'private' })}
                disabled={isSaving}
              />
            }
            label="Profile Visibility (Public)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!privacySettings.dataSharing}
                onChange={e => updatePrivacySettings({ dataSharing: e.target.checked })}
                disabled={isSaving}
              />
            }
            label="Data Sharing"
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!privacySettings.analyticsOptOut}
                onChange={e => updatePrivacySettings({ analyticsOptOut: e.target.checked })}
                disabled={isSaving}
              />
            }
            label="Analytics Opt-Out"
          />
          {isSaving && <CircularProgress size={20} />}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
