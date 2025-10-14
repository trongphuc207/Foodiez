import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonInputSearch from "../ButtonInputSearch/ButtonInputSearch";
import LoginSignUp from "../LoginSignUpComponent/LoginSignUp";
import Cart from "../CartComponent/Cart";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../contexts/CartContext";
import "./Header.css";

const Header = ({ toggleSidebar }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // NEW: state mở modal và mode (login/signup)
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Use useAuth hook instead of isAuthenticated()
  const { user, logout, isAuthenticated } = useAuth();

  // Cart context
  const { getTotalItems } = useCart();

  // Đóng modal khi bấm ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowAuth(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setShowAuth(true);
    setShowUserDropdown(false);
  };

  const navigate = useNavigate();

  const handleSearch = (keyword) => {
    if (!keyword) return;
    const params = new URLSearchParams({ search: keyword });
    navigate(`/products?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    alert('Đã đăng xuất!');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="navbar-dropdown">
            <button
              className="hamburger-btn"
              onClick={() => setShowNavbar(!showNavbar)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            {showNavbar && (
              <div className="navbar-menu">
                <a href="/" className="navbar-link">
                  🏠 Trang chủ
                </a>
                <a href="/products" className="navbar-link">
                  🍕 Sản phẩm
                </a>
                <a href="/orders" className="navbar-link">
                  📋 Đơn hàng
                </a>
                <a href="/shops" className="navbar-link">
                  🏪 Cửa hàng
                </a>
                <a href="/about" className="navbar-link">
                  ℹ️ Giới thiệu
                </a>
              </div>
            )}
          </div>
        </div>

        <div
          className="logo"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate('/');
            }
          }}
        >
          <span className="logo-icon">🍽️</span>
          <h1 className="logo-text">FoodieExpress</h1>
        </div>

        <div className="header-center">
          <div className="search-container">
            <ButtonInputSearch
              placeholder="Tìm kiếm món ăn, nhà hàng..."
              textButton="Tìm kiếm"
              size="large"
              onSearch={handleSearch}
            />
          </div>
        </div>

        <div className="header-actions">
          <button className="action-btn notification-btn">
            🔔<span className="notification-badge">3</span>
          </button>

          <button className="action-btn contact-btn">📞 Liên hệ</button>

          <button 
            className="cart-btn"
            onClick={() => setShowCart(true)}
          >
            🛒 Giỏ hàng ({getTotalItems()})
          </button>

          <button className="order-btn">Đặt hàng ngay</button>

          <div className="user-dropdown">
            <button
              className="user-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              👤
            </button>
            {showUserDropdown && (
              <div className="user-dropdown-menu">
                {!isAuthenticated ? (
                  <>
                    <button
                      className="dropdown-item"
                      onClick={() => openAuth("login")}
                    >
                      🔑 Đăng nhập
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => openAuth("signup")}
                    >
                      ✍️ Đăng ký
                    </button>
                  </>
                ) : (
                  <>
                    <div className="user-info">
                      <span className="user-name">{user?.fullName}</span>
                      <span className="user-role">{user?.role}</span>
                    </div>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/profile');
                        setShowUserDropdown(false);
                      }}
                    >
                      👤 Thông tin cá nhân
                    </button>
                    {user?.role === 'seller' && (
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          navigate('/shop-management');
                          setShowUserDropdown(false);
                        }}
                      >
                        🏪 Quản lý cửa hàng
                      </button>
                    )}
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      🚪 Đăng xuất
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === Modal Auth === */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <LoginSignUp
              defaultMode={authMode}
              onClose={() => setShowAuth(false)}
            />
          </div>
        </div>
      )}

      {/* === Cart Modal === */}
      <Cart 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
      />
    </header>
  );
};

export default Header;

