import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { userStatsAPI } from '../services/authAPI';

const ModuleSaver = () => {
  const [moduleData, setModuleData] = useState({
    module_id: '',
    module_name: '',
    section: '',
    description: '',
    difficulty: 'beginner',
    estimated_time: 30,
    topics: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const handleChange = (field) => (event) => {
    setModuleData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveModule = async () => {
    if (!moduleData.module_id || !moduleData.module_name) {
      setMessage('Module ID and Name are required');
      setSeverity('error');
      return;
    }

    try {
      setLoading(true);
      const response = await userStatsAPI.saveModule(moduleData);
      
      if (response.success) {
        setMessage('Module saved successfully!');
        setSeverity('success');
        // Reset form
        setModuleData({
          module_id: '',
          module_name: '',
          section: '',
          description: '',
          difficulty: 'beginner',
          estimated_time: 30,
          topics: []
        });
      } else {
        setMessage(response.message || 'Failed to save module');
        setSeverity('error');
      }
    } catch (error) {
      setMessage(error.message || 'Error saving module');
      setSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Save Module to Profile
      </Typography>
      
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Module ID"
                value={moduleData.module_id}
                onChange={handleChange('module_id')}
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Module Name"
                value={moduleData.module_name}
                onChange={handleChange('module_name')}
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Section"
                value={moduleData.section}
                onChange={handleChange('section')}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={moduleData.difficulty}
                  onChange={handleChange('difficulty')}
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={moduleData.description}
                onChange={handleChange('description')}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Time (minutes)"
                type="number"
                value={moduleData.estimated_time}
                onChange={handleChange('estimated_time')}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveModule}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Saving...' : 'Save Module'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage('')}
      >
        <Alert severity={severity} onClose={() => setMessage('')}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModuleSaver;
