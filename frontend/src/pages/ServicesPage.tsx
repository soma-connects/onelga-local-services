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
import { servicesAPI } from '../services/api';

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

  // Helper: pick icon based on category
  const getIconByCategory = (category: string): React.ElementType => {
    const map: Record<string, React.ElementType> = {
      identification: IdentificationIcon,
      'birth-registration': BirthIcon,
      health: HealthIcon,
      'health services': HealthIcon,
      business: BusinessIcon,
      transport: TransportIcon,
      'social-security': ComplaintIcon,
      education: EducationIcon,
      housing: HousingIcon,
      general: CategoryIcon,
    };
    const key = (category || '').toLowerCase();
    return map[key] || map.general;
  };

  // Curated fallback services (shown if API missing/fails)
  const fallbackServices: Service[] = [
    {
      id: 'identification-letter',
      name: 'Identification Letter',
      description: 'Apply for your official local government identification letter.',
      category: 'identification',
      processingTime: '2-3 days',
      requirements: ['Valid ID', 'Proof of Address'],
      fee: 500,
      isPopular: true,
      status: 'available',
      icon: IdentificationIcon,
      applicationPath: '/services/identification',
    },
    {
      id: 'birth-certificate',
      name: 'Birth Certificate',
      description: 'Register a new birth or request a certificate.',
      category: 'birth-registration',
      processingTime: '5-7 days',
      requirements: ['Hospital letter', 'Parent ID'],
      fee: 1000,
      isPopular: true,
      status: 'available',
      icon: BirthIcon,
      applicationPath: '/services/birth-certificate',
    },
    {
      id: 'health-appointment',
      name: 'Health Appointment',
      description: 'Book appointments and access health services.',
      category: 'health',
      processingTime: 'Same day',
      requirements: ['National ID (optional)'],
      fee: 0,
      isPopular: false,
      status: 'available',
      icon: HealthIcon,
      applicationPath: '/services/health',
    },
    {
      id: 'business-registration',
      name: 'Business Registration',
      description: 'Register your business locally and obtain permits.',
      category: 'business',
      processingTime: '7-14 days',
      requirements: ['Business name', 'Owner ID'],
      fee: 2500,
      isPopular: false,
      status: 'coming_soon',
      icon: BusinessIcon,
      applicationPath: '/services/business',
    },
    {
      id: 'vehicle-registration',
      name: 'Vehicle Registration',
      description: 'Register your vehicle and obtain road permits.',
      category: 'transport',
      processingTime: '3-5 days',
      requirements: ['Vehicle documents', 'Owner ID'],
      fee: 3000,
      isPopular: false,
      status: 'temporarily_unavailable',
      icon: TransportIcon,
      applicationPath: '/services/transport',
    },
  ];

  // Normalize backend service shape to our UI model
  const normalizeService = (item: any): Service => {
    const category: string = (item.category || item.type || 'general').toString();
    const statusRaw = (item.status || 'available').toString().toLowerCase();
    const allowedStatus = ['available', 'temporarily_unavailable', 'coming_soon'];
    const status = allowedStatus.includes(statusRaw) ? (statusRaw as Service['status']) : 'available';
    return {
      id: item.id?.toString() || item._id?.toString() || `${category}-${item.name || item.title || 'service'}`,
      name: item.name || item.title || 'Service',
      description: item.description || item.summary || 'No description provided.',
      category,
      processingTime: item.processingTime || item.sla || '1-3 days',
      requirements: Array.isArray(item.requirements)
        ? item.requirements
        : (typeof item.requirements === 'string' ? [item.requirements] : []),
      fee: typeof item.fee === 'number' ? item.fee : Number(item.fee) || 0,
      isPopular: Boolean(item.isPopular),
      status,
      icon: getIconByCategory(category),
      applicationPath: item.applicationPath || `/services/${category.replace(/\s+/g, '-').toLowerCase()}`,
    };
  };

  // Fetch services data with graceful fallback
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const resp = await servicesAPI.getServices();
        const raw = Array.isArray(resp.data)
          ? resp.data
          : (resp.data as any)?.services || [];
        if (raw && raw.length > 0) {
          const normalized = raw.map(normalizeService);
          setServices(normalized);
          setFilteredServices(normalized);
        } else {
          // Empty API response → use curated fallback
          setServices(fallbackServices);
          setFilteredServices(fallbackServices);
        }
      } catch (error) {
        // Network/API failure → fallback for a good UX
        setServices(fallbackServices);
        setFilteredServices(fallbackServices);
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
