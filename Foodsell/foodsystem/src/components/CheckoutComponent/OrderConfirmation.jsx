import React from 'react';
import './OrderConfirmation.css';

const OrderConfirmation = ({
  deliveryInfo,
  paymentInfo,
  cartItems,
  totalAmount,
  shippingFee,
  grandTotal,
  voucherDiscount,
  appliedVoucher,
  finalTotal,
  onComplete,
  onBack,
  isProcessingPayment
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-header">
        <h2>Xác nhận đơn hàng</h2>
        <p>Vui lòng kiểm tra thông tin trước khi hoàn tất</p>
      </div>

      <div className="confirmation-content">
        {/* Delivery Information */}
        <div className="confirmation-section">
          <h3>📍 Thông tin giao hàng</h3>
          <div className="info-card">
            <div className="info-item">
              <strong>Họ và tên:</strong>
              <span>{deliveryInfo.fullName || 'N/A'}</span>
            </div>
            <div className="info-item">
              <strong>Số điện thoại:</strong>
              <span>{deliveryInfo.phone || 'N/A'}</span>
            </div>
            <div className="info-item">
              <strong>Email:</strong>
              <span>{deliveryInfo.email || 'N/A'}</span>
            </div>
            <div className="info-item">
              <strong>Địa chỉ:</strong>
              <span>
                {deliveryInfo.address || 'N/A'}
                {deliveryInfo.district && `, ${deliveryInfo.district}`}
                {deliveryInfo.city && `, ${deliveryInfo.city}`}
              </span>
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
          <h3>💳 Phương thức thanh toán</h3>
          <div className="info-card">
            <div className="info-item">
              <strong>Phương thức:</strong>
              <span>{paymentInfo.methodName || paymentInfo.method || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="confirmation-section">
          <h3>🛒 Sản phẩm đã chọn</h3>
          <div className="order-items">
            {cartItems && cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <div key={index} className="order-item">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name || item.productName}
                      className="item-image"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                  )}
                  <div className="item-details">
                    <h4 className="item-name">{item.name || item.productName || 'Sản phẩm'}</h4>
                    {item.shopName && (
                      <p className="item-shop">Cửa hàng: {item.shopName}</p>
                    )}
                    <p className="item-quantity">Số lượng: {item.quantity || 1}</p>
                  </div>
                  <div className="item-price">
                    {formatCurrency((item.price || item.unitPrice || 0) * (item.quantity || 1))}
                  </div>
                </div>
              ))
            ) : (
              <p>Không có sản phẩm nào</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="confirmation-section">
          <h3>💰 Tóm tắt đơn hàng</h3>
          <div className="order-summary">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{formatCurrency(shippingFee)}</span>
            </div>
            {voucherDiscount > 0 && appliedVoucher && (
              <div className="summary-row voucher-discount">
                <span>
                  <span className="voucher-icon">🎟️</span>
                  Giảm giá ({appliedVoucher.code || 'Voucher'}):
                </span>
                <span>-{formatCurrency(voucherDiscount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="confirmation-actions">
          <button
            type="button"
            className="back-btn"
            onClick={onBack}
            disabled={isProcessingPayment}
          >
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

