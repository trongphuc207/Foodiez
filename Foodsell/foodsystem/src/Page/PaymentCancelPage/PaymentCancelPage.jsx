import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cancelPayment } from '../../api/payment';
// import { useCart } from '../../contexts/CartContext';
import './PaymentCancelPage.css';

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const { clearCart } = useCart(); // Không sử dụng nữa
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    const handlePaymentCancel = async () => {
      try {
        // Hủy thanh toán trên PayOS nếu có orderCode
        if (orderCode) {
          await cancelPayment(orderCode, 'User cancelled payment');
        }

        // KHÔNG xóa pendingOrder và KHÔNG xóa giỏ hàng
        // Giữ nguyên để người dùng có thể thử lại hoặc tiếp tục mua sắm
        console.log('Payment cancelled, keeping cart items and pending order for retry');
      } catch (error) {
        console.error('Payment cancellation error:', error);
        // Không cần hiển thị lỗi cho user vì họ đã hủy thanh toán
      }
    };

    handlePaymentCancel();
  }, [orderCode]);

  const handleGoBack = () => {
    // Debug: kiểm tra pendingOrder trước khi chuyển
    const pendingOrder = localStorage.getItem('pendingOrder');
    console.log('PaymentCancelPage: pendingOrder before go back:', pendingOrder);
    if (pendingOrder) {
      const orderData = JSON.parse(pendingOrder);
      console.log('PaymentCancelPage: orderData.cartItems:', orderData.cartItems);
      
      // Khôi phục giỏ hàng trực tiếp từ PaymentCancelPage
      if (orderData.cartItems && orderData.cartItems.length > 0) {
        console.log('PaymentCancelPage: Restoring cart directly...');
        localStorage.setItem('cart', JSON.stringify(orderData.cartItems));
        console.log('PaymentCancelPage: Cart restored to localStorage');
      }
    }
    
    // Chỉ quay về trang chủ, giữ nguyên giỏ hàng và pendingOrder
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
            <br />
            <strong>Giỏ hàng của bạn vẫn được giữ lại</strong> để bạn có thể tiếp tục mua sắm.
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
            <button onClick={handleGoBack} className="go-back-btn">
              Quay trở về
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
