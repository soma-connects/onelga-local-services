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
} from '@mui/material';
import {
  Home,
  Construction,
  Assignment,
  LocationOn,
  AttachMoney,
  Schedule,
  Add,
  Visibility,
  Edit,
  Download,
  CheckCircle,
  Warning,
  Build,
  Landscape,
  WaterDrop,
  ElectricalServices,
  Security,
  Phone,
  Email,
  ExpandMore,
  Map,
  Apartment,
  Villa,
  Business,
  AccountBalance,
  Receipt,
  Description,
  CalendarToday,
  Person,
  Group,
  FamilyRestroom,
  Accessible,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { servicesAPI, applicationsAPI } from '../../services/api';

interface HousingService {
  id: string;
  name: string;
  description: string;
  category: 'Housing Assistance' | 'Building Permits' | 'Property Services' | 'Land Registration' | 'Utilities';
  eligibility: string[];
  requirements: string[];
  processingTime: string;
  cost: string;
  status: 'Available' | 'Limited' | 'Unavailable' | 'Seasonal';
  priority?: 'High' | 'Medium' | 'Low';
}

interface HousingApplication {
  id: string;
  serviceId: string;
  serviceName: string;
  applicantName: string;
  propertyAddress: string;
  applicationDate: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Site Visit' | 'Approved' | 'Rejected' | 'Completed';
  referenceNumber?: string;
  estimatedCost?: string;
  completionDate?: string;
  notes?: string;
}

interface PropertyRecord {
  id: string;
  propertyType: 'Residential' | 'Commercial' | 'Industrial' | 'Land';
  address: string;
  owner: string;
  registrationNumber: string;
  size: string;
  value: string;
  status: 'Active' | 'Pending' | 'Disputed' | 'Transferred';
  registrationDate: string;
  permits: string[];
}

interface HousingProgram {
  id: string;
  name: string;
  type: 'Affordable Housing' | 'First-Time Buyer' | 'Senior Citizen' | 'Low Income' | 'Special Needs';
  description: string;
  benefits: string[];
  eligibility: string[];
  applicationDeadline: string;
  availableUnits?: number;
  status: 'Open' | 'Closed' | 'Waitlist' | 'Coming Soon';
}

const HousingServicesPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showProgramDialog, setShowProgramDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<HousingService | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<HousingProgram | null>(null);
  const [applications, setApplications] = useState<HousingApplication[]>([]);
  const [propertyRecords, setPropertyRecords] = useState<PropertyRecord[]>([]);
  const [applicationStep, setApplicationStep] = useState(0);
  const [applicationForm, setApplicationForm] = useState({
    applicantName: '',
    phoneNumber: '',
    email: '',
    address: '',
    propertyAddress: '',
    propertyType: '',
    proposedUse: '',
    estimatedCost: '',
    projectDescription: '',
    hasUtilities: false,
    hasAccess: false,
    emergencyContact: '',
    additionalInfo: ''
  });

  const applicationSteps = ['Basic Information', 'Property Details', 'Project Description', 'Review & Submit'];

  const [housingServices, setHousingServices] = useState<HousingService[]>([]);

  const [housingPrograms, setHousingPrograms] = useState<HousingProgram[]>([]);

  // Fallback programs (shown if backend does not provide programs)
  const programsFallback: HousingProgram[] = [
    {
      id: 'prog-1',
      name: 'Affordable Housing Initiative',
      type: 'Affordable Housing',
      description: 'Subsidized housing for low and middle income families within ONELGA.',
      benefits: ['Subsidized rent', 'Priority allocation', 'Community services access'],
      eligibility: ['Resident of ONELGA', 'Valid ID', 'Income assessment'],
      applicationDeadline: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      availableUnits: 25,
      status: 'Open',
    },
    {
      id: 'prog-2',
      name: 'First-Time Home Buyer Support',
      type: 'First-Time Buyer',
      description: 'Support package for first-time home buyers including counseling and documentation assistance.',
      benefits: ['Documentation assistance', 'Discounted fees', 'Priority processing'],
      eligibility: ['First-time buyer', 'Resident of ONELGA'],
      applicationDeadline: new Date(Date.now() + 45*24*60*60*1000).toISOString(),
      status: 'Waitlist',
    },
    {
      id: 'prog-3',
      name: 'Senior Citizen Housing Aid',
      type: 'Senior Citizen',
      description: 'Assistance program for senior citizens for housing upgrades and accessibility.',
      benefits: ['Accessibility upgrades', 'Maintenance aid'],
      eligibility: ['Age 60+', 'Resident of ONELGA'],
      applicationDeadline: new Date(Date.now() + 60*24*60*60*1000).toISOString(),
      status: 'Coming Soon',
    },
  ];

  // Load services and applications from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const resp = await servicesAPI.getServices();
        const raw = Array.isArray(resp.data) ? resp.data : (resp.data as any)?.services || [];
        const normalized = raw
          .filter((s: any) => `${s.category || ''}`.toLowerCase().includes('housing'))
          .map((s: any): HousingService => {
            const statusMap: Record<string, HousingService['status']> = {
              available: 'Available',
              'temporarily_unavailable': 'Unavailable',
              coming_soon: 'Limited',
            };
            const st = (s.status || 'available').toString().toLowerCase();
            return {
              id: s.id?.toString() || s._id?.toString() || s.name,
              name: s.name || s.title || 'Service',
              description: s.description || 'No description provided.',
              category: (s.category || 'Property Services') as any,
              eligibility: Array.isArray(s.eligibility) ? s.eligibility : [],
              requirements: Array.isArray(s.requirements) ? s.requirements : [],
              processingTime: s.processingTime || s.sla || '1-3 weeks',
              cost: typeof s.fee === 'number' ? `₦${s.fee.toLocaleString()}` : (s.fee || 'Varies'),
              status: statusMap[st] || 'Available',
              priority: s.priority || undefined,
            };
          });
        setHousingServices(normalized);
      } catch (e) {
        setHousingServices([]);
      }
      // Programs endpoint not defined → show fallback programs
      setHousingPrograms(programsFallback);
    };
    const loadApplications = async () => {
      try {
        const resp = await applicationsAPI.getApplications({ type: 'HOUSING_APPLICATION', limit: 10, page: 1 } as any);
        const data: any = resp.data;
        const apps = Array.isArray(data?.applications) ? data.applications : (Array.isArray(data) ? data : []);
        const mapped: HousingApplication[] = apps.map((app: any) => {
          const stRaw = (app.status || '').toString().toUpperCase();
          const statusMap: Record<string, HousingApplication['status']> = {
            PENDING: 'Submitted',
            UNDER_REVIEW: 'Under Review',
            APPROVED: 'Approved',
            REJECTED: 'Rejected',
            COMPLETED: 'Completed',
          };
          return {
            id: app.id?.toString() || app._id?.toString() || Math.random().toString(),
            serviceId: app.serviceId || app.type || 'housing',
            serviceName: app.serviceName || app.type || 'Housing Service',
            applicantName: app.data?.applicantName || '-',
            propertyAddress: app.data?.propertyAddress || '-',
            applicationDate: app.createdAt || new Date().toISOString(),
            status: statusMap[stRaw] || 'Submitted',
            referenceNumber: app.reference || app.referenceNumber,
            estimatedCost: app.data?.estimatedCost,
            completionDate: app.completionDate,
            notes: app.notes,
          };
        });
        setApplications(mapped);
      } catch (e) {
        setApplications([]);
      }
      setPropertyRecords([]);
    };
    loadServices();
    loadApplications();
  }, []);

  // Handle service application
  const handleApplyForService = (service: HousingService) => {
    setSelectedService(service);
    setApplicationStep(0);
    setShowApplicationDialog(true);
  };

  // Handle program application
  const handleApplyForProgram = (program: HousingProgram) => {
    setSelectedProgram(program);
    setShowProgramDialog(true);
  };

  // Handle application submission
  const handleSubmitApplication = async () => {
    if (!selectedService || !applicationForm.applicantName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        type: 'HOUSING_APPLICATION',
        serviceId: selectedService.id,
        data: {
          applicantName: applicationForm.applicantName,
          phoneNumber: applicationForm.phoneNumber,
          email: applicationForm.email,
          address: applicationForm.address,
          propertyAddress: applicationForm.propertyAddress,
          propertyType: applicationForm.propertyType,
          proposedUse: applicationForm.proposedUse,
          estimatedCost: applicationForm.estimatedCost,
          projectDescription: applicationForm.projectDescription,
          hasUtilities: applicationForm.hasUtilities,
          hasAccess: applicationForm.hasAccess,
          emergencyContact: applicationForm.emergencyContact,
          additionalInfo: applicationForm.additionalInfo,
        },
      };
      const resp = await applicationsAPI.createApplication(payload);
      const created: any = resp.data || {};
      const newApplication: HousingApplication = {
        id: created.id?.toString() || Math.random().toString(),
        serviceId: created.serviceId || selectedService.id,
        serviceName: created.serviceName || selectedService.name,
        applicantName: created.data?.applicantName || applicationForm.applicantName,
        propertyAddress: created.data?.propertyAddress || applicationForm.propertyAddress,
        applicationDate: created.createdAt || new Date().toISOString(),
        status: (created.status || 'Submitted') as HousingApplication['status'],
        referenceNumber: created.reference || created.referenceNumber,
        estimatedCost: created.data?.estimatedCost,
      };

      setApplications(prev => [newApplication, ...prev]);
      toast.success('Application submitted successfully!');
      setShowApplicationDialog(false);
      setShowProgramDialog(false);
      resetForm();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // Log error details in development for debugging
        // eslint-disable-next-line no-console
        console.error('Housing application submission error:', error);
      }
      toast.error('Failed to submit application. Please try again or contact support if the problem persists.');
    }
  };

  const resetForm = () => {
    setApplicationForm({
      applicantName: '',
      phoneNumber: '',
      email: '',
      address: '',
      propertyAddress: '',
      propertyType: '',
      proposedUse: '',
      estimatedCost: '',
      projectDescription: '',
      hasUtilities: false,
      hasAccess: false,
      emergencyContact: '',
      additionalInfo: ''
    });
    setApplicationStep(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
      case 'Open':
      case 'Active':
      case 'Approved':
      case 'Completed':
        return 'success';
      case 'Limited':
      case 'Waitlist':
      case 'Under Review':
      case 'Site Visit':
      case 'Pending':
      case 'Submitted':
        return 'warning';
      case 'Unavailable':
      case 'Closed':
      case 'Rejected':
      case 'Disputed':
        return 'error';
      case 'Seasonal':
      case 'Coming Soon':
      case 'Draft':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Housing Assistance': return <Home />;
      case 'Building Permits': return <Construction />;
      case 'Property Services': return <Assignment />;
      case 'Land Registration': return <Map />;
      case 'Utilities': return <ElectricalServices />;
      default: return <Home />;
    }
  };

  const getProgramIcon = (type: string) => {
    switch (type) {
      case 'First-Time Buyer': return <Home />;
      case 'Senior Citizen': return <Accessible />;
      case 'Low Income': return <Group />;
      case 'Special Needs': return <Accessible />;
      case 'Affordable Housing': return <Apartment />;
      default: return <Home />;
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
      {housingServices.map((service) => (
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
              
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2" fontWeight="medium">
                    Requirements & Eligibility
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Eligibility:
                  </Typography>
                  <List dense>
                    {service.eligibility.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0, pl: 0 }}>
                        <ListItemText primary={`• ${item}`} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Requirements:
                  </Typography>
                  <List dense>
                    {service.requirements.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0, pl: 0 }}>
                        <ListItemText primary={`• ${item}`} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
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

  const renderPrograms = () => (
    <Grid container spacing={3}>
      {housingPrograms.map((program) => (
        <Grid item xs={12} md={6} key={program.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getProgramIcon(program.type)}
                <Box sx={{ ml: 1, flexGrow: 1 }}>
                  <Typography variant="h6" component="h3">
                    {program.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {program.type}
                  </Typography>
                </Box>
                <Chip
                  label={program.status}
                  size="small"
                  color={getStatusColor(program.status) as any}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {program.description}
              </Typography>
              
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Deadline: {formatDate(program.applicationDeadline)}
                  </Typography>
                </Box>
                {program.availableUnits && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Home fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Available: {program.availableUnits} units
                    </Typography>
                  </Box>
                )}
              </Stack>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2" fontWeight="medium">
                    Benefits & Eligibility
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Program Benefits:
                  </Typography>
                  <List dense>
                    {program.benefits.map((benefit, index) => (
                      <ListItem key={index} sx={{ py: 0, pl: 0 }}>
                        <ListItemText primary={`• ${benefit}`} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Eligibility:
                  </Typography>
                  <List dense>
                    {program.eligibility.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0, pl: 0 }}>
                        <ListItemText primary={`• ${item}`} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </CardContent>
            
            <CardActions>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => handleApplyForProgram(program)}
                disabled={program.status === 'Closed'}
              >
                Apply
              </Button>
              <Button size="small" startIcon={<Visibility />}>
                Learn More
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
          You haven't submitted any housing applications yet. Apply for services or programs to get started.
        </Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service/Program</TableCell>
              <TableCell>Applicant</TableCell>
              <TableCell>Property Address</TableCell>
              <TableCell>Reference</TableCell>
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
                    {application.applicantName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {application.propertyAddress}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {application.referenceNumber}
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
                    {(application.status === 'Approved' || application.status === 'Completed') && (
                      <Tooltip title="Download Documents">
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

  const renderPropertyRecords = () => (
    <Box>
      {propertyRecords.length === 0 ? (
        <Alert severity="info">
          No property records available. Records will appear here after property registration.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {propertyRecords.map((record) => (
            <Grid item xs={12} md={6} key={record.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {record.propertyType === 'Residential' ? <Home /> : 
                       record.propertyType === 'Commercial' ? <Business /> : 
                       record.propertyType === 'Industrial' ? <Build /> : <Landscape />}
                    </Avatar>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6">
                        {record.propertyType} Property
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {record.registrationNumber}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {record.address}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Owner
                      </Typography>
                      <Typography variant="body1">
                        {record.owner}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Size
                      </Typography>
                      <Typography variant="body1">
                        {record.size}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Value
                      </Typography>
                      <Typography variant="body1" color="primary" fontWeight="medium">
                        {record.value}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={record.status}
                        size="small"
                        color={getStatusColor(record.status) as any}
                      />
                    </Grid>
                  </Grid>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Permits
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {record.permits.map((permit, index) => (
                      <Chip
                        key={index}
                        label={permit}
                        size="small"
                        variant="outlined"
                        color="success"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                  
                  <Button
                    size="small"
                    startIcon={<Download />}
                    sx={{ mt: 2 }}
                  >
                    Download Documents
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderApplicationStep = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={applicationForm.applicantName}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, applicantName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={applicationForm.phoneNumber}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={applicationForm.email}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={applicationForm.emergencyContact}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Address"
                multiline
                rows={2}
                value={applicationForm.address}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Address"
                multiline
                rows={2}
                value={applicationForm.propertyAddress}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, propertyAddress: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Property Type"
                value={applicationForm.propertyType}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, propertyType: e.target.value }))}
                required
              >
                <MenuItem value="Residential">Residential</MenuItem>
                <MenuItem value="Commercial">Commercial</MenuItem>
                <MenuItem value="Industrial">Industrial</MenuItem>
                <MenuItem value="Mixed-use">Mixed-use</MenuItem>
                <MenuItem value="Land">Vacant Land</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Proposed Use"
                value={applicationForm.proposedUse}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, proposedUse: e.target.value }))}
                helperText="e.g., Single family home, Office building, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={applicationForm.hasUtilities}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, hasUtilities: e.target.checked }))}
                    />
                  }
                  label="Utilities available"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={applicationForm.hasAccess}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, hasAccess: e.target.checked }))}
                    />
                  }
                  label="Road access available"
                />
              </Stack>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Project Cost"
                value={applicationForm.estimatedCost}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, estimatedCost: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Project Description"
                value={applicationForm.projectDescription}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, projectDescription: e.target.value }))}
                helperText="Provide detailed description of your project"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Information"
                value={applicationForm.additionalInfo}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                helperText="Any other relevant information"
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Application Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Service</Typography>
                <Typography variant="body1">{selectedService?.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Applicant</Typography>
                <Typography variant="body1">{applicationForm.applicantName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{applicationForm.phoneNumber}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{applicationForm.email}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Property Address</Typography>
                <Typography variant="body1">{applicationForm.propertyAddress}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Property Type</Typography>
                <Typography variant="body1">{applicationForm.propertyType}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Estimated Cost</Typography>
                <Typography variant="body1">₦{applicationForm.estimatedCost}</Typography>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              Please review all information before submitting. You will receive a confirmation email with your reference number.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🏠 Housing Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access housing assistance, building permits, property services, and affordable housing programs in Onelga LGA.
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
            startIcon={<Construction />}
            size="large"
          >
            Apply for Building Permit
          </Button>
          <Button
            variant="outlined"
            startIcon={<Home />}
            size="large"
          >
            Affordable Housing
          </Button>
          <Button
            variant="outlined"
            startIcon={<Map />}
            size="large"
          >
            Land Registration
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assignment />}
            size="large"
          >
            Property Services
          </Button>
        </Stack>
      </Paper>

      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
          <Tab 
            label="Housing Services" 
            icon={<Badge badgeContent={housingServices.length} color="primary"><Construction /></Badge>} 
          />
          <Tab 
            label="Housing Programs" 
            icon={<Badge badgeContent={housingPrograms.filter(p => p.status === 'Open').length} color="secondary"><Home /></Badge>} 
          />
          <Tab 
            label="My Applications" 
            icon={<Badge badgeContent={applications.length} color="primary"><Assignment /></Badge>} 
          />
          <Tab 
            label="Property Records" 
            icon={<Map />} 
          />
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box>
        {selectedTab === 0 && renderServices()}
        {selectedTab === 1 && renderPrograms()}
        {selectedTab === 2 && renderApplications()}
        {selectedTab === 3 && renderPropertyRecords()}
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
            <Stepper activeStep={applicationStep} sx={{ mb: 4 }}>
              {applicationSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {renderApplicationStep(applicationStep)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setApplicationStep(Math.max(0, applicationStep - 1))}
            disabled={applicationStep === 0}
          >
            Back
          </Button>
          <Button onClick={() => setShowApplicationDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (applicationStep === applicationSteps.length - 1) {
                handleSubmitApplication();
              } else {
                setApplicationStep(applicationStep + 1);
              }
            }}
          >
            {applicationStep === applicationSteps.length - 1 ? 'Submit Application' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Program Application Dialog */}
      <Dialog
        open={showProgramDialog}
        onClose={() => setShowProgramDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Apply for {selectedProgram?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              You are applying for the {selectedProgram?.type} program. 
              {selectedProgram?.availableUnits && `${selectedProgram.availableUnits} units available.`}
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={applicationForm.applicantName}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, applicantName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={applicationForm.phoneNumber}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Address"
                  multiline
                  rows={2}
                  value={applicationForm.address}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Why do you qualify for this program?"
                  value={applicationForm.additionalInfo}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  helperText="Explain your eligibility and housing needs"
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProgramDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitApplication}
            startIcon={<Home />}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HousingServicesPage;
