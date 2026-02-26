import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Container,
  Fade,
  Grow,
  Badge,
} from '@mui/material';
import {
  School,
  TrendingUp,
  Bookmarks,
  CheckCircle,
  AccessTime,
  Star,
  Bookmark,
  BookmarkBorder,
  PlayArrow,
  EmojiEvents,
  Refresh,
  Dashboard,
  TimelineIcon,
  Psychology,
  Speed,
  MilitaryTech,
  Lightbulb,
  WorkspacePremium,
  Analytics,
  Leaderboard,
  Assessment,
  Grade,
  School as SchoolIcon,
} from '@mui/icons-material';
import { userStatsAPI } from '../../services/authAPI';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const ProfileDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [savedModules, setSavedModules] = useState([]);
  const [unsavingModules, setUnsavingModules] = useState(new Set());
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserStatistics(parsedUser._id);
    } else {
      setLoading(false);
      setError('User not logged in');
    }
  }, []);

  const fetchUserStatistics = async (userId) => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch user statistics
      const statsResponse = await userStatsAPI.getStatistics();
      if (statsResponse.success) {
        setStatistics(statsResponse.statistics);
      }
      
      // Fetch saved modules
      const modulesResponse = await userStatsAPI.getSavedModules();
      if (modulesResponse.success) {
        setSavedModules(modulesResponse.modules);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveModule = async (moduleId) => {
    try {
      setUnsavingModules(prev => new Set(prev).add(moduleId));
      
      const response = await userStatsAPI.unsaveModule(moduleId);
      
      if (response.success) {
        // Remove from saved modules state
        setSavedModules(prev => prev.filter(m => m.module_id !== moduleId));
        setMessage('Module removed from saved modules!');
        setSeverity('success');
        
        // Refresh statistics to update count
        if (user) {
          fetchUserStatistics(user._id);
        }
      } else {
        setMessage(response.message || 'Failed to unsave module');
        setSeverity('error');
      }
    } catch (error) {
      setMessage(error.message || 'Error unsaving module');
      setSeverity('error');
    } finally {
      setUnsavingModules(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });
    }
  };

  const handleViewModule = (module) => {
    // Navigate to the Learn page with the specific module
    navigate('/learn', { state: { selectedModule: module } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Fade in timeout={800}>
        <Paper 
          elevation={6}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'50\' font-size=\'100\' fill=\'white\' text-anchor=\'middle\'>&#x1F4DA;</text></svg>")',
              backgroundSize: '200px 200px',
              backgroundPosition: 'center',
            }}
          />
          <Box display="flex" alignItems="center" gap={4} position="relative" zIndex={1}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box sx={{ bgcolor: 'success.main', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle sx={{ fontSize: 16 }} />
                </Box>
              }
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  fontSize: 40,
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Badge>
            <Box flex={1}>
              <Box flex={1}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  Welcome back, {user?.name || 'User'}! 👋
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                  {user?.email || 'user@example.com'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Grow in timeout={1000}>
            <Card 
              elevation={4}
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Dashboard sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h3" fontWeight="bold">
                  {statistics?.modules?.completed || 0}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Modules Completed
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  of 37 modules
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Grow in timeout={1200}>
            <Card 
              elevation={4}
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Assessment sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h3" fontWeight="bold">
                  37
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Total Modules
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Available for learning
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Grow in timeout={1400}>
            <Card 
              elevation={4}
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Bookmarks sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {statistics?.modules?.saved || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Saved Modules
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Bookmarked
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Saved Modules */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Bookmarks color="primary" />
            <Typography variant="h6">Saved Modules</Typography>
          </Box>
          <IconButton onClick={() => fetchUserStatistics(user._id)} size="small">
            <Refresh />
          </IconButton>
        </Box>
        
        {savedModules.length > 0 ? (
          <List>
            {savedModules.map((module, index) => (
              <React.Fragment key={module._id}>
                <ListItem
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => handleViewModule(module)}
                >
                  <ListItemIcon>
                    <Bookmark color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={module.module_name}
                    secondary={
                      `Section: ${module.section} • ` +
                      `Difficulty: ${module.difficulty} • ` +
                      `Saved: ${new Date(module.saved_at).toLocaleDateString()}`
                    }
                  />
                  <Tooltip title="View module">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewModule(module);
                      }}
                      sx={{ ml: 1 }}
                    >
                      <PlayArrow sx={{ fontSize: 18, color: 'primary.main' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove from saved modules">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsaveModule(module.module_id);
                      }}
                      disabled={unsavingModules.has(module.module_id)}
                      sx={{ ml: 1 }}
                    >
                      {unsavingModules.has(module.module_id) ? (
                        <BookmarkBorder sx={{ fontSize: 18 }} />
                      ) : (
                        <Bookmark sx={{ fontSize: 18, color: 'error.main' }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </ListItem>
                {index < savedModules.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              No saved modules yet. Start exploring and save your favorite modules!
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Snackbar for unsave messages */}
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={severity} onClose={() => setMessage('')}>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfileDashboard;
