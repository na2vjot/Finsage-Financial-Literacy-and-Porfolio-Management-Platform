import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  PlayArrow,
  CheckCircle,
  CheckCircleOutline,
  AccessTime,
  School,
  TrendingUp,
  AccountBalance,
  People,
  Work,
  Elderly,
  Home,
  Favorite,
  Bookmark,
  BookmarkBorder,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { userStatsAPI } from '../../services/authAPI';

const levelIcons = {
  1: <School />,
  2: <AccountBalance />,
  3: <TrendingUp />,
  4: <People />,
  5: <Work />,
  6: <Home />,
  7: <Elderly />,
  8: <Favorite />,
};

const levelColors = {
  1: '#4caf50', // Green - Beginner
  2: '#2196f3', // Blue - Intermediate
  3: '#ff9800', // Orange - Advanced
  4: '#9c27b0', // Purple - Specialized
  5: '#f44336', // Red - Expert
  6: '#795548', // Brown - Behavioral
  7: '#607d8b', // Blue Grey - Seniors
  8: '#3f51b5', // Indigo - Advanced Behavioral
};

const SyllabusGrid = ({ syllabus, onModuleSelect }) => {
  const [completedModules, setCompletedModules] = useState([]);
  const [savedModules, setSavedModules] = useState([]);
  const [savingModules, setSavingModules] = useState(new Set());
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  useEffect(() => {
    // Check if backend is available
    const isBackendAvailable = () => {
      // Simple check - we could add a more sophisticated health check
      // For now, we'll use localStorage flag to track backend availability
      const backendStatus = localStorage.getItem('backendAvailable');
      return backendStatus === 'true';
    };

    // Load completed modules from backend API
    const loadCompletedModules = async () => {
      if (isBackendAvailable()) {
        try {
          const response = await userStatsAPI.getCompletedModules();
          if (response.success) {
            const completed = response.modules || [];
            setCompletedModules(completed);
            // Also update localStorage for backup
            localStorage.setItem('completedModules', JSON.stringify(completed));
            return;
          }
        } catch (error) {
          // Mark backend as unavailable
          localStorage.setItem('backendAvailable', 'false');
        }
      }
      // Use localStorage fallback
      const completed = JSON.parse(localStorage.getItem('completedModules') || '[]');
      setCompletedModules(completed);
    };

    // Load completed modules
    loadCompletedModules();

    // Load saved modules from API
    loadSavedModules();

    // Listen for storage changes to update progress in real-time
    const handleStorageChange = (e) => {
      if (e.key === 'completedModules') {
        const updatedCompleted = JSON.parse(e.newValue || '[]');
        setCompletedModules(updatedCompleted);
      }
      // Reset progress when user logs in
      if (e.key === 'authToken' && e.newValue) {
        // User just logged in, load their progress from backend
        loadCompletedModules();
      }
    };

    // Also listen for custom events for same-tab updates
    const handleCustomEvent = (e) => {
      if (e.detail.type === 'MODULE_COMPLETED') {
        loadCompletedModules(); // Reload from backend
      }
      if (e.detail.type === 'USER_LOGIN') {
        // User just logged in, load their progress from backend
        loadCompletedModules();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('moduleCompleted', handleCustomEvent);
    window.addEventListener('userLogin', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('moduleCompleted', handleCustomEvent);
      window.removeEventListener('userLogin', handleCustomEvent);
    };
  }, []);

  const isModuleCompleted = (moduleFile) => {
    return completedModules.includes(moduleFile);
  };

  const getProgressPercentage = (sectionData) => {
    // Handle life stages sections (students, professionals, homemakers, seniors)
    if (sectionData.submodules && !sectionData.modules) {
      // This is a life stage section with direct submodules
      const totalModules = sectionData.submodules.length;
      const completedCount = sectionData.submodules.filter(submodule => 
        isModuleCompleted(submodule.file)
      ).length;
      
      return totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
    }
    
    // Handle regular sections with modules array
    if (!sectionData.modules) return 0;
    
    let totalModules = 0;
    let completedCount = 0;

    sectionData.modules.forEach(module => {
      if (module.submodules) {
        totalModules += module.submodules.length;
        completedCount += module.submodules.filter(submodule => 
          isModuleCompleted(submodule.file)
        ).length;
      } else {
        totalModules += 1;
        if (isModuleCompleted(module.file)) {
          completedCount += 1;
        }
      }
    });

    return totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  };

  const handleModuleClick = (module, submodule = null) => {
    const targetFile = submodule ? submodule.file : module.file;
    onModuleSelect(targetFile, submodule || module);
  };

  const loadSavedModules = async () => {
    try {
      const response = await userStatsAPI.getSavedModules();
      if (response.success) {
        setSavedModules(response.modules);
      }
    } catch (error) {
      console.error('Error loading saved modules:', error);
    }
  };

  const isModuleSaved = (moduleFile, moduleTitle, section) => {
    return savedModules.some(saved => 
      saved.module_id === moduleFile || 
      saved.module_name === moduleTitle
    );
  };

  const handleSaveModule = async (module, submodule = null) => {
    const targetModule = submodule || module;
    const moduleId = submodule ? submodule.file : module.id; // Use module.id for main modules, submodule.file for submodules
    
    // Check if moduleId exists
    if (!moduleId) {
      setMessage('Module ID not found - cannot save');
      setSeverity('error');
      return;
    }
    
    // Check if already saved - if yes, unsave it
    if (isModuleSaved(moduleId, targetModule.title, module.title)) {
      try {
        setSavingModules(prev => new Set(prev).add(moduleId));
        
        const response = await userStatsAPI.unsaveModule(moduleId);
        
        if (response.success) {
          // Remove from saved modules state
          setSavedModules(prev => prev.filter(m => m.module_id !== moduleId));
          setMessage('Module removed from saved modules!');
          setSeverity('success');
        } else {
          setMessage(response.message || 'Failed to unsave module');
          setSeverity('error');
        }
      } catch (error) {
        setMessage(error.message || 'Error unsaving module');
        setSeverity('error');
      } finally {
        setSavingModules(prev => {
          const newSet = new Set(prev);
          newSet.delete(moduleId);
          return newSet;
        });
      }
      return;
    }
    
    // If not saved, save it
    try {
      setSavingModules(prev => new Set(prev).add(moduleId));
      
      const moduleData = {
        module_id: moduleId,
        module_name: targetModule.title,
        section: module.title,
        difficulty: targetModule.difficulty || 'beginner',
        estimated_time: targetModule.duration || 30,
        topics: targetModule.topics || []
      };
      
      const response = await userStatsAPI.saveModule(moduleData);
      
      if (response.success) {
        // Add to saved modules state
        setSavedModules(prev => [...prev, {
          module_id: moduleId,
          module_name: targetModule.title,
          section: module.title,
          difficulty: targetModule.difficulty || 'beginner',
          estimated_time: targetModule.duration || 30,
          topics: targetModule.topics || [],
          saved_at: new Date().toISOString()
        }]);
        setMessage('Module saved successfully!');
        setSeverity('success');
      } else {
        setMessage(response.message || 'Failed to save module');
        setSeverity('error');
      }
    } catch (error) {
      setMessage(error.message || 'Error saving module');
      setSeverity('error');
    } finally {
      setSavingModules(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });
    }
  };

const handleCompleteModule = async (module, submodule = null) => {
  const targetModule = submodule || module;
  const moduleId = submodule ? submodule.file : module.id;
  
  // Prevent multiple simultaneous saves for the same module
  if (savingModules.has(moduleId)) {
    return;
  }

  // Add to saving set
  setSavingModules(prev => new Set(prev).add(moduleId));

  const isModuleCompleted = completedModules.includes(moduleId);

  // Check if backend is available
  const isBackendAvailable = () => {
    const backendStatus = localStorage.getItem('backendAvailable');
    return backendStatus === 'true';
  };

  try {
    if (isModuleCompleted) {
      // Uncomplete the module
      if (isBackendAvailable()) {
        try {
          const response = await userStatsAPI.uncompleteModule(moduleId);
          if (response.success) {
            const updated = completedModules.filter(id => id !== moduleId);
            setCompletedModules(updated);
            localStorage.setItem('completedModules', JSON.stringify(updated));
            setMessage('Module marked as incomplete!');
            setSeverity('info');
            
            // Trigger statistics refresh for Profile page
            window.dispatchEvent(new CustomEvent('moduleUncompleted', {
              detail: { type: 'MODULE_UNCOMPLETED', moduleId }
            }));
          } else {
            setMessage(response.message || 'Failed to uncomplete module');
            setSeverity('error');
          }
        } catch (error) {
          // Mark backend as unavailable and fallback to localStorage
          localStorage.setItem('backendAvailable', 'false');
          const updated = completedModules.filter(id => id !== moduleId);
          setCompletedModules(updated);
          localStorage.setItem('completedModules', JSON.stringify(updated));
          setMessage('Module marked as incomplete!');
          setSeverity('info');
          
          // Trigger statistics refresh for Profile page
          window.dispatchEvent(new CustomEvent('moduleUncompleted', {
            detail: { type: 'MODULE_UNCOMPLETED', moduleId }
          }));
        }
      } else {
        // Use localStorage directly
        const updated = completedModules.filter(id => id !== moduleId);
        setCompletedModules(updated);
        localStorage.setItem('completedModules', JSON.stringify(updated));
        setMessage('Module marked as incomplete!');
        setSeverity('info');
        
        // Trigger statistics refresh for Profile page
        window.dispatchEvent(new CustomEvent('moduleUncompleted', {
          detail: { type: 'MODULE_UNCOMPLETED', moduleId }
        }));
      }
    } else {
      // Complete the module
      if (isBackendAvailable()) {
        try {
          const response = await userStatsAPI.completeModule(moduleId);
          if (response.success) {
            const updated = [...completedModules, moduleId];
            setCompletedModules(updated);
            localStorage.setItem('completedModules', JSON.stringify(updated));
            setMessage('Module marked as completed! 🎉');
            setSeverity('success');
            
            // Trigger statistics refresh for Profile page
            window.dispatchEvent(new CustomEvent('moduleCompleted', {
              detail: { type: 'MODULE_COMPLETED', moduleId }
            }));
          } else {
            setMessage(response.message || 'Failed to complete module');
            setSeverity('error');
          }
        } catch (error) {
          // Mark backend as unavailable and fallback to localStorage
          localStorage.setItem('backendAvailable', 'false');
          const updated = [...completedModules, moduleId];
          setCompletedModules(updated);
          localStorage.setItem('completedModules', JSON.stringify(updated));
          setMessage('Module marked as completed! 🎉');
          setSeverity('success');
          
          // Trigger statistics refresh for Profile page
          window.dispatchEvent(new CustomEvent('moduleCompleted', {
            detail: { type: 'MODULE_COMPLETED', moduleId }
          }));
        }
      } else {
        // Use localStorage directly
        const updated = [...completedModules, moduleId];
        setCompletedModules(updated);
        localStorage.setItem('completedModules', JSON.stringify(updated));
        setMessage('Module marked as completed! 🎉');
        setSeverity('success');
        
        // Trigger statistics refresh for Profile page
        window.dispatchEvent(new CustomEvent('moduleCompleted', {
          detail: { type: 'MODULE_COMPLETED', moduleId }
        }));
      }
    }
  } finally {
    // Remove from saving set
    setSavingModules(prev => {
      const newSet = new Set(prev);
      newSet.delete(moduleId);
      return newSet;
    });
  }
};

  // Handle case where syllabus is null or undefined
  if (!syllabus) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No syllabus data available
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
      {Object.entries(syllabus).map(([sectionKey, sectionData]) => {
        // Handle case where sectionData is undefined or doesn't have expected structure
        if (!sectionData) {
          return null;
        }

        // Handle life-stages sub-modules (when filtered for specific life stage)
        if (sectionKey === 'students' || sectionKey === 'professionals' || 
            sectionKey === 'homemakers' || sectionKey === 'seniors') {
          // This is a filtered life-stage module, render it exactly like investments
          return (
            <Grid item xs={12} md={12} key={sectionKey}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                {/* Level Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1,
                  }}
                >
                  <Chip
                    label={`Level ${sectionData.level || 4}`}
                    size="small"
                    sx={{
                      bgcolor: levelColors[sectionData.level || 4],
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>

                <CardContent sx={{ pb: 2 }}>
                  {/* Section Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pr: 8 }}>
                    <Avatar
                      sx={{
                        bgcolor: levelColors[sectionData.level || 4],
                        mr: 2,
                      }}
                    >
                      {levelIcons[sectionData.level || 4]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {sectionData.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sectionData.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getProgressPercentage(sectionData)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getProgressPercentage(sectionData)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  {/* Modules - Display each submodule as a separate module like investments */}
                  {sectionData.submodules && sectionData.submodules.map((submodule) => (
                    <Accordion key={submodule.id} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <PlayArrow
                            sx={{
                              mr: 1,
                              color: 'success.main',
                              fontSize: 20,
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                            {submodule.title}
                          </Typography>
                          {submodule.duration && (
                            <Chip
                              label={submodule.duration}
                              size="small"
                              icon={<AccessTime sx={{ fontSize: 14 }} />}
                              variant="outlined"
                            />
                          )}
                          <Tooltip title={isModuleSaved(submodule.file, submodule.title, sectionData.title) ? "Remove from saved modules" : "Save to profile"}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveModule(sectionData, submodule);
                              }}
                              disabled={savingModules.has(submodule.file) ? true : false}
                              sx={{ ml: 1 }}
                            >
                              {savingModules.has(submodule.file) ? (
                                <BookmarkBorder sx={{ fontSize: 18 }} />
                              ) : isModuleSaved(submodule.file, submodule.title, sectionData.title) ? (
                                <Bookmark sx={{ fontSize: 18, color: 'primary.main' }} />
                              ) : (
                                <BookmarkBorder sx={{ fontSize: 18 }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={isModuleCompleted(submodule.file) ? "Mark as incomplete" : "Mark as complete"}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteModule(sectionData, submodule);
                            }}
                            disabled={savingModules.has(submodule.file)}
                            sx={{ ml: 1 }}
                          >
                            {isModuleCompleted(submodule.file) ? (
                              <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                            ) : (
                              <CheckCircleOutline sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 1,
                            px: 2,
                            borderRadius: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => handleModuleClick(sectionData, submodule)}
                        >
                          {isModuleCompleted(submodule.file) ? (
                            <CheckCircle
                              sx={{
                                mr: 1,
                                color: 'success.main',
                                fontSize: 16,
                              }}
                            />
                          ) : (
                            <CheckCircleOutline
                              sx={{
                                mr: 1,
                                color: 'action.disabled',
                                fontSize: 16,
                              }}
                            />
                          )}
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2">
                              Click to start learning about {submodule.title.toLowerCase()}
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                </CardContent>
              </Card>
            </Grid>
          );
        }

        // Handle regular syllabus sections
        return (
          <Grid item xs={12} md={12} key={sectionKey}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              {/* Level Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 1,
                }}
              >
                <Chip
                  label={`Level ${sectionData.level || 1}`}
                  size="small"
                  sx={{
                    bgcolor: levelColors[sectionData.level || 1],
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </Box>

              <CardContent sx={{ pb: 2 }}>
                {/* Section Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pr: 8 }}>
                  <Avatar
                    sx={{
                      bgcolor: levelColors[sectionData.level || 1],
                      mr: 2,
                    }}
                  >
                    {levelIcons[sectionData.level || 1]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {sectionData.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sectionData.description}
                    </Typography>
                  </Box>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getProgressPercentage(sectionData)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage(sectionData)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                {/* Modules Accordion */}
                {sectionData.modules && sectionData.modules.map((module) => (
                  <Accordion key={module.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <PlayArrow
                          sx={{
                            mr: 1,
                            color: 'success.main',
                            fontSize: 20,
                          }}
                        />
                        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                          {module.title}
                        </Typography>
                        {module.duration && (
                          <Chip
                            label={module.duration}
                            size="small"
                            icon={<AccessTime sx={{ fontSize: 14 }} />}
                            variant="outlined"
                          />
                        )}
                        <Tooltip title={module.submodules ? "Save individual submodules instead" : (isModuleSaved(module.id, module.title, sectionKey) ? "Already saved" : "Save to profile")}>
                          {module.submodules ? (
                            <span>
                              <IconButton
                                size="small"
                                disabled={true}
                                sx={{ ml: 1 }}
                              >
                                <BookmarkBorder sx={{ fontSize: 18, color: 'action.disabled' }} />
                              </IconButton>
                            </span>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!module.submodules) {
                                  handleSaveModule({ title: sectionKey, id: sectionKey }, module);
                                }
                              }}
                              disabled={savingModules.has(module.id)}
                              sx={{ ml: 1 }}
                            >
                              {savingModules.has(module.id) ? (
                                <BookmarkBorder sx={{ fontSize: 18 }} />
                              ) : isModuleSaved(module.id, module.title, sectionKey) ? (
                                <Bookmark sx={{ fontSize: 18, color: 'primary.main' }} />
                              ) : (
                                <BookmarkBorder sx={{ fontSize: 18 }} />
                              )}
                            </IconButton>
                          )}
                        </Tooltip>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {module.submodules ? (
                        <Box>
                          {module.submodules.map((submodule) => (
                            <Box
                              key={submodule.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                py: 1,
                                px: 2,
                                borderRadius: 1,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' },
                              }}
                              onClick={() => handleModuleClick(module, submodule)}
                            >
                              {isModuleCompleted(submodule.file) ? (
                                <CheckCircle
                                  sx={{
                                    mr: 1,
                                    color: 'success.main',
                                    fontSize: 16,
                                  }}
                                />
                              ) : (
                                <CheckCircleOutline
                                  sx={{
                                    mr: 1,
                                    color: 'action.disabled',
                                    fontSize: 16,
                                  }}
                                />
                              )}
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2">
                                  {submodule.title}
                                </Typography>
                              </Box>
                              {submodule.duration && (
                                <Chip
                                  label={submodule.duration}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              <Tooltip title={isModuleSaved(submodule.file, submodule.title, sectionKey) ? "Remove from saved modules" : "Save to profile"}>
                                {savingModules.has(submodule.file) ? (
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveModule({ title: sectionKey, id: sectionKey }, submodule);
                                      }}
                                      disabled={savingModules.has(submodule.file) ? true : false}
                                      sx={{ ml: 1 }}
                                    >
                                      {savingModules.has(submodule.file) ? (
                                        <BookmarkBorder sx={{ fontSize: 16 }} />
                                      ) : isModuleSaved(submodule.file, submodule.title, sectionKey) ? (
                                        <Bookmark sx={{ fontSize: 16, color: 'primary.main' }} />
                                      ) : (
                                        <BookmarkBorder sx={{ fontSize: 16 }} />
                                      )}
                                    </IconButton>
                                  </span>
                                ) : (
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveModule({ title: sectionKey, id: sectionKey }, submodule);
                                      }}
                                      disabled={savingModules.has(submodule.file) ? true : false}
                                      sx={{ ml: 1 }}
                                    >
                                      {savingModules.has(submodule.file) ? (
                                        <BookmarkBorder sx={{ fontSize: 16 }} />
                                      ) : isModuleSaved(submodule.file, submodule.title, sectionKey) ? (
                                        <Bookmark sx={{ fontSize: 16, color: 'primary.main' }} />
                                      ) : (
                                        <BookmarkBorder sx={{ fontSize: 16 }} />
                                      )}
                                    </IconButton>
                                  </span>
                                )}
                              </Tooltip>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 1,
                            px: 2,
                            borderRadius: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => handleModuleClick(module)}
                        >
                          {isModuleCompleted(module.file) ? (
                            <CheckCircle
                              sx={{
                                mr: 1,
                                color: 'success.main',
                                fontSize: 16,
                              }}
                            />
                          ) : (
                            <CheckCircleOutline
                              sx={{
                                mr: 1,
                                color: 'action.disabled',
                                fontSize: 16,
                              }}
                            />
                          )}
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2">
                              Click to start learning about {module.title.toLowerCase()}
                            </Typography>
                          </Box>
                          {module.duration && (
                            <Chip
                              label={module.duration}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}

              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>

      {/* Snackbar for save messages */}
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
    </>
  );
};

export default SyllabusGrid;
