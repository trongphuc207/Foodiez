const API_BASE_URL = 'http://localhost:8080/api';

export const authAPI = {
  // Đăng ký
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.details) {
        // Validation errors
        const errorMessages = Object.values(errorData.details).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(errorData.error || 'Đăng ký thất bại');
    }
    
    return response.json();
  },

  // Đăng nhập
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.details) {
        // Validation errors
        const errorMessages = Object.values(errorData.details).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(errorData.error || 'Đăng nhập thất bại');
    }
    
    return response.json();
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.details) {
        // Validation errors
        const errorMessages = Object.values(errorData.details).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(errorData.error || 'Gửi email thất bại');
    }
    
    return response.json();
  },

  // Profile management
  getProfile: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

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
    
    return response.json();
  },

  updateProfile: async (profileData) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

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
        // Validation errors
        const errorMessages = Object.values(errorData.details).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    return response.json();
  },

  // Reset password
  resetPassword: async (resetToken, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resetToken,
        newPassword
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reset password');
    }
    
    return response.json();
  },

  validateResetToken: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/validate-reset-token?token=${token}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to validate token');
    }
    
    return response.json();
  },

};

// Utility functions
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
