import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();

      if (token && currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const { user, token } = await authService.login(email, password);

      setUser(user);
      setIsAuthenticated(true);

      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  /**
   * Register new user
   */
  const register = async (email, password) => {
    try {
      const { user, token } = await authService.register(email, password);

      setUser(user);
      setIsAuthenticated(true);

      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return false;
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  /**
   * Refresh user data from backend
   */
  const refreshUser = async () => {
    try {
      const updatedUser = await authService.me();
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
