import React, { useState, useEffect } from 'react';
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
  IconButton,
  Divider,
  Stack,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AccountCircle,
  AccountBalance,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { loginUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultRedirect = user.role === 'admin' 
        ? '/admin' 
        : user.role === 'official' 
        ? '/official' 
        : '/dashboard';
      const from = (location.state as any)?.from?.pathname || defaultRedirect;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);
  
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setErrors({});

    try {
      // Call login API using Redux thunk
      const result = await dispatch(loginUser({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      }));
      
      if (loginUser.fulfilled.match(result)) {
        if (!result.payload) {
          toast.error('Login successful but no user data received.');
          return;
        }
        const user = result.payload.user;
        
        // Show welcome message based on role
        const welcomeMessage = user.role === 'admin' 
          ? `Welcome back, Admin ${user.firstName}!`
          : user.role === 'official'
          ? `Welcome back, ${user.firstName}!`
          : `Welcome back, ${user.firstName}!`;
        
        toast.success(welcomeMessage);
        
        // Redirect based on role
        const defaultRedirect = user.role === 'admin' 
          ? '/admin' 
          : user.role === 'official' 
          ? '/official' 
          : '/dashboard';
        
        const from = (location.state as any)?.from?.pathname || defaultRedirect;
        navigate(from, { replace: true });
      } else if (loginUser.rejected.match(result)) {
        const errorMessage = result.payload as string;
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please check your credentials and try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <AccountBalance sx={{ fontSize: 48, color: 'primary.main' }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Onelga Local Government
          </Typography>
          <Typography variant="h6" component="h2" color="text.secondary" gutterBottom>
            Citizen Portal Login
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Access government services securely
          </Typography>
        </Box>

        {/* Security Notice */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              🔒 Secure Government Portal
            </Typography>
            <Typography variant="body2">
              Your data is protected with enterprise-grade security. Never share your login credentials.
            </Typography>
          </Box>
        </Alert>

        {/* General Error */}
        {(errors.general || error) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general || error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email || 'Enter your registered email address'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              autoComplete="email"
              autoFocus
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password || 'Enter your secure password'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.rememberMe}
                    onChange={handleInputChange('rememberMe')}
                    color="primary"
                  />
                }
                label="Remember me"
              />
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{ textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <AccountCircle />}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              {isLoading ? 'Signing In...' : 'Sign In to Portal'}
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }} />

        {/* Register Link */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              variant="body2"
              fontWeight="bold"
              sx={{ textDecoration: 'none' }}
            >
              Register as Citizen
            </Link>
          </Typography>
        </Box>

        {/* Demo Credentials */}
        <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Demo Credentials:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Admin:</strong> admin@onelga.gov.ng / admin123<br />
              <strong>Citizen:</strong> citizen@example.com / password123
            </Typography>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Link href="#" variant="caption" color="text.secondary">
              Privacy Policy
            </Link>
            <Link href="#" variant="caption" color="text.secondary">
              Terms of Service
            </Link>
            <Link href="#" variant="caption" color="text.secondary">
              Help & Support
            </Link>
            <Link href="#" variant="caption" color="text.secondary">
              Contact Us
            </Link>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
