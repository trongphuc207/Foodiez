const API_BASE_URL = process.env.REACT_APP_ORDER_URL ? `${process.env.REACT_APP_ORDER_URL}/api` : 'http://localhost:8080/api';

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
  // Use the shop ID endpoint from OrderController
  const res = await fetch(`${API_BASE_URL}/orders/shop/${shopId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => null);
      throw new Error(errText || 'Failed to fetch seller orders');
    }
    return res.json();
  },

  getOrderDetails: async (orderId) => {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/history`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch order details');
    return res.json();
  },

  // NOTE: creating orders should normally happen via the public orders API
  // when a buyer places an order. Sellers should operate on existing orders
  // (accept/forward), so the explicit createShippingOrder helper was removed.

  // Update basic order details (recipient info, phone, address) from seller side
  updateOrderDetails: async (orderId, data) => {
    // Map frontend field names to backend expected keys (only include provided values)
    const payload = {};
    if (data.recipientName != null && String(data.recipientName).trim() !== '') payload.recipientName = data.recipientName;
    if (data.recipientPhone != null && String(data.recipientPhone).trim() !== '') payload.recipientPhone = data.recipientPhone;
    // Backend expects addressText. Make address optional; only send if provided
    if (data.recipientAddress != null && String(data.recipientAddress).trim() !== '') payload.addressText = data.recipientAddress;
    if (data.assignmentStatus != null && String(data.assignmentStatus).trim() !== '') payload.assignmentStatus = data.assignmentStatus;
    // Debug log to verify payload
    console.debug('updateOrderDetails - payload:', payload);

  // Seller endpoint accepts PUT /api/seller/orders/{orderId}
  const res = await fetch(`${API_BASE_URL}/seller/orders/${orderId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to update order details');
    }
    return res.json();
  },

  updateOrderStatus: async (orderId, status) => {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to update order status');
    }
    return res.json();
  },

  // Chấp nhận đơn hàng (calls OrderAssignmentController)
  acceptOrder: async (orderId) => {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to accept order');
    }
    return res.json();
  }
,

  // Delete an order (seller/admin) - typically only for cancelled orders
  deleteOrder: async (orderId) => {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to delete order');
    }
    return res.json();
  }
,

  // Cancel an order from seller side: mark is_cancelled and optionally include a reason and timestamp
  cancelOrder: async (orderId, reason) => {
    const payload = { reason: reason || 'Cancelled by seller' };
    // Use seller force-cancel endpoint which expects POST /orders/{id}/cancel-by-seller
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel-by-seller`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to cancel order');
    }
    return res.json();
  }
};

export default shopOrdersAPI;
