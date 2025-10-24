import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';
import SellerDashboard from './SellerDashboard';
import SellerProducts from './SellerProducts';
import SellerOrders from './SellerOrders';
import SellerRevenue from './SellerRevenue';
import SellerCustomers from './SellerCustomers';
import SellerSettings from './SellerSettings';
import './SellerApp.css';

const SellerApp = () => {
  const location = useLocation();
  
  // Determine active tab based on current route
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/revenue')) return 'revenue';
    if (path.includes('/customers')) return 'customers';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SellerDashboard />;
      case 'products':
        return <SellerProducts />;
      case 'orders':
        return <SellerOrders />;
      case 'revenue':
        return <SellerRevenue />;
      case 'customers':
        return <SellerCustomers />;
      case 'settings':
        return <SellerSettings />;
      default:
        return <SellerDashboard />;
    }
  };

  return (
    <div className="seller-app">
      <SellerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="seller-content">
        <SellerHeader />
        <main className="seller-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SellerApp;

