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
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Fetch shop data
  const { data: shopData } = useQuery({
    queryKey: ['shop', user?.id],
    queryFn: () => shopAPI.getShopBySellerId(user?.id),
    enabled: !!user?.id
  });

  const shopId = shopData?.data?.id;

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', shopId, statusFilter],
    queryFn: () => sellerAPI.getOrders(shopId, statusFilter === 'all' ? null : statusFilter),
    enabled: !!shopId,
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, notes }) => sellerAPI.updateOrderStatus(orderId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      alert('✅ Cập nhật trạng thái đơn hàng thành công!');
    },
    onError: (error) => {
      alert('❌ Lỗi khi cập nhật trạng thái: ' + error.message);
    }
  });

  const handleStatusUpdate = (orderId, newStatus) => {
    if (window.confirm(`Bạn có chắc muốn chuyển trạng thái đơn hàng sang "${getOrderStatusText(newStatus).text}"?`)) {
      updateStatusMutation.mutate({ orderId, status: newStatus, notes: '' });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getOrderStatusText = (status) => {
    const statusMap = {
      'pending': { text: 'Chờ xác nhận', color: '#ffc107', actions: ['confirmed', 'cancelled'] },
      'confirmed': { text: 'Đã xác nhận', color: '#2196f3', actions: ['preparing'] },
      'preparing': { text: 'Đang chuẩn bị', color: '#ff9800', actions: ['shipping'] },
      'shipping': { text: 'Đang giao', color: '#9c27b0', actions: ['delivered'] },
      'delivered': { text: 'Đã giao', color: '#4caf50', actions: [] },
      'cancelled': { text: 'Đã hủy', color: '#f44336', actions: [] }
    };
    return statusMap[status] || { text: status, color: '#757575', actions: [] };
  };

  const getActionButtonText = (action) => {
    const actionMap = {
      'confirmed': '✓ Xác nhận',
      'preparing': '👨‍🍳 Chuẩn bị',
      'shipping': '🚚 Giao hàng',
      'delivered': '✅ Hoàn thành',
      'cancelled': '❌ Hủy đơn'
    };
    return actionMap[action] || action;
  };

  const statusTabs = [
    { key: 'all', label: 'Tất cả', count: ordersData?.data?.length || 0 },
    { key: 'pending', label: 'Chờ xác nhận', count: ordersData?.data?.filter(o => o.status === 'pending').length || 0 },
    { key: 'confirmed', label: 'Đã xác nhận', count: ordersData?.data?.filter(o => o.status === 'confirmed').length || 0 },
    { key: 'preparing', label: 'Đang chuẩn bị', count: ordersData?.data?.filter(o => o.status === 'preparing').length || 0 },
    { key: 'shipping', label: 'Đang giao', count: ordersData?.data?.filter(o => o.status === 'shipping').length || 0 },
    { key: 'delivered', label: 'Đã giao', count: ordersData?.data?.filter(o => o.status === 'delivered').length || 0 },
    { key: 'cancelled', label: 'Đã hủy', count: ordersData?.data?.filter(o => o.status === 'cancelled').length || 0 }
  ];

  const filteredOrders = ordersData?.data?.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  ) || [];

  if (isLoading) {
    return <div className="orders-loading">Đang tải danh sách đơn hàng...</div>;
  }

  return (
    <div className="seller-orders">
      <div className="orders-header">
        <h2>📦 Quản lý đơn hàng</h2>
        <div className="orders-summary">
          <span>Tổng: {ordersData?.data?.length || 0} đơn</span>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            className={`status-tab ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
            {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const statusInfo = getOrderStatusText(order.status);
            return (
              <div key={order.id} className="order-card">
                <div className="order-header-row">
                  <div className="order-id">
                    <span className="order-label">Mã đơn:</span>
                    <span className="order-number">#{order.id}</span>
                  </div>
                  <div className="order-time">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>

                <div className="order-customer">
                  <div className="customer-info">
                    <span className="customer-icon">👤</span>
                    <div>
                      <div className="customer-name">{order.recipientName || order.buyerName || 'N/A'}</div>
                      <div className="customer-phone">{order.recipientPhone || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="delivery-address">
                    <span className="address-icon">📍</span>
                    <span>{order.addressText || order.address || 'N/A'}</span>
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <span className="item-name">{item.productName || item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{formatCurrency(item.unitPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {order.notes && (
                  <div className="order-notes">
                    <span className="notes-icon">📝</span>
                    <span>Ghi chú: {order.notes}</span>
                  </div>
                )}

                <div className="order-footer">
                  <div className="order-total">
                    <span>Tổng tiền:</span>
                    <span className="total-amount">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="order-status-badge" style={{ background: statusInfo.color }}>
                    {statusInfo.text}
                  </div>
                </div>

                {/* Action Buttons */}
                {statusInfo.actions.length > 0 && (
                  <div className="order-actions">
                    {statusInfo.actions.map(action => (
                      <button
                        key={action}
                        className={`action-btn action-${action}`}
                        onClick={() => handleStatusUpdate(order.id, action)}
                        disabled={updateStatusMutation.isPending}
                      >
                        {getActionButtonText(action)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-orders">
            <p>📭 Chưa có đơn hàng nào {statusFilter !== 'all' && `ở trạng thái "${statusTabs.find(t => t.key === statusFilter)?.label}"`}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;


