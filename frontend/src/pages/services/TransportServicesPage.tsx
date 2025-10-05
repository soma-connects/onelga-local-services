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
import { servicesAPI, applicationsAPI, documentsAPI } from '../../services/api';

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

  const [transportServices, setTransportServices] = useState<TransportService[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ id: string; name: string }>>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [transportPrograms, setTransportPrograms] = useState<Array<{ id: string; name: string; type: string; description: string; status: 'Open' | 'Waitlist' | 'Closed' | 'Coming Soon'; benefits: string[]; eligibility: string[]; applicationDeadline?: string }>>([]);

  // Load services and applications from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const resp = await servicesAPI.getServices();
        const raw = Array.isArray(resp.data) ? resp.data : (resp.data as any)?.services || [];
        const normalized = raw
          .filter((s: any) => `${s.category || ''}`.toLowerCase().includes('transport'))
          .map((s: any): TransportService => {
            const status = (s.status || 'Available').toString().toLowerCase();
            const statusMap: Record<string, TransportService['status']> = {
              available: 'Available',
              'temporarily_unavailable': 'Suspended',
              coming_soon: 'Seasonal',
            };
            return {
              id: s.id?.toString() || s._id?.toString() || s.name,
              name: s.name || s.title || 'Service',
              description: s.description || 'No description provided.',
              category: (s.category || 'Vehicle Registration') as any,
              requirements: Array.isArray(s.requirements) ? s.requirements : [],
              processingTime: s.processingTime || s.sla || '3-5 days',
              cost: typeof s.fee === 'number' ? `₦${s.fee.toLocaleString()}` : (s.fee || 'Varies'),
              validity: s.validity || '1 year',
              status: statusMap[status] || 'Available',
              priority: s.priority || undefined,
              documents: Array.isArray(s.documents) ? s.documents : [],
              renewalRequired: Boolean(s.renewalRequired),
            };
          });
        setTransportServices(normalized);
      } catch (e) {
        setTransportServices([]);
      }
    };
    const loadApplications = async () => {
      try {
        const resp = await applicationsAPI.getApplications({ type: 'VEHICLE_REGISTRATION', limit: 10, page: 1 } as any);
        const data: any = resp.data;
        const apps = Array.isArray(data?.applications) ? data.applications : (Array.isArray(data) ? data : []);
        const mapped: TransportApplication[] = apps.map((app: any) => ({
          id: app.id?.toString() || app._id?.toString() || Math.random().toString(),
          serviceId: app.serviceId || app.type || 'transport',
          serviceName: app.serviceName || app.type || 'Transport Service',
          applicantName: app.data?.applicantName || '-',
          applicationDate: (app.createdAt || new Date()).toString().split('T')[0],
          status: (app.status || 'Submitted') as TransportApplication['status'],
          referenceNumber: app.reference || app.referenceNumber,
          licenseNumber: app.data?.licenseNumber,
          plateNumber: app.data?.plateNumber,
          expiryDate: app.data?.expiryDate,
          officer: app.officer,
          notes: app.notes,
          fee: app.data?.fee,
        }));
        setApplications(mapped);
      } catch (e) {
        setApplications([]);
      }
      setVehicles([]);
      setLicenses([]);
    };
    loadServices();
    loadApplications();
    // Fallback transport programs
    setTransportPrograms([
      {
        id: 'tp-1',
        name: 'Driver Training Program',
        type: 'Driver License',
        description: 'Official driver training and safety program for new drivers.',
        status: 'Open',
        benefits: ['Training certificate', 'Road safety education'],
        eligibility: ['Resident of ONELGA', '18+ years'],
        applicationDeadline: new Date(Date.now() + 20*24*60*60*1000).toISOString(),
      },
      {
        id: 'tp-2',
        name: 'Public Transport Subsidy',
        type: 'Public Transport',
        description: 'Subsidized fares for students and senior citizens.',
        status: 'Coming Soon',
        benefits: ['Discounted fares'],
        eligibility: ['Valid student ID or age 60+'],
      },
    ]);
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
      const payload = {
        type: selectedService.category === 'Vehicle Registration' ? 'VEHICLE_REGISTRATION' : 'TRANSPORT_SERVICE',
        serviceId: selectedService.id,
        data: {
          applicantName: `${applicationForm.firstName} ${applicationForm.lastName}`.trim(),
          phoneNumber: applicationForm.phoneNumber,
          email: applicationForm.email,
          address: applicationForm.address,
          licenseClass: applicationForm.licenseClass,
          vehicleType: applicationForm.vehicleType,
          vehicleMake: applicationForm.vehicleMake,
          vehicleModel: applicationForm.vehicleModel,
          vehicleYear: applicationForm.vehicleYear,
          vehicleColor: applicationForm.vehicleColor,
          engineNumber: applicationForm.engineNumber,
          chassisNumber: applicationForm.chassisNumber,
          businessName: applicationForm.businessName,
          routeDetails: applicationForm.routeDetails,
          documents: uploadedDocs.map(d => d.id),
        },
      };
      const resp = await applicationsAPI.createApplication(payload);
      const created: any = resp.data || {};
      const newApplication: TransportApplication = {
        id: created.id?.toString() || Math.random().toString(),
        serviceId: created.serviceId || selectedService.id,
        serviceName: created.serviceName || selectedService.name,
        applicantName: created.data?.applicantName || `${applicationForm.firstName} ${applicationForm.lastName}`.trim(),
        applicationDate: (created.createdAt || new Date()).toString().split('T')[0],
        status: (created.status || 'Submitted') as TransportApplication['status'],
        referenceNumber: created.reference || created.referenceNumber,
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
        console.error('Transport application submission error:', error);
      }
      toast.error('Failed to submit application. Please try again or contact support if the problem persists.');
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
    setUploadedDocs([]);
    setSelectedFile(null);
    setUploadingDoc(false);
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
              Documents
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
            
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
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
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
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

  const renderPrograms = () => (
    <Grid container spacing={3}>
      {transportPrograms.map((program) => (
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
                  setSelectedService({
                    id: program.id,
                    name: program.name,
                    description: program.description,
                    category: 'Public Transport',
                    requirements: [],
                    processingTime: '3-5 days',
                    cost: 'Varies',
                    validity: '1 year',
                    status: 'Available',
                    documents: [],
                    renewalRequired: false,
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
          <Tab icon={<Group />} label="Programs" />
          <Tab icon={<Receipt />} label="My Applications" />
          <Tab icon={<DirectionsCar />} label="Vehicles" />
          <Tab icon={<Traffic />} label="Road Info" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {selectedTab === 0 && renderServices()}
      {selectedTab === 1 && renderPrograms()}
      {selectedTab === 2 && renderApplications()}
      {selectedTab === 3 && renderVehicles()}
      {selectedTab === 4 && renderRoadInfo()}

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
