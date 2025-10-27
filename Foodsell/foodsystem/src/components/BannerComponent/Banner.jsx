import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Banner.css';

const Banner = () => {
  const navigate = useNavigate()

  return (
    <div className="banner-container">
      <div className="banner-content">
        <img 
          src="/delicious-food-delivery-hero-image-with-various-di.jpg" 
          alt="Food Delivery Banner" 
          className="banner-image"
        />
        <div className="banner-overlay">
          <h1 className="banner-title">Chào mừng đến với FoodieExpress</h1>
          <p className="banner-subtitle">Đặt món ăn ngon, giao hàng tận nơi</p>
          <button
            type="button"
            className="banner-button"
            onClick={() => navigate('/products')}
          >
            Đặt ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
