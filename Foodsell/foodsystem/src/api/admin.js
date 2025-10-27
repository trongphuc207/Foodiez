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

 // ...existing code...
  banUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
      method: 'POST',
      headers: { ...getHeaders(), Accept: 'application/json' },
      // một số API backend cần body even for POST:
      body: JSON.stringify({}),
    });
    if (res.ok) {
      try { return await res.json(); } catch { return {}; }
    }
    let bodyText;
    try {
      const txt = await res.text();
      try { bodyText = JSON.parse(txt); } catch { bodyText = txt; }
    } catch (e) {
      bodyText = 'Không đọc được body';
    }
    throw new Error(`Không thể ban người dùng (status ${res.status}): ${JSON.stringify(bodyText)}`);
  },

  unbanUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/unban`, {
      method: 'POST',
      headers: { ...getHeaders(), Accept: 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      try { return await res.json(); } catch { return {}; }
    }
    let bodyText;
    try {
      const txt = await res.text();
      try { bodyText = JSON.parse(txt); } catch { bodyText = txt; }
    } catch (e) {
      bodyText = 'Không đọc được body';
    }
    throw new Error(`Không thể unban người dùng (status ${res.status}): ${JSON.stringify(bodyText)}`);
  },
// ...existing code...

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
    }));
  },    
  // ===== PRODUCTS CRUD =====
  addProduct: async (product) => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Không thể thêm sản phẩm');
    return res.json();
  },

  updateProduct: async (id, product) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Không thể cập nhật sản phẩm');
    return res.json();
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Không thể xóa sản phẩm');
    return res.json();
  },


};
