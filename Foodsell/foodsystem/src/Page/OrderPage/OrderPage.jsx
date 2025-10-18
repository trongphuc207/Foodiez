import React, { useState, useEffect } from 'react';
import { customerAPI } from '../../api/customer';
import './OrderPage.css';

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        console.log('Loading customer orders...');
        
        // Kiểm tra authentication trước
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Bạn cần đăng nhập để xem đơn hàng. Vui lòng đăng nhập và thử lại.');
        }
        
        const ordersData = await customerAPI.getOrders();
        console.log('Orders loaded successfully:', ordersData);
        setOrders(ordersData);
        setError(null);
      } catch (err) {
        console.error('Error loading orders:', err);
        
        // Xử lý các loại lỗi khác nhau
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
          setError('Bạn không có quyền xem đơn hàng. Vui lòng kiểm tra tài khoản.');
        } else if (err.message.includes('500') || err.message.includes('Internal server error')) {
          setError('Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
        } else {
          setError(err.message || 'Có lỗi xảy ra khi tải đơn hàng. Vui lòng thử lại.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'paid': 'Đã thanh toán',
      'confirmed': 'Đã xác nhận',
      'preparing': 'Đang chuẩn bị',
      'shipping': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'pending': 'status-pending',
      'paid': 'status-paid',
      'confirmed': 'status-confirmed',
      'preparing': 'status-preparing',
      'shipping': 'status-shipping',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return classMap[status] || 'status-pending';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await customerAPI.cancelOrder(orderId, 'Khách hàng hủy đơn hàng');
      alert('Đơn hàng đã được hủy thành công!');
      // Reload orders
      const ordersData = await customerAPI.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Có lỗi xảy ra khi hủy đơn hàng: ' + error.message);
    }
  };

  const handleReviewOrder = (order) => {
    setReviewingOrder(order);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewingOrder(null);
  };

  const submitReview = async (rating, comment, imageUrl) => {
    try {
      await customerAPI.reviewOrder(reviewingOrder.id, rating, comment, imageUrl);
      alert('Đánh giá đã được gửi thành công!');
      handleCloseReviewModal();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="order-page">
        <div className="container py-4">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-page">
        <div className="container py-4">
          <div className="error-container">
            <h2>Lỗi tải đơn hàng</h2>
            <p>{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="container py-4">
        <div className="order-header">
          <h1>Đơn hàng của tôi</h1>
          <p>Quản lý và theo dõi đơn hàng của bạn</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/'}
            >
              Bắt đầu mua sắm
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Đơn hàng #{order.id}</h3>
                    <p className="order-date">Ngày đặt: {formatDate(order.created_at)}</p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-items">
                    <h4>Sản phẩm:</h4>
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{formatPrice(item.unit_price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Tổng tiền hàng:</span>
                      <span>{formatPrice(order.total_amount)}</span>
                    </div>
                    {order.delivery_fee && (
                      <div className="summary-row">
                        <span>Phí giao hàng:</span>
                        <span>{formatPrice(order.delivery_fee)}</span>
                      </div>
                    )}
                    {order.voucher_discount && (
                      <div className="summary-row discount">
                        <span>Giảm giá voucher:</span>
                        <span>-{formatPrice(order.voucher_discount)}</span>
                      </div>
                    )}
                    <div className="summary-row total">
                      <span><strong>Tổng cộng:</strong></span>
                      <span><strong>{formatPrice(order.total_amount)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  >
                    {selectedOrder === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                  </button>
                  
                      {order.status === 'pending' && (
                        <button 
                          className="btn btn-danger"
                          onClick={() => {
                            if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                              handleCancelOrder(order.id);
                            }
                          }}
                        >
                          Hủy đơn hàng
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <button 
                          className="btn btn-success"
                          onClick={() => handleReviewOrder(order)}
                        >
                          Đánh giá
                        </button>
                      )}
                </div>

                {selectedOrder === order.id && (
                  <div className="order-details-expanded">
                    <div className="delivery-info">
                      <h4>Thông tin giao hàng:</h4>
                      <p><strong>Người nhận:</strong> {order.recipient_name}</p>
                      <p><strong>Số điện thoại:</strong> {order.recipient_phone}</p>
                      <p><strong>Địa chỉ:</strong> {order.address_text}</p>
                    </div>
                    
                    {order.payment_info && (
                      <div className="payment-info">
                        <h4>Thông tin thanh toán:</h4>
                        <p><strong>Phương thức:</strong> {order.payment_info.method}</p>
                        <p><strong>Trạng thái:</strong> {order.payment_info.status}</p>
                      </div>
                    )}

                    {order.tracking_code && (
                      <div className="tracking-info">
                        <h4>Theo dõi đơn hàng:</h4>
                        <p><strong>Mã tracking:</strong> {order.tracking_code}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ReviewModal 
        showModal={showReviewModal}
        order={reviewingOrder}
        onClose={handleCloseReviewModal}
        onSubmit={submitReview}
      />
    </div>
  );
}

// Review Modal Component
function ReviewModal({ showModal, order, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!showModal || !order) return null;

  const handleSubmit = () => {
    onSubmit(rating, comment, imageUrl);
    setRating(5);
    setComment('');
    setImageUrl('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Đánh giá đơn hàng #{order.id}</h3>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="rating-section">
            <label>Đánh giá:</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <div className="comment-section">
            <label>Nhận xét:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              rows={4}
            />
          </div>
          
          <div className="image-section">
            <label>Ảnh (tùy chọn):</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL ảnh..."
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Hủy
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
}