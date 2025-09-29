
import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Upload,
  CheckCircle,
  Error,
  Info,
  AttachMoney,
  Person,
  LocationOn,
  Description,
  Payment,
  Delete,
  Visibility,
  Security,
  Schedule,
  Phone,
  Email,
  Home,
  Business,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

interface NinVerificationResult {
  success: boolean;
  details?: { name: string; dob: string; nin: string };
  message?: string;
}

interface ApplicationForm {
  // Personal Information
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  gender: string;
  maritalStatus: string;
  occupation: string;
  nin: string; // National Identification Number (NIN)
  
  // Address Information
  residentialAddress: string;
  lga: string;
  ward: string;
  city: string;
  state: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Application Details
  applicationType: string;
  reasonForApplication: string;
  previousIdNumber: string;
  hasLostPreviousId: boolean;
  
  // Agreement
  agreeToTerms: boolean;
  certifyAccuracy: boolean;
}

interface UploadedFile {
  file: File;
  type: string;
  preview?: string;
  uploaded: boolean;
  error?: string;
}

const LocalIdentificationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationForm>({
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    gender: '',
    maritalStatus: '',
    occupation: '',
    nin: '',
    residentialAddress: '',
    lga: '',
    ward: '',
    city: 'Ndoni',
    state: 'Rivers State',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    applicationType: 'New Application',
    reasonForApplication: '',
    previousIdNumber: '',
    hasLostPreviousId: false,
    agreeToTerms: false,
    certifyAccuracy: false,
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [ninVerification, setNinVerification] = useState<NinVerificationResult | null>(null);
  const [ninVerifying, setNinVerifying] = useState(false);
  // NIN Verification Handler
  const handleVerifyNin = async () => {
    setNinVerification(null);
    setNinVerifying(true);
    try {
      const res = await axios.post('/api/identification/verify-nin', { nin: formData.nin });
      setNinVerification({ success: true, details: res.data.details });
      toast.success('NIN verified successfully!');
    } catch (err: any) {
      setNinVerification({ success: false, message: err.response?.data?.message || 'Verification failed' });
      toast.error('NIN verification failed.');
    } finally {
      setNinVerifying(false);
    }
  };

  const steps = ['Personal Info', 'Address & Contact', 'Documents', 'Review & Submit'];

  // Nigerian LGAs and Wards (simplified for demo)
  const lgas = [
    'Onelga',
    'Ahoada East',
    'Ahoada West',
    'Ogba/Egbema/Ndoni',
    'Omuma',
    'Other'
  ];

  const wards = {
    'Onelga': ['Ndoni Ward 1', 'Ndoni Ward 2', 'Egbema Ward', 'Omoku Ward', 'Agi Ward'],
    'Other': ['Please specify in address']
  };

  // File requirements
  const requiredDocuments = [
    {
      type: 'passport',
      name: 'Passport Photograph',
      description: 'Recent passport photograph',
      formats: ['JPEG', 'PNG'],
      maxSize: '2MB',
      required: true
    },
    {
      type: 'residence_proof',
      name: 'Proof of Residence',
      description: 'Utility bill, rent agreement, or official letter',
      formats: ['PDF', 'JPEG', 'PNG'],
      maxSize: '5MB',
      required: true
    },
    {
      type: 'birth_certificate',
      name: 'Birth Certificate or Age Declaration',
      description: 'Official birth certificate or sworn age declaration',
      formats: ['PDF'],
      maxSize: '5MB',
      required: true
    },
    {
      type: 'guarantor_form',
      name: 'Guarantor Form',
      description: 'Completed guarantor form with signature',
      formats: ['PDF', 'JPEG', 'PNG'],
      maxSize: '5MB',
      required: true
    },
    {
      type: 'previous_id',
      name: 'Previous ID (if applicable)',
      description: 'Copy of previous identification document',
      formats: ['PDF', 'JPEG', 'PNG'],
      maxSize: '5MB',
      required: false
    }
  ];

  // File upload handling
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        type: '', // Will be set by user
        uploaded: false,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  });

  const handleInputChange = (field: keyof ApplicationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileTypeChange = (index: number, type: string) => {
    setUploadedFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, type } : file
    ));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
  return formData.fullName && formData.dateOfBirth && formData.phoneNumber && formData.gender && formData.nin;
      case 1:
        return formData.residentialAddress && formData.lga && formData.ward && formData.emergencyContactName;
      case 2:
        const requiredTypes = requiredDocuments.filter(doc => doc.required).map(doc => doc.type);
        const uploadedTypes = uploadedFiles.filter(file => file.type).map(file => file.type);
        return requiredTypes.every(type => uploadedTypes.includes(type));
      case 3:
        return formData.agreeToTerms && formData.certifyAccuracy;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Please complete all required fields before proceeding.');
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast.error('Please complete all required information.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const refNum = `LID${Date.now()}`;
      setReferenceNumber(refNum);
      setApplicationSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applicationSubmitted) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Application Submitted Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your Local Identification application has been received and is now being processed.
          </Typography>
          
          <Paper sx={{ p: 3, my: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Application Reference Number
            </Typography>
            <Typography variant="h4" color="primary" fontFamily="monospace">
              {referenceNumber}
            </Typography>
          </Paper>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Please save your reference number. You will need it to track your application status and collect your ID.
          </Alert>
          
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Typography variant="h6">What happens next?</Typography>
            <List>
              <ListItem>
                <ListItemIcon><Schedule /></ListItemIcon>
                <ListItemText 
                  primary="Document Review" 
                  secondary="Your documents will be verified within 3-5 working days"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Phone /></ListItemIcon>
                <ListItemText 
                  primary="Contact Verification" 
                  secondary="We may call you to verify information"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle /></ListItemIcon>
                <ListItemText 
                  primary="ID Production" 
                  secondary="Your Local ID will be produced and ready for collection"
                />
              </ListItem>
            </List>
            
            <Button variant="contained" size="large" sx={{ mt: 3 }}>
              Track Application Status
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="National Identification Number (NIN)"
                value={formData.nin}
                onChange={(e) => handleInputChange('nin', e.target.value)}
                placeholder="Enter your 11-digit NIN"
                required
                inputProps={{ maxLength: 11 }}
                helperText="NIN is required for identity verification."
                disabled={ninVerifying}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleVerifyNin}
                disabled={ninVerifying || !formData.nin || formData.nin.length !== 11}
                sx={{ mb: 1 }}
              >
                {ninVerifying ? 'Verifying NIN...' : 'Verify NIN'}
              </Button>
              {ninVerification && (
                ninVerification.success ? (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    Verified: {ninVerification.details?.name} (DOB: {ninVerification.details?.dob})
                  </Alert>
                ) : (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {ninVerification.message || 'Verification failed'}
                  </Alert>
                )
              )}
            </Grid>
// --- NIN Verification API Integration Note ---
// To verify NIN, you would typically call a government or third-party NIN verification API (e.g., NIMC API in Nigeria).
// This usually requires registration and credentials from the NIMC or a licensed aggregator.
// Example (pseudo-code):
//   fetch('https://api.nimc.gov.ng/verify-nin', { method: 'POST', body: { nin: formData.nin } })
//     .then(res => res.json())
//     .then(data => { /* handle verification result */ })
// For demo, this is not implemented. You can add a button to trigger verification and display the result.
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                required
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+234 xxx xxx xxxx"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Marital Status"
                value={formData.maritalStatus}
                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
              >
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="Divorced">Divorced</MenuItem>
                <MenuItem value="Widowed">Widowed</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Occupation"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="Your occupation"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Address & Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Residential Address"
                multiline
                rows={3}
                value={formData.residentialAddress}
                onChange={(e) => handleInputChange('residentialAddress', e.target.value)}
                placeholder="Enter your complete residential address"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Local Government Area"
                value={formData.lga}
                onChange={(e) => handleInputChange('lga', e.target.value)}
                required
              >
                {riversStateLGAs.map((lga) => (
                  <MenuItem key={lga.name} value={lga.name}>{lga.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Ward"
                value={formData.ward}
                onChange={(e) => handleInputChange('ward', e.target.value)}
                required
                disabled={!formData.lga}
              >
                {(riversStateLGAs.find(lga => lga.name === formData.lga)?.wards || []).map((ward) => (
                  <MenuItem key={ward} value={ward}>{ward}</MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Emergency Contact
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Relationship to Emergency Contact"
                value={formData.emergencyContactRelationship}
                onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                placeholder="e.g., Spouse, Parent, Sibling, Friend"
                required
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Required Documents
            </Typography>
            
            <Paper 
              {...getRootProps()} 
              sx={{ 
                p: 4, 
                border: '2px dashed #ccc', 
                textAlign: 'center', 
                cursor: 'pointer',
                mb: 3,
                bgcolor: isDragActive ? 'grey.50' : 'white'
              }}
            >
              <input {...getInputProps()} />
              <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drag and drop your documents here, or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: PDF, JPEG, PNG (Max 5MB each)
              </Typography>
            </Paper>
            
            {uploadedFiles.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Uploaded Files ({uploadedFiles.length})
                </Typography>
                {uploadedFiles.map((file, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Description />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">
                            {file.file.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                        
                        <TextField
                          select
                          label="Document Type"
                          value={file.type}
                          onChange={(e) => handleFileTypeChange(index, e.target.value)}
                          size="small"
                          sx={{ minWidth: 200 }}
                        >
                          {requiredDocuments.map((doc) => (
                            <MenuItem key={doc.type} value={doc.type}>
                              {doc.name}
                            </MenuItem>
                          ))}
                        </TextField>
                        
                        <IconButton onClick={() => removeFile(index)} color="error">
                          <Delete />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
            
            <Typography variant="subtitle1" gutterBottom>
              Document Requirements
            </Typography>
            <List>
              {requiredDocuments.map((doc, index) => {
                const isUploaded = uploadedFiles.some(file => file.type === doc.type);
                return (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {isUploaded ? (
                        <CheckCircle color="success" />
                      ) : doc.required ? (
                        <Error color="error" />
                      ) : (
                        <Info color="info" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {doc.name}
                          {doc.required && <Chip label="Required" size="small" color="error" />}
                          {isUploaded && <Chip label="Uploaded" size="small" color="success" />}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {doc.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Formats: {doc.formats.join(', ')} • Max size: {doc.maxSize}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Submit Application
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Full Name</Typography>
                        <Typography variant="body1">{formData.fullName}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                        <Typography variant="body1">{formData.dateOfBirth}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Phone</Typography>
                        <Typography variant="body1">{formData.phoneNumber}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Email</Typography>
                        <Typography variant="body1">{formData.email || 'Not provided'}</Typography>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Address Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography variant="body1" paragraph>{formData.residentialAddress}</Typography>
                    <Typography variant="body2" color="text.secondary">LGA / Ward</Typography>
                    <Typography variant="body1">{formData.lga} / {formData.ward}</Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Documents Uploaded
                    </Typography>
                    <List dense>
                      {uploadedFiles.filter(file => file.type).map((file, index) => {
                        const docInfo = requiredDocuments.find(doc => doc.type === file.type);
                        return (
                          <ListItem key={index}>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                              primary={docInfo?.name || file.type}
                              secondary={file.file.name}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Payment Information
                    </Typography>
                    
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">Application Fee:</Typography>
                        <Typography variant="h6" color="primary">₦2,000</Typography>
                      </Stack>
                    </Box>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Payment will be processed after form submission
                    </Alert>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Processing Time: 7-14 working days
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Collection: Onelga LGA Secretariat
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Agreement
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.agreeToTerms}
                          onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                        />
                      }
                      label="I agree to the terms and conditions"
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.certifyAccuracy}
                          onChange={(e) => handleInputChange('certifyAccuracy', e.target.checked)}
                        />
                      }
                      label="I certify that the information provided is accurate and complete"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🆔 Local Identification Application
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Apply for your Onelga Local Government Area identification card
        </Typography>
      </Box>

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {currentStep < steps.length - 1 && (
          <LinearProgress 
            variant="determinate" 
            value={(currentStep / (steps.length - 1)) * 100} 
            sx={{ mt: 2 }}
          />
        )}
      </Paper>

      {/* Form Content */}
      <Paper sx={{ p: 4, mb: 4 }}>
        {renderStep()}
      </Paper>

      {/* Navigation Buttons */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          <Button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <Box>
            {currentStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!validateCurrentStep()}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!validateCurrentStep() || isSubmitting}
                startIcon={isSubmitting ? undefined : <Security />}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LocalIdentificationPage;
