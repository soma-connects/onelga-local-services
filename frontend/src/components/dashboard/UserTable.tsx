import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Edit as EditIcon,
  Block as SuspendIcon,
  CheckCircle as ActivateIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Define the User type based on your data structure
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CITIZEN' | 'ADMIN' | 'OFFICIAL';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onSuspend: (user: User) => void;
  onActivate: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserTableRow: React.FC<{ user: User } & Omit<UserTableProps, 'users'>> = ({ user, onEdit, onSuspend, onActivate, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    onDelete(user);
    handleMenuClose();
  };

  const getRoleChipColor = (role: User['role']) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'OFFICIAL': return 'warning';
      default: return 'primary';
    }
  };

  const getStatusChipColor = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'SUSPENDED': return 'error';
      default: return 'default';
    }
  };

  return (
    <TableRow hover key={user.id}>
      <TableCell component="th" scope="row">
        <Typography variant="body2" fontWeight="bold">{user.firstName} {user.lastName}</Typography>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell><Chip label={user.role} color={getRoleChipColor(user.role)} size="small" /></TableCell>
      <TableCell><Chip label={user.status} color={getStatusChipColor(user.status)} size="small" /></TableCell>
      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
      <TableCell align="right">
        <Tooltip title="Edit User"><IconButton onClick={() => onEdit(user)} size="small"><EditIcon /></IconButton></Tooltip>
        {user.status === 'ACTIVE' ? (
          <Tooltip title="Suspend User"><IconButton onClick={() => onSuspend(user)} size="small"><SuspendIcon /></IconButton></Tooltip>
        ) : (
          <Tooltip title="Activate User"><IconButton onClick={() => onActivate(user)} size="small"><ActivateIcon /></IconButton></Tooltip>
        )}
        <IconButton size="small" onClick={handleMenuClick}><MoreIcon /></IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            Delete User
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
};

const UserTable: React.FC<UserTableProps> = (props) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="user management table">
        <TableHead sx={{ backgroundColor: 'action.hover' }}>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.users.map((user) => (
            <UserTableRow key={user.id} user={user} {...props} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;