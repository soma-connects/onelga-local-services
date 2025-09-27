import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Button,
  Stack,
  Skeleton,
  Alert,
  Snackbar,
  Slide,
  Fade,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive,
  Circle,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Assignment,
  Payment,
  Security,
  Schedule,
  Close,
  MarkAsUnread,
  Delete,
  Archive,
  Launch,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../../hooks/useDashboardData';
import toast from 'react-hot-toast';

// Notification Types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'application' | 'payment' | 'security';
  isRead: boolean;
  applicationId?: string;
  createdAt: string;
  data?: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
}

// Real-time notification hook
interface UseRealTimeNotificationsOptions {
  pollInterval?: number;
  maxNotifications?: number;
  autoMarkAsRead?: boolean;
}

const useRealTimeNotifications = (options: UseRealTimeNotificationsOptions = {}) => {
  const {
    pollInterval = 30000, // 30 seconds
    maxNotifications = 50,
    autoMarkAsRead = false
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/profile/notifications?limit=' + maxNotifications, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
        const unread = (data.data.notifications || []).filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
        setError(null);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [maxNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/profile/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
  }, [notifications, markAsRead]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/profile/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [notifications]);

  // Real-time polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(interval);
  }, [fetchNotifications, pollInterval]);

  // Auto-mark as read when viewed
  useEffect(() => {
    if (autoMarkAsRead) {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      unreadNotifications.forEach(n => {
        setTimeout(() => markAsRead(n.id), 2000); // Auto-mark after 2 seconds
      });
    }
  }, [notifications, autoMarkAsRead, markAsRead]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};

// Notification Icon Component
interface NotificationIconProps {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  unreadCount: number;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  onClick,
  unreadCount,
}) => {
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (unreadCount > 0) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 600);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  return (
    <IconButton
      color="inherit"
      onClick={onClick}
      sx={{
        animation: bounce ? 'bounce 0.6s ease-in-out' : 'none',
        '@keyframes bounce': {
          '0%, 20%, 60%, 100%': {
            transform: 'translateY(0)',
          },
          '40%': {
            transform: 'translateY(-10px)',
          },
          '80%': {
            transform: 'translateY(-5px)',
          },
        },
      }}
    >
      <Badge badgeContent={unreadCount} color="error" max={99}>
        {unreadCount > 0 ? (
          <NotificationsActive color="warning" />
        ) : (
          <NotificationsIcon />
        )}
      </Badge>
    </IconButton>
  );
};

