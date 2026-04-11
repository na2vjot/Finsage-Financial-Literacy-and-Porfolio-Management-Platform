import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Container,
  Fade,
  Grow,
  Slide,
  useTheme,
  Chip,
  Grid,
  Card,
} from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  School, 
  AutoAwesome, 
  TrendingUp, 
  Schedule, 
  Psychology,
  Lightbulb,
  EmojiEvents,
  Refresh,
} from '@mui/icons-material';
import { syllabusAPI } from '../services/api';
import SyllabusGrid from '../components/Syllabus/SyllabusGrid';
import ContentViewer from '../components/Syllabus/ContentViewer';

const Learn = () => {
  const theme = useTheme();
  const { section } = useParams();
  const location = useLocation();
  const [syllabus, setSyllabus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    loadSyllabus();
    setLoaded(true);
    
    // Check if there's a selected module from Profile page
    if (location.state?.selectedModule) {
      const profileModule = location.state.selectedModule;
      // Convert Profile module format to ContentViewer format
      setSelectedModule({
        fileId: profileModule.module_id,
        moduleData: {
          title: profileModule.module_name,
          description: profileModule.description,
          section: profileModule.section,
          difficulty: profileModule.difficulty,
          duration: profileModule.estimated_time
        }
      });
    }
  }, [section, location.state]);

  const loadSyllabus = async () => {
    try {
      const data = await syllabusAPI.getSyllabus();
      setSyllabus(data);
    } catch (err) {
      setError('Failed to load syllabus. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getSectionTitle = () => {
    if (!section) return '📚 Financial Literacy Learning Path';
    
    const titles = {
      'basics': '📚 Financial Basics',
      'personal-finance': '💰 Personal Finance Fundamentals',
      'investments': '📈 Investment Instruments',
      'students': '👨‍🎓 For Students & Young Adults',
      'professionals': '💼 For Working Professionals',
      'homemakers': '🏠 For Homemakers/Housewives',
      'seniors': '👴 For Senior Citizens',
      'behavioral': '🧠 Behavioral & Psychological Aspects'
    };
    
    return titles[section] || '📚 Financial Literacy Learning Path';
  };

  const getSectionDescription = () => {
    if (!section) return 'Master financial concepts step by step. Start with basics and progress to advanced topics.';
    
    const descriptions = {
      'basics': 'Essential concepts for financial literacy beginners. Build your foundation with money management basics.',
      'personal-finance': 'Essential life skills for everyone. Master budgeting, banking, and debt management.',
      'investments': 'Beginner to Intermediate investment options. Learn to grow your wealth safely.',
      'students': 'Financial guidance for students and young adults. Start your financial journey right.',
      'professionals': 'Career-focused financial strategies. Optimize income, taxes, and investments.',
      'homemakers': 'Financial planning for household management. Budget, save, and build independence.',
      'seniors': 'Retirement and senior financial planning. Secure your golden years.',
      'behavioral': 'Understanding money psychology. Master your relationship with money.'
    };
    
    return descriptions[section] || 'Master financial concepts step by step.';
  };

  const getFilteredSyllabus = () => {
    if (!section || !syllabus) return syllabus;
    
    // Map URL sections to syllabus keys
    const sectionMap = {
      'basics': 'basics',
      'personal-finance': 'personal-finance',
      'investments': 'investments',
      'students': 'life-stages',
      'professionals': 'life-stages',
      'homemakers': 'life-stages',
      'seniors': 'life-stages',
      'behavioral': 'behavioral'
    };
    
    const syllabusKey = sectionMap[section];
    if (!syllabusKey || !syllabus[syllabusKey]) return syllabus;
    
    // For life-stages, show specific life stage with all its submodules displayed like investments
    if (syllabusKey === 'life-stages') {
      const lifeStageMap = {
        'students': 'students',
        'professionals': 'professionals',
        'homemakers': 'homemakers',
        'seniors': 'seniors'
      };
      
      const levelMapping = {
        'students': 4,
        'professionals': 5,
        'homemakers': 6,
        'seniors': 7
      };
      
      const lifeStageKey = lifeStageMap[section];
      if (lifeStageKey && syllabus[syllabusKey].modules) {
        const targetModule = syllabus[syllabusKey].modules.find(m => m.id === lifeStageKey);
        if (targetModule) {
          // Return life stage module but structure it like investments section
          return {
            [lifeStageKey]: {
              ...targetModule,
              level: levelMapping[lifeStageKey],
              description: syllabus[syllabusKey].description
            }
          };
        }
      }
    }
    
    // Update behavioral finance to level 8
    if (syllabusKey === 'behavioral') {
      return {
        [syllabusKey]: {
          ...syllabus[syllabusKey],
          level: 8
        }
      };
    }
    
    return { [syllabusKey]: syllabus[syllabusKey] };
  };

  const handleModuleSelect = (fileId, moduleData) => {
    setSelectedModule({ fileId, moduleData });
  };

  const handleBackToGrid = () => {
    setSelectedModule(null);
  };

  const handleNextModule = (fileId, moduleData) => {
    setSelectedModule({ fileId, moduleData });
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      }}>
        <Container maxWidth="md">
          <Fade in={true} timeout={800}>
            <Paper
              elevation={8}
              sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 3,
                background: theme.palette.background.paper,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              }}
            >
              <CircularProgress size={80} thickness={4} sx={{ mb: 3 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 2,
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: { xs: '1.8rem', md: '2.2rem' },
                }}
              >
                {getSectionTitle()}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  fontWeight: 500,
                }}
              >
                {t("loadingContent")}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip icon={<School />} label={t('expertContent')} sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, color: 'white', fontWeight: 600, px: 2, py: 1 }} />
                <Chip icon={<AutoAwesome />} label={t('interactiveLearning')} sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`, color: 'white', fontWeight: 600, px: 2, py: 1 }} />
                <Chip icon={<TrendingUp />} label={t('stepByStep')} sx={{ background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`, color: 'white', fontWeight: 600, px: 2, py: 1 }} />
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      }}>
        <Container maxWidth="md">
          <Fade in={true} timeout={800}>
            <Paper
              elevation={8}
              sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 3,
                background: theme.palette.background.paper,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 3,
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: { xs: '1.8rem', md: '2.2rem' },
                }}
              >
                {getSectionTitle()}
              </Typography>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                {error}
              </Alert>
              <Button
                variant="contained"
                onClick={loadSyllabus}
                startIcon={<Refresh />}
                size="large"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Retry Loading
              </Button>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  if (selectedModule) {
    return (
      <ContentViewer
        moduleId={selectedModule.fileId}
        moduleData={selectedModule.moduleData}
        onBack={handleBackToGrid}
        onNextModule={handleNextModule}
      />
    );
  }

  const filteredSyllabus = getFilteredSyllabus();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          background: `
            radial-gradient(circle at 20% 80%, ${theme.palette.primary.main} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${theme.palette.secondary.main} 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${theme.palette.info.main} 0%, transparent 50%)
          `,
          animation: 'pulse 6s ease-in-out infinite',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {/* Header Section */}
        <Fade in={loaded} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Slide direction="down" in={loaded} timeout={1000}>
              <Typography 
                variant="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  letterSpacing: '-1px',
                  textShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {getSectionTitle()}
              </Typography>
            </Slide>
            
            <Slide direction="up" in={loaded} timeout={1200}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  maxWidth: 800,
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  mb: 4,
                }}
              >
                {getSectionDescription()}
              </Typography>
            </Slide>

            <Grow in={loaded} timeout={1400}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
                <Chip
                  icon={<School />}
                  label={t("expertContent")}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 2,
                    py: 1,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  }}
                />
                <Chip
                  icon={<AutoAwesome />}
                  label={t("interactiveLearning")}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 2,
                    py: 1,
                    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                  }}
                />
                <Chip
                  icon={<TrendingUp />}
                  label={t("stepByStep")}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 2,
                    py: 1,
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  }}
                />
                <Chip
                  icon={<Psychology />}
                  label={t("practicalSkills")}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    px: 2,
                    py: 1,
                    boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
                  }}
                />
              </Box>
            </Grow>
          </Box>
        </Fade>

        {/* Syllabus Grid */}
        <Grow in={loaded} timeout={1600}>
          <Box sx={{ mb: 6 }}>
            <SyllabusGrid syllabus={filteredSyllabus} onModuleSelect={handleModuleSelect} />
          </Box>
        </Grow>

        {/* Overview Stats */}
        <Grow in={loaded} timeout={1800}>
          <Paper
            elevation={6}
            sx={{ 
              p: 4,
              borderRadius: 3,
              background: theme.palette.background.paper,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              border: `1px solid ${theme.palette.divider}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.info.main} 100%)`,
              },
            }}
          >
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                mb: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                letterSpacing: '-0.5px',
              }}
            >
              {t('yourLearningJourney')}
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                    },
                  }}
                >
                  <School sx={{ fontSize: 40, mb: 1 }} />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    {section ? '1' : '6'}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      opacity: 0.9,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    {section ? 'Focus Area' : 'Learning Levels'}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    color: 'white',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)',
                    },
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 40, mb: 1 }} />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    {section ? '5+' : '50+'}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      opacity: 0.9,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    Total Modules
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                    color: 'white',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(255, 152, 0, 0.3)',
                    },
                  }}
                >
                  <Schedule sx={{ fontSize: 40, mb: 1 }} />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    {section ? '2+' : '15+'}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      opacity: 0.9,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    Hours of Content
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                    color: 'white',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0, 188, 212, 0.3)',
                    },
                  }}
                >
                  <Lightbulb sx={{ fontSize: 40, mb: 1 }} />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    100%
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      opacity: 0.9,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    Practical Skills
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grow>
      </Container>

      {/* Add custom animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.1; }
        }
      `}</style>
    </Box>
  );
};

export default Learn;
