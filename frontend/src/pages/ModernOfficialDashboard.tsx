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
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Badge,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
  FormControl,
  Select,
  InputLabel,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  TrendingUp,
  Speed,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  Security,
  Analytics,
  Settings,
  Refresh,
  MoreVert,
  Launch,
  NavigateNext,
  Assessment,
  Notifications,
  HowToReg,
  Gavel,
  AccountBalance,
  WorkspacePremium,
  PendingActions,
  CheckCircleOutline,
  Cancel,
  AccessTime,
  Person,
  Business,
  School,
  LocalHospital,
  DirectionsCar,
  Home,
  ContactMail,
  ReportProblem,
  Search,
  FilterList,
  Sort,
  Download,
  Print,
  Share,
  Visibility,
  Edit,
  Delete,
  Flag,
  Star,
  Timeline,
  History,
  Comment,
  AttachFile,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Import our components
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
  AdvancedAreaChart,
  AdvancedPieChart,
  AdvancedBarChart,
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

// Mock data for official features
const WORK_METRICS = {
  totalCases: 127,
  pendingReview: 43,
  approved: 68,
  rejected: 16,
  avgProcessingTime: '2.4 days',
  workload: 78, // percentage
  efficiency: 92, // percentage
  customerSatisfaction: 4.6, // out of 5
};

const PRIORITY_CASES = [
  {
    id: 'APP-2024-001',
    applicantName: 'John Okafor',
    serviceType: 'Business Registration',
    urgency: 'high',
    submittedDate: '2024-01-15',
    daysOverdue: 3,
    assignee: 'current',
    status: 'pending_review',
  },
  {
    id: 'APP-2024-002',
    applicantName: 'Mary Adebayo',
    serviceType: 'Birth Certificate',
    urgency: 'medium',
    submittedDate: '2024-01-14',
    daysOverdue: 0,
    assignee: 'current',
    status: 'in_progress',
  },
  {
    id: 'APP-2024-003',
    applicantName: 'Peter Okwu',
    serviceType: 'Identification Letter',
    urgency: 'low',
    submittedDate: '2024-01-13',
    daysOverdue: 0,
    assignee: 'current',
    status: 'pending_documents',
  },
  {
    id: 'APP-2024-004',
    applicantName: 'Grace Eze',
    serviceType: 'Transport Registration',
    urgency: 'high',
    submittedDate: '2024-01-12',
    daysOverdue: 5,
    assignee: 'current',
    status: 'pending_review',
  },
];

const RECENT_ACTIVITIES = [
  { id: 1, action: 'Approved', case: 'APP-2024-025', applicant: 'Joseph Uche', service: 'Health Registration', time: '10 min ago', type: 'approval' },
  { id: 2, action: 'Requested Info', case: 'APP-2024-024', applicant: 'Sarah Obi', service: 'Business License', time: '25 min ago', type: 'info_request' },
  { id: 3, action: 'Rejected', case: 'APP-2024-023', applicant: 'Daniel Kalu', service: 'Land Registration', time: '1 hour ago', type: 'rejection' },
  { id: 4, action: 'Reviewed', case: 'APP-2024-022', applicant: 'Blessing Nkem', service: 'Education Certificate', time: '2 hours ago', type: 'review' },
  { id: 5, action: 'Assigned', case: 'APP-2024-021', applicant: 'Emmanuel Okoro', service: 'Social Services', time: '3 hours ago', type: 'assignment' },
];

