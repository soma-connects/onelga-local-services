import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Breadcrumbs,
  Link,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  Assignment as ApplicationIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  Error as RejectedIcon,
  HourglassEmpty as ReviewIcon,
  Payment as PaymentIcon,
  CloudDownload as DocumentIcon,
  Close as CloseIcon,
  DateRange as DateIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';

// Simple Timeline components replacement
const Timeline = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
    {children}
  </Box>
);

const TimelineItem = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: 'flex', minHeight: 80, mb: 2 }}>
    {children}
  </Box>
);

const TimelineOppositeContent = ({ children, ...props }: { children: React.ReactNode, variant?: string, color?: string, sx?: any }) => (
  <Box sx={{ width: 120, flexShrink: 0, pr: 2, textAlign: 'right', ...props.sx }}>
    {children}
  </Box>
);

const TimelineSeparator = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
    {children}
  </Box>
);

const TimelineDot = ({ color, sx, children }: { color?: string, sx?: any, children?: React.ReactNode }) => (
  <Box sx={{
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: color === 'primary' ? 'primary.main' : 
                     color === 'secondary' ? 'secondary.main' :
                     color === 'grey' ? 'grey.400' : 'primary.main',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...sx
  }}>
    {children}
  </Box>
);

const TimelineConnector = () => (
  <Box sx={{ width: 2, flex: 1, backgroundColor: 'grey.300', mt: 1 }} />
);

const TimelineContent = ({ children, sx }: { children: React.ReactNode, sx?: any }) => (
  <Box sx={{ flex: 1, ...sx }}>
    {children}
  </Box>
);

interface Application {
  id: string;
  serviceName: string;
  serviceType: string;
  applicationNumber: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_DOCUMENTS' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  submittedDate: string;
  lastUpdated: string;
  estimatedCompletion?: string;
  fee: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  documents: string[];
  timeline: ApplicationTimelineItem[];
}

interface ApplicationTimelineItem {
  id: string;
  status: string;
  title: string;
  description: string;
  date: string;
  isActive: boolean;
  isCompleted: boolean;
}

// Helper functions
const getServiceName = (type: string) => {
  const serviceNames: Record<string, string> = {
    'IDENTIFICATION_LETTER': 'Identification Letter',
    'BIRTH_CERTIFICATE': 'Birth Certificate',
    'HEALTH_APPOINTMENT': 'Health Services',
    'BUSINESS_REGISTRATION': 'Business Registration',
    'VEHICLE_REGISTRATION': 'Vehicle Registration',
    'COMPLAINT': 'Complaint Services',
    'EDUCATION_APPLICATION': 'Education Services',
    'HOUSING_APPLICATION': 'Housing & Land'
  };
  return serviceNames[type] || 'General Service';
};

const getDefaultFee = (type: string) => {
  const defaultFees: Record<string, number> = {
    'IDENTIFICATION_LETTER': 500,
    'BIRTH_CERTIFICATE': 1000,
    'HEALTH_APPOINTMENT': 0,
    'BUSINESS_REGISTRATION': 2500,
    'VEHICLE_REGISTRATION': 3000,
    'COMPLAINT': 0,
    'EDUCATION_APPLICATION': 1500,
    'HOUSING_APPLICATION': 5000
  };
  return defaultFees[type] || 0;
};

