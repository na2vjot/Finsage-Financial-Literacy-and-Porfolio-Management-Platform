import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  AccessTime,
  Bookmark,
  BookmarkBorder,
  CheckCircle,
  NavigateNext,
} from '@mui/icons-material';
import { syllabusAPI } from '../../services/api';
import ReactMarkdown from 'react-markdown';

const ContentViewer = ({ moduleId, onBack, onNextModule }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [nextModule, setNextModule] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const loadCompletionStatus = (moduleId) => {
    const completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]');
    setIsCompleted(completedModules.includes(moduleId));
  };

  const findNextModuleInSyllabus = (currentModuleId, syllabus) => {
    // Flatten all modules from all sections
    const allModules = [];
    
    Object.keys(syllabus).forEach(sectionKey => {
      const section = syllabus[sectionKey];
      
      if (section.modules) {
        section.modules.forEach(module => {
          if (module.submodules) {
            // Handle modules with submodules
            module.submodules.forEach(submodule => {
              allModules.push({
                id: submodule.id,
                title: submodule.title,
                file: submodule.file,
                section: sectionKey,
                parentModule: module.id
              });
            });
          } else {
            // Handle direct modules
            allModules.push({
              id: module.id,
              title: module.title,
              file: module.file,
              section: sectionKey
            });
          }
        });
      }
    });

    // Find current module index
    const currentIndex = allModules.findIndex(module => 
      module.file === currentModuleId || module.id === currentModuleId
    );

    // Return next module if exists
    if (currentIndex !== -1 && currentIndex < allModules.length - 1) {
      return allModules[currentIndex + 1];
    }

    return null;
  };

  const findNextModule = useCallback(async (currentModuleId) => {
    try {
      const syllabus = await syllabusAPI.getSyllabus();
      const next = findNextModuleInSyllabus(currentModuleId, syllabus);
      setNextModule(next);
    } catch (err) {
      console.error('Failed to find next module:', err);
    }
  }, []);

  const loadContent = useCallback(async (moduleId) => {
    setLoading(true);
    try {
      const data = await syllabusAPI.getContent(moduleId);
      setContent(data);
      
      // Load completion status
      loadCompletionStatus(moduleId);
      
      // Find next module
      findNextModule(moduleId);
    } catch (err) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [findNextModule]);

  useEffect(() => {
    if (moduleId) {
      loadContent(moduleId);
    }
  }, [moduleId, loadContent]);

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    // TODO: Save bookmark state to backend
  };

  const handleMarkAsComplete = () => {
    const completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]');
    
    if (!completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
      localStorage.setItem('completedModules', JSON.stringify(completedModules));
      setIsCompleted(true);
      setSnackbar({ open: true, message: '✅ Module marked as complete!' });
      
      // Dispatch custom event to notify other components (like SyllabusGrid)
      window.dispatchEvent(new CustomEvent('moduleCompleted', {
        detail: { type: 'MODULE_COMPLETED', moduleId: moduleId }
      }));
    } else {
      setSnackbar({ open: true, message: 'Module already completed!' });
    }
  };

  const handleNextLesson = () => {
    if (nextModule && onNextModule) {
      onNextModule(nextModule.file, nextModule);
    } else {
      setSnackbar({ open: true, message: 'No next module available!' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!content) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No content available
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" onClick={onBack}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 1 }}>
              {content.file_path.split('/').pop().replace('.md', '').replace(/-/g, ' ').toUpperCase()}
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={toggleBookmark}>
            {bookmarked ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Box>
      </Paper>

      {/* Content */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label="Reading" size="small" color="primary" />
          <Chip 
            label="10 min read" 
            size="small" 
            icon={<AccessTime sx={{ fontSize: 14 }} />} 
            variant="outlined" 
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Markdown Content */}
        <Box sx={{ 
          '& h1': { color: 'primary.main', mb: 2, mt: 3 },
          '& h2': { color: 'secondary.main', mb: 2, mt: 3 },
          '& h3': { color: 'text.primary', mb: 1, mt: 2 },
          '& p': { mb: 2, lineHeight: 1.6 },
          '& ul, & ol': { mb: 2, pl: 3 },
          '& li': { mb: 1 },
          '& blockquote': { 
            borderLeft: '4px solid primary.main', 
            pl: 2, 
            ml: 0, 
            bgcolor: 'grey.50', 
            py: 1,
            fontStyle: 'italic'
          },
          '& code': { 
            bgcolor: 'grey.200', 
            px: 1, 
            py: 0.5, 
            borderRadius: 1,
            fontFamily: 'monospace'
          },
          '& pre': { 
            bgcolor: 'grey.900', 
            color: 'white',
            p: 2, 
            borderRadius: 1,
            overflow: 'auto',
            '& code': { bgcolor: 'transparent', p: 0 }
          }
        }}>
          <ReactMarkdown>{content.content}</ReactMarkdown>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant={isCompleted ? "outlined" : "contained"} 
            startIcon={isCompleted ? <CheckCircle /> : <PlayArrow />}
            onClick={handleMarkAsComplete}
            color={isCompleted ? "success" : "primary"}
          >
            {isCompleted ? 'Completed ✓' : 'Mark as Complete'}
          </Button>
          <Button 
            variant="outlined" 
            endIcon={<NavigateNext />}
            onClick={handleNextLesson}
            disabled={!nextModule}
          >
            {nextModule ? `Next: ${nextModule.title}` : 'Last Module'}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ContentViewer;
