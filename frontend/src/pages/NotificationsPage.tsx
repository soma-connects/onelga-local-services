
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, CircularProgress, Alert, IconButton, Tooltip, Stack, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bulk: Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/profile/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      // Optionally show error
    }
  };

  // Bulk: Delete all
  const handleDeleteAll = async () => {
    try {
      const res = await fetch('/api/profile/notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      // Optionally show error
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/profile/notifications', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (data.success && data.data && data.data.notifications) {
          setNotifications(
            data.data.notifications.map((n: any) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type || 'info',
              timestamp: n.createdAt,
              isRead: n.isRead,
            }))
          );
        } else {
          setError('Failed to load notifications');
        }
      } catch (err) {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Mark as read handler
  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      // Optionally show error
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      {/* Bulk actions */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="outlined" color="success" size="small" onClick={handleMarkAllAsRead} disabled={notifications.length === 0 || notifications.every(n => n.isRead)}>
          Mark all as read
        </Button>
        <Button variant="outlined" color="error" size="small" onClick={handleDeleteAll} disabled={notifications.length === 0}>
          Delete all
        </Button>
      </Stack>
      <Paper elevation={3}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <List>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText primary="No notifications yet." />
              </ListItem>
            ) : (
              notifications.map((notif, idx) => (
                <React.Fragment key={notif.id}>
                  <ListItem alignItems="flex-start" sx={{ bgcolor: notif.isRead ? 'background.paper' : 'action.selected' }}
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        {!notif.isRead && (
                          <Tooltip title="Mark as read">
                            <IconButton edge="end" aria-label="mark as read" onClick={() => handleMarkAsRead(notif.id)}>
                              <CheckCircleIcon color="success" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(notif.id)}>
                            <DeleteIcon color="error" fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={notif.isRead ? 'normal' : 'bold'}>
                          {notif.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {notif.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {new Date(notif.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {idx < notifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))
            )}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default NotificationsPage;
