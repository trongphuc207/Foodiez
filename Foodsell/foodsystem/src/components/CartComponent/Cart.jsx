"use client"
import { useState } from "react"
import "./Cart.css"

const Cart = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Bánh mì thịt nướng đặc biệt",
      price: 25000,
      quantity: 2,
      image: "/review-banh-mi-1.jpg",
      shop: "Bánh mì Huyền",
    },
    {
      id: 2,
      name: "Phở bò tái",
      price: 45000,
      quantity: 1,
      image: "/review-pho-1.jpg",
      shop: "Phở Hà Nội",
    },
  ])

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = 15000

  const handleCheckout = () => {
    console.log("[v0] Proceeding to checkout with items:", cartItems)
    alert("Chuyển đến trang thanh toán...")
  }

  if (!isOpen) return null

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-container" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>🛒 Giỏ hàng của bạn</h2>
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
                <div key={item.id} className="cart-item">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} />
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="shop-name">{item.shop}</p>
                    <p className="item-price">{item.price.toLocaleString()}đ</p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem(item.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{totalAmount.toLocaleString()}đ</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>{shippingFee.toLocaleString()}đ</span>
              </div>
              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{(totalAmount + shippingFee).toLocaleString()}đ</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                Thanh toán
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart
