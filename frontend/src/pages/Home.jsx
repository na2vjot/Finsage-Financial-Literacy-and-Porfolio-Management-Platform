import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Paper,
  Fade,
  Grow,
  Slide,
  Zoom,
  Container,
  Chip,
} from '@mui/material';
import {
  School,
  TrendingUp,
  AccountBalance,
  Chat,
  Lightbulb,
  People,
  Star,
  ArrowForward,
  AutoAwesome,
  RocketLaunch,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setLoaded(true);
  }, []);

  const features = [
    { icon: <School />, title: t('financialBasics'), description: t('financialBasicsDesc'), color: '#1976d2', gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', action: () => navigate('/learn/basics'), badge: t('beginner'), rating: 4.8 },
    { icon: <AccountBalance />, title: t('personalFinance'), description: t('personalFinanceDesc'), color: '#388e3c', gradient: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)', action: () => navigate('/learn/personal-finance'), badge: t('popular'), rating: 4.9 },
    { icon: <TrendingUp />, title: t('investments'), description: t('investmentsDesc'), color: '#f57c00', gradient: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)', action: () => navigate('/learn/investments'), badge: t('advanced'), rating: 4.7 },
    { icon: <Chat />, title: t('aiAssistant'), description: t('aiAssistantDesc'), color: '#d32f2f', gradient: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)', action: () => navigate('/chat'), badge: t('aiPowered'), rating: 4.9 },
  ];

  const stats = [
    { label: t('learningModules'), value: '50+', icon: <School />, color: '#1976d2', gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' },
    { label: t('expertTopics'), value: '100+', icon: <Lightbulb />, color: '#ffc107', gradient: 'linear-gradient(135deg, #ffc107 0%, #ffca28 100%)' },
    { label: t('activeLearners'), value: '1000+', icon: <People />, color: '#388e3c', gradient: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)' },
    { label: t('successRate'), value: '95%', icon: <TrendingUp />, color: '#f57c00', gradient: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)' },
  ];

  return (
    <Box sx={{ 
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `
            radial-gradient(circle at 20% 80%, #1976d2 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, #388e3c 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, #f57c00 0%, transparent 50%)
          `,
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Fade in={loaded} timeout={1000}>
          <Paper
            sx={{
              p: { xs: 3, md: 6 },
              mb: 6,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #64b5f6 100%)',
              color: 'white',
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(25, 118, 210, 0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Animated Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: 'float 6s ease-in-out infinite',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                animation: 'float 8s ease-in-out infinite reverse',
              }}
            />

            <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto', position: 'relative', zIndex: 1 }}>
              <Zoom in={loaded} timeout={1200}>
                <Avatar sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 3, 
                  bgcolor: 'white',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  animation: 'bounce 2s ease-in-out infinite',
                }}>
                  <School sx={{ fontSize: 50, color: '#1976d2' }} />
                </Avatar>
              </Zoom>
              
              <Slide direction="down" in={loaded} timeout={1400}>
                <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)', mb: 2 }}>
                  {t('welcomeTitle')}
                </Typography>
              </Slide>
              
              <Slide direction="up" in={loaded} timeout={1600}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 400, opacity: 0.95, mb: 3 }}>
                  {t('welcomeSubtitle')}
                </Typography>
              </Slide>
              
              <Fade in={loaded} timeout={1800}>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6, maxWidth: 600, mx: 'auto' }}>
                  {t('welcomeDesc')}
                </Typography>
              </Fade>
              
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Grow in={loaded} timeout={2000}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<RocketLaunch />}
                    onClick={() => navigate('/learn/basics')}
                    sx={{ 
                      bgcolor: 'white', 
                      color: '#1976d2', 
                      '&:hover': { 
                        bgcolor: '#f5f5f5',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                      },
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {t('startLearning')}
                  </Button>
                </Grow>
                
                <Grow in={loaded} timeout={2200}>
                  <Button
                    variant="outlined" size="large" endIcon={<AutoAwesome />} onClick={() => navigate('/chat')}
                    sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.15)', transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)' }, px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600, transition: 'all 0.3s ease' }}
                  >
                    {t('askAI')}
                  </Button>
                </Grow>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in={loaded} timeout={2400 + index * 100}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: stat.gradient,
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.05)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Avatar sx={{ 
                    mx: 'auto', 
                    mb: 2, 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    width: 60,
                    height: 60,
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h3" gutterBottom sx={{ 
                    fontWeight: 700,
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    opacity: 0.95,
                    fontWeight: 500,
                  }}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Features Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
              {t('explorePaths')}
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              {t('exploreDesc')}
            </Typography>
          </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in={loaded} timeout={3000 + index * 150}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: 3,
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    background: 'white',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.03)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: feature.gradient,
                      borderRadius: '3px 3px 0 0',
                    },
                  }}
                  onClick={feature.action}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 70,
                          height: 70,
                          mx: 'auto',
                          mb: 2,
                          background: feature.gradient,
                          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                          },
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Chip
                        label={feature.badge}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -5,
                          right: -5,
                          background: feature.gradient,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    </Box>
                    
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontWeight: 600,
                      color: '#333',
                      mb: 1,
                    }}>
                      {feature.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 2,
                      lineHeight: 1.5,
                    }}>
                      {feature.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          sx={{
                            fontSize: 16,
                            color: i < Math.floor(feature.rating) ? '#ffc107' : '#e0e0e0',
                            mr: 0.5,
                          }}
                        />
                      ))}
                      <Typography variant="body2" sx={{ ml: 1, color: '#666' }}>
                        {feature.rating}
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<ArrowForward />}
                      sx={{
                        background: feature.gradient,
                        color: 'white',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                        },
                      }}
                    >
                      {t('explore')}
                    </Button>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Quick Tips Section */}
        <Fade in={loaded} timeout={3600}>
          <Paper sx={{ 
            p: 4, 
            mt: 6, 
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <AutoAwesome sx={{ color: '#ffc107', fontSize: 32 }} />
                {t('quickTips')}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {t('quickTipsDesc')}
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Grow in={loaded} timeout={3800}>
                  <Box sx={{ p: 3, background: 'white', borderRadius: 2, textAlign: 'center', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)', transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' } }}>
                    <Typography variant="h6" sx={{ color: '#1976d2', mb: 2, fontWeight: 600 }}>{t('saveFristTitle')}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{t('saveFirstDesc')}</Typography>
                  </Box>
                </Grow>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grow in={loaded} timeout={4000}>
                  <Box sx={{ p: 3, background: 'white', borderRadius: 2, textAlign: 'center', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)', transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' } }}>
                    <Typography variant="h6" sx={{ color: '#388e3c', mb: 2, fontWeight: 600 }}>{t('trackExpTitle')}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{t('trackExpDesc')}</Typography>
                  </Box>
                </Grow>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grow in={loaded} timeout={4200}>
                  <Box sx={{ p: 3, background: 'white', borderRadius: 2, textAlign: 'center', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)', transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' } }}>
                    <Typography variant="h6" sx={{ color: '#f57c00', mb: 2, fontWeight: 600 }}>{t('setGoalsTitle')}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{t('setGoalsDesc')}</Typography>
                  </Box>
                </Grow>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      </Container>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </Box>
  );
};

export default Home;
