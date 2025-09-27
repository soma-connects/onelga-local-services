import React from 'react';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The page you are looking for doesn’t exist or has been moved.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4, justifyContent: 'center' }}>
          <Button variant="contained" component={RouterLink} to="/">
            Go Home
          </Button>
          <Button variant="outlined" component={RouterLink} to="/services">
            Browse Services
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default NotFoundPage;

