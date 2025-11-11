import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../api/admin';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Search / filters
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Create/Edit form
  const initialForm = { id: null, recipientName: '', recipientPhone: '', addressText: '', totalAmount: '', status: 'pending', notes: '' };
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  // Only allow selecting users with role 'buyer'
  const buyerUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter(u => ((u.role || u.userRole || '') + '').toLowerCase() === 'buyer');
  }, [users]);

  const load = async () => {
    setLoading(true); setError('');
    try {
      // Fetch orders and users in parallel so we can provide a recipient datalist
      const [ordersData, usersData] = await Promise.all([
        adminAPI.getOrders(),
        adminAPI.getUsers(),
      ]);
      setOrders(ordersData || []);
      setUsers(usersData || []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Lỗi tải danh sách đơn hàng hoặc người dùng');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const k = keyword.trim().toLowerCase();
      const matchKeyword = !k || `${o.id}`.includes(k) || (o.customerName || '').toLowerCase().includes(k) || (o.status || '').toLowerCase().includes(k);
      const matchStatus = !statusFilter || (o.status || '') === statusFilter;
      const created = o.createdAt ? new Date(o.createdAt) : null;
      const matchFrom = !dateFrom || (created && created >= new Date(dateFrom));
      const matchTo = !dateTo || (created && created <= new Date(dateTo + 'T23:59:59'));
      return matchKeyword && matchStatus && matchFrom && matchTo;
    });
  }, [orders, keyword, statusFilter, dateFrom, dateTo]);

  const resetForm = () => { setForm(initialForm); setEditingId(null); };

  // Try to match a typed/selected name to a user entry and fill phone/address when available
  const fillFromUserName = (name) => {
    if (!name || !users || users.length === 0) return;
    const target = buyerUsers.find(u => {
      const n = (u.full_name || u.fullName || u.name || '').toString().trim().toLowerCase();
      return n && n === name.toString().trim().toLowerCase();
    });
    if (target) {
      setForm(prev => ({
        ...prev,
        // only overwrite if empty to avoid clobbering manual edits
        recipientPhone: prev.recipientPhone || target.phone || target.phoneNumber || '',
        addressText: prev.addressText || target.address || target.addressText || target.addressLine || '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        // Attempt update; backend may not support PUT (will show message if fails)
        await adminAPI.updateOrder(editingId, {
          status: form.status,
          notes: form.notes,
          totalAmount: form.totalAmount,
        });
      } else {
        await adminAPI.addOrder({
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone,
          addressText: form.addressText,
          totalAmount: Number(form.totalAmount || 0),
          status: form.status,
          notes: form.notes,
          cartItems: [],
          paymentInfo: null,
          payosOrderCode: null,
        });
      }
      await load();
      resetForm();
    } catch (e2) {
      setError(e2.message || 'Lỗi lưu đơn hàng');
    }
  };

  const onEdit = async (o) => {
    setEditingId(o.id);
    // Try to fetch details for accuracy
    try {
      const full = await adminAPI.getOrderById(o.id);
      setForm({
        id: full.id,
        recipientName: full.customerName || '',
        recipientPhone: full.recipientPhone || '',
        addressText: full.addressText || '',
        totalAmount: full.total || '',
        status: full.status || 'pending',
        notes: full.notes || '',
      });
    } catch {
      setForm({ id: o.id, recipientName: o.customerName || '', recipientPhone: '', addressText: '', totalAmount: o.total || '', status: o.status || 'pending', notes: '' });
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm(`Xóa đơn ${id}?`)) return;
    setError('');
    try {
      await adminAPI.deleteOrder(id);
      await load();
    } catch (e) {
      setError(e.message || 'Backend chưa hỗ trợ xóa đơn hàng');
    }
  };

  const lookupById = async () => {
    const id = keyword.trim();
    if (!id) return load();
    setLoading(true); setError('');
    try {
      const o = await adminAPI.getOrderById(id);
      if (o && o.id) setOrders([o]); else setOrders([]);
    } catch (e) {
      setError('Không tìm thấy đơn này');
      setOrders([]);
    } finally { setLoading(false); }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-title">📦 Quản lý đơn hàng</h2>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          🔄 Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <h3 className="card-title">🔍 Bộ lọc</h3>
      <div className="d-flex gap-2 align-items-end flex-wrap">
        <div>
          <label className="form-label">Tìm kiếm</label>
          <input className="form-control" placeholder="ID, tên, trạng thái" value={keyword} onChange={(e)=>setKeyword(e.target.value)} />
        </div>
        <div>
          <label className="form-label">Trạng thái</label>
          <select className="form-select" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="paid">paid</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div>
          <label className="form-label">Từ ngày</label>
          <input type="date" className="form-control" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="form-label">Đến ngày</label>
          <input type="date" className="form-control" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary" onClick={load} disabled={loading}>Làm mới</button>
          <button className="btn btn-outline-primary" onClick={lookupById} disabled={loading}>Tra cứu theo ID</button>
        </div>
      </div>

      {/* Create / Edit form */}
      <form className="row g-3 mt-3" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <label className="form-label">Tên người nhận</label>
          <input
            className="form-control"
            list="users-datalist"
            value={form.recipientName}
            onChange={(e)=>{ setForm({...form, recipientName: e.target.value}); fillFromUserName(e.target.value); }}
            required={!editingId}
          />
          <datalist id="users-datalist">
            {buyerUsers && buyerUsers.map(u => (
              <option key={u.id || u.email || u.full_name || u.name} value={(u.full_name || u.fullName || u.name || u.email || '')} />
            ))}
          </datalist>
        </div>
        <div className="col-md-2">
          <label className="form-label">SĐT</label>
          <input className="form-control" value={form.recipientPhone} onChange={(e)=>setForm({...form, recipientPhone: e.target.value})} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Địa chỉ</label>
          <input className="form-control" value={form.addressText} onChange={(e)=>setForm({...form, addressText: e.target.value})} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Tổng tiền</label>
          <input type="number" min="0" className="form-control" value={form.totalAmount} onChange={(e)=>setForm({...form, totalAmount: e.target.value})} required />
        </div>
        <div className="col-md-2">
          <label className="form-label">Trạng thái</label>
          <select className="form-select" value={form.status} onChange={(e)=>setForm({...form, status: e.target.value})}>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="paid">paid</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Ghi chú</label>
          <input className="form-control" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} />
        </div>
        <div className="col-12 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>{editingId ? 'Lưu sửa' : 'Tạo đơn'}</button>
          {editingId && <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Hủy</button>}
        </div>
      </form>

      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-card">
        <h3 className="card-title">📋 Danh sách đơn hàng</h3>
      <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Người đặt</th>
            <th>Tổng tiền</th>
            <th>SĐT</th>
            <th>Địa chỉ</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>
                <button className="btn btn-link p-0" onClick={()=>navigate('/admin/users')} title="Xem người dùng">
                  {o.customerName}
                </button>
              </td>
              <td>{o.total} đ</td>
              <td>{o.recipientPhone || o.phone || o.phoneNumber || ''}</td>
              <td>{o.addressText || o.address || o.addressLine || ''}</td>
              <td>{o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : ''}</td>
              <td>{o.status}</td>
              <td className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={()=>onEdit(o)}>Sửa</button>
                <button className="btn btn-sm btn-outline-danger" onClick={()=>onDelete(o.id)}>Xóa</button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan="5" className="text-center">Không có dữ liệu</td></tr>
          )}
        </tbody>
      </table>
      </div>
      </div>
    </div>
  );
}
