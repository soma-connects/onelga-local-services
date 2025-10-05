import React, { useState } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Fade,
  Zoom,
  Skeleton,
  Alert,
  Tooltip,
  Breadcrumbs,
  Link,
  Chip,
  Tab,
  Tabs,
  Paper,
  TablePagination,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People,
  TrendingUp,
  Speed,
  Settings,
  Refresh,
  MoreVert,
  NavigateNext,
  Assessment,
  AdminPanelSettings,
  ManageAccounts,
  Backup,
  MonitorHeart,
  Group,
  Search,
  Analytics,
  Visibility,
  Description,
  Schedule,
  Update,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { adminAPI, documentsAPI } from '../services/api';
import UserTable from '../components/dashboard/UserTable';
import ConfirmationDialog from '../components/ConfirmationDialog';
import UserEditModal from '../components/dashboard/UserEditModal';

// Import our components
import {
  MetricCard,
  SectionHeader,
} from '../components/dashboard/DashboardComponents';
import {
  GaugeChart,
} from '../components/dashboard/AdvancedCharts';
import {
  NotificationIcon,
  NotificationPanel,
} from '../components/dashboard/NotificationSystem';

// System metrics placeholders (hide if not provided by backend)
const SYSTEM_METRICS = { uptime: '', responseTime: '' };
const SYSTEM_ALERTS: Array<{ id: number; type: string; title: string; description: string; time: string; severity: string }> = [];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ModernAdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(2); // Default to User Management tab

  // State for applications table
  const [appPage, setAppPage] = useState(0);
  const [appRowsPerPage, setAppRowsPerPage] = useState(10);
  const [appType, setAppType] = useState<string>('');
  const [appStatus, setAppStatus] = useState<string>('');

  // State for user table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // State for dialogs
  const [dialogState, setDialogState] = useState({ open: false, action: '', user: null as any });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null as any);

  // Fetch data using react-query
  const { data: usersData, isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useQuery(
    ['users', page, rowsPerPage, search],
    () => adminAPI.getUsers({ page: page + 1, limit: rowsPerPage, search }),
    { keepPreviousData: true }
  );

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery('adminStats', adminAPI.getDashboardStats);

  // Admin applications list
  const { data: adminApps, isLoading: appsLoading, refetch: refetchApps } = useQuery(
    ['adminApplications', appPage, appRowsPerPage, appType, appStatus],
    () => adminAPI.getApplications({ page: appPage + 1, limit: appRowsPerPage, type: appType || undefined, status: appStatus || undefined }),
    { keepPreviousData: true }
  );

  // Mutations for user actions
  const suspendUserMutation = useMutation(
    ({ userId, reason }: { userId: string; reason: string }) => adminAPI.suspendUser(userId, reason),
    {
      onSuccess: () => {
        toast.success('User suspended successfully');
        queryClient.invalidateQueries('users');
        setDialogState({ open: false, action: '', user: null });
      },
      onError: () => {
        toast.error('Failed to suspend user');
      },
    }
  );

  const reactivateUserMutation = useMutation(
    ({ userId }: { userId: string }) => adminAPI.reactivateUser(userId),
    {
      onSuccess: () => {
        toast.success('User reactivated successfully');
        queryClient.invalidateQueries('users');
        setDialogState({ open: false, action: '', user: null });
      },
      onError: () => {
        toast.error('Failed to reactivate user');
      },
    }
  );

  const updateUserMutation = useMutation(
    ({ userId, userData }: { userId: string; userData: any }) => adminAPI.updateUser(userId, userData),
    {
      onSuccess: () => {
        toast.success('User updated successfully');
        queryClient.invalidateQueries('users');
        setEditModalOpen(false);
      },
      onError: () => {
        toast.error('Failed to update user');
      },
    }
  );

  const deleteUserMutation = useMutation(
    (userId: string) => adminAPI.deleteUser(userId),
    {
      onSuccess: () => {
        toast.success('User deleted successfully');
        queryClient.invalidateQueries('users');
        setDialogState({ open: false, action: '', user: null });
      },
      onError: () => {
        toast.error('Failed to delete user');
      },
    }
  );

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchUsers(), refetchApps()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const handleSuspendUser = (user: any) => {
    setDialogState({ open: true, action: 'suspend', user });
  };

  const handleActivateUser = (user: any) => {
    setDialogState({ open: true, action: 'activate', user });
  };

  const handleDeleteUser = (user: any) => {
    setDialogState({ open: true, action: 'delete', user });
  };

  const handleConfirmAction = () => {
    if (dialogState.action === 'suspend') {
      suspendUserMutation.mutate({ userId: dialogState.user.id, reason: 'Suspended by admin' });
    } else if (dialogState.action === 'activate') {
      reactivateUserMutation.mutate({ userId: dialogState.user.id });
    } else if (dialogState.action === 'delete') {
      deleteUserMutation.mutate(dialogState.user.id);
    }
  };

  const handleSaveUser = (data: any) => {
    if (editingUser) {
      updateUserMutation.mutate({ userId: editingUser.id, userData: data });
    }
  };

  // Application details dialog state
  const [appDetailsOpen, setAppDetailsOpen] = useState(false);
  const [appDetails, setAppDetails] = useState<any>(null);
  const [appDetailsLoading, setAppDetailsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; url?: string; mimeType?: string }>>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  const handleOpenAppDetails = async (appId: string) => {
    try {
      setAppDetailsLoading(true);
      const res = await adminAPI.getApplication(appId);
      setAppDetails(res.data || res);
      setAppDetailsOpen(true);
      setAttachments([]);
    } catch (e) {
      toast.error('Failed to load application details');
    } finally {
      setAppDetailsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED') => {
    if (!appDetails?.id) return;
    try {
      await adminAPI.updateApplicationStatus(appDetails.id, status);
      toast.success(`Status updated to ${status}`);
      setAppDetails({ ...appDetails, status });
      queryClient.invalidateQueries('adminApplications');
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  if (statsLoading) {
    return <Container maxWidth="xl" sx={{ py: 4 }}><Skeleton variant="rectangular" height={400} /></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
            <Link color="inherit" href="/" underline="hover">Home</Link>
            <Typography color="text.primary">{t('adminDashboard.title')}</Typography>
          </Breadcrumbs>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h3" component="h1" fontWeight="bold">{t('adminDashboard.title')}</Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {t('adminDashboard.subtitle')}
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
{SYSTEM_METRICS.uptime && <Chip icon={<MonitorHeart />} label={`Uptime: ${SYSTEM_METRICS.uptime}`} color="success" variant="outlined" />}
{SYSTEM_METRICS.responseTime && <Chip icon={<Speed />} label={`Response: ${SYSTEM_METRICS.responseTime}`} color="primary" variant="outlined" />}
<Chip icon={<People />} label={`${stats?.data?.totalUsers || 0} Active Users`} color="info" variant="outlined" />
                <Chip icon={<AssignmentIcon />} label={`${stats?.data?.pendingApplications || 0} Pending Apps`} color="warning" variant="outlined" />
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <NotificationIcon onClick={(e) => setNotificationAnchor(e.currentTarget)} unreadCount={SYSTEM_ALERTS.length} />
              <Tooltip title="Refresh Data"><IconButton onClick={handleRefresh} disabled={refreshing}><Refresh /></IconButton></Tooltip>
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}><MoreVert /></IconButton>
            </Stack>
          </Box>
        </Box>
      </Fade>

      <Zoom in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <SectionHeader title="System Health" subtitle="Real-time system performance and resource monitoring" icon={MonitorHeart} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}><MetricCard title="Total Users" value={stats?.data?.totalUsers || 0} icon={People} color="#1976d2" /></Grid>
            <Grid item xs={12} sm={6} md={3}><MetricCard title="Total Applications" value={stats?.data?.totalApplications || 0} icon={AssignmentIcon} color="#2e7d32" /></Grid>
            <Grid item xs={12} sm={6} md={3}><MetricCard title="Pending Applications" value={stats?.data?.pendingApplications || 0} icon={Speed} color="#ed6c02" /></Grid>
            <Grid item xs={12} sm={6} md={3}><MetricCard title="Services Offered" value={stats?.data?.serviceCount || 0} icon={TrendingUp} color="#0288d1" /></Grid>
          </Grid>
        </Box>
      </Zoom>

{stats?.data?.system && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {typeof stats?.data?.system.cpuUsage === 'number' && (
            <Grid item xs={12} md={4}><GaugeChart title="CPU Usage" value={stats.data.system.cpuUsage} max={100} suffix="%" color="#2e7d2" height={200} /></Grid>
          )}
          {typeof stats?.data?.system.memoryUsage === 'number' && (
            <Grid item xs={12} md={4}><GaugeChart title="Memory Usage" value={stats.data.system.memoryUsage} max={100} suffix="%" color="#ed6c02" height={200} /></Grid>
          )}
          {typeof stats?.data?.system.storageUsage === 'number' && (
            <Grid item xs={12} md={4}><GaugeChart title="Storage Usage" value={stats.data.system.storageUsage} max={100} suffix="%" color="#1976d2" height={200} /></Grid>
          )}
        </Grid>
      )}

      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ px: 2 }}>
            <Tab icon={<Analytics />} label="Analytics" />
            <Tab icon={<AssignmentIcon />} label="Applications" />
            <Tab icon={<ManageAccounts />} label={t('adminDashboard.userManagement.title')} />
            <Tab icon={<Settings />} label="System Settings" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}><Typography>Analytics content goes here.</Typography></TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <SectionHeader title="All Applications" subtitle="View and manage all service applications" icon={AssignmentIcon} />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Filter by Type" placeholder="e.g., HOUSING_APPLICATION" value={appType} onChange={(e) => { setAppType(e.target.value); setAppPage(0); }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Filter by Status" placeholder="PENDING/APPROVED/REJECTED/COMPLETED/UNDER_REVIEW" value={appStatus} onChange={(e) => { setAppStatus(e.target.value.toUpperCase()); setAppPage(0); }} />
              </Grid>
            </Grid>
            {appsLoading && <Skeleton variant="rectangular" height={300} />}
            {!appsLoading && (!adminApps?.data?.applications || adminApps.data.applications.length === 0) && (
              <Alert severity="info">No applications found.</Alert>
            )}
            {!appsLoading && adminApps?.data?.applications && (
              <Box sx={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Type</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>User</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Created</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminApps.data.applications.map((app: any) => (
                      <tr key={app.id} style={{ borderTop: '1px solid #eee' }}>
                        <td style={{ padding: 8, fontFamily: 'monospace' }}>{app.id}</td>
                        <td style={{ padding: 8 }}>{app.type}</td>
                        <td style={{ padding: 8 }}><Chip size="small" label={app.status} color={app.status === 'APPROVED' ? 'success' : app.status === 'PENDING' ? 'warning' : app.status === 'REJECTED' ? 'error' : 'default'} /></td>
                        <td style={{ padding: 8 }}>{app.user ? `${app.user.firstName} ${app.user.lastName}` : '-'}</td>
                        <td style={{ padding: 8 }}>{new Date(app.createdAt).toLocaleString()}</td>
                        <td style={{ padding: 8 }}>
                          <Tooltip title="View Details"><IconButton onClick={() => handleOpenAppDetails(app.id)}><Visibility fontSize="small" /></IconButton></Tooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <TablePagination
                  component="div"
                  count={adminApps?.data?.pagination?.total || 0}
                  page={appPage}
                  rowsPerPage={appRowsPerPage}
                  onPageChange={(_, newPage) => setAppPage(newPage)}
                  onRowsPerPageChange={(e) => { setAppRowsPerPage(parseInt(e.target.value, 10)); setAppPage(0); }}
                />
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <SectionHeader title={t('adminDashboard.userManagement.title')} subtitle={t('adminDashboard.userManagement.subtitle')} icon={Group} />
            <Box sx={{ mb: 2 }}>
              <TextField fullWidth variant="outlined" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
            </Box>
            {usersLoading && <Skeleton variant="rectangular" height={300} />}
            {usersError && <Alert severity="error">Failed to load users.</Alert>}
            {usersData && (
              <>
                <UserTable users={usersData.data?.users || []} onEdit={handleEditUser} onSuspend={handleSuspendUser} onActivate={handleActivateUser} onDelete={handleDeleteUser} />
                <TablePagination component="div" count={usersData.data?.pagination?.total || 0} page={page} rowsPerPage={rowsPerPage} onPageChange={(_, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
              </>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}><Typography>System settings content goes here.</Typography></TabPanel>
      </Paper>

      <NotificationPanel anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={() => setNotificationAnchor(null)} />

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => navigate('/admin/settings')}><Settings sx={{ mr: 2 }} /> System Settings</MenuItem>
        <MenuItem onClick={() => navigate('/admin/users')}><ManageAccounts sx={{ mr: 2 }} /> User Management</MenuItem>
        <MenuItem onClick={() => navigate('/admin/reports')}><Assessment sx={{ mr: 2 }} /> Generate Reports</MenuItem>
        <MenuItem onClick={() => {}}><Backup sx={{ mr: 2 }} /> System Backup</MenuItem>
      </Menu>

      <ConfirmationDialog
        open={dialogState.open}
        title={`Confirm ${dialogState.action}`}
        message={`Are you sure you want to ${dialogState.action} this user: ${dialogState.user?.firstName} ${dialogState.user?.lastName}? This action cannot be undone.`}
        onConfirm={handleConfirmAction}
        onCancel={() => setDialogState({ open: false, action: '', user: null })}
        confirmText={dialogState.action}
      />

      {editingUser && (
        <UserEditModal
          open={editModalOpen}
          user={editingUser}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveUser}
          loading={updateUserMutation.isLoading}
        />
      )}

      {/* Application Details Dialog */}
      <Dialog open={appDetailsOpen} onClose={() => setAppDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent dividers>
          {appDetailsLoading && <Skeleton variant="rectangular" height={200} />}
          {!appDetailsLoading && appDetails && (
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Chip label={appDetails.type} color="info" size="small" />
                <Chip label={appDetails.status} color={appDetails.status === 'APPROVED' ? 'success' : appDetails.status === 'PENDING' ? 'warning' : appDetails.status === 'REJECTED' ? 'error' : 'default'} size="small" />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>ID: {appDetails.id}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Created: {new Date(appDetails.createdAt).toLocaleString()}</Typography>
              {appDetails.user && (
                <Typography variant="body2" sx={{ mb: 2 }}>User: {appDetails.user.firstName} {appDetails.user.lastName} ({appDetails.user.email})</Typography>
              )}
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Data</Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto', mb: 2 }}>
                <pre style={{ margin: 0 }}>{
                  (() => {
                    try {
                      const d = typeof appDetails.data === 'string' ? JSON.parse(appDetails.data) : appDetails.data;
                      return JSON.stringify(d, null, 2);
                    } catch {
                      return String(appDetails.data || '');
                    }
                  })()
                }</pre>
              </Paper>

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Attachments</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button size="small" variant="outlined" disabled={loadingAttachments} onClick={async () => {
                  try {
                    setLoadingAttachments(true);
                    const results: Array<{ id: string; name: string; url?: string; mimeType?: string }> = [];

                    // Prefer documents relation if available from backend
                    const relatedDocs = Array.isArray(appDetails?.documents) ? appDetails.documents : [];
                    if (relatedDocs.length > 0) {
                      for (const doc of relatedDocs) {
                        try {
                          const info = await documentsAPI.getDownloadInfo(doc.id);
                          const payload: any = (info as any).data || info;
                          results.push({ id: doc.id, name: payload.name || doc.name, url: payload.downloadUrl, mimeType: payload.mimeType || doc.mimeType });
                        } catch (e) {
                          results.push({ id: doc.id, name: doc.name || 'Unknown' });
                        }
                      }
                    } else {
                      // Fallback: use legacy data.documents (array of document IDs stored in application.data)
                      const d = typeof appDetails.data === 'string' ? JSON.parse(appDetails.data) : appDetails.data;
                      const docs: string[] = Array.isArray(d?.documents) ? d.documents : [];
                      for (const id of docs) {
                        try {
                          const info = await documentsAPI.getDownloadInfo(id);
                          const payload: any = (info as any).data || info;
                          results.push({ id, name: payload.name, url: payload.downloadUrl, mimeType: payload.mimeType });
                        } catch (e) {
                          results.push({ id, name: 'Unknown' });
                        }
                      }
                    }

                    setAttachments(results);
                  } catch {
                    toast.error('Failed to load attachments');
                  } finally {
                    setLoadingAttachments(false);
                  }
                }}>Load Attachments</Button>
              </Stack>
              {attachments.length > 0 ? (
                <List dense>
                  {attachments.map((a) => (
                    <ListItem key={a.id} sx={{ py: 0 }}>
                      <ListItemIcon><Description /></ListItemIcon>
                      <ListItemText primary={a.name} secondary={a.id} />
                      {a.url && (
                        <Button size="small" href={a.url} target="_blank" rel="noopener noreferrer">Download</Button>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No attachments loaded.</Typography>
              )}

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Timeline</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Schedule /></ListItemIcon>
                  <ListItemText primary={`Created at ${new Date(appDetails.createdAt).toLocaleString()}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Update /></ListItemIcon>
                  <ListItemText primary={`Last updated at ${new Date(appDetails.updatedAt).toLocaleString()}`} />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={1} sx={{ mr: 'auto', pl: 2 }}>
            <Button size="small" onClick={() => handleUpdateStatus('PENDING')}>Mark Pending</Button>
            <Button size="small" onClick={() => handleUpdateStatus('UNDER_REVIEW')}>Under Review</Button>
            <Button size="small" color="success" onClick={() => handleUpdateStatus('APPROVED')}>Approve</Button>
            <Button size="small" color="error" onClick={() => handleUpdateStatus('REJECTED')}>Reject</Button>
            <Button size="small" color="primary" onClick={() => handleUpdateStatus('COMPLETED')}>Complete</Button>
          </Stack>
          <Button onClick={() => setAppDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ModernAdminDashboard;
