
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, TextField, Button, Stack, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { updateUserProfile } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const ProfileSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateUserProfile(form)).unwrap();
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Profile" />
      <CardContent>
        <Stack spacing={2}>
          <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} fullWidth />
          <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} fullWidth />
          <TextField label="Email" name="email" value={form.email} fullWidth disabled />
          <TextField label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} fullWidth />
          <TextField label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} fullWidth type="date" InputLabelProps={{ shrink: true }} />
          <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth />
          <Button variant="contained" onClick={handleSave} disabled={saving || isLoading} startIcon={saving ? <CircularProgress size={20} /> : undefined}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
