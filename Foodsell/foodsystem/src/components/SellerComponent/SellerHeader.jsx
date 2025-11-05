import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import './SellerHeader.css';

const SellerHeader = () => {
  const { user } = useAuth();

  return (
    <header className="seller-header">
      <div className="seller-header-content">
        <h1>Dashboard Người Bán</h1>
        <div className="seller-header-user">
          <span className="welcome-text">Xin chào, {user?.username || 'Seller'}</span>
          <div className="notification-icon">
            🔔
            <span className="notification-badge">3</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SellerHeader;


