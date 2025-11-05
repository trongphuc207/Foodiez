import { getAuthToken } from './auth';

const API_BASE_URL = 'http://localhost:8080/api/chat';

const parseResponse = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text ? { success: false, message: text } : {}; }
};

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await parseResponse(res);
  if (!res.ok) {
    const message = (data && data.message) || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return data;
};

export const chatAPI = {
  getConversations: async () => request(`${API_BASE_URL}/conversations/summaries`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  }),
  startWithMerchantByShop: async (shopId) => request(`${API_BASE_URL}/conversations/with-merchant-by-shop/${shopId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  }),
  startWithMerchantByOrder: async (orderId) => request(`${API_BASE_URL}/conversations/with-merchant-by-order/${orderId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  }),
  startWithCustomerByOrder: async (orderId) => request(`${API_BASE_URL}/conversations/with-customer-by-order/${orderId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  }),

  searchConversations: async (q) => request(`${API_BASE_URL}/conversations/search-summaries?q=${encodeURIComponent(q||'')}`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  }),

  getMessages: async (conversationId) => request(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  }),

  markConversationRead: async (conversationId) => request(`${API_BASE_URL}/conversations/${conversationId}/read`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  }),

  getOrCreateWith: async (otherUserId) => request(`${API_BASE_URL}/conversations/with/${otherUserId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  }),

  reportMessage: async (messageId, reason) => request(`${API_BASE_URL}/messages/${messageId}/report`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  }),

  uploadImage: async (conversationId, file) => {
    const form = new FormData();
    form.append('file', file);
    // Use the same request() helper so non-2xx throws and can be handled by callers
    return request(`${API_BASE_URL}/conversations/${conversationId}/image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
      body: form
    });
  },

  // Admin
  adminLogs: async (q) => request(`${API_BASE_URL}/admin/logs?q=${encodeURIComponent(q||'')}`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  }),
  adminDeleteConversation: async (id) => request(`${API_BASE_URL}/admin/conversations/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  })
}