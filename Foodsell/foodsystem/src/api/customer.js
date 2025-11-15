const API_BASE_URL = 'http://localhost:8080/api';

// Utility function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const customerAPI = {
  // Lấy danh sách đơn hàng của khách hàng (sử dụng endpoint authenticated trên server)
  getOrders: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Use server endpoint that derives current user from the auth token
    const response = await fetch(`${API_BASE_URL}/customer/my-orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get customer orders');
      } catch (e) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          throw new Error('Bạn không có quyền truy cập vào tài nguyên này.');
        } else {
          throw new Error(`Lỗi khi tải đơn hàng (HTTP ${response.status})`);
        }
      }
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  },

  // Lấy chi tiết đơn hàng
  getOrderDetails: async (orderId) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
  const response = await fetch(`${API_BASE_URL}/customer/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get order details');
    }
    
    return response.json();
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId, reason = 'Customer cancelled') => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
  const response = await fetch(`${API_BASE_URL}/customer/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
  body: JSON.stringify({ status: 'cancelled', reason }),
    });
    
    if (!response.ok) {
      // Try to read structured error returned by backend (e.g. { success:false, message, code })
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (e) {
        // ignore parse errors
      }
      const err = new Error((errorData && errorData.message) ? errorData.message : `Failed to cancel order (HTTP ${response.status})`);
      // attach code if present so callers can react programmatically
      if (errorData && errorData.code) err.code = errorData.code;
      throw err;
    }
    
    return response.json();
  },

  // Đánh giá đơn hàng
  reviewOrder: async (orderId, rating, comment, imageUrl = null) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
  const response = await fetch(`${API_BASE_URL}/customer/orders/${orderId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment, imageUrl }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit review');
    }
    
    return response.json();
  },

  // Lấy thông tin profile khách hàng
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
      throw new Error(errorData.message || 'Failed to get customer profile');
    }
    
    return response.json();
  },

  // Cập nhật thông tin profile khách hàng
  updateProfile: async (profileData) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/customer/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update customer profile');
    }
    
    return response.json();
  },

  // Lấy địa chỉ giao hàng
  getDeliveryAddresses: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/customer/delivery-addresses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get delivery addresses');
    }
    
    return response.json();
  },

  // Thêm địa chỉ giao hàng
  addDeliveryAddress: async (addressData) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/customer/delivery-addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add delivery address');
    }
    
    return response.json();
  }
};
