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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { adminAPI } from '../services/api';
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

// Mock data for admin features
const SYSTEM_METRICS = {
  uptime: '99.9%',
  responseTime: '120ms',
};

const SYSTEM_ALERTS = [
  { id: 1, type: 'warning', title: 'High memory usage', description: 'Memory usage is above 80%', time: '5 min ago', severity: 'medium' },
  { id: 2, type: 'info', title: 'Backup completed', description: 'Daily backup completed successfully', time: '1 hour ago', severity: 'low' },
];

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
  const [tabValue, setTabValue] = useState(1); // Default to User Management tab

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
      await Promise.all([refetchStats(), refetchUsers()]);
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
                <Chip icon={<MonitorHeart />} label={`Uptime: ${SYSTEM_METRICS.uptime}`} color="success" variant="outlined" />
                <Chip icon={<Speed />} label={`Response: ${SYSTEM_METRICS.responseTime}`} color="primary" variant="outlined" />
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}><GaugeChart title="CPU Usage" value={45} max={100} suffix="%" color="#2e7d32" height={200} /></Grid>
        <Grid item xs={12} md={4}><GaugeChart title="Memory Usage" value={68} max={100} suffix="%" color="#ed6c02" height={200} /></Grid>
        <Grid item xs={12} md={4}><GaugeChart title="Storage Usage" value={75} max={100} suffix="%" color="#1976d2" height={200} /></Grid>
      </Grid>

      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ px: 2 }}>
            <Tab icon={<Analytics />} label="Analytics" />
            <Tab icon={<ManageAccounts />} label={t('adminDashboard.userManagement.title')} />
            <Tab icon={<Settings />} label="System Settings" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}><Typography>Analytics content goes here.</Typography></TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <SectionHeader title={t('adminDashboard.userManagement.title')} subtitle={t('adminDashboard.userManagement.subtitle')} icon={Group} />
            <Box sx={{ mb: 2 }}>
              <TextField fullWidth variant="outlined" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
            </Box>
            {usersLoading && <Skeleton variant="rectangular" height={300} />}
            {usersError && <Alert severity="error">Failed to load users.</Alert>}
            {usersData && (
              <>
                <UserTable users={usersData.data || []} onEdit={handleEditUser} onSuspend={handleSuspendUser} onActivate={handleActivateUser} onDelete={handleDeleteUser} />
                <TablePagination component="div" count={usersData.pagination?.total || 0} page={page} rowsPerPage={rowsPerPage} onPageChange={(_, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
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
        content={`Are you sure you want to ${dialogState.action} this user: ${dialogState.user?.firstName} ${dialogState.user?.lastName}? This action cannot be undone.`}
        onConfirm={handleConfirmAction}
        onClose={() => setDialogState({ open: false, action: '', user: null })}
        loading={suspendUserMutation.isLoading || reactivateUserMutation.isLoading || deleteUserMutation.isLoading}
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
    </Container>
  );
};

export default ModernAdminDashboard;
