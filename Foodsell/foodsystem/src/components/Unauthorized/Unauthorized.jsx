import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Unauthorized.css'
import { FiShield, FiHome, FiArrowLeft } from 'react-icons/fi'

const Unauthorized = ({ requiredRole = null, requiredRoles = [] }) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'customer': return 'Khách hàng'
      case 'seller': return 'Nhà cung cấp'
      case 'shipper': return 'Shipper'
      case 'admin': return 'Quản trị viên'
      default: return role
    }
  }

  const getRequiredRolesText = () => {
    if (requiredRole) {
      return getRoleDisplayName(requiredRole)
    }
    if (requiredRoles.length > 0) {
      return requiredRoles.map(role => getRoleDisplayName(role)).join(', ')
    }
    return 'Quyền truy cập'
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">
          <FiShield />
        </div>
        
        <h1 className="unauthorized-title">Không có quyền truy cập</h1>
        
        <div className="unauthorized-message">
          <p>Bạn không có quyền truy cập vào trang này.</p>
          
          <div className="role-info">
            <div className="current-role">
              <span className="label">Vai trò hiện tại:</span>
              <span className="value">{getRoleDisplayName(user?.role)}</span>
            </div>
            
            <div className="required-role">
              <span className="label">Quyền yêu cầu:</span>
              <span className="value">{getRequiredRolesText()}</span>
            </div>
          </div>
        </div>

        <div className="unauthorized-actions">
          <button className="action-btn primary" onClick={handleGoHome}>
            <FiHome />
            Về trang chủ
          </button>
          
          <button className="action-btn secondary" onClick={handleGoBack}>
            <FiArrowLeft />
            Quay lại
          </button>
        </div>

        <div className="unauthorized-help">
          <p>Nếu bạn cần quyền truy cập, vui lòng liên hệ với quản trị viên.</p>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
