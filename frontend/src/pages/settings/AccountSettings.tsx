
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { changeUserPassword } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const AccountSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  // Password Change Dialog
  const [pwDialog, setPwDialog] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  // 2FA Dialog (placeholder)
  const [twoFADialog, setTwoFADialog] = useState(false);

  // Delete Account Dialog (placeholder)
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteSaving, setDeleteSaving] = useState(false);

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setPwSaving(true);
    try {
      await dispatch(changeUserPassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })).unwrap();
      toast.success('Password changed successfully');
      setPwDialog(false);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  // TODO: Implement real 2FA and account deletion logic

  return (
    <Card>
      <CardHeader title="Account" />
      <CardContent>
        <Stack spacing={2}>
          <Button variant="outlined" onClick={() => setPwDialog(true)}>Change Password</Button>
          <Button variant="outlined" onClick={() => setTwoFADialog(true)}>Set Up Two-Factor Authentication</Button>
          <Button variant="outlined" color="error" onClick={() => setDeleteDialog(true)}>Delete Account</Button>
        </Stack>
      </CardContent>

      {/* Change Password Dialog */}
      <Dialog open={pwDialog} onClose={() => setPwDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Current Password"
              type="password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={pwSaving || isLoading} startIcon={pwSaving ? <CircularProgress size={20} /> : undefined}>
            {pwSaving ? 'Saving...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2FA Dialog (placeholder) */}
      <Dialog open={twoFADialog} onClose={() => setTwoFADialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography>2FA setup coming soon.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTwoFADialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog (placeholder) */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography color="error" mb={2}>This action is irreversible. Type DELETE to confirm.</Typography>
          <TextField
            label="Type DELETE to confirm"
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteConfirm !== 'DELETE' || deleteSaving}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AccountSettings;