const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [sortBy, setSortBy] = useState('submittedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentApplication, setPaymentApplication] = useState<{id: string, serviceName: string, applicationNumber: string, fee: number} | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'PENDING_DOCUMENTS', label: 'Pending Documents' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const serviceOptions = [
    { value: 'all', label: 'All Services' },
    { value: 'identification', label: 'Identification Letter' },
    { value: 'birth-certificate', label: 'Birth Certificate' },
    { value: 'health', label: 'Health Services' },
    { value: 'business', label: 'Business Registration' },
    { value: 'transport', label: 'Transport Services' },
    { value: 'education', label: 'Education Services' },
    { value: 'housing', label: 'Housing & Land' },
    { value: 'social-security', label: 'Social Security' },
  ];

  // Load applications from API
  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/profile/applications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Transform backend application data to match frontend interface
            const transformedApplications: Application[] = data.data.applications.map((app: any) => {
              const appData = app.data ? JSON.parse(app.data) : {};
              return {
                id: app.id,
                serviceName: getServiceName(app.type),
                serviceType: app.type?.toLowerCase().replace('_', '-') || 'general',
                applicationNumber: `OLG-${app.type?.substring(0, 3)}-${new Date(app.createdAt).getFullYear()}-${app.id.substring(0, 3).toUpperCase()}`,
                status: app.status || 'SUBMITTED',
                submittedDate: app.createdAt,
                lastUpdated: app.updatedAt,
                estimatedCompletion: appData.estimatedCompletion,
                fee: appData.fee || getDefaultFee(app.type),
                paymentStatus: appData.paymentStatus || 'PENDING',
                documents: appData.documents || [],
                timeline: [] // TODO: Add timeline support when backend implements it
              };
            });
            setApplications(transformedApplications);
          } else {
            console.error('Failed to load applications:', data.message);
            setApplications([]);
          }
        } else {
          console.error('Failed to load applications');
          setApplications([]);
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
        // Fallback to mock data if API fails
        const mockApplications: Application[] = [
          {
            id: '1',
            serviceName: 'Identification Letter',
            serviceType: 'identification',
            applicationNumber: 'OLG-ID-2024-001',
            status: 'APPROVED',
            submittedDate: '2024-01-15T10:30:00Z',
            lastUpdated: '2024-01-20T14:45:00Z',
            estimatedCompletion: '2024-01-22T12:00:00Z',
            fee: 2000,
            paymentStatus: 'PAID',
            documents: ['ID Copy', 'Proof of Residence', 'Passport Photo'],
            timeline: [
              {
                id: '1',
                status: 'SUBMITTED',
                title: 'Application Submitted',
                description: 'Your application has been successfully submitted',
                date: '2024-01-15T10:30:00Z',
                isActive: false,
                isCompleted: true,
              },
              {
                id: '2',
                status: 'UNDER_REVIEW',
                title: 'Document Review',
                description: 'Documents are being reviewed by our team',
                date: '2024-01-16T09:00:00Z',
                isActive: false,
                isCompleted: true,
              },
              {
                id: '3',
                status: 'APPROVED',
                title: 'Application Approved',
                description: 'Your application has been approved and is ready for collection',
                date: '2024-01-20T14:45:00Z',
                isActive: true,
                isCompleted: true,
              },
            ],
          },
          {
            id: '2',
            serviceName: 'Birth Certificate',
            serviceType: 'birth-certificate',
            applicationNumber: 'OLG-BC-2024-002',
            status: 'PENDING_DOCUMENTS',
            submittedDate: '2024-01-18T15:20:00Z',
            lastUpdated: '2024-01-19T11:30:00Z',
            estimatedCompletion: '2024-02-01T12:00:00Z',
            fee: 3500,
            paymentStatus: 'PAID',
            documents: ['Hospital Birth Record', 'Parents ID'],
            timeline: [
              {
                id: '1',
                status: 'SUBMITTED',
                title: 'Application Submitted',
                description: 'Your application has been successfully submitted',
                date: '2024-01-18T15:20:00Z',
                isActive: false,
                isCompleted: true,
              },
              {
                id: '2',
                status: 'PENDING_DOCUMENTS',
                title: 'Additional Documents Required',
                description: 'Marriage certificate is required to complete your application',
                date: '2024-01-19T11:30:00Z',
                isActive: true,
                isCompleted: false,
              },
            ],
          },
          {
            id: '3',
            serviceName: 'Business Registration',
            serviceType: 'business',
            applicationNumber: 'OLG-BIZ-2024-003',
            status: 'COMPLETED',
            submittedDate: '2024-01-10T08:45:00Z',
            lastUpdated: '2024-01-25T16:20:00Z',
            fee: 8000,
            paymentStatus: 'PAID',
            documents: ['Business Plan', 'Tax ID', 'Location Permit'],
            timeline: [
              {
                id: '1',
                status: 'SUBMITTED',
                title: 'Application Submitted',
                description: 'Your application has been successfully submitted',
                date: '2024-01-10T08:45:00Z',
                isActive: false,
                isCompleted: true,
              },
              {
                id: '2',
                status: 'UNDER_REVIEW',
                title: 'Application Under Review',
                description: 'Business registration details are being verified',
                date: '2024-01-12T10:00:00Z',
                isActive: false,
                isCompleted: true,
              },
              {
                id: '3',
                status: 'APPROVED',
                title: 'Application Approved',
                description: 'Business registration has been approved',
                date: '2024-01-20T14:30:00Z',
                isActive: false,
                isCompleted: true,
              },
              {
                id: '4',
                status: 'COMPLETED',
                title: 'Certificate Issued',
                description: 'Business registration certificate has been issued and is ready for collection',
                date: '2024-01-25T16:20:00Z',
                isActive: false,
                isCompleted: true,
              },
            ],
          },
          {
            id: '4',
            serviceName: 'Vehicle Registration',
            serviceType: 'transport',
            applicationNumber: 'OLG-VEH-2024-004',
            status: 'UNDER_REVIEW',
            submittedDate: '2024-01-22T12:15:00Z',
            lastUpdated: '2024-01-23T09:45:00Z',
            estimatedCompletion: '2024-02-05T12:00:00Z',
            fee: 12000,
            paymentStatus: 'PENDING',
            documents: ['Vehicle Documents', 'Insurance'],
            timeline: [
              {
                id: '1',
                status: 'SUBMITTED',
                title: 'Application Submitted',
                description: 'Your application has been successfully submitted',
                date: '2024-01-22T12:15:00Z',
                isActive: false,
                isCompleted: true,
              },
              {
                id: '2',
                status: 'UNDER_REVIEW',
                title: 'Document Verification',
                description: 'Vehicle documents and insurance are being verified',
                date: '2024-01-23T09:45:00Z',
                isActive: true,
                isCompleted: false,
              },
            ],
          },
        ];

        setApplications(mockApplications);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  // Filter and sort applications
  useEffect(() => {
    let filtered = applications;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    // Service filter
    if (selectedService !== 'all') {
      filtered = filtered.filter(app => app.serviceType === selectedService);
    }

    // Sort applications
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'submittedDate':
          aValue = new Date(a.submittedDate);
          bValue = new Date(b.submittedDate);
          break;
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated);
          bValue = new Date(b.lastUpdated);
          break;
        case 'serviceName':
          aValue = a.serviceName;
          bValue = b.serviceName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.submittedDate;
          bValue = b.submittedDate;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredApplications(filtered);
    setPage(0); // Reset to first page when filters change
  }, [applications, searchQuery, selectedStatus, selectedService, sortBy, sortOrder]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return <PendingIcon />;
      case 'UNDER_REVIEW': return <ReviewIcon />;
      case 'PENDING_DOCUMENTS': return <DocumentIcon />;
      case 'APPROVED': return <CompleteIcon />;
      case 'REJECTED': return <RejectedIcon />;
      case 'COMPLETED': return <CompleteIcon />;
      default: return <PendingIcon />;
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

  const formatFee = (fee: number) => {
    return `₦${fee.toLocaleString()}`;
  };

  const openTimelineDialog = (application: Application) => {
    setSelectedApplication(application);
    setTimelineDialogOpen(true);
  };

  const handleDownloadDocument = (applicationId: string) => {
    toast.success('Document download started');
    // TODO: Implement actual document download
  };

  const handlePayment = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      setPaymentApplication({
        id: application.id,
        serviceName: application.serviceName,
        applicationNumber: application.applicationNumber,
        fee: application.fee
      });
      setPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = (transactionId: string, method: string) => {
    // Update application payment status
    setApplications(prev => prev.map(app => 
      app.id === paymentApplication?.id 
        ? { ...app, paymentStatus: 'PAID' as const }
        : app
    ));
    setPaymentModalOpen(false);
    toast.success('Payment successful! Your application will be processed shortly.');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[...Array(5)].map((_, index) => (
            <Grid item xs={12} key={index}>
              <Skeleton variant="rectangular" height={80} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  const paginatedApplications = filteredApplications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/" color="inherit">Home</Link>
        <Link href="/dashboard" color="inherit">Dashboard</Link>
        <Typography color="text.primary">Applications</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ApplicationIcon color="primary" />
          My Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track the status of your government service applications.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Applications', value: applications.length, color: 'primary' },
          { label: 'Pending Review', value: applications.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length, color: 'warning' },
          { label: 'Approved', value: applications.filter(a => a.status === 'APPROVED').length, color: 'success' },
          { label: 'Completed', value: applications.filter(a => a.status === 'COMPLETED').length, color: 'info' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h4" color={`${stat.color}.main`}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
                startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Service</InputLabel>
              <Select
                value={selectedService}
                label="Service"
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {serviceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={`${sortBy}-${sortOrder}`}
                label="Sort By"
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="submittedDate-desc">Newest First</MenuItem>
                <MenuItem value="submittedDate-asc">Oldest First</MenuItem>
                <MenuItem value="lastUpdated-desc">Recently Updated</MenuItem>
                <MenuItem value="serviceName-asc">Service Name</MenuItem>
                <MenuItem value="status-asc">Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
      </Typography>

      {/* Applications Table */}
      {filteredApplications.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          No applications found. {searchQuery || selectedStatus !== 'all' || selectedService !== 'all' 
            ? 'Try adjusting your search or filters.' 
            : 'Start by applying for a service from the services page.'}
        </Alert>
      ) : (
        <Paper sx={{ mb: 4 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Application</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedApplications.map((application) => (
                  <TableRow key={application.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {application.applicationNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {application.documents.length} document{application.documents.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {application.serviceName}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={application.status.replace('_', ' ')}
                          color={getStatusColor(application.status) as any}
                          size="small"
                          icon={getStatusIcon(application.status)}
                        />
                        {application.paymentStatus === 'PENDING' && (
                          <Chip
                            label="Payment Due"
                            color="error"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(application.submittedDate)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(application.lastUpdated)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatFee(application.fee)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => openTimelineDialog(application)}
                          title="View Timeline"
                        >
                          <ViewIcon />
                        </IconButton>
                        
                        {application.status === 'COMPLETED' && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleDownloadDocument(application.id)}
                            title="Download Document"
                          >
                            <DownloadIcon />
                          </IconButton>
                        )}
                        
                        {application.paymentStatus === 'PENDING' && (
                          <IconButton 
                            size="small" 
                            onClick={() => handlePayment(application.id)}
                            title="Make Payment"
                            color="primary"
                          >
                            <PaymentIcon />
                          </IconButton>
                        )}
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
      )}

      {/* Timeline Dialog */}
      <Dialog
        open={timelineDialogOpen}
        onClose={() => setTimelineDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Application Timeline</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedApplication?.applicationNumber} - {selectedApplication?.serviceName}
            </Typography>
          </Box>
          <IconButton onClick={() => setTimelineDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {selectedApplication && (
            <Timeline>
              {selectedApplication.timeline.map((item, index) => (
                <TimelineItem key={item.id}>
                  <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="text.secondary">
                    {formatDate(item.date)}
                  </TimelineOppositeContent>
                  
                  <TimelineSeparator>
                    <TimelineDot 
                      color={item.isCompleted ? 'primary' : item.isActive ? 'secondary' : 'grey'}
                      sx={{ p: 1 }}
                    >
                      {getStatusIcon(item.status)}
                    </TimelineDot>
                    {index < selectedApplication.timeline.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Typography variant="h6" component="span">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setTimelineDialogOpen(false)}>
            Close
          </Button>
          {selectedApplication?.status === 'COMPLETED' && (
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={() => {
                handleDownloadDocument(selectedApplication.id);
                setTimelineDialogOpen(false);
              }}
            >
              Download Document
            </Button>
          )}
          {selectedApplication?.paymentStatus === 'PENDING' && (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<PaymentIcon />}
              onClick={() => {
                handlePayment(selectedApplication.id);
                setTimelineDialogOpen(false);
              }}
            >
              Make Payment
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        application={paymentApplication}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Container>
  );
};

export default ApplicationsPage;
