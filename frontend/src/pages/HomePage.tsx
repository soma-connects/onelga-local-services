import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountBalance,
  Assignment,
  LocalHospital,
  Business,
  DirectionsCar,
  School,
  Home,
  FamilyRestroom,
  PlayArrow,
  Speed,
  Security,
  Group,
  CheckCircle,
  TrendingUp,
  ArrowForward,
  Star,
  AccessTime,
  Smartphone,
  Cloud,
  VerifiedUser,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Service categories for the homepage
const serviceCategories = [
  {
    title: 'Identification Services',
    description: 'Get official identification letters and documents',
    icon: AccountBalance,
    color: '#1976d2',
    path: '/services/identification',
    features: ['ID Letters', 'Age Declaration', 'Residency Proof']
  },
  {
    title: 'Birth Certificates',
    description: 'Apply for and collect birth certificates',
    icon: Assignment,
    color: '#2e7d32',
    path: '/services/birth-certificate',
    features: ['New Applications', 'Corrections', 'Duplicates']
  },
  {
    title: 'Health Services',
    description: 'Access healthcare and medical services',
    icon: LocalHospital,
    color: '#d32f2f',
    path: '/services/health',
    features: ['Health Records', 'Immunization', 'Medical Aid']
  },
  {
    title: 'Business Services',
    description: 'Register and manage business operations',
    icon: Business,
    color: '#ed6c02',
    path: '/services/business',
    features: ['Business Registration', 'Permits', 'Licenses']
  },
  {
    title: 'Transport Services',
    description: 'Vehicle registration and licensing',
    icon: DirectionsCar,
    color: '#9c27b0',
    path: '/services/transport',
    features: ['Vehicle Registration', 'Licenses', 'Permits']
  },
  {
    title: 'Education Services',
    description: 'Educational support and certification',
    icon: School,
    color: '#0288d1',
    path: '/services/education',
    features: ['School Enrollment', 'Scholarships', 'Certificates']
  },
];

const stats = [
  { label: 'Services Provided', value: '50,000+', icon: CheckCircle, color: '#2e7d32' },
  { label: 'Happy Citizens', value: '25,000+', icon: Group, color: '#1976d2' },
  { label: 'Average Processing', value: '2.4 Days', icon: AccessTime, color: '#ed6c02' },
  { label: 'System Uptime', value: '99.9%', icon: TrendingUp, color: '#7b1fa2' },
];

const features = [
  {
    title: 'Fast & Secure',
    description: 'Experience lightning-fast service processing with enterprise-grade security.',
    icon: VerifiedUser,
  },
  {
    title: 'Mobile Optimized',
    description: 'Access all services seamlessly from any device, anywhere, anytime.',
    icon: Smartphone,
  },
  {
    title: 'Cloud-Based',
    description: 'Reliable cloud infrastructure ensures 99.9% uptime and data protection.',
    icon: Cloud,
  },
  {
    title: '24/7 Support',
    description: 'Round-the-clock customer support to help with any questions or issues.',
    icon: AccessTime,
  },
];

const HomePage: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: '70vh', md: '80vh' },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Fade in={visible} timeout={1000}>
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <Typography
                variant={isMobile ? 'h2' : 'h1'}
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  mb: 3,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Welcome to Onelga
              </Typography>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 400,
                  opacity: 0.9,
                  mb: 4,
                }}
              >
                Your Digital Gateway to Local Government Services
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  maxWidth: '800px',
                  mx: 'auto',
                  mb: 6,
                  opacity: 0.8,
                  lineHeight: 1.6,
                }}
              >
                Experience seamless access to essential services including identification documents,
                birth certificates, business registration, health services, and more.
              </Typography>
              
              {isAuthenticated ? (
                <Box sx={{ mb: 4 }}>
                  <Chip
                    avatar={
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                        {user?.firstName?.charAt(0) || 'U'}
                      </Avatar>
                    }
                    label={`Welcome back, ${user?.firstName || 'User'}!`}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      mb: 3,
                      fontSize: '1rem',
                      py: 3,
                    }}
                  />
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ justifyContent: 'center' }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      component={RouterLink}
                      to="/dashboard"
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)',
                        },
                      }}
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      component={RouterLink}
                      to="/services"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Browse Services
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ justifyContent: 'center', mb: 4 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    component={RouterLink}
                    to="/register"
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={RouterLink}
                    to="/login"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="text"
                    size="large"
                    component={RouterLink}
                    to="/services"
                    endIcon={<PlayArrow />}
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Explore Services
                  </Button>
                </Stack>
              )}
            </Box>
          </Fade>
        </Container>
        
        {/* Background decorations */}
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '40%',
            height: '200%',
            background: 'rgba(255,255,255,0.05)',
            transform: 'rotate(25deg)',
            zIndex: 1,
          }}
        />
      </Box>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Slide in={visible} direction="up" timeout={1200}>
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={stat.label}>
                <Grow in={visible} timeout={1000 + index * 200}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      borderRadius: 3,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: stat.color,
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <stat.icon />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Slide>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" fontWeight="bold" textAlign="center" gutterBottom>
            Why Choose Onelga?
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            textAlign="center" 
            sx={{ maxWidth: '600px', mx: 'auto', mb: 6 }}
          >
            We're committed to providing you with the best digital government service experience.
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <Grow in={visible} timeout={1200 + index * 150}>
                  <Box sx={{ textAlign: 'center', height: '100%' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        boxShadow: 3,
                      }}
                    >
                      <feature.icon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 8 }} />

        {/* Services Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Our Services
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Discover our comprehensive range of digital services designed to make your interactions
            with local government efficient and convenient.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {serviceCategories.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={service.title}>
              <Grow in={visible} timeout={1500 + index * 100}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: theme.shadows[12],
                      borderColor: service.color,
                      '& .service-icon': {
                        transform: 'scale(1.1)',
                        boxShadow: `0 8px 24px ${service.color}40`,
                      },
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Avatar
                      className="service-icon"
                      sx={{
                        bgcolor: service.color,
                        width: 64,
                        height: 64,
                        mb: 3,
                        transition: 'all 0.3s ease',
                        boxShadow: 2,
                      }}
                    >
                      <service.icon sx={{ fontSize: 32, color: 'white' }} />
                    </Avatar>
                    <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {service.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {service.features.map((feature) => (
                        <Chip
                          key={feature}
                          label={feature}
                          size="small"
                          variant="outlined"
                          sx={{ bgcolor: `${service.color}10` }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      component={RouterLink}
                      to={service.path}
                      variant="contained"
                      fullWidth
                      sx={{ bgcolor: service.color, py: 1.5 }}
                    >
                      Learn More
                    </Button>
                  </CardActions>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box
        sx={{
          bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          py: { xs: 6, md: 10 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Join thousands of satisfied citizens who have streamlined their government service experiences.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center' }}
          >
            {!isAuthenticated && (
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/register"
                endIcon={<ArrowForward />}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  fontWeight: 'bold',
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Create Account
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/services"
              endIcon={<ArrowForward />}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontWeight: 'bold',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Explore Services
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
