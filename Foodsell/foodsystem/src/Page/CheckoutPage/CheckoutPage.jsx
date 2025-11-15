import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../hooks/useAuth';
import DeliveryInformationForm from '../../components/CheckoutComponent/DeliveryInformationForm';
import { shopAPI } from '../../api/shop';
import { inferDistrictFromAddress } from '../../config/shippingConfig';
import PaymentMethodForm from '../../components/CheckoutComponent/PaymentMethodForm';
import OrderConfirmation from '../../components/CheckoutComponent/OrderConfirmation';
import VoucherSelector from '../../components/VoucherComponent/VoucherSelector';
import { createPaymentLink, createPaymentData } from '../../api/payment';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { 
    items: cartItems, 
    getTotalAmount, 
    getGrandTotal, 
    clearCart,
    getItemsByShop
  } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryInfo, setDeliveryInfo] = useState({});
  const [paymentInfo, setPaymentInfo] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [selectedShippingFee, setSelectedShippingFee] = useState(15000); // Default base fee
  const [restaurantDistrict, setRestaurantDistrict] = useState(null);

  // Kiểm tra authentication - chờ load xong trạng thái đăng nhập rồi mới quyết định
  useEffect(() => {
    if (loading) return; // tránh redirect khi trạng thái đang tải profile
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thanh toán!');
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

  // Khôi phục thông tin form từ pendingOrder (không khôi phục giỏ hàng)
  useEffect(() => {
    const pendingOrder = localStorage.getItem('pendingOrder');
    const hasRestored = sessionStorage.getItem('hasRestoredFromPending');
    console.log('CheckoutPage: pendingOrder exists:', !!pendingOrder);
    console.log('CheckoutPage: hasRestored from session:', hasRestored);
    
    if (pendingOrder && !hasRestored) {
      try {
        const orderData = JSON.parse(pendingOrder);
        console.log('Restoring form data from pendingOrder:', orderData);
        
        // Chỉ khôi phục thông tin form, không khôi phục giỏ hàng
        if (orderData.deliveryInfo) {
          setDeliveryInfo(orderData.deliveryInfo);
        }
        if (orderData.paymentInfo) {
          setPaymentInfo(orderData.paymentInfo);
        }
        if (orderData.appliedVoucher) {
          setAppliedVoucher(orderData.appliedVoucher);
        }
        if (orderData.voucherDiscount) {
          setVoucherDiscount(orderData.voucherDiscount);
        }
        
        // Chuyển đến bước xác nhận đơn hàng nếu đã có đầy đủ thông tin
        if (orderData.deliveryInfo && orderData.paymentInfo) {
          setCurrentStep(3);
        } else if (orderData.deliveryInfo) {
          setCurrentStep(2);
        }
        
        // Đánh dấu đã khôi phục form data
        sessionStorage.setItem('hasRestoredFromPending', 'true');
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  }, []);

  // Derive restaurant/shop district from cart's shop (if available)
  useEffect(() => {
    const itemsByShop = getItemsByShop();
    const shopIds = Object.keys(itemsByShop || {});
    if (shopIds.length === 0) {
      setRestaurantDistrict(null);
      return;
    }
    const shopId = shopIds[0]; // If multiple shops, pick the first for this checkout flow
    // Testing fallback map when backend is not available
    const TEST_SHOP_DISTRICT_MAP = {
      '1': 'Hải Châu',
      '2': 'Thanh Khê',
      '3': 'Liên Chiểu',
      '4': 'Sơn Trà',
      '5': 'Ngũ Hành Sơn',
      '6': 'Cẩm Lệ',
      '7': 'Hòa Vang'
    };
    let mounted = true;
    console.log('[Checkout] itemsByShop keys:', shopIds, 'selected shopId:', shopId);
    shopAPI.getShopById(shopId)
      .then(shop => {
        if (!mounted) return;
        console.log('[Checkout] fetched shop:', shop);
        // Prefer explicit district field if backend provides it
        const explicitDistrict = shop.district || shop?.addressDistrict || null;
        if (explicitDistrict) {
          console.log('[Checkout] using explicit shop district:', explicitDistrict);
          setRestaurantDistrict(explicitDistrict);
          return;
        }
        // Otherwise infer from address text
        const addressText = shop.address || shop?.addressText || '';
        const inferred = inferDistrictFromAddress(addressText);
        console.log('[Checkout] inferred district from address:', addressText, '=>', inferred);
        if (inferred) {
          setRestaurantDistrict(inferred);
        } else {
          // Fallback for testing if API returns no district or address cannot be parsed
          const fallback = TEST_SHOP_DISTRICT_MAP[String(shopId)] || null;
          console.log('[Checkout] fallback TEST_SHOP_DISTRICT_MAP for shopId', shopId, '=>', fallback);
          setRestaurantDistrict(fallback);
        }
      })
      .catch(err => {
        console.warn('Could not fetch shop to infer district:', err);
        // Backend có thể chưa chạy. Dùng fallback test theo shopId để tiếp tục tính phí ship.
        const fallback = TEST_SHOP_DISTRICT_MAP[String(shopId)] || null;
        console.log('[Checkout] using fallback district due to fetch error:', fallback);
        setRestaurantDistrict(fallback);
      });
    return () => { mounted = false };
  }, [cartItems, getItemsByShop]);

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
    const { shippingDetails, ...deliveryData } = data;
    setDeliveryInfo(deliveryData);
    setSelectedShippingFee(shippingDetails.fee || 15000);
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
    const baseTotal = getTotalAmount() + selectedShippingFee;
    return Math.max(0, baseTotal - voucherDiscount);
  };

  // If user selected specific items to checkout (from Cart), prefer those
  // eslint-disable-next-line no-unused-vars
  const [selectedCheckoutItems, setSelectedCheckoutItems] = useState(() => {
    try {
      const raw = sessionStorage.getItem('selectedCheckoutItems');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Remove after reading so we don't reuse accidentally
        sessionStorage.removeItem('selectedCheckoutItems');
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read selectedCheckoutItems from sessionStorage', e);
    }
    return null;
  });

  // Active items to be used for display and order creation
  const activeItems = selectedCheckoutItems && selectedCheckoutItems.length > 0 ? selectedCheckoutItems : cartItems;

  const computeItemsTotal = (items) => {
    return items.reduce((t, it) => t + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
  };

  const activeTotalAmount = computeItemsTotal(activeItems);
  const getFinalTotalForActive = () => Math.max(0, (activeTotalAmount + selectedShippingFee) - voucherDiscount);

  // Helper function để kiểm tra authentication
  const checkAuthentication = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Bạn cần đăng nhập để đặt hàng. Vui lòng đăng nhập và thử lại.');
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleOrderComplete = async () => {
    // Kiểm tra authentication trước khi xử lý
    if (!checkAuthentication()) {
      return;
    }

    setIsProcessingPayment(true);
    try {
      console.log('=== STARTING ORDER PROCESSING ===');
  console.log('Payment method:', paymentInfo.method);
  console.log('Delivery info:', deliveryInfo);
  console.log('Active items (used for this checkout):', activeItems);
  console.log('Active total amount:', activeTotalAmount);
  console.log('Grand total (active):', activeTotalAmount + selectedShippingFee);
      
      if (paymentInfo.method === 'PayOS') {
        console.log('=== PROCESSING PAYOS PAYMENT ===');
        
        // Xử lý thanh toán PayOS
        const paymentData = createPaymentData(
          deliveryInfo,
          activeItems,
          getFinalTotalForActive() // Sử dụng tổng tiền sau khi áp dụng voucher cho active items
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
            cartItems: activeItems,
            orderCode: paymentData.orderCode,
            totalAmount: getFinalTotalForActive()
          }));

          // Tạo đơn hàng tạm trong database với PayOS order code
          try {
            // Gọi API để tạo đơn hàng tạm (pending) với PayOS order code
            // Map cartItems để có productId thay vì id
            const mappedCartItems = activeItems.map(item => ({
              productId: item.id,
              name: item.name || item.productName || 'Sản phẩm',
              quantity: Math.round(item.quantity || 1), // Đảm bảo là số nguyên
              price: Math.round(item.price || item.unitPrice || 0) // Đảm bảo là số nguyên
            }));
            
            // Map deliveryInfo để match với backend
            const mappedDeliveryInfo = {
              recipientName: deliveryInfo.fullName,
              recipientPhone: deliveryInfo.phone,
              addressText: `${deliveryInfo.address}, ${deliveryInfo.district}, ${deliveryInfo.city}`,
              notes: deliveryInfo.notes
            };

            const orderData = {
              deliveryInfo: mappedDeliveryInfo,
              paymentInfo,
              cartItems: mappedCartItems,
              payosOrderCode: paymentData.orderCode,
              totalAmount: Math.round(getFinalTotalForActive()), // Đảm bảo là số nguyên
              originalAmount: Math.round(activeTotalAmount + selectedShippingFee), // Đảm bảo là số nguyên
              voucherDiscount: Math.round(voucherDiscount), // Đảm bảo là số nguyên
              appliedVoucher: appliedVoucher,
              status: 'pending' // PayOS status - chờ thanh toán
            };
            
            // Gọi API tạo đơn hàng
            console.log('=== CREATING PAYOS ORDER IN DATABASE ===');
            console.log('Order data to send:', orderData);
            console.log('Total amount (rounded):', Math.round(getFinalTotal()));
            console.log('Original amount (rounded):', Math.round(getGrandTotal()));
            console.log('Voucher discount (rounded):', Math.round(voucherDiscount));
            
            const token = localStorage.getItem('authToken');
            console.log('Auth token exists:', !!token);
            console.log('Token length:', token ? token.length : 0);
            
            if (!token) {
              throw new Error('Bạn cần đăng nhập để đặt hàng. Vui lòng đăng nhập và thử lại.');
            }

            const orderResponse = await fetch('http://localhost:8080/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(orderData)
            });
            
            console.log('Order API response status:', orderResponse.status);
            console.log('Order API response ok:', orderResponse.ok);
            
            if (!orderResponse.ok) {
              const errorText = await orderResponse.text();
              // Try to parse backend JSON message if available
              let backendMessage = null;
              try {
                const parsed = JSON.parse(errorText);
                backendMessage = parsed.message || parsed.error || (parsed.data && parsed.data.message) || null;
              } catch (e) {
                backendMessage = errorText;
              }

              console.error('=== PAYOS ORDER API ERROR ===');
              console.error('Status:', orderResponse.status);
              console.error('Parsed backend message:', backendMessage);
              console.error('Raw response text:', errorText);

              if (orderResponse.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
              } else if (orderResponse.status === 403) {
                throw new Error(backendMessage || 'Bạn không có quyền tạo đơn hàng. Vui lòng kiểm tra tài khoản.');
              } else if (orderResponse.status === 400) {
                throw new Error(backendMessage || 'Dữ liệu đơn hàng không hợp lệ. Vui lòng kiểm tra lại thông tin.');
              } else {
                throw new Error(backendMessage || `Lỗi tạo đơn hàng PayOS: ${orderResponse.status} - ${errorText}`);
              }
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
      } else if (paymentInfo.method === 'cod') {
        // Xử lý COD (Cash on Delivery)
        console.log('=== PROCESSING COD PAYMENT ===');
        console.log('Order data for COD (active items):', { deliveryInfo, paymentInfo, activeItems });
        
        // Map activeItems để có productId thay vì id and group by shop
        const itemsByShop = activeItems.reduce((acc, item) => {
          const shopId = item.shopId || item.shop_id || item.sellerId || 'unknown';
          if (!acc[shopId]) acc[shopId] = [];
          acc[shopId].push(item);
          return acc;
        }, {});
        
        // Map deliveryInfo để match với backend
        const mappedDeliveryInfo = {
          recipientName: deliveryInfo.fullName,
          recipientPhone: deliveryInfo.phone,
          addressText: `${deliveryInfo.address}, ${deliveryInfo.district}, ${deliveryInfo.city}`,
          notes: deliveryInfo.notes
        };

        // Tổng tiền hàng của các item đang checkout
        const totalItemsAmount = Math.round(activeTotalAmount || 0);
        const shippingTotal = Math.round(selectedShippingFee || 0);
        const vouchersTotal = Math.round(voucherDiscount || 0);

        // Tạo đơn hàng riêng cho từng shop, phân bổ ship + voucher theo tỷ lệ
        const shopEntries = Object.entries(itemsByShop);
        let shipAllocated = 0;
        let voucherAllocated = 0;

        for (let idx = 0; idx < shopEntries.length; idx++) {
          const [shopId, shopItems] = shopEntries[idx];
          const mappedShopItems = shopItems.map(item => ({
            productId: item.id,
            name: item.name || item.productName || 'Sản phẩm',
            quantity: Math.round(item.quantity || 1),
            price: Math.round(item.price || item.unitPrice || 0)
          }));

          const shopTotal = shopItems.reduce((t, it) => t + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
          // Chia voucher theo tỷ lệ tổng tiền hàng
          let shopVoucherDiscount = 0;
          if (vouchersTotal > 0 && totalItemsAmount > 0) {
            if (idx < shopEntries.length - 1) {
              shopVoucherDiscount = Math.round((shopTotal / totalItemsAmount) * vouchersTotal);
              voucherAllocated += shopVoucherDiscount;
            } else {
              // dồn phần còn lại cho shop cuối để tránh lệch do làm tròn
              shopVoucherDiscount = Math.max(0, vouchersTotal - voucherAllocated);
            }
          }

          // Chia phí ship theo tỷ lệ tổng tiền hàng
          let shopShippingFee = 0;
          if (shippingTotal > 0 && totalItemsAmount > 0) {
            if (idx < shopEntries.length - 1) {
              shopShippingFee = Math.round((shopTotal / totalItemsAmount) * shippingTotal);
              shipAllocated += shopShippingFee;
            } else {
              shopShippingFee = Math.max(0, shippingTotal - shipAllocated);
            }
          }

          const orderData = {
            deliveryInfo: mappedDeliveryInfo,
            paymentInfo,
            cartItems: mappedShopItems,
            shopId: shopId,
            totalAmount: Math.round((shopTotal + shopShippingFee) - shopVoucherDiscount),
            originalAmount: Math.round(shopTotal + shopShippingFee),
            voucherDiscount: shopVoucherDiscount,
            shippingFee: shopShippingFee,
            appliedVoucher: appliedVoucher,
            status: 'pending'
          };

        console.log('=== CREATING COD ORDER IN DATABASE ===');
        console.log('Order data to send:', orderData);
        console.log('Total amount (rounded):', Math.round(getFinalTotal()));
        console.log('Original amount (rounded):', Math.round(getGrandTotal()));
        console.log('Voucher discount (rounded):', Math.round(voucherDiscount));

        // Gọi API tạo đơn hàng COD
        const token = localStorage.getItem('authToken');
        console.log('Auth token exists:', !!token);
        console.log('Token length:', token ? token.length : 0);
        
        if (!token) {
          throw new Error('Bạn cần đăng nhập để đặt hàng. Vui lòng đăng nhập và thử lại.');
        }

          // Tạo đơn hàng cho shop hiện tại
          try {
            const orderResponse = await fetch('http://localhost:8080/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(orderData)
            });

            console.log(`Order API response for shop ${shopId} status:`, orderResponse.status);
            console.log(`Order API response for shop ${shopId} ok:`, orderResponse.ok);

            if (!orderResponse.ok) {
              const errorText = await orderResponse.text();
              let backendMessage = null;
              try {
                const parsed = JSON.parse(errorText);
                backendMessage = parsed.message || parsed.error || (parsed.data && parsed.data.message) || null;
              } catch (e) {
                backendMessage = errorText;
              }

              console.error(`=== COD ORDER API ERROR (shop ${shopId}) ===`);
              console.error('Status:', orderResponse.status);
              console.error('Parsed backend message:', backendMessage);
              console.error('Raw response text:', errorText);

              if (orderResponse.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
              } else if (orderResponse.status === 403) {
                throw new Error(backendMessage || 'Bạn không có quyền tạo đơn hàng. Vui lòng kiểm tra tài khoản.');
              } else if (orderResponse.status === 400) {
                throw new Error(backendMessage || 'Dữ liệu đơn hàng không hợp lệ. Vui lòng kiểm tra lại thông tin.');
              } else {
                throw new Error(backendMessage || `Lỗi tạo đơn hàng cho shop ${shopId}: ${orderResponse.status} - ${errorText}`);
              }
            }

            const orderResult = await orderResponse.json();
            console.log(`Order created successfully for shop ${shopId}:`, orderResult);
          } catch (error) {
            console.error(`Error creating order for shop ${shopId}:`, error);
            throw error;
          }
        } // end of shop loop

        // Xóa giỏ hàng sau khi tạo đơn hàng thành công
        clearCart();
        
        // Xóa pendingOrder nếu có
        localStorage.removeItem('pendingOrder');

        // Hiển thị thông báo thành công
        alert('Đơn hàng COD đã được đặt thành công! Bạn sẽ thanh toán khi nhận hàng.');
        
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
            restaurantDistrict={restaurantDistrict}
          />
        );
      case 2:
        return (
          <div>
            <VoucherSelector
              userId={1} // TODO: Lấy từ authentication context
              orderAmount={activeTotalAmount + selectedShippingFee}
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
            cartItems={activeItems}
            totalAmount={activeTotalAmount}
            shippingFee={selectedShippingFee}
            grandTotal={activeTotalAmount + selectedShippingFee}
            voucherDiscount={voucherDiscount}
            appliedVoucher={appliedVoucher}
            finalTotal={getFinalTotalForActive()}
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
