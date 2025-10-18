const API_BASE_URL = 'http://localhost:8080/api';

export const authAPI = {

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.details) {
  
        const errorMessages = Object.values(errorData.details).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(errorData.message || 'Đăng ký thất bại');
    }

    const result = await response.json(); // { success, data, token, message }
    return result;
  },

  
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });


    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.details) {
  
        const errorMessages = Object.values(errorData.details).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(errorData.message || 'Đăng nhập thất bại');
    }

    const result = await response.json(); // { success, data, token, message }
    return result;
  },

  
  getProfile: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get profile');
    }
    return response.json(); // { success, data, message }
  },

  updateProfile: async (profileData) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.details) {
        const errorMessages = Object.values(errorData.details).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(errorData.message || 'Cập nhật hồ sơ thất bại');
    }
    return response.json();
  },

  uploadAvatar: async (file) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) throw new Error('Tải ảnh thất bại');
    return response.json();
  },

  removeAvatar: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Xóa ảnh thất bại');
    return response.json();
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.details) {
        const errorMessages = Object.values(errorData.details).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(errorData.message || 'Gửi email khôi phục thất bại');
    }
    return response.json();
  },

  resetPassword: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Đặt lại mật khẩu thất bại');
    return response.json();
  },

  changePassword: async (payload) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Đổi mật khẩu thất bại');
    return response.json();
  },

  sendOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gửi OTP thất bại');
    }
    return response.json();
  },

  verifyOTP: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Xác thực OTP thất bại');
    }
    return response.json();
  },
};

// ==== TOKEN HELPERS (chỉ dùng MỘT key) ====
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};
export const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  console.log('🔑 getAuthToken:', token ? 'found' : 'none');
  return token;
};
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};
export const isAuthenticated = () => !!getAuthToken();
// =========================================  