import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Stack,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  Circle,
  CheckCircle,
  Schedule,
  Error,
  Info,
} from '@mui/icons-material';

// Modern Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon: React.ElementType;
  color: string;
  actionButton?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color,
  actionButton,
  onClick,
}) => {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        } : {},
        position: 'relative',
        overflow: 'visible',
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {trend.isPositive ? (
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: trend.isPositive ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {trend.value}%
                </Typography>
                {trend.label && (
                  <Typography variant="caption" color="text.secondary">
                    {trend.label}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: color,
                width: 48,
                height: 48,
              }}
            >
              <Icon />
            </Avatar>
            {actionButton && (
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outlined';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'default' }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return { color: 'success' as const, icon: CheckCircle, label: 'Approved' };
      case 'PENDING':
        return { color: 'warning' as const, icon: Schedule, label: 'Pending' };
      case 'REJECTED':
        return { color: 'error' as const, icon: Error, label: 'Rejected' };
      case 'UNDER_REVIEW':
        return { color: 'info' as const, icon: Info, label: 'Under Review' };
      case 'COMPLETED':
        return { color: 'success' as const, icon: CheckCircle, label: 'Completed' };
      default:
        return { color: 'default' as const, icon: Circle, label: status };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Chip
      icon={<Icon sx={{ fontSize: 16 }} />}
      label={config.label}
      color={config.color}
      variant={variant === 'default' ? 'filled' : variant}
      size="small"
      sx={{ fontWeight: 500 }}
    />
  );
};

// Modern List Item Component
interface ModernListItemProps {
  title: string;
  subtitle: string;
  status?: string;
  time?: string;
  icon?: React.ElementType;
  color?: string;
  onClick?: () => void;
  actionButton?: boolean;
}

export const ModernListItem: React.FC<ModernListItemProps> = ({
  title,
  subtitle,
  status,
  time,
  icon: Icon,
  color = 'primary.main',
  onClick,
  actionButton,
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateX(4px)',
          boxShadow: 2,
        } : {},
        border: '1px solid',
        borderColor: 'divider',
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {Icon && (
          <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
            <Icon sx={{ fontSize: 20 }} />
          </Avatar>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {subtitle}
          </Typography>
          {time && (
            <Typography variant="caption" color="text.secondary">
              {time}
            </Typography>
          )}
        </Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          {status && <StatusBadge status={status} />}
          {actionButton && (
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

// Progress Card Component
interface ProgressCardProps {
  title: string;
  description: string;
  progress: number;
  total: number;
  color?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  description,
  progress,
  total,
  color = 'primary.main',
}) => {
  const percentage = total > 0 ? (progress / total) * 100 : 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: color,
                  borderRadius: 4,
                },
              }}
            />
          </Box>
          <Typography variant="body2" fontWeight={600}>
            {Math.round(percentage)}%
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {progress} of {total} completed
        </Typography>
      </CardContent>
    </Card>
  );
};

// Quick Action Card Component
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  isPopular?: boolean;
  onClick?: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  isPopular,
  onClick,
}) => {
  return (
    <Paper
      sx={{
        p: 3,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: isPopular ? '2px solid' : '1px solid',
        borderColor: isPopular ? 'primary.main' : 'divider',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          borderColor: 'primary.main',
        },
      }}
      onClick={onClick}
    >
      {isPopular && (
        <Chip
          label="Popular"
          size="small"
          color="primary"
          sx={{
            position: 'absolute',
            top: -8,
            right: 12,
            fontSize: '0.7rem',
            height: 20,
          }}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: color,
            width: 56,
            height: 56,
          }}
        >
          <Icon sx={{ fontSize: 28 }} />
        </Avatar>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// Section Header Component
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  action,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {Icon && <Icon color="primary" />}
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {action}
    </Box>
  );
};