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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Stack,
  Badge,
  Tooltip,
  // Charts, // Not available in @mui/material
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  AccountBalance,
  Dashboard as DashboardIcon,
  Analytics,
  TrendingUp,
  TrendingDown,
  People,
  Assignment,
  Policy,
  Gavel,
  Security,
  Report,
  NotificationImportant,
  Download,
  Upload,
  Settings,
  SupervisorAccount,
  Warning,
  CheckCircle,
  Schedule,
  BarChart,
  PieChart,
  Timeline,
  Assessment,
  Approval,
  Block,
  Message,
  Email,
  Phone,
  // LocalGovernment, // Not available in @mui/icons-material, using AccountBalance instead
  Public,
  AdminPanelSettings,
  Verified,
  Error,
  Info,
  ExpandMore,
  FileDownload,
  CloudUpload,
  Notifications,
  MonitorHeart,
  Speed,
  Storage,
  Group,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import toast from 'react-hot-toast';

interface SystemMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface PolicyDocument {
  id: string;
  title: string;
  type: 'Policy' | 'Regulation' | 'Guideline' | 'Standard';
  status: 'Draft' | 'Under Review' | 'Approved' | 'Published';
  lastUpdated: string;
  version: string;
  department: string;
}

interface ComplianceReport {
  id: string;
  title: string;
  type: 'Monthly' | 'Quarterly' | 'Annual' | 'Ad-hoc';
  status: 'Generated' | 'Pending Review' | 'Approved' | 'Published';
  generatedDate: string;
  coveragePeriod: string;
  size: string;
}

