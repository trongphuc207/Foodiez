import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { shopAPI } from '../../api/shop';
import shopOrdersAPI from '../../api/shop-orders';
import './OrdersList.css';

const OrdersList = ({ status }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [shopId, setShopId] = useState(null);

  // Load shop for current seller
  const { data: shopData } = useQuery({
    queryKey: ['shop', user?.id],
    queryFn: () => shopAPI.getShopBySellerId(user?.id),
    enabled: !!user?.id,
    retry: 1
  });

  useEffect(() => {
    if (shopData && shopData.data) setShopId(shopData.data.id);
  }, [shopData]);

  const { data: ordersResp, isLoading, error } = useQuery({
    queryKey: ['sellerOrders', shopId, status],
    queryFn: () => shopOrdersAPI.getSellerOrders(shopId, status),
    enabled: !!shopId,
    refetchOnWindowFocus: false,
  });

  const orders = ordersResp?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }) => shopOrdersAPI.updateOrderStatus(orderId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerOrders']);
      alert('Cập nhật trạng thái thành công');
    },
    onError: (err) => {
      console.error(err);
      alert('Không thể cập nhật trạng thái: ' + (err.message || ''));
    }
  });

  const handleUpdateStatus = (order) => {
    // simple demo: toggle pending -> confirmed -> completed
    const next = order.status === 'pending' ? 'confirmed' : order.status === 'confirmed' ? 'completed' : 'completed';
    if (!window.confirm(`Update order #${order.id} status to ${next}?`)) return;
    updateStatusMutation.mutate({ orderId: order.id, newStatus: next });
  };

  if (!shopId) {
    return <div>Chưa có cửa hàng liên kết với tài khoản seller này.</div>;
  }

  if (isLoading) return <div>Đang tải đơn hàng...</div>;
  if (error) return <div>Lỗi khi tải đơn hàng: {error.message}</div>;

  return (
    <div className="orders-list">
      <h3>Đơn hàng của cửa hàng</h3>
      {orders.length === 0 ? (
        <div>Không có đơn hàng.</div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>#ID</th>
              <th>Người mua</th>
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
                  <button onClick={() => handleUpdateStatus(o)} disabled={updateStatusMutation.isLoading}>
                    Cập nhật trạng thái
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
