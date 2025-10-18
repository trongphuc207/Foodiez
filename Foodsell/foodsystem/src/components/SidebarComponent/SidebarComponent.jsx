import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './SidebarComponent.css'

const SidebarComponent = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [currentRole, setCurrentRole] = useState(user?.role || 'customer')

  // Cập nhật currentRole khi user thay đổi
  React.useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role)
    }
  }, [user?.role])

  const customerMenuItems = [
    { icon: <i className="bi bi-house-door"></i>, label: 'Trang chủ', path: '/' },
    { icon: <i className="bi bi-bag"></i>, label: 'Sản phẩm', path: '/products' },
    { icon: <i className="bi bi-cart"></i>, label: 'Giỏ hàng', path: '/cart' },
    { icon: <i className="bi bi-box"></i>, label: 'Đơn hàng của tôi', path: '/orders' },
    { icon: <i className="bi bi-heart"></i>, label: 'Yêu thích', path: '/favorites' },
    { icon: <i className="bi bi-geo-alt"></i>, label: 'Địa chỉ giao hàng', path: '/delivery-address' },
    { icon: <i className="bi bi-chat-dots"></i>, label: 'Hỗ trợ', path: '/support' }
  ]

  const sellerMenuItems = [
    { icon: <i className="bi bi-house-door"></i>, label: 'Trang chủ', path: '/seller' },
    { icon: <i className="bi bi-cup-hot"></i>, label: 'Sản phẩm', path: '/seller/products' },
    { icon: <i className="bi bi-graph-up"></i>, label: 'Dashboard', path: '/seller/dashboard' },
    { icon: <i className="bi bi-box"></i>, label: 'Đơn hàng', path: '/seller/orders' },
    { icon: <i className="bi bi-currency-dollar"></i>, label: 'Doanh thu', path: '/seller/revenue' },
    { icon: <i className="bi bi-people"></i>, label: 'Khách hàng', path: '/seller/customers' },
    { icon: <i className="bi bi-gear"></i>, label: 'Cài đặt', path: '/seller/settings' }
  ]

  const shipperMenuItems = [
    { icon: <i className="bi bi-house-door"></i>, label: 'Trang chủ', path: '/' },
    { icon: <i className="bi bi-box"></i>, label: 'Đơn hàng', path: '/shipper/orders' },
    { icon: <i className="bi bi-graph-up"></i>, label: 'Dashboard', path: '/shipper/dashboard' },
    { icon: <i className="bi bi-currency-dollar"></i>, label: 'Thu nhập', path: '/shipper/earnings' },
    { icon: <i className="bi bi-star"></i>, label: 'Đánh giá', path: '/shipper/history' },
    { icon: <i className="bi bi-gear"></i>, label: 'Cài đặt', path: '/shipper/overview' }
  ]

  const getMenuItems = () => {
    switch (currentRole) {
      case 'seller':
        return sellerMenuItems
      case 'shipper':
        return shipperMenuItems
      default:
        return customerMenuItems
    }
  }

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'seller':
        return 'NHÀ CUNG CẤP'
      case 'shipper':
        return 'SHIPPER'
      default:
        return 'CUSTOMER'
    }
  }

  const handleRoleSwitch = (role) => {
    // Chỉ cho phép chuyển đổi role nếu user thực sự có quyền đó
    // Hoặc có thể thêm logic kiểm tra quyền admin
    if (user?.role === 'admin' || user?.role === role) {
      setCurrentRole(role)
      console.log('Switching to role:', role)
    } else {
      alert('Bạn không có quyền chuyển đổi sang vai trò này!')
    }
  }

  const handleMenuItemClick = (path) => {
    navigate(path)
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="sidebar-overlay" onClick={onClose}></div>
      
      {/* Sidebar */}
      <div className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="role-badge">
            {getRoleLabel()}
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {getMenuItems().map((item, index) => (
            <button
              key={index}
              className="nav-item"
              onClick={() => handleMenuItemClick(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Role Switching - Chỉ hiển thị nếu user có nhiều role hoặc là admin */}
        {(user?.role === 'admin' || user?.roles?.length > 1) && (
          <div className="role-switching">
            <h3 className="role-switching-title">CHUYỂN ĐỔI VAI TRÒ</h3>
            <div className="role-buttons">
              {user?.roles?.includes('customer') && (
                <button
                  className={`role-btn ${currentRole === 'customer' ? 'active' : ''}`}
                  onClick={() => handleRoleSwitch('customer')}
                >
                  Khách hàng
                </button>
              )}
              {user?.roles?.includes('seller') && (
                <button
                  className={`role-btn ${currentRole === 'seller' ? 'active' : ''}`}
                  onClick={() => handleRoleSwitch('seller')}
                >
                  Nhà cung cấp
                </button>
              )}
              {user?.roles?.includes('shipper') && (
                <button
                  className={`role-btn ${currentRole === 'shipper' ? 'active' : ''}`}
                  onClick={() => handleRoleSwitch('shipper')}
                >
                  Shipper
                </button>
              )}
            </div>
          </div>
        )}

        {/* User Info & Logout */}
        {user && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <i className="bi bi-person"></i>
              </div>
              <div className="user-details">
                <div className="user-name">{user.fullName}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default SidebarComponent
