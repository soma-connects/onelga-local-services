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
  Description,
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

interface IdentificationForm {
  purpose: string;
  destination: string;
  additionalInfo?: string;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
}

interface ApplicationStatus {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REVIEW';
  submittedAt: string;
  estimatedCompletion?: string;
  notes?: string;
}

const steps = [
  'Application Details',
  'Review & Submit',
  'Confirmation',
];

const IdentificationLetterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IdentificationForm>({
    purpose: '',
    destination: '',
    additionalInfo: '',
    urgency: 'NORMAL',
  });
  const [errors, setErrors] = useState<Partial<IdentificationForm>>({});
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);

  // Load existing application if user has one
  useEffect(() => {
    const loadExistingApplication = async () => {
      if (!user) return;
      
      try {
        const response = await applicationsAPI.getIdentificationApplications();
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
    const newErrors: Partial<IdentificationForm> = {};

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateForm()) {
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
      const response = await applicationsAPI.submitIdentificationApplication({
        purpose: formData.purpose,
        destination: formData.destination,
        additionalInfo: formData.additionalInfo,
        urgency: formData.urgency,
      });

      if (response.success) {
        setApplicationStatus({
          id: response.data.id,
          status: 'PENDING',
          submittedAt: new Date().toISOString(),
          estimatedCompletion: response.data.estimatedCompletion,
        });
        
        toast.success('Identification letter application submitted successfully!');
        setActiveStep(2);
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
              Application Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose of Identification Letter"
                  multiline
                  rows={3}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  error={!!errors.purpose}
                  helperText={errors.purpose}
                  placeholder="e.g., Opening a bank account, applying for a job, etc."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Destination/Recipient"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  error={!!errors.destination}
                  helperText={errors.destination}
                  placeholder="e.g., Bank Name, Company Name, Institution Name"
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
                    <MenuItem value="NORMAL">Normal (3-5 business days)</MenuItem>
                    <MenuItem value="URGENT">Urgent (1-2 business days)</MenuItem>
                    <MenuItem value="EMERGENCY">Emergency (Same day)</MenuItem>
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

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Application
            </Typography>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Purpose
                    </Typography>
                    <Typography variant="body1">{formData.purpose}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Destination
                    </Typography>
                    <Typography variant="body1">{formData.destination}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Urgency
                    </Typography>
                    <Chip 
                      label={formData.urgency} 
                      color={formData.urgency === 'EMERGENCY' ? 'error' : formData.urgency === 'URGENT' ? 'warning' : 'default'}
                    />
                  </Grid>
                  {formData.additionalInfo && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Additional Information
                      </Typography>
                      <Typography variant="body1">{formData.additionalInfo}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Box textAlign="center">
            <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Application Submitted Successfully!
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Your identification letter application has been submitted and is being processed.
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
            <Description color="primary" />
            <Typography variant="h4">Identification Letter Application</Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            You already have a pending identification letter application. You can only submit one application at a time.
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
              {applicationStatus.notes && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Notes:</Typography>
                  <Typography variant="body2">{applicationStatus.notes}</Typography>
                </Box>
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
          <Description color="primary" />
          <Typography variant="h4">Identification Letter Application</Typography>
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

export default IdentificationLetterPage;
