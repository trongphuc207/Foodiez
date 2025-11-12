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

  // Backend may return either an array ([]) or an object like { data: [] }.
  const orders = Array.isArray(ordersResp) ? ordersResp : (ordersResp?.data || []);
  // Normalize orders/items so UI works regardless of backend naming
  const normalizedOrders = (orders || []).map((o) => {
    const items = o.items || o.orderItems || o.line_items || o.order_items || [];
    const total = o.totalAmount || o.total_amount || o.total || o.total_price || 0;
    const isCancelled = o.isCancelled || o.is_cancelled || false;
    const cancelledAt = o.cancelledAt || o.cancelled_at || null;
    const cancelReason = o.cancelReason || o.cancel_reason || null;
    return { ...o, items, total };
  });

  const formatPrice = (value) => {
    if (value == null || value === '' || isNaN(Number(value))) return '—';
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
    } catch (e) {
      return `${value}đ`;
    }
  };

  // Debug: log payload to inspect assignmentStatus values
  // (temporary, remove after verification)
  console.debug('OrdersList - ordersResp:', ordersResp);

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
      recipientName: order.recipientName || '',
      recipientPhone: order.recipientPhone || order.recipient_phone || '',
      recipientAddress: order.recipientAddress || order.recipient_address || '',
      assignmentStatus: order.assignmentStatus || order.assignment_status || 'pending'
    });
  };

  const closeEditModal = () => setEditingOrder(null);

  const handleEditSave = () => {
    if (!editingOrder) return;
    
    // Validate
    if (!editingOrder.recipientName?.trim()) {
      alert('Vui lòng nhập tên người nhận');
      return;
    }
    if (!editingOrder.recipientPhone?.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }
    if (!editingOrder.recipientAddress?.trim()) {
      alert('Vui lòng nhập địa chỉ');
      return;
    }

    updateDetailsMutation.mutate({
      orderId: editingOrder.id,
      data: {
        recipientName: editingOrder.recipientName,
        recipientPhone: editingOrder.recipientPhone,
        recipientAddress: editingOrder.recipientAddress,
        assignmentStatus: editingOrder.assignmentStatus
      }
    }, {
      onSuccess: () => {
        closeEditModal();
        alert('Đã cập nhật thông tin đơn hàng thành công!');
      }
    });
  };

  // Seller accepts order
  const acceptOrderMutation = useMutation({
    mutationFn: (orderId) => shopOrdersAPI.acceptOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerOrders']);
      alert('Đã chấp nhận đơn hàng thành công!');
    },
    onError: (err) => { 
      console.error(err); 
      alert('Không thể chấp nhận đơn hàng: ' + (err.message || '')); 
    }
  });

  // Seller cancel order (mark as cancelled). Prompt for confirmation and optional reason.
  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }) => shopOrdersAPI.cancelOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerOrders']);
      alert('Đã huỷ đơn hàng thành công');
    },
    onError: (err) => {
      console.error(err);
      alert('Không thể huỷ đơn hàng: ' + (err.message || ''));
    }
  });

  // Delete cancelled order
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId) => shopOrdersAPI.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerOrders']);
      alert('Đã xóa đơn hàng thành công');
    },
    onError: (err) => {
      console.error(err);
      alert('Không thể xóa đơn hàng: ' + (err.message || ''));
    }
  });

  if (!shopId) return <div>Chưa có cửa hàng liên kết với tài khoản seller này.</div>;
  if (isLoading) return <div>Đang tải đơn hàng...</div>;
  if (error) return <div>Lỗi khi tải đơn hàng: {error.message}</div>;

  const handleAccept = (order) => {
    console.debug('handleAccept called for order:', order.id, 'assignmentStatus:', order.assignmentStatus);
    // If already accepted, inform user and suggest Edit modal for changes
    if (order.assignmentStatus === 'accepted') {
      window.alert('Đơn hàng này đang có assignmentStatus = "accepted". Nếu bạn muốn thay đổi trạng thái phân phối, nhấn "Edit" để chỉnh sửa.');
      return;
    }
    if (!window.confirm(`Xác nhận chấp nhận đơn hàng #${order.id}?`)) return;
    // Call acceptOrder API
    acceptOrderMutation.mutate(order.id);
  };

      return (
    <div className="orders-list">
      <div className="section-header">
        <h3>Đơn hàng của cửa hàng</h3>
      </div>      {/* Edit Modal */}
      {editingOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Chỉnh sửa thông tin đơn hàng #{editingOrder.id}</h3>
            
            <div className="form-group">
              <label>Tên người nhận:</label>
              <input
                type="text"
                value={editingOrder.recipientName}
                onChange={(e) => setEditingOrder({...editingOrder, recipientName: e.target.value})}
                placeholder="Nhập tên người nhận"
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại:</label>
              <input
                type="text"
                value={editingOrder.recipientPhone}
                onChange={(e) => setEditingOrder({...editingOrder, recipientPhone: e.target.value})}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ:</label>
              <input
                type="text"
                value={editingOrder.recipientAddress}
                onChange={(e) => setEditingOrder({...editingOrder, recipientAddress: e.target.value})}
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div className="form-group">
              <label>Trạng thái phân phối (assignmentStatus):</label>
              <select
                value={editingOrder.assignmentStatus}
                onChange={(e) => setEditingOrder({...editingOrder, assignmentStatus: e.target.value})}
              >
                <option value="pending">pending</option>
                <option value="assigned">assigned</option>
                <option value="accepted">accepted</option>
                <option value="rejected">rejected</option>
              </select>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={closeEditModal}
                disabled={updateDetailsMutation.isLoading}
              >
                Hủy
              </button>
              <button 
                className="btn-primary"
                onClick={handleEditSave}
                disabled={updateDetailsMutation.isLoading}
              >
                {updateDetailsMutation.isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {normalizedOrders.length === 0 ? (
        <div>Không có đơn hàng.</div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>#ID</th>
              <th>Người nhận</th>
              <th>Tổng</th>
              <th>Trạng thái</th>
              <th>Trạng thái xử lý</th>
              <th>Ngày</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {normalizedOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.recipientName || ('Buyer #' + (o.buyerId || '—'))}</td>
                <td>{formatPrice(o.total || o.totalAmount || o.total_price)}</td>
                <td>
                  { (o.isCancelled || false) ? (
                    <span className="badge badge-danger" title={`Lý do: ${o.cancelReason || 'N/A'}\nNgày: ${o.cancelledAt || ''}`}>
                      Đã huỷ
                    </span>
                  ) : (
                    o.status
                  ) }
                </td>
                <td>{o.assignmentStatus || '—'}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : (o.created_at || '')}</td>
                <td>
                  <button 
                    onClick={() => openEditModal(o)} 
                    disabled={updateDetailsMutation.isLoading || o.isCancelled}
                    className="edit-btn"
                  >
                    ✏️ Edit
                  </button>
                  {' '}
                  <button
                    onClick={() => handleAccept(o)}
                    disabled={acceptOrderMutation.isLoading || o.isCancelled}
                    className="accept-btn"
                  >
                    ✅ Chấp nhận
                  </button>
                  {' '}
                  {/* Seller cancel button: visible when order not cancelled (no other conditions) */}
                  {!o.isCancelled && (
                    <>
                      {' '}
                      <button
                        onClick={() => {
                          if (!window.confirm(`Bạn có chắc chắn muốn huỷ đơn #${o.id}?`)) return;
                          // Optional: prompt for a short reason
                          const reason = window.prompt('Lý do huỷ (tùy chọn):', 'Seller cancelled');
                          cancelOrderMutation.mutate({ orderId: o.id, reason });
                        }}
                        disabled={cancelOrderMutation.isLoading}
                        className="cancel-btn"
                        style={{ marginLeft: '8px', background: '#d9534f', color: '#fff' }}
                      >
                        ❌ Hủy
                      </button>
                    </>
                  )}
                  {' '}
                  {o.isCancelled && (
                    <>
                      <button
                        onClick={() => {
                          if (!window.confirm(`Xác nhận xóa đơn hàng #${o.id}? Đây là hành động không thể quay lại.`)) return;
                          deleteOrderMutation.mutate(o.id);
                        }}
                        disabled={deleteOrderMutation.isLoading}
                        className="delete-btn"
                        style={{ marginLeft: '8px', background: '#d9534f', color: '#fff' }}
                      >
                        🗑️ Xóa
                      </button>
                    </>
                  )}
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
