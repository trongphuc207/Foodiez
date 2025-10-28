import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { sellerAPI } from '../../api/seller';
import { shopAPI } from '../../api/shop';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('today'); // today, week, month, year

  // Fetch shop data
  const { data: shopData } = useQuery({
    queryKey: ['shop', user?.id],
    queryFn: () => shopAPI.getShopBySellerId(user?.id),
    enabled: !!user?.id
  });

  const shopId = shopData?.data?.id;

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats', shopId],
    queryFn: () => sellerAPI.getDashboardStats(shopId),
    enabled: !!shopId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch best selling products
  const { data: bestSellingData } = useQuery({
    queryKey: ['bestSelling', shopId],
    queryFn: () => sellerAPI.getBestSellingProducts(shopId, 5),
    enabled: !!shopId
  });

  // Fetch recent orders
  const { data: ordersData } = useQuery({
    queryKey: ['recentOrders', shopId],
    queryFn: () => sellerAPI.getOrders(shopId),
    enabled: !!shopId
  });

  const stats = statsData?.data || {
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalCustomers: 0
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getOrderStatusText = (status) => {
    const statusMap = {
      'pending': { text: 'Chờ xác nhận', color: '#ffc107' },
      'confirmed': { text: 'Đã xác nhận', color: '#2196f3' },
      'preparing': { text: 'Đang chuẩn bị', color: '#ff9800' },
      'shipping': { text: 'Đang giao', color: '#9c27b0' },
      'delivered': { text: 'Đã giao', color: '#4caf50' },
      'cancelled': { text: 'Đã hủy', color: '#f44336' }
    };
    return statusMap[status] || { text: status, color: '#757575' };
  };

  if (statsLoading) {
    return <div className="dashboard-loading">Đang tải thống kê...</div>;
  }

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <h2>📊 Tổng quan</h2>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'today' ? 'active' : ''}
            onClick={() => setTimeRange('today')}
          >
            Hôm nay
          </button>
          <button 
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Tuần này
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Tháng này
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Doanh thu hôm nay</h3>
            <p className="stat-value">{formatCurrency(stats.todayRevenue)}</p>
            <span className="stat-label">Tổng: {formatCurrency(stats.totalRevenue)}</span>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Đơn hàng hôm nay</h3>
            <p className="stat-value">{stats.todayOrders}</p>
            <span className="stat-label">Tổng: {stats.totalOrders} đơn</span>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Chờ xử lý</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
            <span className="stat-label">Cần xác nhận</span>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon">🍽️</div>
          <div className="stat-info">
            <h3>Sản phẩm</h3>
            <p className="stat-value">{stats.activeProducts}</p>
            <span className="stat-label">Tổng: {stats.totalProducts}</span>
          </div>
        </div>

        <div className="stat-card customers">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Khách hàng</h3>
            <p className="stat-value">{stats.totalCustomers}</p>
            <span className="stat-label">Đã mua hàng</span>
          </div>
        </div>

        <div className="stat-card rating">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Đánh giá</h3>
            <p className="stat-value">{shopData?.data?.rating || 0}</p>
            <span className="stat-label">Trung bình</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-row">
        {/* Order Status Chart */}
        <div className="dashboard-card">
          <h3>📊 Trạng thái đơn hàng</h3>
          <div className="order-status-stats">
            <div className="status-item">
              <div className="status-bar" style={{ width: `${(stats.pendingOrders / stats.totalOrders * 100) || 0}%`, background: '#ffc107' }}></div>
              <span>Chờ xác nhận: {stats.pendingOrders}</span>
            </div>
            <div className="status-item">
              <div className="status-bar" style={{ width: `${(stats.completedOrders / stats.totalOrders * 100) || 0}%`, background: '#4caf50' }}></div>
              <span>Hoàn thành: {stats.completedOrders}</span>
            </div>
            <div className="status-item">
              <div className="status-bar" style={{ width: `${(stats.cancelledOrders / stats.totalOrders * 100) || 0}%`, background: '#f44336' }}></div>
              <span>Đã hủy: {stats.cancelledOrders}</span>
            </div>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="dashboard-card">
          <h3>🔥 Món ăn bán chạy</h3>
          <div className="best-selling-list">
            {bestSellingData?.data?.length > 0 ? (
              bestSellingData.data.map((product, index) => (
                <div key={product.id} className="best-selling-item">
                  <span className="rank">#{index + 1}</span>
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <span className="product-sales">{product.totalSold || 0} đã bán</span>
                  </div>
                  <span className="product-revenue">{formatCurrency(product.revenue || 0)}</span>
                </div>
              ))
            ) : (
              <p className="no-data">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="dashboard-card recent-orders">
        <h3>📋 Đơn hàng gần đây</h3>
        <div className="orders-table">
          {ordersData?.data?.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.data.slice(0, 10).map(order => {
                  const statusInfo = getOrderStatusText(order.status);
                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.buyerName || 'N/A'}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{ background: statusInfo.color }}
                        >
                          {statusInfo.text}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="no-data">Chưa có đơn hàng nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;


