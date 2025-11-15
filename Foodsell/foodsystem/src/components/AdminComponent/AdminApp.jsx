import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import ProductManagement from './ProductManagement';
import Orders from './Orders';
import Users from './Users';
import Vouchers from './Vouchers';
import Reports from './Reports';
import VoucherManager from './VoucherManager';
import AdminReviewManagement from '../ReviewComponent/AdminReviewManagement';
import NotificationManagement from './NotificationManagement';
import ChatManagement from './ChatManagement';
import './admin.css';

const AdminApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <Orders />;
      case 'users':
        return <Users />;
      case 'vouchers':
        return <Vouchers />;
      case 'voucher-manager':
        return <VoucherManager />;
      case 'reports':
        return <Reports />;
      case 'reviews':
        return <AdminReviewManagement />;
      case 'notifications':
        return <NotificationManagement />;
      case 'chat':
        return <ChatManagement />;
      default:
        return <Dashboard />;
    }
  };

/**
 * Lưu ý:
 * - KHÔNG dùng BrowserRouter ở đây. Router tổng đã bọc ở App chính.
 * - Dùng route tương đối: "", "users", "orders", ...
 * - Ở App chính: <Route path="/admin/*" element={<RouteGuard requiredRole="admin"><AdminApp/></RouteGuard>} />
 */
export default function AdminApp() {
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Header />
        <div className="admin-content p-4">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="orders" element={<Orders />} />
            <Route path="vouchers" element={<Vouchers />} />
            <Route path="shops" element={<Shops />} />
            <Route path="role-applications" element={<RoleApplications />} />
            <Route path="product-approval" element={<ProductApproval />} />
            <Route path="complaints" element={<ComplaintManagement />} />
            <Route path="reports" element={<Reports />} />

            {/* fallback */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
