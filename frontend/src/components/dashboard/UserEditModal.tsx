import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Define the User type
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CITIZEN' | 'ADMIN' | 'OFFICIAL';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
}

// Validation Schema
const schema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  role: yup.string().oneOf(['CITIZEN', 'ADMIN', 'OFFICIAL']).required(),
  status: yup.string().oneOf(['ACTIVE', 'SUSPENDED', 'PENDING']).required(),
});

interface UserEditModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
  loading?: boolean;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ open, user, onClose, onSave, loading }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<User, 'id'>>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'CITIZEN',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (user) {
      reset(user);
    } else {
      reset({ firstName: '', lastName: '', email: '', role: 'CITIZEN', status: 'ACTIVE' });
    }
  }, [user, reset]);

  const onSubmit = (data: Partial<User>) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Create User'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Role" fullWidth error={!!errors.role}>
                    <MenuItem value="CITIZEN">Citizen</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="OFFICIAL">Official</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth error={!!errors.status}>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserEditModal;
