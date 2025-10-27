// Foodsell/foodsystem/src/components/RouteGuard/RouteGuard.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './RouteGuard.css';


/**
 * RouteGuard: bảo vệ route theo role.
 * - requiredRole: chuỗi role duy nhất (vd: 'admin' | 'seller' | 'shipper')
 * - requiredRoles: mảng role cho phép (vd: ['seller','shipper'])
 * - allowAdminBypass: cho phép tài khoản admin đi qua mọi route (mặc định: true)
 * - redirectTo: trang điều hướng khi không đủ quyền (mặc định: '/')
 * - showLoading: có hiển thị trạng thái loading khi đang load profile
 */
const RouteGuard = ({
  children,
  requiredRole = null,
  requiredRoles = [],
  allowAdminBypass = true,
  redirectTo = '/',
  showLoading = true,
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Đang kiểm tra đăng nhập
  if (loading && showLoading) {
    return (
      <div className="route-guard-loading">
        <div className="spinner" />
        <div>Đang kiểm tra quyền truy cập…</div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.role || '').toLowerCase();

  // ---- ADMIN BYPASS: admin đi qua tất cả các guard ----
  if (allowAdminBypass && role === 'admin') {
    return children;
  }

  // Yêu cầu 1 role duy nhất
  if (requiredRole && role !== requiredRole.toLowerCase()) {
    return <Navigate to={redirectTo} replace />;
  }

  // Yêu cầu 1 trong nhiều role
  if (requiredRoles.length > 0) {
    const ok = requiredRoles.map(r => r.toLowerCase()).includes(role);
    if (!ok) return <Navigate to={redirectTo} replace />;
  }

  // Đủ quyền
  return children;
};

export default RouteGuard;
