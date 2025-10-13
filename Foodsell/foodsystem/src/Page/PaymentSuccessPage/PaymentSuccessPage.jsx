import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { getPaymentInfo } from '../../api/payment';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [orderInfo, setOrderInfo] = useState(null);
  const [error, setError] = useState(null);

  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Lấy thông tin đơn hàng từ localStorage
        const pendingOrder = localStorage.getItem('pendingOrder');
        if (pendingOrder) {
          const orderData = JSON.parse(pendingOrder);
          setOrderInfo(orderData);
        }

        // Kiểm tra trạng thái thanh toán từ PayOS
        if (orderCode) {
          const paymentResponse = await getPaymentInfo(orderCode);
          if (paymentResponse.success) {
            const paymentData = paymentResponse.data;
            
            if (paymentData.status === 'PAID') {
              setPaymentStatus('success');
              // Xóa giỏ hàng
              clearCart();
              // Xóa thông tin đơn hàng tạm
              localStorage.removeItem('pendingOrder');
            } else {
              setPaymentStatus('pending');
            }
          } else {
            setPaymentStatus('error');
            setError('Không thể xác minh trạng thái thanh toán');
          }
        } else {
          setPaymentStatus('error');
          setError('Thiếu thông tin đơn hàng');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('error');
        setError('Có lỗi xảy ra khi xác minh thanh toán');
      }
    };

    handlePaymentSuccess();
  }, [orderCode, clearCart]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    navigate('/orders');
  };

  if (paymentStatus === 'loading') {
    return (
      <div className="payment-success-page">
        <div className="payment-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <h2>Đang xác minh thanh toán...</h2>
            <p>Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="payment-success-page">
        <div className="payment-container">
          <div className="payment-error">
            <div className="error-icon">❌</div>
            <h2>Thanh toán thất bại</h2>
            <p>{error || 'Có lỗi xảy ra trong quá trình thanh toán'}</p>
            <div className="error-actions">
              <button onClick={() => navigate('/checkout')} className="retry-btn">
                Thử lại
              </button>
              <button onClick={handleContinueShopping} className="continue-btn">
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <div className="payment-success-page">
        <div className="payment-container">
          <div className="payment-pending">
            <div className="pending-icon">⏳</div>
            <h2>Đang xử lý thanh toán</h2>
            <p>Thanh toán của bạn đang được xử lý. Vui lòng đợi trong giây lát.</p>
            <div className="pending-actions">
              <button onClick={handleContinueShopping} className="continue-btn">
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-page">
      <div className="payment-container">
        <div className="payment-success">
          <div className="success-icon">✅</div>
          <h1>Thanh toán thành công!</h1>
          <p className="success-message">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
          </p>

          {orderInfo && (
            <div className="order-summary">
              <h3>Thông tin đơn hàng</h3>
              <div className="order-details">
                <div className="detail-row">
                  <span className="label">Mã đơn hàng:</span>
                  <span className="value">#{orderInfo.orderCode}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Tổng tiền:</span>
                  <span className="value">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(orderInfo.totalAmount)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Phương thức thanh toán:</span>
                  <span className="value">{orderInfo.paymentInfo.methodName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Thời gian:</span>
                  <span className="value">{new Date().toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="success-actions">
            <button onClick={handleViewOrder} className="view-order-btn">
              Xem đơn hàng
            </button>
            <button onClick={handleContinueShopping} className="continue-shopping-btn">
              Tiếp tục mua sắm
            </button>
          </div>

          <div className="next-steps">
            <h4>Bước tiếp theo:</h4>
            <ul>
              <li>Chúng tôi sẽ gửi email xác nhận đơn hàng</li>
              <li>Đơn hàng sẽ được chuẩn bị và giao trong 30-60 phút</li>
              <li>Bạn có thể theo dõi trạng thái đơn hàng trong tài khoản</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
