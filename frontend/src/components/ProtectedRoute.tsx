import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Alert, Container, Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'citizen' | 'admin' | 'official';
  requiredRoles?: ('citizen' | 'admin' | 'official')[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  requireAuth = true,
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);

  // Show loading spinner while validating token
  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  // Check if authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user account is suspended
  if (user && user.status === 'suspended') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          <Box>
            <strong>Account Suspended</strong>
            <br />
            Your account has been suspended. Please contact the administrator for assistance.
          </Box>
        </Alert>
      </Container>
    );
  }

  // Check if user account is inactive
  if (user && user.status === 'inactive') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="warning">
          <Box>
            <strong>Account Inactive</strong>
            <br />
            Your account is inactive. Please verify your email address or contact support.
          </Box>
        </Alert>
      </Container>
    );
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          <Box>
            <strong>Access Denied</strong>
            <br />
            You don't have permission to access this page. Required role: {requiredRole}
          </Box>
        </Alert>
      </Container>
    );
  }

  // Check multiple roles access
  if (requiredRoles && !requiredRoles.includes(user?.role as any)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          <Box>
            <strong>Access Denied</strong>
            <br />
            You don't have permission to access this page. Required roles: {requiredRoles.join(', ')}
          </Box>
        </Alert>
      </Container>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
