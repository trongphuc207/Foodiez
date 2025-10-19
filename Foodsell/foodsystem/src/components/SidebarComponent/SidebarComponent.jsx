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
  const [currentRole, setCurrentRole] = useState(user?.role || 'customer')

  // Cập nhật currentRole khi user thay đổi
  React.useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role)
    }
  }, [user?.role])

  const customerMenuItems = [
    { icon: <FiHome />, label: 'Trang chủ', path: '/' },
    { icon: <FiShoppingBag />, label: 'Sản phẩm', path: '/products' },
    { icon: <FiShoppingCart />, label: 'Giỏ hàng', path: '/cart' },
    { icon: <FiPackage />, label: 'Đơn hàng của tôi', path: '/orders' },
    { icon: <FiHeart />, label: 'Yêu thích', path: '/favorites' },
    { icon: <FiMapPin />, label: 'Địa chỉ giao hàng', path: '/delivery-address' },
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
    { icon: <FiHome />, label: 'Trang chủ', path: '/' },
    { icon: <FiPackage />, label: 'Đơn hàng', path: '/shipper/orders' },
    { icon: <FiBarChart />, label: 'Dashboard', path: '/shipper/dashboard' },
    { icon: <FiMapPin />, label: 'Tuyến đường', path: '/shipper/routes' },
    { icon: <FiDollarSign />, label: 'Thu nhập', path: '/shipper/earnings' },
    { icon: <FiStar />, label: 'Đánh giá', path: '/shipper/reviews' },
    { icon: <FiSettings />, label: 'Cài đặt', path: '/shipper/settings' }
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
            <FiX />
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
                <FiUser />
              </div>
              <div className="user-details">
                <div className="user-name">{user.fullName}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default SidebarComponent
