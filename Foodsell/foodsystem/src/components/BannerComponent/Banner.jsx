import React from 'react';
import './Banner.css';

const Banner = () => {
  return (
    <div className="banner-container">
      <div className="banner-content">
        <img 
          src="/delicious-food-delivery-hero-image-with-various-di.jpg" 
          alt="Food Delivery Banner" 
          className="banner-image"
        />
        <div className="banner-overlay">
          <h1 className="banner-title">Chào mừng đến với Foodsell</h1>
          <p className="banner-subtitle">Đặt món ăn ngon, giao hàng tận nơi</p>
          <button className="banner-button">Đặt ngay</button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
