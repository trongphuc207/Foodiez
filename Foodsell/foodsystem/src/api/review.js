const API_BASE_URL = process.env.REACT_APP_ORDER_URL ? `${process.env.REACT_APP_ORDER_URL}/api` : 'http://localhost:8080/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get headers with auth
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
});

export const reviewAPI = {
  // ===== CUSTOMER API =====
  
  // UC46: Write Review - Customer viết review cho sản phẩm
  writeReview: async (productId, shopId, orderId, rating, content) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        productId,
        shopId,
        orderId,
        rating,
        content
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo đánh giá');
    }
    
    return response.json();
  },

  // UC48: Edit Review - Customer chỉnh sửa review
  editReview: async (reviewId, rating, content) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        rating,
        content
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể chỉnh sửa đánh giá');
    }
    
    return response.json();
  },

  // UC49: Delete Review - Customer xóa review
  deleteReview: async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể xóa đánh giá');
    }
    
    return response.json();
  },

  // Lấy review của customer hiện tại
  getCustomerReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews/customer/my-reviews`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy danh sách đánh giá');
    }
    
    return response.json();
  },

  // ===== MERCHANT API =====
  
  // UC50: View Customer Reviews - Public access để hiển thị reviews
  getShopReviews: async (shopId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/shop/${shopId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy đánh giá shop');
    }
    
    return response.json();
  },

  // UC51: Reply to Review - Merchant trả lời review
  replyToReview: async (reviewId, content) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        content
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể trả lời đánh giá');
    }
    
    return response.json();
  },

  // ===== ADMIN API =====
  
  // UC52: View All Reviews - Admin xem tất cả review
  getAllReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews/admin/all`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy tất cả đánh giá');
    }
    
    return response.json();
  },

  // UC53: Remove Inappropriate Review - Admin ẩn review
  hideReview: async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}/hide`, {
      method: 'PUT',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể ẩn đánh giá');
    }
    
    return response.json();
  },

  // UC54: Resolve Review Complaint - Admin xử lý khiếu nại
  resolveReviewComplaint: async (reviewId, resolution) => {
    const response = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}/resolve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        resolution
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể xử lý khiếu nại');
    }
    
    return response.json();
  },

  // ===== PUBLIC API =====
  
  // Lấy review của sản phẩm (public)
  getProductReviews: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy đánh giá sản phẩm');
    }
    
    return response.json();
  },

  // Lấy thống kê rating của sản phẩm (public)
  getProductReviewStats: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy thống kê đánh giá');
    }
    
    return response.json();
  },

  // Lấy thống kê rating của shop (public)
  getShopReviewStats: async (shopId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/shop/${shopId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy thống kê đánh giá shop');
    }
    
    return response.json();
  },

  // Lấy reply của review (public)
  getReviewReplies: async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/replies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy phản hồi đánh giá');
    }
    
    return response.json();
  },

  // Test endpoint
  testConnection: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Không thể kết nối đến Review API');
    }
    
    return response.text();
  }
};
