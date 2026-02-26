import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  School,
  TrendingUp,
  AccountBalance,
  People,
  Work,
  Home,
  Elderly,
  Psychology,
  Person,
  MenuOpen,
  ChevronLeft,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 280;

const Sidebar = ({ open, onToggle }) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Dashboard />, text: 'Dashboard', path: '/' },
    { icon: <School />, text: 'Financial Basics', path: '/learn/basics' },
    { icon: <AccountBalance />, text: 'Personal Finance', path: '/learn/personal-finance' },
    { icon: <TrendingUp />, text: 'Investments', path: '/learn/investments' },
    { icon: <People />, text: 'For Students', path: '/learn/students' },
    { icon: <Work />, text: 'For Professionals', path: '/learn/professionals' },
    { icon: <Home />, text: 'For Homemakers', path: '/learn/homemakers' },
    { icon: <Elderly />, text: 'For Seniors', path: '/learn/seniors' },
    { icon: <Psychology />, text: 'Behavioral Finance', path: '/learn/behavioral' },
  ];

  const secondaryMenuItems = [
    { icon: <Person />, text: 'My Profile', path: '/profile' },
  ];

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onToggle}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Toggle Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: -16,
          zIndex: 1200,
        }}
      >
        <Tooltip title={open ? "Close sidebar" : "Open sidebar"}>
          <IconButton
            onClick={onToggle}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              boxShadow: 2,
            }}
          >
            {open ? <ChevronLeft /> : <MenuOpen />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ p: 2, pr: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          📚 Learning Path
        </Typography>
       
      </Box>

      <Divider />

      <List sx={{ px: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem
            key={index}
            button
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.875rem',
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      
      <Divider sx={{ mx: 2 }} />
      
      <List sx={{ px: 1 }}>
        {secondaryMenuItems.map((item, index) => (
          <ListItem
            key={index}
            button
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="subtitle2" gutterBottom>
          💡 Pro Tip
        </Typography>
        <Typography variant="body2">
          Start with Financial Basics if you're new to finance!
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
