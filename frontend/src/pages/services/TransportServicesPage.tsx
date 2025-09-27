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
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Select,
  InputLabel,
} from '@mui/material';
import {
  DirectionsCar,
  DriveEta,
  LocalShipping,
  TwoWheeler,
  DirectionsBus,
  LocalTaxi,
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
  Traffic,
  Navigation,
  VerifiedUser,
  Print,
  Search,
  Cancel,
  Update,
  Info,
  Support,
  Speed,
  Security,
  Map,
  Route,
  LocalGasStation,
  CarRepair,
  School,
  EmergencyShare,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface TransportService {
  id: string;
  name: string;
  description: string;
  category: 'Vehicle Registration' | 'Driver License' | 'Permits' | 'Public Transport' | 'Road Services' | 'Commercial Transport';
  requirements: string[];
  processingTime: string;
  cost: string;
  validity: string;
  status: 'Available' | 'Limited' | 'Seasonal' | 'Suspended';
  priority?: 'High' | 'Medium' | 'Low';
  documents: string[];
  renewalRequired: boolean;
}

interface TransportApplication {
  id: string;
  serviceId: string;
  serviceName: string;
  applicantName: string;
  applicationDate: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Document Verification' | 'Testing' | 'Approved' | 'Ready for Collection' | 'Completed' | 'Rejected' | 'Expired';
  referenceNumber?: string;
  licenseNumber?: string;
  plateNumber?: string;
  expiryDate?: string;
  testDate?: string;
  collectionDate?: string;
  officer?: string;
  notes?: string;
  fee?: number;
}

interface Vehicle {
  id: string;
  ownerName: string;
  plateNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  color: string;
  engineNumber: string;
  chassisNumber: string;
  registrationDate: string;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Suspended' | 'Impounded';
  insuranceStatus: 'Valid' | 'Expired' | 'None';
  roadworthiness: 'Valid' | 'Due' | 'Expired';
  violations: number;
}

interface DriverLicense {
  id: string;
  driverName: string;
  licenseNumber: string;
  licenseClass: string;
  issueDate: string;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Suspended' | 'Revoked';
  endorsements: string[];
  violations: number;
  points: number;
  restrictions?: string[];
}

const TransportServicesPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<TransportService | null>(null);
  const [applications, setApplications] = useState<TransportApplication[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [licenses, setLicenses] = useState<DriverLicense[]>([]);
  const [applicationStep, setApplicationStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const [applicationForm, setApplicationForm] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '',
    address: '',
    stateOfOrigin: '',
    lgaOfOrigin: '',
    occupation: '',
    employerAddress: '',
    
    // License Information
    licenseClass: '',
    previousLicense: '',
    experienceYears: '',
    medicalFitness: '',
    
    // Vehicle Information
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    engineNumber: '',
    chassisNumber: '',
    customsDocuments: '',
    
    // Commercial Information
    businessName: '',
    businessAddress: '',
    routeDetails: '',
    operatingHours: '',
    vehicleCapacity: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    
    // Documents
    uploadedDocuments: [] as string[],
    agreeToTerms: false,
  });

  // Mock transport services data
  const transportServices: TransportService[] = [
    {
      id: '1',
      name: 'Vehicle Registration',
      description: 'Register new vehicles and obtain license plates',
      category: 'Vehicle Registration',
      requirements: [
        'Certificate of Ownership or Purchase Receipt',
        'Valid Driver\'s License',
        'Vehicle Insurance Certificate',
        'Roadworthiness Certificate',
        'Customs Duty Payment (for imported vehicles)'
      ],
      processingTime: '3-5 working days',
      cost: '₦15,000 - ₦35,000 (depending on vehicle type)',
      validity: '1 year (renewable)',
      status: 'Available',
      priority: 'High',
      documents: ['Vehicle Papers', 'Insurance', 'ID Card', 'Passport Photos'],
      renewalRequired: true
    },
    {
      id: '2',
      name: 'Driver\'s License (New Application)',
      description: 'Apply for a new driver\'s license for first-time drivers',
      category: 'Driver License',
      requirements: [
        'Valid means of identification',
        'Medical fitness certificate',
        'Driving school certificate',
        'Biometric data capture',
        'Pass written and practical tests'
      ],
      processingTime: '2-3 weeks (including test scheduling)',
      cost: '₦6,350 (Federal Road Safety Corps fee)',
      validity: '5 years',
      status: 'Available',
      priority: 'High',
      documents: ['Medical Certificate', 'Driving School Certificate', 'ID Card', 'Passport Photos'],
      renewalRequired: true
    },
    {
      id: '3',
      name: 'Driver\'s License Renewal',
      description: 'Renew existing driver\'s license before expiry',
      category: 'Driver License',
      requirements: [
        'Current driver\'s license',
        'Medical fitness certificate',
        'Biometric verification',
        'Valid identification'
      ],
      processingTime: '1-2 working days',
      cost: '₦5,350',
      validity: '5 years',
      status: 'Available',
      priority: 'Medium',
      documents: ['Current License', 'Medical Certificate', 'ID Card'],
      renewalRequired: true
    },
    {
      id: '4',
      name: 'Commercial Vehicle Permit',
      description: 'Permit for commercial transportation services',
      category: 'Permits',
      requirements: [
        'Commercial driver\'s license',
        'Vehicle registration documents',
        'Business registration certificate',
        'Route application form',
        'Vehicle inspection certificate'
      ],
      processingTime: '1-2 weeks',
      cost: '₦25,000 - ₦50,000 (depending on route)',
      validity: '1 year',
      status: 'Available',
      priority: 'Medium',
      documents: ['Business Certificate', 'Vehicle Papers', 'Route Plan', 'Insurance'],
      renewalRequired: true
    },
    {
      id: '5',
      name: 'Motorcycle/Tricycle Registration',
      description: 'Registration for motorcycles and tricycles',
      category: 'Vehicle Registration',
      requirements: [
        'Purchase receipt or ownership documents',
        'Motorcycle rider\'s license',
        'Insurance certificate',
        'Roadworthiness certificate (for tricycles)',
        'Union membership (where applicable)'
      ],
      processingTime: '2-3 working days',
      cost: '₦8,000 - ₦12,000',
      validity: '1 year',
      status: 'Available',
      priority: 'Medium',
      documents: ['Purchase Receipt', 'Insurance', 'Union Card', 'ID Card'],
      renewalRequired: true
    },
    {
      id: '6',
      name: 'Public Transport Route License',
      description: 'License for operating public transportation on specific routes',
      category: 'Public Transport',
      requirements: [
        'Commercial vehicle registration',
        'Professional driver\'s license',
        'Route feasibility study',
        'Financial capacity certificate',
        'Vehicle roadworthiness certificate'
      ],
      processingTime: '3-4 weeks',
      cost: '₦35,000 - ₦75,000',
      validity: '2 years',
      status: 'Limited',
      priority: 'Medium',
      documents: ['Feasibility Study', 'Financial Certificate', 'Vehicle Papers'],
      renewalRequired: true
    },
    {
      id: '7',
      name: 'Roadworthiness Certificate',
      description: 'Annual vehicle inspection and roadworthiness certification',
      category: 'Road Services',
      requirements: [
        'Vehicle registration documents',
        'Valid insurance certificate',
        'Vehicle physical inspection',
        'Emission test certificate'
      ],
      processingTime: '1 day (after inspection)',
      cost: '₦5,000 - ₦8,000',
      validity: '1 year',
      status: 'Available',
      priority: 'High',
      documents: ['Vehicle Registration', 'Insurance Certificate'],
      renewalRequired: true
    },
    {
      id: '8',
      name: 'Hackney Carriage License',
      description: 'License for taxi and ride-hailing services',
      category: 'Commercial Transport',
      requirements: [
        'Professional driver\'s license',
        'Vehicle registration (not older than 10 years)',
        'Comprehensive insurance',
        'Police clearance certificate',
        'Medical fitness certificate'
      ],
      processingTime: '1-2 weeks',
      cost: '₦20,000 - ₦30,000',
      validity: '1 year',
      status: 'Available',
      priority: 'Medium',
      documents: ['Police Clearance', 'Medical Certificate', 'Vehicle Papers', 'Insurance'],
      renewalRequired: true
    }
  ];

  // Mock applications data
  React.useEffect(() => {
    const mockApplications: TransportApplication[] = [
      {
        id: '1',
        serviceId: '1',
        serviceName: 'Vehicle Registration',
        applicantName: 'John Doe',
        applicationDate: '2024-01-15',
        status: 'Ready for Collection',
        referenceNumber: 'VR2024001',
        plateNumber: 'OGL-123-AB',
        expiryDate: '2025-01-15',
        officer: 'Inspector James',
        fee: 25000
      },
      {
        id: '2',
        serviceId: '2',
        serviceName: 'Driver\'s License (New Application)',
        applicantName: 'Jane Smith',
        applicationDate: '2024-01-20',
        status: 'Testing',
        referenceNumber: 'DL2024002',
        testDate: '2024-02-05',
        officer: 'Officer Mary'
      }
    ];
    setApplications(mockApplications);

    // Mock vehicles data
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        ownerName: 'John Doe',
        plateNumber: 'OGL-123-AB',
        vehicleType: 'Private Car',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Silver',
        engineNumber: 'ENG123456',
        chassisNumber: 'CHS789012',
        registrationDate: '2024-01-15',
        expiryDate: '2025-01-15',
        status: 'Active',
        insuranceStatus: 'Valid',
        roadworthiness: 'Valid',
        violations: 0
      }
    ];
    setVehicles(mockVehicles);

    // Mock licenses data
    const mockLicenses: DriverLicense[] = [
      {
        id: '1',
        driverName: 'John Doe',
        licenseNumber: 'OGL001234567',
        licenseClass: 'Class C (Private)',
        issueDate: '2024-01-20',
        expiryDate: '2029-01-20',
        status: 'Active',
        endorsements: [],
        violations: 0,
        points: 0
      }
    ];
    setLicenses(mockLicenses);
  }, []);

  // Form handlers
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setApplicationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (applicationStep < 3) {
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newApplication: TransportApplication = {
        id: Date.now().toString(),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        applicantName: `${applicationForm.firstName} ${applicationForm.lastName}`,
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'Submitted',
        referenceNumber: `TR${Date.now()}`,
      };

      setApplications(prev => [newApplication, ...prev]);
      toast.success('Application submitted successfully!');
      setShowApplicationDialog(false);
      setApplicationStep(0);
      resetApplicationForm();
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const resetApplicationForm = () => {
    setApplicationForm({
      firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: '',
      phoneNumber: '', email: '', address: '', stateOfOrigin: '', lgaOfOrigin: '',
      occupation: '', employerAddress: '', licenseClass: '', previousLicense: '',
      experienceYears: '', medicalFitness: '', vehicleType: '', vehicleMake: '',
      vehicleModel: '', vehicleYear: '', vehicleColor: '', engineNumber: '',
      chassisNumber: '', customsDocuments: '', businessName: '', businessAddress: '',
      routeDetails: '', operatingHours: '', vehicleCapacity: '', emergencyContactName: '',
      emergencyContactPhone: '', emergencyContactRelationship: '', uploadedDocuments: [],
      agreeToTerms: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': case 'Active': case 'Approved': case 'Completed': case 'Valid': return 'success';
      case 'Limited': case 'Under Review': case 'Testing': case 'Document Verification': case 'Due': return 'warning';
      case 'Seasonal': case 'Draft': case 'Ready for Collection': return 'info';
      case 'Suspended': case 'Rejected': case 'Expired': case 'Revoked': case 'Impounded': return 'error';
      default: return 'primary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Vehicle Registration': return <DirectionsCar />;
      case 'Driver License': return <VerifiedUser />;
      case 'Permits': return <Assignment />;
      case 'Public Transport': return <DirectionsBus />;
      case 'Road Services': return <CarRepair />;
      case 'Commercial Transport': return <LocalTaxi />;
      default: return <DirectionsCar />;
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
      {transportServices.map((service) => (
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
                    {service.processingTime}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {service.cost}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Valid for: {service.validity}
                  </Typography>
                </Box>
              </Stack>
              
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2" fontWeight="medium">
                    Requirements & Documents
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Required Documents:
                  </Typography>
                  <List dense>
                    {service.documents.map((doc, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText 
                          primary={doc} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    Requirements:
                  </Typography>
                  <List dense>
                    {service.requirements.map((req, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText 
                          primary={req} 
                          primaryTypographyProps={{ variant: 'body2' }}
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
            You haven't submitted any transport service applications yet.
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
                    
                    {application.plateNumber && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DirectionsCar fontSize="small" color="success" />
                        <Typography variant="body2" color="success.main" sx={{ ml: 1 }}>
                          Plate: {application.plateNumber}
                        </Typography>
                      </Box>
                    )}
                    
                    {application.licenseNumber && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <VerifiedUser fontSize="small" color="success" />
                        <Typography variant="body2" color="success.main" sx={{ ml: 1 }}>
                          License: {application.licenseNumber}
                        </Typography>
                      </Box>
                    )}
                    
                    {application.testDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <School fontSize="small" color="warning" />
                        <Typography variant="body2" color="warning.main" sx={{ ml: 1 }}>
                          Test Date: {formatDate(application.testDate)}
                        </Typography>
                      </Box>
                    )}
                    
                    {application.officer && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Support fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          Officer: {application.officer}
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
                  {application.status === 'Ready for Collection' && (
                    <Button size="small" startIcon={<Print />} color="success">
                      Print
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderVehicles = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Vehicle Registry
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowVehicleDialog(true)}
        >
          Register Vehicle
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plate Number</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Vehicle Details</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {vehicle.plateNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {vehicle.ownerName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {vehicle.ownerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {vehicle.vehicleType}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{vehicle.make} {vehicle.model}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {vehicle.year} • {vehicle.color}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Chip 
                      label={vehicle.status} 
                      size="small" 
                      color={getStatusColor(vehicle.status) as any}
                    />
                    <Chip 
                      label={`Insurance: ${vehicle.insuranceStatus}`} 
                      size="small" 
                      color={getStatusColor(vehicle.insuranceStatus) as any}
                    />
                    <Chip 
                      label={`Roadworthy: ${vehicle.roadworthiness}`} 
                      size="small" 
                      color={getStatusColor(vehicle.roadworthiness) as any}
                    />
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(vehicle.expiryDate)}</Typography>
                  {vehicle.violations > 0 && (
                    <Badge badgeContent={vehicle.violations} color="error">
                      <Chip label="Violations" size="small" color="error" variant="outlined" />
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => setSelectedVehicle(vehicle)}
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
                    <Tooltip title="Print Certificate">
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

  const renderRoadInfo = () => (
    <Box>
      <Grid container spacing={3}>
        {/* Traffic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Traffic sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  Traffic Updates
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Heavy traffic on Ndoni-Port Harcourt Road"
                    secondary="Expected delay: 30-45 minutes"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Road construction on Hospital Road"
                    secondary="Use alternative routes"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Market Road - Clear"
                    secondary="Normal traffic flow"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Services */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmergencyShare sx={{ fontSize: 40, mr: 2, color: 'error.main' }} />
                <Typography variant="h6">
                  Emergency Services
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Phone color="error" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Emergency Hotline: 199"
                    secondary="24/7 emergency response"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DirectionsCar color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Vehicle Recovery Service"
                    secondary="Call: +234 (0) 803-555-0123"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalGasStation color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Fuel Emergency Service"
                    secondary="24/7 fuel delivery available"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Public Transport */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Public Transportation Routes
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DirectionsBus sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">Route A</Typography>
                    </Box>
                    <Typography variant="body2">
                      Ndoni → Port Harcourt
                    </Typography>
                    <Typography variant="caption">
                      Departure: Every 30 minutes
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocalTaxi sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">Route B</Typography>
                    </Box>
                    <Typography variant="body2">
                      Ndoni → Ahoada
                    </Typography>
                    <Typography variant="caption">
                      Departure: Every 45 minutes
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TwoWheeler sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">Local Routes</Typography>
                    </Box>
                    <Typography variant="body2">
                      Within Onelga Communities
                    </Typography>
                    <Typography variant="caption">
                      Available: 6:00 AM - 10:00 PM
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderApplicationSteps = () => {
    const steps = ['Personal Details', 'Service Info', 'Documents', 'Review & Submit'];
    
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

        {applicationStep === 1 && selectedService && (
          <Grid container spacing={3}>
            {selectedService.category === 'Driver License' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="License Class"
                    value={applicationForm.licenseClass}
                    onChange={handleInputChange('licenseClass')}
                    required
                  >
                    <MenuItem value="Class A">Class A (Motorcycle)</MenuItem>
                    <MenuItem value="Class B">Class B (Tricycle)</MenuItem>
                    <MenuItem value="Class C">Class C (Private Car)</MenuItem>
                    <MenuItem value="Class D">Class D (Commercial)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driving Experience (Years)"
                    type="number"
                    value={applicationForm.experienceYears}
                    onChange={handleInputChange('experienceYears')}
                  />
                </Grid>
              </>
            )}
            
            {selectedService.category === 'Vehicle Registration' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Vehicle Type"
                    value={applicationForm.vehicleType}
                    onChange={handleInputChange('vehicleType')}
                    required
                  >
                    <MenuItem value="Private Car">Private Car</MenuItem>
                    <MenuItem value="Commercial Vehicle">Commercial Vehicle</MenuItem>
                    <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                    <MenuItem value="Tricycle">Tricycle</MenuItem>
                    <MenuItem value="Truck">Truck</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vehicle Make"
                    value={applicationForm.vehicleMake}
                    onChange={handleInputChange('vehicleMake')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vehicle Model"
                    value={applicationForm.vehicleModel}
                    onChange={handleInputChange('vehicleModel')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Year of Manufacture"
                    type="number"
                    value={applicationForm.vehicleYear}
                    onChange={handleInputChange('vehicleYear')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Engine Number"
                    value={applicationForm.engineNumber}
                    onChange={handleInputChange('engineNumber')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Chassis Number"
                    value={applicationForm.chassisNumber}
                    onChange={handleInputChange('chassisNumber')}
                    required
                  />
                </Grid>
              </>
            )}
            
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
          </Grid>
        )}

        {applicationStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Required Documents
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please upload or bring the following documents to complete your application.
            </Alert>
            
            {selectedService && (
              <List>
                {selectedService.documents.map((doc, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Description />
                    </ListItemIcon>
                    <ListItemText primary={doc} />
                  </ListItem>
                ))}
              </List>
            )}
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={applicationForm.agreeToTerms}
                  onChange={handleInputChange('agreeToTerms')}
                  required
                />
              }
              label="I agree to the terms and conditions and certify that all information provided is accurate"
            />
          </Box>
        )}

        {applicationStep === 3 && selectedService && (
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
              <Typography variant="body1"><strong>Processing Time:</strong> {selectedService.processingTime}</Typography>
              <Typography variant="body1"><strong>Cost:</strong> {selectedService.cost}</Typography>
              <Typography variant="body1"><strong>Validity:</strong> {selectedService.validity}</Typography>
            </Paper>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Transport Services
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Vehicle registration, driver licensing, and transportation services for Onelga citizens
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete vehicle registration, apply for driver\'s licenses, obtain permits, and access public transportation information all in one place.
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} aria-label="transport services tabs">
          <Tab icon={<Assignment />} label="Services" />
          <Tab icon={<Receipt />} label="My Applications" />
          <Tab icon={<DirectionsCar />} label="Vehicles" />
          <Tab icon={<Traffic />} label="Road Info" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {selectedTab === 0 && renderServices()}
      {selectedTab === 1 && renderApplications()}
      {selectedTab === 2 && renderVehicles()}
      {selectedTab === 3 && renderRoadInfo()}

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
            disabled={!selectedService || (applicationStep === 2 && !applicationForm.agreeToTerms)}
          >
            {applicationStep === 3 ? 'Submit Application' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Additional dialogs can be added here */}
    </Container>
  );
};

export default TransportServicesPage;
