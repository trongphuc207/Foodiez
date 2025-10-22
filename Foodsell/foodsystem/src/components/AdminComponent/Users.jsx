import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
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
    setBusyId(u.id);

    // Cập nhật lạc quan
    const prev = [...users];
    const nextStatus = isBanned(u) ? 'ACTIVE' : 'BANNED';
    setUsers((list) =>
      list.map((x) => (x.id === u.id ? { ...x, status: nextStatus } : x))
    );

    try {
      if (isBanned(u)) {
        await adminAPI.unbanUser(u.id);
      } else {
        await adminAPI.banUser(u.id);
      }
    } catch (e) {
      // Rollback nếu lỗi
      console.error(e);
      setUsers(prev);
      setErr(e.message || 'Thao tác thất bại');
    } finally {
      setBusyId(null);
    }
  };

  if (err) {
    return <div style={{ color: '#b00020' }}>{err}</div>;
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2>Quản lý người dùng</h2>
        <button className="btn btn-sm btn-outline-secondary" onClick={loadUsers}>
          Tải lại
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th style={{ width: 140 }}>Vai trò</th>
              <th style={{ width: 160 }}>Trạng thái</th> {/* cột mới */}
              <th style={{ width: 140 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
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
                    <td>
                      <button
                        className={`btn btn-sm ${banned ? 'btn-success' : 'btn-danger'}`}
                        onClick={() => handleToggleBan(u)}
                        disabled={busyId === u.id}
                      >
                        {busyId === u.id
                          ? 'Đang xử lý...'
                          : banned
                          ? 'Unban'
                          : 'Ban'}
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
