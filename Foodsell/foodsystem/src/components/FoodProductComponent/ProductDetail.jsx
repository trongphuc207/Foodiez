import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductDetail.css";
import { useCart } from "../../contexts/CartContext";
import { getShopName } from "../../constants/shopNames";
import { getCategoryName } from "../../constants/categoryNames";
import ReviewList from "../ReviewComponent/ReviewList";
import { useAuth } from "../../hooks/useAuth";

const ProductDetail = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Debug: Log user info
  console.log('🔍 ProductDetail Debug:', { user, productId: product?.id, shopId: product?.shopId });

  if (!product) return null;

  const handleAddToCart = () => {
    // Tạo product object với đầy đủ thông tin để add vào cart
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || "/placeholder.svg",
      shop: getShopName(product.shopId), // Lấy tên shop thật từ API
      description: product.description,
      categoryId: product.categoryId,
      shopId: product.shopId,
      status: product.status,
      available: product.available
    };

    // Add quantity copies to cart
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct);
    }

    alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
    onClose();
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleShopClick = () => {
    navigate(`/shops/${product.shopId}`);
    onClose(); // Close the product detail modal
  };

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="product-detail-content">
          <div className="product-detail-image">
            <img 
              src={product.imageUrl || "/placeholder.svg"} 
              alt={product.name} 
              className="detail-img" 
            />
          </div>
          
          <div className="product-detail-info">
            <h2>{product.name}</h2>
            <p className="product-description">{product.description}</p>
            
            <div className="product-details">
              <div className="detail-row">
                <span className="label">Giá:</span>
                <span className="price">{product.price.toLocaleString()}đ</span>
              </div>
              
              <div className="detail-row">
                <span className="label">Shop:</span>
                <span 
                  className="shop-link" 
                  onClick={handleShopClick}
                  title="Xem chi tiết shop"
                >
                  {getShopName(product.shopId)}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="label">Danh mục:</span>
                <span>{getCategoryName(product.categoryId)}</span>
              </div>
              
              <div className="detail-row">
                <span className="label">Trạng thái:</span>
                <span className={`status ${product.status}`}>
                  {product.status === 'active' ? 'Còn hàng' : 
                   product.status === 'inactive' ? 'Tạm ngừng' : 
                   product.status === 'out_of_stock' ? 'Hết hàng' : product.status}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="label">Ngày tạo:</span>
                <span>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {product.available && product.status === 'active' && (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <span className="label">Số lượng:</span>
                  <div className="quantity-controls">
                    <button onClick={() => handleQuantityChange(-1)}>-</button>
                    <span className="quantity">{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)}>+</button>
                  </div>
                </div>
                
                <button 
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                >
                  🛒 Thêm vào giỏ hàng
                </button>
              </div>
            )}
            
            {(!product.available || product.status !== 'active') && (
              <div className="unavailable-notice">
                <p>Sản phẩm hiện tại không khả dụng</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Review Section */}
        <div className="product-reviews-section">
          <ReviewList 
            productId={product.id}
            shopId={product.shopId}
            userRole={user?.role}
            currentUserId={user?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
