const API_BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('authToken');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

export const notificationAPI = {
  // ===== USER NOTIFICATIONS =====
  
  // Lấy tất cả notifications của user hiện tại
  getMyNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/my-notifications`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy notifications');
    }
    
    return response.json();
  },
  
  // Lấy notifications chưa đọc
  getUnreadNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy notifications chưa đọc');
    }
    
    return response.json();
  },
  
  // Đếm số notifications chưa đọc
  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy số notifications chưa đọc');
    }
    
    return response.json();
  },
  
  // Đánh dấu notification là đã đọc
  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể đánh dấu đã đọc');
    }
    
    return response.json();
  },
  
  // Đánh dấu tất cả notifications là đã đọc
  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể đánh dấu tất cả đã đọc');
    }
    
    return response.json();
  },
  
  // ===== ADMIN NOTIFICATIONS =====
  
  // Tạo notification mới (Admin only)
  createNotification: async (notificationData) => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(notificationData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo notification');
    }
    
    return response.json();
  },
  
  // Chỉnh sửa notification (Admin only)
  editNotification: async (notificationId, notificationData) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(notificationData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể chỉnh sửa notification');
    }
    
    return response.json();
  },
  
  // Xóa notification (Admin only)
  deleteNotification: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể xóa notification');
    }
    
    return response.json();
  },
  
  // Lấy lịch sử notifications (Admin only)
  getNotificationLog: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/admin/log`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy lịch sử notifications');
    }
    
    return response.json();
  },
  
  // ===== SYSTEM NOTIFICATIONS (Internal use) =====
  
  // Tạo order notification cho merchant
  createOrderNotification: async (merchantId, orderId, action = 'NEW') => {
    const response = await fetch(`${API_BASE_URL}/notifications/system/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchantId,
        orderId,
        action
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo order notification');
    }
    
    return response.json();
  },
  
  // Tạo customer message notification cho merchant
  createCustomerMessageNotification: async (merchantId, customerId, message) => {
    const response = await fetch(`${API_BASE_URL}/notifications/system/customer-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchantId,
        customerId,
        message
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo customer message notification');
    }
    
    return response.json();
  },
  
  // Tạo promotion notification cho customer
  createPromotionNotification: async (customerId, promotionTitle, shopId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/system/promotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerId,
        promotionTitle,
        shopId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo promotion notification');
    }
    
    return response.json();
  },
  
  // Tạo order status notification cho customer
  createOrderStatusNotification: async (customerId, orderId, status) => {
    const response = await fetch(`${API_BASE_URL}/notifications/system/order-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerId,
        orderId,
        status
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo order status notification');
    }
    
    return response.json();
  },
  
  // Tạo delivery assignment notification cho shipper
  createDeliveryAssignmentNotification: async (shipperId, orderId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/system/delivery-assignment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shipperId,
        orderId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo delivery assignment notification');
    }
    
    return response.json();
  },
  
  // Tạo delivery update notification cho shipper
  createDeliveryUpdateNotification: async (shipperId, orderId, update) => {
    const response = await fetch(`${API_BASE_URL}/notifications/system/delivery-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shipperId,
        orderId,
        update
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tạo delivery update notification');
    }
    
    return response.json();
  }
};
