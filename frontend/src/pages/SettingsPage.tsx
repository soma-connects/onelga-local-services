import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Avatar,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Stack,
  InputAdornment,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  AccountCircle,
  Security,
  Notifications,
  PrivacyTip as Privacy,
  Palette,
  Storage,
  Warning,
  Error as ErrorIcon,
  Info,
  Edit,
  VerifiedUser,
  AccessTime,
  Key,
  Shield,
  Email,
  Phone,
  CheckCircle,
  Download,
  LightMode,
  DarkMode,
  Brightness4,
  CloudDownload,
  DataUsage,
  Archive,
  PersonRemove,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import settingsService from '../services/settingsService';
import useSettings from '../hooks/useSettings';
import { RootState } from '../types/rootState';

// Interfaces
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'warning' | 'error' | 'info';
  confirmText?: string;
}

// Tab Panel Component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Confirmation Dialog Component
function ConfirmationDialog({ open, title, message, onConfirm, onCancel, severity = 'warning', confirmText = 'Confirm' }: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {severity === 'warning' && <Warning color="warning" />}
        {severity === 'error' && <Error color="error" />}
        {severity === 'info' && <Info color="info" />}
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={severity === 'error' ? 'error' : 'primary'}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    state: { 
      userSettings, 
      notificationSettings, 
      privacySettings, 
      securitySettings,
      isLoading: loading,
      isSaving: saving 
    },
    updateUserSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updateSecuritySettings
  } = useSettings();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  
  // Dialog states
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [exportDataDialog, setExportDataDialog] = useState(false);
  const [logoutAllDialog, setLogoutAllDialog] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [enable2FADialog, setEnable2FADialog] = useState(false);
  
  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [accountDeletion, setAccountDeletion] = useState({
    reason: '',
    password: '',
    confirmation: '',
  });


  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    try {
      await settingsService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      toast.success('Password changed successfully');
      setChangePasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleEnable2FA = async () => {
    try {
      await settingsService.enable2FA();
      updateSecuritySettings({ twoFactorEnabled: true });
      toast.success('Two-factor authentication enabled');
      setEnable2FADialog(false);
    } catch (error: any) {
      console.error('Failed to enable 2FA:', error);
      toast.error(error.response?.data?.message || 'Failed to enable 2FA');
    }
  };

  const handleDisable2FA = async () => {
    try {
      await settingsService.disable2FA();
      updateSecuritySettings({ twoFactorEnabled: false });
      toast.success('Two-factor authentication disabled');
    } catch (error: any) {
      console.error('Failed to disable 2FA:', error);
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await settingsService.exportUserData();
      
      // Create and trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `onelga-user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
      setExportDataDialog(false);
    } catch (error: any) {
      console.error('Failed to export data:', error);
      toast.error(error.response?.data?.message || 'Failed to export data');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await settingsService.logoutAllDevices();
      toast.success('Logged out from all devices');
      setLogoutAllDialog(false);
      dispatch(logout());
    } catch (error: any) {
      console.error('Failed to logout from all devices:', error);
      toast.error(error.response?.data?.message || 'Failed to logout from all devices');
    }
  };

  const handleDeleteAccount = async () => {
    if (accountDeletion.confirmation !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }
    
    try {
      await settingsService.deleteAccount({
        password: accountDeletion.password,
        reason: accountDeletion.reason,
      });
      
      toast.success('Account deletion initiated. You will receive a confirmation email.');
      setDeleteAccountDialog(false);
      dispatch(logout());
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };


  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading settings...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        {/* Settings Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                icon={<AccountCircle />}
                label="Account"
                id="settings-tab-0"
                aria-controls="settings-tabpanel-0"
              />
              <Tab
                icon={<Security />}
                label="Security"
                id="settings-tab-1"
                aria-controls="settings-tabpanel-1"
              />
              <Tab
                icon={<Notifications />}
                label="Notifications"
                id="settings-tab-2"
                aria-controls="settings-tabpanel-2"
              />
              <Tab
                icon={<Privacy />}
                label="Privacy"
                id="settings-tab-3"
                aria-controls="settings-tabpanel-3"
              />
              <Tab
                icon={<Palette />}
                label="Appearance"
                id="settings-tab-4"
                aria-controls="settings-tabpanel-4"
              />
              <Tab
                icon={<Storage />}
                label="Data"
                id="settings-tab-5"
                aria-controls="settings-tabpanel-5"
              />
            </Tabs>
          </Box>

          {/* Account Settings Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {/* Profile Information */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    title="Profile Information"
                    subheader="Update your account details"
                    avatar={
                      <Avatar
                        src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : undefined}
                        sx={{ width: 56, height: 56 }}
                      >
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </Avatar>
                    }
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={user?.firstName || ''}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={user?.lastName || ''}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={user?.email || ''}
                          InputProps={{ readOnly: true }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={user?.phoneNumber || 'Not provided'}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          value={user?.address || 'Not provided'}
                          multiline
                          rows={2}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => window.location.href = '/profile'}
                        >
                          Edit Profile
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Account Status */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Account Status" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <VerifiedUser color={user?.isVerified ? 'success' : 'error'} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email Verification"
                          secondary={user?.isVerified ? 'Verified' : 'Pending verification'}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={user?.isVerified ? 'Verified' : 'Pending'}
                            color={user?.isVerified ? 'success' : 'warning'}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Badge color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Account Type"
                          secondary={user?.role || 'Not specified'}
                        />
                        <ListItemSecondaryAction>
                          <Chip label={user?.role || 'Unknown'} size="small" />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AccessTime />
                        </ListItemIcon>
                        <ListItemText
                          primary="Member Since"
                          secondary={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Language & Region */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Language & Region" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Language</InputLabel>
                          <Select
                            value={userSettings.language}
                            onChange={(e) => {
                              updateUserSettings({ language: e.target.value });
                            }}
                            label="Language"
                          >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="ig">Igbo</MenuItem>
                            <MenuItem value="ha">Hausa</MenuItem>
                            <MenuItem value="yo">Yoruba</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Time Zone</InputLabel>
                          <Select
                            value="Africa/Lagos"
                            label="Time Zone"
                            disabled
                          >
                            <MenuItem value="Africa/Lagos">West Africa Time (WAT)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Security Settings Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              {/* Password Settings */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Password & Authentication" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Key />
                        </ListItemIcon>
                        <ListItemText
                          primary="Password"
                          secondary={
                            securitySettings.passwordLastChanged
                              ? `Last changed: ${new Date(securitySettings.passwordLastChanged).toLocaleDateString()}`
                              : 'Change your password regularly for better security'
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            onClick={() => setChangePasswordDialog(true)}
                          >
                            Change Password
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <Shield />
                        </ListItemIcon>
                        <ListItemText
                          primary="Two-Factor Authentication"
                          secondary="Add an extra layer of security to your account"
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                              color={securitySettings.twoFactorEnabled ? 'success' : 'default'}
                              size="small"
                            />
                            {securitySettings.twoFactorEnabled ? (
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={handleDisable2FA}
                              >
                                Disable
                              </Button>
                            ) : (
                              <Button
                                variant="outlined"
                                onClick={() => setEnable2FADialog(true)}
                              >
                                Enable
                              </Button>
                            )}
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Session Settings */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Session Management" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <AccessTime />
                        </ListItemIcon>
                        <ListItemText
                          primary="Session Timeout"
                          secondary={`Auto-logout after ${securitySettings.sessionTimeout} minutes of inactivity`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Email />
                        </ListItemIcon>
                        <ListItemText
                          primary="Login Notifications"
                          secondary="Get notified when someone logs into your account"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={securitySettings.loginNotifications}
                        onChange={(e) => {
                          updateSecuritySettings({ loginNotifications: e.target.checked });
                        }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Active Sessions"
                          secondary="You are currently logged in on this device"
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setLogoutAllDialog(true)}
                          >
                            Logout All Devices
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Security Status */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Security Score" />
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <CircularProgress
                        variant="determinate"
                        value={75}
                        size={80}
                        thickness={4}
                      />
                      <Typography variant="h4" sx={{ mt: 1 }}>75%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Good Security
                      </Typography>
                    </Box>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Strong password" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Email verified" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Warning color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Enable 2FA for better security" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              {/* Notification Preferences */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Notification Preferences" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>Delivery Methods</Typography>
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <Email />
                            </ListItemIcon>
                            <ListItemText primary="Email Notifications" />
                            <ListItemSecondaryAction>
                              <Switch
                                checked={notificationSettings.emailNotifications}
                                onChange={(e) => {
                                  updateNotificationSettings({ emailNotifications: e.target.checked });
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Phone />
                            </ListItemIcon>
                            <ListItemText primary="SMS Notifications" />
                            <ListItemSecondaryAction>
                              <Switch
                                checked={notificationSettings.smsNotifications}
                                onChange={(e) => {
                                  updateNotificationSettings({ smsNotifications: e.target.checked });
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Notifications />
                            </ListItemIcon>
                            <ListItemText primary="Push Notifications" />
                            <ListItemSecondaryAction>
                              <Switch
                                checked={notificationSettings.pushNotifications}
                                onChange={(e) => {
                                  updateNotificationSettings({ pushNotifications: e.target.checked });
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        </List>
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>Notification Types</Typography>
                        <List>
                          <ListItem>
                            <ListItemText
                              primary="Application Updates"
                              secondary="Get notified when your applications status changes"
                            />
                            <ListItemSecondaryAction>
                              <Switch
                                checked={notificationSettings.applicationUpdates}
                                onChange={(e) => {
                                  updateNotificationSettings({ applicationUpdates: e.target.checked });
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Payment Reminders"
                              secondary="Reminders for upcoming payment due dates"
                            />
                            <ListItemSecondaryAction>
                              <Switch
                                checked={notificationSettings.paymentReminders}
                                onChange={(e) => {
                                  updateNotificationSettings({ paymentReminders: e.target.checked });
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="System Announcements"
                              secondary="Important updates about the platform"
                            />
                            <ListItemSecondaryAction>
                              <Switch
                                checked={notificationSettings.systemAnnouncements}
                                onChange={(e) => {
                                  updateNotificationSettings({ systemAnnouncements: e.target.checked });
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Document Expiry"
                              secondary="Alerts before your documents expire"
                            />
                            <ListItemSecondaryAction>
                              <Switch
                                checked={notificationSettings.documentExpiry}
                                onChange={(e) => {
                                  updateNotificationSettings({ documentExpiry: e.target.checked });
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Service Updates"
                              secondary="Updates about service availability"
                            />
                            <ListItemSecondaryAction>
                              <Switch
                                checked={notificationSettings.serviceUpdates}
                                onChange={(e) => {
                                  updateNotificationSettings({ serviceUpdates: e.target.checked });
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Account Security"
                              secondary="Security-related notifications"
                            />
                            <ListItemSecondaryAction>
                              <Switch
                                checked={notificationSettings.accountSecurity}
                                onChange={(e) => {
                                  updateNotificationSettings({ accountSecurity: e.target.checked });
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Weekly Digest"
                              secondary="Weekly summary of your account activity"
                            />
                            <ListItemSecondaryAction>
                              <Switch
                                checked={notificationSettings.weeklyDigest}
                                onChange={(e) => {
                                  updateNotificationSettings({ weeklyDigest: e.target.checked });
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quiet Hours */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Quiet Hours" />
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.quietHours.enabled}
                          onChange={(e) => {
                            updateNotificationSettings({
                              quietHours: { ...notificationSettings.quietHours, enabled: e.target.checked }
                            });
                          }}
                        />
                      }
                      label="Enable quiet hours"
                    />
                    {notificationSettings.quietHours.enabled && (
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="time"
                            label="Start Time"
                            value={notificationSettings.quietHours.start}
                            onChange={(e) => {
                              updateNotificationSettings({
                                quietHours: { ...notificationSettings.quietHours, start: e.target.value }
                              });
                            }}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="time"
                            label="End Time"
                            value={notificationSettings.quietHours.end}
                            onChange={(e) => {
                              updateNotificationSettings({
                                quietHours: { ...notificationSettings.quietHours, end: e.target.value }
                              });
                            }}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Sound Settings */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Sound Settings" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          {userSettings.soundEnabled ? <VolumeUp /> : <VolumeOff />}
                        </ListItemIcon>
                        <ListItemText
                          primary="Notification Sounds"
                          secondary="Play sounds for notifications"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={userSettings.soundEnabled}
                            onChange={(e) => {
                              updateUserSettings({ soundEnabled: e.target.checked });
                            }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Privacy Tab */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              {/* Privacy Controls */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Privacy Controls" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Profile Visibility"
                          secondary="Control who can see your profile information"
                        />
                        <ListItemSecondaryAction>
                          <FormControl>
                            <Select
                              value={privacySettings.profileVisibility}
                              onChange={(e) => {
                                updatePrivacySettings({ profileVisibility: e.target.value as any });
                              }}
                              size="small"
                            >
                              <MenuItem value="public">Public</MenuItem>
                              <MenuItem value="limited">Limited</MenuItem>
                              <MenuItem value="private">Private</MenuItem>
                            </Select>
                          </FormControl>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary="Data Sharing"
                          secondary="Share anonymized data for service improvement"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={privacySettings.dataSharing}
                            onChange={(e) => {
                              updatePrivacySettings({ dataSharing: e.target.checked });
                            }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Analytics Opt-out"
                          secondary="Opt out of usage analytics collection"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={privacySettings.analyticsOptOut}
                            onChange={(e) => {
                              updatePrivacySettings({ analyticsOptOut: e.target.checked });
                            }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Location Tracking"
                          secondary="Allow location-based services"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={privacySettings.locationTracking}
                            onChange={(e) => {
                              updatePrivacySettings({ locationTracking: e.target.checked });
                            }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Marketing Emails"
                          secondary="Receive promotional emails and updates"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={privacySettings.marketingEmails}
                            onChange={(e) => {
                              updatePrivacySettings({ marketingEmails: e.target.checked });
                            }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Third-party Integrations"
                          secondary="Allow third-party services to access your data"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={privacySettings.thirdPartyIntegrations}
                            onChange={(e) => {
                              updatePrivacySettings({ thirdPartyIntegrations: e.target.checked });
                            }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Data Rights */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Your Data Rights" />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      You have the right to access, update, and delete your personal data.
                      Learn more about how we handle your data in our Privacy Policy.
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button variant="outlined" startIcon={<Download />}>
                        Privacy Policy
                      </Button>
                      <Button variant="outlined" startIcon={<Info />}>
                        Data Usage Report
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Appearance Tab */}
          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={3}>
              {/* Theme and Display Settings: stack vertically on xs/sm screens */}
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: { xs: 2, md: 0 } }}>
                  <CardHeader title="Theme" />
                  <CardContent>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Choose your preferred theme</FormLabel>
                      <RadioGroup
                        value={userSettings.theme}
                        onChange={(e) => {
                          updateUserSettings({ theme: e.target.value as any });
                        }}
                        row={window.innerWidth >= 600 ? true : false}
                      >
                        <FormControlLabel
                          value="light"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LightMode />
                              Light
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="dark"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <DarkMode />
                              Dark
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="system"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Brightness4 />
                              System Default
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Display" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Font Size</InputLabel>
                          <Select
                            value={userSettings.fontSize}
                            onChange={(e) => {
                              updateUserSettings({ fontSize: e.target.value as any });
                            }}
                            label="Font Size"
                          >
                            <MenuItem value="small">Small</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="large">Large</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={userSettings.compactMode}
                              onChange={(e) => {
                                updateUserSettings({ compactMode: e.target.checked });
                              }}
                            />
                          }
                          label="Compact Mode"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Use smaller spacing and denser layouts
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={userSettings.autoSave}
                              onChange={(e) => {
                                updateUserSettings({ autoSave: e.target.checked });
                              }}
                            />
                          }
                          label="Auto Save"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Automatically save your work
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Data Tab */}
          <TabPanel value={activeTab} index={5}>
            <Grid container spacing={3}>
              {/* Data Management */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Data Management" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <CloudDownload />
                        </ListItemIcon>
                        <ListItemText
                          primary="Export Your Data"
                          secondary="Download a copy of all your data"
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            onClick={() => setExportDataDialog(true)}
                          >
                            Export Data
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <DataUsage />
                        </ListItemIcon>
                        <ListItemText
                          primary="Storage Usage"
                          secondary="View your current storage usage"
                        />
                        <ListItemSecondaryAction>
                          <Chip label="1.2 MB used" size="small" />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <Archive />
                        </ListItemIcon>
                        <ListItemText
                          primary="Data Retention"
                          secondary="Your data is retained according to our data policy"
                        />
                        <ListItemSecondaryAction>
                          <Button variant="outlined" size="small">
                            View Policy
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Danger Zone */}
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
                  <CardHeader
                    title="Danger Zone"
                    titleTypographyProps={{ color: 'error.main' }}
                  />
                  <CardContent>
                    <Alert severity="error" sx={{ mb: 2 }}>
                      These actions cannot be undone. Please proceed with caution.
                    </Alert>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <PersonRemove color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Delete Account"
                          secondary="Permanently delete your account and all associated data"
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setDeleteAccountDialog(true)}
                          >
                            Delete Account
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Loading Overlay */}
        {saving && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Saving changes...</Typography>
            </Paper>
          </Box>
        )}

        {/* Dialogs */}
        
        {/* Change Password Dialog */}
        <Dialog open={changePasswordDialog} onClose={() => setChangePasswordDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPasswords.current ? 'text' : 'password'}
                  label="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          edge="end"
                        >
                          {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPasswords.new ? 'text' : 'password'}
                  label="New Password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          edge="end"
                        >
                          {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPasswords.confirm ? 'text' : 'password'}
                  label="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          edge="end"
                        >
                          {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePasswordDialog(false)}>Cancel</Button>
            <Button
              onClick={handlePasswordChange}
              variant="contained"
              disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              Change Password
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enable 2FA Dialog */}
        <Dialog open={enable2FADialog} onClose={() => setEnable2FADialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogContent>
            <Typography paragraph>
              Two-factor authentication adds an extra layer of security to your account.
              You'll need an authenticator app like Google Authenticator or Authy.
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              This feature is coming soon. You'll receive an email when it's available.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEnable2FADialog(false)}>Cancel</Button>
            <Button onClick={handleEnable2FA} variant="contained">
              Enable 2FA
            </Button>
          </DialogActions>
        </Dialog>

        {/* Export Data Dialog */}
        <ConfirmationDialog
          open={exportDataDialog}
          title="Export Your Data"
          message="This will create a downloadable file containing all your account data including profile information, applications, and activity history."
          onConfirm={handleExportData}
          onCancel={() => setExportDataDialog(false)}
          severity="info"
          confirmText="Export Data"
        />

        {/* Logout All Devices Dialog */}
        <ConfirmationDialog
          open={logoutAllDialog}
          title="Logout All Devices"
          message="This will log you out from all devices including this one. You'll need to log in again."
          onConfirm={handleLogoutAll}
          onCancel={() => setLogoutAllDialog(false)}
          severity="warning"
          confirmText="Logout All"
        />

        {/* Delete Account Dialog */}
        <Dialog open={deleteAccountDialog} onClose={() => setDeleteAccountDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              This action cannot be undone. All your data will be permanently deleted.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Reason for deletion</InputLabel>
                  <Select
                    value={accountDeletion.reason}
                    onChange={(e) => setAccountDeletion(prev => ({ ...prev, reason: e.target.value }))}
                    label="Reason for deletion"
                  >
                    <MenuItem value="not_using">Not using the service</MenuItem>
                    <MenuItem value="privacy_concerns">Privacy concerns</MenuItem>
                    <MenuItem value="found_alternative">Found an alternative</MenuItem>
                    <MenuItem value="technical_issues">Technical issues</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  value={accountDeletion.password}
                  onChange={(e) => setAccountDeletion(prev => ({ ...prev, password: e.target.value }))}
                  helperText="Enter your password to confirm"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Type 'DELETE' to confirm"
                  value={accountDeletion.confirmation}
                  onChange={(e) => setAccountDeletion(prev => ({ ...prev, confirmation: e.target.value }))}
                  helperText="This confirms you understand this action cannot be undone"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteAccountDialog(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteAccount}
              variant="contained"
              color="error"
              disabled={
                !accountDeletion.reason ||
                !accountDeletion.password ||
                accountDeletion.confirmation !== 'DELETE'
              }
            >
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default SettingsPage;