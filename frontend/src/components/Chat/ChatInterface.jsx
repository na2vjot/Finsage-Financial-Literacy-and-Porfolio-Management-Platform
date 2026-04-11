import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Tooltip,
  useTheme,
  Fade,
  Slide,
  Chip,
  Container,
} from '@mui/material';
import { 
  Send, 
  SmartToy, 
  Person, 
  Save, 
  Delete, 
  Add,
  Edit,
  Lightbulb,
  ChatBubbleOutline,
  Psychology,
  AutoAwesome,
  Speed,
  TrendingUp,
  Lock,
} from '@mui/icons-material';
import { chatAPI, chatHistoryAPI } from '../../services/authAPI';
import { useLanguage } from '../../context/LanguageContext';

const ChatInterface = () => {
  const theme = useTheme();
  const { t, isHindi } = useLanguage();
  const getWelcomeMessage = () => ({
    id: 1,
    text: t('chatWelcome'),
    sender: 'bot',
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState([getWelcomeMessage()]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Chat history states (ChatGPT style)
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingChatName, setEditingChatName] = useState('');

  // Generate session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Check for logged in user and load chat history
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Generate or load session ID
      let currentSessionId = sessionStorage.getItem('currentSessionId');
      if (!currentSessionId) {
        currentSessionId = generateSessionId();
        sessionStorage.setItem('currentSessionId', currentSessionId);
      }
      setSessionId(currentSessionId);
      
      // Load chat history for this session
      loadChatHistory(currentSessionId);
    }
  }, []);

  const loadChatHistory = async (currentSessionId) => {
    try {
      const response = await chatHistoryAPI.getHistory(currentSessionId, 50);
      if (response.success && response.messages.length > 0) {
        // Convert database messages to component format
        const formattedMessages = response.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.message_type,
          timestamp: (() => {
            try {
              const date = new Date(msg.timestamp);
              return isNaN(date.getTime()) ? new Date() : date;
            } catch (error) {
              return new Date();
            }
          })(),
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load user-specific chat history:', error);
      // Don't show error to user, just continue with default message
      // This ensures users only see their own chat history
    }
  };

  const saveMessageToDatabase = async (messageText, messageType) => {
    if (!user || !sessionId) return;
    
    try {
      await chatHistoryAPI.saveMessage({
        message_type: messageType,
        content: messageText,
        session_id: sessionId,
        metadata: {
          timestamp: new Date().toISOString(),
          user_id: user.id, // Ensure user ID is included
        }
      });
    } catch (error) {
      console.error('Failed to save user-specific message:', error);
      // Don't show error to user, just continue
      // Message will still appear in UI but won't be saved to database
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from localStorage and backend on component mount
  useEffect(() => {
    const loadUserChatHistory = async () => {
      // Clear any existing chat history to prevent showing other users' data
      setChatHistory([]);
      
      // If user is logged in, load only their chat history from backend
      if (user) {
        try {
          const response = await chatHistoryAPI.getSessions(20);
          if (response.success && response.sessions.length > 0) {
            // Convert backend sessions to local format
            const backendHistory = response.sessions.map(session => ({
              id: session.session_id,
              name: session.title || `Chat ${(() => {
                try {
                  const date = new Date(session.created_at);
                  return isNaN(date.getTime()) ? new Date().toLocaleDateString() : date.toLocaleDateString();
                } catch (error) {
                  return new Date().toLocaleDateString();
                }
              })()}`,
              messages: [], // Messages will be loaded when needed
              timestamp: (() => {
                try {
                  const date = new Date(session.created_at);
                  return isNaN(date.getTime()) ? new Date() : date;
                } catch (error) {
                  return new Date();
                }
              })(),
              lastMessage: session.last_message || 'No messages',
              isFromBackend: true,
              userId: user.id // Track which user owns this chat
            }));
            
            // Set only the authenticated user's chat history
            setChatHistory(backendHistory);
            
            // Update localStorage with only this user's data
            localStorage.setItem(`chatHistory_${user.id}`, JSON.stringify(backendHistory));
          }
        } catch (error) {
          console.error('Failed to load user chat sessions from backend:', error);
          // If backend fails, try to load from user-specific localStorage
          const userSpecificHistory = JSON.parse(localStorage.getItem(`chatHistory_${user.id}`) || '[]');
          setChatHistory(userSpecificHistory);
        }
      } else {
        // If no user is logged in, clear all chat history
        setChatHistory([]);
        localStorage.removeItem('chatHistory'); // Remove any old non-user-specific data
      }
    };
    
    loadUserChatHistory();
  }, [user]);

  // Auto-save current chat when messages change
  useEffect(() => {
    if (currentChatId && messages.length > 1) { // More than just the initial greeting
      saveCurrentChatToHistory();
    }
  }, [messages]);

  const saveCurrentChatToHistory = () => {
    if (!currentChatId || !user) return; // Only save if user is authenticated

    const chatData = {
      id: currentChatId,
      name: getChatName(),
      messages: messages,
      timestamp: new Date(),
      lastMessage: messages[messages.length - 1]?.text || 'No messages',
      userId: user.id // Associate with current user
    };

    const updatedHistory = chatHistory.map(chat => 
      chat.id === currentChatId ? chatData : chat
    );

    setChatHistory(updatedHistory);
    // Save to user-specific localStorage key
    localStorage.setItem(`chatHistory_${user.id}`, JSON.stringify(updatedHistory));
  };

  const getChatName = () => {
    const firstUserMessage = messages.find(m => m.sender === 'user');
    if (firstUserMessage) {
      return firstUserMessage.text.substring(0, 30) + (firstUserMessage.text.length > 30 ? '...' : '');
    }
    return 'New Chat';
  };

  const startNewChat = () => {
    if (currentChatId && messages.length > 1) {
      saveCurrentChatToHistory();
    }
    setMessages([getWelcomeMessage()]);
    setCurrentChatId(null);
  };

  const createNewChatAndSave = () => {
    if (!user) return; // Only allow authenticated users to create chats
    
    const newChatId = Date.now();
    const chatData = {
      id: newChatId,
      name: getChatName(),
      messages: messages,
      timestamp: new Date(),
      lastMessage: messages[messages.length - 1]?.text || 'No messages',
      userId: user.id // Associate with current user
    };

    const updatedHistory = [chatData, ...chatHistory];
    setChatHistory(updatedHistory);
    // Save to user-specific localStorage key
    localStorage.setItem(`chatHistory_${user.id}`, JSON.stringify(updatedHistory));
    setCurrentChatId(newChatId);
  };

  const loadLocalChatHistory = async (chatId) => {
    // Save current chat if it exists and is different
    if (currentChatId && currentChatId !== chatId && messages.length > 1) {
      saveCurrentChatToHistory();
    }

    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      // If this is a backend session, load messages from database
      if (chat.isFromBackend && user) {
        try {
          const response = await chatHistoryAPI.getHistory(chatId, 50);
          if (response.success && response.messages.length > 0) {
            const formattedMessages = response.messages.map(msg => ({
              id: msg.id,
              text: msg.content,
              sender: msg.message_type,
              timestamp: (() => {
                try {
                  const date = new Date(msg.timestamp);
                  return isNaN(date.getTime()) ? new Date() : date;
                } catch (error) {
                  return new Date();
                }
              })(),
            }));
            setMessages(formattedMessages);
          } else {
            // If no messages in backend, load default message
            setMessages([{
              id: 1,
              text: "👋 Welcome to your Personal Financial Advisor!\n\nI'm here to help you navigate your financial journey with confidence. Ask me about:\n\n💰 Budgeting & Saving Strategies\n📈 Investment Opportunities & Portfolio Management\n🏦 Banking & Credit Management\n🎓 Financial Planning for Different Life Stages\n🧠 Behavioral Finance & Money Psychology\n\nWhat financial topic would you like to explore today?",
              sender: 'bot',
              timestamp: new Date(),
            }]);
          }
        } catch (error) {
          console.error('Failed to load chat messages from backend:', error);
          // Fallback to default message
          setMessages([{
            id: 1,
            text: "👋 Welcome to your Personal Financial Advisor!\n\nI'm here to help you navigate your financial journey with confidence. Ask me about:\n\n💰 Budgeting & Saving Strategies\n📈 Investment Opportunities & Portfolio Management\n🏦 Banking & Credit Management\n🎓 Financial Planning for Different Life Stages\n🧠 Behavioral Finance & Money Psychology\n\nWhat financial topic would you like to explore today?",
            sender: 'bot',
            timestamp: new Date(),
          }]);
        }
      } else {
        // Load from localStorage with date validation
        const validatedMessages = chat.messages.map(msg => ({
          ...msg,
          timestamp: (() => {
            try {
              const date = new Date(msg.timestamp);
              return isNaN(date.getTime()) ? new Date() : date;
            } catch (error) {
              return new Date();
            }
          })(),
        }));
        setMessages(validatedMessages);
      }
      setCurrentChatId(chatId);
    }
  };

  const deleteChatHistory = async (chatId) => {
    if (!user) return; // Only allow authenticated users to delete chats
    
    const chat = chatHistory.find(c => c.id === chatId);
    
    // Ensure user can only delete their own chats
    if (chat && chat.userId !== user.id) {
      console.error('User attempted to delete another user\'s chat');
      return;
    }
    
    // If this is a backend session, delete from backend first
    if (chat?.isFromBackend) {
      try {
        await chatHistoryAPI.deleteSession(chatId);
      } catch (error) {
        console.error('Failed to delete chat session from backend:', error);
        // Continue with local deletion even if backend fails
      }
    }
    
    // Remove from local state and user-specific localStorage
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    localStorage.setItem(`chatHistory_${user.id}`, JSON.stringify(updatedHistory));
    
    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  const startEditingChatName = (chatId, currentName) => {
    setEditingChatId(chatId);
    setEditingChatName(currentName);
  };

  const saveChatName = () => {
    if (!editingChatName.trim() || !user) return;
    
    const chat = chatHistory.find(c => c.id === editingChatId);
    
    // Ensure user can only edit their own chats
    if (chat && chat.userId !== user.id) {
      console.error('User attempted to edit another user\'s chat');
      return;
    }

    const updatedHistory = chatHistory.map(chat => 
      chat.id === editingChatId ? { ...chat, name: editingChatName } : chat
    );

    setChatHistory(updatedHistory);
    // Save to user-specific localStorage key
    localStorage.setItem(`chatHistory_${user.id}`, JSON.stringify(updatedHistory));
    setEditingChatId(null);
    setEditingChatName('');
  };

  const cancelEditingChatName = () => {
    setEditingChatId(null);
    setEditingChatName('');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) {
      if (!user) setError(t('loginToSend'));
      return;
    }

    if (!currentChatId && messages.length === 1) {
      createNewChatAndSave();
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessageToDatabase(inputMessage, 'user');
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      // If Hindi mode is ON, wrap the user message with a Hindi instruction
      // so the AI always responds in Hindi regardless of how the user typed
      const messageToSend = isHindi
        ? `तुम एक हिंदी वित्तीय सलाहकार हो। उपयोगकर्ता ने हिंगलिश (अंग्रेजी अक्षरों में हिंदी) में लिखा है। उनका संदेश समझो और पूरा जवाब केवल हिंदी में दो। उपयोगकर्ता का संदेश: "${inputMessage}"`
        : inputMessage;

      const response = await chatAPI.sendMessage(messageToSend);

      const botMessage = {
        id: Date.now() + 1,
        text: response.answer,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      await saveMessageToDatabase(response.answer, 'bot');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      bgcolor: theme.palette.background.default,
      overflow: 'hidden',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    }}>
      {/* Sidebar - Chat History */}
      <Box
        sx={{
          width: { xs: 0, sm: 280 },
          borderRight: `1px solid ${theme.palette.divider}`,
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          bgcolor: theme.palette.background.paper,
          boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ChatBubbleOutline sx={{ mr: 2, fontSize: 24 }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              fontSize: '1.1rem',
              letterSpacing: '-0.5px',
            }}>
              {t("conversationHistory")}
            </Typography>
          </Box>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Add />}
            onClick={startNewChat}
            sx={{ 
              textTransform: 'none',
              py: 1.5,
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)',
                border: '1px solid rgba(255,255,255,0.3)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            New Chat
          </Button>
        </Box>

        {/* Chat History List */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {!user ? (
            <Fade in={true}>
              <Box sx={{ textAlign: 'center', mt: 8, px: 3 }}>
                <Lock sx={{ fontSize: 56, color: 'text.secondary', mb: 3, opacity: 0.6 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 600 }}>
                  {t("pleaseLogIn")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                  You need to be logged in to access<br/>
                  your personal chat history.
                </Typography>
              </Box>
            </Fade>
          ) : chatHistory.length === 0 ? (
            <Fade in={true}>
              <Box sx={{ textAlign: 'center', mt: 8, px: 3 }}>
                <Psychology sx={{ fontSize: 56, color: 'text.secondary', mb: 3, opacity: 0.6 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 600 }}>
                  Welcome, {user.name || user.email}!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Your conversations will appear here.<br/>
                  Begin by asking any financial question!
                </Typography>
              </Box>
            </Fade>
          ) : (
            <List dense sx={{ py: 1 }}>
              {chatHistory.map((chat, index) => (
                <Slide in={true} direction="right" timeout={300 + index * 50} key={chat.id}>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      selected={currentChatId === chat.id}
                      onClick={() => loadLocalChatHistory(chat.id)}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        px: 2,
                        transition: 'all 0.3s ease',
                        minHeight: 'auto',
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          '& .MuiListItemText-primary': {
                            fontWeight: 700,
                            fontSize: '0.95rem',
                          },
                          '& .MuiListItemText-secondary': {
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.85rem',
                          },
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        },
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateX(4px)',
                        }
                      }}
                    >
                      {editingChatId === chat.id ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={editingChatName}
                            onChange={(e) => setEditingChatName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveChatName();
                              if (e.key === 'Escape') cancelEditingChatName();
                            }}
                            autoFocus
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'rgba(255,255,255,0.1)',
                                fontSize: '0.9rem',
                              }
                            }}
                          />
                          <IconButton size="small" onClick={saveChatName} sx={{ color: 'inherit' }}>
                            <Save fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={cancelEditingChatName} sx={{ color: 'inherit' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: currentChatId === chat.id ? 700 : 600,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.95rem',
                                }}
                              >
                                {chat.name}
                              </Typography>
                            }
                            secondary={
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap',
                                  display: 'block',
                                  opacity: currentChatId === chat.id ? 0.8 : 0.6,
                                  fontSize: '0.8rem',
                                }}
                              >
                                {chat.lastMessage}
                              </Typography>
                            }
                          />
                          <Box sx={{ display: 'flex', opacity: currentChatId === chat.id ? 1 : 0.6, transition: 'opacity 0.2s' }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingChatName(chat.id, chat.name);
                                }}
                                sx={{ color: 'inherit', padding: 0.5 }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChatHistory(chat.id);
                                }}
                                sx={{ color: 'inherit', padding: 0.5 }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>
                </Slide>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Mobile Sidebar Toggle */}
      <Box sx={{ 
        display: { xs: 'flex', sm: 'none' },
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={startNewChat}
          sx={{ textTransform: 'none', fontSize: '0.9rem', fontWeight: 600 }}
        >
          New Chat
        </Button>
      </Box>

      {/* Main Chat Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Header */}
        <Paper 
          elevation={3}
          sx={{ 
            p: { xs: 2, sm: 3 },
            bgcolor: 'primary.main', 
            color: 'white',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 48,
              height: 48,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}>
              <SmartToy sx={{ fontSize: 28 }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 800, 
                mb: 0.5, 
                fontSize: '1.4rem', 
                letterSpacing: '-0.5px',
              }}>
                {t("aiFinancialAdvisor")}
              </Typography>
              <Typography variant="body2" sx={{ 
                opacity: 0.95, 
                fontSize: '0.95rem', 
                lineHeight: 1.4,
                fontWeight: 500,
              }}>
                {t("aiAdvisorSubtitle")}
              </Typography>
            </Box>
            <Chip 
              label="Online" 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(76, 175, 80, 0.2)', 
                color: 'white',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                fontWeight: 600,
                fontSize: '0.8rem',
                px: 1,
              }} 
            />
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Slide in={!!error} direction="down">
            <Alert 
              severity="error" 
              sx={{ m: 2, borderRadius: 2, fontSize: '0.9rem', fontWeight: 500 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Slide>
        )}

        {/* Messages Container */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            overflow: 'auto',
            bgcolor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messages.map((message, index) => (
            <Fade in={true} timeout={300 + index * 100} key={message.id}>
              <Box
                sx={{
                  display: 'flex',
                  mb: 2,
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'slideUp 0.3s ease-out',
                }}
              >
                {message.sender === 'bot' && (
                  <Avatar sx={{ 
                    mr: 2,
                    bgcolor: 'secondary.main',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                    width: 40,
                    height: 40,
                  }}>
                    <SmartToy sx={{ fontSize: 22 }} />
                  </Avatar>
                )}
                
                <Box sx={{ 
                  maxWidth: { xs: '85%', sm: '70%' },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2.5,
                      bgcolor: message.sender === 'user' ? 'primary.main' : theme.palette.background.paper,
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: message.sender === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      border: message.sender === 'bot' ? `1px solid ${theme.palette.divider}` : 'none',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        lineHeight: 1.7, 
                        fontSize: '0.95rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontWeight: message.sender === 'user' ? 500 : 400,
                      }}
                    >
                      {message.text}
                    </Typography>
                  </Paper>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>

                {message.sender === 'user' && (
                  <Avatar sx={{ 
                    ml: 2,
                    bgcolor: 'primary.main',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                    width: 40,
                    height: 40,
                  }}>
                    <Person sx={{ fontSize: 22 }} />
                  </Avatar>
                )}
              </Box>
            </Fade>
          ))}
          
          {isLoading && (
            <Fade in={true}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  mr: 2,
                  bgcolor: 'secondary.main',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                  width: 40,
                  height: 40,
                }}>
                  <SmartToy sx={{ fontSize: 22 }} />
                </Avatar>
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 2.5,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: '20px 20px 20px 6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircularProgress size={18} thickness={4} />
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                      {t("thinking")}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Fade>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Paper 
          elevation={4}
          sx={{ 
            p: { xs: 2, sm: 3 },
            m: { xs: 2, sm: 3 },
            borderRadius: 2.5,
            background: theme.palette.background.paper,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              variant="outlined"
              placeholder={t('chatPlaceholder')}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.95rem',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              sx={{ 
                minWidth: { xs: 90, sm: 110 },
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                },
                '&:disabled': {
                  transform: 'none',
                  boxShadow: 'none',
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={22} thickness={3} />
              ) : (
                <Send sx={{ fontSize: 20 }} />
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatInterface;
