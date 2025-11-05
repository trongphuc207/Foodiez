// src/api/admin.js
import { getAuthToken } from './auth';

const API_BASE_URL = 'http://localhost:8080/api/admin';

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
    const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể tải danh sách người dùng');
    return res.json();
  },

  // Order Management
  getOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể tải danh sách đơn hàng');
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
