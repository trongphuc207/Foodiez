const API_BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('authToken');
const getAuthHeaders = (contentType = 'application/json') => {
  const token = getAuthToken();
  return {
    'Content-Type': contentType,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Lấy tất cả voucher đang hoạt động
export const getActiveVouchers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers`);
    if (!response.ok) {
      throw new Error('Failed to fetch vouchers');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }
};

// Lấy voucher của user
export const getUserVouchers = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers/user/${userId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user vouchers');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching user vouchers:', error);
    throw error;
  }
};

// Lấy voucher chưa sử dụng của user
export const getUserUnusedVouchers = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers/user/${userId}/unused`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch unused vouchers');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching unused vouchers:', error);
    throw error;
  }
};

// Áp dụng voucher để tính discount
export const applyVoucher = async (userId, voucherCode, orderAmount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers/apply`, {
      method: 'POST',
      headers: getAuthHeaders('application/x-www-form-urlencoded'),
      body: new URLSearchParams({
        userId: userId.toString(),
        voucherCode: voucherCode,
        orderAmount: orderAmount.toString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to apply voucher');
    }

    const discountAmount = await response.json();
    return discountAmount;
  } catch (error) {
    console.error('Error applying voucher:', error);
    throw error;
  }
};

// Claim voucher (nhận voucher)
export const claimVoucher = async (userId, voucherCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers/claim`, {
      method: 'POST',
      headers: getAuthHeaders('application/x-www-form-urlencoded'),
      body: new URLSearchParams({
        userId: userId.toString(),
        voucherCode: voucherCode
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to claim voucher');
    }

    return response.json();
  } catch (error) {
    console.error('Error claiming voucher:', error);
    throw error;
  }
};

// Sử dụng voucher
export const useVoucher = async (userId, voucherCode, orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers/use`, {
      method: 'POST',
      headers: getAuthHeaders('application/x-www-form-urlencoded'),
      body: new URLSearchParams({
        userId: userId.toString(),
        voucherCode: voucherCode,
        orderId: orderId.toString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to use voucher');
    }

    return response.text();
  } catch (error) {
    console.error('Error using voucher:', error);
    throw error;
  }
};

// Tạo voucher code mới
export const generateVoucherCode = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers/generate-code`);
    if (!response.ok) {
      throw new Error('Failed to generate voucher code');
    }
    return response.text();
  } catch (error) {
    console.error('Error generating voucher code:', error);
    throw error;
  }
};

// Tạo voucher mới (Admin)
export const createVoucher = async (voucherData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voucherData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to create voucher');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating voucher:', error);
    throw error;
  }
};
