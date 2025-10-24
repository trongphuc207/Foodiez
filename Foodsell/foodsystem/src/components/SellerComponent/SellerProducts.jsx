import React from 'react';
import ShopManagement from '../ShopManagementComponent/ShopManagement';
import './SellerProducts.css';

const SellerProducts = () => {
  return (
    <div className="seller-products-wrapper">
      <div className="seller-products-header">
        <h2>Quản lý sản phẩm</h2>
        <p className="seller-products-subtitle">Quản lý tất cả sản phẩm của cửa hàng</p>
      </div>
      <ShopManagement />
    </div>
  );
};

export default SellerProducts;

