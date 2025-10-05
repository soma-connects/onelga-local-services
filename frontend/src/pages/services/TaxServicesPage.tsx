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
} from '@mui/material';
import {
  Receipt,
  Payment,
  AccountBalance,
  Business,
  Home,
  DirectionsCar,
  Store,
  Assignment,
  Visibility,
  Download,
  Add,
  CheckCircle,
  Warning,
  Schedule,
  AttachMoney,
  ExpandMore,
  Person,
  Group,
  CalendarToday,
  LocationOn,
  Print,
  Search,
  Calculate,
  CreditCard,
  History,
  TrendingUp,
  Info,
  Construction,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { servicesAPI } from '../../services/api';

interface TaxService {
  id: string;
  name: string;
  description: string;
  category: 'Property Tax' | 'Business Tax' | 'Vehicle Tax' | 'Development Levy' | 'Other Taxes';
  baseAmount: number;
  calculationMethod: string;
  dueDate: string;
  penalties: string;
  requirements: string[];
  status: 'Available' | 'Due Soon' | 'Overdue' | 'Suspended';
  priority?: 'High' | 'Medium' | 'Low';
}

interface TaxPayment {
  id: string;
  serviceId: string;
  serviceName: string;
  taxpayerName: string;
  taxPayerID: string;
  amount: number;
  paymentDate: string;
  status: 'Draft' | 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Refunded';
  referenceNumber?: string;
  receiptNumber?: string;
  paymentMethod?: string;
  dueDate?: string;
  penaltyAmount?: number;
}

interface TaxAssessment {
  id: string;
  taxpayerName: string;
  propertyAddress?: string;
  businessName?: string;
  assessmentType: 'Property' | 'Business' | 'Vehicle' | 'Development';
  assessedValue: number;
  taxAmount: number;
  assessmentDate: string;
  dueDate: string;
  status: 'Active' | 'Paid' | 'Overdue' | 'Under Review';
  paymentHistory: TaxPayment[];
}

const TaxServicesPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCalculatorDialog, setShowCalculatorDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<TaxService | null>(null);
  const [payments, setPayments] = useState<TaxPayment[]>([]);
  const [assessments, setAssessments] = useState<TaxAssessment[]>([]);
  const [calculatorStep, setCalculatorStep] = useState(0);
  
  const [paymentForm, setPaymentForm] = useState({
    taxpayerName: '',
    taxPayerID: '',
    phoneNumber: '',
    email: '',
    propertyAddress: '',
    businessName: '',
    vehicleRegistration: '',
    assessmentValue: '',
    customAmount: '',
    paymentMethod: 'online',
    agreeToTerms: false,
  });

  const [calculatorForm, setCalculatorForm] = useState({
    assessmentType: '',
    propertyType: '',
    propertySize: '',
    propertyLocation: '',
    businessType: '',
    businessRevenue: '',
    vehicleType: '',
    vehicleYear: '',
    developmentType: '',
    developmentSize: '',
  });

  const [calculatedTax, setCalculatedTax] = useState(0);

  const [taxServices, setTaxServices] = useState<TaxService[]>([]);

  // Load services (Taxes) from API; hide payments/assessments until backend endpoints exist
  useEffect(() => {
    const loadServices = async () => {
      try {
        const resp = await servicesAPI.getServices();
        const raw = Array.isArray(resp.data) ? resp.data : (resp.data as any)?.services || [];
        const normalized = raw
          .filter((s: any) => `${s.category || ''}`.toLowerCase().includes('tax'))
          .map((s: any): TaxService => ({
            id: s.id?.toString() || s._id?.toString() || s.name,
            name: s.name || s.title || 'Service',
            description: s.description || 'No description provided.',
            category: (s.category || 'Other Taxes') as any,
            baseAmount: Number(s.baseAmount) || Number(s.fee) || 0,
            calculationMethod: s.calculationMethod || 'Fixed/Variable by service',
            dueDate: s.dueDate || 'Varies',
            penalties: s.penalties || 'Varies',
            requirements: Array.isArray(s.requirements) ? s.requirements : [],
            status: ((s.status || 'Available').toString().toLowerCase() === 'overdue' ? 'Overdue' : 'Available') as any,
            priority: s.priority || undefined,
          }));
        setTaxServices(normalized);
      } catch (e) {
        setTaxServices([]);
      }
    };
    loadServices();
    setPayments([]);
    setAssessments([]);
  }, []);

  // Handle payment initiation
  const handlePayTax = (service: TaxService) => {
    setSelectedService(service);
    setShowPaymentDialog(true);
  };

  // Handle payment submission
  const handleSubmitPayment = async () => {
    if (!selectedService || !paymentForm.taxpayerName || !paymentForm.taxPayerID) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPayment: TaxPayment = {
        id: Date.now().toString(),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        taxpayerName: paymentForm.taxpayerName,
        taxPayerID: paymentForm.taxPayerID,
        amount: parseFloat(paymentForm.customAmount) || selectedService.baseAmount,
        paymentDate: new Date().toISOString(),
        status: 'Processing',
        referenceNumber: `TAX${Date.now()}`,
        paymentMethod: paymentForm.paymentMethod === 'online' ? 'Online Payment' : 'Bank Transfer',
      };

      setPayments(prev => [newPayment, ...prev]);
      toast.success('Payment initiated successfully!');
      setShowPaymentDialog(false);
      resetPaymentForm();
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  // Tax Calculator
  const calculateTax = () => {
    let tax = 0;
    const { assessmentType, propertySize, businessRevenue, developmentSize } = calculatorForm;

    switch (assessmentType) {
      case 'Property Tax':
        const propertyValue = parseFloat(propertySize) * 10000; // ₦10,000 per sqm
        tax = Math.max(propertyValue * 0.005, 5000); // 0.5% minimum ₦5,000
        break;
      case 'Business Tax':
        const revenue = parseFloat(businessRevenue) || 0;
        if (revenue < 1000000) tax = 10000;
        else if (revenue < 5000000) tax = 25000;
        else tax = 50000;
        break;
      case 'Development Levy':
        tax = parseFloat(developmentSize) * 500; // ₦500 per sqm
        break;
      default:
        tax = 0;
    }

    setCalculatedTax(tax);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      taxpayerName: '',
      taxPayerID: '',
      phoneNumber: '',
      email: '',
      propertyAddress: '',
      businessName: '',
      vehicleRegistration: '',
      assessmentValue: '',
      customAmount: '',
      paymentMethod: 'online',
      agreeToTerms: false,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
      case 'Active':
      case 'Completed':
      case 'Paid':
        return 'success';
      case 'Due Soon':
      case 'Processing':
      case 'Under Review':
        return 'warning';
      case 'Overdue':
      case 'Failed':
      case 'Suspended':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Property Tax': return <Home />;
      case 'Business Tax': return <Business />;
      case 'Vehicle Tax': return <DirectionsCar />;
      case 'Development Levy': return <Construction />;
      case 'Other Taxes': return <Receipt />;
      default: return <Receipt />;
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
      {taxServices.map((service) => (
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
                  <AttachMoney fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    From {formatCurrency(service.baseAmount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Due: {service.dueDate}
                  </Typography>
                </Box>
              </Stack>
              
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2" fontWeight="medium">
                    Calculation & Requirements
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Calculation Method:
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {service.calculationMethod}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Penalties:
                  </Typography>
                  <Typography variant="body2" paragraph color="error">
                    {service.penalties}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Required Documents:
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
                startIcon={<Payment />}
                onClick={() => handlePayTax(service)}
                disabled={service.status === 'Suspended'}
                variant="contained"
              >
                Pay Now
              </Button>
              <Button size="small" startIcon={<Calculate />}>
                Calculate
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderPayments = () => (
    <Box>
      {payments.length === 0 ? (
        <Alert severity="info">
          No tax payments found. Make your first tax payment to see your payment history.
        </Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tax Type</TableCell>
              <TableCell>Taxpayer</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {payment.serviceName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ref: {payment.referenceNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {payment.taxpayerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {payment.taxPayerID}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(payment.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(payment.paymentDate)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={payment.status}
                    size="small"
                    color={getStatusColor(payment.status) as any}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {payment.status === 'Completed' && (
                      <Tooltip title="Download Receipt">
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

  const renderAssessments = () => (
    <Box>
      {assessments.length === 0 ? (
        <Alert severity="info">
          No tax assessments available. Contact the tax office for property or business assessment.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {assessments.map((assessment) => (
            <Grid item xs={12} md={6} key={assessment.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {assessment.assessmentType === 'Property' ? <Home /> : 
                       assessment.assessmentType === 'Business' ? <Business /> : 
                       assessment.assessmentType === 'Vehicle' ? <DirectionsCar /> : <Receipt />}
                    </Avatar>
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <Typography variant="h6">
                        {assessment.taxpayerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {assessment.assessmentType} Assessment
                      </Typography>
                    </Box>
                    <Chip
                      label={assessment.status}
                      size="small"
                      color={getStatusColor(assessment.status) as any}
                    />
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {assessment.propertyAddress && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Property Address
                        </Typography>
                        <Typography variant="body1">
                          {assessment.propertyAddress}
                        </Typography>
                      </Grid>
                    )}
                    {assessment.businessName && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Business Name
                        </Typography>
                        <Typography variant="body1">
                          {assessment.businessName}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Assessed Value
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(assessment.assessedValue)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Tax Amount
                      </Typography>
                      <Typography variant="body1" color="primary" fontWeight="medium">
                        {formatCurrency(assessment.taxAmount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Assessment Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(assessment.assessmentDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Due Date
                      </Typography>
                      <Typography variant="body1" color={new Date(assessment.dueDate) < new Date() ? 'error' : 'inherit'}>
                        {formatDate(assessment.dueDate)}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Stack direction="row" spacing={1}>
                    {assessment.status !== 'Paid' && (
                      <Button
                        size="small"
                        startIcon={<Payment />}
                        variant="contained"
                      >
                        Pay Tax
                      </Button>
                    )}
                    <Button
                      size="small"
                      startIcon={<History />}
                    >
                      Payment History
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Print />}
                    >
                      Print Assessment
                    </Button>
                  </Stack>
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
          💰 Tax Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pay your taxes, view assessments, and manage tax payments for Onelga LGA.
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
            startIcon={<Payment />}
            size="large"
          >
            Pay Property Tax
          </Button>
          <Button
            variant="outlined"
            startIcon={<Business />}
            size="large"
          >
            Business Tax
          </Button>
          <Button
            variant="outlined"
            startIcon={<Calculate />}
            size="large"
            onClick={() => setShowCalculatorDialog(true)}
          >
            Tax Calculator
          </Button>
          <Button
            variant="outlined"
            startIcon={<Receipt />}
            size="large"
          >
            View Receipts
          </Button>
        </Stack>
      </Paper>

      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
          <Tab 
            label="Tax Services" 
            icon={<Badge badgeContent={taxServices.filter(s => s.status === 'Due Soon').length} color="error"><Receipt /></Badge>} 
          />
          <Tab 
            label="Payment History" 
            icon={<Badge badgeContent={payments.length} color="primary"><History /></Badge>} 
          />
          <Tab 
            label="Tax Assessments" 
            icon={<TrendingUp />} 
          />
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box>
        {selectedTab === 0 && renderServices()}
        {selectedTab === 1 && renderPayments()}
        {selectedTab === 2 && renderAssessments()}
      </Box>

      {/* Payment Dialog */}
      <Dialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Pay Tax - {selectedService?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Taxpayer Name"
                  value={paymentForm.taxpayerName}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, taxpayerName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Taxpayer ID"
                  value={paymentForm.taxPayerID}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, taxPayerID: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={paymentForm.phoneNumber}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={paymentForm.email}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </Grid>
              
              {selectedService?.category === 'Property Tax' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Property Address"
                    multiline
                    rows={2}
                    value={paymentForm.propertyAddress}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, propertyAddress: e.target.value }))}
                    required
                  />
                </Grid>
              )}
              
              {selectedService?.category === 'Business Tax' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    value={paymentForm.businessName}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, businessName: e.target.value }))}
                    required
                  />
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax Amount"
                  value={paymentForm.customAmount || selectedService?.baseAmount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, customAmount: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                  }}
                  helperText={`Minimum: ${formatCurrency(selectedService?.baseAmount || 0)}`}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel>Payment Method</FormLabel>
                  <RadioGroup
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  >
                    <FormControlLabel value="online" control={<Radio />} label="Online Payment (Paystack/Flutterwave)" />
                    <FormControlLabel value="transfer" control={<Radio />} label="Bank Transfer" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Due Date:</strong> {selectedService?.dueDate}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Penalties:</strong> {selectedService?.penalties}
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={paymentForm.agreeToTerms}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                    />
                  }
                  label="I confirm that the information provided is correct and agree to the payment terms"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitPayment}
            disabled={!paymentForm.agreeToTerms}
            startIcon={<CreditCard />}
          >
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tax Calculator Dialog */}
      <Dialog
        open={showCalculatorDialog}
        onClose={() => setShowCalculatorDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Tax Calculator
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Assessment Type"
                  value={calculatorForm.assessmentType}
                  onChange={(e) => setCalculatorForm(prev => ({ ...prev, assessmentType: e.target.value }))}
                >
                  <MenuItem value="Property Tax">Property Tax</MenuItem>
                  <MenuItem value="Business Tax">Business Tax</MenuItem>
                  <MenuItem value="Development Levy">Development Levy</MenuItem>
                </TextField>
              </Grid>
              
              {calculatorForm.assessmentType === 'Property Tax' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Property Size (Square Meters)"
                      type="number"
                      value={calculatorForm.propertySize}
                      onChange={(e) => setCalculatorForm(prev => ({ ...prev, propertySize: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Property Location"
                      value={calculatorForm.propertyLocation}
                      onChange={(e) => setCalculatorForm(prev => ({ ...prev, propertyLocation: e.target.value }))}
                    >
                      <MenuItem value="GRA">Government Reserved Area</MenuItem>
                      <MenuItem value="Town">Town Area</MenuItem>
                      <MenuItem value="Suburb">Suburban Area</MenuItem>
                      <MenuItem value="Rural">Rural Area</MenuItem>
                    </TextField>
                  </Grid>
                </>
              )}
              
              {calculatorForm.assessmentType === 'Business Tax' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Annual Revenue (₦)"
                    type="number"
                    value={calculatorForm.businessRevenue}
                    onChange={(e) => setCalculatorForm(prev => ({ ...prev, businessRevenue: e.target.value }))}
                  />
                </Grid>
              )}
              
              {calculatorForm.assessmentType === 'Development Levy' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Development Size (Square Meters)"
                    type="number"
                    value={calculatorForm.developmentSize}
                    onChange={(e) => setCalculatorForm(prev => ({ ...prev, developmentSize: e.target.value }))}
                  />
                </Grid>
              )}
              
              {calculatedTax > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="h6" gutterBottom>
                      Estimated Tax Amount
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(calculatedTax)}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCalculatorDialog(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={calculateTax}
            startIcon={<Calculate />}
          >
            Calculate Tax
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaxServicesPage;