interface AuditAction {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  details: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
}

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
      id={`official-tabpanel-${index}`}
      aria-labelledby={`official-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const GovernmentOfficialDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [policyDocuments, setPolicyDocuments] = useState<PolicyDocument[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [auditActions, setAuditActions] = useState<AuditAction[]>([]);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [bulkNotificationForm, setBulkNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    recipients: 'all' as 'all' | 'citizens' | 'admins' | 'officials',
    channels: [] as string[],
  });

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock system metrics
        setSystemMetrics([
          {
            id: '1',
            title: 'Total Users',
            value: 15420,
            unit: 'users',
            change: 12.5,
            changeType: 'increase',
            icon: People,
            color: '#1976d2'
          },
          {
            id: '2',
            title: 'Active Applications',
            value: 3847,
            unit: 'applications',
            change: 8.3,
            changeType: 'increase',
            icon: Assignment,
            color: '#388e3c'
          },
          {
            id: '3',
            title: 'System Uptime',
            value: 99.97,
            unit: '%',
            change: 0.02,
            changeType: 'increase',
            icon: MonitorHeart,
            color: '#f57c00'
          },
          {
            id: '4',
            title: 'Compliance Score',
            value: 96.8,
            unit: '%',
            change: -0.5,
            changeType: 'decrease',
            icon: Security,
            color: '#7b1fa2'
          },
          {
            id: '5',
            title: 'Processing Time',
            value: 2.4,
            unit: 'days',
            change: -15.2,
            changeType: 'decrease',
            icon: Speed,
            color: '#d32f2f'
          },
          {
            id: '6',
            title: 'Storage Used',
            value: 78.5,
            unit: '%',
            change: 5.8,
            changeType: 'increase',
            icon: Storage,
            color: '#0288d1'
          }
        ]);

        // Mock policy documents
        setPolicyDocuments([
          {
            id: '1',
            title: 'Digital Identity Verification Policy',
            type: 'Policy',
            status: 'Draft',
            lastUpdated: '2024-01-20',
            version: '2.1',
            department: 'IT & Security'
          },
          {
            id: '2',
            title: 'Service Fee Structure Guidelines',
            type: 'Guideline',
            status: 'Published',
            lastUpdated: '2024-01-15',
            version: '1.5',
            department: 'Finance'
          },
          {
            id: '3',
            title: 'Data Protection Regulation',
            type: 'Regulation',
            status: 'Approved',
            lastUpdated: '2024-01-18',
            version: '3.0',
            department: 'Legal & Compliance'
          }
        ]);

        // Mock compliance reports
        setComplianceReports([
          {
            id: '1',
            title: 'Q4 2023 Service Delivery Report',
            type: 'Quarterly',
            status: 'Published',
            generatedDate: '2024-01-05',
            coveragePeriod: 'Oct-Dec 2023',
            size: '2.4 MB'
          },
          {
            id: '2',
            title: 'January 2024 Security Audit',
            type: 'Monthly',
            status: 'Approved',
            generatedDate: '2024-01-22',
            coveragePeriod: 'January 2024',
            size: '1.8 MB'
          },
          {
            id: '3',
            title: 'Annual Performance Assessment 2023',
            type: 'Annual',
            status: 'Pending Review',
            generatedDate: '2024-01-25',
            coveragePeriod: 'FY 2023',
            size: '5.2 MB'
          }
        ]);

        // Mock audit actions
        setAuditActions([
          {
            id: '1',
            action: 'Policy Updated',
            performedBy: 'Sarah Johnson',
            role: 'Government Official',
            timestamp: '2024-01-20T14:30:00Z',
            details: 'Updated Digital Identity Verification Policy v2.1',
            severity: 'Medium',
            category: 'Policy Management'
          },
          {
            id: '2',
            action: 'System Configuration Changed',
            performedBy: 'Michael Chen',
            role: 'System Admin',
            timestamp: '2024-01-20T10:15:00Z',
            details: 'Modified security timeout settings',
            severity: 'High',
            category: 'System Security'
          },
          {
            id: '3',
            action: 'Bulk Notification Sent',
            performedBy: 'David Wilson',
            role: 'Government Official',
            timestamp: '2024-01-19T16:45:00Z',
            details: 'Sent system maintenance notification to all users',
            severity: 'Low',
            category: 'Communication'
          }
        ]);

      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSendBulkNotification = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Notification sent to ${bulkNotificationForm.recipients}`);
      setNotificationDialog(false);
      setBulkNotificationForm({
        title: '',
        message: '',
        type: 'info',
        recipients: 'all',
        channels: []
      });
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (icon: React.ElementType, color: string) => {
    const IconComponent = icon;
    return <IconComponent sx={{ color, fontSize: 32 }} />;
  };

  const getChangeIndicator = (change: number, type: 'increase' | 'decrease' | 'neutral') => {
    if (type === 'neutral') return null;
    
    const isPositive = type === 'increase';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isPositive ? (
          <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
        ) : (
          <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />
        )}
        <Typography 
          variant="body2" 
          color={isPositive ? 'success.main' : 'error.main'}
          fontWeight="medium"
        >
          {Math.abs(change)}%
        </Typography>
      </Box>
    );
  };

  const getStatusChip = (status: string, type: 'policy' | 'report' | 'audit' = 'policy') => {
    const configs = {
      policy: {
        'Draft': { color: 'default' as const, label: 'Draft' },
        'Under Review': { color: 'warning' as const, label: 'Under Review' },
        'Approved': { color: 'info' as const, label: 'Approved' },
        'Published': { color: 'success' as const, label: 'Published' }
      },
      report: {
        'Generated': { color: 'info' as const, label: 'Generated' },
        'Pending Review': { color: 'warning' as const, label: 'Pending Review' },
        'Approved': { color: 'success' as const, label: 'Approved' },
        'Published': { color: 'success' as const, label: 'Published' }
      },
      audit: {
        'Low': { color: 'success' as const, label: 'Low' },
        'Medium': { color: 'warning' as const, label: 'Medium' },
        'High': { color: 'error' as const, label: 'High' },
        'Critical': { color: 'error' as const, label: 'Critical' }
      }
    };

    const group = configs[type as 'policy' | 'report' | 'audit'];
    const config = (group as any)[status] || { color: 'default' as const, label: status };
    
    return <Chip label={config.label} color={config.color} size="small" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <LinearProgress sx={{ width: '300px' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item>
            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
              <AccountBalance sx={{ fontSize: 32 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              Government Official Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              High-level analytics, policy management, and system oversight
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Chip 
                icon={<Verified />}
                label={`${user?.firstName} ${user?.lastName}`}
                color="primary"
                variant="outlined"
              />
              <Chip 
                icon={<Public />}
                label={user?.department || 'Government Office'}
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<NotificationImportant />}
                onClick={() => setNotificationDialog(true)}
              >
                Send Alert
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
              >
                Export Data
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* System Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {systemMetrics.map((metric) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={metric.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {getMetricIcon(metric.icon, metric.color)}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {metric.value.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.unit}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {metric.title}
                  </Typography>
                  {getChangeIndicator(metric.change, metric.changeType)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dashboard Tabs */}
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="official dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Analytics />} label="Analytics" />
            <Tab icon={<Policy />} label="Policy Management" />
            <Tab icon={<Report />} label="Compliance Reports" />
            <Tab icon={<Security />} label="Audit Logs" />
            <Tab icon={<SupervisorAccount />} label="System Oversight" />
          </Tabs>
        </Box>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Service Usage Trends */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Service Usage Trends
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <BarChart sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Interactive chart showing service usage over time
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (Chart component would be integrated here)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={2}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Speed color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Avg Response Time"
                          secondary="1.2 seconds"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Success Rate"
                          secondary="98.7%"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Group color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Daily Active Users"
                          secondary="2,847"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      System Health
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        CPU Usage
                      </Typography>
                      <LinearProgress variant="determinate" value={35} sx={{ mt: 1 }} />
                      <Typography variant="caption">35%</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Memory Usage
                      </Typography>
                      <LinearProgress variant="determinate" value={62} color="warning" sx={{ mt: 1 }} />
                      <Typography variant="caption">62%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Storage Usage
                      </Typography>
                      <LinearProgress variant="determinate" value={78} color="error" sx={{ mt: 1 }} />
                      <Typography variant="caption">78%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Policy Management Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Policy Documents
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button startIcon={<Upload />} variant="outlined">
                  Upload Policy
                </Button>
                <Button startIcon={<Gavel />} variant="contained">
                  Create New
                </Button>
              </Stack>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Document</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {policyDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {doc.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>
                        {getStatusChip(doc.status, 'policy')}
                      </TableCell>
                      <TableCell>{doc.department}</TableCell>
                      <TableCell>v{doc.version}</TableCell>
                      <TableCell>{formatDate(doc.lastUpdated)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small">
                            <Tooltip title="View">
                              <Assessment />
                            </Tooltip>
                          </IconButton>
                          <IconButton size="small">
                            <Tooltip title="Edit">
                              <Settings />
                            </Tooltip>
                          </IconButton>
                          <IconButton size="small">
                            <Tooltip title="Download">
                              <FileDownload />
                            </Tooltip>
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Compliance Reports Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Compliance Reports
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button startIcon={<Assessment />} variant="outlined">
                  Generate Report
                </Button>
                <Button startIcon={<CloudUpload />} variant="contained">
                  Bulk Export
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={2}>
              {complianceReports.map((report) => (
                <Grid item xs={12} md={6} lg={4} key={report.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Report color="primary" />
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {report.title}
                        </Typography>
                        {getStatusChip(report.status, 'report')}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Type: {report.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Period: {report.coveragePeriod}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Generated: {formatDate(report.generatedDate)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Size: {report.size}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<Assessment />}>
                        View
                      </Button>
                      <Button size="small" startIcon={<Download />}>
                        Download
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Audit Logs Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              System Audit Trail
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Performed By</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {action.action}
                        </Typography>
                      </TableCell>
                      <TableCell>{action.performedBy}</TableCell>
                      <TableCell>
                        <Chip 
                          label={action.role} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>{formatDateTime(action.timestamp)}</TableCell>
                      <TableCell>
                        {getStatusChip(action.severity, 'audit')}
                      </TableCell>
                      <TableCell>{action.category}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {action.details}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* System Oversight Tab */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Integration Status
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="National ID Registry"
                        secondary="Connected - Last sync: 5 min ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Tax Authority Database"
                        secondary="Slow response - Average delay: 3.2s"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Error color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Birth Registry System"
                        secondary="Connection timeout - Last attempt: 15 min ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Payment Gateway"
                        secondary="Operational - 99.9% uptime"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Emergency Actions
                  </Typography>
                  <Stack spacing={2}>
                    <Alert severity="warning">
                      <Typography variant="body2">
                        System maintenance window scheduled for tonight at 11:00 PM
                      </Typography>
                    </Alert>
                    
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<Warning />}
                      fullWidth
                    >
                      Initiate System Maintenance Mode
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Block />}
                      fullWidth
                    >
                      Emergency System Shutdown
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<NotificationImportant />}
                      fullWidth
                    >
                      Send Emergency Broadcast
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Bulk Notification Dialog */}
      <Dialog 
        open={notificationDialog} 
        onClose={() => setNotificationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Send Bulk Notification
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Notification Title"
            value={bulkNotificationForm.title}
            onChange={(e) => setBulkNotificationForm(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={bulkNotificationForm.message}
            onChange={(e) => setBulkNotificationForm(prev => ({ ...prev, message: e.target.value }))}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Notification Type</InputLabel>
            <Select
              value={bulkNotificationForm.type}
              onChange={(e) => setBulkNotificationForm(prev => ({ ...prev, type: e.target.value as any }))}
            >
              <MenuItem value="info">Information</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="error">Critical Alert</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Recipients</InputLabel>
            <Select
              value={bulkNotificationForm.recipients}
              onChange={(e) => setBulkNotificationForm(prev => ({ ...prev, recipients: e.target.value as any }))}
            >
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="citizens">Citizens Only</MenuItem>
              <MenuItem value="admins">Admins Only</MenuItem>
              <MenuItem value="officials">Government Officials Only</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSendBulkNotification}
            disabled={loading || !bulkNotificationForm.title || !bulkNotificationForm.message}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GovernmentOfficialDashboardPage;
