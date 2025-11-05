import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ id: null, name: '', email: '', role: 'buyer', password: '', phone: '', address: '' });

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
      // Enrich phone/address from recent orders if missing in users
      try {
        const needEnrich = data.some(u => !(u.phone && u.address));
        if (needEnrich) {
          const orders = await adminAPI.getOrders();
          const contactByName = new Map();
          for (const o of orders) {
            const name = (o.customerName || '').trim();
            if (!name) continue;
            const phone = o.recipientPhone || o.phone || o.phoneNumber || '';
            const address = o.addressText || o.address || o.addressLine || '';
            const created = o.createdAt ? new Date(o.createdAt).getTime() : 0;
            const cur = contactByName.get(name);
            if (!cur || created > cur.created || ((!cur.phone || !cur.address) && (phone || address))) {
              contactByName.set(name, { phone, address, created });
            }
          }
          setUsers(prev => prev.map(u => ({
            ...u,
            phone: u.phone || contactByName.get((u.name || '').trim())?.phone || '',
            address: u.address || contactByName.get((u.name || '').trim())?.address || '',
          })));
        }
      } catch (ignored) { /* best-effort enrichment only */ }
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Lỗi tải người dùng');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const isBanned = (u) =>
    (u.status ?? '').toUpperCase() === 'BANNED' || u.banned === true || u.isBanned === true;

  const handleToggleBan = async (u) => {
    setErr('');
    setOk('');
    setBusyId(u.id);

    // Cập nhật lạc quan
    const prev = [...users];
    const nextStatus = isBanned(u) ? 'ACTIVE' : 'BANNED';
    const nextBanned = !isBanned(u);
    setUsers((list) =>
      list.map((x) => (x.id === u.id ? { ...x, status: nextStatus, banned: nextBanned, isBanned: nextBanned } : x))
    );

    try {
      if (isBanned(u)) {
        await adminAPI.unbanUser(u.id);
        setOk(`Đã mở khóa người dùng ${u.name} thành công`);
      } else {
        await adminAPI.banUser(u.id);
        setOk(`Đã khóa người dùng ${u.name} thành công`);
      }
      // Auto-hide success message after 3s
      setTimeout(() => setOk(''), 3000);
    } catch (e) {
      // Rollback nếu lỗi
      console.error(e);
      setUsers(prev);
      setErr(e.message || 'Thao tác thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ id: null, name: '', email: '', role: 'buyer', password: '', phone: '', address: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    try {
      if (editingId) {
        // Update existing user
        console.log('🔄 Updating user:', { 
          id: editingId, 
          data: { name: form.name, role: form.role, email: form.email, phone: form.phone, address: form.address } 
        });
        
        const updateData = { 
          name: form.name, 
          role: form.role, 
          email: form.email, 
          phone: form.phone, 
          address: form.address 
        };
        
        const result = await adminAPI.updateUser(editingId, updateData);
        console.log('✅ Update result:', result);
        
        // Refresh list to reflect latest data from server
        await loadUsers();
        setOk('Cập nhật người dùng thành công');
        // Auto-hide after 3s
        setTimeout(() => setOk(''), 3000);
        // Reset form after success
        resetForm();
      } else {
        const normalizedRole = (form.role === 'customer') ? 'buyer' : (form.role || 'buyer');
  const res = await adminAPI.addUser({ ...form, role: normalizedRole });
        const newId = res?.id ?? res?.data?.id ?? res?.user?.id ?? res?.createdUserId ?? null;

        // Hiển thị hộp thoại xác nhận với thông tin tài khoản
        window.alert(`Thêm thành công tài khoản\n- username: ${form.name}\n- gmail: ${form.email}`);

        // Best effort: nếu chọn role khác buyer, cố gắng cập nhật role sau khi đăng ký
        try {
          if (normalizedRole !== 'buyer' || form.phone || form.address) {
            let targetId = newId;
            if (!targetId) {
              const list = await adminAPI.getUsers();
              const match = list.find((x) => (x.email || '').toLowerCase() === (form.email || '').toLowerCase());
              targetId = match?.id;
            }
            if (targetId) {
              await adminAPI.updateUser(targetId, { name: form.name, role: normalizedRole, email: form.email, phone: form.phone, address: form.address });
            }
          }
        } catch (e) {
          // Không chặn flow thêm user nếu cập nhật role thất bại
          console.warn('Cập nhật vai trò sau khi đăng ký thất bại:', e);
        }

        // Sau khi nhấn OK: cập nhật danh sách ngay lập tức
        if (newId) {
          const newUser = {
            id: newId,
            name: form.name,
            email: form.email,
            role: normalizedRole,
            phone: form.phone,
            address: form.address,
            status: 'ACTIVE',
            banned: false,
          };
          setUsers((prev) => [newUser, ...prev]);
        } else {
          // Nếu API không trả về id, fallback tải lại danh sách để lấy id từ server
          await loadUsers();
        }
        // Hiển thị banner thành công (phòng khi alert bị chặn)
        setOk(`Thêm thành công tài khoản username: ${form.name}, gmail: ${form.email}`);
        // Auto-hide after 3s
        setTimeout(() => setOk(''), 3000);
        resetForm();
      }
    } catch (e2) {
      console.error(e2);
      setErr(e2.message || 'Lỗi lưu người dùng');
    }
  };

  const onEdit = (u) => {
    setEditingId(u.id);
    const role = (u.role === 'customer') ? 'buyer' : (u.role || 'buyer');
    setForm({ id: u.id, name: u.name || '', email: u.email || '', role, password: '', phone: u.phone || '', address: u.address || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    const user = users.find(u => u.id === id);
    const userName = user?.name || 'người dùng này';
    
    if (!window.confirm(`Xóa vĩnh viễn người dùng "${userName}"? Hành động này không thể hoàn tác.`)) return;
    
    setErr('');
    setOk('');
    setBusyId(id);
    
    try {
      await adminAPI.deleteUser(id);
      // Xóa khỏi danh sách ngay lập tức
      setUsers(prev => prev.filter(u => u.id !== id));
      setOk(`Đã xóa người dùng "${userName}" thành công`);
      // Auto-hide after 3s
      setTimeout(() => setOk(''), 3000);
    } catch (e2) {
      console.error(e2);
      setErr(e2.message || 'Không thể xóa vĩnh viễn người dùng');
    } finally {
      setBusyId(null);
    }
  };

  const ErrorBanner = () => (
    err ? (
      <div className="alert alert-danger" role="alert">
        {err}
      </div>
    ) : null
  );

  const OkBanner = () => (
    ok ? (
      <div className="alert alert-success" role="alert">
        {ok}
      </div>
    ) : null
  );

  return (
    <div>
      <ErrorBanner />
      <OkBanner />
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2>Quản lý người dùng</h2>
        <button className="btn btn-sm btn-outline-secondary" onClick={loadUsers}>
          Tải lại
        </button>
      </div>

      {/* Create / Edit */}
      <form className="row g-3 mb-3" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <label className="form-label">Tên</label>
          <input className="form-control" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required />
        </div>
        <div className="col-md-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} required />
        </div>
        <div className="col-md-3">
          <label className="form-label">SĐT</label>
          <input className="form-control" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} placeholder="Ví dụ: 0901234567" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Địa chỉ</label>
          <input className="form-control" value={form.address} onChange={(e)=>setForm({...form, address: e.target.value})} placeholder="Số nhà, đường, quận/huyện, TP" />
        </div>
        <div className="col-md-2">
          <label className="form-label">Vai trò</label>
          <select className="form-select" value={form.role} onChange={(e)=>setForm({...form, role: e.target.value})}>
            <option value="buyer">buyer</option>
            <option value="admin">admin</option>
            <option value="seller">seller</option>
            <option value="shipper">shipper</option>
          </select>
        </div>
        {!editingId && (
          <div className="col-md-3">
            <label className="form-label">Mật khẩu</label>
            <input type="password" className="form-control" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} required />
          </div>
        )}
        <div className="col-12 d-flex gap-2">
          <button type="submit" className="btn btn-primary">{editingId ? 'Lưu sửa' : 'Thêm người dùng'}</button>
          {editingId && <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Hủy</button>}
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th style={{ width: 140 }}>SĐT</th>
              <th>Địa chỉ</th>
              <th style={{ width: 140 }}>Vai trò</th>
              <th style={{ width: 160 }}>Trạng thái</th> {/* cột mới */}
              <th style={{ width: 220 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  Chưa có người dùng.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const banned = isBanned(u);
                return (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '-'}</td>
                    <td>{u.address || '-'}</td>
                    <td>
                      <span className="badge bg-secondary">{(u.role || 'customer').toUpperCase()}</span>
                    </td>
                    <td>
                      {banned ? (
                        <span className="badge bg-danger">BANNED</span>
                      ) : (
                        <span className="badge bg-success">ACTIVE</span>
                      )}
                    </td>
                    <td className="d-flex gap-2">
                      <button
                        className={`btn btn-sm ${banned ? 'btn-success' : 'btn-warning'}`}
                        onClick={() => handleToggleBan(u)}
                        disabled={busyId === u.id}
                        title={banned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                      >
                        {busyId === u.id
                          ? '⏳ Đang xử lý...'
                          : banned
                          ? '✅ Mở khóa'
                          : '🔒 Khóa'}
                      </button>
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={()=>onEdit(u)}
                        disabled={busyId === u.id}
                        title="Chỉnh sửa thông tin"
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={()=>onDelete(u.id)}
                        disabled={busyId === u.id}
                        title="Xóa vĩnh viễn"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
