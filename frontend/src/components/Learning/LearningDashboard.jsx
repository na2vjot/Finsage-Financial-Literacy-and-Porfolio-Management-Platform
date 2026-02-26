import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  TrendingUp,
  School,
  AccessTime,
  Star,
  Refresh,
} from '@mui/icons-material';
import ModuleCard from './ModuleCard';
import { userStatsAPI } from '../../services/authAPI';

const LearningDashboard = () => {
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  // Sample modules data (in production, this would come from an API)
  const sampleModules = [
    {
      id: 'budget-basics-101',
      title: 'Budgeting Fundamentals',
      description: 'Learn the basics of creating and maintaining a personal budget. Track income, expenses, and savings goals effectively.',
      section: 'Personal Finance',
      difficulty: 'beginner',
      estimatedTime: 45,
      topics: ['budgeting', 'personal finance', 'money management', 'savings'],
      rating: 4.8,
      enrolled: 1250
    },
    {
      id: 'investment-intro',
      title: 'Introduction to Investing',
      description: 'Understanding basic investment concepts, stocks, bonds, and portfolio diversification strategies.',
      section: 'Investments',
      difficulty: 'intermediate',
      estimatedTime: 60,
      topics: ['investing', 'stocks', 'bonds', 'portfolio', 'risk management'],
      rating: 4.6,
      enrolled: 890
    },
    {
      id: 'tax-planning',
      title: 'Tax Planning Strategies',
      description: 'Advanced tax planning and optimization techniques for individuals and small businesses.',
      section: 'Advanced Finance',
      difficulty: 'advanced',
      estimatedTime: 90,
      topics: ['taxes', 'planning', 'optimization', 'deductions', 'compliance'],
      rating: 4.9,
      enrolled: 450
    },
    {
      id: 'retirement-planning',
      title: 'Retirement Planning Basics',
      description: 'Plan for your financial future with comprehensive retirement strategies and investment options.',
      section: 'Life Planning',
      difficulty: 'intermediate',
      estimatedTime: 75,
      topics: ['retirement', '401k', 'IRA', 'pensions', 'financial independence'],
      rating: 4.7,
      enrolled: 670
    },
    {
      id: 'emergency-fund',
      title: 'Building Emergency Funds',
      description: 'Learn how to build and maintain an emergency fund for financial security and peace of mind.',
      section: 'Personal Finance',
      difficulty: 'beginner',
      estimatedTime: 30,
      topics: ['emergency fund', 'savings', 'financial security', 'risk management'],
      rating: 4.5,
      enrolled: 1100
    },
    {
      id: 'credit-score',
      title: 'Understanding Credit Scores',
      description: 'Master credit score concepts, improvement strategies, and how credit affects your financial life.',
      section: 'Credit Management',
      difficulty: 'beginner',
      estimatedTime: 40,
      topics: ['credit score', 'credit report', 'FICO', 'credit improvement', 'debt'],
      rating: 4.6,
      enrolled: 980
    }
  ];

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    filterModules();
  }, [searchTerm, filterSection, filterDifficulty, modules]);

  const initializeDashboard = async () => {
    try {
      // Get user data
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Fetch user statistics
        const statsResponse = await userStatsAPI.getStatistics();
        if (statsResponse.success) {
          setStatistics(statsResponse.statistics);
        }
      }

      // Set modules (in production, this would be fetched from API)
      setModules(sampleModules);
      
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterModules = () => {
    let filtered = modules;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by section
    if (filterSection !== 'all') {
      filtered = filtered.filter(module => module.section === filterSection);
    }

    // Filter by difficulty
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(module => module.difficulty === filterDifficulty);
    }

    setFilteredModules(filtered);
  };

  const handleStartModule = (module) => {
    console.log('Starting module:', module.title);
    // In a real app, this would navigate to the module content
    // For now, we'll just show a message
    alert(`Starting module: ${module.title}\n\nIn a real application, this would take you to the module content where you can learn and track your progress.`);
  };

  const handleProgressUpdate = (moduleId, progress, timeSpent) => {
    console.log(`Progress updated for ${moduleId}: ${progress}% in ${timeSpent} minutes`);
    // In a real app, this would update the UI in real-time
  };

  const getSections = () => {
    const sections = [...new Set(modules.map(m => m.section))];
    return sections;
  };

  const getDifficulties = () => {
    const difficulties = [...new Set(modules.map(m => m.difficulty))];
    return difficulties;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading learning dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Learning Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore financial literacy modules and track your learning progress
        </Typography>
      </Box>

      {/* User Statistics Overview */}
      {statistics && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <School color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6">{statistics.modules.completed}</Typography>
              <Typography variant="body2" color="text.secondary">Modules Completed</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <AccessTime color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6">{statistics.progress.total_time_spent_hours}h</Typography>
              <Typography variant="body2" color="text.secondary">Study Time</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <TrendingUp color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6">{statistics.progress.overall_percentage}%</Typography>
              <Typography variant="body2" color="text.secondary">Overall Progress</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Star color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6">{statistics.modules.saved}</Typography>
              <Typography variant="body2" color="text.secondary">Saved Modules</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filters and Search */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                label="Section"
              >
                <MenuItem value="all">All Sections</MenuItem>
                {getSections().map(section => (
                  <MenuItem key={section} value={section}>{section}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                label="Difficulty"
              >
                <MenuItem value="all">All Levels</MenuItem>
                {getDifficulties().map(difficulty => (
                  <MenuItem key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setSearchTerm('');
                setFilterSection('all');
                setFilterDifficulty('all');
              }}
              fullWidth
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Modules Grid */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          Available Modules ({filteredModules.length})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click the bookmark icon to save modules to your profile
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {filteredModules.map((module) => (
          <Grid item xs={12} md={6} lg={4} key={module.id}>
            <ModuleCard
              module={module}
              onStartModule={handleStartModule}
              onProgressUpdate={handleProgressUpdate}
            />
          </Grid>
        ))}
      </Grid>

      {filteredModules.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No modules found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LearningDashboard;
