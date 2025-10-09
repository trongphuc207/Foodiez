import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import DeliveryInformationForm from '../../components/CheckoutComponent/DeliveryInformationForm';
import PaymentMethodForm from '../../components/CheckoutComponent/PaymentMethodForm';
import OrderConfirmation from '../../components/CheckoutComponent/OrderConfirmation';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { items: cartItems, getTotalAmount, getShippingFee, getGrandTotal } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryInfo, setDeliveryInfo] = useState({});
  const [paymentInfo, setPaymentInfo] = useState({});

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

  const handleOrderComplete = () => {
    // Xử lý hoàn tất đơn hàng
    console.log('Order completed:', { deliveryInfo, paymentInfo, cartItems });
    alert('Đơn hàng đã được đặt thành công!');
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
          <PaymentMethodForm 
            onSubmit={handlePaymentSubmit}
            onBack={() => setCurrentStep(1)}
            initialData={paymentInfo}
          />
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
            onComplete={handleOrderComplete}
            onBack={() => setCurrentStep(2)}
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
