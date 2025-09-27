import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  LinearProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
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
  Notifications as NotificationIcon,
  TrendingUp as TrendingUpIcon,
  PendingActions as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Apps as QuickActionsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Mock data interfaces
interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  completedApplications: number;
  recentActivity: number;
}

interface RecentApplication {
  id: string;
  serviceName: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  submittedDate: string;
  serviceType: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  isPopular?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    completedApplications: 0,
    recentActivity: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Actions Configuration
  const quickActions: QuickAction[] = [
    {
      id: 'identification',
      title: 'ID Letter',
      description: 'Apply for identification letter',
      icon: IdentificationIcon,
      path: '/services/identification',
      color: '#2563eb',
      isPopular: true,
    },
    {
      id: 'birth-certificate',
      title: 'Birth Certificate',
      description: 'Register birth or get certificate',
      icon: BirthIcon,
      path: '/services/birth-certificate',
      color: '#16a34a',
      isPopular: true,
    },
    {
      id: 'health',
      title: 'Health Services',
      description: 'Book appointments & emergency info',
      icon: HealthIcon,
      path: '/services/health',
      color: '#dc2626',
    },
    {
      id: 'business',
      title: 'Business Services',
      description: 'Register business & licenses',
      icon: BusinessIcon,
      path: '/services/business',
      color: '#7c3aed',
    },
    {
      id: 'transport',
      title: 'Transport Services',
      description: 'Vehicle registration & permits',
      icon: TransportIcon,
      path: '/services/transport',
      color: '#ea580c',
    },
    {
      id: 'education',
      title: 'Education Services',
      description: 'School registration & scholarships',
      icon: EducationIcon,
      path: '/services/education',
      color: '#0891b2',
    },
    {
      id: 'housing',
      title: 'Housing & Land',
      description: 'Property registration & tax',
      icon: HousingIcon,
      path: '/services/housing',
      color: '#059669',
    },
    {
      id: 'complaints',
      title: 'Complaints & Social',
      description: 'Submit complaints & social services',
      icon: ComplaintIcon,
      path: '/services/social-security',
      color: '#b91c1c',
    },
  ];

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Mock data - replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        setStats({
          totalApplications: 12,
          pendingApplications: 3,
          approvedApplications: 7,
          completedApplications: 2,
          recentActivity: 5,
        });

        setRecentApplications([
          {
            id: '1',
            serviceName: 'Identification Letter',
            status: 'APPROVED',
            submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            serviceType: 'identification',
          },
          {
            id: '2',
            serviceName: 'Birth Certificate',
            status: 'PENDING',
            submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            serviceType: 'birth-certificate',
          },
          {
            id: '3',
            serviceName: 'Health Appointment',
            status: 'COMPLETED',
            submittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            serviceType: 'health',
          },
        ]);

        setNotifications([
          {
            id: '1',
            title: 'Application Approved',
            message: 'Your identification letter application has been approved!',
            type: 'success',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            isRead: false,
          },
          {
            id: '2',
            title: 'Document Required',
            message: 'Please upload additional documents for your birth certificate application.',
            type: 'warning',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            isRead: false,
          },
        ]);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'UNDER_REVIEW': return 'info';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (stats.totalApplications === 0) return 0;
    return (stats.completedApplications / stats.totalApplications) * 100;
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DashboardIcon color="primary" />
          Welcome to Your Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your government service applications and access quick actions.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.totalApplications}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Applications</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <PendingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.pendingApplications}</Typography>
                  <Typography variant="body2" color="text.secondary">Pending Review</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.approvedApplications}</Typography>
                  <Typography variant="body2" color="text.secondary">Approved</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.recentActivity}</Typography>
                  <Typography variant="body2" color="text.secondary">Recent Activity</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QuickActionsIcon color="primary" />
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start a new service application or access frequently used services
              </Typography>
              
              <Grid container spacing={2}>
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={action.id}>
                      <Paper
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: action.isPopular ? '2px solid' : '1px solid',
                          borderColor: action.isPopular ? 'primary.main' : 'divider',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3,
                            borderColor: 'primary.main',
                          },
                        }}
                        onClick={() => navigate(action.path)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar sx={{ bgcolor: action.color, width: 40, height: 40 }}>
                            <IconComponent sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {action.title}
                              </Typography>
                              {action.isPopular && (
                                <Chip label="Popular" size="small" color="primary" sx={{ height: 18, fontSize: '0.7rem' }} />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                              {action.description}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Applications
              </Typography>
              {recentApplications.length === 0 ? (
                <Alert severity="info">
                  No applications yet. Start by applying for a service above!
                </Alert>
              ) : (
                <List>
                  {recentApplications.map((application, index) => (
                    <React.Fragment key={application.id}>
                      <ListItem
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => navigate(`/services/${application.serviceType}`)}
                      >
                        <ListItemIcon>
                          <AssignmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={application.serviceName}
                          secondary={`Submitted on ${formatDate(application.submittedDate)}`}
                        />
                        <Chip
                          label={application.status.replace('_', ' ')}
                          color={getStatusColor(application.status) as any}
                          size="small"
                        />
                      </ListItem>
                      {index < recentApplications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/applications')}
                  startIcon={<AssignmentIcon />}
                >
                  View All Applications
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar: Progress & Notifications */}
        <Grid item xs={12} lg={4}>
          {/* Progress Overview */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Completion Rate</Typography>
                  <Typography variant="body2">{Math.round(getProgressPercentage())}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getProgressPercentage()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {stats.completedApplications} of {stats.totalApplications} applications completed
              </Typography>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationIcon color="primary" />
                Recent Notifications
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <Chip
                    label={notifications.filter(n => !n.isRead).length}
                    color="error"
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Typography>
              
              {notifications.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No new notifications
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {notifications.slice(0, 3).map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: notification.type === 'success' ? 'success.main' :
                                       notification.type === 'warning' ? 'warning.main' :
                                       notification.type === 'error' ? 'error.main' : 'info.main'
                            }}
                          >
                            <NotificationIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                              {notification.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(notification.timestamp)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < notifications.slice(0, 3).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
              
              {notifications.length > 3 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button size="small" onClick={() => toast('Notifications page coming soon!')}>
                    View All Notifications
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
