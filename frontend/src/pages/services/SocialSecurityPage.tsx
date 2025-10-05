import React, { useEffect, useState } from 'react';
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
  Badge,
  Avatar,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  Security,
  FamilyRestroom,
  Elderly,
  ChildCare,
  Accessibility,
  LocalHospital,
  School,
  Home,
  MonetizationOn,
  Assignment,
  PersonAdd,
  Visibility,
  Edit,
  Download,
  Add,
  CheckCircle,
  Warning,
  Schedule,
  AttachMoney,
  Phone,
  Email,
  ExpandMore,
  Person,
  Group,
  CalendarToday,
  LocationOn,
  Upload,
  Description,
  Receipt,
  Work,
  VolunteerActivism,
  VerifiedUser,
  Print,
  Search,
  Cancel,
  Update,
  Info,
  Support,
  Psychology,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { servicesAPI, applicationsAPI, documentsAPI } from '../../services/api';

interface SocialService {
  id: string;
  name: string;
  description: string;
  category: 'Welfare Programs' | 'Disability Support' | 'Elderly Care' | 'Child Support' | 'Healthcare Assistance' | 'Education Support' | 'Housing Assistance' | 'Employment Support';
  eligibilityCriteria: string[];
  benefits: string[];
  requirements: string[];
  processingTime: string;
  status: 'Available' | 'Limited' | 'Seasonal' | 'Suspended';
  priority?: 'High' | 'Medium' | 'Low';
}

interface SocialApplication {
  id: string;
  serviceId: string;
  serviceName: string;
  applicantName: string;
  applicationDate: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Document Verification' | 'Assessment' | 'Approved' | 'Active' | 'Completed' | 'Rejected' | 'Suspended';
  referenceNumber?: string;
  benefitAmount?: number;
  startDate?: string;
  endDate?: string;
  reviewDate?: string;
  caseworker?: string;
  notes?: string;
}

interface Beneficiary {
  id: string;
  name: string;
  idNumber: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  householdSize: number;
  monthlyIncome: number;
  employmentStatus: string;
  disabilities?: string[];
  medicalConditions?: string[];
  dependents: number;
  bankAccount?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  activePrograms: {
    programId: string;
    programName: string;
    startDate: string;
    monthlyBenefit: number;
    status: string;
  }[];
}

const SocialSecurityPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showBeneficiaryDialog, setBeneficiaryDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<SocialService | null>(null);
  const [applications, setApplications] = useState<SocialApplication[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [applicationStep, setApplicationStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  
  const [applicationForm, setApplicationForm] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    address: '',
  stateOfOrigin: '',
    lgaOfOrigin: '',
    
    // Household Information
    householdSize: '',
    dependents: '',
    monthlyIncome: '',
    employmentStatus: '',
    employerName: '',
    occupation: '',
    
    // Health Information
    disabilities: [] as string[],
    medicalConditions: [] as string[],
    healthInsurance: '',
    medicalNeeds: '',
    
    // Financial Information
    bankName: '',
    accountNumber: '',
    bvn: '',
    otherBenefits: [] as string[],
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    
    // Application Details
    reasonForApplication: '',
    previousApplications: '',
    supportingDocuments: [] as string[],
  });

  const [socialServices, setSocialServices] = useState<SocialService[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ id: string; name: string }>>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [programs, setPrograms] = useState<Array<{ id: string; name: string; type: string; description: string; status: 'Open' | 'Waitlist' | 'Closed' | 'Coming Soon'; benefits: string[]; eligibility: string[]; applicationDeadline?: string }>>([]);

  // Load services and applications from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const resp = await servicesAPI.getServices();
        const raw = Array.isArray(resp.data) ? resp.data : (resp.data as any)?.services || [];
        const normalized = raw
          .filter((s: any) => `${s.category || ''}`.toLowerCase().includes('social'))
          .map((s: any): SocialService => {
            const st = (s.status || 'Available').toString().toLowerCase();
            const statusMap: Record<string, SocialService['status']> = {
              available: 'Available',
              'temporarily_unavailable': 'Suspended',
              coming_soon: 'Seasonal',
            };
            return {
              id: s.id?.toString() || s._id?.toString() || s.name,
              name: s.name || s.title || 'Service',
              description: s.description || 'No description provided.',
              category: (s.category || 'Welfare Programs') as any,
              eligibilityCriteria: Array.isArray(s.eligibility) ? s.eligibility : [],
              benefits: Array.isArray(s.benefits) ? s.benefits : [],
              requirements: Array.isArray(s.requirements) ? s.requirements : [],
              processingTime: s.processingTime || s.sla || '2-4 weeks',
              status: statusMap[st] || 'Available',
              priority: s.priority || undefined,
            };
          });
        setSocialServices(normalized);
      } catch (e) {
        setSocialServices([]);
      }
    };
    const loadApplications = async () => {
      try {
        const resp = await applicationsAPI.getApplications({ type: 'COMPLAINT', limit: 10, page: 1 } as any);
        const data: any = resp.data;
        const apps = Array.isArray(data?.applications) ? data.applications : (Array.isArray(data) ? data : []);
        const mapped: SocialApplication[] = apps.map((app: any) => ({
          id: app.id?.toString() || app._id?.toString() || Math.random().toString(),
          serviceId: app.serviceId || app.type || 'social',
          serviceName: app.serviceName || app.type || 'Social Service',
          applicantName: app.data?.applicantName || '-',
          applicationDate: (app.createdAt || new Date()).toString(),
          status: (app.status || 'Submitted') as SocialApplication['status'],
          referenceNumber: app.reference || app.referenceNumber,
          benefitAmount: app.data?.benefitAmount,
          startDate: app.data?.startDate,
          endDate: app.data?.endDate,
          reviewDate: app.data?.reviewDate,
          caseworker: app.caseworker,
          notes: app.notes,
        }));
        setApplications(mapped);
      } catch (e) {
        setApplications([]);
      }
      setBeneficiaries([]);
    };
    loadServices();
    loadApplications();
    // Fallback programs
    setPrograms([
      {
        id: 'ssp-1',
        name: 'Vulnerable Support Program',
        type: 'Welfare',
        description: 'Monthly support for vulnerable households in ONELGA.',
        status: 'Open',
        benefits: ['Monthly cash support', 'Food assistance'],
        eligibility: ['Resident of ONELGA', 'Household income assessment'],
        applicationDeadline: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      },
      {
        id: 'ssp-2',
        name: 'Disability Aid Package',
        type: 'Disability Support',
        description: 'Assistance and accessibility support for persons with disabilities.',
        status: 'Coming Soon',
        benefits: ['Medical support', 'Assistive devices'],
        eligibility: ['Valid disability documentation', 'Resident of ONELGA'],
      },
    ]);
  }, []);

  // Form handlers
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setApplicationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApplicationForm(prev => ({
      ...prev,
      [field]: e.target.checked 
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleNext = () => {
    if (applicationStep < 4) {
      setApplicationStep(applicationStep + 1);
    } else {
      handleSubmitApplication();
    }
  };

  const handleBack = () => {
    if (applicationStep > 0) {
      setApplicationStep(applicationStep - 1);
    }
  };

  const handleSubmitApplication = async () => {
    if (!selectedService) return;

    try {
      const payload = {
        type: selectedService.name?.toLowerCase().includes('complaint') ? 'COMPLAINT' : 'SOCIAL_SERVICE',
        serviceId: selectedService.id,
        data: {
          applicantName: `${applicationForm.firstName} ${applicationForm.lastName}`.trim(),
          idNumber: applicationForm.idNumber,
          phoneNumber: applicationForm.phoneNumber,
          email: applicationForm.email,
          address: applicationForm.address,
          householdSize: applicationForm.householdSize,
          dependents: applicationForm.dependents,
          monthlyIncome: applicationForm.monthlyIncome,
          employmentStatus: applicationForm.employmentStatus,
          reasonForApplication: applicationForm.reasonForApplication,
          documents: uploadedDocs.map(d => d.id),
        },
      };
      const resp = await applicationsAPI.createApplication(payload);
      const created: any = resp.data || {};
      const newApplication: SocialApplication = {
        id: created.id?.toString() || Math.random().toString(),
        serviceId: created.serviceId || selectedService.id,
        serviceName: created.serviceName || selectedService.name,
        applicantName: `${applicationForm.firstName} ${applicationForm.lastName}`,
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'Submitted',
        referenceNumber: `SS${Date.now()}`,
      };

      setApplications(prev => [newApplication, ...prev]);
      toast.success('Application submitted successfully!');
      setShowApplicationDialog(false);
      setApplicationStep(0);
      resetApplicationForm();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // Log error details in development for debugging
        // eslint-disable-next-line no-console
        console.error('Social Security application submission error:', error);
      }
      toast.error('Failed to submit application. Please try again or contact support if the problem persists.');
    }
  };

  const resetApplicationForm = () => {
    setApplicationForm({
      firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: '',
      maritalStatus: '', idNumber: '', phoneNumber: '', email: '', address: '',
      stateOfOrigin: '', lgaOfOrigin: '', householdSize: '', dependents: '',
      monthlyIncome: '', employmentStatus: '', employerName: '', occupation: '',
      disabilities: [], medicalConditions: [], healthInsurance: '', medicalNeeds: '',
      bankName: '', accountNumber: '', bvn: '', otherBenefits: [],
      emergencyContactName: '', emergencyContactRelationship: '', emergencyContactPhone: '',
      reasonForApplication: '', previousApplications: '', supportingDocuments: []
    });
    setUploadedDocs([]);
    setSelectedFile(null);
    setUploadingDoc(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': case 'Active': case 'Approved': case 'Completed': return 'success';
      case 'Limited': case 'Under Review': case 'Assessment': case 'Document Verification': return 'warning';
      case 'Seasonal': case 'Draft': return 'info';
      case 'Suspended': case 'Rejected': return 'error';
      default: return 'primary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Welfare Programs': return <MonetizationOn />;
      case 'Disability Support': return <Accessibility />;
      case 'Elderly Care': return <Elderly />;
      case 'Child Support': return <ChildCare />;
      case 'Healthcare Assistance': return <LocalHospital />;
      case 'Education Support': return <School />;
      case 'Housing Assistance': return <Home />;
      case 'Employment Support': return <Work />;
      default: return <Security />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
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
      {socialServices.map((service) => (
        <Grid item xs={12} md={6} lg={4} key={service.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getCategoryIcon(service.category)}
                <Typography variant="h6" component="h3" sx={{ ml: 1, flexGrow: 1 }}>
                  {service.name}
                </Typography>
                {service.priority && (
                  <Chip
                    label={service.priority}
                    size="small"
                    color={service.priority === 'High' ? 'error' : service.priority === 'Medium' ? 'warning' : 'default'}
                    variant="outlined"
                  />
                )}
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
              
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Processing: {service.processingTime}
                  </Typography>
                </Box>
              </Stack>
              
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2" fontWeight="medium">
                    Eligibility & Benefits
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Eligibility Criteria:
                  </Typography>
                  <List dense>
                    {service.eligibilityCriteria.map((criteria, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText 
                          primary={criteria} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    Benefits:
                  </Typography>
                  <List dense>
                    {service.benefits.map((benefit, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText 
                          primary={benefit} 
                          primaryTypographyProps={{ variant: 'body2', color: 'success.main' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'space-between' }}>
              <Button
                size="small"
                startIcon={<Info />}
                onClick={() => {
                  setSelectedService(service);
                  // Show service details dialog
                }}
              >
                Details
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAdd />}
                disabled={service.status === 'Suspended'}
                onClick={() => {
                  setSelectedService(service);
                  setShowApplicationDialog(true);
                }}
              >
                Apply
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderApplications = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          My Applications
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Search />}
          onClick={() => {
            // Show search dialog
          }}
        >
          Search Applications
        </Button>
      </Box>

      {applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Applications Found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You haven't submitted any social security applications yet.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => setSelectedTab(0)}
          >
            Browse Services
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {applications.map((application) => (
            <Grid item xs={12} md={6} key={application.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      {application.serviceName}
                    </Typography>
                    <Chip
                      label={application.status}
                      size="small"
                      color={getStatusColor(application.status) as any}
                    />
                  </Box>
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {application.applicantName}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Receipt fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        Ref: {application.referenceNumber || 'Pending'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        Applied: {formatDate(application.applicationDate)}
                      </Typography>
                    </Box>
                    
                    {application.benefitAmount && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MonetizationOn fontSize="small" color="success" />
                        <Typography variant="body2" color="success.main" sx={{ ml: 1 }}>
                          Monthly Benefit: {formatCurrency(application.benefitAmount)}
                        </Typography>
                      </Box>
                    )}
                    
                    {application.caseworker && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Support fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          Caseworker: {application.caseworker}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
                
                <CardActions>
                  <Button size="small" startIcon={<Visibility />}>
                    View Details
                  </Button>
                  {application.status === 'Draft' && (
                    <Button size="small" startIcon={<Edit />}>
                      Edit
                    </Button>
                  )}
                  <Button size="small" startIcon={<Download />}>
                    Documents
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderBeneficiaries = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Beneficiaries Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setBeneficiaryDialog(true)}
        >
          Register Beneficiary
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>ID Number</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Active Programs</TableCell>
              <TableCell>Monthly Benefits</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {beneficiaries.map((beneficiary) => (
              <TableRow key={beneficiary.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {beneficiary.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {beneficiary.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {beneficiary.gender}, {new Date().getFullYear() - new Date(beneficiary.dateOfBirth).getFullYear()} years
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{beneficiary.idNumber}</TableCell>
                <TableCell>
                  <Typography variant="body2">{beneficiary.phoneNumber}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {beneficiary.address.substring(0, 30)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Badge badgeContent={beneficiary.activePrograms.length} color="primary">
                    <Chip label="Programs" size="small" />
                  </Badge>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    {formatCurrency(
                      beneficiary.activePrograms.reduce((sum, program) => sum + program.monthlyBenefit, 0)
                    )}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => setSelectedBeneficiary(beneficiary)}
                  >
                    <Tooltip title="View Details">
                      <Visibility />
                    </Tooltip>
                  </IconButton>
                  <IconButton size="small">
                    <Tooltip title="Edit">
                      <Edit />
                    </Tooltip>
                  </IconButton>
                  <IconButton size="small">
                    <Tooltip title="Print Report">
                      <Print />
                    </Tooltip>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );

  const renderApplicationSteps = () => {
    const steps = ['Personal Info', 'Household Details', 'Financial Info', 'Documents', 'Review & Submit'];
    
    return (
      <Box>
        <Stepper activeStep={applicationStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {applicationStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={applicationForm.firstName}
                onChange={handleInputChange('firstName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={applicationForm.lastName}
                onChange={handleInputChange('lastName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={applicationForm.dateOfBirth}
                onChange={handleInputChange('dateOfBirth')}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={applicationForm.gender}
                onChange={handleInputChange('gender')}
                required
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={applicationForm.phoneNumber}
                onChange={handleInputChange('phoneNumber')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={applicationForm.address}
                onChange={handleInputChange('address')}
                required
              />
            </Grid>
          </Grid>
        )}

        {applicationStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Household Size"
                type="number"
                value={applicationForm.householdSize}
                onChange={handleInputChange('householdSize')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Dependents"
                type="number"
                value={applicationForm.dependents}
                onChange={handleInputChange('dependents')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Employment Status"
                value={applicationForm.employmentStatus}
                onChange={handleInputChange('employmentStatus')}
                required
              >
                <MenuItem value="Unemployed">Unemployed</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Self-employed">Self-employed</MenuItem>
                <MenuItem value="Retired">Retired</MenuItem>
                <MenuItem value="Disabled">Disabled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Income (₦)"
                type="number"
                value={applicationForm.monthlyIncome}
                onChange={handleInputChange('monthlyIncome')}
                required
              />
            </Grid>
          </Grid>
        )}

        {applicationStep === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                value={applicationForm.bankName}
                onChange={handleInputChange('bankName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Number"
                value={applicationForm.accountNumber}
                onChange={handleInputChange('accountNumber')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                value={applicationForm.emergencyContactName}
                onChange={handleInputChange('emergencyContactName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                value={applicationForm.emergencyContactPhone}
                onChange={handleInputChange('emergencyContactPhone')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Application"
                multiline
                rows={3}
                value={applicationForm.reasonForApplication}
                onChange={handleInputChange('reasonForApplication')}
                required
              />
            </Grid>
          </Grid>
        )}

        {applicationStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>Upload Supporting Documents</Typography>
            <Alert severity="info" sx={{ mb: 2 }}>Accepted: PDF, JPG, PNG. Max 10MB per file.</Alert>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Button variant="outlined" component="label" startIcon={<Upload />}>
                Select File
                <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png" />
              </Button>
              <Button variant="contained" disabled={!selectedFile || uploadingDoc} onClick={async () => {
                if (!selectedFile) return;
                try {
                  setUploadingDoc(true);
                  const res = await documentsAPI.upload(selectedFile);
                  const doc = (res as any).data || res;
                  setUploadedDocs(prev => [...prev, { id: doc.id, name: doc.name }]);
                  setSelectedFile(null);
                  toast.success('Document uploaded');
                } catch (e) {
                  toast.error('Failed to upload document');
                } finally {
                  setUploadingDoc(false);
                }
              }}>Upload</Button>
            </Stack>
            {uploadedDocs.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Uploaded</Typography>
                <List dense>
                  {uploadedDocs.map((d) => (
                    <ListItem key={d.id} sx={{ py: 0 }}>
                      <ListItemIcon><Description /></ListItemIcon>
                      <ListItemText primary={d.name} secondary={d.id} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        )}

        {applicationStep === 4 && selectedService && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review your application details before submitting.
            </Alert>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Application Summary
              </Typography>
              <Typography variant="body1"><strong>Service:</strong> {selectedService.name}</Typography>
              <Typography variant="body1"><strong>Applicant:</strong> {applicationForm.firstName} {applicationForm.lastName}</Typography>
              <Typography variant="body1"><strong>Phone:</strong> {applicationForm.phoneNumber}</Typography>
              <Typography variant="body1"><strong>Household Size:</strong> {applicationForm.householdSize}</Typography>
              <Typography variant="body1"><strong>Monthly Income:</strong> ₦{applicationForm.monthlyIncome}</Typography>
              <Typography variant="body1"><strong>Employment:</strong> {applicationForm.employmentStatus}</Typography>
            </Paper>
          </Box>
        )}
      </Box>
    );
  };

  const renderPrograms = () => (
    <Grid container spacing={3}>
      {programs.map((program) => (
        <Grid item xs={12} md={6} key={program.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Group />
                <Box sx={{ ml: 1, flexGrow: 1 }}>
                  <Typography variant="h6" component="h3">{program.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{program.type}</Typography>
                </Box>
                <Chip label={program.status} size="small" color={program.status === 'Open' ? 'success' : program.status === 'Waitlist' ? 'warning' : 'default'} />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {program.description}
              </Typography>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2" fontWeight="medium">Benefits & Eligibility</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" color="text.secondary" gutterBottom>Benefits:</Typography>
                  <List dense>
                    {program.benefits.map((b, i) => (
                      <ListItem key={i} sx={{ py: 0 }}><ListItemText primary={`• ${b}`} primaryTypographyProps={{ variant: 'body2' }} /></ListItem>
                    ))}
                  </List>
                  <Typography variant="caption" color="text.secondary" gutterBottom>Eligibility:</Typography>
                  <List dense>
                    {program.eligibility.map((e, i) => (
                      <ListItem key={i} sx={{ py: 0 }}><ListItemText primary={`• ${e}`} primaryTypographyProps={{ variant: 'body2' }} /></ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={<PersonAdd />}
                disabled={program.status !== 'Open'}
                onClick={() => {
                  // Reuse service application flow by seeding a pseudo-service
                  setSelectedService({
                    id: program.id,
                    name: program.name,
                    description: program.description,
                    category: 'Welfare Programs',
                    eligibilityCriteria: program.eligibility,
                    benefits: program.benefits,
                    requirements: [],
                    processingTime: '2-4 weeks',
                    status: 'Available',
                  } as any);
                  setShowApplicationDialog(true);
                }}
              >
                Apply
              </Button>
              <Button size="small" startIcon={<Visibility />}>Learn More</Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Social Security Services
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Comprehensive social welfare and support programs for Onelga citizens
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access financial assistance, healthcare support, disability benefits, and other social services designed to support vulnerable members of our community.
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} aria-label="social security tabs">
          <Tab icon={<Security />} label="Services" />
          <Tab icon={<Group />} label="Programs" />
          <Tab icon={<Assignment />} label="My Applications" />
          <Tab icon={<Group />} label="Beneficiaries" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {selectedTab === 0 && renderServices()}
      {selectedTab === 1 && renderPrograms()}
      {selectedTab === 2 && renderApplications()}
      {selectedTab === 3 && renderBeneficiaries()}

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
          {renderApplicationSteps()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApplicationDialog(false)}>Cancel</Button>
          {applicationStep > 0 && (
            <Button onClick={handleBack}>Back</Button>
          )}
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={!selectedService}
          >
            {applicationStep === 3 ? 'Submit Application' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Additional dialogs can be added here */}
    </Container>
  );
};

export default SocialSecurityPage;
