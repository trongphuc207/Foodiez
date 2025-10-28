import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { sellerAPI } from '../../api/seller';
import { shopAPI } from '../../api/shop';
import './SellerCustomers.css';

const SellerCustomers = () => {
  const { user } = useAuth();

  // Fetch shop data
  const { data: shopData } = useQuery({
    queryKey: ['shop', user?.id],
    queryFn: () => shopAPI.getShopBySellerId(user?.id),
    enabled: !!user?.id
  });

  const shopId = shopData?.data?.id;

  // Fetch customers
  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', shopId],
    queryFn: () => sellerAPI.getCustomers(shopId),
    enabled: !!shopId
  });

  // Fetch top customers
  const { data: topCustomersData } = useQuery({
    queryKey: ['topCustomers', shopId],
    queryFn: () => sellerAPI.getTopCustomers(shopId, 10),
    enabled: !!shopId
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const customers = customersData?.data || [];
  const topCustomers = topCustomersData?.data || [];

  if (isLoading) {
    return <div className="customers-loading">Đang tải danh sách khách hàng...</div>;
  }

  return (
    <div className="seller-customers">
      <div className="customers-header">
        <h2>👥 Quản lý khách hàng</h2>
        <div className="customers-summary">
          <span>Tổng: {customers.length} khách hàng</span>
        </div>
      </div>

      {/* Top Customers */}
      {topCustomers.length > 0 && (
        <div className="top-customers-card">
          <h3>🏆 Top khách hàng thân thiết</h3>
          <div className="top-customers-list">
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className="top-customer-item">
                <div className="customer-rank">#{index + 1}</div>
                <div className="customer-avatar">
                  {customer.fullName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="customer-details">
                  <div className="customer-name">{customer.fullName || 'N/A'}</div>
                  <div className="customer-stats">
                    <span>{customer.totalOrders || 0} đơn hàng</span>
                    <span className="customer-revenue">{formatCurrency(customer.totalSpent || 0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Customers Table */}
      <div className="customers-table-card">
        <h3>📋 Danh sách khách hàng</h3>
        <div className="customers-table">
          {customers.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Email / SĐT</th>
                  <th>Số đơn hàng</th>
                  <th>Tổng chi tiêu</th>
                  <th>Lần mua cuối</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar-small">
                          {customer.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span>{customer.fullName || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        {customer.email && <div>{customer.email}</div>}
                        {customer.phone && <div>{customer.phone}</div>}
                      </div>
                    </td>
                    <td>
                      <span className="order-count">{customer.totalOrders || 0}</span>
                    </td>
                    <td>
                      <span className="total-spent">{formatCurrency(customer.totalSpent || 0)}</span>
                    </td>
                    <td>
                      {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">Chưa có khách hàng nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerCustomers;


