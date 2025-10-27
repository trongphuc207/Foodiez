"use client"
import React from "react"
import { useNavigate } from "react-router-dom"
import "./Cart.css"
import { useCart } from "../../contexts/CartContext"
import { useAuth } from "../../hooks/useAuth"

const Cart = ({ isOpen, onClose }) => {
  const { 
    items: cartItems, 
    updateQuantity, 
    removeFromCart, 
    getTotalAmount, 
    getShippingFee, 
    getGrandTotal 
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thanh toán!');
      onClose(); // Close cart modal
      return;
    }
    console.log("[v0] Proceeding to checkout with items:", cartItems)
    onClose(); // Close cart modal
    navigate('/checkout'); // Navigate to checkout page
  }

  if (!isOpen) return null

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-container" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="header-title">
            <span className="header-icon">🛒</span>
            <h2>Giỏ hàng của bạn</h2>
          </div>
          <button className="close-cart-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Giỏ hàng trống</p>
            <button onClick={onClose}>Tiếp tục mua sắm</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.shopId}`} className="cart-item">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} />
                  <div className="item-info">
                    <h3>{item.shop}</h3>
                    <p className="shop-name">{item.name}</p>
                    <p className="item-price">{item.price.toLocaleString()}₫</p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span className="summary-label">Tạm tính:</span>
                <span className="summary-value">{getTotalAmount().toLocaleString()}₫</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Phí vận chuyển:</span>
                <span className="summary-value">{getShippingFee().toLocaleString()}₫</span>
              </div>
              <div className="summary-row total">
                <span className="summary-label">Tổng cộng:</span>
                <span className="summary-value">{getGrandTotal().toLocaleString()}₫</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                THANH TOÁN
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart
