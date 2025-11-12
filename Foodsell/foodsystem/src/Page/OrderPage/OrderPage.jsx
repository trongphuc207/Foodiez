import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../../api/customer';
import { openChatWithMerchantByOrder } from '../../utils/openChat';
import './OrderPage.css';

function OrderPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('Loading customer orders...');
      
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
        console.log('🔍 DEBUG: Delivery Info:', {
          recipientName: ordersData[0].recipientName,
          recipient_name: ordersData[0].recipient_name,
          recipientPhone: ordersData[0].recipientPhone,
          recipient_phone: ordersData[0].recipient_phone,
          addressText: ordersData[0].addressText,
          address_text: ordersData[0].address_text,
          deliveryFee: ordersData[0].deliveryFee,
          delivery_fee: ordersData[0].delivery_fee
        });
        
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
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
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

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await customerAPI.cancelOrder(orderId, 'Khách hàng hủy đơn hàng');
      // If backend forwarded the cancel request to shop chat, open the chat for the order
      if (res && res.forwardedToChat) {
        // Optionally navigate to the conversation returned by backend
        try {
          if (res.conversationId) {
            // Direct navigation using conversation id
            window.location.href = `/chat?cid=${res.conversationId}`;
            return;
          }
        } catch (e) {
          // fallback to helper which will ensure conversation exists then open
        }
        // Fallback: use helper to create/get conversation and navigate
        await openChatWithMerchantByOrder(orderId);
        return;
      }

      if (res && res.success) {
        alert('Đơn hàng đã được hủy thành công!');
        // Reload orders
        const ordersData = await customerAPI.getOrders();
        setOrders(ordersData);
      } else {
        // Unexpected but handled
        alert('Không thể huỷ đơn hàng: ' + (res && res.message ? res.message : 'Không xác định'));
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      // Map backend error codes to friendly Vietnamese messages
      const cancelWindowExpiredCodes = ['cancel_window_expired'];
      if (error && (cancelWindowExpiredCodes.includes(error.code) || (error.message && error.message.toLowerCase().includes('cancel window expired')))) {
        alert('Không thể hủy sau 3 phút kể từ khi đặt. Vui lòng liên hệ cửa hàng/shipper để được hỗ trợ.');
      } else {
        alert('Có lỗi xảy ra khi hủy đơn hàng: ' + (error && error.message ? error.message : 'Lỗi không xác định'));
      }
    }
  };

  const handleViewDetail = (order) => {
    navigate(`/orders/${order.id}`);
  };

  const handleOpenReviewModal = (order) => {
    setReviewingOrder(order);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setReviewingOrder(null);
    setShowReviewModal(false);
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

  // Map assignmentStatus or order.status to a user-facing Vietnamese label
  const getStatusDisplay = (order) => {
    // If backend sets an explicit cancelled flag, prefer that as display
    if (order.isCancelled || order.is_cancelled) return 'Đã hủy';

    const assign = (order.assignmentStatus || order.assigned_status || order.Assigned_status || '').toString().toLowerCase();
    if (assign) {
      if (assign === 'assigned') return 'Chờ xử lý';
      if (assign === 'accepted' || assign === 'accpeted') return 'Đã sẵn sàng';
      // add other assignment status mappings if needed
    }

    const s = (order.status || order.state || '').toString().toLowerCase();
    if (!s) return '';
    if (s.includes('processing') || s === 'processing') return 'Đang xử lý';
    if (s.includes('completed') || s === 'completed') return 'Đã hoàn thành';
    if (s.includes('cancel') || s === 'cancelled' || s === 'canceled') return 'Đã hủy';
    if (s.includes('pending')) return 'Đang chờ';
    // fallback: capitalize
    return order.status;
  };

  // Normalized key used for css class names (lowercase, no spaces)
  const getStatusKey = (order) => {
    const assign = (order.assignmentStatus || order.assigned_status || order.Assigned_status || '').toString().toLowerCase();
    if (assign) return assign.replace(/\s+/g, '-');
    const s = (order.status || '').toString().toLowerCase();
    return s.replace(/\s+/g, '-');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h2>Đã xảy ra lỗi</h2>
          <p>{error.message}</p>
          <button className="retry-button" onClick={loadOrders}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page bg-gray-50">
      <div className="container py-8">
        <div className="page-header">
          <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
          <p className="text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
        </div>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả đơn hàng
          </button>
          <button
            className={`tab-button ${activeTab === 'processing' ? 'active' : ''}`}
            onClick={() => setActiveTab('processing')}
          >
            Đang xử lý
          </button>
          <button
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Đã hoàn thành
          </button>
          <button
            className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Đã hủy
          </button>
        </div>

        {activeTab === 'all' && (
          <div className="available-orders-section">
            {orders.length === 0 ? (
              <div className="empty-orders">
                <div className="empty-icon">📦</div>
                <h3>Không có đơn hàng</h3>
                <p>Hiện tại không có đơn hàng nào có sẵn.</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div className="order-card" key={order.id}>
                    <div className="order-card-header">
                      <div className="order-card-header-left">
                        <div className="order-card-number">
                          <p className="order-card-number-label">Đơn Hàng</p>
                          <p className="order-card-number-value">#{order.id}</p>
                        </div>
                        <div className="order-card-separator"></div>
                        <div className="order-card-timestamp">📅 {new Date().toLocaleString('vi-VN')}</div>
                      </div>
                      <span className={`order-card-status ${getStatusKey(order)}`}>
                        {getStatusDisplay(order)}
                      </span>
                    </div>

                    <div className="order-card-body">
                      <div>
                        <p className="order-card-products-label">Sản Phẩm</p>
                        <div className="order-card-products">
                          {order.orderItems && order.orderItems.map((item, index) => (
                            <div key={index} className="order-card-product-item">
                                <img 
                                  src={item.productImage || item.image || item.imageUrl || "/placeholder.svg"} 
                                  alt={item.productName || item.name}
                                  className="order-card-product-image"
                                />
                              <p className="order-card-product-name">
                                {item.productName || item.name}
                              </p>
                              <p className="order-card-product-quantity">
                                SL: {item.quantity}
                              </p>
                              <p className="order-card-product-price">
                                Giá: {(item.unitPrice || item.unit_price).toLocaleString('vi-VN')}đ
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="order-card-footer">
                        <div className="order-card-total">
                          <span className="order-card-total-label">Tổng cộng:</span>
                          <span className="order-card-total-value">
                            {(order.totalAmount || order.total_amount).toLocaleString('vi-VN')}đ
                          </span>
                        </div>

                        <div className="order-card-actions">
                          <button 
                            className="order-card-button order-card-button-primary"
                            onClick={() => handleViewDetail(order)}
                          >
                            Xem chi tiết →
                          </button>
                          <button 
                            className="order-card-button order-card-button-danger"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            ❌ Hủy đơn hàng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customer order lists for different statuses */}
        {(activeTab === 'processing' || activeTab === 'completed' || activeTab === 'cancelled') && (
          <div className="filtered-orders-section">
            {/*
              For the "processing" tab we want to show orders whose assignment status is 'accepted'.
              We check common field names used across the app: assignmentStatus and assignment_status.
            */}
            {(() => {
              const filtered = orders.filter(order => {
                if (activeTab === 'processing') {
                  const assign = (order.assignmentStatus || order.assignment_status || '').toString().toLowerCase();
                  return assign === 'accepted';
                }
                if (activeTab === 'completed') return (order.status || '').toString().toUpperCase() === 'COMPLETED';
                // Include orders explicitly marked cancelled by flag in addition to status === 'CANCELLED'
                return (order.status || '').toString().toUpperCase() === 'CANCELLED' || !!(order.isCancelled || order.is_cancelled);
              });

              if (filtered.length === 0) {
                return (
                  <div className="empty-orders">
                    <div className="empty-icon">📦</div>
                    <h3>Không có đơn hàng</h3>
                    <p>Không có đơn hàng nào trong trạng thái này.</p>
                  </div>
                );
              }

              return (
                <div className="orders-list">
                  {filtered.map(order => (
                    <div className="order-card" key={order.id}>
                      <div className="order-card-header">
                        <div className="order-card-header-left">
                          <div className="order-card-number">
                            <p className="order-card-number-label">Đơn Hàng</p>
                            <p className="order-card-number-value">#{order.id}</p>
                          </div>
                          <div className="order-card-separator"></div>
                          <div className="order-card-timestamp">📅 {new Date().toLocaleString('vi-VN')}</div>
                        </div>
                        <span className={`order-card-status ${getStatusKey(order)}`}>
                          {getStatusDisplay(order)}
                        </span>
                      </div>

                      <div className="order-card-body">
                        <div>
                          <p className="order-card-products-label">Sản Phẩm</p>
                          <div className="order-card-products">
                            {order.orderItems && order.orderItems.map((item, index) => (
                              <div key={index} className="order-card-product-item">
                                <img 
                                  src={item.productImage || item.image || item.imageUrl || "/placeholder.svg"} 
                                  alt={item.productName || item.name}
                                  className="order-card-product-image"
                                />
                                <p className="order-card-product-name">
                                  {item.productName || item.name}
                                </p>
                                <p className="order-card-product-quantity">
                                  SL: {item.quantity}
                                </p>
                                <p className="order-card-product-price">
                                  Giá: {(item.unitPrice || item.unit_price).toLocaleString('vi-VN')}đ
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="order-card-footer">
                          <div className="order-card-total">
                            <span className="order-card-total-label">Tổng cộng:</span>
                            <span className="order-card-total-value">
                              {(order.totalAmount || order.total_amount).toLocaleString('vi-VN')}đ
                            </span>
                          </div>

                          <div className="order-card-actions">
                            <button 
                              className="order-card-button order-card-button-primary"
                              onClick={() => handleViewDetail(order)}
                            >
                              Xem chi tiết →
                            </button>
                            {/* Only show cancel button when order status is PROCESSING (server-driven) */}
                            {((order.status || '').toString().toUpperCase() === 'PROCESSING') && (
                              <button 
                                className="order-card-button order-card-button-danger"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                ❌ Hủy đơn hàng
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Review Modal */}
        <ReviewModal 
          showModal={showReviewModal}
          order={reviewingOrder}
          onClose={handleCloseReviewModal}
          onSubmit={submitReview}
        />

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="order-detail-status">
                  <h4>Trạng thái:</h4>
                  <span className={`status-badge ${getStatusKey(selectedOrder)}`}>
                    {getStatusDisplay(selectedOrder)}
                  </span>
                </div>

                <div className="order-detail-delivery-info">
                  <h4>📍 Thông tin giao hàng:</h4>
                  <div className="delivery-info-content">
                    <div className="info-item">
                      <span className="info-label">Người nhận:</span>
                      <span className="info-value">{selectedOrder.recipientName || selectedOrder.recipient_name || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Số điện thoại:</span>
                      <span className="info-value">{selectedOrder.recipientPhone || selectedOrder.recipient_phone || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Địa chỉ:</span>
                      <span className="info-value">{selectedOrder.addressText || selectedOrder.address_text || 'Chưa có thông tin'}</span>
                    </div>
                    {selectedOrder.notes && (
                      <div className="info-item">
                        <span className="info-label">Ghi chú:</span>
                        <span className="info-value">{selectedOrder.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-detail-products">
                  <h4>Sản phẩm:</h4>
                  {selectedOrder.orderItems && selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="order-detail-product-item">
                      <img 
                        src={item.productImage || item.image_url || "/placeholder.svg"} 
                        alt={item.productName || item.name}
                        className="order-detail-product-image"
                      />
                      <div className="order-detail-product-info">
                        <p className="product-name">{item.productName || item.name}</p>
                        <p className="product-quantity">Số lượng: {item.quantity}</p>
                        <p className="product-price">{(item.unitPrice || item.unit_price).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-detail-summary">
                  <h4>Tổng quan:</h4>
                  <div className="summary-item">
                    <span>Tổng tiền hàng:</span>
                    <span>{(selectedOrder.totalAmount || selectedOrder.total_amount).toLocaleString('vi-VN')}đ</span>
                  </div>
                  {selectedOrder.delivery_fee && (
                    <div className="summary-item">
                      <span>Phí giao hàng:</span>
                      <span>{selectedOrder.delivery_fee.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="summary-item total">
                    <span>Tổng thanh toán:</span>
                    <span>{(selectedOrder.totalAmount || selectedOrder.total_amount).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Đóng
                </button>
                {selectedOrder.status === 'PROCESSING' && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      handleCancelOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
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

export default OrderPage;