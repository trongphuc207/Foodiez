import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginSignUp from "../LoginSignUpComponent/LoginSignUp";
import Cart from "../CartComponent/Cart";
import SidebarComponent from "../SidebarComponent/SidebarComponent";
import NotificationBell from "../NotificationComponent/NotificationBell";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../contexts/CartContext";
import "./Header.css";

const Header = ({ toggleSidebar }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [showNavbar] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  // Mobile search overlay
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // NEW: state mở modal và mode (login/signup)
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Use useAuth hook instead of isAuthenticated()
  const { user, logout, isAuthenticated } = useAuth();

  // Cart context
  const { getTotalItems } = useCart();

  // Navigate hook
  const navigate = useNavigate();

  // Handle navigation after successful login
  useEffect(() => {
    const handleAuthSuccess = (event) => {
      const userData = event.detail?.data;
      if (userData) {
        console.log('🎉 Auth success in Header:', userData);
        
        // Redirect to Home after login (regardless of role)
        navigate('/');
        
        // Close auth modal
        setShowAuth(false);
      }
    };

    window.addEventListener('authSuccess', handleAuthSuccess);
    return () => window.removeEventListener('authSuccess', handleAuthSuccess);
  }, [navigate]);

  // Handle open cart event from sidebar
  useEffect(() => {
    const handleOpenCart = () => {
      setShowCart(true);
    };

    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, []);

  // Đóng modal khi bấm ESC và quản lý scrollbar
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowAuth(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Quản lý scrollbar khi modal mở/đóng
  useEffect(() => {
    if (showAuth) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup khi component unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showAuth]);

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setShowAuth(true);
    setShowUserDropdown(false);
  };

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
          {/* Hamburger menu bên trái */}
          <button
            className="hamburger-btn"
            onClick={() => setShowSidebar(true)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
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
          <div className="logo-icon-wrapper">
            <span className="logo-icon">🍔</span>
          </div>
          <h1 className="logo-text">FoodieExpress</h1>
        </div>

        <div className="header-center">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchKeyword);
                }
              }}
            />
          </div>
        </div>

        <div className="header-actions">
          {/* Mobile search toggle icon */}
          <button
            type="button"
            className="search-toggle"
            aria-label="Mở tìm kiếm"
            onClick={() => setShowMobileSearch(true)}
          >
            🔍
          </button>
          {isAuthenticated && <NotificationBell />}

          <button className="action-btn chat-btn" onClick={() => navigate('/chat')}>
            <span className="action-icon">💬</span>
            <span className="action-text">Chat</span>
          </button>

          <div className="contact-wrapper">
            <button
              type="button"
              className="action-btn contact-btn"
              onClick={() => {
                setShowContactDropdown(!showContactDropdown)
                setShowUserDropdown(false)
              }}
            >
              <span className="action-icon">📞</span>
              <span className="action-text">Liên hệ</span>
            </button>

            {showContactDropdown && (
              <div className="contact-dropdown">
                <a className="contact-item" href="tel:0978126731">📞 0978126731</a>
              </div>
            )}
          </div>

          <button 
            className="action-btn voucher-btn"
            onClick={() => navigate('/vouchers')}
          >
            <span className="action-icon">🎁</span>
            <span className="action-text">Voucher</span>
          </button>

          {user ? (
            <button 
              className="order-btn"
              onClick={() => navigate('/orders')}
            >
              Đơn hàng
            </button>
          ) : (
            <button className="order-btn" onClick={() => navigate('/products')}>
              Đặt hàng ngay
            </button>
          )}

          <button 
            className="cart-btn"
            onClick={() => setShowCart(true)}
          >
            <span className="cart-icon">🛒</span>
            {getTotalItems() > 0 && (
              <span className="cart-badge">{getTotalItems()}</span>
            )}
          </button>

          <div className="user-dropdown">
            <button
              className="user-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <span className="user-icon">👤</span>
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
                    {(user?.role === 'seller' || user?.role === 'shipper' || user?.role === 'buyer') && (
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          navigate('/orders');
                          setShowUserDropdown(false);
                        }}
                      >
                        📦 Đơn hàng của tôi
                      </button>
                    )}
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
                    {/** Seller-specific link to shop management remains above. The separate
                        "Tạo đơn giao cho shipper" menu item was removed in favor of an
                        inline control inside the Shop Management -> Quản lý đơn hàng tab. */}
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
          <LoginSignUp
            defaultMode={authMode}
            onClose={() => setShowAuth(false)}
          />
        </div>
      )}

      {/* === Cart Modal === */}
      <Cart 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
      />

      {/* === Sidebar === */}
      <SidebarComponent 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)} 
      />

      {/* === Mobile Search Overlay === */}
      {showMobileSearch && (
        <div className="mobile-search-overlay" role="dialog" aria-label="Tìm kiếm" onKeyDown={(e) => e.key === 'Escape' && setShowMobileSearch(false)}>
          <input
            autoFocus
            type="text"
            className="mobile-search-input"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchKeyword);
                setShowMobileSearch(false);
              }
            }}
          />
          <button
            className="mobile-search-submit"
            onClick={() => {
              handleSearch(searchKeyword);
              setShowMobileSearch(false);
            }}
          >Tìm</button>
          <button
            className="mobile-search-close"
            aria-label="Đóng tìm kiếm"
            onClick={() => setShowMobileSearch(false)}
          >✖</button>
        </div>
      )}
    </header>
  );
};

export default Header;