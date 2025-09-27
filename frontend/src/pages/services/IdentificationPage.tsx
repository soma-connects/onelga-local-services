import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Stack,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface IdentificationApplication {
  id: string;
  purpose: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  letterNumber?: string;
  issuedDate?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  documents: string[];
}

const statusColors = {
  PENDING: 'warning',
  UNDER_REVIEW: 'info', 
  APPROVED: 'success',
  REJECTED: 'error',
  COMPLETED: 'success',
} as const;

const IdentificationPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<IdentificationApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<IdentificationApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  // Mock data for testing
  React.useEffect(() => {
    const mockApplications: IdentificationApplication[] = [
      {
        id: '1',
        purpose: 'For employment at Onelga Local Government',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: ['doc1.pdf', 'doc2.jpg']
      },
      {
        id: '2',
        purpose: 'For bank account opening at First Bank',
        status: 'APPROVED',
        letterNumber: 'OLG-ID-2024-ABC123',
        issuedDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        documents: ['id-card.jpg', 'photo.jpg']
      }
    ];
    setApplications(mockApplications);
  }, []);

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate files
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];

    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} has an invalid format. Only PDF, JPG, PNG, and GIF are allowed.`);
        return;
      }
    }

    setIsUploading(true);
    try {
      // Mock file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      const fileUrls = Array.from(files).map(file => `http://localhost:5000/uploads/identification/${file.name}`);
      setUploadedFiles(prev => [...prev, ...fileUrls]);
      toast.success(`${files.length} file(s) uploaded successfully!`);
    } catch (error: any) {
      toast.error('File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove uploaded file
  const removeFile = (fileUrl: string) => {
    setUploadedFiles(prev => prev.filter(url => url !== fileUrl));
  };

  // Submit application
  const handleSubmit = async () => {
    if (!purpose.trim()) {
      toast.error('Purpose is required');
      return;
    }
    
    if (purpose.length < 10) {
      toast.error('Purpose must be at least 10 characters long');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newApplication: IdentificationApplication = {
        id: Date.now().toString(),
        purpose,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: uploadedFiles
      };
      
      setApplications(prev => [newApplication, ...prev]);
      toast.success('Application submitted successfully!');
      setPurpose('');
      setUploadedFiles([]);
      setShowForm(false);
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View application details
  const viewDetails = (application: IdentificationApplication) => {
    setSelectedApplication(application);
    setShowDetails(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🆔 Identification Letter Service
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Apply for local identification letters for various purposes including employment,
          business registration, bank account opening, and other official requirements.
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
          size="large"
        >
          Apply for New Letter
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => setIsLoadingApplications(true)}
          disabled={isLoadingApplications}
        >
          Refresh Applications
        </Button>
      </Box>

      {/* Applications List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Applications
          </Typography>

          {isLoadingApplications ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : applications.length === 0 ? (
            <Alert severity="info">
              You haven't submitted any identification letter applications yet.
            </Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Purpose</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Letter Number</TableCell>
                  <TableCell>Applied Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {application.purpose}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={application.status.replace('_', ' ')}
                        color={statusColors[application.status] as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {application.letterNumber || '—'}
                    </TableCell>
                    <TableCell>
                      {formatDate(application.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => viewDetails(application)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {application.status === 'APPROVED' && application.letterNumber && (
                          <Tooltip title="Download Letter">
                            <IconButton
                              size="small"
                              onClick={() => toast.success('Letter download functionality coming soon!')}
                            >
                              <DownloadIcon fontSize="small" />
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
        </CardContent>
      </Card>

      {/* Application Form Dialog */}
      <Dialog
        open={showForm}
        onClose={() => !isSubmitting && setShowForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Apply for Identification Letter
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={3}>
              {/* Purpose Field */}
              <Grid item xs={12}>
                <TextField
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  label="Purpose of Request"
                  multiline
                  rows={4}
                  fullWidth
                  helperText="Clearly state why you need this identification letter"
                  placeholder="e.g., For employment at [Company Name], for opening a bank account at [Bank Name], for business registration, etc."
                />
              </Grid>

              {/* File Upload Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Required Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload supporting documents (ID card, passport photo, etc.)
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <input
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    style={{ display: 'none' }}
                    id="file-upload"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                      disabled={isUploading}
                      fullWidth
                    >
                      {isUploading ? 'Uploading...' : 'Upload Documents'}
                    </Button>
                  </label>
                </Box>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Uploaded Documents ({uploadedFiles.length})
                    </Typography>
                    <Stack spacing={1}>
                      {uploadedFiles.map((fileUrl, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            backgroundColor: 'action.hover',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                            Document {index + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => removeFile(fileUrl)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                )}

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Accepted formats:</strong> PDF, JPG, PNG, GIF<br />
                    <strong>Maximum file size:</strong> 10MB per file<br />
                    <strong>Required documents:</strong> Valid ID, passport photo, supporting documents for your purpose
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowForm(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || uploadedFiles.length === 0 || !purpose.trim()}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Application Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Application Details
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Purpose
                </Typography>
                <Typography variant="body1">
                  {selectedApplication.purpose}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedApplication.status.replace('_', ' ')}
                  color={statusColors[selectedApplication.status] as any}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Application Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedApplication.createdAt)}
                </Typography>
              </Box>

              {selectedApplication.letterNumber && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Letter Number
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedApplication.letterNumber}
                  </Typography>
                </Box>
              )}

              {selectedApplication.issuedDate && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Issued Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedApplication.issuedDate)}
                  </Typography>
                </Box>
              )}

              {selectedApplication.expiryDate && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Expiry Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedApplication.expiryDate)}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Documents Submitted
                </Typography>
                <Typography variant="body2">
                  {selectedApplication.documents.length} document(s)
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>
            Close
          </Button>
          {selectedApplication?.status === 'APPROVED' && selectedApplication?.letterNumber && (
            <Button
              variant="contained"
              onClick={() => toast.success('Letter download functionality coming soon!')}
              startIcon={<DownloadIcon />}
            >
              Download Letter
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IdentificationPage;
