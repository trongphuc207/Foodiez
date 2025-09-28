// src/Components/Header/Header.jsx
import React, { useEffect, useState } from "react";
import "./Header.css";
import LoginSignUp from "../LoginSignUpComponent/LoginSignUp";

const Header = ({ toggleSidebar }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);

  // NEW: state mở modal và mode (login/signup)
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Đóng modal khi bấm ESC
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setShowAuth(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuth(true);
    setShowUserDropdown(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="navbar-dropdown">
            <button className="hamburger-btn" onClick={() => setShowNavbar(!showNavbar)}>
              <span></span><span></span><span></span>
            </button>
            {showNavbar && (
              <div className="navbar-menu">
                <a href="/" className="navbar-link">🏠 Trang chủ</a>
                <a href="/products" className="navbar-link">🍕 Sản phẩm</a>
                <a href="/orders" className="navbar-link">📋 Đơn hàng</a>
                <a href="/about" className="navbar-link">ℹ️ Giới thiệu</a>
              </div>
            )}
          </div>
        </div>

        <div className="logo">
          <span className="logo-icon">🍽️</span>
          <h1 className="logo-text">FoodieExpress</h1>
        </div>

        <div className="header-center">
          <div className="search-container">
            <input type="text" placeholder="Tìm kiếm món ăn..." className="search-input" />
            <button className="search-btn">🔍</button>
          </div>
        </div>

        <div className="header-actions">
          <button className="action-btn notification-btn">
            🔔<span className="notification-badge">3</span>
          </button>

          <button className="action-btn contact-btn">📞 Liên hệ</button>

          <button className="cart-btn">🛒 Giỏ hàng (0)</button>

          <button className="order-btn">Đặt hàng ngay</button>

          <div className="user-dropdown">
            <button className="user-btn" onClick={() => setShowUserDropdown(!showUserDropdown)}>👤</button>
            {showUserDropdown && (
              <div className="user-dropdown-menu">
                <button className="dropdown-item" onClick={() => openAuth('login')}>
                  🔑 Đăng nhập
                </button>
                <button className="dropdown-item" onClick={() => openAuth('signup')}>
                  ✍️ Đăng ký
                </button>
                <a href="#profile" className="dropdown-item">👤 Thông tin cá nhân</a>
                <a href="#logout" className="dropdown-item">🚪 Đăng xuất</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === Modal Auth === */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <LoginSignUp defaultMode={authMode} onClose={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
