import apiClient from './apiClient';

export const authService = {
  /**
   * Register new user
   */
  async register(email, password) {
    const response = await apiClient.post('/auth/register', {
      email,
      password
    });

    if (response.data.success) {
      const { user, token } = response.data.data;

      // Store token and user
      localStorage.setItem('crmflow_token', token);
      localStorage.setItem('crmflow_user', JSON.stringify(user));

      return { user, token };
    }

    throw new Error('Registration failed');
  },

  /**
   * Login existing user
   */
  async login(email, password) {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });

    if (response.data.success) {
      const { user, token } = response.data.data;

      // Store token and user
      localStorage.setItem('crmflow_token', token);
      localStorage.setItem('crmflow_user', JSON.stringify(user));

      return { user, token };
    }

    throw new Error('Login failed');
  },

  /**
   * Logout current user
   */
  logout() {
    localStorage.removeItem('crmflow_token');
    localStorage.removeItem('crmflow_user');
    localStorage.removeItem('crmflow_api_keys'); // Clear old data
    localStorage.removeItem('crmflow_intelligence_hub'); // Clear old data
  },

  /**
   * Get current user from storage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('crmflow_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  /**
   * Get current token
   */
  getToken() {
    return localStorage.getItem('crmflow_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Get current user from backend
   */
  async me() {
    const response = await apiClient.get('/auth/me');

    if (response.data.success) {
      const { user } = response.data.data;

      // Update stored user
      localStorage.setItem('crmflow_user', JSON.stringify(user));

      return user;
    }

    throw new Error('Failed to get user');
  }
};
