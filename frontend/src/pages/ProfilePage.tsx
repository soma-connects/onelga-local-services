import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  CircularProgress,
  Skeleton,
  Badge,
  Tooltip,
  Stack,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Download,
  Security,
  Visibility,
  VisibilityOff,
  Description,
  History,
  Settings,
  Notifications,
  Language,
  Lock,
  Verified,
  Warning,
  Info,
  ExpandMore,
  PhotoCamera,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Badge as BadgeIcon,
  Work,
  AdminPanelSettings,
  AccountBalance,
  Shield,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateUserProfile, updateUserProfileReducer } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { profileService, UserDocument, ActivityLog, NotificationPreference, UpdateProfileData, ChangePasswordData } from '../services/profileApi';

// Utility functions for date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface NotificationPreferenceWithDescription extends NotificationPreference {
  description: string;
}

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferenceWithDescription[]>([]);
  const [passwordVerification, setPasswordVerification] = useState('');
  const [profileStats, setProfileStats] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [securityDialog, setSecurityDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentUploadDialog, setDocumentUploadDialog] = useState(false);
  const [newDocumentForm, setNewDocumentForm] = useState({
    name: '',
    type: '',
    file: null as File | null,
  });

  // Load user data and related information
  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        // Load profile data in parallel
        const [documentsData, activityData, preferencesData, statsData] = await Promise.all([
          profileService.getDocuments().catch(() => []), // Default to empty array
          profileService.getActivityLogs(1, 10).catch(() => ({ logs: [] })), // Default to empty logs
          profileService.getNotificationPreferences().catch(() => []), // Default to empty array
          profileService.getProfileStats().catch(() => null), // Optional stats
        ]);

        setDocuments(documentsData || []);
        setActivityLogs(activityData?.logs || []);
        
        // Map preferences to include descriptions
        const preferencesWithDescriptions: NotificationPreferenceWithDescription[] = (preferencesData || []).map(pref => {
          const descriptions: Record<string, string> = {
            application_updates: 'Get notified about application status changes',
            payment_reminders: 'Receive payment due date reminders',
            system_announcements: 'Important system updates and announcements',
            document_expiry: 'Get alerted before your documents expire',
            service_updates: 'Updates about service availability and changes',
            account_security: 'Security alerts and login notifications',
          };
          
          return {
            ...pref,
            description: descriptions[pref.type] || pref.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          };
        });
        
        setNotificationPreferences(preferencesWithDescriptions);
        setProfileStats(statsData);

      } catch (error: any) {
        console.error('Failed to load profile data:', error);
        toast.error(error.response?.data?.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || '',
        dateOfBirth: user?.dateOfBirth || '',
      });
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updateData: UpdateProfileData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
        dateOfBirth: editForm.dateOfBirth,
      };
      
      const updatedUser = await profileService.updateProfile(updateData);
      
      dispatch(updateUserProfileReducer({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        dateOfBirth: updatedUser.dateOfBirth,
      }));

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const changeData: ChangePasswordData = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };
      
      await profileService.changePassword(changeData);
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSecurityDialog(false);
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Failed to update password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentDownload = async (document: UserDocument) => {
    // Require re-authentication for sensitive actions
    setSelectedDocument(document);
    setVerificationDialog(true);
  };

  const confirmDocumentDownload = async () => {
    if (!selectedDocument || !passwordVerification) return;

    setLoading(true);
    try {
      // Verify password first
      const verificationResult = await profileService.verifyPassword(passwordVerification);
      if (!verificationResult.valid) {
        toast.error('Invalid password');
        return;
      }

      // Download the document
      const blob = await profileService.downloadDocument(selectedDocument.id, passwordVerification);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = selectedDocument.name;
      link.click();
      window.URL.revokeObjectURL(url);

      setVerificationDialog(false);
      setSelectedDocument(null);
      setPasswordVerification('');
      toast.success('Document downloaded successfully');
    } catch (error: any) {
      console.error('Failed to download document:', error);
      toast.error(error.response?.data?.message || 'Failed to download document');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPreferenceChange = async (
    type: string,
    channel: 'email' | 'sms' | 'push',
    value: boolean
  ) => {
    try {
      // Update local state immediately for better UX
      setNotificationPreferences(prev =>
        prev.map(pref =>
          pref.type === type ? { ...pref, [channel]: value } : pref
        )
      );

      // Prepare preferences for API (without description field)
      const updatedPreferences = notificationPreferences.map(pref => {
        const updatedPref = pref.type === type ? { ...pref, [channel]: value } : pref;
        return {
          type: updatedPref.type,
          email: updatedPref.email,
          sms: updatedPref.sms,
          push: updatedPref.push,
        };
      });

      // Save to backend
      await profileService.updateNotificationPreferences(updatedPreferences);
      toast.success('Notification preferences updated');
    } catch (error: any) {
      console.error('Failed to update notification preferences:', error);
      toast.error('Failed to update notification preferences');
      
      // Revert the change on error
      setNotificationPreferences(prev =>
        prev.map(pref =>
          pref.type === type ? { ...pref, [channel]: !value } : pref
        )
      );
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image file size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      const result = await profileService.uploadProfilePicture(file);
      
      // Reload profile data to get the updated profile picture
      const updatedProfile = await profileService.getProfile();
      
      // Update Redux store with complete updated profile
      dispatch(updateUserProfileReducer({
        profilePicture: result.data.profilePictureUrl || updatedProfile.profilePicture
      }));
      
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!newDocumentForm.file || !newDocumentForm.name || !newDocumentForm.type) {
      toast.error('Please fill in all fields and select a file');
      return;
    }

    // Validate file size (10MB limit)
    if (newDocumentForm.file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingDocument(true);
    try {
      const newDocument = await profileService.uploadDocument(
        newDocumentForm.file,
        newDocumentForm.type,
        newDocumentForm.name
      );

      // Add new document to the list
      setDocuments(prev => [...prev, newDocument]);
      
      // Reset form and close dialog
      setNewDocumentForm({ name: '', type: '', file: null });
      setDocumentUploadDialog(false);
      
      toast.success('Document uploaded successfully');
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDocumentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewDocumentForm(prev => ({ ...prev, file }));
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      verified: { color: 'success' as const, label: 'Verified' },
      pending: { color: 'warning' as const, label: 'Pending' },
      rejected: { color: 'error' as const, label: 'Rejected' },
      active: { color: 'success' as const, label: 'Active' },
      suspended: { color: 'error' as const, label: 'Suspended' },
      inactive: { color: 'default' as const, label: 'Inactive' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'official':
        return <AccountBalance />;
      default:
        return <Person />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          User not found. Please log in again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
                src={user.profilePicture ? `http://localhost:5000${user.profilePicture}` : undefined}
              >
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleProfilePictureUpload}
                disabled={uploadingPicture}
              />
              <label htmlFor="profile-picture-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    width: 40,
                    height: 40,
                  }}
                  disabled={uploadingPicture}
                >
                  {uploadingPicture ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    <PhotoCamera fontSize="small" />
                  )}
                </IconButton>
              </label>
            </Box>
          </Grid>
          <Grid item xs>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" component="h1">
                  {user.firstName} {user.lastName}
                </Typography>
                {user.isVerified && (
                  <Tooltip title="Verified Account">
                    <Verified color="primary" />
                  </Tooltip>
                )}
                {getRoleIcon(user.role)}
              </Box>
              
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  color="primary"
                  variant="outlined"
                />
                {getStatusChip(user.status)}
                {user.department && (
                  <Chip 
                    label={user.department}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>

              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              
              {user.phoneNumber && (
                <Typography variant="body2" color="text.secondary">
                  {user.phoneNumber}
                </Typography>
              )}
              
              {user.lastLogin && (
                <Typography variant="body2" color="text.secondary">
                  Last login: {formatDateTime(user.lastLogin)}
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item>
            <Stack spacing={1}>
              <Button
                variant={isEditing ? "outlined" : "contained"}
                startIcon={isEditing ? <Cancel /> : <Edit />}
                onClick={handleEditToggle}
                disabled={loading}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              {isEditing && (
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Profile Tabs */}
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="profile tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Person />} label="Personal Info" />
            <Tab icon={<Description />} label="Documents" />
            <Tab icon={<History />} label="Activity" />
            <Tab icon={<Notifications />} label="Preferences" />
            <Tab icon={<Security />} label="Security" />
          </Tabs>
        </Box>

        {/* Personal Information Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={editForm.email}
                        disabled={true} // Email usually cannot be changed
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={!isEditing}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        multiline
                        rows={3}
                        value={editForm.address}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <BadgeIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="User ID" 
                        secondary={user.id}
                      />
                    </ListItem>
                    {user.employeeId && (
                      <ListItem>
                        <ListItemIcon>
                          <Work />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Employee ID" 
                          secondary={user.employeeId}
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemIcon>
                        <Shield />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Account Status" 
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            {getStatusChip(user.status)}
                          </Box>
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Verified />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Verification Status" 
                        secondary={user.isVerified ? "Verified" : "Not Verified"}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Your Documents
              </Typography>
              <Button
                variant="contained"
                startIcon={<PhotoCamera />}
                onClick={() => setDocumentUploadDialog(true)}
              >
                Upload Document
              </Button>
            </Box>
            <Grid container spacing={2}>
              {documents.map((document) => (
                <Grid item xs={12} sm={6} md={4} key={document.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Description color="primary" />
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {document.name}
                        </Typography>
                        {getStatusChip(document.status)}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Uploaded: {formatDate(document.uploadDate)}
                      </Typography>
                      {document.expiryDate && (
                        <Typography variant="body2" color="text.secondary">
                          Expires: {formatDate(document.expiryDate)}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<Visibility />}
                        disabled={document.status === 'pending'}
                      >
                        View
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<Download />}
                        onClick={() => handleDocumentDownload(document)}
                        disabled={document.status !== 'verified'}
                      >
                        Download
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Activity Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Notification Preferences Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Grid container spacing={3}>
              {notificationPreferences.map((pref) => (
                <Grid item xs={12} key={pref.type}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {pref.description}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={pref.email}
                                onChange={(e) => 
                                  handleNotificationPreferenceChange(pref.type, 'email', e.target.checked)
                                }
                              />
                            }
                            label="Email"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={pref.sms}
                                onChange={(e) => 
                                  handleNotificationPreferenceChange(pref.type, 'sms', e.target.checked)
                                }
                              />
                            }
                            label="SMS"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={pref.push}
                                onChange={(e) => 
                                  handleNotificationPreferenceChange(pref.type, 'push', e.target.checked)
                                }
                              />
                            }
                            label="Push"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Keep your account secure with a strong password
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Lock />}
                      onClick={() => setSecurityDialog(true)}
                      fullWidth
                    >
                      Change Password
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Two-Factor Authentication
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Add an extra layer of security to your account
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Shield />}
                      fullWidth
                    >
                      Enable 2FA
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* Document Download Verification Dialog */}
      <Dialog open={verificationDialog} onClose={() => setVerificationDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            Verify Your Identity
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            For security reasons, please verify your identity before downloading sensitive documents.
          </Alert>
          <TextField
            fullWidth
            type="password"
            label="Enter your password"
            value={passwordVerification}
            onChange={(e) => setPasswordVerification(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={confirmDocumentDownload}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify & Download'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={securityDialog} onClose={() => setSecurityDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSecurityDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handlePasswordChange}
            disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={documentUploadDialog} onClose={() => setDocumentUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Name"
                value={newDocumentForm.name}
                onChange={(e) => setNewDocumentForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={newDocumentForm.type}
                  onChange={(e) => setNewDocumentForm(prev => ({ ...prev, type: e.target.value }))}
                  label="Document Type"
                >
                  <MenuItem value="identification">Identification</MenuItem>
                  <MenuItem value="birth-certificate">Birth Certificate</MenuItem>
                  <MenuItem value="transport">Transport Document</MenuItem>
                  <MenuItem value="business">Business Document</MenuItem>
                  <MenuItem value="tax">Tax Document</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<PhotoCamera />}
              >
                {newDocumentForm.file ? newDocumentForm.file.name : 'Select File'}
                <input
                  type="file"
                  hidden
                  onChange={handleDocumentFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentUploadDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleDocumentUpload}
            disabled={uploadingDocument || !newDocumentForm.file || !newDocumentForm.name || !newDocumentForm.type}
          >
            {uploadingDocument ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
