import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ChildCare,
  Person,
  LocationOn,
  Phone,
  Email,
  CheckCircle,
  Pending,
  Error,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { applicationsAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface BirthCertificateForm {
  childName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  fatherName: string;
  motherName: string;
  purpose: string;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  additionalInfo?: string;
}

interface ApplicationStatus {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REVIEW';
  submittedAt: string;
  estimatedCompletion?: string;
  notes?: string;
}

const steps = [
  'Child Information',
  'Parent Information',
  'Review & Submit',
  'Confirmation',
];

const BirthCertificatePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BirthCertificateForm>({
    childName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    fatherName: '',
    motherName: '',
    purpose: '',
    urgency: 'NORMAL',
    additionalInfo: '',
  });
  const [errors, setErrors] = useState<Partial<BirthCertificateForm>>({});
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);

  // Load existing application if user has one
  useEffect(() => {
    const loadExistingApplication = async () => {
      if (!user) return;
      
      try {
        const response = await applicationsAPI.getBirthCertificateApplications();
        if (response.data && response.data.length > 0) {
          const latestApp = response.data[0];
          setApplicationStatus({
            id: latestApp.id,
            status: latestApp.status,
            submittedAt: latestApp.createdAt,
            estimatedCompletion: latestApp.estimatedCompletion,
            notes: latestApp.notes,
          });
        }
      } catch (error) {
        console.error('Error loading existing application:', error);
      }
    };

    loadExistingApplication();
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<BirthCertificateForm> = {};

    if (activeStep === 0) {
      if (!formData.childName.trim()) {
        newErrors.childName = 'Child name is required';
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      }
      if (!formData.placeOfBirth.trim()) {
        newErrors.placeOfBirth = 'Place of birth is required';
      }
    }

    if (activeStep === 1) {
      if (!formData.fatherName.trim()) {
        newErrors.fatherName = 'Father name is required';
      }
      if (!formData.motherName.trim()) {
        newErrors.motherName = 'Mother name is required';
      }
    }

    if (activeStep === 2) {
      if (!formData.purpose.trim()) {
        newErrors.purpose = 'Purpose is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await applicationsAPI.submitBirthCertificateApplication({
        childName: formData.childName,
        dateOfBirth: formData.dateOfBirth,
        placeOfBirth: formData.placeOfBirth,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        purpose: formData.purpose,
        urgency: formData.urgency,
        additionalInfo: formData.additionalInfo,
      });

      if (response.success) {
        setApplicationStatus({
          id: response.data.id,
          status: 'PENDING',
          submittedAt: new Date().toISOString(),
          estimatedCompletion: response.data.estimatedCompletion,
        });
        
        toast.success('Birth certificate application submitted successfully!');
        setActiveStep(3);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle color="success" />;
      case 'PENDING':
        return <Pending color="warning" />;
      case 'REJECTED':
        return <Error color="error" />;
      default:
        return <Pending color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'info';
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Child Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Child's Full Name"
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                  error={!!errors.childName}
                  helperText={errors.childName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Place of Birth"
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                  error={!!errors.placeOfBirth}
                  helperText={errors.placeOfBirth}
                  placeholder="e.g., General Hospital, Onelga"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Parent Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Father's Full Name"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  error={!!errors.fatherName}
                  helperText={errors.fatherName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mother's Full Name"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  error={!!errors.motherName}
                  helperText={errors.motherName}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Application Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose of Birth Certificate"
                  multiline
                  rows={3}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  error={!!errors.purpose}
                  helperText={errors.purpose}
                  placeholder="e.g., School enrollment, passport application, etc."
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Urgency Level</InputLabel>
                  <Select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                    label="Urgency Level"
                  >
                    <MenuItem value="NORMAL">Normal (5-7 business days)</MenuItem>
                    <MenuItem value="URGENT">Urgent (2-3 business days)</MenuItem>
                    <MenuItem value="EMERGENCY">Emergency (1 business day)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                  label="Additional Information (Optional)"
                    multiline
                  rows={3}
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Any additional details that might be helpful"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box textAlign="center">
            <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Application Submitted Successfully!
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Your birth certificate application has been submitted and is being processed.
                </Typography>
            {applicationStatus && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
              <Typography variant="h6" gutterBottom>
                    Application Status
              </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                    {getStatusIcon(applicationStatus.status)}
                    <Chip 
                      label={applicationStatus.status} 
                      color={getStatusColor(applicationStatus.status) as any}
                    />
                </Box>
                  <Typography variant="body2" color="textSecondary">
                    Submitted: {new Date(applicationStatus.submittedAt).toLocaleDateString()}
                  </Typography>
                  {applicationStatus.estimatedCompletion && (
                    <Typography variant="body2" color="textSecondary">
                      Estimated Completion: {new Date(applicationStatus.estimatedCompletion).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  if (applicationStatus && applicationStatus.status !== 'REJECTED') {
  return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <ChildCare color="primary" />
            <Typography variant="h4">Birth Certificate Application</Typography>
      </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            You already have a pending birth certificate application. You can only submit one application at a time.
          </Alert>

          <Card>
            <CardContent>
        <Typography variant="h6" gutterBottom>
                Current Application Status
        </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {getStatusIcon(applicationStatus.status)}
                <Chip 
                  label={applicationStatus.status} 
                  color={getStatusColor(applicationStatus.status) as any}
                />
      </Box>
              <Typography variant="body2" color="textSecondary">
                Submitted: {new Date(applicationStatus.submittedAt).toLocaleDateString()}
              </Typography>
              {applicationStatus.estimatedCompletion && (
                <Typography variant="body2" color="textSecondary">
                  Estimated Completion: {new Date(applicationStatus.estimatedCompletion).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <ChildCare color="primary" />
          <Typography variant="h4">Birth Certificate Application</Typography>
      </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
          </Box>

        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
              onClick={() => window.location.href = '/dashboard'}
            >
              Back to Dashboard
          </Button>
          ) : (
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 2 ? handleSubmit : handleNext}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {activeStep === steps.length - 2 ? 'Submit Application' : 'Next'}
                          </Button>
            )}
          </Box>
      </Paper>
    </Container>
  );
};

export default BirthCertificatePage;