import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Verify token
  verifyToken: async (token) => {
    try {
      const response = await api.post('/api/auth/verify', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Token verification failed' };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get profile' };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },
};

// User progress API calls
export const progressAPI = {
  // Get user progress
  getProgress: async () => {
    try {
      const response = await api.get('/api/user/progress');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get progress' };
    }
  },

  // Update user progress
  updateProgress: async (moduleData) => {
    try {
      const response = await api.post('/api/user/progress', moduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update progress' };
    }
  },
};

// Saved modules API calls
export const savedModulesAPI = {
  // Get saved modules
  getSavedModules: async () => {
    try {
      const response = await api.get('/api/user/saved-modules');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get saved modules' };
    }
  },

  // Save a module
  saveModule: async (moduleData) => {
    try {
      const response = await api.post('/api/user/saved-modules', moduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to save module' };
    }
  },
};

// Chat API (existing)
export const chatAPI = {
  sendMessage: async (message) => {
    try {
      const response = await api.post('/api/chat', { message });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send message' };
    }
  },
};

// Syllabus API (existing)
export const syllabusAPI = {
  getSyllabus: async () => {
    try {
      const response = await api.get('/api/syllabus');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get syllabus' };
    }
  },

  getContent: async (filePath) => {
    try {
      const response = await api.get(`/api/content/${filePath}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get content' };
    }
  },
};

// Health check API
export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Health check failed' };
    }
  },
};

// Chat History API
export const chatHistoryAPI = {
  // Save a chat message
  saveMessage: async (messageData) => {
    try {
      // Add user ID to message data if user is logged in
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        messageData.user_id = user.id;
      }
      const response = await api.post('/api/chat/save-message', messageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to save message' };
    }
  },

  // Get chat history (user-specific)
  getHistory: async (sessionId = null, limit = 50) => {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('session_id', sessionId);
      params.append('limit', limit.toString());
      
      // Add user ID if logged in
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        params.append('user_id', user.id);
      }
      
      const response = await api.get(`/api/chat/history?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get chat history' };
    }
  },

  // Get chat sessions (user-specific)
  getSessions: async (limit = 10) => {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      
      // Add user ID if logged in
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        params.append('user_id', user.id);
      }
      
      const response = await api.get(`/api/chat/sessions?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get chat sessions' };
    }
  },

  // Delete a chat session (user-specific)
  deleteSession: async (sessionId) => {
    try {
      // Add user ID if logged in
      const userData = localStorage.getItem('user');
      let url = `/api/chat/session/${sessionId}`;
      if (userData) {
        const user = JSON.parse(userData);
        url += `?user_id=${user.id}`;
      }
      
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete session' };
    }
  },

  // Clear all chat history
  clearHistory: async () => {
    try {
      const response = await api.delete('/api/chat/clear');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to clear chat history' };
    }
  },
};

// User Statistics API
export const userStatsAPI = {
  // Get user statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/api/user/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user statistics' };
    }
  },

  // Save a module
  saveModule: async (moduleData) => {
    try {
      const response = await api.post('/api/user/save-module', moduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to save module' };
    }
  },

  // Get saved modules
  getSavedModules: async () => {
    try {
      const response = await api.get('/api/user/saved-modules-list');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get saved modules' };
    }
  },

  // Update progress
  updateProgress: async (progressData) => {
    try {
      const response = await api.post('/api/user/update-progress', progressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update progress' };
    }
  },

  // Unsave module
  unsaveModule: async (moduleId) => {
    try {
      const response = await api.delete('/api/user/unsave-module', {
        data: { module_id: moduleId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to unsave module' };
    }
  },

  // Get completed modules
  getCompletedModules: async () => {
    try {
      const response = await api.get('/api/user/completed-modules');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch completed modules' };
    }
  },

  // Complete module
  completeModule: async (moduleId) => {
    try {
      const response = await api.post('/api/user/complete-module', {
        module_id: moduleId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to complete module' };
    }
  },

  // Uncomplete module
  uncompleteModule: async (moduleId) => {
    try {
      const response = await api.delete('/api/user/uncomplete-module', {
        data: { module_id: moduleId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to uncomplete module' };
    }
  },
};

export default api;
