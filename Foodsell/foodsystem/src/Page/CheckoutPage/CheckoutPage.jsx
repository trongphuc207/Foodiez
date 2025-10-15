import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import DeliveryInformationForm from '../../components/CheckoutComponent/DeliveryInformationForm';
import PaymentMethodForm from '../../components/CheckoutComponent/PaymentMethodForm';
import OrderConfirmation from '../../components/CheckoutComponent/OrderConfirmation';
import VoucherSelector from '../../components/VoucherComponent/VoucherSelector';
import { createPaymentLink, createPaymentData } from '../../api/payment';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items: cartItems, getTotalAmount, getShippingFee, getGrandTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryInfo, setDeliveryInfo] = useState({});
  const [paymentInfo, setPaymentInfo] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  const steps = [
    {
      number: 1,
      title: "Thông tin giao hàng",
      subtitle: "Địa chỉ nhận hàng",
      active: currentStep === 1
    },
    {
      number: 2,
      title: "Phương thức thanh toán",
      subtitle: "Chọn cách thanh toán",
      active: currentStep === 2
    },
    {
      number: 3,
      title: "Xác nhận đơn hàng",
      subtitle: "Kiểm tra và hoàn tất",
      active: currentStep === 3
    }
  ];

  const handleDeliverySubmit = (data) => {
    setDeliveryInfo(data);
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (data) => {
    setPaymentInfo(data);
    setCurrentStep(3);
  };

  // Xử lý áp dụng voucher
  const handleVoucherApplied = (voucherInfo) => {
    setAppliedVoucher(voucherInfo);
    setVoucherDiscount(voucherInfo.discountAmount);
  };

  // Xử lý xóa voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherDiscount(0);
  };

  // Tính tổng tiền sau khi áp dụng voucher
  const getFinalTotal = () => {
    const grandTotal = getGrandTotal();
    return Math.max(0, grandTotal - voucherDiscount);
  };

  const handleOrderComplete = async () => {
    setIsProcessingPayment(true);
    try {
      console.log('=== STARTING ORDER PROCESSING ===');
      console.log('Payment method:', paymentInfo.method);
      console.log('Delivery info:', deliveryInfo);
      console.log('Cart items:', cartItems);
      console.log('Grand total:', getGrandTotal());
      
      if (paymentInfo.method === 'PayOS') {
        console.log('=== PROCESSING PAYOS PAYMENT ===');
        
        // Xử lý thanh toán PayOS
        const paymentData = createPaymentData(
          deliveryInfo,
          cartItems,
          getFinalTotal() // Sử dụng tổng tiền sau khi áp dụng voucher
        );

        console.log('Payment data created:', paymentData);

        console.log('Calling createPaymentLink API...');
        const paymentResponse = await createPaymentLink(paymentData);
        console.log('Payment response:', paymentResponse);
        
        if (paymentResponse.success) {
          // Lưu thông tin đơn hàng vào localStorage để xử lý sau
          localStorage.setItem('pendingOrder', JSON.stringify({
            deliveryInfo,
            paymentInfo,
            cartItems,
            orderCode: paymentData.orderCode,
            totalAmount: getGrandTotal()
          }));

          // Tạo đơn hàng tạm trong database với PayOS order code
          try {
            // Gọi API để tạo đơn hàng tạm (pending) với PayOS order code
            // Map cartItems để có productId thay vì id
            const mappedCartItems = cartItems.map(item => ({
              productId: item.id,
              name: item.name || item.productName || 'Sản phẩm',
              quantity: item.quantity || 1,
              price: item.price || item.unitPrice || 0
            }));
            
            const orderData = {
              deliveryInfo,
              paymentInfo,
              cartItems: mappedCartItems,
              payosOrderCode: paymentData.orderCode,
              totalAmount: getFinalTotal(), // Sử dụng tổng tiền sau khi áp dụng voucher
              originalAmount: getGrandTotal(), // Lưu tổng tiền gốc
              voucherDiscount: voucherDiscount,
              appliedVoucher: appliedVoucher,
              status: 'pending_payment'
            };
            
            // Gọi API tạo đơn hàng
            console.log('=== CREATING ORDER IN DATABASE ===');
            console.log('Order data to send:', orderData);
            
            const orderResponse = await fetch('http://localhost:8080/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(orderData)
            });
            
            console.log('Order API response status:', orderResponse.status);
            console.log('Order API response ok:', orderResponse.ok);
            
            if (!orderResponse.ok) {
              const errorText = await orderResponse.text();
              console.error('Order API error response:', errorText);
              throw new Error(`Failed to create order: ${orderResponse.status} - ${errorText}`);
            }
            
            const orderResult = await orderResponse.json();
            console.log('Order created successfully:', orderResult);
            
          } catch (error) {
            console.error('Error creating temporary order:', error);
          }

          // Chuyển hướng đến PayOS
          console.log('=== REDIRECTING TO PAYOS ===');
          console.log('Checkout URL:', paymentResponse.data.checkoutUrl);
          window.location.href = paymentResponse.data.checkoutUrl;
        } else {
          console.error('Payment creation failed:', paymentResponse);
          throw new Error(paymentResponse.message || 'Không thể tạo link thanh toán PayOS');
        }
      } else {
        // Xử lý COD (Cash on Delivery)
        console.log('=== PROCESSING COD PAYMENT ===');
        console.log('Order completed (COD):', { deliveryInfo, paymentInfo, cartItems });
        
        // Hiển thị thông báo thành công
        alert('Đơn hàng đã được đặt thành công! Cảm ơn bạn đã mua hàng.');
        
        // Xóa giỏ hàng
        clearCart();
        
        // Chuyển về trang chủ sau 1 giây
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      console.error('=== ORDER COMPLETION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);
      
      alert(`Có lỗi xảy ra khi xử lý đơn hàng: ${error.message}. Vui lòng thử lại.`);
    } finally {
      console.log('=== ORDER PROCESSING COMPLETED ===');
      setIsProcessingPayment(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DeliveryInformationForm 
            onSubmit={handleDeliverySubmit}
            initialData={deliveryInfo}
          />
        );
      case 2:
        return (
          <div>
            <VoucherSelector
              userId={1} // TODO: Lấy từ authentication context
              orderAmount={getGrandTotal()}
              onVoucherApplied={handleVoucherApplied}
              appliedVoucher={appliedVoucher}
              onRemoveVoucher={handleRemoveVoucher}
            />
            <PaymentMethodForm 
              onSubmit={handlePaymentSubmit}
              onBack={() => setCurrentStep(1)}
              initialData={paymentInfo}
            />
          </div>
        );
      case 3:
        return (
          <OrderConfirmation 
            deliveryInfo={deliveryInfo}
            paymentInfo={paymentInfo}
            cartItems={cartItems}
            totalAmount={getTotalAmount()}
            shippingFee={getShippingFee()}
            grandTotal={getGrandTotal()}
            voucherDiscount={voucherDiscount}
            appliedVoucher={appliedVoucher}
            finalTotal={getFinalTotal()}
            onComplete={handleOrderComplete}
            onBack={() => setCurrentStep(2)}
            isProcessingPayment={isProcessingPayment}
          />
        );
      default:
        return null;
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Giỏ hàng trống</h2>
        <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
        <button onClick={() => window.history.back()}>
          Quay lại mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <h1>Thanh toán</h1>
          <p className="checkout-subtitle">Hoàn tất đơn hàng của bạn</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div key={step.number} className={`step ${step.active ? 'active' : ''}`}>
              <div className={`step-circle ${step.active ? 'active' : ''}`}>
                {step.number}
              </div>
              <div className="step-content">
                <h3 className={`step-title ${step.active ? 'active' : ''}`}>
                  {step.title}
                </h3>
                <p className={`step-subtitle ${step.active ? 'active' : ''}`}>
                  {step.subtitle}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`step-line ${step.active ? 'active' : ''}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="checkout-content">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
