
import React from 'react';
import { Card, CardHeader, CardContent, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch, Stack, CircularProgress } from '@mui/material';
import { useSettings } from '../../contexts/SettingsContext';

const AppearanceSettings: React.FC = () => {
  const { state, updateUserSettings } = useSettings();
  const { userSettings, isSaving } = state;

  return (
    <Card>
      <CardHeader title="Appearance" />
      <CardContent>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Theme</InputLabel>
            <Select
              value={userSettings.theme}
              onChange={e => updateUserSettings({ theme: e.target.value as any })}
              label="Theme"
              disabled={isSaving}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Font Size</InputLabel>
            <Select
              value={userSettings.fontSize}
              onChange={e => updateUserSettings({ fontSize: e.target.value as any })}
              label="Font Size"
              disabled={isSaving}
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={!!userSettings.compactMode}
                onChange={e => updateUserSettings({ compactMode: e.target.checked })}
                disabled={isSaving}
              />
            }
            label="Compact Mode"
          />
          {isSaving && <CircularProgress size={20} />}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
