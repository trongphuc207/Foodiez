import { useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';

const CartRestoreComponent = () => {
  const { items: cartItems } = useCart();

  console.log('CartRestoreComponent: Component mounted/updated');

  useEffect(() => {
    // Kiểm tra nếu có pendingOrder và giỏ hàng trống
    const pendingOrder = localStorage.getItem('pendingOrder');
    const hasRestored = sessionStorage.getItem('hasRestoredFromPending');
    
    console.log('CartRestoreComponent: pendingOrder exists:', !!pendingOrder);
    console.log('CartRestoreComponent: current cartItems length:', cartItems.length);
    console.log('CartRestoreComponent: hasRestored from session:', hasRestored);
    
    // Chỉ chạy khi có pendingOrder và chưa khôi phục
    if (pendingOrder && !hasRestored) {
      try {
        const orderData = JSON.parse(pendingOrder);
        console.log('CartRestoreComponent: Restoring cart from pendingOrder:', orderData.cartItems);
        
        if (orderData.cartItems && orderData.cartItems.length > 0) {
          // Kiểm tra nếu giỏ hàng hiện tại trống hoặc khác với pendingOrder
          const currentCart = localStorage.getItem('cart');
          const currentCartItems = currentCart ? JSON.parse(currentCart) : [];
          
          console.log('CartRestoreComponent: Current cart items:', currentCartItems);
          console.log('CartRestoreComponent: Pending order cart items:', orderData.cartItems);
          
          // Nếu giỏ hàng trống hoặc khác với pendingOrder, khôi phục
          if (currentCartItems.length === 0 || 
              JSON.stringify(currentCartItems) !== JSON.stringify(orderData.cartItems)) {
            console.log('CartRestoreComponent: Restoring cart...');
            // Lưu giỏ hàng vào localStorage để CartContext có thể load
            localStorage.setItem('cart', JSON.stringify(orderData.cartItems));
            // Đánh dấu đã khôi phục
            sessionStorage.setItem('hasRestoredFromPending', 'true');
            // Reload để CartContext load lại giỏ hàng
            setTimeout(() => {
              window.location.reload();
            }, 100);
          } else {
            console.log('CartRestoreComponent: Cart already matches, no need to restore');
            // Đánh dấu đã khôi phục mà không cần reload
            sessionStorage.setItem('hasRestoredFromPending', 'true');
          }
        }
      } catch (error) {
        console.error('CartRestoreComponent: Error restoring cart:', error);
      }
    }
  }, [cartItems.length]);

  return null; // Component không render gì
};

export default CartRestoreComponent;
