import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Fade,
  Grow,
  Slide,
  useTheme,
} from '@mui/material';
import ChatInterface from '../components/Chat/ChatInterface';

const Chat = () => {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
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
          opacity: 0.05,
          background: `
            radial-gradient(circle at 20% 80%, ${theme.palette.primary.main} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${theme.palette.secondary.main} 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${theme.palette.info.main} 0%, transparent 50%)
          `,
          animation: 'pulse 6s ease-in-out infinite',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 3 }}>
        {/* Header Section */}
        <Fade in={loaded} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  letterSpacing: '-1px',
                  textShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                💬 AI Financial Assistant
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
                  mb: 3,
                }}
              >
                Get personalized answers to your financial questions. Our AI assistant helps you navigate 
                budgeting, investing, banking, and financial planning with confidence.
              </Typography>
            </Slide>

            <Grow in={loaded} timeout={1400}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  }}
                >
                  🤖 AI-Powered
                </Box>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  }}
                >
                  💰 Financial Expert
                </Box>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
                  }}
                >
                  ⚡ Instant Answers
                </Box>
              </Box>
            </Grow>
          </Box>
        </Fade>

        {/* Chat Interface Container */}
        <Grow in={loaded} timeout={1600}>
          <Paper
            sx={{
              height: '700px',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.info.main} 100%)`,
                zIndex: 1,
              },
            }}
          >
            <ChatInterface />
          </Paper>
        </Grow>
      </Container>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.1; }
        }
      `}</style>
    </Box>
  );
};

export default Chat;
