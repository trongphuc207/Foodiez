import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cancelPayment } from '../../api/payment';
import './PaymentCancelPage.css';

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    const handlePaymentCancel = async () => {
      try {
        // Hủy thanh toán trên PayOS nếu có orderCode
        if (orderCode) {
          await cancelPayment(orderCode, 'User cancelled payment');
        }

        // Xóa thông tin đơn hàng tạm
        localStorage.removeItem('pendingOrder');
      } catch (error) {
        console.error('Payment cancellation error:', error);
        // Không cần hiển thị lỗi cho user vì họ đã hủy thanh toán
      }
    };

    handlePaymentCancel();
  }, [orderCode]);

  const handleRetryPayment = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div className="payment-cancel-page">
      <div className="payment-container">
        <div className="payment-cancel">
          <div className="cancel-icon">❌</div>
          <h1>Thanh toán đã bị hủy</h1>
          <p className="cancel-message">
            Bạn đã hủy quá trình thanh toán. Đơn hàng chưa được tạo.
          </p>

          <div className="cancel-reasons">
            <h3>Lý do có thể:</h3>
            <ul>
              <li>Bạn đã đóng cửa sổ thanh toán</li>
              <li>Kết nối mạng không ổn định</li>
              <li>Bạn muốn thay đổi phương thức thanh toán</li>
              <li>Bạn muốn kiểm tra lại thông tin đơn hàng</li>
            </ul>
          </div>

          <div className="cancel-actions">
            <button onClick={handleRetryPayment} className="retry-payment-btn">
              Thử thanh toán lại
            </button>
            <button onClick={handleContinueShopping} className="continue-shopping-btn">
              Tiếp tục mua sắm
            </button>
          </div>

          <div className="help-section">
            <h4>Cần hỗ trợ?</h4>
            <p>
              Nếu bạn gặp vấn đề với thanh toán, vui lòng liên hệ với chúng tôi:
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-label">Hotline:</span>
                <span className="contact-value">1900-1234</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Email:</span>
                <span className="contact-value">support@foodsell.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
