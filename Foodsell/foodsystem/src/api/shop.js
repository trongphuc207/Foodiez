const API_BASE_URL = process.env.REACT_APP_ORDER_URL ? `${process.env.REACT_APP_ORDER_URL}/api` : 'http://localhost:8080/api';

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

export const shopAPI = {
  // Lấy tất cả shop
  getAllShops: async () => {
    const response = await fetch(`${API_BASE_URL}/shops`);
    if (!response.ok) {
      throw new Error('Failed to fetch shops');
    }
    return response.json();
  },

  // Lấy shop theo ID
  getShopById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shop');
    }
    return response.json();
  },

  // Lấy shop theo seller ID
  getShopBySellerId: async (sellerId) => {
    const response = await fetch(`${API_BASE_URL}/shops/seller/${sellerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shop by seller');
    }
    return response.json();
  },

  // Tìm kiếm shop
  searchShops: async (keyword) => {
    const response = await fetch(`${API_BASE_URL}/shops/search?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      throw new Error('Failed to search shops');
    }
    return response.json();
  },

  // Lấy shop theo rating
  getShopsByRating: async (minRating) => {
    const response = await fetch(`${API_BASE_URL}/shops/rating/${minRating}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shops by rating');
    }
    return response.json();
  },

  // Lấy shop được đánh giá cao
  getTopRatedShops: async () => {
    const response = await fetch(`${API_BASE_URL}/shops/top-rated`);
    if (!response.ok) {
      throw new Error('Failed to fetch top rated shops');
    }
    return response.json();
  },

  // Tạo shop mới
  createShop: async (shopData) => {
    const response = await fetch(`${API_BASE_URL}/shops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shopData),
    });
    if (!response.ok) {
      throw new Error('Failed to create shop');
    }
    return response.json();
  },

  // Cập nhật shop
  updateShop: async (id, shopData) => {
    console.log('📤 API: Updating shop', id, 'with data:', shopData);
    console.log('🔗 API endpoint:', `${API_BASE_URL}/shops/${id}`);
    
    // Filter out fields that shouldn't be updated
    const filteredData = {
      name: shopData.name,
      description: shopData.description,
      address: shopData.address,
      opening_hours: shopData.opening_hours
    };
    
    console.log('📤 API: Filtered data (excluding seller_id):', filteredData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/shops/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(filteredData),
      });
      
      console.log('📥 API: Shop update response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to update shop';
        try {
          const errorData = await response.json();
          console.error('❌ API: Shop update error:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('❌ API: Could not parse error response:', parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ API: Shop update success:', result);
      return result;
    } catch (error) {
      console.error('❌ API: Shop update network error:', error);
      throw error;
    }
  },

  // Cập nhật rating shop
  updateShopRating: async (id, rating) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}/rating?rating=${rating}`, {
      method: 'PUT',
    });
    if (!response.ok) {
      throw new Error('Failed to update shop rating');
    }
    return response.json();
  },

  // Xóa shop
  deleteShop: async (id) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete shop');
    }
    return response.json();
  },

  // Lấy thống kê shop
  getShopStats: async () => {
    const response = await fetch(`${API_BASE_URL}/shops/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch shop stats');
    }
    return response.json();
  }
};