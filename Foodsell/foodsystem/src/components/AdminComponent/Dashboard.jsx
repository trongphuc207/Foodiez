import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminAPI.getStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu Dashboard');
      }
    };
    loadStats();
  }, []);

  if (error) return <div className="alert alert-danger mt-4">{error}</div>;
  if (!stats) return <div className="text-center mt-4">Đang tải dữ liệu...</div>;

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📊 Bảng điều khiển Admin</h2>
      <div className="row g-3">
        <StatCard title="👥 Người dùng" value={stats.users} color="primary" />
        <StatCard title="🛍️ Đơn hàng" value={stats.orders} color="success" />
        <StatCard title="📦 Sản phẩm" value={stats.products} color="warning" />
        <StatCard title="💰 Doanh thu tháng" value={stats.revenue.toLocaleString() + ' VNĐ'} color="info" />
        <StatCard title="🎟️ Voucher" value={stats.vouchers} color="secondary" />
        <StatCard title="📦 Tồn kho tổng" value={stats.totalStock} color="danger" />
      </div>

      <div className="mt-5 text-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2292/2292038.png"
          alt="Dashboard"
          style={{ width: '120px', opacity: 0.7 }}
        />
        <p className="text-muted mt-2">Tổng quan dữ liệu quản trị cửa hàng Foodiez</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="col-md-4">
      <div className={`card border-${color} shadow-sm`}>
        <div className={`card-body text-${color}`}>
          <h5 className="card-title">{title}</h5>
          <h3 className="fw-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
}
