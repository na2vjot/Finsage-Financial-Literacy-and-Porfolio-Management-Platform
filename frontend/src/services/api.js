import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to backend server. Please ensure the Python server is running on port 5000.');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw error;
  }
);

// API functions
export const chatAPI = {
  sendMessage: async (message) => {
    try {
      const response = await api.post('/chat', { message });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const syllabusAPI = {
  getSyllabus: async () => {
    try {
      const response = await api.get('/syllabus');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getContent: async (filePath) => {
    try {
      const response = await api.get(`/content/${filePath}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getAllModules: async () => {
    try {
      const response = await api.get('/modules');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const healthAPI = {
  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
