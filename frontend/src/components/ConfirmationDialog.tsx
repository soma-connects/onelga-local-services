import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import {
  Warning,
  Error as ErrorIcon,
  Info,
} from '@mui/icons-material';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'warning' | 'error' | 'info';
  confirmText?: string;
}

const ConfirmationDialog = ({ open, title, message, onConfirm, onCancel, severity = 'warning', confirmText = 'Confirm' }: ConfirmationDialogProps) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {severity === 'warning' && <Warning color="warning" />}
        {severity === 'error' && <ErrorIcon color="error" />}
        {severity === 'info' && <Info color="info" />}
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={severity === 'error' ? 'error' : 'primary'}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;