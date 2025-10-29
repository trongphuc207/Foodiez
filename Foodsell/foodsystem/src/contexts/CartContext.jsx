import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Context để quản lý state giỏ hàng toàn cục
const CartContext = createContext();

// Cart Reducer để xử lý các action của giỏ hàng
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }]
        };
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || []
      };

    default:
      return state;
  }
};

// Cart Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: []
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    console.log('🛒 Loading cart from localStorage:', savedCart);
    if (savedCart && savedCart !== '[]') {
      try {
        const cartData = JSON.parse(savedCart);
        console.log('🛒 Parsed cart data:', cartData);
        if (Array.isArray(cartData) && cartData.length > 0) {
          dispatch({ type: 'LOAD_CART', payload: cartData });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    console.log('🛒 Saving cart to localStorage:', state.items);
    if (state.items && state.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    } else {
      localStorage.removeItem('cart');
    }
  }, [state.items]);

  // Cart actions
  const addToCart = (product) => {
    console.log('🛒 Adding to cart:', product);
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    console.log('🛒 Removing from cart:', productId);
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    console.log('🛒 Updating quantity:', productId, quantity);
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    console.log('🛒 Clearing cart');
    dispatch({ type: 'CLEAR_CART' });
  };

  // Calculate totals
  const getTotalAmount = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getShippingFee = () => {
    // This is just a base fee, actual fee will be calculated in DeliveryInformationForm
    return 15000;
  };

  const getGrandTotal = (customShippingFee) => {
    return getTotalAmount() + (customShippingFee !== undefined ? customShippingFee : getShippingFee());
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalAmount,
    getTotalItems,
    getShippingFee,
    getGrandTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook để sử dụng cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
