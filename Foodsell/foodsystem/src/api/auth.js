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
      throw new Error(errorData.message || 'Đăng ký thất bại');
    }
    
    const result = await response.json();
    // Backend trả về { success: true, data: user, token: "...", message: "..." }
    if (result.success && result.data && result.token) {
      return {
        success: true,
        data: result.data,
        token: result.token,
        message: result.message
      };
    }
    return result;
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
      throw new Error(errorData.message || 'Đăng nhập thất bại');
    }
    
    const result = await response.json();
    // Backend trả về { success: true, data: user, token: "...", message: "..." }
    if (result.success && result.data && result.token) {
      return {
        success: true,
        data: result.data,
        token: result.token,
        message: result.message
      };
    }
    return result;
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

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const token = getAuthToken();
    
    if (!token) {
      return { success: false, message: 'Bạn cần đăng nhập lại để thực hiện thao tác này.' };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: 'Mật khẩu đã được thay đổi thành công!' };
      } else {
        return { 
          success: false, 
          message: data.message || 'Có lỗi xảy ra khi đổi mật khẩu.'
        };
      }
    } catch (error) {
      console.error('Error changing password:', error);
      return { 
        success: false, 
        message: 'Có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau.'
      };
    }
  },

  // Validate reset token
  validateResetToken: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/validate-reset-token?token=${token}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to validate token');
    }
    
    return response.json();
  },

  // Avatar management
  uploadAvatar: async (file) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/auth/upload-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload avatar');
    }
    
    return response.json();
  },

  removeAvatar: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/remove-avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove avatar');
    }
    
    return response.json();
  },

  // OTP verification
  verifyOTP: async (otpData) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(otpData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'OTP verification failed');
    }
    
    const result = await response.json();
    // Backend trả về { success: true, data: user, token: "...", message: "..." }
    if (result.success && result.data && result.token) {
      return {
        success: true,
        data: result.data,
        token: result.token,
        message: result.message
      };
    }
    return result;
  },

  // Send OTP
  sendOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send OTP');
    }
    
    return response.json();
  },

};

// Utility functions
export const setAuthToken = (tokenOrResponse) => {
  // Normalize different possible inputs: string token, response object, or unexpected values
  try {
    if (!tokenOrResponse) {
      console.log('🔑 setAuthToken called with falsy value — removing token');
      localStorage.removeItem('authToken');
      return;
    }

    let token = tokenOrResponse;

    // If an object was passed (e.g., entire response), try to extract common fields
    if (typeof token === 'object') {
      if (token.token && typeof token.token === 'string') {
        token = token.token;
      } else if (token.data && token.data.token && typeof token.data.token === 'string') {
        token = token.data.token;
      } else if (token.accessToken && typeof token.accessToken === 'string') {
        token = token.accessToken;
      } else {
        // Last resort: convert to string but detect obvious Java object toString values
        const asString = String(token);
        if (asString.includes('Users.User@') || asString.startsWith('[object')) {
          console.error('🔑 Refusing to store invalid auth token (object looks like a User object):', token);
          return;
        }
        token = asString;
      }
    }

    if (typeof token !== 'string') {
      console.error('🔑 Invalid token type; expected string but got:', typeof token, token);
      return;
    }

    console.log('🔑 Setting auth token: Token provided (length:', token.length, ')');
    localStorage.setItem('authToken', token);
    console.log('🔑 Token saved to localStorage');
  } catch (err) {
    console.error('🔑 Error in setAuthToken:', err);
  }
};

export const getAuthToken = () => {
  let token = localStorage.getItem('authToken');
  // Detect obviously invalid token values (e.g., Java object toString from backend)
  if (token) {
    const lowered = token.toString();
    if (lowered.includes('Users.User@') || lowered.includes('com.example.demo') || lowered.startsWith('[object')) {
      console.warn('🔑 Detected invalid authToken in localStorage — removing it to force re-login:', token);
      localStorage.removeItem('authToken');
      token = null;
    }
  }
  console.log('🔑 Getting auth token:', token ? 'Token found' : 'No token');
  return token;
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
