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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
  Assignment as ApplicationIcon,
  PendingActions as PendingIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  BarChart as ChartIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AttachFile as FileIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AdminApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  serviceName: string;
  serviceType: string;
  applicationNumber: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_DOCUMENTS' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  submittedDate: string;
  lastUpdated: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  fee: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  documents: string[];
  comments: AdminComment[];
}

interface AdminComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isInternal: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedApplication, setSelectedApplication] = useState<AdminApplication | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_DOCUMENTS'>('APPROVE');

  // Mock admin applications data
  useEffect(() => {
    const loadAdminApplications = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockApplications: AdminApplication[] = [
          {
            id: '1',
            applicantName: 'John Doe',
            applicantEmail: 'john@example.com',
            serviceName: 'Identification Letter',
            serviceType: 'identification',
            applicationNumber: 'OLG-ID-2024-001',
            status: 'SUBMITTED',
            submittedDate: '2024-01-20T10:30:00Z',
            lastUpdated: '2024-01-20T10:30:00Z',
            priority: 'MEDIUM',
            assignedTo: 'Admin User',
            fee: 2000,
            paymentStatus: 'PAID',
            documents: ['ID Copy', 'Proof of Residence', 'Passport Photo'],
            comments: [
              {
                id: '1',
                author: 'System',
                content: 'Application submitted successfully',
                timestamp: '2024-01-20T10:30:00Z',
                isInternal: true,
              }
            ],
          },
          {
            id: '2',
            applicantName: 'Jane Smith',
            applicantEmail: 'jane@example.com',
            serviceName: 'Birth Certificate',
            serviceType: 'birth-certificate',
            applicationNumber: 'OLG-BC-2024-002',
            status: 'UNDER_REVIEW',
            submittedDate: '2024-01-18T15:20:00Z',
            lastUpdated: '2024-01-19T09:15:00Z',
            priority: 'HIGH',
            assignedTo: 'Admin User',
            fee: 3500,
            paymentStatus: 'PAID',
            documents: ['Hospital Birth Record', 'Parents ID'],
            comments: [
              {
                id: '1',
                author: 'Admin User',
                content: 'Documents received and under review',
                timestamp: '2024-01-19T09:15:00Z',
                isInternal: true,
              }
            ],
          },
          {
            id: '3',
            applicantName: 'Michael Johnson',
            applicantEmail: 'michael@example.com',
            serviceName: 'Business Registration',
            serviceType: 'business',
            applicationNumber: 'OLG-BIZ-2024-003',
            status: 'PENDING_DOCUMENTS',
            submittedDate: '2024-01-15T08:45:00Z',
            lastUpdated: '2024-01-16T14:20:00Z',
            priority: 'URGENT',
            assignedTo: 'Senior Admin',
            fee: 8000,
            paymentStatus: 'PAID',
            documents: ['Business Plan', 'Tax ID'],
            comments: [
              {
                id: '1',
                author: 'Senior Admin',
                content: 'Additional documentation required: Location permit missing',
                timestamp: '2024-01-16T14:20:00Z',
                isInternal: false,
              }
            ],
          },
          {
            id: '4',
            applicantName: 'Sarah Williams',
            applicantEmail: 'sarah@example.com',
            serviceName: 'Vehicle Registration',
            serviceType: 'transport',
            applicationNumber: 'OLG-VEH-2024-004',
            status: 'APPROVED',
            submittedDate: '2024-01-12T12:15:00Z',
            lastUpdated: '2024-01-19T16:30:00Z',
            priority: 'LOW',
            assignedTo: 'Admin User',
            fee: 12000,
            paymentStatus: 'PAID',
            documents: ['Vehicle Documents', 'Insurance', 'Safety Inspection'],
            comments: [
              {
                id: '1',
                author: 'Admin User',
                content: 'All documents verified. Application approved.',
                timestamp: '2024-01-19T16:30:00Z',
                isInternal: true,
              }
            ],
          },
        ];

        setApplications(mockApplications);
        setFilteredApplications(mockApplications);
      } catch (error) {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    loadAdminApplications();
  }, []);

  // Filter applications
  useEffect(() => {
    let filtered = applications;

    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(app => app.priority === priorityFilter);
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(app => app.serviceType === serviceFilter);
    }

    setFilteredApplications(filtered);
    setPage(0);
  }, [applications, searchQuery, statusFilter, priorityFilter, serviceFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'info';
      case 'UNDER_REVIEW': return 'warning';
      case 'PENDING_DOCUMENTS': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'COMPLETED': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReviewApplication = (application: AdminApplication) => {
    setSelectedApplication(application);
    setReviewDialogOpen(true);
    setReviewComment('');
    setReviewAction('APPROVE');
  };

  const submitReview = async () => {
    if (!selectedApplication) return;

    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedStatus = reviewAction === 'APPROVE' ? 'APPROVED' : 
                           reviewAction === 'REJECT' ? 'REJECTED' : 'PENDING_DOCUMENTS';

      setApplications(prev => prev.map(app => 
        app.id === selectedApplication.id 
          ? {
              ...app, 
              status: updatedStatus as any,
              lastUpdated: new Date().toISOString(),
              comments: [
                ...app.comments,
                {
                  id: Date.now().toString(),
                  author: 'Admin User',
                  content: reviewComment,
                  timestamp: new Date().toISOString(),
                  isInternal: reviewAction === 'REQUEST_DOCUMENTS' ? false : true,
                }
              ]
            }
          : app
      ));

      toast.success(`Application ${reviewAction.toLowerCase()}`);
      setReviewDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(a => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS'].includes(a.status)).length,
      approved: applications.filter(a => a.status === 'APPROVED').length,
      completed: applications.filter(a => a.status === 'COMPLETED').length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
      urgent: applications.filter(a => a.priority === 'URGENT').length,
    };
  };

  const stats = getStats();

  const renderDashboard = () => (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Applications', value: stats.total, color: 'primary', icon: ApplicationIcon },
          { label: 'Pending Review', value: stats.pending, color: 'warning', icon: PendingIcon },
          { label: 'Approved', value: stats.approved, color: 'success', icon: ApproveIcon },
          { label: 'Urgent Priority', value: stats.urgent, color: 'error', icon: WarningIcon },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: `${stat.color}.main` }}>
                      <IconComponent />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" color={`${stat.color}.main`}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Recent Applications */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Applications Requiring Attention
          </Typography>
          <List>
            {applications
              .filter(app => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS'].includes(app.status))
              .slice(0, 5)
              .map((app) => (
                <ListItem key={app.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: getPriorityColor(app.priority) + '.main' }}>
                      <ApplicationIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={`${app.applicantName} - ${app.serviceName}`}
                    secondary={`${app.applicationNumber} • ${formatDate(app.submittedDate)}`}
                  />
                  <Chip
                    label={app.status.replace('_', ' ')}
                    color={getStatusColor(app.status) as any}
                    size="small"
                  />
                  <Button
                    size="small"
                    onClick={() => handleReviewApplication(app)}
                    sx={{ ml: 1 }}
                  >
                    Review
                  </Button>
                </ListItem>
              ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );

  const renderApplicationsTable = () => (
    <Box>
      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="SUBMITTED">Submitted</MenuItem>
                <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                <MenuItem value="PENDING_DOCUMENTS">Pending Documents</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Service</InputLabel>
              <Select
                value={serviceFilter}
                label="Service"
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <MenuItem value="all">All Services</MenuItem>
                <MenuItem value="identification">Identification</MenuItem>
                <MenuItem value="birth-certificate">Birth Certificate</MenuItem>
                <MenuItem value="business">Business Registration</MenuItem>
                <MenuItem value="transport">Transport Services</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => toast('Export feature coming soon!')}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Applications Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Application</TableCell>
                <TableCell>Applicant</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((application) => (
                  <TableRow key={application.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {application.applicationNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {application.documents.length} documents
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{application.applicantName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {application.applicantEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>{application.serviceName}</TableCell>
                    
                    <TableCell>
                      <Chip
                        label={application.status.replace('_', ' ')}
                        color={getStatusColor(application.status) as any}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={application.priority}
                        color={getPriorityColor(application.priority) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(application.submittedDate)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {application.assignedTo || 'Unassigned'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleReviewApplication(application)}
                          title="Review Application"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => {
                            setSelectedApplication(application);
                            setReviewAction('APPROVE');
                            setReviewDialogOpen(true);
                          }}
                          title="Quick Approve"
                        >
                          <ApproveIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => {
                            setSelectedApplication(application);
                            setReviewAction('REJECT');
                            setReviewDialogOpen(true);
                          }}
                          title="Quick Reject"
                        >
                          <RejectIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredApplications.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Box>
  );

  if (loading && applications.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminIcon color="primary" />
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage government service applications and review citizen requests.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<ApplicationIcon />} label="Applications" />
          <Tab icon={<ChartIcon />} label="Reports" />
          <Tab icon={<UsersIcon />} label="Users" />
          <Tab icon={<SettingsIcon />} label="Settings" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {renderDashboard()}
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        {renderApplicationsTable()}
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        <Alert severity="info">
          Reports and analytics features coming soon!
        </Alert>
      </TabPanel>
      
      <TabPanel value={activeTab} index={3}>
        <Alert severity="info">
          User management features coming soon!
        </Alert>
      </TabPanel>
      
      <TabPanel value={activeTab} index={4}>
        <Alert severity="info">
          Settings and configuration features coming soon!
        </Alert>
      </TabPanel>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Review Application: {selectedApplication?.applicationNumber}
        </DialogTitle>
        
        <DialogContent>
          {selectedApplication && (
            <Box>
              {/* Application Details */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Applicant:</strong> {selectedApplication.applicantName}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {selectedApplication.applicantEmail}</Typography>
                    <Typography variant="body2"><strong>Service:</strong> {selectedApplication.serviceName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Submitted:</strong> {formatDate(selectedApplication.submittedDate)}</Typography>
                    <Typography variant="body2"><strong>Priority:</strong> {selectedApplication.priority}</Typography>
                    <Typography variant="body2"><strong>Fee:</strong> ₦{selectedApplication.fee.toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Review Action */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Action</InputLabel>
                <Select
                  value={reviewAction}
                  label="Action"
                  onChange={(e) => setReviewAction(e.target.value as any)}
                >
                  <MenuItem value="APPROVE">Approve Application</MenuItem>
                  <MenuItem value="REJECT">Reject Application</MenuItem>
                  <MenuItem value="REQUEST_DOCUMENTS">Request Additional Documents</MenuItem>
                </Select>
              </FormControl>

              {/* Comment */}
              <TextField
                fullWidth
                label="Comment"
                multiline
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add your comment here..."
                required
              />

              {/* Previous Comments */}
              {selectedApplication.comments.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Previous Comments</Typography>
                  {selectedApplication.comments.map((comment) => (
                    <Paper key={comment.id} sx={{ p: 2, mb: 1, bgcolor: comment.isInternal ? 'grey.50' : 'info.light' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {comment.author} {comment.isInternal ? '(Internal)' : '(Sent to Applicant)'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {comment.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.timestamp)}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={submitReview}
            disabled={loading || !reviewComment}
          >
            {loading ? 'Processing...' : `${reviewAction === 'APPROVE' ? 'Approve' : reviewAction === 'REJECT' ? 'Reject' : 'Request Documents'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboardPage;
