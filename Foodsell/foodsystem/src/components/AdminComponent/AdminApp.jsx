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
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-content">
        <Header />
        <main className="admin-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminApp;