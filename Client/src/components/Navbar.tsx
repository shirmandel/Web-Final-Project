import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const getProfileImage = () => {
    if (!user?.profileImage) return undefined;
    if (user.profileImage.startsWith('http')) return user.profileImage;
    return `${API_URL}${user.profileImage}`;
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', mx: 'auto' }}>
        <Typography
          variant="h5"
          onClick={() => navigate('/')}
          sx={{
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #E040FB, #00E5FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            letterSpacing: -0.5,
          }}
        >
          InstaVibe
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Home">
            <IconButton
              onClick={() => navigate('/')}
              sx={{ color: isActive('/') ? 'primary.main' : 'text.secondary' }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="AI Search">
            <IconButton
              onClick={() => navigate('/search')}
              sx={{ color: isActive('/search') ? 'primary.main' : 'text.secondary' }}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="New Post">
            <IconButton
              onClick={() => navigate('/create')}
              sx={{ color: isActive('/create') ? 'primary.main' : 'text.secondary' }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="My Posts">
            <IconButton
              onClick={() => navigate('/my-posts')}
              sx={{ color: isActive('/my-posts') ? 'primary.main' : 'text.secondary' }}
            >
              <PersonIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton onClick={() => navigate(`/profile/${user?._id}`)}>
              <Avatar
                src={getProfileImage()}
                sx={{ width: 32, height: 32, border: '2px solid', borderColor: 'primary.main' }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} sx={{ color: 'text.secondary' }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
