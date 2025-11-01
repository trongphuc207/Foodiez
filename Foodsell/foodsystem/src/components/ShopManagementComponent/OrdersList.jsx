import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import shopOrdersAPI from '../../api/shop-orders';
import './OrdersList.css';

// Simpler OrdersList: sellers operate on existing orders only (accept/limited edit)
const OrdersList = ({ shopId, status }) => {
  const queryClient = useQueryClient();

  const { data: ordersResp, isLoading, error } = useQuery({
    queryKey: ['sellerOrders', shopId, status],
    queryFn: () => shopOrdersAPI.getSellerOrders(shopId, status),
    enabled: !!shopId,
    refetchOnWindowFocus: false,
  });

  const orders = ordersResp?.data || [];

  // Seller updates order details (optional small edits)
  const updateDetailsMutation = useMutation({
    mutationFn: ({ orderId, data }) => shopOrdersAPI.updateOrderDetails(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerOrders']);
    },
    onError: (err) => { console.error(err); alert('Không thể cập nhật đơn: ' + (err.message || '')); }
  });

  const [editingOrder, setEditingOrder] = useState(null);

  const openEditModal = (order) => {
    setEditingOrder({
      id: order.id,
      recipientPhone: order.recipientPhone || order.recipient_phone || '',
      recipientAddress: order.recipientAddress || order.recipient_address || ''
    });
  };

  const closeEditModal = () => setEditingOrder(null);

  const handleEditSave = () => {
    if (!editingOrder) return;
    updateDetailsMutation.mutate({ orderId: editingOrder.id, data: { recipientPhone: editingOrder.recipientPhone, recipientAddress: editingOrder.recipientAddress } }, {
      onSuccess: () => closeEditModal()
    });
  };

  // Seller accepts and forwards order to shipper by updating status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }) => shopOrdersAPI.updateOrderStatus(orderId, newStatus),
    onSuccess: () => queryClient.invalidateQueries(['sellerOrders']),
    onError: (err) => { console.error(err); alert('Không thể cập nhật trạng thái: ' + (err.message || '')); }
  });

  if (!shopId) return <div>Chưa có cửa hàng liên kết với tài khoản seller này.</div>;
  if (isLoading) return <div>Đang tải đơn hàng...</div>;
  if (error) return <div>Lỗi khi tải đơn hàng: {error.message}</div>;

  const handleAccept = (order) => {
    if (!window.confirm(`Chấp nhận đơn #${order.id} và chuyển cho shipper?`)) return;
    // Update status to 'confirmed' as requested
    updateStatusMutation.mutate({ orderId: order.id, newStatus: 'confirmed' });
  };

  return (
    <div className="orders-list">
      <div className="section-header">
        <h3>Đơn hàng của cửa hàng</h3>
      </div>

      {orders.length === 0 ? (
        <div>Không có đơn hàng.</div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>#ID</th>
              <th>Người nhận</th>
              <th>Tổng</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.recipientName || ('Buyer #' + (o.buyerId || '—'))}</td>
                <td>{o.totalAmount ? o.totalAmount : o.total_price || '—'}</td>
                <td>{o.status}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
                <td>
                  <button onClick={() => openEditModal(o)} disabled={updateDetailsMutation.isLoading}>
                    ✏️ Edit
                  </button>
                  {' '}
                  <button onClick={() => handleAccept(o)} disabled={updateStatusMutation.isLoading || o.status === 'to_shipper'}>
                    ✅ Chấp nhận
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersList;
