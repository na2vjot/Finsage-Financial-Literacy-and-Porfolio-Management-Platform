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
import { useLanguage } from '../../context/LanguageContext';

const drawerWidth = 280;

const Sidebar = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const menuItems = [
    { icon: <Dashboard />, text: t('dashboard'), path: '/' },
    { icon: <School />, text: t('financialBasics'), path: '/learn/basics' },
    { icon: <AccountBalance />, text: t('personalFinance'), path: '/learn/personal-finance' },
    { icon: <TrendingUp />, text: t('investments'), path: '/learn/investments' },
    { icon: <People />, text: t('forStudents'), path: '/learn/students' },
    { icon: <Work />, text: t('forProfessionals'), path: '/learn/professionals' },
    { icon: <Home />, text: t('forHomemakers'), path: '/learn/homemakers' },
    { icon: <Elderly />, text: t('forSeniors'), path: '/learn/seniors' },
    { icon: <Psychology />, text: t('behavioralFinance'), path: '/learn/behavioral' },
  ];

  const secondaryMenuItems = [
    { icon: <Person />, text: t('myProfile'), path: '/profile' },
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
          {t('learningPath')}
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
          {t('proTip')}
        </Typography>
        <Typography variant="body2">
          {t('proTipText')}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
