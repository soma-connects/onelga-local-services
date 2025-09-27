import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  InputAdornment,
  Paper,
  Breadcrumbs,
  Link,
  Alert,
  Skeleton,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Category as CategoryIcon,
  ContactMail as IdentificationIcon,
  ChildCare as BirthIcon,
  HealthAndSafety as HealthIcon,
  Business as BusinessIcon,
  DirectionsCar as TransportIcon,
  School as EducationIcon,
  Home as HousingIcon,
  ReportProblem as ComplaintIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  TrendingUp as PopularIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  processingTime: string;
  requirements: string[];
  fee: number;
  isPopular: boolean;
  status: 'available' | 'temporarily_unavailable' | 'coming_soon';
  icon: React.ElementType;
  applicationPath: string;
}

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories', count: 0 },
    { value: 'identification', label: 'Identification', count: 0 },
    { value: 'health', label: 'Health Services', count: 0 },
    { value: 'business', label: 'Business & Trade', count: 0 },
    { value: 'transport', label: 'Transport Services', count: 0 },
    { value: 'social-security', label: 'Social Security', count: 0 },
    { value: 'education', label: 'Education Services', count: 0 },
    { value: 'housing', label: 'Housing & Land', count: 0 },
    { value: 'birth-registration', label: 'Birth Registration', count: 0 },
  ];

  // Mock services data
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call

        const mockServices: Service[] = [
          {
            id: '1',
            name: 'Identification Letter',
            description: 'Official identification letter for residents of Onelga Local Government Area',
            category: 'identification',
            processingTime: '3-5 business days',
            requirements: ['Valid ID', 'Proof of residence', 'Passport photograph'],
            fee: 2000,
            isPopular: true,
            status: 'available',
            icon: IdentificationIcon,
            applicationPath: '/services/identification'
          },
          {
            id: '2',
            name: 'Birth Certificate',
            description: 'Register birth and obtain certified birth certificate',
            category: 'birth-registration',
            processingTime: '7-14 business days',
            requirements: ['Hospital birth record', 'Parents\' ID', 'Marriage certificate'],
            fee: 3500,
            isPopular: true,
            status: 'available',
            icon: BirthIcon,
            applicationPath: '/services/birth-certificate'
          },
          {
            id: '3',
            name: 'Health Facility Registration',
            description: 'Register health facilities and get operating permits',
            category: 'health',
            processingTime: '14-21 business days',
            requirements: ['Medical qualifications', 'Facility inspection', 'Equipment list'],
            fee: 15000,
            isPopular: false,
            status: 'available',
            icon: HealthIcon,
            applicationPath: '/services/health'
          },
          {
            id: '4',
            name: 'Business Registration',
            description: 'Register your business and obtain trading license',
            category: 'business',
            processingTime: '5-10 business days',
            requirements: ['Business plan', 'Tax identification', 'Location permit'],
            fee: 8000,
            isPopular: true,
            status: 'available',
            icon: BusinessIcon,
            applicationPath: '/services/business'
          },
          {
            id: '5',
            name: 'Vehicle Registration',
            description: 'Register vehicles and obtain permits for commercial operations',
            category: 'transport',
            processingTime: '3-7 business days',
            requirements: ['Vehicle documents', 'Insurance', 'Safety inspection'],
            fee: 12000,
            isPopular: false,
            status: 'available',
            icon: TransportIcon,
            applicationPath: '/services/transport'
          },
          {
            id: '6',
            name: 'School Registration',
            description: 'Register educational institutions and get accreditation',
            category: 'education',
            processingTime: '21-30 business days',
            requirements: ['Educational license', 'Facility assessment', 'Staff qualifications'],
            fee: 25000,
            isPopular: false,
            status: 'temporarily_unavailable',
            icon: EducationIcon,
            applicationPath: '/services/education'
          },
          {
            id: '7',
            name: 'Land Title Registration',
            description: 'Register land ownership and obtain certificate of occupancy',
            category: 'housing',
            processingTime: '30-45 business days',
            requirements: ['Survey plan', 'Purchase agreement', 'Tax clearance'],
            fee: 45000,
            isPopular: false,
            status: 'available',
            icon: HousingIcon,
            applicationPath: '/services/housing'
          },
          {
            id: '8',
            name: 'Social Welfare Services',
            description: 'Access social welfare programs and submit community complaints',
            category: 'social-security',
            processingTime: '1-3 business days',
            requirements: ['Valid ID', 'Income proof', 'Community reference'],
            fee: 0,
            isPopular: false,
            status: 'coming_soon',
            icon: ComplaintIcon,
            applicationPath: '/services/social-security'
          }
        ];

        setServices(mockServices);
        setFilteredServices(mockServices);
      } catch (error) {
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Filter services based on search and filters
  useEffect(() => {
    let filtered = services;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.requirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(service => service.status === selectedStatus);
    }

    setFilteredServices(filtered);
  }, [services, searchQuery, selectedCategory, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'temporarily_unavailable': return 'warning';
      case 'coming_soon': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'temporarily_unavailable': return 'Temporarily Unavailable';
      case 'coming_soon': return 'Coming Soon';
      default: return status;
    }
  };

  const formatFee = (fee: number) => {
    return fee === 0 ? 'Free' : `₦${fee.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={60} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/" color="inherit">Home</Link>
        <Typography color="text.primary">Services</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CategoryIcon color="primary" />
          Government Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and apply for various government services offered by Onelga Local Government Area.
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
                startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="temporarily_unavailable">Temporarily Unavailable</MenuItem>
                <MenuItem value="coming_soon">Coming Soon</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters */}
        {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                onDelete={() => setSearchQuery('')}
                size="small"
              />
            )}
            {selectedCategory !== 'all' && (
              <Chip
                label={`Category: ${categories.find(c => c.value === selectedCategory)?.label}`}
                onDelete={() => setSelectedCategory('all')}
                size="small"
              />
            )}
            {selectedStatus !== 'all' && (
              <Chip
                label={`Status: ${getStatusLabel(selectedStatus)}`}
                onDelete={() => setSelectedStatus('all')}
                size="small"
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
        </Typography>
        {filteredServices.some(s => s.isPopular) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon color="warning" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Popular services are marked with a star
            </Typography>
          </Box>
        )}
      </Box>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          No services found matching your criteria. Try adjusting your search or filters.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredServices.map((service) => {
            const IconComponent = service.icon;
            return (
              <Grid item xs={12} md={6} lg={4} key={service.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  {service.isPopular && (
                    <Badge
                      badgeContent={<StarIcon sx={{ fontSize: 12 }} />}
                      color="warning"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                      }}
                    >
                      <PopularIcon sx={{ opacity: 0 }} />
                    </Badge>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <IconComponent />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {service.name}
                        </Typography>
                        <Chip
                          label={getStatusLabel(service.status)}
                          color={getStatusColor(service.status) as any}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {service.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {service.processingTime}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                        Requirements:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {service.requirements.slice(0, 2).map((req, index) => (
                          <Chip
                            key={index}
                            label={req}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                        {service.requirements.length > 2 && (
                          <Chip
                            label={`+${service.requirements.length - 2} more`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Typography variant="h6" color="primary" fontWeight={600}>
                      {formatFee(service.fee)}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant={service.status === 'available' ? 'contained' : 'outlined'}
                      disabled={service.status !== 'available'}
                      onClick={() => {
                        if (service.status === 'available') {
                          navigate(service.applicationPath);
                        } else {
                          toast('This service is currently not available');
                        }
                      }}
                    >
                      {service.status === 'available' ? 'Apply Now' :
                       service.status === 'coming_soon' ? 'Coming Soon' : 'Unavailable'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Help Section */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          Need Help?
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          If you can't find the service you're looking for or need assistance with your application, 
          please contact our support team.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => toast('Contact support feature coming soon!')}
        >
          Contact Support
        </Button>
      </Paper>
    </Container>
  );
};

export default ServicesPage;
