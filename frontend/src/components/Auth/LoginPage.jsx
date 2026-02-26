import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  School,
  Email,
  Lock,
  ArrowForward,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { authAPI } from '../../services/authAPI';

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call real authentication API
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        // Store auth token and user data in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Dispatch custom event to notify syllabus components
        window.dispatchEvent(new CustomEvent('userLogin', {
          detail: { type: 'USER_LOGIN', user: response.user }
        }));
        
        // Redirect to home page
        navigate('/');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.secondary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.1)',
          top: -100,
          right: -100,
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.08)',
          bottom: -50,
          left: -50,
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.06)',
          top: '50%',
          left: '10%',
          animation: 'float 7s ease-in-out infinite 2s',
        }}
      />

      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          bgcolor: 'rgba(255,255,255,0.95)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo and Title */}
          <Fade in={true} timeout={800}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Slide in={true} direction="down" timeout={600}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <School sx={{ fontSize: 48, color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    FinSage
                  </Typography>
                </Box>
              </Slide>
              <Slide in={true} direction="up" timeout={700}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Welcome Back! 👋
                </Typography>
              </Slide>
              <Fade in={true} timeout={900}>
                <Typography variant="body2" color="text.secondary">
                  Sign in to access your financial learning journey
                </Typography>
              </Fade>
            </Box>
          </Fade>

          {/* Error Alert */}
          <Slide in={!!error} direction="down">
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Slide>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Zoom in={true} timeout={800} style={{ transitionDelay: '200ms' }}>
              <Box>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  autoFocus
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(25,118,210,0.3)',
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused('')}
                />
              </Box>
            </Zoom>
            
            <Zoom in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
              <Box>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(25,118,210,0.3)',
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused('')}
                />
              </Box>
            </Zoom>

            <Zoom in={true} timeout={800} style={{ transitionDelay: '600ms' }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.8,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  mb: 3,
                  borderRadius: 3,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(25,118,210,0.4)',
                  },
                  '&:disabled': {
                    transform: 'none',
                    boxShadow: 'none',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <>
                    <LoginIcon sx={{ mr: 1 }} />
                    Sign In
                    <ArrowForward sx={{ ml: 1 }} />
                  </>
                )}
              </Button>
            </Zoom>

            <Fade in={true} timeout={1000}>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
            </Fade>
          </Box>

          {/* Sign Up Link */}
          <Fade in={true} timeout={1200}>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: theme.palette.primary.dark,
                      textDecoration: 'underline',
                    }
                  }}
                >
                  Create Account
                </Link>
              </Typography>
            </Box>
          </Fade>
        </CardContent>
      </Card>

      {/* Add keyframe animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  );
};

export default LoginPage;
