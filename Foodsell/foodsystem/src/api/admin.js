// src/api/admin.js
import { getAuthToken } from './auth';

const API_BASE_URL = 'http://localhost:8080/admin';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
});

export const adminAPI = {
  // Tổng quan Dashboard
 getStats: async () => {
  const res = await fetch(`${API_BASE_URL}/dashboard`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Không thể tải dashboard');
  const json = await res.json();
  return {
    users: json.totalUsers ?? 0,
    orders: json.totalOrders ?? 0,
    products: json.totalProducts ?? 0,
    vouchers: json.totalVouchers ?? 0,
    revenue: json.totalRevenue ?? 0,
    activeProducts: json.activeProducts ?? 0,
  };
},


  // User Management
  getUsers: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Không thể tải danh sách người dùng';
        
        if (res.status === 401 || res.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập. Vui lòng đăng nhập lại với tài khoản Admin.';
        } else if (res.status === 404) {
          errorMessage = 'Endpoint không tồn tại. Vui lòng kiểm tra lại cấu hình.';
        } else {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
        }
        
        throw new Error(`${errorMessage} (Status: ${res.status})`);
      }
      
      const data = await res.json();
      
      // Kiểm tra nếu response là array
      if (!Array.isArray(data)) {
        console.warn('getUsers response is not an array:', data);
        // Nếu response có data property, thử lấy data
        if (data.data && Array.isArray(data.data)) {
          return data.data;
        }
        // Nếu không phải array, trả về empty array
        return [];
      }
      
      return data;
    } catch (err) {
      console.error('getUsers error:', err);
      throw err;
    }
  },

  // Order Management
  getOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể tải danh sách đơn hàng');
    return res.json();
  },

  // Order Assignment APIs
  assignOrderToSeller: async (orderId, sellerId) => {
    const res = await fetch(`http://localhost:8080/api/orders/assignment/${orderId}/assign-seller/${sellerId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Không thể phân phối đơn hàng cho seller');
    return res.json();
  },

  assignOrderToShipper: async (orderId, shipperId) => {
    const res = await fetch(`http://localhost:8080/api/orders/assignment/${orderId}/assign-shipper/${shipperId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Không thể phân phối đơn hàng cho shipper');
    return res.json();
  },

  getOrderHistory: async (orderId) => {
    const res = await fetch(`http://localhost:8080/api/orders/${orderId}/history`, { 
      headers: getHeaders() 
    });
    if (!res.ok) throw new Error('Không thể tải lịch sử đơn hàng');
    return res.json();
  },

  // Voucher Management
  getVouchers: async () => {
    const res = await fetch(`${API_BASE_URL}/vouchers`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể tải danh sách voucher');
    return res.json();
  },

  // Reports
  getReports: async () => {
    const res = await fetch(`${API_BASE_URL}/reports`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể tải báo cáo');
    return res.json();
  },
     // ===== Products =====
  getProducts: async () => {
    const res = await fetch(`${API_BASE_URL}/products`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
    const json = await res.json();
    const arr = Array.isArray(json) ? json : json?.data ?? [];
    return arr.map((p) => ({
      id: p.id ?? 0,
      name: p.name ?? 'N/A',
      price: p.price ?? 0,
      category: p.category ?? 'Chưa phân loại',
      status: p.status ?? 'active',
    }));
  },

};
