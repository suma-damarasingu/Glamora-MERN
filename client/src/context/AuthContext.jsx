import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('glamora_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('glamora_token'));
  const [loading, setLoading] = useState(true);

  // Check current session on mount (only on initial load)
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('glamora_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('glamora_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Session restore failed:', error);
          if (error.response?.status === 401 || error.response?.status === 403) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('glamora_token');
            localStorage.removeItem('glamora_user');
          }
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Login: authenticate credentials with role & save JWT token
  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    if (res.data.success && res.data.token) {
      const { token: receivedToken, user: receivedUser } = res.data;
      // Synchronously commit to localStorage first before state update
      localStorage.setItem('glamora_token', receivedToken);
      localStorage.setItem('glamora_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      setLoading(false);
    }
    return res.data;
  };

  // Step 2 of Login: verify OTP & receive token (legacy fallback)
  const verifyLoginOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-login-otp', { email, otp });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('glamora_token', receivedToken);
      localStorage.setItem('glamora_user', JSON.stringify(receivedUser));
    }
    return res.data;
  };

  // Step 1 of Register: submit info & trigger OTP
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  };

  // Step 2 of Register: verify OTP & activate account
  const verifyRegisterOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('glamora_token', receivedToken);
      localStorage.setItem('glamora_user', JSON.stringify(receivedUser));
    }
    return res.data;
  };

  // Resend OTP
  const resendOtp = async (email, type = 'Verification') => {
    const res = await api.post('/auth/resend-otp', { email, type });
    return res.data;
  };

  // Forgot password request
  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  // Reset password verification
  const resetPassword = async (email, otp, newPassword) => {
    const res = await api.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  };

  // Update profile
  const updateProfile = async (formData) => {
    const res = await api.put('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('glamora_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  // Change password
  const changePassword = async (oldPassword, newPassword) => {
    const res = await api.put('/change-password', { oldPassword, newPassword });
    return res.data;
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('glamora_token');
    localStorage.removeItem('glamora_user');
    toast.success('Logged out successfully.');
  };

  const value = {
    user,
    token,
    loading,
    isLoading: loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    login,
    verifyLoginOtp,
    register,
    verifyRegisterOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
