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
  FormControlLabel,
  Checkbox,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  School,
  Email,
  Lock,
  Person,
  ArrowForward,
  HowToReg,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { authAPI } from '../../services/authAPI';

const SignUpPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeToTerms' ? checked : value,
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call real registration API
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        // After successful registration, automatically log the user in
        const loginResponse = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });

        if (loginResponse.success) {
          // Store auth token and user data in localStorage
          localStorage.setItem('authToken', loginResponse.token);
          localStorage.setItem('user', JSON.stringify(loginResponse.user));
          
          // Redirect to home page
          navigate('/');
        } else {
          setError('Registration successful but login failed. Please try logging in manually.');
        }
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
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
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          bgcolor: 'rgba(255,255,255,0.95)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Logo and Title */}
          <Fade in={true} timeout={800}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Slide in={true} direction="down" timeout={600}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                  <School sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    FinSage
                  </Typography>
                </Box>
              </Slide>
              <Slide in={true} direction="up" timeout={700}>
                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Join FinSage Today! 🚀
                </Typography>
              </Slide>
              <Fade in={true} timeout={900}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  Create your account and start your financial literacy journey
                </Typography>
              </Fade>
            </Box>
          </Fade>

          {/* Error Alert */}
          <Slide in={!!error} direction="down">
            <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Slide>

          {/* Sign Up Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Zoom in={true} timeout={800} style={{ transitionDelay: '200ms' }}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
                autoFocus
                size="small"
                sx={{ 
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 20px rgba(25,118,210,0.3)',
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Zoom>
            
            <Zoom in={true} timeout={800} style={{ transitionDelay: '300ms' }}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                size="small"
                sx={{ 
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-1px)',
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
              />
            </Zoom>
            
            <Zoom in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                size="small"
                sx={{ 
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-1px)',
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
                        size="small"
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
              />
            </Zoom>

            <Zoom in={true} timeout={800} style={{ transitionDelay: '500ms' }}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
                size="small"
                sx={{ 
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-1px)',
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                        sx={{
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Zoom>

            <Fade in={true} timeout={800} style={{ transitionDelay: '600ms' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    color="primary"
                    size="small"
                    sx={{
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    I agree to the{' '}
                    <Link
                      to="#"
                      style={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="#"
                      style={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mb: 2 }}
              />
            </Fade>

            <Zoom in={true} timeout={800} style={{ transitionDelay: '700ms' }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="medium"
                disabled={loading}
                sx={{
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  mb: 2,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(25,118,210,0.4)',
                  },
                  '&:disabled': {
                    transform: 'none',
                    boxShadow: 'none',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <>
                    <PersonAddIcon sx={{ mr: 1 }} />
                    Create Account
                    <ArrowForward sx={{ ml: 1 }} />
                  </>
                )}
              </Button>
            </Zoom>

            <Fade in={true} timeout={1000}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  ALREADY HAVE AN ACCOUNT?
                </Typography>
              </Divider>
            </Fade>
          </Box>

          {/* Sign In Link */}
          <Fade in={true} timeout={1200}>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
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
                  Sign In
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

export default SignUpPage;
