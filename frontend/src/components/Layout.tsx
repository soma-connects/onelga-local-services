import React, { useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Container,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as ApplicationIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  AccountBalance as OfficialIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout, checkAuthToken, hydrate } from '../store/slices/authSlice';
import NotificationCenter from './NotificationCenter';

interface LayoutProps {
  children: React.ReactNode;
}

// Define navigation links based on user role
const getNavigationLinks = (role?: string) => {
  const baseLinks = [
    { label: 'Dashboard', to: '/dashboard', icon: DashboardIcon },
    { label: 'Applications', to: '/applications', icon: ApplicationIcon },
    { label: 'Services', to: '/services' },
  ];

  switch (role) {
    case 'admin':
      return [
        { label: 'Admin Dashboard', to: '/admin', icon: AdminIcon },
        ...baseLinks,
      ];
    case 'official':
      return [
        { label: 'Official Dashboard', to: '/official', icon: OfficialIcon },
        ...baseLinks,
      ];
    default: // citizen
      return baseLinks;
  }
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get auth state from Redux
  const { isAuthenticated, user, token, isLoading } = useSelector((state: RootState) => state.auth);

  // Check authentication on mount and token changes
  useEffect(() => {
    if (token && !user) {
      // Try to get user data from API if we have token but no user
      fetchUserData();
    } else if (!token) {
      dispatch(checkAuthToken());
    }
  }, [token, user, dispatch]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        dispatch(hydrate({ user: userData.data.user, token: token! }));
      } else {
        // Token is invalid, clear auth state
        dispatch(logout());
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      dispatch(logout());
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuAnchor(null);
    navigate('/login');
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'official': return <OfficialIcon />;
      default: return <PersonIcon />;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'official': return 'warning';
      default: return 'primary';
    }
  };

  const toggleMobile = () => setMobileOpen((v) => !v);
  
  const navigationLinks = isAuthenticated ? getNavigationLinks(user?.role) : [
    { label: 'Home', to: '/' },
    { label: 'Services', to: '/services' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Accessibility: Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Header / Navigation */}
      <AppBar position="sticky" color="primary" enableColorOnDark>
        <Toolbar>
          {/* Mobile menu button */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open navigation menu"
            onClick={toggleMobile}
            sx={{ display: { xs: 'inline-flex', sm: 'none' }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Brand */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 600,
              letterSpacing: 0.2,
            }}
          >
            Onelga Local Services
          </Typography>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                {navigationLinks.map((link) => (
                  <Button
                    key={link.to}
                    color="inherit"
                    component={RouterLink}
                    to={link.to}
                    startIcon={link.icon ? <link.icon /> : undefined}
                    sx={{
                      backgroundColor: location.pathname === link.to ? 'rgba(255,255,255,0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
                
                {/* Notification Center */}
                <NotificationCenter userId={user?.id} />
                
                {/* User Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <Chip
                    icon={getRoleIcon(user?.role)}
                    label={user?.role?.toUpperCase() || 'USER'}
                    color={getRoleColor(user?.role) as any}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1, color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                  />
                  
                  <Button
                    color="inherit"
                    onClick={handleUserMenuOpen}
                    startIcon={
                      <Avatar sx={{ width: 28, height: 28 }}>
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </Avatar>
                    }
                    endIcon={<ArrowDropDownIcon />}
                    sx={{ textTransform: 'none' }}
                  >
                    {user?.firstName || 'User'}
                  </Button>
                  
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
                      <PersonIcon sx={{ mr: 1 }} /> Profile
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/settings'); handleUserMenuClose(); }}>
                      <SettingsIcon sx={{ mr: 1 }} /> Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1 }} /> Logout
                    </MenuItem>
                  </Menu>
                </Box>
              </>
            ) : (
              <>
                {navigationLinks.map((link) => (
                  <Button
                    key={link.to}
                    color="inherit"
                    component={RouterLink}
                    to={link.to}
                    sx={{
                      backgroundColor: location.pathname === link.to ? 'rgba(255,255,255,0.1)' : 'transparent'
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  sx={{ ml: 1, borderColor: 'rgba(255,255,255,0.5)' }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={toggleMobile} ModalProps={{ keepMounted: true }}>
        <Box role="presentation" sx={{ width: 260 }} onClick={toggleMobile} onKeyDown={toggleMobile}>
          <List>
            {isAuthenticated ? (
              <>
                {/* User info */}
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.email || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Chip
                    icon={getRoleIcon(user?.role)}
                    label={user?.role?.toUpperCase() || 'USER'}
                    color={getRoleColor(user?.role) as any}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Divider />
                
                {/* Authenticated nav links */}
                {navigationLinks.map((link) => (
                  <ListItemButton key={link.to} component={RouterLink} to={link.to}>
                    {link.icon && (
                      <Box sx={{ mr: 2, display: 'flex' }}>
                        <link.icon />
                      </Box>
                    )}
                    <ListItemText primary={link.label} />
                  </ListItemButton>
                ))}
                
                <Divider sx={{ my: 1 }} />
                
                {/* Profile */}
                <ListItemButton component={RouterLink} to="/profile">
                  <Box sx={{ mr: 2, display: 'flex' }}>
                    <PersonIcon />
                  </Box>
                  <ListItemText primary="Profile" />
                </ListItemButton>
                
                {/* Settings */}
                <ListItemButton component={RouterLink} to="/settings">
                  <Box sx={{ mr: 2, display: 'flex' }}>
                    <SettingsIcon />
                  </Box>
                  <ListItemText primary="Settings" />
                </ListItemButton>
                
                <Divider sx={{ my: 1 }} />
                
                {/* Logout */}
                <ListItemButton onClick={handleLogout}>
                  <Box sx={{ mr: 2, display: 'flex' }}>
                    <LogoutIcon />
                  </Box>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </>
            ) : (
              <>
                {navigationLinks.map((link) => (
                  <ListItemButton key={link.to} component={RouterLink} to={link.to}>
                    <ListItemText primary={link.label} />
                  </ListItemButton>
                ))}
                <ListItemButton component={RouterLink} to="/login">
                  <ListItemText primary="Login" />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/register">
                  <ListItemText primary="Register" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" id="main-content" sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
        {children}
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Onelga Local Government. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button size="small" component={RouterLink} to="/services" variant="text">Services</Button>
            {!isAuthenticated && (
              <Button size="small" component={RouterLink} to="/login" variant="text">Login</Button>
            )}
            {isAuthenticated && (
              <Button size="small" component={RouterLink} to="/dashboard" variant="text">Dashboard</Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
