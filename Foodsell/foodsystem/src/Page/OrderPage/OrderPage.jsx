import React, { useState, useEffect } from 'react';
import { customerAPI } from '../../api/customer';
import './OrderPage.css';

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('my-orders'); // 'my-orders' hoặc 'assigned-orders'

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
            console.log('🔍 DEBUG: Orders data received:', ordersData);
            console.log('🔍 DEBUG: Orders type:', typeof ordersData);
            console.log('🔍 DEBUG: Orders length:', ordersData?.length || 'undefined');
            
            if (ordersData && ordersData.length > 0) {
              console.log('🔍 DEBUG: First order:', ordersData[0]);
              console.log('🔍 DEBUG: First order orderItems:', ordersData[0].orderItems);
              console.log('🔍 DEBUG: First order total_amount:', ordersData[0].total_amount);
              console.log('🔍 DEBUG: First order totalAmount:', ordersData[0].totalAmount);
              console.log('🔍 DEBUG: First order created_at:', ordersData[0].created_at);
              
              // Debug từng order item
              if (ordersData[0].orderItems && ordersData[0].orderItems.length > 0) {
                ordersData[0].orderItems.forEach((item, index) => {
                  console.log(`🔍 DEBUG: OrderItem ${index}:`, {
                    productName: item.productName,
                    name: item.name,
                    unitPrice: item.unitPrice,
                    unit_price: item.unit_price,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice
                  });
                });
              }
            }
            
        setOrders(ordersData);
        
        // Load assigned orders nếu user là seller hoặc shipper
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'seller' || userRole === 'shipper') {
          try {
            const assignedResponse = await fetch('http://localhost:8080/api/orders/assignment/my-assigned-orders', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (assignedResponse.ok) {
              const assignedData = await assignedResponse.json();
              console.log('🔍 DEBUG: Assigned orders:', assignedData);
              setAssignedOrders(assignedData.orders || []);
            }
          } catch (error) {
            console.log('No assigned orders or error loading:', error);
          }
        }
        
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
    if (price == null || price === undefined || isNaN(price)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Không có ngày';
    }
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Ngày không hợp lệ';
    }
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

  // Hàm xử lý chấp nhận đơn hàng được phân phối
  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/orders/assignment/${orderId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Đơn hàng đã được chấp nhận thành công!');
        // Reload assigned orders
        const assignedResponse = await fetch('http://localhost:8080/api/orders/assignment/my-assigned-orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (assignedResponse.ok) {
          const assignedData = await assignedResponse.json();
          setAssignedOrders(assignedData.orders || []);
        }
      } else {
        const errorData = await response.json();
        alert('Có lỗi xảy ra: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Có lỗi xảy ra khi chấp nhận đơn hàng: ' + error.message);
    }
  };

  // Hàm xử lý từ chối đơn hàng được phân phối
  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Vui lòng nhập lý do từ chối đơn hàng:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/orders/assignment/${orderId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('Đơn hàng đã được từ chối thành công!');
        // Reload assigned orders
        const assignedResponse = await fetch('http://localhost:8080/api/orders/assignment/my-assigned-orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (assignedResponse.ok) {
          const assignedData = await assignedResponse.json();
          setAssignedOrders(assignedData.orders || []);
        }
      } else {
        const errorData = await response.json();
        alert('Có lỗi xảy ra: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Có lỗi xảy ra khi từ chối đơn hàng: ' + error.message);
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

        {/* Tabs cho Seller/Shipper */}
        {localStorage.getItem('userRole') === 'seller' || localStorage.getItem('userRole') === 'shipper' ? (
          <div className="order-tabs">
            <button 
              className={`tab-button ${activeTab === 'my-orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-orders')}
            >
              📦 Đơn hàng của tôi ({orders.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'assigned-orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('assigned-orders')}
            >
              🎯 Đơn hàng được phân phối ({assignedOrders.length})
            </button>
          </div>
        ) : null}

        {activeTab === 'my-orders' && orders.length === 0 ? (
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
                    <div className="order-number">
                      <span className="order-label">Đơn hàng</span>
                      <span className="order-id">#{order.order_code || order.id}</span>
                    </div>
                    <p className="order-date">
                      <i className="calendar-icon">📅</i>
                      {formatDate(order.createdAt || order.created_at)}
                    </p>
                  </div>
                  <div className="order-status">
                    <div className="status-indicator">
                      <div className={`status-dot ${getStatusClass(order.status)}`}></div>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-items">
                    <h4>Sản phẩm:</h4>
                    {order.orderItems && order.orderItems.length > 0 ? (
                      order.orderItems.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-info">
                            <div className="item-image">
                              <img 
                                src={item.productImage || item.image_url || '/placeholder-product.png'} 
                                alt={item.productName || item.name || 'Sản phẩm'}
                                onError={(e) => {
                                  e.target.src = '/placeholder-product.png';
                                }}
                              />
                            </div>
                            <div className="item-details">
                              <span className="item-name">{item.productName || item.name || 'Không có tên'}</span>
                              <span className="item-quantity">Số lượng: {item.quantity || 1}</span>
                            </div>
                          </div>
                          <div className="item-price-info">
                            <span className="item-price">{formatPrice(item.unitPrice || item.unit_price)}</span>
                            <span className="item-total">Tổng: {formatPrice((item.unitPrice || item.unit_price) * (item.quantity || 1))}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="order-item">
                        <span className="item-name">Không có thông tin sản phẩm</span>
                        <span className="item-quantity">-</span>
                        <span className="item-price">-</span>
                      </div>
                    )}
                  </div>


                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Tổng tiền hàng:</span>
                      <span>{formatPrice(order.totalAmount || order.total_amount)}</span>
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
                      <span><strong>{formatPrice(order.totalAmount || order.total_amount)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <div className="action-buttons">
                    <button 
                      className="btn btn-outline btn-details"
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                    >
                      <i className="icon">👁️</i>
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
                        <i className="icon">❌</i>
                        Hủy đơn hàng
                      </button>
                    )}

                    {order.status === 'delivered' && (
                      <button 
                        className="btn btn-success"
                        onClick={() => handleReviewOrder(order)}
                      >
                        <i className="icon">⭐</i>
                        Đánh giá
                      </button>
                    )}
                  </div>

                  {/* Progress is shown only inside expanded details (Xem chi tiết) */}
                </div>

                {selectedOrder === order.id && (
                  <div className="order-details-expanded">
                    <div className="details-grid">
                      <div className="detail-section delivery-info">
                        <div className="section-header">
                          <i className="section-icon">📍</i>
                          <h4>Thông tin giao hàng</h4>
                        </div>
                        <div className="section-content">
                          <div className="info-item">
                            <span className="info-label">Người nhận:</span>
                            <span className="info-value">{order.recipientName || order.recipient_name || 'Chưa có thông tin'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Số điện thoại:</span>
                            <span className="info-value">{order.recipientPhone || order.recipient_phone || 'Chưa có thông tin'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Địa chỉ:</span>
                            <span className="info-value">{order.addressText || order.address_text || 'Chưa có thông tin'}</span>
                          </div>
                          {order.notes && (
                            <div className="info-item">
                              <span className="info-label">Ghi chú:</span>
                              <span className="info-value">{order.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {order.payment_info && (
                        <div className="detail-section payment-info">
                          <div className="section-header">
                            <i className="section-icon">💳</i>
                            <h4>Thông tin thanh toán</h4>
                          </div>
                          <div className="section-content">
                            <div className="info-item">
                              <span className="info-label">Phương thức:</span>
                              <span className="info-value">{order.payment_info.method}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Trạng thái:</span>
                              <span className="info-value">{order.payment_info.status}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {order.tracking_code && (
                        <div className="detail-section tracking-info">
                          <div className="section-header">
                            <i className="section-icon">🚚</i>
                            <h4>Theo dõi đơn hàng</h4>
                          </div>
                          <div className="section-content">
                            <div className="info-item">
                              <span className="info-label">Mã tracking:</span>
                              <span className="info-value tracking-code">{order.tracking_code}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="detail-section order-timeline">
                        <div className="section-header">
                          <i className="section-icon">⏰</i>
                          <h4>Lịch sử đơn hàng</h4>
                        </div>
                        <div className="section-content">
                          <div className="timeline">
                            <div className="timeline-item completed">
                              <div className="timeline-marker"></div>
                              <div className="timeline-content">
                                <span className="timeline-title">Đơn hàng được tạo</span>
                                <span className="timeline-time">{formatDate(order.created_at)}</span>
                              </div>
                            </div>
                            {order.status === 'confirmed' && (
                              <div className="timeline-item completed">
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                  <span className="timeline-title">Đã xác nhận thanh toán</span>
                                  <span className="timeline-time">Gần đây</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Progress inside expanded details */}
                      {order.status !== 'pending' && (
                        <div className="detail-section order-progress-expanded">
                          <div className="section-header">
                            <i className="section-icon">📈</i>
                            <h4>Tiến trình đơn hàng</h4>
                          </div>
                          <div className="section-content">
                            <div className="shipper-info">
                              <div className="shipper-line"><span className="shipper-label">Shipper:</span> <span className="shipper-value">{order.shipperName || order.shipper_name || (order.shipper && order.shipper.name) || 'Chưa phân công'}</span></div>
                              <div className="shipper-line"><span className="shipper-label">SDT shipper:</span> <span className="shipper-value">{order.shipperPhone || order.shipper_phone || (order.shipper && order.shipper.phone) || 'Không có'}</span></div>
                              <div className="shipper-line"><span className="shipper-label">Dự kiến giao hàng:</span> <span className="shipper-value">{formatDate(order.estimated_delivery_time || order.estimatedDeliveryTime || order.delivery_time || order.expected_delivery_time) || 'Không có'}</span></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Hiển thị đơn hàng được phân phối */}
        {activeTab === 'assigned-orders' && (
          <div className="assigned-orders-section">
            {assignedOrders.length === 0 ? (
              <div className="empty-orders">
                <div className="empty-icon">🎯</div>
                <h3>Chưa có đơn hàng được phân phối</h3>
                <p>Bạn chưa có đơn hàng nào được phân phối. Hãy chờ hệ thống phân phối đơn hàng mới!</p>
              </div>
            ) : (
              <div className="orders-list">
                {assignedOrders.map(order => (
                  <div key={order.id} className="order-card assigned-order">
                    <div className="order-header">
                      <div className="order-info">
                        <div className="order-number">
                          <span className="order-label">Đơn hàng được phân phối</span>
                          <span className="order-id">#{order.order_code || order.id}</span>
                        </div>
                        <p className="order-date">
                          <i className="calendar-icon">📅</i>
                          {formatDate(order.createdAt || order.created_at)}
                        </p>
                      </div>
                      <div className="order-status">
                        <div className="status-indicator">
                          <div className={`status-dot ${getStatusClass(order.status)}`}></div>
                          <span className={`status-badge ${getStatusClass(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="order-items">
                        <h4>Sản phẩm:</h4>
                        {order.orderItems && order.orderItems.length > 0 ? (
                          order.orderItems.map((item, index) => (
                            <div key={index} className="order-item">
                              <div className="item-info">
                                <div className="item-image">
                                  <img 
                                    src={item.productImage || item.image_url || '/placeholder-product.png'} 
                                    alt={item.productName || item.name || 'Sản phẩm'}
                                    onError={(e) => {
                                      e.target.src = '/placeholder-product.png';
                                    }}
                                  />
                                </div>
                                <div className="item-details">
                                  <span className="item-name">{item.productName || item.name || 'Không có tên'}</span>
                                  <span className="item-quantity">Số lượng: {item.quantity}</span>
                                </div>
                                <div className="item-price-info">
                                  <span className="item-price">{formatPrice(item.unitPrice || item.unit_price)}</span>
                                  <span className="item-total">Tổng: {formatPrice((item.unitPrice || item.unit_price) * item.quantity)}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-items">
                            <span className="item-name">Không có sản phẩm</span>
                            <span className="item-price">-</span>
                          </div>
                        )}
                      </div>

                      <div className="order-summary">
                        <div className="summary-row">
                          <span>Tổng tiền hàng:</span>
                          <span>{formatPrice(order.totalAmount || order.total_amount)}</span>
                        </div>
                        <div className="summary-row total">
                          <span><strong>Tổng cộng:</strong></span>
                          <span><strong>{formatPrice(order.totalAmount || order.total_amount)}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="order-actions">
                      <div className="action-buttons">
                        <button 
                          className="btn btn-success"
                          onClick={() => handleAcceptOrder(order.id)}
                        >
                          <i className="icon">✅</i>
                          Chấp nhận
                        </button>
                        
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleRejectOrder(order.id)}
                        >
                          <i className="icon">❌</i>
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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