import { useState } from "react"
import "./Header.css"

const Header = ({ toggleSidebar }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showNavbar, setShowNavbar] = useState(false)

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="navbar-dropdown">
            <button className="hamburger-btn" onClick={() => setShowNavbar(!showNavbar)}>
              <span></span>
              <span></span>
              <span></span>
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
          <div className="search-container input-group">
            <input type="text" placeholder="Tìm kiếm món ăn..." className="search-input form-control" />
            <button className="search-btn btn btn-primary">🔍</button>
          </div>
        </div>

        <div className="header-actions d-flex align-items-center gap-2">
          <button className="action-btn notification-btn btn btn-light position-relative">
            🔔<span className="notification-badge">3</span>
          </button>

          <button className="action-btn contact-btn btn btn-link">📞 Liên hệ</button>

          <button className="cart-btn">
            🛒 Giỏ hàng (0)
          </button>

          <button className="order-btn">Đặt hàng ngay</button>

          <div className="user-dropdown">
            <button className="user-btn" onClick={() => setShowUserDropdown(!showUserDropdown)}>
              👤
            </button>
            {showUserDropdown && (
              <div className="user-dropdown-menu">
                <a href="#profile" className="dropdown-item">
                  👤 Thông tin cá nhân
                </a>
                <a href="#login" className="dropdown-item">
                  🔑 Đăng nhập
                </a>
                <a href="#logout" className="dropdown-item">
                  🚪 Đăng xuất
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

