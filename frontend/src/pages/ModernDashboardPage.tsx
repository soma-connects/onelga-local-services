import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  HealthAndSafety as HealthIcon,
  Business as BusinessIcon,
  DirectionsCar as TransportIcon,
  School as EducationIcon,
  Home as HousingIcon,
  ReportProblem as ComplaintIcon,
  ContactMail as IdentificationIcon,
  ChildCare as BirthIcon,
  TrendingUp,
  Speed,
  AccessTime,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  Payment,
  FileDownload,
  Share,
  Settings,
  Refresh,
  MoreVert,
  Launch,
  NavigateNext,
  Insights,
  Timeline,
  Assessment,
  Notifications,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Import our new components
import {
  MetricCard,
  StatusBadge,
  ModernListItem,
  ProgressCard,
  QuickActionCard,
  SectionHeader,
} from '../components/dashboard/DashboardComponents';
import {
  AdvancedLineChart,
  AdvancedPieChart,
  GaugeChart,
} from '../components/dashboard/AdvancedCharts';
import {
  NotificationIcon,
  NotificationPanel,
} from '../components/dashboard/NotificationSystem';
import {
  useDashboardStats,
  useApplications,
  useNotifications,
  useActivity,
  formatApplicationType,
  formatDate,
  formatTimeAgo,
} from '../hooks/useDashboardData';

// Dashboard configuration
const DASHBOARD_CONFIG = {
  refreshInterval: 30000, // 30 seconds
  chartColors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#2e7d32',
    warning: '#ed6c02',
    info: '#0288d1',
    error: '#d32f2f',
  },
  quickActions: [
    {
      id: 'identification',
      title: 'ID Letter',
      description: 'Apply for identification letter',
      icon: IdentificationIcon,
      path: '/services/identification',
      color: '#2563eb',
      isPopular: true,
      estimatedTime: '2-3 days',
      fee: '₦500',
    },
    {
      id: 'birth-certificate',
      title: 'Birth Certificate',
      description: 'Register birth or get certificate',
      icon: BirthIcon,
      path: '/services/birth-certificate',
      color: '#16a34a',
      isPopular: true,
      estimatedTime: '5-7 days',
      fee: '₦1,000',
    },
    {
      id: 'health',
      title: 'Health Services',
      description: 'Book appointments & emergency info',
      icon: HealthIcon,
      path: '/services/health',
      color: '#dc2626',
      estimatedTime: 'Same day',
      fee: 'Free',
    },
    {
      id: 'business',
      title: 'Business Services',
      description: 'Register business & licenses',
      icon: BusinessIcon,
      path: '/services/business',
      color: '#7c3aed',
      estimatedTime: '7-14 days',
      fee: '₦2,500',
    },
    {
      id: 'transport',
      title: 'Transport Services',
      description: 'Vehicle registration & permits',
      icon: TransportIcon,
      path: '/services/transport',
      color: '#ea580c',
      estimatedTime: '3-5 days',
      fee: '₦3,000',
    },
    {
      id: 'education',
      title: 'Education Services',
      description: 'School registration & scholarships',
      icon: EducationIcon,
      path: '/services/education',
      color: '#0891b2',
      estimatedTime: '10-14 days',
      fee: 'Varies',
    },
    {
      id: 'housing',
      title: 'Housing & Land',
      description: 'Property registration & tax',
      icon: HousingIcon,
      path: '/services/housing',
      color: '#059669',
      estimatedTime: '14-21 days',
      fee: '₦5,000+',
    },
    {
      id: 'complaints',
      title: 'Complaints & Social',
      description: 'Submit complaints & social services',
      icon: ComplaintIcon,
      path: '/services/social-security',
      color: '#b91c1c',
      estimatedTime: '1-3 days',
      fee: 'Free',
    },
  ],
};

const ModernDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Fetch data using our hooks
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: applications, isLoading: appsLoading } = useApplications(5);
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(5);
  const { data: activityData, isLoading: activityLoading } = useActivity(5);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStats()]);
    } finally {
      setRefreshing(false);
    }
  };

  // Generate chart data for application trends
  const getApplicationTrendData = () => {
    if (!applications || !Array.isArray(applications)) return [];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().slice(5, 10), // MM-DD format
        applications: Math.floor(Math.random() * 5) + 1, // Mock data
        approved: Math.floor(Math.random() * 3),
      };
    });
    
    return last7Days;
  };

  // Generate chart data for application types
  const getApplicationTypeData = () => {
    if (!applications || !Array.isArray(applications) || applications.length === 0) return [];
    
    const types = applications.reduce((acc: { [key: string]: number }, app) => {
      const type = formatApplicationType(app.type);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(types).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Generate performance score
  const getPerformanceScore = () => {
    if (!stats) return 0;
    const { applications } = stats;
    if (applications.total === 0) return 100;
    
    const completedRate = ((applications.approved + applications.rejected) / applications.total) * 100;
    const approvalRate = applications.total > 0 ? (applications.approved / applications.total) * 100 : 0;
    
    return Math.round((completedRate * 0.6) + (approvalRate * 0.4));
  };

  if (statsLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="40%" height={48} />
          <Skeleton variant="text" width="60%" height={32} sx={{ mt: 1 }} />
        </Box>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
            <Link color="inherit" href="/" underline="hover">
              Home
            </Link>
            <Typography color="text.primary">Dashboard</Typography>
          </Breadcrumbs>

          {/* Main Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="bold"
                sx={{
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Welcome back, {user?.firstName}! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Here's what's happening with your government services
              </Typography>
              
              {/* Quick Stats Pills */}
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
                <Chip
                  icon={<AssignmentIcon />}
                  label={`${stats?.applications.total || 0} Total Applications`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<Schedule />}
                  label={`${stats?.applications.pending || 0} Pending Review`}
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  icon={<CheckCircle />}
                  label={`${stats?.applications.approved || 0} Approved`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<Notifications />}
                  label={`${stats?.unreadNotifications || 0} New Notifications`}
                  color="info"
                  variant="outlined"
                />
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1}>
              <NotificationIcon
                onClick={(e) => setNotificationAnchor(e.currentTarget)}
                unreadCount={stats?.unreadNotifications || 0}
              />
              
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>

              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <MoreVert />
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </Fade>

      {/* Key Metrics Section */}
      <Zoom in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <SectionHeader
            title="Key Metrics"
            subtitle="Your application and service statistics at a glance"
            icon={Assessment}
          />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Applications"
                value={stats?.applications.total || 0}
                subtitle="All time"
                trend={{
                  value: 12.5,
                  isPositive: true,
                  label: 'vs last month',
                }}
                icon={AssignmentIcon}
                color={DASHBOARD_CONFIG.chartColors.primary}
                onClick={() => navigate('/applications')}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Pending Review"
                value={stats?.applications.pending || 0}
                subtitle="Awaiting processing"
                trend={{
                  value: 8.2,
                  isPositive: false,
                  label: 'processing time',
                }}
                icon={Schedule}
                color={DASHBOARD_CONFIG.chartColors.warning}
                onClick={() => navigate('/applications?status=pending')}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Approved"
                value={stats?.applications.approved || 0}
                subtitle="Successfully processed"
                trend={{
                  value: 25.8,
                  isPositive: true,
                  label: 'success rate',
                }}
                icon={CheckCircle}
                color={DASHBOARD_CONFIG.chartColors.success}
                onClick={() => navigate('/applications?status=approved')}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Performance Score"
                value={`${getPerformanceScore()}%`}
                subtitle="Overall efficiency"
                trend={{
                  value: 5.2,
                  isPositive: true,
                  label: 'this month',
                }}
                icon={TrendingUp}
                color={DASHBOARD_CONFIG.chartColors.info}
              />
            </Grid>
          </Grid>
        </Box>
      </Zoom>

      {/* Charts and Analytics Section */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Application Trends Chart */}
        <Grid item xs={12} lg={8}>
          <AdvancedLineChart
            title="Application Trends"
            subtitle="Your application activity over the last 7 days"
            data={getApplicationTrendData()}
            xKey="date"
            lines={[
              { key: 'applications', color: DASHBOARD_CONFIG.chartColors.primary, name: 'Submitted' },
              { key: 'approved', color: DASHBOARD_CONFIG.chartColors.success, name: 'Approved' },
            ]}
            height={350}
            onExport={() => {/* TODO: Implement export */}}
            onFullscreen={() => {/* TODO: Implement fullscreen */}}
          />
        </Grid>

        {/* Application Types Distribution */}
        <Grid item xs={12} lg={4}>
          <AdvancedPieChart
            title="Service Distribution"
            subtitle="Your applications by service type"
            data={getApplicationTypeData()}
            nameKey="name"
            valueKey="value"
            height={350}
            colors={[
              DASHBOARD_CONFIG.chartColors.primary,
              DASHBOARD_CONFIG.chartColors.secondary,
              DASHBOARD_CONFIG.chartColors.success,
              DASHBOARD_CONFIG.chartColors.warning,
              DASHBOARD_CONFIG.chartColors.info,
            ]}
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Quick Actions */}
        <Grid item xs={12} lg={8}>
          <SectionHeader
            title="Quick Actions"
            subtitle="Start a new service application or access frequently used services"
            icon={Speed}
            action={
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/services')}
                endIcon={<Launch />}
              >
                View All Services
              </Button>
            }
          />
          
          <Grid container spacing={3}>
            {DASHBOARD_CONFIG.quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={action.id}>
                  <Zoom in timeout={800} style={{ transitionDelay: '100ms' }}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: action.isPopular ? '2px solid' : '1px solid',
                        borderColor: action.isPopular ? 'primary.main' : 'divider',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                          borderColor: 'primary.main',
                        },
                      }}
                      onClick={() => navigate(action.path)}
                    >
                      {action.isPopular && (
                        <Chip
                          label="Popular"
                          size="small"
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: 16,
                            fontSize: '0.7rem',
                            height: 20,
                            zIndex: 1,
                          }}
                        />
                      )}
                      
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              bgcolor: action.color,
                              color: 'white',
                              borderRadius: '50%',
                              width: 64,
                              height: 64,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 1,
                            }}
                          >
                            <IconComponent sx={{ fontSize: 32 }} />
                          </Box>
                          
                          <Box sx={{ textAlign: 'center', flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {action.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {action.description}
                            </Typography>
                            
                            {/* Service Details */}
                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 'auto' }}>
                              <Box sx={{ textAlign: 'left' }}>
                                <Typography variant="caption" color="text.secondary">
                                  Processing Time
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {action.estimatedTime}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="text.secondary">
                                  Service Fee
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color={action.fee === 'Free' ? 'success.main' : 'inherit'}>
                                  {action.fee}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Sidebar Content */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Recent Applications */}
            <Card>
              <CardContent>
                <SectionHeader
                  title="Recent Applications"
                  subtitle={`${applications?.length || 0} recent submissions`}
                  icon={Timeline}
                  action={
                    <Button
                      size="small"
                      onClick={() => navigate('/applications')}
                      endIcon={<Launch />}
                    >
                      View All
                    </Button>
                  }
                />
                
                <Stack spacing={2}>
                  {appsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="80%" />
                          <Skeleton variant="text" width="60%" />
                        </Box>
                      </Box>
                    ))
                  ) : applications && Array.isArray(applications) && applications.length > 0 ? (
                    applications.slice(0, 5).map((app) => (
                      <ModernListItem
                        key={app.id}
                        title={formatApplicationType(app.type)}
                        subtitle={`Submitted ${formatTimeAgo(app.createdAt)}`}
                        status={app.status}
                        time={formatDate(app.createdAt)}
                        icon={AssignmentIcon}
                        onClick={() => navigate(`/applications/${app.id}`)}
                        actionButton
                      />
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        No applications yet
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/services')}
                        sx={{ mt: 2 }}
                      >
                        Start Your First Application
                      </Button>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <ProgressCard
              title="Monthly Progress"
              description="Track your application completion rate"
              progress={stats?.applications.approved || 0}
              total={stats?.applications.total || 1}
              color={DASHBOARD_CONFIG.chartColors.success}
            />

            {/* System Performance */}
            <GaugeChart
              title="System Performance"
              value={getPerformanceScore()}
              max={100}
              suffix="%"
              color={DASHBOARD_CONFIG.chartColors.info}
              height={180}
            />

            {/* Quick Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Stats
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Active Applications</Typography>
                    <Chip 
                      label={stats?.applications.pending || 0} 
                      size="small" 
                      color="warning" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Completed This Month</Typography>
                    <Chip 
                      label={stats?.applications.approved || 0} 
                      size="small" 
                      color="success" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Recent Activities</Typography>
                    <Chip 
                      label={stats?.recentActivities || 0} 
                      size="small" 
                      color="info" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Response Time</Typography>
                    <Chip 
                      label="2.3 days" 
                      size="small" 
                      color="primary" 
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Notification Panel */}
      <NotificationPanel
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
      />

      {/* Settings Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <Settings sx={{ mr: 2 }} /> Profile Settings
        </MenuItem>
        <MenuItem onClick={() => window.print()}>
          <FileDownload sx={{ mr: 2 }} /> Export Dashboard
        </MenuItem>
        <MenuItem onClick={() => {/* TODO: Implement share */}}>
          <Share sx={{ mr: 2 }} /> Share Dashboard
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ModernDashboardPage;