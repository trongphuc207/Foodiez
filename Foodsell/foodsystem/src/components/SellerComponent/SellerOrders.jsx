import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { sellerAPI } from '../../api/seller';
import { shopAPI } from '../../api/shop';
import './SellerOrders.css';

const SellerOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch shop data
  const { data: shopData } = useQuery({
    queryKey: ['shop', user?.id],
    queryFn: () => shopAPI.getShopBySellerId(user?.id),
    enabled: !!user?.id
  });

  const shopId = shopData?.data?.id;

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['sellerOrders', shopId, statusFilter],
    queryFn: () => sellerAPI.getOrders(shopId, statusFilter === 'all' ? null : statusFilter),
    enabled: !!shopId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, notes }) => 
      sellerAPI.updateOrderStatus(orderId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerOrders']);
      setSelectedOrder(null);
    },
    onError: (error) => {
      alert(`Không thể cập nhật trạng thái: ${error.message}`);
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const getOrderStatusText = (status) => {
    const statusMap = {
      'pending': { text: 'Chờ xử lý', color: '#ffc107' },
      'confirmed': { text: 'Đã xác nhận', color: '#17a2b8' },
      'preparing': { text: 'Đang chuẩn bị', color: '#007bff' },
      'ready': { text: 'Sẵn sàng', color: '#6c757d' },
      'delivering': { text: 'Đang giao', color: '#28a745' },
      'completed': { text: 'Hoàn thành', color: '#28a745' },
      'cancelled': { text: 'Đã hủy', color: '#dc3545' }
    };
    return statusMap[status] || { text: status, color: '#6c757d' };
  };

  const orders = ordersData?.data || [];

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    delivering: orders.filter(o => o.status === 'delivering').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  const handleStatusChange = (orderId, newStatus) => {
    if (window.confirm(`Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng #${orderId}?`)) {
      updateStatusMutation.mutate({
        orderId,
        status: newStatus,
        notes: ''
      });
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await sellerAPI.getOrderById(orderId);
      setSelectedOrder(response.data);
    } catch (error) {
      alert(`Không thể tải chi tiết đơn hàng: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="seller-orders-loading">Đang tải danh sách đơn hàng...</div>;
  }

  return (
    <div className="seller-orders">
      <div className="orders-header">
        <h2>📋 Quản lý đơn hàng</h2>
        <div className="orders-summary">
          <span>Tổng: {orders.length} đơn hàng</span>
        </div>
      </div>

      {/* Status Filters */}
      <div className="status-filters">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'pending', label: 'Chờ xử lý' },
          { id: 'confirmed', label: 'Đã xác nhận' },
          { id: 'preparing', label: 'Đang chuẩn bị' },
          { id: 'delivering', label: 'Đang giao' },
          { id: 'completed', label: 'Hoàn thành' },
          { id: 'cancelled', label: 'Đã hủy' }
        ].map(filter => (
          <button
            key={filter.id}
            className={`filter-btn ${statusFilter === filter.id ? 'active' : ''}`}
            onClick={() => setStatusFilter(filter.id)}
          >
            {filter.label}
            <span className="filter-count">({statusCounts[filter.id] || 0})</span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>Chưa có đơn hàng nào trong danh mục này</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const statusInfo = getOrderStatusText(order.status);
                return (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>{order.buyerName || order.recipientName || 'N/A'}</td>
                    <td>{order.recipientPhone || order.phone || 'N/A'}</td>
                    <td className="address-cell">
                      {order.recipientAddress || order.address || 'N/A'}
                    </td>
                    <td className="amount-cell">
                      {formatCurrency(order.totalAmount || order.totalAmount)}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ background: statusInfo.color }}
                      >
                        {statusInfo.text}
                      </span>
                    </td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td>
                      <div className="order-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetails(order.id)}
                        >
                          👁️ Xem
                        </button>
                        {order.status === 'pending' && (
                          <button
                            className="action-btn confirm-btn"
                            onClick={() => handleStatusChange(order.id, 'confirmed')}
                            disabled={updateStatusMutation.isLoading}
                          >
                            ✓ Xác nhận
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            className="action-btn prepare-btn"
                            onClick={() => handleStatusChange(order.id, 'preparing')}
                            disabled={updateStatusMutation.isLoading}
                          >
                            🍳 Chuẩn bị
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            className="action-btn ready-btn"
                            onClick={() => handleStatusChange(order.id, 'ready')}
                            disabled={updateStatusMutation.isLoading}
                          >
                            ✅ Sẵn sàng
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button
                className="modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-detail-section">
                <h4>Thông tin khách hàng</h4>
                <p><strong>Họ tên:</strong> {selectedOrder.recipientName || selectedOrder.buyerName || 'N/A'}</p>
                <p><strong>Số điện thoại:</strong> {selectedOrder.recipientPhone || 'N/A'}</p>
                <p><strong>Địa chỉ:</strong> {selectedOrder.recipientAddress || 'N/A'}</p>
              </div>
              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                <div className="order-detail-section">
                  <h4>Sản phẩm</h4>
                  <ul>
                    {selectedOrder.orderItems.map((item, index) => (
                      <li key={index}>
                        {item.name} - {item.quantity} x {formatCurrency(item.price)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="order-detail-section">
                <h4>Tổng cộng</h4>
                <p className="total-amount">
                  {formatCurrency(selectedOrder.totalAmount || selectedOrder.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;

