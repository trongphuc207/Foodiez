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
    setForm({ id: null, name: '', email: '', role: 'buyer', password: '', phone: '', address: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    try {
      // Chỉ cho phép thêm mới, không cho edit
      if (false) {
        // Disabled edit functionality
        console.log('Edit disabled');
        
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
    <div className="admin-page">
      <ErrorBanner />
      <OkBanner />
      <div className="page-header">
        <h2 className="page-title">Quản lý người dùng</h2>
        <button className="btn btn-secondary" onClick={loadUsers}>
          🔄 Tải lại
        </button>
      </div>

      {/* Create / Edit */}
      <div className="admin-card">
        <h3 className="card-title">➕ Thêm người dùng mới</h3>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="admin-form-group">
            <label>Tên</label>
            <input className="form-control" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required placeholder="Nhập tên người dùng" />
          </div>
          <div className="admin-form-group">
            <label>Email</label>
            <input type="email" className="form-control" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} required placeholder="example@email.com" />
          </div>
          <div className="admin-form-group">
            <label>Số điện thoại</label>
            <input className="form-control" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} placeholder="0901234567" />
          </div>
          <div className="admin-form-group">
            <label>Vai trò</label>
            <select className="form-control" value={form.role} onChange={(e)=>setForm({...form, role: e.target.value})}>
              <option value="buyer">BUYER</option>
              <option value="admin">ADMIN</option>
              <option value="seller">SELLER</option>
              <option value="shipper">SHIPPER</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Mật khẩu</label>
            <input type="password" className="form-control" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} required placeholder="Mật khẩu mạnh" />
          </div>
          <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Địa chỉ</label>
            <input className="form-control" value={form.address} onChange={(e)=>setForm({...form, address: e.target.value})} placeholder="Số nhà, đường, quận/huyện, thành phố" />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            ➕ Thêm người dùng
          </button>
        </div>
      </form>
      </div>

      <div className="admin-card">
        <h3 className="card-title">📋 Danh sách người dùng</h3>
        <div className="admin-table-wrapper">
        <table className="table-modern">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th style={{ width: 140 }}>SĐT</th>
              <th>Địa chỉ</th>
              <th style={{ width: 140 }}>Vai trò</th>
              <th style={{ width: 160 }}>Trạng thái</th>
              <th style={{ width: 280 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>Chưa có người dùng nào</div>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const banned = isBanned(u);
                return (
                  <tr key={u.id}>
                    <td><strong>#{u.id}</strong></td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone || <span style={{color:'#666'}}>-</span>}</td>
                    <td>{u.address || <span style={{color:'#666'}}>-</span>}</td>
                    <td>
                      <span className="badge bg-secondary" style={{ textTransform: 'uppercase', fontSize: '0.85rem', padding: '0.5em 1em' }}>
                        {(u.role || 'customer').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {banned ? (
                        <span className="badge bg-danger" style={{ fontSize: '0.85rem', padding: '0.5em 1em' }}>BANNED</span>
                      ) : (
                        <span className="badge bg-success" style={{ fontSize: '0.85rem', padding: '0.5em 1em' }}>ACTIVE</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          className={`btn btn-sm ${banned ? 'btn-success' : 'btn-warning'}`}
                          onClick={() => handleToggleBan(u)}
                          disabled={busyId === u.id}
                          title={banned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          style={{ minWidth: '90px' }}
                        >
                          {busyId === u.id
                            ? '⏳'
                            : banned
                            ? '🔓 Khóa'
                            : '🔒 Khóa'}
                        </button>

                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={()=>onDelete(u.id)}
                          disabled={busyId === u.id}
                          title="Xóa vĩnh viễn"
                          style={{ minWidth: '70px' }}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
