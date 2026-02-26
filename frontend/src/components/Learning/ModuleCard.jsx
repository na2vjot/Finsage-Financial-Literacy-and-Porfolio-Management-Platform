import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Bookmark,
  BookmarkBorder,
  PlayArrow,
  CheckCircle,
  Schedule,
  Star,
} from '@mui/icons-material';
import { userStatsAPI } from '../../services/authAPI';

const ModuleCard = ({ module, onStartModule, onProgressUpdate }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  // Check if module is already saved
  useEffect(() => {
    checkIfSaved();
  }, []);

  const checkIfSaved = async () => {
    try {
      const response = await userStatsAPI.getSavedModules();
      if (response.success) {
        const saved = response.modules.some(m => m.module_id === module.id);
        setIsSaved(saved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveModule = async () => {
    try {
      setIsSaving(true);
      const moduleData = {
        module_id: module.id,
        module_name: module.title,
        section: module.section,
        description: module.description,
        difficulty: module.difficulty,
        estimated_time: module.estimatedTime,
        topics: module.topics
      };

      const response = await userStatsAPI.saveModule(moduleData);
      
      if (response.success) {
        setIsSaved(true);
        setMessage('Module saved to your profile!');
        setSeverity('success');
        setShowSaveDialog(false);
      } else {
        setMessage(response.message || 'Failed to save module');
        setSeverity('error');
      }
    } catch (error) {
      setMessage(error.message || 'Error saving module');
      setSeverity('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartModule = () => {
    // Track when user starts the module
    const startTime = Date.now();
    
    // Simulate module progress tracking
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
      setTimeSpent(elapsed);
      
      // Simulate progress (in real app, this would be based on actual completion)
      const simulatedProgress = Math.min((elapsed / module.estimatedTime) * 100, 100);
      setProgress(simulatedProgress);
      
      // Update progress in backend
      updateModuleProgress(simulatedProgress, elapsed);
    }, 30000); // Update every 30 seconds

    // Start the module
    onStartModule(module);
    
    // Store interval for cleanup
    window.currentModuleInterval = interval;
  };

  const updateModuleProgress = async (progressValue, timeValue) => {
    try {
      const progressData = {
        module_id: module.id,
        progress: Math.round(progressValue),
        time_spent: timeValue,
        status: progressValue >= 100 ? 'completed' : 'in_progress'
      };

      await userStatsAPI.updateProgress(progressData);
      
      if (onProgressUpdate) {
        onProgressUpdate(module.id, progressValue, timeValue);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" gutterBottom>
            {module.title}
          </Typography>
          <IconButton
            onClick={() => isSaved ? null : setShowSaveDialog(true)}
            color={isSaved ? 'primary' : 'default'}
            disabled={isSaving}
          >
            {isSaved ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {module.description}
        </Typography>

        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip
            label={module.section}
            size="small"
            variant="outlined"
          />
          <Chip
            label={module.difficulty}
            size="small"
            color={getDifficultyColor(module.difficulty)}
            variant="outlined"
          />
          <Chip
            icon={<Schedule />}
            label={`${module.estimatedTime} min`}
            size="small"
            variant="outlined"
          />
        </Box>

        {module.topics && module.topics.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Topics:
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {module.topics.map((topic, index) => (
                <Chip
                  key={index}
                  label={topic}
                  size="small"
                  variant="filled"
                />
              ))}
            </Box>
          </Box>
        )}

        {progress > 0 && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Progress</Typography>
              <Typography variant="body2">{Math.round(progress)}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={progress >= 100 ? 'success' : 'primary'}
            />
            {timeSpent > 0 && (
              <Typography variant="caption" color="text.secondary">
                Time spent: {timeSpent} minutes
              </Typography>
            )}
          </Box>
        )}

        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={handleStartModule}
          fullWidth
          sx={{ mt: 'auto' }}
        >
          Start Module
        </Button>
      </CardContent>

      {/* Save Module Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Module to Profile</DialogTitle>
        <DialogContent>
          <Typography>
            Save "{module.title}" to your profile to track your progress and access it later?
          </Typography>
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              • Track your learning progress<br/>
              • Save study time<br/>
              • Earn achievements<br/>
              • Access from any device
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveModule}
            variant="contained"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Module'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Message */}
      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage('')}
      >
        <Alert severity={severity} onClose={() => setMessage('')}>
          {message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ModuleCard;
