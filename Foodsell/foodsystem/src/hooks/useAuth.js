import { useState, useEffect, useCallback } from 'react';
import { authAPI, getAuthToken, setAuthToken, removeAuthToken } from '../api/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = getAuthToken();
    console.log('🔍 useAuth: Checking token:', !!token);
    
    if (token) {
      console.log('🔍 useAuth: Token found, loading profile...');
      try {
        const response = await authAPI.getProfile();
        console.log('✅ useAuth: Profile loaded successfully:', response);
        // Backend trả về { success: true, data: user, message: "..." }
        setUser(response.data);
      } catch (error) {
        console.error('❌ useAuth: Error loading profile:', error);
        removeAuthToken();
        setUser(null);
      }
    } else {
      console.log('🔍 useAuth: No token found');
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Listen for auth success events
  useEffect(() => {
    const handleAuthSuccess = () => {
      console.log('🔔 useAuth: Received authSuccess event, refreshing profile...');
      loadProfile();
    };

    window.addEventListener('authSuccess', handleAuthSuccess);
    return () => window.removeEventListener('authSuccess', handleAuthSuccess);
  }, [loadProfile]);

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
    isAuthenticated: !!user,
    refreshProfile: loadProfile // Add function to refresh profile
  };
};
