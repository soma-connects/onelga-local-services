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
  Badge,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  LocalHospital,
  CalendarToday,
  Assignment,
  EmergencyShare,
  Vaccines,
  MonitorHeart,
  Psychology,
  ChildCare,
  Elderly,
  Phone,
  LocationOn,
  AccessTime,
  Add,
  Visibility,
  Edit,
  Delete,
  Download,
  Warning,
  CheckCircle,
  Schedule,
  Person,
  MedicalServices,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface HealthService {
  id: string;
  name: string;
  description: string;
  category: 'Primary Care' | 'Emergency' | 'Preventive' | 'Specialized' | 'Maternal' | 'Mental Health';
  availability: 'Available' | 'Limited' | 'Unavailable';
  requirements: string[];
  cost: string;
  duration: string;
  location: string;
}

interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
  healthCenter: string;
  doctor: string;
  notes?: string;
}

interface HealthRecord {
  id: string;
  type: 'Vaccination' | 'Check-up' | 'Treatment' | 'Test Result' | 'Prescription';
  title: string;
  date: string;
  provider: string;
  status: 'Active' | 'Completed' | 'Pending';
  description: string;
}

const HealthServicesPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'services' | 'appointments' | 'records' | 'emergency'>('services');
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<HealthService | null>(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    reason: '',
    healthCenter: '',
    preferredDoctor: '',
  });

  // Mock data for health services
  const healthServices: HealthService[] = [
    {
      id: '1',
      name: 'General Health Check-up',
      description: 'Comprehensive health screening including vital signs, basic tests, and consultation',
      category: 'Primary Care',
      availability: 'Available',
      requirements: ['Valid ID', 'Health Insurance (if available)'],
      cost: 'Free for residents',
      duration: '45 minutes',
      location: 'Onelga Primary Health Center'
    },
    {
      id: '2',
      name: 'Child Immunization',
      description: 'Routine vaccination services for children according to national immunization schedule',
      category: 'Preventive',
      availability: 'Available',
      requirements: ['Child\'s Birth Certificate', 'Immunization Card'],
      cost: 'Free',
      duration: '30 minutes',
      location: 'All Health Centers'
    },
    {
      id: '3',
      name: 'Maternal Health Services',
      description: 'Prenatal care, delivery services, and postnatal care for expectant mothers',
      category: 'Maternal',
      availability: 'Available',
      requirements: ['Valid ID', 'Pregnancy confirmation'],
      cost: 'Subsidized',
      duration: '1-2 hours',
      location: 'Maternal Health Units'
    },
    {
      id: '4',
      name: 'Mental Health Counseling',
      description: 'Professional counseling and mental health support services',
      category: 'Mental Health',
      availability: 'Limited',
      requirements: ['Referral letter (optional)', 'Valid ID'],
      cost: 'Free for residents',
      duration: '1 hour',
      location: 'Onelga Mental Health Center'
    },
    {
      id: '5',
      name: 'Emergency Medical Services',
      description: '24/7 emergency medical care and ambulance services',
      category: 'Emergency',
      availability: 'Available',
      requirements: ['Emergency situation'],
      cost: 'Emergency rates apply',
      duration: 'As needed',
      location: 'Emergency Units'
    },
    {
      id: '6',
      name: 'Elderly Care Services',
      description: 'Specialized healthcare services for senior citizens',
      category: 'Specialized',
      availability: 'Available',
      requirements: ['Valid ID', 'Age verification (60+)'],
      cost: 'Free for seniors',
      duration: '1 hour',
      location: 'Geriatric Care Unit'
    }
  ];

  // Mock appointments data
  React.useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        serviceId: '1',
        serviceName: 'General Health Check-up',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '09:00',
        status: 'Scheduled',
        healthCenter: 'Onelga Primary Health Center',
        doctor: 'Dr. Sarah Johnson',
        notes: 'Annual check-up'
      },
      {
        id: '2',
        serviceId: '2',
        serviceName: 'Child Immunization',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:30',
        status: 'Confirmed',
        healthCenter: 'Onelga Primary Health Center',
        doctor: 'Nurse Mary Adams'
      }
    ];
    setAppointments(mockAppointments);

    const mockRecords: HealthRecord[] = [
      {
        id: '1',
        type: 'Vaccination',
        title: 'COVID-19 Booster Shot',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        provider: 'Onelga Health Center',
        status: 'Completed',
        description: 'Pfizer COVID-19 booster vaccination administered'
      },
      {
        id: '2',
        type: 'Check-up',
        title: 'Annual Physical Examination',
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        provider: 'Dr. James Wilson',
        status: 'Completed',
        description: 'Comprehensive health screening - all results normal'
      }
    ];
    setHealthRecords(mockRecords);
  }, []);

  // Book appointment
  const handleBookAppointment = (service: HealthService) => {
    setSelectedService(service);
    setShowBookingDialog(true);
  };

  // Submit booking
  const handleSubmitBooking = async () => {
    if (!selectedService || !bookingForm.date || !bookingForm.time || !bookingForm.healthCenter) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Mock booking API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: bookingForm.date,
        time: bookingForm.time,
        status: 'Scheduled',
        healthCenter: bookingForm.healthCenter,
        doctor: bookingForm.preferredDoctor || 'To be assigned',
        notes: bookingForm.reason
      };

      setAppointments(prev => [newAppointment, ...prev]);
      toast.success('Appointment booked successfully!');
      setShowBookingDialog(false);
      setBookingForm({ date: '', time: '', reason: '', healthCenter: '', preferredDoctor: '' });
      setSelectedTab('appointments');
    } catch (error) {
      toast.error('Failed to book appointment');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
      case 'Completed':
      case 'Confirmed':
        return 'success';
      case 'Limited':
      case 'Scheduled':
      case 'Pending':
        return 'warning';
      case 'Unavailable':
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Primary Care': return <LocalHospital />;
      case 'Emergency': return <EmergencyShare />;
      case 'Preventive': return <Vaccines />;
      case 'Specialized': return <MedicalServices />;
      case 'Maternal': return <ChildCare />;
      case 'Mental Health': return <Psychology />;
      default: return <LocalHospital />;
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
      {healthServices.map((service) => (
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
                  label={service.availability}
                  size="small"
                  color={getStatusColor(service.availability) as any}
                  sx={{ mb: 1 }}
                />
              </Box>
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Duration: {service.duration}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {service.location}
                  </Typography>
                </Box>
                <Typography variant="body2" color="primary">
                  Cost: {service.cost}
                </Typography>
              </Stack>
            </CardContent>
            
            <CardActions>
              <Button
                size="small"
                startIcon={<CalendarToday />}
                onClick={() => handleBookAppointment(service)}
                disabled={service.availability === 'Unavailable'}
              >
                Book Appointment
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

  const renderAppointments = () => (
    <Box>
      {appointments.length === 0 ? (
        <Alert severity="info">
          You don't have any scheduled appointments. Book a health service to get started.
        </Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Health Center</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {appointment.serviceName}
                  </Typography>
                  {appointment.notes && (
                    <Typography variant="caption" color="text.secondary">
                      {appointment.notes}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(appointment.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.time}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {appointment.healthCenter}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {appointment.doctor}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={appointment.status}
                    size="small"
                    color={getStatusColor(appointment.status) as any}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {appointment.status === 'Scheduled' && (
                      <Tooltip title="Reschedule">
                        <IconButton size="small" color="primary">
                          <Schedule fontSize="small" />
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

  const renderHealthRecords = () => (
    <Box>
      {healthRecords.length === 0 ? (
        <Alert severity="info">
          No health records available. Records will appear here after your appointments and treatments.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {healthRecords.map((record) => (
            <Grid item xs={12} key={record.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {record.title}
                      </Typography>
                      <Chip
                        label={record.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={record.status}
                        size="small"
                        color={getStatusColor(record.status) as any}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(record.date)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Provider: {record.provider}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    {record.description}
                  </Typography>
                  
                  <Button size="small" startIcon={<Download />}>
                    Download Record
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderEmergencyInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmergencyShare sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5" component="h3">
                Emergency Services
              </Typography>
            </Box>
            <Typography variant="h6" gutterBottom>
              Call 112 or 199 for Medical Emergencies
            </Typography>
            <Typography variant="body1" paragraph>
              Available 24/7 for life-threatening situations
            </Typography>
            <Button
              variant="contained"
              color="inherit"
              size="large"
              startIcon={<Phone />}
              fullWidth
              href="tel:112"
            >
              Call Emergency Line
            </Button>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Emergency Health Centers
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LocationOn color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Onelga General Hospital"
                  secondary="24/7 Emergency Unit - Main Street, Ndoni"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Phone color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Ambulance Services"
                  secondary="Call +234-XXX-XXX-XXXX for ambulance"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <AccessTime color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Response Time"
                  secondary="Average 15 minutes within Onelga LGA"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>When to call emergency services:</strong><br />
            • Severe chest pain or difficulty breathing<br />
            • Severe bleeding or injuries<br />
            • Loss of consciousness<br />
            • Suspected heart attack or stroke<br />
            • Severe allergic reactions<br />
            • Any life-threatening situation
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🏥 Health Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access comprehensive healthcare services provided by Onelga Local Government.
          Book appointments, manage your health records, and get emergency assistance.
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant={selectedTab === 'services' ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab('services')}
            startIcon={<LocalHospital />}
          >
            Services
          </Button>
          <Button
            variant={selectedTab === 'appointments' ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab('appointments')}
            startIcon={<CalendarToday />}
          >
            <Badge badgeContent={appointments.length} color="primary">
              Appointments
            </Badge>
          </Button>
          <Button
            variant={selectedTab === 'records' ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab('records')}
            startIcon={<Assignment />}
          >
            Health Records
          </Button>
          <Button
            variant={selectedTab === 'emergency' ? 'contained' : 'outlined'}
            onClick={() => setSelectedTab('emergency')}
            startIcon={<EmergencyShare />}
            color="error"
          >
            Emergency
          </Button>
        </Stack>
      </Paper>

      {/* Content Area */}
      <Box>
        {selectedTab === 'services' && renderServices()}
        {selectedTab === 'appointments' && renderAppointments()}
        {selectedTab === 'records' && renderHealthRecords()}
        {selectedTab === 'emergency' && renderEmergencyInfo()}
      </Box>

      {/* Booking Dialog */}
      <Dialog
        open={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Book Appointment - {selectedService?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preferred Date"
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preferred Time"
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Health Center"
                  value={bookingForm.healthCenter}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, healthCenter: e.target.value }))}
                >
                  <MenuItem value="Onelga Primary Health Center">Onelga Primary Health Center</MenuItem>
                  <MenuItem value="Onelga General Hospital">Onelga General Hospital</MenuItem>
                  <MenuItem value="Maternal Health Unit">Maternal Health Unit</MenuItem>
                  <MenuItem value="Mental Health Center">Mental Health Center</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Preferred Doctor/Specialist (Optional)"
                  value={bookingForm.preferredDoctor}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, preferredDoctor: e.target.value }))}
                  helperText="Leave blank for automatic assignment"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason for Visit"
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, reason: e.target.value }))}
                  helperText="Briefly describe your health concern or reason for the appointment"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBookingDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitBooking}
            startIcon={<CalendarToday />}
          >
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emergency FAB */}
      <Fab
        color="error"
        aria-label="emergency"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setSelectedTab('emergency')}
      >
        <EmergencyShare />
      </Fab>
    </Container>
  );
};

export default HealthServicesPage;
