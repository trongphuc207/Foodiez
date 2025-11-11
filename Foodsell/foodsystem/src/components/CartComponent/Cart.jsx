"use client"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Cart.css"
import { useCart } from "../../contexts/CartContext"
import { useAuth } from "../../hooks/useAuth"

const Cart = ({ isOpen, onClose }) => {
  // eslint-disable-next-line no-unused-vars
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

  // Selection state to allow paying for a subset of items (only one seller at a time)
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set());

  // Compute unique seller/shop IDs present in the cart
  const sellerIds = new Set(cartItems.map(i => i.shopId || i.shop_id || i.sellerId));
  const multipleSellersInCart = sellerIds.size > 1;

  // When cart items change, ensure selection remains valid; if only one seller, preselect all items
  useEffect(() => {
    if (cartItems.length === 0) {
      setSelectedKeys(new Set());
      setSelectedSellerId(null);
      return;
    }
    if (!multipleSellersInCart) {
      // select all by default
      const allKeys = new Set(cartItems.map(i => `${i.id}-${i.shopId || i.shop_id || i.sellerId || ''}`));
      setSelectedKeys(allKeys);
      setSelectedSellerId(Array.from(sellerIds)[0] || null);
    } else {
      // prune selectedKeys to items still in cart
      setSelectedKeys(prev => {
        const next = new Set();
        for (const k of prev) {
          const [id, shop] = k.split('-');
          if (cartItems.find(i => String(i.id) === id && String(i.shopId || i.shop_id || i.sellerId || '') === shop)) {
            next.add(k);
          }
        }
        return next;
      });
      // if no selected keys left, unset selectedSellerId
      setSelectedSellerId(prev => {
        if (prev && selectedKeys.size > 0) return prev;
        return null;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  // Compute totals for selected items (if any). If no selection, fall back to full cart totals.
  const selectedItemsArray = cartItems.filter(i => selectedKeys.has(`${i.id}-${i.shopId || i.shop_id || i.sellerId || ''}`));
  const selectedTotalAmount = selectedItemsArray.reduce((t, it) => t + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
  const displaySubtotal = selectedKeys.size > 0 ? selectedTotalAmount : getTotalAmount();
  // For now keep shipping fee the same base; could compute per-selection later
  const displayShippingFee = getShippingFee();
  const displayGrandTotal = displaySubtotal + displayShippingFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thanh toán!');
      onClose(); // Close cart modal
      return;
    }

    // Prevent checkout when there are items from multiple sellers/shops
    if (multipleSellersInCart) {
      // Inform user why checkout is blocked
      alert('Không thể thanh toán: giỏ hàng chứa sản phẩm từ nhiều cửa hàng khác nhau. Vui lòng thanh toán từng cửa hàng một.');
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
              {cartItems.map((item) => {
                const key = `${item.id}-${item.shopId || item.shop_id || item.sellerId || ''}`;
                const itemSeller = item.shopId || item.shop_id || item.sellerId;
                const disabledForSelection = selectedSellerId && itemSeller !== selectedSellerId;
                const checked = selectedKeys.has(key);
                return (
                  <div key={key} className="cart-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabledForSelection}
                        onChange={(e) => {
                          const next = new Set(selectedKeys);
                          if (e.target.checked) {
                            // if selecting first item, set selectedSellerId
                            if (!selectedSellerId) setSelectedSellerId(itemSeller);
                            // enforce only same seller
                            if (selectedSellerId && itemSeller !== selectedSellerId) {
                              alert('Chỉ được chọn sản phẩm từ cùng một cửa hàng để thanh toán.');
                              return;
                            }
                            next.add(key);
                          } else {
                            next.delete(key);
                            // if removed last of seller, clear selectedSellerId
                            if (next.size === 0) setSelectedSellerId(null);
                          }
                          setSelectedKeys(next);
                        }}
                      />
                    </div>
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
                )
              })}
            </div>

            {/* Seller check: if cart has more than one seller, show a clickable warning and disable checkout */}
            {multipleSellersInCart && (
              <div className="multi-seller-warning" style={{ padding: '12px', background: '#fff4f4', borderRadius: 6, margin: '12px 0', cursor: 'pointer' }} onClick={() => alert('Không được mua 2 sản phẩm với 2 shop khác nhau cùng 1 lúc. Vui lòng tách giỏ hàng theo từng cửa hàng hoặc xóa sản phẩm không cùng cửa hàng.') }>
                <strong>Lưu ý:</strong> Giỏ hàng hiện chứa sản phẩm từ nhiều cửa hàng khác nhau. Nhấn để xem chi tiết.
              </div>
            )}

            <div className="cart-summary">
              <div className="summary-row">
                <span className="summary-label">Tạm tính:</span>
                <span className="summary-value">{displaySubtotal.toLocaleString()}₫</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Phí vận chuyển:</span>
                <span className="summary-value">{displayShippingFee.toLocaleString()}₫</span>
              </div>
              <div className="summary-row total">
                <span className="summary-label">Tổng cộng:</span>
                <span className="summary-value">{displayGrandTotal.toLocaleString()}₫</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                <button className="checkout-btn" onClick={handleCheckout} disabled={multipleSellersInCart} title={multipleSellersInCart ? 'Giỏ hàng chứa sản phẩm từ nhiều cửa hàng. Vui lòng tách giỏ hàng.' : ''}>
                  THANH TOÁN
                </button>
                {/* Button to checkout only selected items when cart spans multiple sellers */}
                <button className="checkout-btn" onClick={() => {
                  // handle selected checkout
                  if (!isAuthenticated) { alert('Vui lòng đăng nhập để thanh toán!'); onClose(); return; }
                  if (selectedKeys.size === 0) { alert('Vui lòng chọn sản phẩm để thanh toán riêng.'); return; }
                  // reuse handler logic placed above by persisting selection into sessionStorage and navigating
                  try { sessionStorage.setItem('selectedCheckoutItems', JSON.stringify(cartItems.filter(i => selectedKeys.has(`${i.id}-${i.shopId || i.shop_id || i.sellerId || ''}`)))); } catch (e) { console.warn(e); }
                  onClose(); navigate('/checkout');
                }} disabled={selectedKeys.size === 0} title={selectedKeys.size === 0 ? 'Chọn ít nhất 1 sản phẩm để thanh toán' : 'Thanh toán các sản phẩm đã chọn'}>
                  THANH TOÁN SẢN PHẨM ĐÃ CHỌN
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart
