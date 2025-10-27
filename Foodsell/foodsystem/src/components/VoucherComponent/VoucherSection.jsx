import React, { useState } from 'react';
import VoucherClaim from './VoucherClaim';
import VoucherSelector from './VoucherSelector';
import './VoucherSection.css';

const VoucherSection = ({ userId, orderAmount, onVoucherApplied, appliedVoucher, onRemoveVoucher }) => {
  const [activeTab, setActiveTab] = useState('claim'); // 'claim' hoặc 'use'

  return (
    <div className="voucher-section">
      <div className="voucher-tabs">
        <button 
          className={`tab-btn ${activeTab === 'claim' ? 'active' : ''}`}
          onClick={() => setActiveTab('claim')}
        >
          🎫 Nhận voucher
        </button>
        <button 
          className={`tab-btn ${activeTab === 'use' ? 'active' : ''}`}
          onClick={() => setActiveTab('use')}
        >
          💰 Sử dụng voucher
        </button>
      </div>

      <div className="voucher-content">
        {activeTab === 'claim' && (
          <VoucherClaim 
            userId={userId}
            onVoucherClaimed={(voucher) => {
              console.log('Voucher claimed:', voucher);
              // Có thể chuyển sang tab 'use' sau khi claim thành công
              setActiveTab('use');
            }}
          />
        )}

        {activeTab === 'use' && (
          <VoucherSelector
            userId={userId}
            orderAmount={orderAmount}
            onVoucherApplied={onVoucherApplied}
            appliedVoucher={appliedVoucher}
            onRemoveVoucher={onRemoveVoucher}
          />
        )}
      </div>
    </div>
  );
};

export default VoucherSection;
