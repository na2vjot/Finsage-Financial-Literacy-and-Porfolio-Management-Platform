import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, IconButton, Tooltip } from '@mui/material';
import { MenuOpen } from '@mui/icons-material';
import { LanguageProvider } from './context/LanguageContext';

import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import LoginPage from './components/Auth/LoginPage';
import SignUpPage from './components/Auth/SignUpPage';
import ProfilePage from './components/Dashboard/ProfilePage';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Learn from './pages/Learn';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <LanguageProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          {/* Main App Routes */}
          <Route path="/*" element={
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <Box sx={{ display: 'flex', flex: 1 }}>
                <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
                
                {/* Floating Toggle Button */}
                {!sidebarOpen && (
                  <Box
                    sx={{
                      position: 'fixed',
                      top: 80,
                      left: 16,
                      zIndex: 1100,
                    }}
                  >
                    <Tooltip title="Open sidebar">
                      <IconButton
                        onClick={handleSidebarToggle}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          width: 48,
                          height: 48,
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                          boxShadow: 3,
                        }}
                      >
                        <MenuOpen />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8, // Header height
                    ml: sidebarOpen ? 24 : 0, // Dynamic margin based on sidebar state
                    transition: 'margin-left 0.3s ease', // Smooth transition
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/learn" element={<Learn />} />
                    <Route path="/learn/:section" element={<Learn />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Routes>
                </Box>
              </Box>
              <Footer />
            </Box>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
