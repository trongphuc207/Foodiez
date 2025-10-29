import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import StatCard from './StatCard';
import './admin.css';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [availableProductCount, setAvailableProductCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminAPI.getStats();
        setStats(data);
        // Fetch available products count (our getProducts already filters inactive/unavailable)
        try {
          const prods = await adminAPI.getProducts();
          setAvailableProductCount(Array.isArray(prods) ? prods.length : 0);
        } catch {}
        // Compute total revenue from reports endpoint
        try {
          const r = await adminAPI.getReports();
          let total = 0;
          if (Array.isArray(r)) {
            total = r.reduce((sum, it) => sum + Number(it.revenue ?? it.doanhThu ?? it.money ?? 0), 0);
          } else if (r && typeof r === 'object') {
            total = Number(r.totalRevenue ?? r.revenueTotal ?? r.total_revenue ?? 0);
            if (!total) {
              // Fallback: if only monthlyRevenue present, use it as total
              total = Number(r.monthlyRevenue ?? 0);
            }
          }
          // Extra fallback: if reports can't provide total, derive from orders
          if (!total || Number.isNaN(total)) {
            try {
              const orders = await adminAPI.getOrders();
              const revenueStatuses = new Set(['confirmed', 'paid', 'completed']);
              const derived = Array.isArray(orders)
                ? orders.reduce((sum, o) => {
                    const st = String(o.status || '').toLowerCase();
                    const amount = Number(o.total ?? o.totalAmount ?? 0);
                    return revenueStatuses.has(st) ? sum + (Number.isFinite(amount) ? amount : 0) : sum;
                  }, 0)
                : 0;
              total = derived || total;
            } catch {}
          }
          setTotalRevenue(total);
        } catch {}
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu Dashboard');
      }
    };
    loadStats();
  }, []);

  if (error) return <div className="alert alert-danger mt-4">{error}</div>;
  if (!stats) return <div className="text-center mt-4">Đang tải dữ liệu...</div>;

  const fmtNumber = (n) => (Number(n) || 0).toLocaleString('vi-VN');
  const fmtMoney = (n) => fmtNumber(n) + ' ₫';

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📊 Bảng điều khiển Admin</h2>
      <div className="stat-grid">
        <StatCard title="Người dùng" value={fmtNumber(stats.users)} icon="👥" onClick={()=>navigate('users')} />
        <StatCard title="Đơn hàng" value={fmtNumber(stats.orders)} icon="🛍️" onClick={()=>navigate('orders')} />
        <StatCard title="Sản phẩm có sẵn" value={fmtNumber(availableProductCount)} icon="📦" onClick={()=>navigate('products')} />
        <StatCard title="Tổng doanh thu" value={fmtMoney(totalRevenue)} icon="💰" onClick={()=>navigate('reports')} />
        <StatCard title="Voucher" value={fmtNumber(stats.vouchers)} icon="🎟️" onClick={()=>navigate('vouchers')} />
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
 
