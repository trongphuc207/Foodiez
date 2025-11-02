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
      recipientName: order.recipientName || '',
      recipientPhone: order.recipientPhone || order.recipient_phone || '',
      recipientAddress: order.recipientAddress || order.recipient_address || ''
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
        recipientAddress: editingOrder.recipientAddress
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

  if (!shopId) return <div>Chưa có cửa hàng liên kết với tài khoản seller này.</div>;
  if (isLoading) return <div>Đang tải đơn hàng...</div>;
  if (error) return <div>Lỗi khi tải đơn hàng: {error.message}</div>;

  const handleAccept = (order) => {
    if (!window.confirm(`Xác nhận chấp nhận đơn hàng #${order.id}?`)) return;
    // Call acceptOrder API
    acceptOrderMutation.mutate(order.id);
  };

      return (
    <div className="orders-list">
      <div className="section-header">
        <h3>Đơn hàng của cửa hàng</h3>
      </div>
      <table>
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
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.recipientName}</td>
              <td>{order.totalAmount}</td>
              <td>{order.status}</td>
              <td>{order.assignmentStatus || 'Chưa xử lý'}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleAccept(order)}>Chấp nhận</button>
                <button onClick={() => openEditModal(order)}>Sửa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>      {/* Edit Modal */}
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
              <th>Trạng thái xử lý</th>
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
                <td>{o.assignmentStatus || '—'}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
                <td>
                  <button 
                    onClick={() => openEditModal(o)} 
                    disabled={updateDetailsMutation.isLoading}
                    className="edit-btn"
                  >
                    ✏️ Edit
                  </button>
                  {' '}
                  <button 
                    onClick={() => handleAccept(o)} 
                    disabled={acceptOrderMutation.isLoading || o.assignmentStatus === 'accepted'}
                    className="accept-btn"
                  >
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
