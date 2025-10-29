const API_BASE_URL = 'http://localhost:8080/api';

// Helper to read auth token from local storage (same pattern as other api files)
const getAuthToken = () => localStorage.getItem('authToken');

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const shopOrdersAPI = {
  // Get orders for seller. If shopId provided, return orders for that shop.
  getSellerOrders: async (shopId, status) => {
    const qs = [];
    if (shopId) qs.push(`shopId=${encodeURIComponent(shopId)}`);
    if (status && status !== 'all') qs.push(`status=${encodeURIComponent(status)}`);
    const query = qs.length ? `?${qs.join('&')}` : '';

    const res = await fetch(`${API_BASE_URL}/seller/orders${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => null);
      throw new Error(errText || 'Failed to fetch seller orders');
    }
    return res.json();
  },

  getOrderDetails: async (orderId) => {
    const res = await fetch(`${API_BASE_URL}/seller/orders/${orderId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch order details');
    return res.json();
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await fetch(`${API_BASE_URL}/seller/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to update order status');
    }
    return res.json();
  }
};

export default shopOrdersAPI;
