import { useState, useEffect } from 'react';
import { authAPI, getAuthToken, setAuthToken, removeAuthToken } from '../api/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      authAPI.getProfile()
        .then(response => {
          // Backend trả về { success: true, data: user, message: "..." }
          setUser(response.data);
        })
        .catch((error) => {
          console.error('Error loading profile:', error);
          removeAuthToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      setAuthToken(response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      setAuthToken(response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const response = await authAPI.uploadAvatar(file);
      setUser(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const removeAvatar = async () => {
    try {
      const response = await authAPI.removeAvatar();
      setUser(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      const response = await authAPI.resetPassword(resetToken, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return { 
    user, 
    loading, 
    login, 
    register, 
    logout, 
    updateProfile,
    uploadAvatar,
    removeAvatar,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user 
  };
};
