import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState({ id: null, code: '', discount: '', expiryDate: '', minOrderValue: '', maxUses: '', quantity: '' });
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const load = async () => {
    setErr('');
    try {
      const list = await adminAPI.getVouchers();
      setVouchers(list);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Không thể tải voucher');
    }
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditingId(null);
    setForm({ id: null, code: '', discount: '', expiryDate: '', minOrderValue: '', maxUses: '', quantity: '' });
  };

  const dateOnly = (s) => {
    if (!s) return '';
    try { return String(s).substring(0, 10); } catch { return s; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    const payload = {
      code: form.code?.trim(),
      discount: Number(form.discount),
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
      minOrderValue: form.minOrderValue !== '' ? Number(form.minOrderValue) : undefined,
      maxUses: form.maxUses !== '' ? Number(form.maxUses) : undefined,
      quantity: form.quantity !== '' ? Number(form.quantity) : undefined,
    };
    if (!payload.code) { setErr('Mã voucher không được để trống'); return; }
    if (Number.isNaN(payload.discount) || payload.discount <= 0) { setErr('Giảm giá phải là số > 0'); return; }

    try {
      if (editingId) {
        await adminAPI.updateVoucher(editingId, payload);
        // Cập nhật tại chỗ
        setVouchers((prev) => prev.map(v => v.id === editingId ? { ...v, ...payload, expiryDate: form.expiryDate } : v));
        setOk('Cập nhật voucher thành công');
      } else {
        const res = await adminAPI.addVoucher(payload);
        const newId = res?.id ?? res?.data?.id ?? res?.voucher?.id ?? res?.createdId ?? null;
        if (newId) {
          setVouchers((prev) => [{ id: newId, code: payload.code, discount: payload.discount, expiryDate: form.expiryDate, minOrderValue: payload.minOrderValue ?? 0, maxUses: payload.maxUses ?? null, createdAt: new Date().toISOString() }, ...prev]);
        } else {
          await load();
        }
        setOk('Thêm voucher thành công');
      }
      reset();
      setTimeout(() => setOk(''), 3000);
    } catch (e2) {
      console.error(e2);
      setErr(e2.message || 'Lưu voucher thất bại');
    }
  };

  const onEdit = (v) => {
    setEditingId(v.id);
    setForm({ id: v.id, code: v.code || '', discount: v.discount ?? '', expiryDate: dateOnly(v.expiryDate), minOrderValue: v.minOrderValue ?? '', maxUses: v.maxUses ?? '', quantity: v.quantity ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Xóa voucher này?')) return;
    setErr(''); setOk('');
    try {
      await adminAPI.deleteVoucher(id);
      setVouchers((prev) => prev.filter(v => v.id !== id));
      setOk('Đã xóa voucher');
      setTimeout(() => setOk(''), 2000);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Không thể xóa voucher');
    }
  };

  const ErrorBanner = () => err ? (
    <div className="alert alert-danger" role="alert">{err}</div>
  ) : null;

  const OkBanner = () => ok ? (
    <div className="alert alert-success" role="alert">{ok}</div>
  ) : null;

  return (
    <div className="admin-page">
      <ErrorBanner />
      <OkBanner />
      <div className="page-header">
        <h2 className="page-title">🎫 Quản lý Voucher</h2>
        <button className="btn btn-secondary" onClick={load}>🔄 Tải lại</button>
      </div>

      {/* Create / Edit */}
      <div className="admin-card">
        <h3 className="card-title">{editingId ? '✏️ Chỉnh sửa Voucher' : '➕ Thêm Voucher mới'}</h3>
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <label className="form-label">Mã</label>
          <input className="form-control" value={form.code} onChange={(e)=>setForm({...form, code: e.target.value})} required />
        </div>
        <div className="col-md-3">
          <label className="form-label">Giảm giá (%)</label>
          <input type="number" min="1" className="form-control" value={form.discount} onChange={(e)=>setForm({...form, discount: e.target.value})} required />
        </div>
        <div className="col-md-3">
          <label className="form-label">Đặt tối thiểu</label>
          <input type="number" min="0" className="form-control" value={form.minOrderValue} onChange={(e)=>setForm({...form, minOrderValue: e.target.value})} placeholder="0" />
        </div>
        <div className="col-md-2">
          <label className="form-label">Dùng tối đa</label>
          <input type="number" min="0" className="form-control" value={form.maxUses} onChange={(e)=>setForm({...form, maxUses: e.target.value})} placeholder="không giới hạn" />
        </div>
        <div className="col-md-2">
          <label className="form-label">Số lượng</label>
          <input type="number" min="0" className="form-control" value={form.quantity} onChange={(e)=>setForm({...form, quantity: e.target.value})} placeholder="không giới hạn" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Ngày hết hạn</label>
          <input type="date" className="form-control" value={form.expiryDate} onChange={(e)=>setForm({...form, expiryDate: e.target.value})} />
        </div>
        <div className="col-12 d-flex gap-2">
          <button type="submit" className="btn btn-primary">{editingId ? 'Lưu sửa' : 'Thêm voucher'}</button>
          {editingId && <button type="button" className="btn btn-outline-secondary" onClick={reset}>Hủy</button>}
        </div>
      </form>
      </div>

      <div className="admin-card">
        <h3 className="card-title">📋 Danh sách Voucher</h3>
      <div className="table-responsive">
        <table className="table table-hover mt-3 align-middle">
          <thead className="table-light">
            <tr>
              <th style={{width: 60}}>ID</th>
              <th>Mã</th>
              <th style={{width: 100}}>Giảm giá</th>
              <th style={{width: 120}}>Đặt tối thiểu</th>
              <th style={{width: 120}}>Số lượng</th>
              <th style={{width: 100}}>Đã dùng</th>
              <th style={{width: 140}}>Ngày hết hạn</th>
              <th style={{width: 140}}>Ngày tạo</th>
              <th style={{width: 160}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr><td colSpan={9} className="text-center">Chưa có voucher.</td></tr>
            ) : vouchers.map(v => {
              const isOutOfStock = v.quantity !== null && v.quantity !== undefined && v.quantity <= 0;
              return (
              <tr key={v.id} className={isOutOfStock ? 'table-secondary' : ''}>
                <td>{v.id}</td>
                <td>
                  {v.code}
                  {isOutOfStock && <span className="badge bg-danger ms-2">Hết</span>}
                </td>
                <td>{v.discount}%</td>
                <td>{v.minOrderValue ? Number(v.minOrderValue).toLocaleString() : 0}</td>
                <td>{v.quantity ?? '∞'}</td>
                <td>{v.usedCount ?? 0}</td>
                <td>{v.expiryDate ? dateOnly(v.expiryDate) : '-'}</td>
                <td>{v.createdAt ? dateOnly(v.createdAt) : '-'}</td>
                <td className="d-flex gap-2">
                  <button className="btn btn-sm btn-primary" onClick={() => onEdit(v)}>Sửa</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(v.id)}>Xóa</button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
