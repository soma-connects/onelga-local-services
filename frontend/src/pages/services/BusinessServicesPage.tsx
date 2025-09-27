import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import {
  Business,
  Store,
  Assignment,
  AccountBalance,
  Receipt,
  Gavel,
  Construction,
  Restaurant,
  LocalShipping,
  Computer,
  Add,
  Visibility,
  Edit,
  Download,
  CheckCircle,
  Schedule,
  AttachMoney,
  Description,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Warning,
  Info,
  ContactSupport,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface BusinessService {
  id: string;
  name: string;
  description: string;
  category: 'Registration' | 'Licensing' | 'Tax' | 'Permits' | 'Support';
  requirements: string[];
  processingTime: string;
  cost: string;
  status: 'Available' | 'Limited' | 'Unavailable';
}

interface BusinessApplication {
  id: string;
  serviceId: string;
  serviceName: string;
  businessName: string;
  businessType: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Completed';
  submissionDate: string;
  expectedCompletion?: string;
  referenceNumber?: string;
  notes?: string;
}

interface BusinessProfile {
  id: string;
  businessName: string;
  registrationNumber: string;
  businessType: string;
  industry: string;
  address: string;
  phone: string;
  email: string;
  registrationDate: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  licenses: string[];
  taxID: string;
}

const BusinessServicesPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showRegistrationWizard, setShowRegistrationWizard] = useState(false);
  const [selectedService, setSelectedService] = useState<BusinessService | null>(null);
  const [applications, setApplications] = useState<BusinessApplication[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [registrationStep, setRegistrationStep] = useState(0);
  const [applicationForm, setApplicationForm] = useState({
    businessName: '',
    businessType: '',
    industry: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    additionalInfo: ''
  });

  // Mock business services data
  const businessServices: BusinessService[] = [
    {
      id: '1',
      name: 'Business Name Registration',
      description: 'Register your business name with the Corporate Affairs Commission (CAC)',
      category: 'Registration',
      requirements: ['Valid ID', 'Proposed business names (3 options)', 'Address proof'],
      processingTime: '7-14 days',
      cost: '₦15,000',
      status: 'Available'
    },
    {
      id: '2',
      name: 'Limited Company Registration',
      description: 'Incorporate your business as a limited liability company',
      category: 'Registration',
      requirements: ['Memorandum & Articles', 'Directors\' details', 'Share capital info'],
      processingTime: '14-21 days',
      cost: '₦50,000',
      status: 'Available'
    },
    {
      id: '3',
      name: 'Trade License Application',
      description: 'Obtain local government trade license for business operations',
      category: 'Licensing',
      requirements: ['Business registration', 'Tax clearance', 'Location permit'],
      processingTime: '5-10 days',
      cost: '₦25,000',
      status: 'Available'
    },
    {
      id: '4',
      name: 'Tax Registration & TIN',
      description: 'Register for tax identification number and tax obligations',
      category: 'Tax',
      requirements: ['Business registration certificate', 'Bank details', 'Valid ID'],
      processingTime: '3-7 days',
      cost: 'Free',
      status: 'Available'
    },
    {
      id: '5',
      name: 'Building/Premises Permit',
      description: 'Get approval for business premises and building modifications',
      category: 'Permits',
      requirements: ['Building plans', 'Environmental impact assessment', 'Land documents'],
      processingTime: '21-30 days',
      cost: '₦35,000',
      status: 'Available'
    },
    {
      id: '6',
      name: 'Food & Beverage License',
      description: 'Special license for restaurants, food vendors, and beverage businesses',
      category: 'Licensing',
      requirements: ['Health certificate', 'Food safety training', 'Premises inspection'],
      processingTime: '10-14 days',
      cost: '₦20,000',
      status: 'Available'
    },
    {
      id: '7',
      name: 'Import/Export License',
      description: 'License for international trade and customs operations',
      category: 'Licensing',
      requirements: ['Business registration', 'Customs documentation', 'Financial guarantee'],
      processingTime: '14-21 days',
      cost: '₦45,000',
      status: 'Limited'
    },
    {
      id: '8',
      name: 'Business Support & Advisory',
      description: 'Free consultation and support for business development',
      category: 'Support',
      requirements: ['Business plan (optional)', 'Valid ID'],
      processingTime: '1-3 days',
      cost: 'Free',
      status: 'Available'
    }
  ];

  const registrationSteps = [
    'Business Information',
    'Contact Details',
    'Documents Upload',
    'Review & Submit'
  ];

  // Mock data initialization
  React.useEffect(() => {
    const mockApplications: BusinessApplication[] = [
      {
        id: '1',
        serviceId: '1',
        serviceName: 'Business Name Registration',
        businessName: 'TechStart Nigeria Ltd',
        businessType: 'Limited Company',
        status: 'Under Review',
        submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expectedCompletion: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        referenceNumber: 'BRN2024001',
        notes: 'Name availability check in progress'
      },
      {
        id: '2',
        serviceId: '3',
        serviceName: 'Trade License Application',
        businessName: 'Green Foods Market',
        businessType: 'Sole Proprietorship',
        status: 'Approved',
        submissionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        referenceNumber: 'TLA2024002',
        notes: 'License ready for collection'
      }
    ];
    setApplications(mockApplications);

    // Mock business profile for registered businesses
    const mockProfile: BusinessProfile = {
      id: '1',
      businessName: 'Green Foods Market',
      registrationNumber: 'RC123456789',
      businessType: 'Sole Proprietorship',
      industry: 'Food & Retail',
      address: '15 Market Street, Ndoni, Rivers State',
      phone: '+234-801-234-5678',
      email: 'info@greenfoodsmarket.com',
      registrationDate: '2024-01-15',
      status: 'Active',
      licenses: ['Trade License', 'Food Handler License'],
      taxID: 'TIN1234567890'
    };
    setBusinessProfile(mockProfile);
  }, []);

  // Handle service application
  const handleApplyForService = (service: BusinessService) => {
    setSelectedService(service);
    if (service.category === 'Registration' && service.name.includes('Business Name')) {
      setShowRegistrationWizard(true);
    } else {
      setShowApplicationDialog(true);
    }
  };

  // Handle application submission
  const handleSubmitApplication = async () => {
    if (!selectedService || !applicationForm.businessName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newApplication: BusinessApplication = {
        id: Date.now().toString(),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        businessName: applicationForm.businessName,
        businessType: applicationForm.businessType,
        status: 'Submitted',
        submissionDate: new Date().toISOString(),
        referenceNumber: `REF${Date.now()}`,
      };

      setApplications(prev => [newApplication, ...prev]);
      toast.success('Application submitted successfully!');
      setShowApplicationDialog(false);
      setShowRegistrationWizard(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const resetForm = () => {
    setApplicationForm({
      businessName: '',
      businessType: '',
      industry: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      additionalInfo: ''
    });
    setRegistrationStep(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
      case 'Active':
      case 'Approved':
      case 'Completed':
        return 'success';
      case 'Limited':
      case 'Under Review':
      case 'Submitted':
        return 'warning';
      case 'Unavailable':
      case 'Rejected':
      case 'Suspended':
        return 'error';
      case 'Draft':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Registration': return <Business />;
      case 'Licensing': return <Gavel />;
      case 'Tax': return <AccountBalance />;
      case 'Permits': return <Construction />;
      case 'Support': return <ContactSupport />;
      default: return <Store />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderServices = () => (
    <Grid container spacing={3}>
      {businessServices.map((service) => (
        <Grid item xs={12} md={6} lg={4} key={service.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getCategoryIcon(service.category)}
                <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
                  {service.name}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {service.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={service.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip
                  label={service.status}
                  size="small"
                  color={getStatusColor(service.status) as any}
                  sx={{ mb: 1 }}
                />
              </Box>
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {service.processingTime}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {service.cost}
                  </Typography>
                </Box>
              </Stack>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Requirements: {service.requirements.slice(0, 2).join(', ')}
                  {service.requirements.length > 2 && '...'}
                </Typography>
              </Box>
            </CardContent>
            
            <CardActions>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => handleApplyForService(service)}
                disabled={service.status === 'Unavailable'}
              >
                Apply Now
              </Button>
              <Button size="small" startIcon={<Visibility />}>
                Details
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderApplications = () => (
    <Box>
      {applications.length === 0 ? (
        <Alert severity="info">
          You haven't submitted any business applications yet. Apply for services to get started.
        </Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service</TableCell>
              <TableCell>Business Name</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Submission Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {application.serviceName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {application.businessName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {application.businessType}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {application.referenceNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(application.submissionDate)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={application.status}
                    size="small"
                    color={getStatusColor(application.status) as any}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {application.status === 'Approved' && (
                      <Tooltip title="Download Certificate">
                        <IconButton size="small" color="success">
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );

  const renderBusinessProfile = () => (
    <Box>
      {!businessProfile ? (
        <Alert severity="info">
          No registered business found. Register your business to access this section.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Business Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Business Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {businessProfile.businessName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Registration Number
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {businessProfile.registrationNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Business Type
                    </Typography>
                    <Typography variant="body1">
                      {businessProfile.businessType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Industry
                    </Typography>
                    <Typography variant="body1">
                      {businessProfile.industry}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {businessProfile.address}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status & Licenses
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={businessProfile.status}
                      color={getStatusColor(businessProfile.status) as any}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Active Licenses
                    </Typography>
                    {businessProfile.licenses.map((license) => (
                      <Chip
                        key={license}
                        label={license}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tax ID
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {businessProfile.taxID}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderRegistrationWizard = () => (
    <Box>
      <Stepper activeStep={registrationStep} sx={{ mb: 4 }}>
        {registrationSteps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Step content would go here - simplified for demo */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Registration wizard step {registrationStep + 1} of {registrationSteps.length}
      </Alert>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🏢 Business Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Register your business, obtain licenses, manage tax obligations, and get support for business growth in Onelga LGA.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<Business />}
            onClick={() => setShowRegistrationWizard(true)}
            size="large"
          >
            Register New Business
          </Button>
          <Button
            variant="outlined"
            startIcon={<Gavel />}
            size="large"
          >
            Apply for License
          </Button>
          <Button
            variant="outlined"
            startIcon={<AccountBalance />}
            size="large"
          >
            Tax Services
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContactSupport />}
            size="large"
          >
            Get Support
          </Button>
        </Stack>
      </Paper>

      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
          <Tab label="All Services" icon={<Store />} />
          <Tab label="My Applications" icon={<Assignment />} />
          <Tab label="Business Profile" icon={<Business />} />
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box>
        {selectedTab === 0 && renderServices()}
        {selectedTab === 1 && renderApplications()}
        {selectedTab === 2 && renderBusinessProfile()}
      </Box>

      {/* Application Dialog */}
      <Dialog
        open={showApplicationDialog}
        onClose={() => setShowApplicationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Apply for {selectedService?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Name"
                  value={applicationForm.businessName}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, businessName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Business Type"
                  value={applicationForm.businessType}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, businessType: e.target.value }))}
                  required
                >
                  <MenuItem value="Sole Proprietorship">Sole Proprietorship</MenuItem>
                  <MenuItem value="Partnership">Partnership</MenuItem>
                  <MenuItem value="Limited Company">Limited Company</MenuItem>
                  <MenuItem value="NGO">NGO/Non-Profit</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Industry"
                  value={applicationForm.industry}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, industry: e.target.value }))}
                >
                  <MenuItem value="Food & Beverage">Food & Beverage</MenuItem>
                  <MenuItem value="Retail">Retail</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Healthcare">Healthcare</MenuItem>
                  <MenuItem value="Construction">Construction</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Business Description"
                  value={applicationForm.description}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, description: e.target.value }))}
                  helperText="Briefly describe your business activities"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApplicationDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitApplication}
            startIcon={<Assignment />}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Registration Wizard Dialog */}
      <Dialog
        open={showRegistrationWizard}
        onClose={() => setShowRegistrationWizard(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Business Registration Wizard
        </DialogTitle>
        <DialogContent>
          {renderRegistrationWizard()}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRegistrationStep(Math.max(0, registrationStep - 1))}
            disabled={registrationStep === 0}
          >
            Back
          </Button>
          <Button onClick={() => setShowRegistrationWizard(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (registrationStep === registrationSteps.length - 1) {
                handleSubmitApplication();
              } else {
                setRegistrationStep(registrationStep + 1);
              }
            }}
          >
            {registrationStep === registrationSteps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BusinessServicesPage;
