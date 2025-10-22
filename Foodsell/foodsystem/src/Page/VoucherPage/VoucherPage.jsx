import React from 'react';
import VoucherSection from '../../components/VoucherComponent/VoucherSection';
import './VoucherPage.css';

const VoucherPage = () => {
  return (
    <div className="voucher-page">
      <div className="voucher-page-container">
        <div className="voucher-page-header">
          <h1>🎫 Trung tâm Voucher</h1>
          <p>Nhận và sử dụng voucher để tiết kiệm khi mua hàng</p>
        </div>
        
        <div className="voucher-page-content">
          <VoucherSection 
            userId={1} // TODO: Lấy từ authentication context
            orderAmount={0} // Không cần cho việc claim voucher
            onVoucherApplied={() => {}} // Không cần cho claim
            appliedVoucher={null}
            onRemoveVoucher={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default VoucherPage;
