import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { sellerAPI } from '../../api/seller';
import { shopAPI } from '../../api/shop';
import './SellerRevenue.css';

const SellerRevenue = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch shop data
  const { data: shopData } = useQuery({
    queryKey: ['shop', user?.id],
    queryFn: () => shopAPI.getShopBySellerId(user?.id),
    enabled: !!user?.id
  });

  const shopId = shopData?.data?.id;

  // Fetch revenue data
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue', shopId, timeRange],
    queryFn: () => {
      if (timeRange === 'week') {
        return sellerAPI.getDailyRevenue(shopId, 7);
      } else if (timeRange === 'month') {
        return sellerAPI.getDailyRevenue(shopId, 30);
      } else {
        return sellerAPI.getMonthlyRevenue(shopId, selectedYear);
      }
    },
    enabled: !!shopId
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const revenue = revenueData?.data || {};
  const totalRevenue = revenue.totalRevenue || 0;
  const revenueList = revenue.revenueList || [];

  if (isLoading) {
    return <div className="revenue-loading">Đang tải dữ liệu doanh thu...</div>;
  }

  return (
    <div className="seller-revenue">
      <div className="revenue-header">
        <h2>💰 Quản lý doanh thu</h2>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            7 ngày
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            30 ngày
          </button>
          <button 
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Năm {selectedYear}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="revenue-summary">
        <div className="summary-card total">
          <div className="card-icon">💵</div>
          <div className="card-info">
            <h3>Tổng doanh thu</h3>
            <p className="card-value">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <div className="summary-card avg">
          <div className="card-icon">📊</div>
          <div className="card-info">
            <h3>Trung bình {timeRange === 'year' ? '/tháng' : '/ngày'}</h3>
            <p className="card-value">
              {formatCurrency(revenueList.length > 0 ? totalRevenue / revenueList.length : 0)}
            </p>
          </div>
        </div>
        <div className="summary-card orders">
          <div className="card-icon">📦</div>
          <div className="card-info">
            <h3>Tổng đơn hàng</h3>
            <p className="card-value">{revenue.totalOrders || 0}</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="revenue-chart-card">
        <h3>📈 Biểu đồ doanh thu</h3>
        <div className="revenue-chart">
          {revenueList.length > 0 ? (
            revenueList.map((item, index) => {
              const maxRevenue = Math.max(...revenueList.map(r => r.revenue || 0));
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={index} className="chart-bar-container">
                  <div 
                    className="chart-bar"
                    style={{ height: `${height}%` }}
                    title={formatCurrency(item.revenue)}
                  >
                    <span className="bar-value">{formatCurrency(item.revenue)}</span>
                  </div>
                  <span className="bar-label">{item.date || item.month}</span>
                </div>
              );
            })
          ) : (
            <p className="no-data">Chưa có dữ liệu doanh thu</p>
          )}
        </div>
      </div>

      {/* Revenue Table */}
      <div className="revenue-table-card">
        <h3>📋 Chi tiết doanh thu</h3>
        <div className="revenue-table">
          {revenueList.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>{timeRange === 'year' ? 'Tháng' : 'Ngày'}</th>
                  <th>Số đơn</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {revenueList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date || item.month}</td>
                    <td>{item.orderCount || 0}</td>
                    <td className="revenue-amount">{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerRevenue;

