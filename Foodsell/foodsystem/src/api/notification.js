const API_BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  // Validate token - không gửi nếu token không hợp lệ
  if (token && (token.includes('Users.User@') || token.includes('com.example.demo') || token.startsWith('[object'))) {
    console.warn('🔑 Invalid token detected, removing...');
    localStorage.removeItem('authToken');
    return null;
  }
  return token;
};

const getHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Chỉ thêm Authorization header nếu có token hợp lệ
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const notificationAPI = {
  // ===== USER NOTIFICATIONS =====
  
  // Lấy tất cả notifications của user hiện tại
  getMyNotifications: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để xem thông báo');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/my-notifications`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (response.status === 401) {
        // Token không hợp lệ hoặc hết hạn
        localStorage.removeItem('authToken');
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể lấy notifications');
      }
      
      return response.json();
    } catch (error) {
      if (error.message.includes('Phiên đăng nhập')) {
        throw error;
      }
      throw new Error(error.message || 'Không thể lấy notifications');
    }
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
    const token = getAuthToken();
    if (!token) {
      // Trả về 0 nếu không có token thay vì throw error
      return { success: true, data: 0 };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        return { success: true, data: 0 };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể lấy số notifications chưa đọc');
      }
      
      return response.json();
    } catch (error) {
      // Trả về 0 thay vì throw error để không làm gián đoạn UI
      console.error('Error getting unread count:', error);
      return { success: true, data: 0 };
    }
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
    try {
      console.log('📤 Sending notification request:', notificationData);
      
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(notificationData)
      });
      
      console.log('📥 Notification response status:', response.status);
      
      const responseData = await response.json().catch(async (e) => {
        const text = await response.text();
        console.error('❌ Failed to parse response as JSON:', text);
        throw new Error(`Server error: ${response.status} - ${text}`);
      });
      
      console.log('📥 Notification response data:', responseData);
      
      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || 'Không thể tạo notification';
        console.error('❌ Notification creation failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Kiểm tra response format
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Không thể tạo notification';
        console.error('❌ Notification creation failed (success=false):', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Đảm bảo response có success = true hoặc có data
      if (responseData.success === true || responseData.data) {
        console.log('✅ Notification created successfully:', responseData);
        return responseData;
      }
      
      // Nếu response không có success field, giả sử thành công nếu có data
      if (responseData.id || responseData.userId) {
        console.log('✅ Notification created (implicit success):', responseData);
        return { success: true, data: responseData, ...responseData };
      }
      
      console.warn('⚠️ Unexpected response format:', responseData);
      return { success: true, data: responseData, ...responseData };
    } catch (error) {
      console.error('❌ Error in createNotification API:', error);
      throw error;
    }
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
