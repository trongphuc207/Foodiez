import React from 'react';
import './OrderConfirmation.css';

const OrderConfirmation = ({ 
  deliveryInfo, 
  paymentInfo, 
  cartItems, 
  totalAmount, 
  shippingFee, 
  grandTotal, 
  voucherDiscount = 0,
  appliedVoucher = null,
  finalTotal = grandTotal,
  onComplete, 
  onBack,
  isProcessingPayment = false
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPaymentMethodName = (methodId) => {
    const methods = {
      'cod': 'Thanh toán khi nhận hàng (COD)',
      'PayOS': 'PayOS'
    };
    return methods[methodId] || methodId;
  };

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-header">
        <h2>Xác nhận đơn hàng</h2>
        <p>Kiểm tra và hoàn tất đơn hàng của bạn</p>
      </div>

      <div className="confirmation-content">
        {/* Delivery Information */}
        <div className="confirmation-section">
          <h3>Thông tin giao hàng</h3>
          <div className="info-card">
            <div className="info-item">
              <strong>Họ và tên:</strong>
              <span>{deliveryInfo.fullName}</span>
            </div>
            <div className="info-item">
              <strong>Số điện thoại:</strong>
              <span>{deliveryInfo.phone}</span>
            </div>
            <div className="info-item">
              <strong>Email:</strong>
              <span>{deliveryInfo.email}</span>
            </div>
            <div className="info-item">
              <strong>Địa chỉ:</strong>
              <span>{deliveryInfo.address}, {deliveryInfo.district}, {deliveryInfo.city}</span>
            </div>
            {deliveryInfo.notes && (
              <div className="info-item">
                <strong>Ghi chú:</strong>
                <span>{deliveryInfo.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="confirmation-section">
          <h3>Phương thức thanh toán</h3>
          <div className="info-card">
            <div className="info-item">
              <strong>Phương thức:</strong>
              <span>{getPaymentMethodName(paymentInfo.method)}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="confirmation-section">
          <h3>Chi tiết đơn hàng</h3>
          <div className="order-items">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="order-item">
                <img 
                  src={item.image || "/placeholder.svg"} 
                  alt={item.name}
                  className="item-image"
                />
                <div className="item-details">
                  <h4 className="item-name">{item.name}</h4>
                  <p className="item-shop">{item.shop}</p>
                  <div className="item-quantity">Số lượng: {item.quantity}</div>
                </div>
                <div className="item-price">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="confirmation-section">
          <h3>Tổng kết đơn hàng</h3>
          <div className="order-summary">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
            {appliedVoucher && voucherDiscount > 0 && (
              <div className="summary-row voucher-discount">
                <span>
                  <span className="voucher-icon">🎫</span>
                  Giảm giá ({appliedVoucher.code}):
                </span>
                <span>-{formatPrice(voucherDiscount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="confirmation-actions">
          <button type="button" className="back-btn" onClick={onBack}>
            Quay lại
          </button>
          <button 
            type="button" 
            className="complete-btn" 
            onClick={onComplete}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? 'Đang xử lý...' : 'Hoàn tất đơn hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
