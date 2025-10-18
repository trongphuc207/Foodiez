import { useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';

const CartCheckComponent = () => {
  const { items: cartItems } = useCart();

  useEffect(() => {
    console.log('CartCheckComponent: Component mounted');
    console.log('CartCheckComponent: Current cart items:', cartItems);
    console.log('CartCheckComponent: Cart items length:', cartItems.length);
    
    // Kiểm tra nếu giỏ hàng trống và có pendingOrder
    const pendingOrder = localStorage.getItem('pendingOrder');
    const hasRestored = sessionStorage.getItem('hasRestoredFromHomePage');
    console.log('CartCheckComponent: pendingOrder exists:', !!pendingOrder);
    console.log('CartCheckComponent: hasRestored from session:', hasRestored);
    
    // Chỉ chạy một lần và khi chưa khôi phục
    if (pendingOrder && cartItems.length === 0 && !hasRestored) {
      try {
        const orderData = JSON.parse(pendingOrder);
        console.log('CartCheckComponent: Found pendingOrder with cartItems:', orderData.cartItems);
        
        if (orderData.cartItems && orderData.cartItems.length > 0) {
          console.log('CartCheckComponent: Restoring cart from pendingOrder...');
          // Khôi phục giỏ hàng
          localStorage.setItem('cart', JSON.stringify(orderData.cartItems));
          console.log('CartCheckComponent: Cart restored to localStorage');
          
          // Đánh dấu đã khôi phục để tránh reload nhiều lần
          sessionStorage.setItem('hasRestoredFromHomePage', 'true');
          
          // Reload để CartContext load lại giỏ hàng
          setTimeout(() => {
            console.log('CartCheckComponent: Reloading page to refresh cart...');
            window.location.reload();
          }, 500);
        }
      } catch (error) {
        console.error('CartCheckComponent: Error restoring cart:', error);
      }
    }
  }, [cartItems.length]);

  return null; // Component không render gì
};

export default CartCheckComponent;
