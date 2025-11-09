import axios from 'axios';
import { getErrorMessage } from '../utils/errorHandler';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crmflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('crmflow_token');
      localStorage.removeItem('crmflow_user');

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Get user-friendly error message
    const userMessage = getErrorMessage(error);

    // Create new error with friendly message but preserve original error
    const enhancedError = new Error(userMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.code = error.code;

    return Promise.reject(enhancedError);
  }
);

export default apiClient;
