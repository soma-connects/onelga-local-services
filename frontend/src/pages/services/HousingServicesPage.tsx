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

  // Mock housing services data
  const housingServices: HousingService[] = [
    {
      id: '1',
      name: 'Building Permit Application',
      description: 'Obtain permits for new construction, renovation, or extension of buildings',
      category: 'Building Permits',
      eligibility: ['Property ownership proof', 'Approved building plans', 'Site survey'],
      requirements: ['Certificate of occupancy', 'Structural drawings', 'Environmental impact assessment', 'Payment of fees'],
      processingTime: '21-30 working days',
      cost: '₦50,000 - ₦200,000 (based on project size)',
      status: 'Available',
      priority: 'High'
    },
    {
      id: '2',
      name: 'Certificate of Occupancy',
      description: 'Legal document confirming the right to occupy and use land or building',
      category: 'Property Services',
      eligibility: ['Valid survey plan', 'Property tax payments', 'Development compliance'],
      requirements: ['Survey plan', 'Tax clearance', 'Site inspection report', 'Application form'],
      processingTime: '45-60 working days',
      cost: '₦25,000 - ₦100,000',
      status: 'Available',
      priority: 'High'
    },
    {
      id: '3',
      name: 'Affordable Housing Application',
      description: 'Apply for government-subsidized housing for low-income families',
      category: 'Housing Assistance',
      eligibility: ['Onelga LGA resident', 'Income below threshold', 'First-time home buyer'],
      requirements: ['Income verification', 'Employment letter', 'Bank statements', 'Family size documentation'],
      processingTime: '60-90 working days',
      cost: 'Subsidized (30-50% below market rate)',
      status: 'Available',
      priority: 'Medium'
    },
    {
      id: '4',
      name: 'Land Registration & Title',
      description: 'Register land ownership and obtain legal title documents',
      category: 'Land Registration',
      eligibility: ['Valid land purchase agreement', 'Survey verification', 'Community consent'],
      requirements: ['Purchase agreement', 'Survey plan', 'Tax clearance', 'Community letter'],
      processingTime: '30-45 working days',
      cost: '₦15,000 - ₦40,000',
      status: 'Available',
      priority: 'High'
    },
    {
      id: '5',
      name: 'Property Development Approval',
      description: 'Approval for large-scale property development projects',
      category: 'Building Permits',
      eligibility: ['Environmental clearance', 'Master plan approval', 'Infrastructure assessment'],
      requirements: ['Environmental impact study', 'Development plan', 'Infrastructure plan', 'Public hearing'],
      processingTime: '90-120 working days',
      cost: '₦500,000 - ₦2,000,000',
      status: 'Available',
      priority: 'Medium'
    },
    {
      id: '6',
      name: 'Housing Renovation Grant',
      description: 'Financial assistance for home improvements and repairs',
      category: 'Housing Assistance',
      eligibility: ['Property ownership', 'Income qualification', 'Safety/health needs'],
      requirements: ['Ownership proof', 'Income verification', 'Contractor estimates', 'Safety inspection'],
      processingTime: '30-45 working days',
      cost: 'Grant up to ₦500,000',
      status: 'Limited',
      priority: 'Medium'
    },
    {
      id: '7',
      name: 'Utilities Connection Approval',
      description: 'Approve connections for water, electricity, and sewage systems',
      category: 'Utilities',
      eligibility: ['Valid building permit', 'Utility assessments', 'Safety compliance'],
      requirements: ['Building permit', 'Utility applications', 'Safety certificates', 'Connection fees'],
      processingTime: '14-21 working days',
      cost: '₦10,000 - ₦30,000 per utility',
      status: 'Available',
      priority: 'High'
    },
    {
      id: '8',
      name: 'Property Tax Assessment',
      description: 'Official valuation and tax assessment of properties',
      category: 'Property Services',
      eligibility: ['Property registration', 'Current ownership', 'Development status'],
      requirements: ['Property documents', 'Current photos', 'Measurement survey', 'Application form'],
      processingTime: '21-30 working days',
      cost: '₦8,000 - ₦15,000',
      status: 'Available',
      priority: 'Low'
    }
  ];

  // Mock housing programs
  const housingPrograms: HousingProgram[] = [
    {
      id: '1',
      name: 'Onelga First Home Initiative',
      type: 'First-Time Buyer',
      description: 'Helping first-time home buyers with subsidized mortgage and down payment assistance',
      benefits: ['20% down payment assistance', '5% interest rate subsidy', 'Free legal documentation', 'Property maintenance support'],
      eligibility: ['First-time home buyer', 'Onelga resident for 2+ years', 'Stable income', 'Age 25-45 years'],
      applicationDeadline: '2024-12-31',
      availableUnits: 50,
      status: 'Open'
    },
    {
      id: '2',
      name: 'Senior Citizens Housing Program',
      type: 'Senior Citizen',
      description: 'Specialized housing solutions for senior citizens with accessibility features',
      benefits: ['Accessible housing units', 'Healthcare proximity', 'Community support', 'Maintenance included'],
      eligibility: ['Age 65+ years', 'Onelga resident', 'Limited income', 'Medical needs assessment'],
      applicationDeadline: '2024-10-15',
      availableUnits: 25,
      status: 'Open'
    },
    {
      id: '3',
      name: 'Low Income Housing Support',
      type: 'Low Income',
      description: 'Affordable housing options for families with limited income',
      benefits: ['Subsidized rent', 'Utilities assistance', 'Maintenance support', 'Community facilities'],
      eligibility: ['Income below poverty line', 'Family with children', 'Onelga resident', 'Employment verification'],
      applicationDeadline: '2024-11-30',
      availableUnits: 100,
      status: 'Waitlist'
    },
    {
      id: '4',
      name: 'Disability-Friendly Housing',
      type: 'Special Needs',
      description: 'Housing units designed for persons with disabilities and special needs',
      benefits: ['Wheelchair accessible', 'Special equipment support', 'Caregiver accommodation', 'Transport assistance'],
      eligibility: ['Disability certification', 'Medical assessment', 'Onelga resident', 'Support system availability'],
      applicationDeadline: '2024-09-30',
      availableUnits: 15,
      status: 'Open'
    }
  ];

  // Mock data initialization
  React.useEffect(() => {
    const mockApplications: HousingApplication[] = [
      {
        id: '1',
        serviceId: '1',
        serviceName: 'Building Permit Application',
        applicantName: 'Mrs. Grace Okoro',
        propertyAddress: '45 New Haven Street, Ndoni',
        applicationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Site Visit',
        referenceNumber: 'HOU2024001',
        estimatedCost: '₦150,000',
        notes: 'Site inspection scheduled for next week'
      },
      {
        id: '2',
        serviceId: '3',
        serviceName: 'Affordable Housing Application',
        applicantName: 'Mr. Peter Eze',
        propertyAddress: 'Onelga Housing Estate, Block A',
        applicationDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Approved',
        referenceNumber: 'HOU2024002',
        completionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Housing unit allocated, awaiting final documentation'
      }
    ];
    setApplications(mockApplications);

    const mockPropertyRecords: PropertyRecord[] = [
      {
        id: '1',
        propertyType: 'Residential',
        address: '45 New Haven Street, Ndoni',
        owner: 'Mrs. Grace Okoro',
        registrationNumber: 'OLG/RES/2023/001',
        size: '600 sqm',
        value: '₦15,000,000',
        status: 'Active',
        registrationDate: '2023-08-15',
        permits: ['Building Permit', 'Occupancy Certificate']
      },
      {
        id: '2',
        propertyType: 'Commercial',
        address: '12 Market Street, Ndoni',
        owner: 'Onelga Trading Co.',
        registrationNumber: 'OLG/COM/2023/005',
        size: '800 sqm',
        value: '₦25,000,000',
        status: 'Active',
        registrationDate: '2023-11-22',
        permits: ['Commercial Permit', 'Fire Safety Certificate']
      }
    ];
    setPropertyRecords(mockPropertyRecords);
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newApplication: HousingApplication = {
        id: Date.now().toString(),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        applicantName: applicationForm.applicantName,
        propertyAddress: applicationForm.propertyAddress,
        applicationDate: new Date().toISOString(),
        status: 'Submitted',
        referenceNumber: `HOU${Date.now()}`,
      };

      setApplications(prev => [newApplication, ...prev]);
      toast.success('Application submitted successfully!');
      setShowApplicationDialog(false);
      setShowProgramDialog(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to submit application');
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
