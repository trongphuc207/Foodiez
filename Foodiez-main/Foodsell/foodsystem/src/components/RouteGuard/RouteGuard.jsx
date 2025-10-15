import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './RouteGuard.css'

const RouteGuard = ({ 
  children, 
  requiredRole = null, 
  requiredRoles = [],
  redirectTo = '/',
  showLoading = true 
}) => {
  const { user, loading, isAuthenticated } = useAuth()

  // Hiển thị loading nếu đang kiểm tra authentication
  if (loading && showLoading) {
    return (
      <div className="route-guard-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Đang kiểm tra quyền truy cập...</div>
      </div>
    )
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Không yêu cầu role cụ thể
  if (!requiredRole && requiredRoles.length === 0) {
    return children
  }

  // Kiểm tra role đơn
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={redirectTo} replace />
  }

  // Kiểm tra multiple roles
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return <Navigate to={redirectTo} replace />
  }

  // Có quyền truy cập
  return children
}

export default RouteGuard
