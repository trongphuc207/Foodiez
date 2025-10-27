// Foodsell/foodsystem/src/components/SidebarComponent/SidebarComponent.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './SidebarComponent.css'
import { 
  FiHome, 
  FiShoppingBag, 
  FiShoppingCart, 
  FiPackage, 
  FiHeart, 
  FiMapPin, 
  FiMessageCircle,
  FiCoffee,
  FiBarChart,
  FiDollarSign,
  FiUsers,
  FiSettings,
  FiStar,
  FiX,
  FiLogOut,
  FiUser
} from 'react-icons/fi'

const SidebarComponent = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // role mặc định lấy từ user, nếu không có thì là customer
  const [currentRole, setCurrentRole] = useState((user?.role || 'customer').toLowerCase())

  const handleNavigate = (path) => {
    navigate(path)
    onClose && onClose()
  }

  // ===== MENU CHO TỪNG ROLE =====
  const customerMenuItems = [
    { icon: <FiHome />, label: 'Trang chủ', path: '/' },
    { icon: <FiShoppingBag />, label: 'Sản phẩm', path: '/products' },
    { icon: <FiShoppingCart />, label: 'Giỏ hàng', path: '/cart' },
    { icon: <FiPackage />, label: 'Đơn hàng của tôi', path: '/orders' },
    { icon: <FiHeart />, label: 'Yêu thích', path: '/favorites' },
    { icon: <FiMapPin />, label: 'Địa chỉ giao hàng', path: '/addresses' },
    { icon: <FiMessageCircle />, label: 'Hỗ trợ', path: '/support' }
  ]

  const sellerMenuItems = [
    { icon: <FiHome />, label: 'Trang chủ', path: '/seller' },
    { icon: <FiCoffee />, label: 'Sản phẩm', path: '/seller/products' },
    { icon: <FiBarChart />, label: 'Dashboard', path: '/seller/dashboard' },
    { icon: <FiPackage />, label: 'Đơn hàng', path: '/seller/orders' },
    { icon: <FiDollarSign />, label: 'Doanh thu', path: '/seller/revenue' },
    { icon: <FiUsers />, label: 'Khách hàng', path: '/seller/customers' },
    { icon: <FiSettings />, label: 'Cài đặt', path: '/seller/settings' }
  ]

  const shipperMenuItems = [
    { icon: <FiHome />, label: 'Trang chủ', path: '/shipper' },
    { icon: <FiPackage />, label: 'Đơn hàng', path: '/shipper/orders' },
    { icon: <FiBarChart />, label: 'Dashboard', path: '/shipper/dashboard' },
    { icon: <FiMapPin />, label: 'Tuyến đường', path: '/shipper/routes' },
    { icon: <FiDollarSign />, label: 'Thu nhập', path: '/shipper/earnings' },
    { icon: <FiStar />, label: 'Đánh giá', path: '/shipper/reviews' },
    { icon: <FiSettings />, label: 'Cài đặt', path: '/shipper/settings' }
  ]

  // >>>> THÊM MENU ADMIN <<<<
  const adminMenuItems = [
    { icon: <FiHome />, label: 'Trang quản trị', path: '/admin' },
    { icon: <FiBarChart />, label: 'Analytics', path: '/admin/analytics' },
    { icon: <FiUsers />, label: 'Người dùng', path: '/admin/users' },
    { icon: <FiPackage />, label: 'Sản phẩm', path: '/admin/products' },
    { icon: <FiDollarSign />, label: 'Doanh thu', path: '/admin/revenue' },
    { icon: <FiSettings />, label: 'Cài đặt', path: '/admin/settings' },
  ]

  const getMenuItems = () => {
    switch (currentRole) {
      case 'admin':
        return adminMenuItems
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
      case 'admin':
        return 'ADMIN'
      case 'seller':
        return 'NHÀ CUNG CẤP'
      case 'shipper':
        return 'SHIPPER'
      default:
        return 'CUSTOMER'
    }
  }

  const handleRoleSwitch = (role) => {
    // Admin được phép chuyển sang các vai trò khác để xem giao diện
    // Người thường chỉ được xem giao diện đúng quyền của mình
    const canSwitch =
      user?.role === 'admin' ||
      user?.role?.toLowerCase() === role?.toLowerCase() ||
      user?.roles?.includes(role)

    if (canSwitch) {
      setCurrentRole(role.toLowerCase())
      // điều hướng nhanh theo role khi đổi
      if (role === 'admin') handleNavigate('/admin')
      else if (role === 'seller') handleNavigate('/seller')
      else if (role === 'shipper') handleNavigate('/shipper')
      else handleNavigate('/')
    } else {
      alert('Bạn không có quyền chuyển đổi sang vai trò này!')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (!isOpen) return null

  return (
    <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <aside className="sidebar" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="role-badge">{getRoleLabel()}</div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {getMenuItems().map((item, index) => (
            <button
              key={index}
              className="nav-item"
              onClick={() => handleNavigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Role Switching - hiển thị nếu là admin hoặc có nhiều role */}
        {(user?.role?.toLowerCase() === 'admin' || user?.roles?.length > 1) && (
          <div className="role-switching">
            <h3 className="role-switching-title">CHUYỂN ĐỔI VAI TRÒ</h3>
            <div className="role-buttons">
              <button
                className={`role-btn ${currentRole === 'customer' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('customer')}
              >
                Khách hàng
              </button>
              <button
                className={`role-btn ${currentRole === 'seller' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('seller')}
              >
                Seller
              </button>
              <button
                className={`role-btn ${currentRole === 'shipper' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('shipper')}
              >
                Shipper
              </button>
              <button
                className={`role-btn ${currentRole === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('admin')}
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {user && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <FiUser />
              </div>
              <div className="user-details">
                <div className="user-name">{user.fullName || user.full_name || user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut /> Đăng xuất
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

export default SidebarComponent