// Notification Item Component
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}) => {
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const getNotificationIcon = (type: string, priority?: string) => {
    const iconProps = {
      sx: { 
        fontSize: 20,
        color: priority === 'urgent' ? 'error.main' : 
               priority === 'high' ? 'warning.main' : 'inherit'
      }
    };

    switch (type) {
      case 'success': return <CheckCircle color="success" {...iconProps} />;
      case 'warning': return <Warning color="warning" {...iconProps} />;
      case 'error': return <ErrorIcon color="error" {...iconProps} />;
      case 'application': return <Assignment color="primary" {...iconProps} />;
      case 'payment': return <Payment color="success" {...iconProps} />;
      case 'security': return <Security color="error" {...iconProps} />;
      default: return <Info color="info" {...iconProps} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return '#e8f5e8';
      case 'warning': return '#fff8e1';
      case 'error': return '#ffebee';
      case 'application': return '#e3f2fd';
      case 'payment': return '#e8f5e8';
      case 'security': return '#ffebee';
      default: return '#f5f5f5';
    }
  };

  const handleNotificationClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.applicationId) {
      navigate(`/applications/${notification.applicationId}`);
    } else if (onAction) {
      onAction(notification);
    }
  };

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        bgcolor: notification.isRead ? 'transparent' : getNotificationColor(notification.type),
        borderLeft: !notification.isRead ? '4px solid' : 'none',
        borderLeftColor: notification.priority === 'urgent' ? 'error.main' : 'primary.main',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'action.hover',
        },
        mb: 1,
        borderRadius: 1,
      }}
      onClick={handleNotificationClick}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'transparent' }}>
          {getNotificationIcon(notification.type, notification.priority)}
        </Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight={notification.isRead ? 'normal' : 'bold'}
            >
              {notification.title}
            </Typography>
            {notification.priority === 'urgent' && (
              <Chip label="URGENT" size="small" color="error" sx={{ height: 20 }} />
            )}
            {notification.priority === 'high' && (
              <Chip label="HIGH" size="small" color="warning" sx={{ height: 20 }} />
            )}
            {!notification.isRead && (
              <Circle sx={{ fontSize: 8, color: 'primary.main' }} />
            )}
          </Box>
        }
        secondary={
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {notification.message}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(notification.createdAt)}
              </Typography>
              {notification.actionText && (
                <Chip
                  label={notification.actionText}
                  size="small"
                  variant="outlined"
                  icon={<Launch sx={{ fontSize: 14 }} />}
                  sx={{ height: 24 }}
                />
              )}
            </Box>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setMenuAnchor(e.currentTarget);
          }}
        >
          <Circle sx={{ fontSize: 16 }} />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          onClick={(e) => e.stopPropagation()}
        >
          {!notification.isRead ? (
            <MenuItem onClick={() => { onMarkAsRead(notification.id); setMenuAnchor(null); }}>
              <CheckCircle sx={{ mr: 1, fontSize: 18 }} /> Mark as Read
            </MenuItem>
          ) : (
            <MenuItem onClick={() => { /* TODO: Mark as unread */ setMenuAnchor(null); }}>
              <MarkAsUnread sx={{ mr: 1, fontSize: 18 }} /> Mark as Unread
            </MenuItem>
          )}
          <MenuItem onClick={() => { onDelete(notification.id); setMenuAnchor(null); }}>
            <Delete sx={{ mr: 1, fontSize: 18 }} /> Delete
          </MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

// Main Notification Panel Component
interface NotificationPanelProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  maxHeight?: number;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  anchorEl,
  open,
  onClose,
  maxHeight = 500,
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useRealTimeNotifications({
    maxNotifications: 20,
    pollInterval: 15000, // 15 seconds
  });

  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  if (isLoading) {
    return (
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: 400, maxHeight },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {[...Array(3)].map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Menu>
    );
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { 
          width: 450, 
          maxHeight,
          '& .MuiList-root': { padding: 0 }
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            Notifications
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {unreadCount > 0 && (
              <Chip 
                label={`${unreadCount} unread`} 
                size="small" 
                color="primary"
                variant="outlined"
              />
            )}
            <IconButton size="small" onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
        
        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={markAllAsRead}
            sx={{ mt: 1 }}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Notifications List */}
      <Box sx={{ maxHeight: maxHeight - 150, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 1 }}>
            {notifications.slice(0, 10).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onAction={() => onClose()}
              />
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      {notifications.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleViewAll}
            startIcon={<Launch />}
          >
            View All Notifications
          </Button>
        </Box>
      )}
    </Menu>
  );
};

// Toast Notification Component for Real-time Updates
interface ToastNotificationProps {
  notification: Notification;
  open: boolean;
  onClose: () => void;
  onAction?: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  open,
  onClose,
  onAction,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      TransitionComponent={Slide}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 8 }}
    >
      <Alert
        onClose={onClose}
        severity={notification.type as any}
        variant="filled"
        action={
          notification.actionText && onAction ? (
            <Button color="inherit" size="small" onClick={onAction}>
              {notification.actionText}
            </Button>
          ) : undefined
        }
        sx={{ minWidth: 400 }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {notification.title}
        </Typography>
        <Typography variant="body2">
          {notification.message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

// Hook for managing toast notifications
export const useToastNotifications = () => {
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);

  const showToast = (notification: Notification) => {
    setToastNotification(notification);
  };

  const hideToast = () => {
    setToastNotification(null);
  };

  return {
    toastNotification,
    showToast,
    hideToast,
  };
};