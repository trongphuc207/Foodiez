import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './SellerSidebar.css';

const SellerSidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Trang chủ', action: 'navigate', path: '/' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard', action: 'tab' },
    { id: 'products', icon: '☕', label: 'Sản phẩm', action: 'tab' },
    { id: 'revenue', icon: '💰', label: 'Doanh thu', action: 'tab' },
    { id: 'customers', icon: '👥', label: 'Khách hàng', action: 'tab' }
  ];

  const handleMenuClick = (item) => {
    if (item.action === 'navigate') {
      navigate(item.path);
    } else {
      setActiveTab(item.id);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="seller-sidebar">
      <div className="seller-sidebar-header">
        <h2>NHÀ CUNG CẤP</h2>
      </div>

      <nav className="seller-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`seller-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="seller-user-section">
        <div className="seller-user-info">
          <div className="user-avatar">
            <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <div className="user-details">
            <p className="user-name">{user?.username || 'Người dùng'}</p>
            <p className="user-email">{user?.email || 'email@example.com'}</p>
            <p className="user-role">NHÀ CUNG CẤP</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default SellerSidebar;

