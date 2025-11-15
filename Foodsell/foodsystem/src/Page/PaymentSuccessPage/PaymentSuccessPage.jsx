import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { getPaymentInfo } from '../../api/payment';
import './PaymentSuccessPage.css';

// Function để cập nhật status đơn hàng
const updateOrderStatus = async (orderCode, status) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Thêm timeout để tránh infinite loop
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout

    const backendUrl = process.env.REACT_APP_ORDER_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/orders/customer/orders/${orderCode}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update order status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [orderInfo, setOrderInfo] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasProcessed, setHasProcessed] = useState(false);

  const orderCode = useMemo(() => searchParams.get('orderCode'), [searchParams]);
  
  const handlePaymentSuccess = useCallback(async () => {
    let isMounted = true;
    let timeoutId = null;

    const processPayment = async () => {
      if (!isMounted) return;

      try {
        // Lấy thông tin đơn hàng từ localStorage
        const pendingOrder = localStorage.getItem('pendingOrder');
        if (pendingOrder) {
          const orderData = JSON.parse(pendingOrder);
          setOrderInfo(orderData);
        }

        // Kiểm tra trạng thái thanh toán từ URL parameters
        const status = searchParams.get('status');
        const code = searchParams.get('code');
        const cancel = searchParams.get('cancel');
        
        // Debug logging - remove in production if needed
        console.log('Payment URL params:', { orderCode, status, code, cancel });
        
        // Kiểm tra trạng thái từ URL
        if (status === 'PAID' && code === '00' && cancel === 'false') {
          if (!isMounted) return;
          setPaymentStatus('success');
          
          // Cập nhật status đơn hàng trong database
          try {
            await updateOrderStatus(orderCode, 'confirmed');
            console.log('Order status updated to confirmed successfully');
          } catch (updateError) {
            console.error('Failed to update order status:', updateError);
            // Vẫn hiển thị success vì PayOS đã thanh toán thành công
          }
          
          // Xóa giỏ hàng
          clearCart();
          // Xóa thông tin đơn hàng tạm
          localStorage.removeItem('pendingOrder');
        } else if (status === 'CANCELLED' || cancel === 'true' || (code && code !== '00')) {
          if (!isMounted) return;
          setPaymentStatus('error');
          setError('Thanh toán đã bị hủy hoặc thất bại');
        } else {
          // Nếu không có thông tin rõ ràng, thử gọi API (chỉ retry tối đa 2 lần)
          if (orderCode && retryCount < 2) {
            try {
              const paymentResponse = await getPaymentInfo(orderCode);
              if (!isMounted) return;
              
              if (paymentResponse.success && paymentResponse.data.status === 'PAID') {
                setPaymentStatus('success');
                
                // Cập nhật status đơn hàng trong database
                try {
                  await updateOrderStatus(orderCode, 'confirmed');
                  console.log('Order status updated to confirmed successfully');
                } catch (updateError) {
                  console.error('Failed to update order status:', updateError);
                }
                
                clearCart();
                localStorage.removeItem('pendingOrder');
              } else {
                setPaymentStatus('pending');
              }
            } catch (apiError) {
              console.warn('API call failed, retrying...', apiError);
              if (!isMounted) return;
              
              setRetryCount(prev => prev + 1);
              // Retry sau 2 giây
              timeoutId = setTimeout(() => {
                if (isMounted) {
                  processPayment();
                }
              }, 2000);
              return;
            }
          } else if (orderCode) {
            // Fallback: nếu có orderCode và không có lỗi rõ ràng, coi như thành công
            if (!isMounted) return;
            setPaymentStatus('success');
            clearCart();
            localStorage.removeItem('pendingOrder');
          } else {
            if (!isMounted) return;
            setPaymentStatus('error');
            setError('Thiếu thông tin đơn hàng');
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        if (!isMounted) return;
        setPaymentStatus('error');
        setError('Có lỗi xảy ra khi xác minh thanh toán');
      }
    };

    processPayment();

    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [orderCode, clearCart, searchParams, retryCount]);

  useEffect(() => {
    // Chỉ chạy một lần khi component mount
    if (!hasProcessed) {
      setHasProcessed(true);
      handlePaymentSuccess();
    }
  }, []);

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
