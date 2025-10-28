const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get headers with auth
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const sellerAPI = {
  // Dashboard Statistics
  getDashboardStats: async (shopId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/dashboard/${shopId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Dashboard stats error:', error);
      throw error;
    }
  },

  // Orders Management
  getOrders: async (shopId, status = null) => {
    try {
      const url = status 
        ? `${API_BASE_URL}/seller/orders/${shopId}?status=${status}`
        : `${API_BASE_URL}/seller/orders/${shopId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get orders error:', error);
      throw error;
    }
  },

  // Get order details
  getOrderById: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/orders/detail/${orderId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get order details error:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status, notes = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Update order status error:', error);
      throw error;
    }
  },

  // Revenue Statistics
  getRevenue: async (shopId, startDate = null, endDate = null) => {
    try {
      let url = `${API_BASE_URL}/seller/revenue/${shopId}`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch revenue');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get revenue error:', error);
      throw error;
    }
  },

  // Daily revenue
  getDailyRevenue: async (shopId, days = 7) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/revenue/${shopId}/daily?days=${days}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch daily revenue');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get daily revenue error:', error);
      throw error;
    }
  },

  // Monthly revenue
  getMonthlyRevenue: async (shopId, year = new Date().getFullYear()) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/revenue/${shopId}/monthly?year=${year}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch monthly revenue');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get monthly revenue error:', error);
      throw error;
    }
  },

  // Customers Management
  getCustomers: async (shopId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/customers/${shopId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get customers error:', error);
      throw error;
    }
  },

  // Top customers
  getTopCustomers: async (shopId, limit = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/customers/${shopId}/top?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch top customers');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get top customers error:', error);
      throw error;
    }
  },

  // Product Statistics
  getProductStats: async (shopId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/products/${shopId}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch product stats');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get product stats error:', error);
      throw error;
    }
  },

  // Best selling products
  getBestSellingProducts: async (shopId, limit = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/products/${shopId}/best-selling?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch best selling products');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get best selling products error:', error);
      throw error;
    }
  },

  // Reviews
  getReviews: async (shopId, type = 'all') => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/reviews/${shopId}?type=${type}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    } catch (error) {
      console.error('❌ Get reviews error:', error);
      throw error;
    }
  }
};

