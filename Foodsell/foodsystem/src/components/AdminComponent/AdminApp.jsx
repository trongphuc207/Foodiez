// src/api/admin.js
import { getAuthToken } from './auth';

const API_BASE_URL = process.env.REACT_APP_ADMIN_API || 'http://localhost:8080/admin';

const getHeaders = () => {
  const token = getAuthToken();
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

const normalizeDashboard = (raw) => {
  const dto = raw?.data ?? raw ?? {};
  return {
    users: dto.totalUsers ?? 0,
    orders: dto.totalOrders ?? 0,
    products: dto.totalProducts ?? 0,
    vouchers: dto.totalVouchers ?? 0,
    revenue: dto.totalRevenue ?? 0,
  };
};

export const adminAPI = {
  // ===== Dashboard =====
  getStats: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Không thể tải dashboard (${res.status})`);
    const json = await res.json();
    return normalizeDashboard(json);
  },

  // ===== Users =====
  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể tải danh sách người dùng');
    const data = await res.json();
    const arr = Array.isArray(data) ? data : data?.data ?? [];
    return arr.map((u) => ({
      id: u.id ?? u.userId ?? u.ID,
      name: u.name ?? u.full_name ?? u.username ?? 'N/A',
      email: u.email ?? 'N/A',
      role: u.role ?? 'customer',
      banned: u.banned ?? u.isBanned ?? u.is_banned ?? false,
      status: (u.banned || u.isBanned || u.is_banned) ? 'BANNED' : 'ACTIVE',
    }));
  },

  // ✅ Thêm 2 hàm này
  banUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Không thể ban người dùng');
    return res.json().catch(() => ({}));
  },

  unbanUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/unban`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Không thể unban người dùng');
    return res.json().catch(() => ({}));
  },

  // ===== Orders =====
  getOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể tải danh sách đơn hàng');
    return res.json();
  },

  // ===== Vouchers =====
  getVouchers: async () => {
    const res = await fetch(`${API_BASE_URL}/vouchers`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể tải danh sách voucher');
    return res.json();
  },

  // ===== Reports =====
  getReports: async () => {
    const res = await fetch(`${API_BASE_URL}/reports`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể tải báo cáo');
    const json = await res.json();
    return json?.data ?? json;
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
        stock: p.stock_quantity ?? 0,
        image: p.image_url ?? p.image ?? '',
    }));
  }
};
export default adminAPI;

