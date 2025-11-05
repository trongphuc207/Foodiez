// src/api/admin.js
import { getAuthToken } from './auth';

const API_BASE_URL = process.env.REACT_APP_ADMIN_API || 'http://localhost:8080/admin';
// Derive general API base (for fallback to /api/* if /admin/* not available)
let ORIGIN;
try { ORIGIN = new URL(API_BASE_URL).origin; } catch { ORIGIN = 'http://localhost:8080'; }
const API_BASE_URL_API = process.env.REACT_APP_API_BASE || `${ORIGIN}/api`;

const getHeaders = () => {
  const token = getAuthToken();
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

const normalizeDashboard = (raw) => {
  const dto = raw?.data ?? raw ?? {};
  return {
    users: Number(dto.totalUsers ?? 0),
    orders: Number(dto.totalOrders ?? 0),
    products: Number(dto.totalProducts ?? 0),
    vouchers: Number(dto.totalVouchers ?? 0),
    revenue: Number(dto.totalRevenue ?? dto.monthlyRevenue ?? 0),
    totalStock: Number(dto.totalStock ?? dto.sumProductStock ?? 0),
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
  // ===== CATEGORIES =====
  getCategories: async () => {
    const url = `${API_BASE_URL_API}/categories`;
    try {
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : json?.data ?? [];
      const base = arr.map(c => ({ id: c.id ?? c.ID ?? null, name: c.name ?? c.Name ?? '' })).filter(c => c.name);
      const missing = base.filter(c => !c.id && c.name);
      if (missing.length === 0) return base.filter(c => c.id);
      // Try to resolve ids by name endpoint
      const pairs = await Promise.all(missing.map(async (c) => {
        try {
          const r = await fetch(`${API_BASE_URL_API}/categories/name/${encodeURIComponent(c.name)}`, { headers: getHeaders() });
          if (!r.ok) return [c.name, null];
          const j = await r.json();
          const dto = j?.data ?? j;
          return [c.name, dto?.id ?? dto?.ID ?? null];
        } catch { return [c.name, null]; }
      }));
      const nameToId = Object.fromEntries(pairs);
      return base.map(c => ({ id: c.id ?? nameToId[c.name] ?? null, name: c.name })).filter(c => c.id);
    } catch (e) {
      // Fallback: return empty -> UI can show manual input
      return [];
    }
  },
  
  // ===== ORDERS CRUD =====
  addOrder: async (order) => {
    // Backend expects: { deliveryInfo, paymentInfo, cartItems, payosOrderCode, totalAmount, status }
    const payload = {
      deliveryInfo: {
        recipientName: order.recipientName || order.customerName || '',
        recipientPhone: order.recipientPhone || '',
        addressText: order.addressText || '',
      },
      paymentInfo: order.paymentInfo || null,
      cartItems: Array.isArray(order.cartItems) ? order.cartItems : [],
      payosOrderCode: order.payosOrderCode ?? null,
      totalAmount: Number(order.totalAmount ?? order.total ?? 0),
      status: order.status || 'pending',
    };
    const urls = [
      { url: `${API_BASE_URL}/orders`, method: 'POST' },
      { url: `${API_BASE_URL_API}/orders`, method: 'POST' },
    ];
    let lastErr;
    for (const u of urls) {
      try {
        const res = await fetch(u.url, { method: u.method, headers: getHeaders(), body: JSON.stringify(payload) });
        if (res.ok) return res.json();
        lastErr = new Error(`${u.method} ${u.url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể tạo đơn hàng');
  },

  getOrderById: async (id) => {
    const urls = [
      `${API_BASE_URL}/orders/${id}`,
      `${API_BASE_URL_API}/orders/${id}`,
    ];
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) { lastErr = new Error(`GET ${url} -> ${res.status}`); continue; }
        const o = await res.json();
        const dto = o?.data ?? o;
        return {
          id: dto.id ?? dto.orderId ?? dto.ID,
          customerName: dto.recipientName ?? dto.customerName ?? dto.customer_name ?? 'N/A',
          recipientPhone: dto.recipientPhone ?? '',
          addressText: dto.addressText ?? '',
          total: Number(dto.totalAmount ?? dto.total_amount ?? dto.total ?? 0),
          status: dto.status ?? 'UNKNOWN',
          createdAt: dto.createdAt ?? dto.created_at ?? null,
          items: dto.orderItems || [],
        };
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể lấy chi tiết đơn hàng');
  },

  updateOrder: async (id, updates) => {
    // Try admin/api PUT; if not supported, attempt soft-status update via same endpoints with minimal fields
    const payload = {
      // Backends often expect partial updates; send only known fields
      status: updates.status,
      notes: updates.notes,
      totalAmount: updates.totalAmount !== undefined ? Number(updates.totalAmount) : undefined,
    };
    const urls = [
      { url: `${API_BASE_URL}/orders/${id}`, method: 'PUT' },
      { url: `${API_BASE_URL_API}/orders/${id}`, method: 'PUT' },
    ];
    let lastErr;
    for (const u of urls) {
      try {
        const res = await fetch(u.url, { method: u.method, headers: getHeaders(), body: JSON.stringify(payload) });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
        lastErr = new Error(`${u.method} ${u.url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Backend chưa hỗ trợ sửa đơn hàng (PUT)');
  },

  deleteOrder: async (id) => {
    // Try hard delete
    const delUrls = [
      `${API_BASE_URL}/orders/${id}`,
      `${API_BASE_URL_API}/orders/${id}`,
    ];
    for (const url of delUrls) {
      try {
        const res = await fetch(url, { method: 'DELETE', headers: getHeaders() });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
      } catch { /* ignore */ }
    }
    // Fallback: try to mark as cancelled via PUT
    const softPayload = { status: 'cancelled' };
    let lastErr;
    for (const url of delUrls) {
      try {
        const res = await fetch(url, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(softPayload) });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
        lastErr = new Error(`PUT ${url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Backend chưa hỗ trợ xóa đơn hàng (DELETE/PUT)');
  },


  // ===== Users =====
  getUsers: async () => {
    // Prefer /admin first for environments exposing admin-only endpoints.
    // Fallback to generic /api/users and finally to auth's users list.
    const ts = Date.now();
    const urls = [
      `${API_BASE_URL}/users?t=${ts}`,
      `${API_BASE_URL_API}/users?t=${ts}`,
      `${API_BASE_URL_API}/auth/users?t=${ts}`,
    ];
    let lastErr;
    for (const url of urls) {
      try {
  const res = await fetch(url, { headers: { ...getHeaders(), 'Cache-Control': 'no-cache' }, cache: 'no-store' });
        if (!res.ok) { lastErr = new Error(`GET ${url} -> ${res.status}`); continue; }
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data?.data ?? [];
        return arr.map((u) => ({
          id: u.id ?? u.userId ?? u.ID,
          name: u.name ?? u.full_name ?? u.fullName ?? u.username ?? 'N/A',
          email: u.email ?? 'N/A',
          role: u.role ?? 'customer',
          banned: u.banned ?? u.isBanned ?? u.is_banned ?? (u.isVerified === false ? true : false),
          status: (u.banned || u.isBanned || u.is_banned || u.isVerified === false) ? 'BANNED' : 'ACTIVE',
          // Expose phone/address if backend provides them in any common shape
          phone: u.phone ?? u.phoneNumber ?? u.phone_number ?? u.mobile ?? u.contactPhone ?? u?.profile?.phone ?? '',
          address: u.addressText ?? u.address ?? u.address_line ?? u.addressLine ?? u.street ?? u.fullAddress ?? u?.profile?.address ?? '',
        }));
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể tải danh sách người dùng');
  },

  addUser: async (user) => {
    // Normalize role; many DBs accept only buyer|seller|admin|shipper
    const normalizedRole = (user.role === 'customer') ? 'buyer' : (user.role || 'buyer');
    // Endpoints: prefer auth/register first to avoid admin 500
    const endpoints = [
      { url: `${API_BASE_URL_API}/auth/register`, method: 'POST' },
      { url: `${API_BASE_URL_API}/users`, method: 'POST' },
      // NOTE: intentionally avoiding POST /admin/users to prevent 500 on some backends
    ];
    let lastErr;
    for (const ep of endpoints) {
      // Build payload variants per endpoint
      const isRegister = ep.url.includes('/auth/register');
      const bodies = isRegister
        ? [
            { email: user.email, password: user.password, name: user.name },
            { email: user.email, password: user.password, fullName: user.name },
            { email: user.email, password: user.password, name: user.name, phone: user.phone, address: user.address },
            { email: user.email, password: user.password, fullName: user.name, phoneNumber: user.phone, addressText: user.address },
          ]
        : [
            { name: user.name, email: user.email, role: normalizedRole, password: user.password, phone: user.phone, address: user.address },
            { fullName: user.name, email: user.email, role: normalizedRole, password: user.password, phoneNumber: user.phone, addressText: user.address },
            { username: user.email, email: user.email, name: user.name, role: normalizedRole, password: user.password, phone: user.phone, address: user.address },
            { username: user.email, email: user.email, fullName: user.name, role: normalizedRole, password: user.password, phoneNumber: user.phone, addressText: user.address },
          ];
      for (const body of bodies.map((c) => Object.fromEntries(Object.entries(c).filter(([, v]) => v !== undefined && v !== '')))) {
        try {
          const res = await fetch(ep.url, { method: ep.method, headers: getHeaders(), body: JSON.stringify(body) });
          if (res.ok) { try { return await res.json(); } catch { return {}; } }
          lastErr = new Error(`${ep.method} ${ep.url} -> ${res.status}`);
        } catch (e) { lastErr = e; }
      }
    }
    throw lastErr || new Error('Không thể thêm người dùng');
  },

  updateUser: async (id, user) => {
    // Normalize role value; keep lowercase as primary
    const role = (user.role === 'customer') ? 'buyer' : (user.role || 'buyer');
    
    console.log('📤 admin.js updateUser called with:', { id, user });

    // Build the complete update body with all fields
    const updateBody = {
      name: user.name,
      fullName: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: role
    };
    
    // Remove undefined/empty values
    const cleanBody = Object.fromEntries(
      Object.entries(updateBody).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    );
    
    console.log('📤 Sending update request with body:', cleanBody);

    // Try admin endpoint first
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, { 
        method: 'PUT', 
        headers: getHeaders(), 
        body: JSON.stringify(cleanBody) 
      });
      
      if (res.ok) { 
        const result = await res.json(); 
        console.log('✅ Update successful:', result);
        return result;
      }
      
      // Log error details
      const errorText = await res.text();
      console.error('❌ Update failed:', res.status, errorText);
      throw new Error(`Update failed: ${res.status} - ${errorText}`);
    } catch (e) {
      console.error('❌ Update error:', e);
      throw e;
    }
  },

  deleteUser: async (id) => {
    // Use admin endpoint only for user deletion (hard delete)
    const urls = [
      `${API_BASE_URL}/users/${id}?hard=true`,
      // Fallback without param in case server defaults to hard delete
      `${API_BASE_URL}/users/${id}`,
    ];
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { method: 'DELETE', headers: getHeaders() });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
        lastErr = new Error(`DELETE ${url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể xóa người dùng');
  },

 // ...existing code...
  banUser: async (userId) => {
    const attempts = [
      { url: `${API_BASE_URL}/users/${userId}/ban`, method: 'POST', body: {} },
      { url: `${API_BASE_URL}/users/${userId}/ban`, method: 'PUT', body: {} },
      { url: `${API_BASE_URL_API}/users/${userId}/ban`, method: 'POST', body: {} },
      { url: `${API_BASE_URL_API}/users/${userId}/ban`, method: 'PUT', body: {} },
    ];
    let lastErr, lastStatus, lastBody;
    for (const a of attempts) {
      try {
        const res = await fetch(a.url, {
          method: a.method,
          headers: { ...getHeaders(), Accept: 'application/json' },
          body: JSON.stringify(a.body),
        });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
        lastStatus = res.status;
        try { lastBody = await res.text(); } catch { lastBody = ''; }
        lastErr = new Error(`${a.method} ${a.url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw new Error(`Không thể ban người dùng (${lastStatus || 'unknown'}): ${lastBody || (lastErr?.message || '')}`);
  },

  unbanUser: async (userId) => {
    const attempts = [
      { url: `${API_BASE_URL}/users/${userId}/unban`, method: 'POST', body: {} },
      { url: `${API_BASE_URL}/users/${userId}/unban`, method: 'PUT', body: {} },
      { url: `${API_BASE_URL_API}/users/${userId}/unban`, method: 'POST', body: {} },
      { url: `${API_BASE_URL_API}/users/${userId}/unban`, method: 'PUT', body: {} },
    ];
    let lastErr, lastStatus, lastBody;
    for (const a of attempts) {
      try {
        const res = await fetch(a.url, {
          method: a.method,
          headers: { ...getHeaders(), Accept: 'application/json' },
          body: JSON.stringify(a.body),
        });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
        lastStatus = res.status;
        try { lastBody = await res.text(); } catch { lastBody = ''; }
        lastErr = new Error(`${a.method} ${a.url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw new Error(`Không thể unban người dùng (${lastStatus || 'unknown'}): ${lastBody || (lastErr?.message || '')}`);
  },
// ...existing code...

  // ===== Orders =====
  getOrders: async () => {
    const urls = [
      `${API_BASE_URL}/orders`,
      `${API_BASE_URL_API}/orders`,
    ];
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) { lastErr = new Error(`GET ${url} -> ${res.status}`); continue; }
        const json = await res.json();
        const arr = Array.isArray(json) ? json : json?.data ?? [];
        return arr.map((o) => ({
          id: o.id ?? o.orderId ?? o.ID,
          // Prefer recipientName from DTO/DB; fallback to any buyer/customer name fields
          customerName: o.recipientName ?? o.recipient_name ?? o.customerName ?? o.customer_name ?? o.buyer_name ?? 'N/A',
          // Phone and address: support flat fields and nested deliveryInfo
          recipientPhone: o.recipientPhone ?? o.phone ?? o.phoneNumber ?? o.phone_number ?? o?.deliveryInfo?.recipientPhone ?? '',
          addressText: o.addressText ?? o.address ?? o.addressLine ?? o.address_line ?? o?.deliveryInfo?.addressText ?? '',
          // Prefer totalAmount from DTO; fallback to snake_case and legacy fields
          total: Number(o.totalAmount ?? o.total_amount ?? o.total ?? 0),
          status: o.status ?? o.order_status ?? 'UNKNOWN',
          createdAt: o.createdAt ?? o.created_at ?? o.order_date ?? null,
        }));
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể tải danh sách đơn hàng');
  },

  // ===== Vouchers =====
  getVouchers: async () => {
    const urls = [
      `${API_BASE_URL}/vouchers`,
      `${API_BASE_URL_API}/vouchers`,
    ];
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) { lastErr = new Error(`GET ${url} -> ${res.status}`); continue; }
        const json = await res.json();
        const arr = Array.isArray(json) ? json : json?.data ?? [];
        return arr.map((v) => ({
          id: v.id ?? v.voucherId ?? v.ID,
          code: v.code ?? v.voucher_code ?? 'N/A',
          discount: Number(v.discount ?? v.discount_value ?? v.percent ?? 0),
          expiryDate: v.expiryDate ?? v.expiry_date ?? v.expires_at ?? null,
          minOrderValue: Number(v.minOrderValue ?? v.min_order_value ?? 0),
          maxUses: v.maxUses ?? v.max_uses ?? null,
          createdAt: v.createdAt ?? v.created_at ?? null,
          usedCount: v.used_count ?? v.usedCount ?? 0,
        }));
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể tải danh sách voucher');
  },

  // ===== VOUCHERS CRUD =====
  addVoucher: async (voucher) => {
    // Normalize payloads for different backends
    const base = {
      code: voucher.code,
      discount: Number(voucher.discount ?? voucher.percent ?? 0),
      expiryDate: voucher.expiryDate || voucher.expiry_date || voucher.expires_at || null,
      minOrderValue: voucher.minOrderValue ?? voucher.min_order_value,
      maxUses: voucher.maxUses ?? voucher.max_uses,
    };
    // Try multiple shapes
    const bodies = [
      base,
      { voucherCode: base.code, percent: base.discount, expiresAt: base.expiryDate },
      { code: base.code, percent: base.discount, expiresAt: base.expiryDate },
    ].map(b => Object.fromEntries(Object.entries(b).filter(([,v]) => v !== undefined && v !== null && v !== '')));

    const endpoints = [
      { url: `${API_BASE_URL}/vouchers`, method: 'POST' },
      { url: `${API_BASE_URL_API}/vouchers`, method: 'POST' },
    ];
    let lastErr;
    for (const body of bodies) {
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep.url, { method: ep.method, headers: getHeaders(), body: JSON.stringify(body) });
          if (res.ok) { try { return await res.json(); } catch { return {}; } }
          lastErr = new Error(`${ep.method} ${ep.url} -> ${res.status}`);
        } catch (e) { lastErr = e; }
      }
    }
    throw lastErr || new Error('Không thể thêm voucher');
  },

  updateVoucher: async (id, voucher) => {
    const base = {
      code: voucher.code,
      discount: Number(voucher.discount ?? voucher.percent ?? 0),
      expiryDate: voucher.expiryDate || voucher.expiry_date || voucher.expires_at || null,
      minOrderValue: voucher.minOrderValue ?? voucher.min_order_value,
      maxUses: voucher.maxUses ?? voucher.max_uses,
    };
    const bodies = [
      base,
      { voucherCode: base.code, percent: base.discount, expiresAt: base.expiryDate },
      { code: base.code, percent: base.discount, expiresAt: base.expiryDate },
    ].map(b => Object.fromEntries(Object.entries(b).filter(([,v]) => v !== undefined && v !== null && v !== '')));

    const endpoints = [
      { url: `${API_BASE_URL}/vouchers/${id}`, method: 'PUT' },
      { url: `${API_BASE_URL_API}/vouchers/${id}`, method: 'PUT' },
    ];
    let lastErr;
    for (const body of bodies) {
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep.url, { method: ep.method, headers: getHeaders(), body: JSON.stringify(body) });
          if (res.ok) { try { return await res.json(); } catch { return {}; } }
          lastErr = new Error(`${ep.method} ${ep.url} -> ${res.status}`);
        } catch (e) { lastErr = e; }
      }
    }
    throw lastErr || new Error('Không thể cập nhật voucher');
  },

  deleteVoucher: async (id) => {
    const urls = [
      `${API_BASE_URL}/vouchers/${id}`,
      `${API_BASE_URL_API}/vouchers/${id}`,
    ];
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { method: 'DELETE', headers: getHeaders() });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
        lastErr = new Error(`DELETE ${url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể xóa voucher');
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
    const urls = [
      `${API_BASE_URL}/products`,
      `${API_BASE_URL_API}/products`,
    ];
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) { lastErr = new Error(`GET ${url} -> ${res.status}`); continue; }
        const json = await res.json();
        const arr = Array.isArray(json) ? json : json?.data ?? [];
        // First pass: basic mapping with categoryId captured
        const mapped = arr.map((p) => ({
          id: p.id ?? 0,
          name: p.name ?? 'N/A',
          price: Number(p.price ?? p.unit_price ?? 0),
          category: p.category ?? p.category_name ?? null,
          categoryId: p.category_id ?? p.categoryId ?? null,
          shopId: p.shopId ?? p.shop_id ?? null,
          stock: p.stock_quantity ?? p.stock ?? 0,
          image: p.image ?? p.image_url ?? p.imageUrl ?? '',
          available: (p.available !== undefined) ? !!p.available : (p.isAvailable !== undefined ? !!p.isAvailable : true),
          status: p.status ?? p.product_status ?? 'active',
          deleted: p.deleted ?? p.isDeleted ?? false,
        }));

        // If any item missing category text but has categoryId, fetch names by id
        const missing = mapped.filter(x => (!x.category || x.category === ''));
        const ids = [...new Set(missing.map(x => x.categoryId).filter(Boolean))];
        if (ids.length > 0) {
          // fetch each id via /api/categories/{id}
          const pairs = await Promise.all(ids.map(async (id) => {
            try {
              const r = await fetch(`${API_BASE_URL_API}/categories/${id}`, { headers: getHeaders() });
              if (!r.ok) return [id, null];
              const j = await r.json();
              const dto = j?.data ?? j;
              const name = dto?.name ?? dto?.Name ?? null;
              return [id, name];
            } catch {
              return [id, null];
            }
          }));
          const idToName = Object.fromEntries(pairs);
          mapped.forEach(m => {
            if (!m.category && m.categoryId && idToName[m.categoryId]) {
              m.category = idToName[m.categoryId];
            }
            if (!m.category) m.category = 'Chưa phân loại';
          });
        } else {
          // fill default for items still missing category
          mapped.forEach(m => { if (!m.category) m.category = 'Chưa phân loại'; });
        }

  // Exclude items logically deleted or status 'inactive'/'deleted'.
  // Keep items that are available=false so the admin UI can show 'Hết' (out of stock)
  const filtered = mapped.filter(m => !m.deleted && m.status !== 'inactive' && m.status !== 'deleted');
  return filtered;
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể tải danh sách sản phẩm');
  },    
  // ===== PRODUCTS CRUD =====
  addProduct: async (product) => {
    const payload = {
      name: product.name,
      description: product.description || '',
      price: Number(product.price ?? 0),
      categoryId: Number(product.categoryId ?? product.category_id ?? 0),
      shopId: Number(product.shopId ?? 1),
      available: product.available !== undefined ? !!product.available : true,
      status: product.status || 'active',
      imageUrl: product.image || product.imageUrl || ''
    };
    const urls = [
      { url: `${API_BASE_URL}/products`, method: 'POST' },
      { url: `${API_BASE_URL_API}/products`, method: 'POST' },
    ];
  let lastErr;
    for (const u of urls) {
      try {
        const res = await fetch(u.url, { method: u.method, headers: getHeaders(), body: JSON.stringify(payload) });
        if (res.ok) return res.json();
        lastErr = new Error(`${u.method} ${u.url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể thêm sản phẩm');
  },

  updateProduct: async (id, product) => {
    const payload = {
      name: product.name,
      description: product.description || '',
      price: Number(product.price ?? 0),
      categoryId: Number(product.categoryId ?? product.category_id ?? 0),
      shopId: Number(product.shopId ?? 1),
      available: product.available !== undefined ? !!product.available : true,
      status: product.status || 'active',
      imageUrl: product.image || product.imageUrl || product.image_url || ''
    };
    const urls = [
      { url: `${API_BASE_URL}/products/${id}`, method: 'PUT' },
      { url: `${API_BASE_URL_API}/products/${id}`, method: 'PUT' },
    ];
    let lastErr;
    for (const u of urls) {
      try {
        const res = await fetch(u.url, { method: u.method, headers: getHeaders(), body: JSON.stringify(payload) });
        if (res.ok) return res.json();
        lastErr = new Error(`${u.method} ${u.url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể cập nhật sản phẩm');
  },

  deleteProduct: async (id, current) => {
    // Hard delete against public /api; treat 404 as already-deleted (idempotent)
    const url = `${API_BASE_URL_API}/products/${id}`;
    try {
      const res = await fetch(url, { method: 'DELETE', headers: getHeaders() });
      if (res.ok || res.status === 204) { try { return await res.json(); } catch { return {}; } }
      if (res.status === 404) { return {}; }
      // capture response text for better diagnostics
      let detail = '';
      try { detail = await res.text(); } catch { /* ignore */ }
      throw new Error(`DELETE ${url} -> ${res.status}${detail ? ` | ${detail}` : ''}`);
    } catch (e) {
      // Do not fallback to /admin to avoid noisy 500s where endpoint doesn't exist
      throw e instanceof Error ? e : new Error(String(e));
    }
  },

  uploadProductImage: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const urls = [
      `${API_BASE_URL}/products/${id}/upload-image`,
      `${API_BASE_URL_API}/products/${id}/upload-image`,
    ];
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { method: 'POST', headers: { Authorization: getHeaders().Authorization || '' }, body: formData });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
        lastErr = new Error(`POST ${url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể upload ảnh sản phẩm');
  },

  // ===== SHOP MANAGEMENT =====
  getShops: async () => {
    const urls = [
      `${API_BASE_URL}/shops`,
      `${API_BASE_URL_API}/admin/shops`,
    ];
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) { lastErr = new Error(`GET ${url} -> ${res.status}`); continue; }
        const json = await res.json();
        return Array.isArray(json) ? json : json?.data ?? [];
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể tải danh sách shop');
  },

  getLowRatingShops: async () => {
    const urls = [
      `${API_BASE_URL}/shops/low-rating`,
      `${API_BASE_URL_API}/admin/shops/low-rating`,
    ];
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) { lastErr = new Error(`GET ${url} -> ${res.status}`); continue; }
        const json = await res.json();
        return Array.isArray(json) ? json : json?.data ?? [];
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể tải shop rating thấp');
  },

  banShop: async (shopId, data) => {
    const urls = [
      { url: `${API_BASE_URL}/shops/${shopId}/ban`, method: 'POST' },
      { url: `${API_BASE_URL_API}/admin/shops/${shopId}/ban`, method: 'POST' },
    ];
    let lastErr;
    for (const u of urls) {
      try {
        const res = await fetch(u.url, { 
          method: u.method, 
          headers: getHeaders(), 
          body: JSON.stringify(data) 
        });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
        lastErr = new Error(`${u.method} ${u.url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể ban shop');
  },

  unbanShop: async (shopId) => {
    const urls = [
      { url: `${API_BASE_URL}/shops/${shopId}/unban`, method: 'POST' },
      { url: `${API_BASE_URL_API}/admin/shops/${shopId}/unban`, method: 'POST' },
    ];
    let lastErr;
    for (const u of urls) {
      try {
        const res = await fetch(u.url, { method: u.method, headers: getHeaders() });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
        lastErr = new Error(`${u.method} ${u.url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể unban shop');
  },

  // ===== PRODUCT APPROVAL =====
  getPendingProducts: async () => {
    const urls = [
      `${API_BASE_URL}/products/pending`,
      `${API_BASE_URL_API}/admin/products/pending`,
    ];
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) { lastErr = new Error(`GET ${url} -> ${res.status}`); continue; }
        const json = await res.json();
        return Array.isArray(json) ? json : json?.data ?? [];
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể tải sản phẩm chờ duyệt');
  },

  approveProduct: async (productId) => {
    const urls = [
      { url: `${API_BASE_URL}/products/${productId}/approve`, method: 'POST' },
      { url: `${API_BASE_URL_API}/admin/products/${productId}/approve`, method: 'POST' },
    ];
    let lastErr;
    for (const u of urls) {
      try {
        const res = await fetch(u.url, { method: u.method, headers: getHeaders() });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
        lastErr = new Error(`${u.method} ${u.url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể duyệt sản phẩm');
  },

  rejectProduct: async (productId, data) => {
    const urls = [
      { url: `${API_BASE_URL}/products/${productId}/reject`, method: 'POST' },
      { url: `${API_BASE_URL_API}/admin/products/${productId}/reject`, method: 'POST' },
    ];
    let lastErr;
    for (const u of urls) {
      try {
        const res = await fetch(u.url, { 
          method: u.method, 
          headers: getHeaders(), 
          body: JSON.stringify(data) 
        });
        if (res.ok) { try { return await res.json(); } catch { return {}; } }
        lastErr = new Error(`${u.method} ${u.url} -> ${res.status}`);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Không thể từ chối sản phẩm');
  },

};
