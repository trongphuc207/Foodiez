import axios from 'axios';

const PAYMENT_API_BASE_URL = process.env.REACT_APP_ORDER_URL || 'http://localhost:8080/api/payos';

// Create payment link
export const createPaymentLink = async (paymentData) => {
  try {
    console.log('=== PAYMENT API CALL ===');
    console.log('API URL:', `${PAYMENT_API_BASE_URL}/create-payment`);
    console.log('Request data:', paymentData);
    
    const response = await axios.post(`${PAYMENT_API_BASE_URL}/create-payment`, paymentData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Payment API response status:', response.status);
    console.log('Payment API response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== PAYMENT API ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    console.error('Error config:', error.config);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    }
    
    throw new Error(error.response?.data?.message || 'Failed to create payment link');
  }
};

// Get payment information
export const getPaymentInfo = async (orderCode) => {
  try {
    const response = await axios.get(`${PAYMENT_API_BASE_URL}/payment/${orderCode}`);
    return response.data;
  } catch (error) {
    console.error('Get payment info error:', error);
    throw new Error(error.response?.data?.message || 'Failed to get payment information');
  }
};

// Cancel payment
export const cancelPayment = async (orderCode, reason = 'User cancelled') => {
  try {
    const response = await axios.post(`${PAYMENT_API_BASE_URL}/cancel-payment`, {
      orderCode,
      cancellationReason: reason
    });
    return response.data;
  } catch (error) {
    console.error('Cancel payment error:', error);
    throw new Error(error.response?.data?.message || 'Failed to cancel payment');
  }
};

// Generate unique order code
export const generateOrderCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Format cart items for PayOS
export const formatCartItemsForPayOS = (cartItems) => {
  return cartItems.map(item => ({
    name: item.name || item.productName || 'Sản phẩm',
    quantity: item.quantity || 1,
    price: item.price || item.unitPrice || 0
  }));
};

// Create payment data (chỉ gửi các field cần thiết cho PayOS)
export const createPaymentData = (orderInfo, cartItems, totalAmount) => {
  const orderCode = generateOrderCode();
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
  
  const paymentData = {
    orderCode: orderCode,
    amount: Math.round(totalAmount), // Ensure integer
    description: `Đơn hàng #${orderCode}`, // Rút gọn description
    returnUrl: `${frontendUrl}/payment/success?orderCode=${orderCode}`,
    cancelUrl: `${frontendUrl}/payment/cancel?orderCode=${orderCode}`
    // Không gửi items array vì không cần cho checksum
  };
  
  console.log('Created PayOS payment data:', paymentData);
  return paymentData;
};
