const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to get headers with auth
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
});

// Standalone upload function so callers can import directly
export const uploadReviewImage = async (file) => {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`${API_BASE_URL}/reviews/image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    body: form
  });
  const text = await response.text();
  const data = (()=>{ try{return JSON.parse(text)}catch{return {success:false,message:text}} })();
  if (!response.ok) throw new Error(data?.message || `${response.status} ${response.statusText}`);
  return data;
};

export const reviewAPI = {
  // ===== CUSTOMER API =====
  // Create review (switch endpoint if imageUrl provided)
  writeReview: async (productId, shopId, orderId, rating, content, imageUrl) => {
    const endpoint = imageUrl ? `${API_BASE_URL}/reviews/with-image` : `${API_BASE_URL}/reviews`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, shopId, orderId, rating, content, imageUrl })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(()=>({}));
      throw new Error(errorData.message || 'Không thể tạo đánh giá');
    }
    return response.json();
  },

  // Edit review
  editReview: async (reviewId, rating, content) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify({ rating, content })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(()=>({}));
      throw new Error(errorData.message || 'Không thể chỉnh sửa đánh giá');
    }
    return response.json();
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, { method: 'DELETE', headers: getHeaders() });
    if (!response.ok) {
      const errorData = await response.json().catch(()=>({}));
      throw new Error(errorData.message || 'Không thể xóa đánh giá');
    }
    return response.json();
  },

  // Customer's reviews
  getCustomerReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews/customer/my-reviews`, { method: 'GET', headers: getHeaders() });
    if (!response.ok) {
      const errorData = await response.json().catch(()=>({}));
      throw new Error(errorData.message || 'Không thể lấy danh sách đánh giá');
    }
    return response.json();
  },

  // ===== MERCHANT API =====
  getShopReviews: async (shopId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/shop/${shopId}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
      const errorData = await response.json().catch(()=>({}));
      throw new Error(errorData.message || 'Không thể lấy đánh giá shop');
    }
    return response.json();
  },

  replyToReview: async (reviewId, content) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ content }) });
    if (!response.ok) {
      const errorData = await response.json().catch(()=>({}));
      throw new Error(errorData.message || 'Không thể trả lời đánh giá');
    }
    return response.json();
  },

  // ===== ADMIN API (giữ chỗ – có thể mở rộng) =====
  hideReview: async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}/hide`, { method: 'PUT', headers: getHeaders() });
    if (!response.ok) {
      const errorData = await response.json().catch(()=>({}));
      throw new Error(errorData.message || 'Không thể ẩn đánh giá');
    }
    return response.json();
  },

  // ===== PUBLIC API =====
  getProductReviews: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
      const errorData = await response.json().catch(()=>({}));
      throw new Error(errorData.message || 'Không thể lấy đánh giá sản phẩm');
    }
    return response.json();
  },
  getProductReviewStats: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}/stats`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
      const errorData = await response.json().catch(()=>({}));
      throw new Error(errorData.message || 'Không thể lấy thống kê đánh giá');
    }
    return response.json();
  },
  getShopReviewStats: async (shopId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/shop/${shopId}/stats`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
      const errorData = await response.json().catch(()=>({}));
      throw new Error(errorData.message || 'Không thể lấy thống kê đánh giá shop');
    }
    return response.json();
  },
  getReviewReplies: async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/replies`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
      const errorData = await response.json().catch(()=>({}));
      throw new Error(errorData.message || 'Không thể lấy phản hồi đánh giá');
    }
    return response.json();
  },

  // Upload via object (alias)
  uploadImage: uploadReviewImage,

  // Test
  testConnection: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews/test`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) throw new Error('Không thể kết nối Review API');
    return response.text();
  }
};

