import React from 'react';
import { FaTachometerAlt, FaUsers, FaBoxOpen, FaShoppingCart, FaTicketAlt, FaChartBar, FaStar, FaBell, FaComments } from 'react-icons/fa';
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./admin.css";

/**
 * Dùng link TƯƠNG ĐỐI (không có dấu / ở đầu) vì AdminApp được mount tại /admin/*
 * -> "users" => /admin/users
 */
export default function Sidebar() {
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const navs = [
    { path: "", label: "Tổng quan", end: true },
    { path: "users", label: "Người dùng" },
    { path: "orders", label: "Đơn hàng" },
    { path: "vouchers", label: "Voucher" },
    { path: "shops", label: "Quản lý Shop" },
    { path: "role-applications", label: "Đơn xin vai trò" },
    { path: "product-approval", label: "Duyệt sản phẩm" },
    { path: "complaints", label: "Khiếu nại" },
    { path: "reports", label: "Báo cáo" }
  ];

  const switchToRole = (role) => {
    // Open different pages in new tab based on role
    let url = '';
    switch(role) {
      case 'customer':
        url = '/';
        break;
      case 'seller':
        url = '/shop-management';
        break;
      case 'shipper':
        url = '/shipper-dashboard';
        break;
      default:
        return;
    }
    // Open in new tab
    window.open(url, '_blank');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">🍽️Foodiez Admin</div>

        <li className="nav-item mb-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`nav-link d-flex align-items-center text-white w-100 border-0 bg-transparent ${activeTab === 'reports' ? 'fw-bold bg-dark rounded-2 px-2' : ''}`}
          >
            <FaChartBar className="me-2" /> Reports
          </button>
        </li>

        <li className="nav-item mb-2">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`nav-link d-flex align-items-center text-white w-100 border-0 bg-transparent ${activeTab === 'notifications' ? 'fw-bold bg-dark rounded-2 px-2' : ''}`}
          >
            <FaBell className="me-2" /> Notifications
          </button>
        </li>

        <li className="nav-item mb-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`nav-link d-flex align-items-center text-white w-100 border-0 bg-transparent ${activeTab === 'chat' ? 'fw-bold bg-dark rounded-2 px-2' : ''}`}
          >
            <FaComments className="me-2" /> Chat
          </button>
        </li>
      <ul className="admin-nav">
        {navs.map((n) => (
          <li key={n.path}>
            <NavLink
              to={n.path}
              end={n.end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              {n.label}
            </NavLink>
          </li>
        ))}
      </ul>
      
      {/* Role Switcher Toggle - Moved to bottom */}
      <div className="role-switcher-container">
        <button 
          className="role-switcher-toggle"
          onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
        >
          👁️ Hiển thị dưới role khác
          <span className="toggle-icon">{showRoleSwitcher ? '▼' : '▶'}</span>
        </button>
        
        {showRoleSwitcher && (
          <div className="role-switcher-dropdown">
            <button 
              className="role-switch-btn customer"
              onClick={() => switchToRole('customer')}
            >
              🛒 Xem như Customer
            </button>
            <button 
              className="role-switch-btn seller"
              onClick={() => switchToRole('seller')}
            >
              🏪 Xem như Seller
            </button>
            <button 
              className="role-switch-btn shipper"
              onClick={() => switchToRole('shipper')}
            >
              🚚 Xem như Shipper
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}