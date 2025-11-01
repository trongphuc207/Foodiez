import React from 'react';
import './FavoriteItems.css';

const FavoriteItems = ({ items = [], onRemove, onAddToCart }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!items || items.length === 0) {
    return (
      <div className="favorite-items-empty">
        <div className="empty-message">
          <span style={{ fontSize: '24px', color: '#ddd' }}>♥</span>
          <p>Bạn chưa có món ăn yêu thích nào</p>
          <a href="/" className="browse-link">Khám phá món ăn ngay</a>
        </div>
      </div>
    );
  }

  return (
    <div className="favorite-items-grid">
      {items.map(item => (
        <div key={item.id} className="favorite-item-card">
          <img 
            src={item.imageUrl || '/default-food-image.jpg'} 
            alt={item.name}
            className="favorite-item-image"
          />
          <div className="favorite-item-info">
            <div className="favorite-item-shop">
              <span>🏪</span>
              <span>{item.shopName || 'Shop name'}</span>
            </div>
            <h3 className="favorite-item-name">{item.name}</h3>
            <div className="favorite-item-rating">
              <span>⭐</span>
              <span>{item.rating || '4.5'}</span>
              <span className="rating-count">({item.ratingCount || '100+'})</span>
            </div>
            <p className="favorite-item-description">
              {item.description || 'Món ăn ngon với nguyên liệu tươi sống và cách chế biến đặc biệt'}
            </p>
            <div className="favorite-item-price">
              {formatPrice(item.price)}
            </div>
            <div className="favorite-item-actions">
              <button 
                className="add-to-cart-btn"
                onClick={() => onAddToCart(item)}
              >
                Thêm vào giỏ hàng
              </button>
              <button 
                className="remove-favorite-btn"
                onClick={() => onRemove(item.id)}
                title="Xóa khỏi yêu thích"
              >
                ♥
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavoriteItems;