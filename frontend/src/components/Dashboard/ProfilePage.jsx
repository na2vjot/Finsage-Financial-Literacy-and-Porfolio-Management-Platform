import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ProfileDashboard from './ProfileDashboard';

const ProfilePage = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 2,
            textAlign: 'center',
          }}
        >
          🎓 My Learning Profile
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}
        >
          Track your financial literacy journey, monitor your progress, and celebrate your achievements
        </Typography>
      </Box>

      <ProfileDashboard />
    </Container>
  );
};

export default ProfilePage;
