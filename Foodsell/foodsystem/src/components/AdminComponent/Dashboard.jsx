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
    <div className="admin-page">
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">📊</span>
            Bảng điều khiển
          </h1>
          <p className="dashboard-subtitle">Tổng quan hệ thống Foodiez</p>
        </div>
        <div className="dashboard-date">
          <span className="date-icon">📅</span>
          <span>{new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <StatCard 
          title="Người dùng" 
          value={fmtNumber(stats.users)} 
          icon="👥" 
          onClick={()=>navigate('users')}
          color="primary"
        />
        <StatCard 
          title="Đơn hàng" 
          value={fmtNumber(stats.orders)} 
          icon="🛍️" 
          onClick={()=>navigate('orders')}
          color="accent"
        />
        <StatCard 
          title="Sản phẩm có sẵn" 
          value={fmtNumber(availableProductCount)} 
          icon="📦" 
          onClick={()=>navigate('products')}
          color="success"
        />
        <StatCard 
          title="Tổng doanh thu" 
          value={fmtMoney(totalRevenue)} 
          icon="💰" 
          onClick={()=>navigate('reports')}
          color="warning"
        />
        <StatCard 
          title="Voucher" 
          value={fmtNumber(stats.vouchers)} 
          icon="🎟️" 
          onClick={()=>navigate('vouchers')}
          color="danger"
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">⚡ Thao tác nhanh</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={()=>navigate('product-approval')}>
            <div className="action-icon">✅</div>
            <div className="action-content">
              <h4>Duyệt sản phẩm</h4>
              <p>Kiểm duyệt sản phẩm mới</p>
            </div>
          </button>
          <button className="quick-action-card" onClick={()=>navigate('role-applications')}>
            <div className="action-icon">📝</div>
            <div className="action-content">
              <h4>Đơn xin vai trò</h4>
              <p>Xử lý yêu cầu vai trò</p>
            </div>
          </button>
          <button className="quick-action-card" onClick={()=>navigate('complaints')}>
            <div className="action-icon">⚠️</div>
            <div className="action-content">
              <h4>Khiếu nại</h4>
              <p>Xử lý khiếu nại người dùng</p>
            </div>
          </button>
          <button className="quick-action-card" onClick={()=>navigate('shops')}>
            <div className="action-icon">🏪</div>
            <div className="action-content">
              <h4>Quản lý Shop</h4>
              <p>Xem và quản lý cửa hàng</p>
            </div>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="system-status-section">
        <div className="admin-card">
          <h3 className="section-title">🔧 Trạng thái hệ thống</h3>
          <div className="status-grid">
            <div className="status-item">
              <div className="status-indicator online"></div>
              <div className="status-info">
                <span className="status-label">Backend API</span>
                <span className="status-value online">Hoạt động</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator online"></div>
              <div className="status-info">
                <span className="status-label">Database</span>
                <span className="status-value online">Kết nối</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator online"></div>
              <div className="status-info">
                <span className="status-label">File Storage</span>
                <span className="status-value online">Sẵn sàng</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator online"></div>
              <div className="status-info">
                <span className="status-label">Admin Panel</span>
                <span className="status-value online">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
 
