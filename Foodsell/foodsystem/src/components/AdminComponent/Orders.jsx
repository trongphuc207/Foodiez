import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await adminAPI.getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError(err.message);
      console.error('Lỗi tải đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const assignOrderToSeller = async (orderId, sellerId) => {
    try {
      await adminAPI.assignOrderToSeller(orderId, sellerId);
      alert(`Đã phân phối đơn hàng ${orderId} cho seller ${sellerId}`);
      loadOrders(); // Reload danh sách
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const assignOrderToShipper = async (orderId, shipperId) => {
    try {
      await adminAPI.assignOrderToShipper(orderId, shipperId);
      alert(`Đã phân phối đơn hàng ${orderId} cho shipper ${shipperId}`);
      loadOrders(); // Reload danh sách
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const viewOrderHistory = async (orderId) => {
    try {
      const history = await adminAPI.getOrderHistory(orderId);
      alert(`Lịch sử đơn hàng ${orderId}:\n${JSON.stringify(history, null, 2)}`);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3">Đang tải đơn hàng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Lỗi!</h4>
        <p>{error}</p>
        <hr />
        <button className="btn btn-outline-danger" onClick={loadOrders}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý đơn hàng</h2>
        <button className="btn btn-outline-primary" onClick={loadOrders}>
          <i className="fas fa-sync-alt me-2"></i>Làm mới
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">Chưa có đơn hàng nào!</h4>
          <p>Hiện tại chưa có đơn hàng nào trong hệ thống.</p>
          <hr />
          <p className="mb-0">Hãy tạo đơn hàng mới hoặc kiểm tra lại sau.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Mã đơn</th>
                <th>Người đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>#{order.id}</strong>
                  </td>
                  <td>{order.customerName || 'N/A'}</td>
                  <td>
                    <span className="text-success fw-bold">
                      {order.total ? order.total.toLocaleString() : 0} đ
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      order.status === 'pending' ? 'bg-warning' :
                      order.status === 'confirmed' ? 'bg-info' :
                      order.status === 'shipped' ? 'bg-primary' :
                      order.status === 'delivered' ? 'bg-success' :
                      order.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {order.status || 'N/A'}
                    </span>
                  </td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="btn-group" role="group">
                      <button
                        onClick={() => assignOrderToSeller(order.id, 1)}
                        className="btn btn-primary btn-sm me-1"
                        title="Phân phối cho Seller"
                      >
                        <i className="fas fa-user-tie me-1"></i>Seller
                      </button>
                      <button
                        onClick={() => assignOrderToShipper(order.id, 1)}
                        className="btn btn-success btn-sm me-1"
                        title="Phân phối cho Shipper"
                      >
                        <i className="fas fa-truck me-1"></i>Shipper
                      </button>
                      <button
                        onClick={() => viewOrderHistory(order.id)}
                        className="btn btn-info btn-sm"
                        title="Xem lịch sử"
                      >
                        <i className="fas fa-history me-1"></i>Lịch sử
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <div className="alert alert-light border" role="alert">
          <h5 className="alert-heading">📋 Hướng dẫn sử dụng:</h5>
          <ul className="mb-0">
            <li><strong>Seller:</strong> Phân phối đơn hàng cho người bán</li>
            <li><strong>Shipper:</strong> Phân phối đơn hàng cho người giao hàng</li>
            <li><strong>Lịch sử:</strong> Xem chi tiết lịch sử đơn hàng</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
