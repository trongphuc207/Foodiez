const API_BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('authToken');

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const notificationAPI = {
  // ========== USER NOTIFICATIONS ==========
  
  // List notifications for current user
  getMyNotifications: async ({ page = 0, size = 10 } = {}) => {
    const response = await fetch(`${API_BASE_URL}/notifications/me?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return response.json();
  },

  // Get notifications by user ID
  getUserNotifications: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user notifications');
    }
    return response.json();
  },

  // Get notifications by user role
  getNotificationsByRole: async (userRole) => {
    const response = await fetch(`${API_BASE_URL}/notifications/role/${userRole}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notifications by role');
    }
    return response.json();
  },

  // Get notifications by user and type
  getNotificationsByUserAndType: async (userId, type) => {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/type/${type}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notifications by user and type');
    }
    return response.json();
  },

  // Get notifications by role and type
  getNotificationsByRoleAndType: async (userRole, type) => {
    const response = await fetch(`${API_BASE_URL}/notifications/role/${userRole}/type/${type}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notifications by role and type');
    }
    return response.json();
  },

  // ========== NOTIFICATION ACTIONS ==========

  // Mark one notification as read
  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    return response.json();
  },

  // Mark all as read for user
  markAllAsRead: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/mark-all-read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    return response.json();
  },

  // Mark all as read for role
  markAllAsReadByRole: async (userRole) => {
    const response = await fetch(`${API_BASE_URL}/notifications/role/${userRole}/mark-all-read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read for role');
    }
    return response.json();
  },

  // ========== ADMIN NOTIFICATION MANAGEMENT ==========

  // Create notification (Admin)
  createNotification: async (notification) => {
    const response = await fetch(`${API_BASE_URL}/notifications/admin/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(notification),
    });
    if (!response.ok) {
      throw new Error('Failed to create notification');
    }
    return response.json();
  },

  // Update notification (Admin)
  updateNotification: async (id, notification) => {
    const response = await fetch(`${API_BASE_URL}/notifications/admin/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(notification),
    });
    if (!response.ok) {
      throw new Error('Failed to update notification');
    }
    return response.json();
  },

  // Delete notification (Admin)
  deleteNotification: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/admin/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
    return response.json();
  },

  // Get notification log (Admin)
  getNotificationLog: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/admin/log`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notification log');
    }
    return response.json();
  },

  // ========== NOTIFICATION CREATION HELPERS ==========

  // Create order notification
  createOrderNotification: async (userId, userRole, orderStatus, orderId) => {
    const params = new URLSearchParams({
      userId: userId.toString(),
      userRole,
      orderStatus,
      orderId: orderId.toString()
    });
    const response = await fetch(`${API_BASE_URL}/notifications/order?${params}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to create order notification');
    }
    return response.json();
  },

  // Create promotion notification
  createPromotionNotification: async (userId, userRole, promotionTitle) => {
    const params = new URLSearchParams({
      userId: userId.toString(),
      userRole,
      promotionTitle
    });
    const response = await fetch(`${API_BASE_URL}/notifications/promotion?${params}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to create promotion notification');
    }
    return response.json();
  },

  // Create delivery notification
  createDeliveryNotification: async (userId, userRole, deliveryStatus, orderId) => {
    const params = new URLSearchParams({
      userId: userId.toString(),
      userRole,
      deliveryStatus,
      orderId: orderId.toString()
    });
    const response = await fetch(`${API_BASE_URL}/notifications/delivery?${params}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to create delivery notification');
    }
    return response.json();
  },

  // Create system notification
  createSystemNotification: async (userId, userRole, title, message) => {
    const params = new URLSearchParams({
      userId: userId.toString(),
      userRole,
      title,
      message
    });
    const response = await fetch(`${API_BASE_URL}/notifications/system?${params}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to create system notification');
    }
    return response.json();
  },

  // ========== UNREAD COUNTS ==========

  // Get unread count for user
  getUnreadCount: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/unread-count`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }
    return response.json();
  },

  // Get unread count for role
  getUnreadCountByRole: async (userRole) => {
    const response = await fetch(`${API_BASE_URL}/notifications/role/${userRole}/unread-count`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch unread count by role');
    }
    return response.json();
  },
};


