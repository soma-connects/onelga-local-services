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

  // Mock education services data
  const educationServices: EducationService[] = [
    {
      id: '1',
      name: 'Primary School Enrollment',
      description: 'Register children for primary education in Onelga LGA public schools',
      category: 'School Enrollment',
  eligibility: ['Age 6-12 years', 'Resident of Onelga LGA', 'Birth certificate required'],
      requirements: ['Birth certificate', 'Immunization record', 'Passport photograph', 'Proof of residence'],
      cost: 'Free',
      duration: 'Academic year',
      status: 'Available',
      applicants: 245,
      maxApplicants: 500
    },
    {
      id: '2',
      name: 'Secondary School Enrollment',
      description: 'Admission into public secondary schools within Onelga LGA',
      category: 'School Enrollment',
  eligibility: ['Primary school certificate', 'Age 12-16 years', 'Entrance examination'],
      requirements: ['Primary school certificate', 'Birth certificate', 'Medical certificate', '2 passport photos'],
      cost: '₦5,000 registration fee',
      duration: '6 years',
      status: 'Available',
      deadline: '2024-08-31',
      applicants: 189,
      maxApplicants: 300
    },
    {
      id: '3',
      name: 'Adult Literacy Program',
      description: 'Basic literacy and numeracy classes for adults who missed formal education',
      category: 'Adult Education',
  eligibility: ['Adults 18+ years', 'Basic English/local language', 'Commitment to attend classes'],
      requirements: ['Valid ID', 'Proof of residence', 'Application form'],
      cost: 'Free',
      duration: '6 months',
      status: 'Available',
      applicants: 67,
      maxApplicants: 100
    },
    {
      id: '4',
      name: 'Vocational Training Program',
      description: 'Technical and vocational skills training in various trades',
      category: 'Programs',
  eligibility: ['Age 16+ years', 'Basic education', 'Interest in technical skills'],
      requirements: ['Educational certificate', 'Medical certificate', 'Application form'],
      cost: '₦15,000',
      duration: '1-2 years',
      status: 'Available',
      applicants: 123,
      maxApplicants: 200
    },
    {
      id: '5',
      name: 'Special Needs Education',
      description: 'Specialized education services for children with special needs',
      category: 'Support',
  eligibility: ['Children with disabilities', 'Medical assessment', 'Age 3-18 years'],
      requirements: ['Medical report', 'Birth certificate', 'Assessment by specialist'],
      cost: 'Subsidized',
      duration: 'As needed',
      status: 'Available',
      applicants: 34,
      maxApplicants: 50
    }
  ];

  // Mock scholarship programs
  const scholarshipPrograms: ScholarshipProgram[] = [
    {
      id: '1',
      name: 'Onelga Academic Excellence Award',
      type: 'Academic Excellence',
      level: 'Secondary',
      amount: '₦100,000 per year',
      duration: '3 years',
      description: 'Merit-based scholarship for outstanding students in secondary education',
      eligibility: ['Minimum 85% average', 'Leadership qualities', 'Community service'],
      deadline: '2024-09-30',
      status: 'Open',
      applicants: 45,
      awards: 10
    },
    {
      id: '2',
      name: 'Rivers State University Partnership',
      type: 'STEM',
      level: 'Tertiary',
      amount: '₦200,000 per year',
      duration: '4 years',
      description: 'Full scholarship for STEM courses at Rivers State University',
      eligibility: ['WAEC with 5 credits including Math & English', 'Science subjects', 'JAMB score 250+'],
      deadline: '2024-07-15',
      status: 'Open',
      applicants: 23,
      awards: 5
    },
    {
      id: '3',
      name: 'Sports Excellence Grant',
      type: 'Sports',
      level: 'Secondary',
      amount: '₦50,000',
      duration: '1 year',
      description: 'Support for talented young athletes in various sports disciplines',
      eligibility: ['Proven sports talent', 'Training commitment', 'Age 14-18 years'],
      deadline: '2024-08-15',
      status: 'Open',
      applicants: 18,
      awards: 8
    },
    {
      id: '4',
      name: 'Creative Arts Scholarship',
      type: 'Arts',
      level: 'Secondary',
      amount: '₦75,000',
      duration: '2 years',
      description: 'Supporting young artists, musicians, and creative talent',
      eligibility: ['Portfolio submission', 'Creative talent demonstration', 'Age 12-17 years'],
      deadline: '2024-10-01',
      status: 'Open',
      applicants: 31,
      awards: 6
    },
    {
      id: '5',
      name: 'Need-Based Education Support',
      type: 'Need-Based',
      level: 'Primary',
      amount: '₦30,000',
      duration: '1 year',
      description: 'Financial assistance for families who cannot afford education costs',
      eligibility: ['Family income verification', 'Academic performance', 'Community recommendation'],
      deadline: '2024-12-31',
      status: 'Open',
      applicants: 67,
      awards: 25
    }
  ];

  // Mock data initialization
  React.useEffect(() => {
    const mockApplications: EducationApplication[] = [
      {
        id: '1',
        serviceId: '2',
        serviceName: 'Secondary School Enrollment',
        studentName: 'Adaeze Okafor',
        guardianName: 'Mrs. Ngozi Okafor',
        level: 'JSS 1',
        status: 'Under Review',
        submissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        referenceNumber: 'EDU2024001',
        notes: 'Entrance exam scheduled'
      },
      {
        id: '2',
        serviceId: '1',
        serviceName: 'Primary School Enrollment',
        studentName: 'Emeka Nwankwo',
        guardianName: 'Mr. Chukwu Nwankwo',
        level: 'Primary 1',
        status: 'Approved',
        submissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        referenceNumber: 'EDU2024002',
        notes: 'School assignment: Onelga Primary School'
      }
    ];
    setApplications(mockApplications);

    const mockRecords: AcademicRecord[] = [
      {
        id: '1',
        studentName: 'Adaeze Okafor',
        school: 'Onelga Secondary School',
        level: 'JSS 2',
        year: '2023/2024',
        gpa: '3.8',
        achievements: ['Best in Mathematics', 'Science Quiz Winner', 'Perfect Attendance'],
        status: 'Active'
      },
      {
        id: '2',
        studentName: 'Emeka Nwankwo',
        school: 'Onelga Primary School',
        level: 'Primary 3',
        year: '2023/2024',
        achievements: ['Reading Champion', 'Sports Day Winner'],
        status: 'Active'
      }
    ];
    setAcademicRecords(mockRecords);
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newApplication: EducationApplication = {
        id: Date.now().toString(),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        studentName: applicationForm.studentName,
        guardianName: applicationForm.guardianName,
        level: applicationForm.level,
        status: 'Submitted',
        submissionDate: new Date().toISOString(),
        referenceNumber: `EDU${Date.now()}`,
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
