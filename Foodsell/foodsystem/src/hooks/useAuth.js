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
    const onAuthSuccess = () => loadProfile();
    const onAuthLogout = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('authSuccess', onAuthSuccess);
    window.addEventListener('authLogout', onAuthLogout);
    return () => {
      window.removeEventListener('authSuccess', onAuthSuccess);
      window.removeEventListener('authLogout', onAuthLogout);
    };
  }, [loadProfile]);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    setAuthToken(response.token);
    window.dispatchEvent(new CustomEvent('authSuccess', { detail: response }));
    return response;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    setAuthToken(response.token);
    window.dispatchEvent(new CustomEvent('authSuccess', { detail: response }));
    return response;
  };

  const logout = () => {
    // XÓA SẠCH TẤT CẢ DẤU VẾT ĐĂNG NHẬP
    removeAuthToken();                  // xóa authToken (chuẩn)
    localStorage.removeItem('token');   // nếu trước đây dùng 'token'
    localStorage.removeItem('user');    // nếu trước đây lưu user
    sessionStorage.clear();

    setUser(null);
    // Phát sự kiện cho các component khác biết
    window.dispatchEvent(new Event('authLogout'));
  };

  const updateProfile = async (profileData) => {
    const response = await authAPI.updateProfile(profileData);
    setUser(response.data);
    return response;
  };

  const uploadAvatar = async (file) => {
    const response = await authAPI.uploadAvatar(file);
    setUser(response.data);
    return response;
  };

  const removeAvatar = async () => {
    const response = await authAPI.removeAvatar();
    setUser(response.data);
    return response;
  };

  const forgotPassword = async (email) => authAPI.forgotPassword(email);
  const resetPassword = async (payload) => authAPI.resetPassword(payload);
  const changePassword = async (payload) => authAPI.changePassword(payload);

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
    changePassword,
    isAuthenticated: !!user,
    refreshProfile: loadProfile,
  };
};
