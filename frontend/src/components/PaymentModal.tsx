import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  Money as CashIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  application: {
    id: string;
    serviceName: string;
    applicationNumber: string;
    fee: number;
    description?: string;
  } | null;
  onPaymentSuccess: (transactionId: string, method: string) => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  processingTime: string;
  available: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  application,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentData, setPaymentData] = useState({
    email: '',
    phone: '',
    fullName: '',
  });
  const [transactionId, setTransactionId] = useState('');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'paystack',
      name: 'Paystack',
      icon: CardIcon,
      description: 'Pay with card, bank transfer, or USSD',
      processingTime: 'Instant',
      available: true,
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      icon: CardIcon,
      description: 'Card payments and mobile money',
      processingTime: 'Instant',
      available: true,
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: BankIcon,
      description: 'Direct bank transfer',
      processingTime: '1-2 business days',
      available: true,
    },
    {
      id: 'cash_office',
      name: 'Cash at Office',
      icon: CashIcon,
      description: 'Pay at local government office',
      processingTime: 'Same day',
      available: true,
    },
  ];

  const steps = [
    'Select Payment Method',
    'Enter Payment Details',
    'Process Payment',
    'Payment Confirmation'
  ];

  useEffect(() => {
    if (open && application) {
      setCurrentStep(0);
      setSelectedMethod('');
      setPaymentData({
        email: '',
        phone: '',
        fullName: '',
      });
      setTransactionId('');
    }
  }, [open, application]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setCurrentStep(1);
  };

  const handlePaymentDataSubmit = () => {
    if (!paymentData.email || !paymentData.phone || !paymentData.fullName) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCurrentStep(2);
    processPayment();
  };

  const processPayment = async () => {
    if (!application) return;

    setLoading(true);
    
    try {
      // Simulate different payment processing based on method
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setTransactionId(mockTransactionId);

      switch (selectedMethod) {
        case 'paystack':
          await processPaystackPayment();
          break;
        case 'flutterwave':
          await processFlutterwavePayment();
          break;
        case 'bank_transfer':
          await processBankTransfer();
          break;
        case 'cash_office':
          await processCashPayment();
          break;
        default:
          throw new Error('Invalid payment method');
      }

      setCurrentStep(3);
      onPaymentSuccess(mockTransactionId, selectedMethod);
      toast.success('Payment processed successfully!');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPaystackPayment = async () => {
    // In a real implementation, you would integrate with Paystack API
    console.log('Processing Paystack payment...');
    
    // Mock Paystack integration
    const paystackConfig = {
      public_key: 'pk_test_your_paystack_public_key',
      email: paymentData.email,
      amount: application!.fee * 100, // Paystack expects amount in kobo
      currency: 'NGN',
      reference: `OLG_${application!.id}_${Date.now()}`,
      callback: (response: any) => {
        console.log('Paystack callback:', response);
      },
      onClose: () => {
        console.log('Paystack modal closed');
      }
    };

    // This would typically open Paystack's payment modal
    console.log('Paystack config:', paystackConfig);
  };

  const processFlutterwavePayment = async () => {
    // In a real implementation, you would integrate with Flutterwave API
    console.log('Processing Flutterwave payment...');
    
    // Mock Flutterwave integration
    const flutterwaveConfig = {
      public_key: 'FLWPUBK-your-flutterwave-public-key',
      tx_ref: `OLG_FLW_${application!.id}_${Date.now()}`,
      amount: application!.fee,
      currency: 'NGN',
      payment_options: 'card,mobilemoney,ussd',
      customer: {
        email: paymentData.email,
        phone_number: paymentData.phone,
        name: paymentData.fullName,
      },
      customizations: {
        title: 'Onelga Local Government',
        description: `Payment for ${application!.serviceName}`,
        logo: 'https://your-logo-url.com/logo.png',
      },
    };

    console.log('Flutterwave config:', flutterwaveConfig);
  };

  const processBankTransfer = async () => {
    console.log('Processing bank transfer...');
    // This would generate bank transfer details
  };

  const processCashPayment = async () => {
    console.log('Processing cash payment registration...');
    // This would register the intent to pay cash at office
  };

  const getBankTransferDetails = () => {
    return {
      accountName: 'Onelga Local Government',
      accountNumber: '1234567890',
      bankName: 'First Bank of Nigeria',
      reference: `OLG_${application?.id}_${Date.now()}`,
    };
  };

  const renderPaymentMethods = () => (
    <Grid container spacing={2}>
      {paymentMethods.map((method) => {
        const IconComponent = method.icon;
        return (
          <Grid item xs={12} sm={6} key={method.id}>
            <Card 
              sx={{ 
                cursor: method.available ? 'pointer' : 'not-allowed',
                opacity: method.available ? 1 : 0.5,
                '&:hover': method.available ? { 
                  transform: 'translateY(-2px)', 
                  boxShadow: 3 
                } : {},
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => method.available && handleMethodSelect(method.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <IconComponent />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{method.name}</Typography>
                    <Chip 
                      label={method.processingTime} 
                      size="small" 
                      color="info"
                    />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {method.description}
                </Typography>
                {!method.available && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    Currently unavailable
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  const renderPaymentForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" icon={<InfoIcon />}>
          Enter your details to proceed with payment via {paymentMethods.find(m => m.id === selectedMethod)?.name}
        </Alert>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Full Name"
          value={paymentData.fullName}
          onChange={(e) => setPaymentData({ ...paymentData, fullName: e.target.value })}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={paymentData.email}
          onChange={(e) => setPaymentData({ ...paymentData, email: e.target.value })}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Phone Number"
          value={paymentData.phone}
          onChange={(e) => setPaymentData({ ...paymentData, phone: e.target.value })}
          required
        />
      </Grid>

      {selectedMethod === 'bank_transfer' && (
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'grey.50', p: 2 }}>
            <Typography variant="h6" gutterBottom>Bank Transfer Details</Typography>
            {(() => {
              const bankDetails = getBankTransferDetails();
              return (
                <Box>
                  <Typography variant="body2"><strong>Account Name:</strong> {bankDetails.accountName}</Typography>
                  <Typography variant="body2"><strong>Account Number:</strong> {bankDetails.accountNumber}</Typography>
                  <Typography variant="body2"><strong>Bank:</strong> {bankDetails.bankName}</Typography>
                  <Typography variant="body2"><strong>Reference:</strong> {bankDetails.reference}</Typography>
                </Box>
              );
            })()}
          </Card>
        </Grid>
      )}

      {selectedMethod === 'cash_office' && (
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'warning.light', p: 2 }}>
            <Typography variant="h6" gutterBottom>Cash Payment Instructions</Typography>
            <Typography variant="body2">
              Visit the Onelga Local Government Secretariat during office hours (8:00 AM - 4:00 PM, Monday - Friday) 
              with your application reference number: <strong>{application?.applicationNumber}</strong>
            </Typography>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  const renderProcessing = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6" gutterBottom>
        Processing Payment...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we process your payment. Do not close this window.
      </Typography>
    </Box>
  );

  const renderSuccess = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Avatar sx={{ bgcolor: 'success.main', width: 64, height: 64, mx: 'auto', mb: 3 }}>
        <SuccessIcon sx={{ fontSize: 32 }} />
      </Avatar>
      <Typography variant="h5" gutterBottom color="success.main">
        Payment Successful!
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Your payment has been processed successfully.
      </Typography>
      <Card sx={{ bgcolor: 'grey.50', p: 2, mt: 3 }}>
        <Typography variant="body2"><strong>Transaction ID:</strong> {transactionId}</Typography>
        <Typography variant="body2"><strong>Amount:</strong> {formatAmount(application?.fee || 0)}</Typography>
        <Typography variant="body2"><strong>Service:</strong> {application?.serviceName}</Typography>
        <Typography variant="body2"><strong>Application:</strong> {application?.applicationNumber}</Typography>
      </Card>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderPaymentMethods();
      case 1:
        return renderPaymentForm();
      case 2:
        return renderProcessing();
      case 3:
        return renderSuccess();
      default:
        return null;
    }
  };

  if (!application) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon color="primary" />
            Payment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {application.serviceName} - {application.applicationNumber}
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Payment Amount */}
        <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">Amount to Pay</Typography>
                <Typography variant="body2">
                  Service fee for {application.serviceName}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatAmount(application.fee)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Progress Stepper */}
        <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        {getStepContent(currentStep)}
      </DialogContent>

      <DialogActions>
        {currentStep > 0 && currentStep < 2 && (
          <Button onClick={() => setCurrentStep(currentStep - 1)} disabled={loading}>
            Back
          </Button>
        )}
        
        {currentStep === 1 && (
          <Button 
            variant="contained" 
            onClick={handlePaymentDataSubmit}
            disabled={loading}
          >
            Proceed to Payment
          </Button>
        )}
        
        {currentStep === 3 && (
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        )}
        
        {currentStep < 1 && (
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
