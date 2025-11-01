const API_BASE_URL = 'http://localhost:8080/api';

// Utility functions
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const shipperAPI = {
  // Lấy danh sách đơn hàng cần giao
  getOrders: async (status) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = status 
      ? `${API_BASE_URL}/shipper/orders?status=${status}`
      : `${API_BASE_URL}/shipper/orders`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get shipper orders');
    }
    
    return response.json();
  },

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: async (orderId, status, note) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        note
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update order status');
    }

    return response.json();
  },

  // Lấy dashboard thống kê shipper
  getDashboard: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get dashboard data');
    }

    return response.json();
  },

  // Lấy chi tiết đơn hàng
  getOrderDetail: async (orderId) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get shipper dashboard');
    }
    
    return response.json();
  },

  // Nhận đơn hàng để giao
  acceptOrder: async (orderId) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/orders/${orderId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to accept order');
    }
    
    return response.json();
  },

  // Cập nhật trạng thái giao hàng
  updateDeliveryStatus: async (orderId, status) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/orders/${orderId}/delivery-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update delivery status');
    }
    
    return response.json();
  },

  // Lấy thống kê thu nhập
  getEarningsStats: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/earnings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get earnings stats');
    }
    
    return response.json();
  },

  // Lấy lịch sử giao hàng
  getDeliveryHistory: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get delivery history');
    }
    
    return response.json();
  },

  // Lấy thông tin tuyến đường giao hàng
  getDeliveryRoutes: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/routes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get delivery routes');
    }
    
    return response.json();
  },

  // Tạo profile shipper
  createProfile: async (profileData) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create shipper profile');
    }
    
    return response.json();
  },

  // Lấy thông tin profile shipper
  getProfile: async (userId) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get shipper profile');
    }
    
    return response.json();
  },

  // Cập nhật trạng thái sẵn sàng
  updateAvailability: async (userId, isAvailable) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, isAvailable }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update availability');
    }
    
    return response.json();
  },

  // Lấy danh sách shipper có sẵn (Admin only)
  getAvailableShippers: async (area = null) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = area 
      ? `${API_BASE_URL}/shipper/available?area=${encodeURIComponent(area)}`
      : `${API_BASE_URL}/shipper/available`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get available shippers');
    }
    
    return response.json();
  },

  // Lấy thống kê tổng quan shipper (Admin only)
  getShipperStats: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/shipper/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get shipper stats');
    }
    
    return response.json();
  }
};
