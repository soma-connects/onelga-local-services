import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import { store } from './store';
import { checkAuthToken, validateToken } from './store/slices/authSlice';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ModernDashboardPage from './pages/ModernDashboardPage';
import ServicesPage from './pages/ServicesPage';
import ApplicationsPage from './pages/ApplicationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ModernAdminDashboard from './pages/ModernAdminDashboard';
import GovernmentOfficialDashboardPage from './pages/GovernmentOfficialDashboardPage';
import ModernOfficialDashboard from './pages/ModernOfficialDashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationsPage from './pages/NotificationsPage';

// Services Pages
import IdentificationPage from './pages/services/IdentificationPage';
import BirthCertificatePage from './pages/services/BirthCertificatePage';
import HealthServicesPage from './pages/services/HealthServicesPage';
import BusinessServicesPage from './pages/services/BusinessServicesPage';
import TransportServicesPage from './pages/services/TransportServicesPage';
import SocialSecurityPage from './pages/services/SocialSecurityPage';
import EducationServicesPage from './pages/services/EducationServicesPage';
import HousingServicesPage from './pages/services/HousingServicesPage';
import NotFoundPage from './pages/NotFoundPage';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// App content component to handle auth initialization
function AppContent() {
  const dispatch = useDispatch();
  const { state } = useSettings();

  // Check for existing auth token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If token exists, validate it with the backend
      (dispatch as any)(validateToken());
    } else {
      // Just check localStorage for basic auth state
      dispatch(checkAuthToken());
    }
  }, [dispatch]);

  return (
    <ThemeProvider theme={state.theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ModernDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard-old" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute>
              <ApplicationsPage />
            </ProtectedRoute>
          } />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          
          {/* Role-based Dashboard Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <ModernAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-old" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/official" element={
            <ProtectedRoute requiredRoles={['official']}>
              <ModernOfficialDashboard />
            </ProtectedRoute>
          } />
          <Route path="/official-old" element={
            <ProtectedRoute requiredRoles={['official']}>
              <GovernmentOfficialDashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Service-specific Routes */}
          <Route path="/services/identification" element={
            <ProtectedRoute>
              <IdentificationPage />
            </ProtectedRoute>
          } />
          <Route path="/services/birth-certificate" element={
            <ProtectedRoute>
              <BirthCertificatePage />
            </ProtectedRoute>
          } />
          <Route path="/services/health" element={
            <ProtectedRoute>
              <HealthServicesPage />
            </ProtectedRoute>
          } />
          <Route path="/services/business" element={
            <ProtectedRoute>
              <BusinessServicesPage />
            </ProtectedRoute>
          } />
          <Route path="/services/transport" element={
            <ProtectedRoute>
              <TransportServicesPage />
            </ProtectedRoute>
          } />
          <Route path="/services/social-security" element={
            <ProtectedRoute>
              <SocialSecurityPage />
            </ProtectedRoute>
          } />
          <Route path="/services/education" element={
            <ProtectedRoute>
              <EducationServicesPage />
            </ProtectedRoute>
          } />
          <Route path="/services/housing" element={
            <ProtectedRoute>
              <HousingServicesPage />
            </ProtectedRoute>
          } />
          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: state.theme.palette.mode === 'dark' ? '#333' : '#fff',
            color: state.theme.palette.mode === 'dark' ? '#fff' : '#333',
          },
        }}
      />
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
