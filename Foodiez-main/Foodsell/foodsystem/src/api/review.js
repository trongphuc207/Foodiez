const API_BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('authToken');
const getUserId = () => localStorage.getItem('userId') || '1'; // Default user ID for testing
const getUserName = () => localStorage.getItem('userName') || 'Test User'; // Default user name for testing

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'User-Id': getUserId(),
    'User-Name': getUserName(),
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const reviewAPI = {
  // Get all reviews
  getAllReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews`);
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    const result = await response.json();
    return result.data || result;
  },

  // Get reviews by product
  getReviewsByProduct: async (productId, { page = 0, size = 10 } = {}) => {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}?page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product reviews');
    }
    return response.json();
  },

  // Get reviews by current user
  getMyReviews: async ({ page = 0, size = 10 } = {}) => {
    const response = await fetch(`${API_BASE_URL}/reviews/my-reviews?page=${page}&size=${size}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch my reviews');
    }
    return response.json();
  },

  // Create a review
  createReview: async ({ productId, shopId, rating, comment, imageUrl, orderId }) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, shopId, rating, comment, imageUrl, orderId })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create review');
    }
    return response.json();
  },

  // Update a review
  updateReview: async (reviewId, { rating, comment, imageUrl }) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, comment, imageUrl })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update review');
    }
    return response.json();
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete review');
    }
    return response.json();
  },

  // Reply to a review (for merchants)
  replyToReview: async (reviewId, content) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to reply to review');
    }
    return response.json();
  },
};