const PERFORMANCE_DATA = [
  { period: 'This Week', processed: 23, target: 25, efficiency: 92 },
  { period: 'Last Week', processed: 28, target: 25, efficiency: 112 },
  { period: 'This Month', processed: 89, target: 100, efficiency: 89 },
  { period: 'Last Month', processed: 112, target: 100, efficiency: 112 },
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

const ModernOfficialDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data using our hooks (official-specific endpoints would be needed)
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: applications, isLoading: appsLoading } = useApplications(10);
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(5);
  const { data: activityData, isLoading: activityLoading } = useActivity(10);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStats()]);
    } finally {
      setRefreshing(false);
    }
  };

  // Generate mock data for charts
  const getWorkloadTrendData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().slice(5, 10), // MM-DD format
        assigned: Math.floor(Math.random() * 8) + 2,
        completed: Math.floor(Math.random() * 6) + 1,
        pending: Math.floor(Math.random() * 4) + 1,
      };
    });
    return last30Days;
  };

  const getServiceDistributionData = () => {
    const services = [
      { name: 'ID Letters', value: 35 },
      { name: 'Birth Certificates', value: 28 },
      { name: 'Business Registration', value: 22 },
      { name: 'Health Services', value: 15 },
      { name: 'Transport', value: 12 },
      { name: 'Education', value: 8 },
      { name: 'Housing', value: 6 },
      { name: 'Social Services', value: 4 },
    ];
    return services;
  };

  const getProcessingTimeData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().slice(5, 10), // MM-DD format
        avgProcessingTime: Math.floor(Math.random() * 3) + 1.5,
        target: 3,
      };
    });
    return last7Days;
  };

  const getStatusColor = (status: string, urgency?: string) => {
    if (urgency === 'high') return 'error';
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending_review': return 'warning';
      case 'in_progress': return 'info';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
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
            <Typography color="text.primary">Official Dashboard</Typography>
          </Breadcrumbs>

          {/* Main Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <HowToReg 
                  sx={{ 
                    fontSize: 40, 
                    color: 'primary.main',
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    borderRadius: '50%',
                    p: 1,
                    bgcolor: 'rgba(25, 118, 210, 0.1)'
                  }} 
                />
                <Typography
                  variant="h3"
                  component="h1"
                  fontWeight="bold"
                  sx={{
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                  }}
                >
                  Official Dashboard
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Welcome back, {user?.firstName}! Manage applications, review cases, and process citizen requests efficiently.
              </Typography>
              
              {/* Quick Status Pills */}
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
                <Chip
                  icon={<PendingActions />}
                  label={`${WORK_METRICS.pendingReview} Pending Review`}
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  icon={<AccessTime />}
                  label={`Avg: ${WORK_METRICS.avgProcessingTime}`}
                  color="info"
                  variant="outlined"
                />
                <Chip
                  icon={<CheckCircle />}
                  label={`${WORK_METRICS.approved} Completed`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<TrendingUp />}
                  label={`${WORK_METRICS.efficiency}% Efficiency`}
                  color="primary"
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

      {/* Work Metrics */}
      <Zoom in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <SectionHeader
            title="Work Performance"
            subtitle="Your application processing metrics and performance indicators"
            icon={Assessment}
          />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Cases"
                value={WORK_METRICS.totalCases}
                subtitle="All assigned cases"
                trend={{
                  value: 15.2,
                  isPositive: true,
                  label: 'vs last month',
                }}
                icon={Gavel}
                color="#1976d2"
                onClick={() => setTabValue(1)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Pending Review"
                value={WORK_METRICS.pendingReview}
                subtitle="Awaiting your action"
                trend={{
                  value: 8.5,
                  isPositive: false,
                  label: 'urgent cases',
                }}
                icon={PendingActions}
                color="#ed6c02"
                onClick={() => setTabValue(1)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Completed"
                value={WORK_METRICS.approved}
                subtitle="Successfully processed"
                trend={{
                  value: 22.8,
                  isPositive: true,
                  label: 'completion rate',
                }}
                icon={CheckCircleOutline}
                color="#2e7d32"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Avg Processing"
                value={WORK_METRICS.avgProcessingTime}
                subtitle="Per case completion"
                trend={{
                  value: 12.5,
                  isPositive: true,
                  label: 'improvement',
                }}
                icon={Speed}
                color="#0288d1"
              />
            </Grid>
          </Grid>
        </Box>
      </Zoom>

      {/* Performance Gauges */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <GaugeChart
            title="Workload"
            value={WORK_METRICS.workload}
            max={100}
            suffix="%"
            color={WORK_METRICS.workload > 90 ? '#d32f2f' : WORK_METRICS.workload > 75 ? '#ed6c02' : '#2e7d32'}
            height={200}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <GaugeChart
            title="Efficiency"
            value={WORK_METRICS.efficiency}
            max={100}
            suffix="%"
            color="#1976d2"
            height={200}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <GaugeChart
            title="Customer Rating"
            value={WORK_METRICS.customerSatisfaction * 20} // Convert 5-star to percentage
            max={100}
            suffix={`★ (${WORK_METRICS.customerSatisfaction}/5)`}
            color="#f57c00"
            height={200}
          />
        </Grid>
      </Grid>

      {/* Tabbed Content */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ px: 2 }}>
            <Tab icon={<Analytics />} label="Analytics" />
            <Tab icon={<AssignmentIcon />} label="Case Management" />
            <Tab icon={<Timeline />} label="Workflow" />
            <Tab icon={<History />} label="Activity Log" />
          </Tabs>
        </Box>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            {/* Workload Trends */}
            <Grid item xs={12} lg={8}>
              <AdvancedAreaChart
                title="Workload Trends"
                subtitle="Daily case assignment and completion over the last 30 days"
                data={getWorkloadTrendData()}
                xKey="date"
                areas={[
                  { key: 'assigned', color: '#1976d2', name: 'Cases Assigned' },
                  { key: 'completed', color: '#2e7d32', name: 'Cases Completed' },
                  { key: 'pending', color: '#ed6c02', name: 'Cases Pending' },
                ]}
                height={400}
              />
            </Grid>

            {/* Service Distribution */}
            <Grid item xs={12} lg={4}>
              <AdvancedPieChart
                title="Service Distribution"
                subtitle="Cases by service type"
                data={getServiceDistributionData()}
                nameKey="name"
                valueKey="value"
                height={400}
                colors={['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#0288d1', '#7b1fa2', '#d84315', '#5d4037']}
              />
            </Grid>

            {/* Processing Time Trends */}
            <Grid item xs={12}>
              <AdvancedLineChart
                title="Processing Time Trends"
                subtitle="Average case processing time vs target over the last 7 days"
                data={getProcessingTimeData()}
                xKey="date"
                lines={[
                  { key: 'avgProcessingTime', color: '#1976d2', name: 'Avg Processing Time (days)' },
                  { key: 'target', color: '#d32f2f', name: 'Target Time (days)' },
                ]}
                height={350}
              />
            </Grid>

            {/* Performance Summary */}
            <Grid item xs={12}>
              <SectionHeader
                title="Performance Summary"
                subtitle="Your productivity metrics across different periods"
                icon={WorkspacePremium}
              />
              
              <Grid container spacing={3}>
                {PERFORMANCE_DATA.map((period) => (
                  <Grid item xs={12} sm={6} md={3} key={period.period}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {period.period}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" color="primary.main" fontWeight="bold">
                            {period.processed}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            of {period.target} target
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(period.efficiency, 100)} 
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            color={period.efficiency >= 100 ? 'success' : period.efficiency >= 80 ? 'primary' : 'warning'}
                          />
                          <Typography variant="body2" fontWeight="medium" color={
                            period.efficiency >= 100 ? 'success.main' : 
                            period.efficiency >= 80 ? 'primary.main' : 'warning.main'
                          }>
                            {period.efficiency}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Case Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <SectionHeader
                title="Priority Cases"
                subtitle="High-priority and overdue cases requiring immediate attention"
                icon={Flag}
                action={
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      placeholder="Search cases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filterStatus}
                        label="Status"
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="pending_review">Pending Review</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="pending_documents">Pending Docs</MenuItem>
                      </Select>
                    </FormControl>
                    <Button startIcon={<Download />} size="small" variant="outlined">
                      Export
                    </Button>
                  </Stack>
                }
              />
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Case ID</strong></TableCell>
                      <TableCell><strong>Applicant</strong></TableCell>
                      <TableCell><strong>Service</strong></TableCell>
                      <TableCell align="center"><strong>Urgency</strong></TableCell>
                      <TableCell align="center"><strong>Status</strong></TableCell>
                      <TableCell align="center"><strong>Days</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {PRIORITY_CASES.map((caseItem) => (
                      <TableRow 
                        key={caseItem.id} 
                        hover
                        sx={{ 
                          bgcolor: caseItem.daysOverdue > 0 ? 'error.50' : 'inherit',
                          borderLeft: caseItem.urgency === 'high' ? '4px solid' : 'none',
                          borderLeftColor: 'error.main'
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight="medium">{caseItem.id}</Typography>
                            {caseItem.daysOverdue > 0 && (
                              <Chip label="OVERDUE" size="small" color="error" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {caseItem.applicantName.charAt(0)}
                            </Avatar>
                            <Typography>{caseItem.applicantName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{caseItem.serviceType}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={caseItem.urgency.toUpperCase()} 
                            size="small" 
                            color={getUrgencyColor(caseItem.urgency) as any}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge status={caseItem.status} />
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            color={caseItem.daysOverdue > 0 ? 'error.main' : 'text.primary'}
                            fontWeight={caseItem.daysOverdue > 0 ? 'bold' : 'normal'}
                          >
                            {caseItem.daysOverdue > 0 ? `+${caseItem.daysOverdue}` : formatTimeAgo(caseItem.submittedDate)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                onClick={() => navigate(`/official/cases/${caseItem.id}`)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Process">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => navigate(`/official/cases/${caseItem.id}/process`)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Add Comment">
                              <IconButton size="small">
                                <Comment />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Workflow Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <SectionHeader
                title="Quick Actions"
                subtitle="Perform common tasks and case management actions"
                icon={Speed}
              />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Bulk Review"
                    description="Review multiple applications at once"
                    icon={CheckCircle}
                    color="#2e7d32"
                    onClick={() => navigate('/official/bulk-review')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Generate Reports"
                    description="Create performance and case reports"
                    icon={Assessment}
                    color="#1976d2"
                    onClick={() => navigate('/official/reports')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Schedule Review"
                    description="Schedule upcoming case reviews"
                    icon={Schedule}
                    color="#ed6c02"
                    onClick={() => navigate('/official/schedule')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Document Templates"
                    description="Access and manage document templates"
                    icon={AttachFile}
                    color="#7b1fa2"
                    onClick={() => navigate('/official/templates')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Citizen Communication"
                    description="Send updates and notifications"
                    icon={Comment}
                    color="#0288d1"
                    onClick={() => navigate('/official/communications')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Case Assignment"
                    description="Reassign cases to other officials"
                    icon={Person}
                    color="#d84315"
                    onClick={() => navigate('/official/assignments')}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Today's Schedule
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Cases to Review</Typography>
                        <Chip label="12" size="small" color="warning" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Scheduled Meetings</Typography>
                        <Chip label="3" size="small" color="info" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Pending Documents</Typography>
                        <Chip label="7" size="small" color="error" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Follow-ups Due</Typography>
                        <Chip label="5" size="small" color="success" />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <ProgressCard
                  title="Daily Progress"
                  description="Cases processed today"
                  progress={8}
                  total={15}
                  color="#2e7d32"
                />

                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Reminders
                    </Typography>
                    <Stack spacing={1}>
                      <Alert severity="warning">
                        3 cases exceed SLA deadline
                      </Alert>
                      <Alert severity="info">
                        Monthly report due tomorrow
                      </Alert>
                      <Alert severity="success">
                        Team meeting at 2 PM today
                      </Alert>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Activity Log Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <SectionHeader
                title="Recent Activities"
                subtitle="Your recent case processing activities and actions"
                icon={History}
                action={
                  <Button startIcon={<Download />} size="small" variant="outlined">
                    Export Log
                  </Button>
                }
              />
              
              <List>
                {RECENT_ACTIVITIES.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: activity.type === 'approval' ? 'success.main' :
                                    activity.type === 'rejection' ? 'error.main' :
                                    activity.type === 'info_request' ? 'warning.main' : 'info.main',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {activity.type === 'approval' && <CheckCircle />}
                          {activity.type === 'rejection' && <Cancel />}
                          {activity.type === 'info_request' && <Warning />}
                          {activity.type === 'review' && <Visibility />}
                          {activity.type === 'assignment' && <Person />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography fontWeight="medium">{activity.action}</Typography>
                            <Chip label={activity.case} size="small" variant="outlined" />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              <strong>{activity.applicant}</strong> - {activity.service}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        }
                      />
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/official/cases/${activity.case}`)}
                      >
                        <Launch />
                      </IconButton>
                    </ListItem>
                    {index < RECENT_ACTIVITIES.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

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
        <MenuItem onClick={() => navigate('/official/settings')}>
          <Settings sx={{ mr: 2 }} /> Dashboard Settings
        </MenuItem>
        <MenuItem onClick={() => navigate('/official/reports')}>
          <Assessment sx={{ mr: 2 }} /> Generate Reports
        </MenuItem>
        <MenuItem onClick={() => navigate('/official/bulk-actions')}>
          <CheckCircle sx={{ mr: 2 }} /> Bulk Actions
        </MenuItem>
        <MenuItem onClick={() => navigate('/profile')}>
          <Person sx={{ mr: 2 }} /> Profile Settings
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ModernOfficialDashboard;