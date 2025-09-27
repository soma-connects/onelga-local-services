import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  Stack,
} from '@mui/material';
import { Email, AccountBalance, ArrowBack } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
    }, 2000);
  };

  if (showSuccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AccountBalance sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Check Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              We've sent password reset instructions to:
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ mb: 3 }}>
              {email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If you don't see the email in your inbox, please check your spam folder.
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              startIcon={<ArrowBack />}
              fullWidth
            >
              Back to Login
            </Button>
            <Button
              onClick={() => {
                setShowSuccess(false);
                setEmail('');
              }}
              variant="outlined"
              fullWidth
            >
              Try Different Email
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AccountBalance sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Forgot Password
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              error={!!error}
              helperText="Enter the email address associated with your account"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              autoFocus
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ py: 1.5 }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>

            <Button
              component={RouterLink}
              to="/login"
              variant="text"
              startIcon={<ArrowBack />}
              fullWidth
            >
              Back to Login
            </Button>
          </Stack>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              variant="body2"
              fontWeight="bold"
              sx={{ textDecoration: 'none' }}
            >
              Register here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;