import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import { 
  AccountCircle, 
  School, 
  Chat, 
  MenuBook, 
  Logout, 
  Login as LoginIcon,
  Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/authAPI';
import { useLanguage } from '../../context/LanguageContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { t, toggleLanguage, isHindi } = useLanguage();

  // Check for logged in user on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Verify token and get fresh user data
          const response = await authAPI.getProfile();
          if (response.success) {
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
            // Dispatch custom event to notify syllabus components
            window.dispatchEvent(new CustomEvent('userLogin', {
              detail: { type: 'USER_LOGIN', user: response.user }
            }));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token verification failed, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
    };

    checkAuth();
  }, []);

  const navItems = [
    { label: t('home'), icon: <School />, path: '/' },
    { label: t('chat'), icon: <Chat />, path: '/chat' },
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    navigate('/login');
    handleMenuClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    // Navigate to profile page
    navigate('/profile');
    handleMenuClose();
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
            <School />
          </Avatar>
          <Typography variant="h6" noWrap component="div">
            {t('appName')}
          </Typography>
          <Typography variant="subtitle2" sx={{ ml: 2, color: 'rgba(255,255,255,0.7)' }}>
            {t('appSubtitle')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Hindi/English Toggle Button */}
          <Tooltip title={isHindi ? t('switchToEnglish') : t('switchToHindi')}>
            <Chip
              label={isHindi ? '🇬🇧 EN' : '🇮🇳 हि'}
              onClick={toggleLanguage}
              sx={{
                cursor: 'pointer',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.6)',
                border: '1px solid',
                fontWeight: 700,
                fontSize: '0.85rem',
                bgcolor: isHindi ? 'rgba(255,153,0,0.25)' : 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: isHindi ? 'rgba(255,153,0,0.4)' : 'rgba(255,255,255,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            />
          </Tooltip>
          {navItems.map((item) => (
            <IconButton
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{
                bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              {item.icon}
            </IconButton>
          ))}
          
          {/* User Account Section */}
          {user ? (
            <>
              <Chip
                label={user.name || user.email}
                color="secondary"
                variant="outlined"
                sx={{ 
                  mr: 1,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              />
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                sx={{
                  bgcolor: isMenuOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <AccountCircle />
              </IconButton>
              
              {/* User Menu */}
              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('profile')}</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('logout')}</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <IconButton
              color="inherit"
              onClick={handleLogin}
              sx={{
                bgcolor: location.pathname === '/login' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <LoginIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
