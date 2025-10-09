import React, { useState } from 'react';
import './PaymentMethodForm.css';

const PaymentMethodForm = ({ onSubmit, onBack, initialData = {} }) => {
  const [selectedMethod, setSelectedMethod] = useState(initialData.method || '');
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: '💵'
    },
    {
      id: 'bank_transfer',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua ngân hàng',
      icon: '🏦'
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: '📱'
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Thanh toán qua VNPay',
      icon: '💳'
    }
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    if (errors.method) {
      setErrors(prev => ({
        ...prev,
        method: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedMethod) {
      newErrors.method = 'Vui lòng chọn phương thức thanh toán';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        method: selectedMethod,
        methodName: paymentMethods.find(m => m.id === selectedMethod)?.name
      });
    }
  };

  return (
    <div className="payment-form-container">
      <div className="payment-form-header">
        <h2>Phương thức thanh toán</h2>
        <p>Chọn cách thanh toán phù hợp với bạn</p>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="payment-methods">
          {paymentMethods.map(method => (
            <div
              key={method.id}
              className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
              onClick={() => handleMethodSelect(method.id)}
            >
              <div className="method-radio">
                <input
                  type="radio"
                  id={method.id}
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => handleMethodSelect(method.id)}
                />
                <label htmlFor={method.id} className="radio-label">
                  <span className="radio-custom"></span>
                </label>
              </div>
              <div className="method-content">
                <div className="method-icon">{method.icon}</div>
                <div className="method-info">
                  <h3 className="method-name">{method.name}</h3>
                  <p className="method-description">{method.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.method && <span className="error-message">{errors.method}</span>}

        <div className="form-actions">
          <button type="button" className="back-btn" onClick={onBack}>
            Quay lại
          </button>
          <button type="submit" className="continue-btn">
            Tiếp tục
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethodForm;
