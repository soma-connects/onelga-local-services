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
} from '@mui/material';
import {
  School,
  MenuBook,
  EmojiEvents,
  Assignment,
  Person,
  LocationOn,
  CalendarToday,
  AttachMoney,
  Add,
  Visibility,
  Edit,
  Download,
  CheckCircle,
  Schedule,
  Grade,
  Psychology,
  Science,
  Computer,
  Language,
  SportsSoccer,
  Brush,
  MusicNote,
  Phone,
  Email,
  ExpandMore,
  StarBorder,
  Star,
  Group,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { servicesAPI, applicationsAPI } from '../../services/api';

interface EducationService {
  id: string;
  name: string;
  description: string;
  category: 'School Enrollment' | 'Scholarships' | 'Programs' | 'Support' | 'Adult Education';
  eligibility: string[];
  requirements: string[];
  deadline?: string;
  cost: string;
  duration: string;
  status: 'Available' | 'Limited' | 'Closed' | 'Coming Soon';
  applicants?: number;
  maxApplicants?: number;
}

interface ScholarshipProgram {
  id: string;
  name: string;
  type: 'Academic Excellence' | 'Need-Based' | 'Sports' | 'Arts' | 'STEM' | 'Special Needs';
  level: 'Primary' | 'Secondary' | 'Tertiary' | 'Vocational';
  amount: string;
  duration: string;
  description: string;
  eligibility: string[];
  deadline: string;
  status: 'Open' | 'Closed' | 'Review' | 'Awarded';
  applicants: number;
  awards: number;
}

interface EducationApplication {
  id: string;
  serviceId: string;
  serviceName: string;
  studentName: string;
  guardianName: string;
  level: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Completed';
  submissionDate: string;
  referenceNumber?: string;
  notes?: string;
}

interface AcademicRecord {
  id: string;
  studentName: string;
  school: string;
  level: string;
  year: string;
  gpa?: string;
  achievements: string[];
  status: 'Active' | 'Graduated' | 'Transferred';
}

const EducationServicesPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showScholarshipDialog, setShowScholarshipDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<EducationService | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipProgram | null>(null);
  const [applications, setApplications] = useState<EducationApplication[]>([]);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [applicationForm, setApplicationForm] = useState({
    studentName: '',
    guardianName: '',
    dateOfBirth: '',
  address: '',
  phone: '',
  email: '',
  level: '',
  previousSchool: '',
  reason: '',
  additionalInfo: ''
  });

  const [educationServices, setEducationServices] = useState<EducationService[]>([]);

  const [scholarshipPrograms, setScholarshipPrograms] = useState<ScholarshipProgram[]>([]);

  // Load services and applications from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const resp = await servicesAPI.getServices();
        const raw = Array.isArray(resp.data) ? resp.data : (resp.data as any)?.services || [];
        const normalized = raw
          .filter((s: any) => `${s.category || ''}`.toLowerCase().includes('education'))
          .map((s: any): EducationService => ({
            id: s.id?.toString() || s._id?.toString() || s.name,
            name: s.name || s.title || 'Service',
            description: s.description || 'No description provided.',
            category: (s.category || 'Programs') as any,
            eligibility: Array.isArray(s.eligibility) ? s.eligibility : [],
            requirements: Array.isArray(s.requirements) ? s.requirements : [],
            deadline: s.deadline,
            cost: typeof s.fee === 'number' ? `₦${s.fee.toLocaleString()}` : (s.fee || 'Free'),
            duration: s.duration || s.processingTime || 'Varies',
            status: ((s.status || 'Available').toString().toLowerCase() === 'coming_soon' ? 'Coming Soon' : (s.status || 'Available')) as any,
            applicants: s.applicants,
            maxApplicants: s.maxApplicants,
          }));
        setEducationServices(normalized);
      } catch (e) {
        setEducationServices([]);
      }
      // Scholarships endpoint not defined → keep empty or hide UI
      setScholarshipPrograms([]);
    };
    const loadApplications = async () => {
      try {
        const resp = await applicationsAPI.getApplications({ type: 'EDUCATION_APPLICATION', limit: 10, page: 1 } as any);
        const data: any = resp.data;
        const apps = Array.isArray(data?.applications) ? data.applications : (Array.isArray(data) ? data : []);
        const mapped: EducationApplication[] = apps.map((app: any) => ({
          id: app.id?.toString() || app._id?.toString() || Math.random().toString(),
          serviceId: app.serviceId || app.type || 'education',
          serviceName: app.serviceName || app.type || 'Education Service',
          studentName: app.data?.studentName || '-',
          guardianName: app.data?.guardianName || '-',
          level: app.data?.level || '-',
          status: (app.status || 'Submitted') as EducationApplication['status'],
          submissionDate: app.createdAt || new Date().toISOString(),
          referenceNumber: app.reference || app.referenceNumber,
          notes: app.notes,
        }));
        setApplications(mapped);
      } catch (e) {
        setApplications([]);
      }
      setAcademicRecords([]);
    };
    loadServices();
    loadApplications();
  }, []);

  // Handle service application
  const handleApplyForService = (service: EducationService) => {
    setSelectedService(service);
    setShowApplicationDialog(true);
  };

  // Handle scholarship application
  const handleApplyForScholarship = (scholarship: ScholarshipProgram) => {
    setSelectedScholarship(scholarship);
    setShowScholarshipDialog(true);
  };

  // Handle application submission
  const handleSubmitApplication = async () => {
    if (!selectedService || !applicationForm.studentName || !applicationForm.guardianName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        type: 'EDUCATION_APPLICATION',
        serviceId: selectedService.id,
        data: {
          studentName: applicationForm.studentName,
          guardianName: applicationForm.guardianName,
          dateOfBirth: applicationForm.dateOfBirth,
          address: applicationForm.address,
          phone: applicationForm.phone,
          email: applicationForm.email,
          level: applicationForm.level,
          previousSchool: applicationForm.previousSchool,
          reason: applicationForm.reason,
          additionalInfo: applicationForm.additionalInfo,
        },
      };
      const resp = await applicationsAPI.createApplication(payload);
      const created: any = resp.data || {};
      const newApplication: EducationApplication = {
        id: created.id?.toString() || Math.random().toString(),
        serviceId: created.serviceId || selectedService.id,
        serviceName: created.serviceName || selectedService.name,
        studentName: created.data?.studentName || applicationForm.studentName,
        guardianName: created.data?.guardianName || applicationForm.guardianName,
        level: created.data?.level || applicationForm.level,
        status: (created.status || 'Submitted') as EducationApplication['status'],
        submissionDate: created.createdAt || new Date().toISOString(),
        referenceNumber: created.reference || created.referenceNumber,
      };

      setApplications(prev => [newApplication, ...prev]);
      toast.success('Application submitted successfully!');
      setShowApplicationDialog(false);
      setShowScholarshipDialog(false);
      resetForm();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // Log error details in development for debugging
        // eslint-disable-next-line no-console
        console.error('Education application submission error:', error);
      }
      toast.error('Failed to submit application. Please try again or contact support if the problem persists.');
    }
  };

  const resetForm = () => {
    setApplicationForm({
      studentName: '',
      guardianName: '',
      dateOfBirth: '',
      address: '',
      phone: '',
      email: '',
      level: '',
      previousSchool: '',
      reason: '',
      additionalInfo: ''
    });
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
      case 'Review':
      case 'Under Review':
      case 'Submitted':
        return 'warning';
      case 'Closed':
      case 'Rejected':
        return 'error';
      case 'Coming Soon':
      case 'Draft':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'School Enrollment': return <School />;
      case 'Scholarships': return <EmojiEvents />;
      case 'Programs': return <MenuBook />;
      case 'Support': return <Psychology />;
      case 'Adult Education': return <Person />;
      default: return <School />;
    }
  };

  const getScholarshipIcon = (type: string) => {
    switch (type) {
      case 'Academic Excellence': return <Star />;
      case 'STEM': return <Science />;
      case 'Sports': return <SportsSoccer />;
      case 'Arts': return <Brush />;
      case 'Need-Based': return <Group />;
      default: return <StarBorder />;
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
      {educationServices.map((service) => (
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
                    Duration: {service.duration}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {service.cost}
                  </Typography>
                </Box>
                {service.maxApplicants && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Applicants: {service.applicants}/{service.maxApplicants}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(service.applicants! / service.maxApplicants) * 100}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )}
              </Stack>
              
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2" fontWeight="medium">
                    Eligibility & Requirements
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
                disabled={service.status === 'Closed'}
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

  const renderScholarships = () => (
    <Grid container spacing={3}>
      {scholarshipPrograms.map((scholarship) => (
        <Grid item xs={12} md={6} key={scholarship.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getScholarshipIcon(scholarship.type)}
                <Box sx={{ ml: 1, flexGrow: 1 }}>
                  <Typography variant="h6" component="h3">
                    {scholarship.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {scholarship.type} • {scholarship.level}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {scholarship.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={scholarship.status}
                  size="small"
                  color={getStatusColor(scholarship.status) as any}
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={scholarship.level}
                  size="small"
                  variant="outlined"
                />
              </Box>
              
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }} fontWeight="medium">
                    {scholarship.amount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Duration: {scholarship.duration}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Deadline: {formatDate(scholarship.deadline)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmojiEvents fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Awards: {scholarship.awards} (Applicants: {scholarship.applicants})
                  </Typography>
                </Box>
              </Stack>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2" fontWeight="medium">
                    Eligibility Criteria
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {scholarship.eligibility.map((item, index) => (
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
                onClick={() => handleApplyForScholarship(scholarship)}
                disabled={scholarship.status === 'Closed'}
              >
                Apply
              </Button>
              <Button size="small" startIcon={<Visibility />}>
                View Details
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
          You haven't submitted any education applications yet. Apply for services or scholarships to get started.
        </Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service/Program</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Guardian</TableCell>
              <TableCell>Level</TableCell>
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
                    {application.studentName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {application.guardianName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {application.level}
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
                    {application.status === 'Approved' && (
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

  const renderAcademicRecords = () => (
    <Box>
      {academicRecords.length === 0 ? (
        <Alert severity="info">
          No academic records available. Records will appear here after enrollment and academic activities.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {academicRecords.map((record) => (
            <Grid item xs={12} md={6} key={record.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Grade />
                    </Avatar>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6">
                        {record.studentName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {record.school}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Level
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {record.level}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Academic Year
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {record.year}
                      </Typography>
                    </Grid>
                    {record.gpa && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          GPA
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color="primary">
                          {record.gpa}/4.0
                        </Typography>
                      </Grid>
                    )}
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
                    Achievements
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {record.achievements.map((achievement, index) => (
                      <Chip
                        key={index}
                        label={achievement}
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
                    Download Transcript
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🎓 Education Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access educational opportunities, apply for schools and scholarships, and manage academic records in Onelga LGA.
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
            startIcon={<School />}
            size="large"
          >
            Enroll Student
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmojiEvents />}
            size="large"
          >
            Apply for Scholarship
          </Button>
          <Button
            variant="outlined"
            startIcon={<Grade />}
            size="large"
          >
            View Records
          </Button>
          <Button
            variant="outlined"
            startIcon={<MenuBook />}
            size="large"
          >
            Education Programs
          </Button>
        </Stack>
      </Paper>

      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
          <Tab 
            label="School Services" 
            icon={<Badge badgeContent={educationServices.length} color="primary"><School /></Badge>} 
          />
          <Tab 
            label="Scholarships" 
            icon={<Badge badgeContent={scholarshipPrograms.filter(s => s.status === 'Open').length} color="secondary"><EmojiEvents /></Badge>} 
          />
          <Tab 
            label="My Applications" 
            icon={<Badge badgeContent={applications.length} color="primary"><Assignment /></Badge>} 
          />
          <Tab 
            label="Academic Records" 
            icon={<Grade />} 
          />
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box>
        {selectedTab === 0 && renderServices()}
        {selectedTab === 1 && renderScholarships()}
        {selectedTab === 2 && renderApplications()}
        {selectedTab === 3 && renderAcademicRecords()}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={applicationForm.studentName}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, studentName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guardian/Parent Name"
                  value={applicationForm.guardianName}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, guardianName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={applicationForm.dateOfBirth}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Level/Grade"
                  value={applicationForm.level}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, level: e.target.value }))}
                  required
                >
                  <MenuItem value="Primary 1">Primary 1</MenuItem>
                  <MenuItem value="Primary 2">Primary 2</MenuItem>
                  <MenuItem value="Primary 3">Primary 3</MenuItem>
                  <MenuItem value="Primary 4">Primary 4</MenuItem>
                  <MenuItem value="Primary 5">Primary 5</MenuItem>
                  <MenuItem value="Primary 6">Primary 6</MenuItem>
                  <MenuItem value="JSS 1">JSS 1</MenuItem>
                  <MenuItem value="JSS 2">JSS 2</MenuItem>
                  <MenuItem value="JSS 3">JSS 3</MenuItem>
                  <MenuItem value="SS 1">SS 1</MenuItem>
                  <MenuItem value="SS 2">SS 2</MenuItem>
                  <MenuItem value="SS 3">SS 3</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={applicationForm.address}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={applicationForm.phone}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Previous School (if any)"
                  value={applicationForm.previousSchool}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, previousSchool: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason for Application"
                  value={applicationForm.reason}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, reason: e.target.value }))}
                  helperText="Briefly explain why you're applying for this service"
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

      {/* Scholarship Dialog */}
      <Dialog
        open={showScholarshipDialog}
        onClose={() => setShowScholarshipDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Apply for {selectedScholarship?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              This is a {selectedScholarship?.type} scholarship for {selectedScholarship?.level} level students.
              Amount: {selectedScholarship?.amount} for {selectedScholarship?.duration}.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={applicationForm.studentName}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, studentName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guardian/Parent Name"
                  value={applicationForm.guardianName}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, guardianName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Why do you deserve this scholarship?"
                  value={applicationForm.reason}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, reason: e.target.value }))}
                  helperText="Explain your achievements, financial need, or other relevant factors"
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScholarshipDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitApplication}
            startIcon={<EmojiEvents />}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EducationServicesPage;
