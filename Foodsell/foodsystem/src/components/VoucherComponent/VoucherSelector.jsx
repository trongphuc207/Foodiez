import React, { useState, useEffect } from 'react';
import { getUserUnusedVouchers, applyVoucher } from '../../api/voucher';
import './VoucherSelector.css';

const VoucherSelector = ({ userId, orderAmount, onVoucherApplied, appliedVoucher, onRemoveVoucher }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // Lấy danh sách voucher của user
  useEffect(() => {
    if (userId) {
      loadUserVouchers();
    }
  }, [userId]);

  const loadUserVouchers = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Loading vouchers for user ID:', userId);
      const userVouchers = await getUserUnusedVouchers(userId);
      console.log('📦 Received vouchers:', userVouchers);
      console.log('📊 Number of vouchers:', userVouchers?.length || 0);
      setVouchers(userVouchers);
    } catch (err) {
      console.error('❌ Error loading vouchers:', err);
      setError('Không thể tải danh sách voucher: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Áp dụng voucher
  const handleApplyVoucher = async (voucherCode) => {
    setApplyingVoucher(true);
    setError('');
    try {
      const discountAmount = await applyVoucher(userId, voucherCode, orderAmount);
      
      // Tìm thông tin voucher để hiển thị
      const voucher = vouchers.find(v => v.voucher.code === voucherCode);
      
      if (voucher) {
        const voucherInfo = {
          code: voucherCode,
          discountAmount: discountAmount,
          voucher: voucher.voucher,
          userVoucher: voucher
        };
        
        onVoucherApplied(voucherInfo);
        setShowVoucherList(false);
      }
    } catch (err) {
      setError(err.message || 'Không thể áp dụng voucher');
    } finally {
      setApplyingVoucher(false);
    }
  };

  // Xóa voucher đã áp dụng
  const handleRemoveVoucher = () => {
    onRemoveVoucher();
  };

  // Format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format phần trăm
  const formatDiscount = (voucher) => {
    if (!voucher) return 'N/A';
    
    if (voucher.discountType === 'percentage') {
      return `${voucher.discountValue || 0}%`;
    } else {
      return formatCurrency(voucher.discountValue || 0);
    }
  };

  // Kiểm tra voucher có thể áp dụng không
  const canApplyVoucher = (userVoucher) => {
    // Kiểm tra null/undefined
    if (!userVoucher || !userVoucher.voucher) {
      return false;
    }
    
    const voucher = userVoucher.voucher;
    return orderAmount >= (voucher.minOrderValue || 0);
  };

  if (loading) {
    return (
      <div className="voucher-selector">
        <div className="voucher-loading">Đang tải voucher...</div>
      </div>
    );
  }

  return (
    <div className="voucher-selector">
      <div className="voucher-header">
        <h3>🎫 Mã giảm giá</h3>
        {!appliedVoucher && (
          <button 
            className="voucher-toggle-btn"
            onClick={() => setShowVoucherList(!showVoucherList)}
          >
            {showVoucherList ? 'Ẩn' : 'Chọn voucher'}
          </button>
        )}
      </div>

      {error && (
        <div className="voucher-error">
          {error}
        </div>
      )}

      {/* Voucher đã áp dụng */}
      {appliedVoucher && (
        <div className="applied-voucher">
          <div className="applied-voucher-info">
            <div className="voucher-code">
              <span className="voucher-icon">🎫</span>
              <strong>{appliedVoucher.code}</strong>
            </div>
            <div className="voucher-discount">
              Giảm: {formatCurrency(appliedVoucher.discountAmount)}
            </div>
          </div>
          <button 
            className="remove-voucher-btn"
            onClick={handleRemoveVoucher}
            disabled={applyingVoucher}
          >
            Xóa
          </button>
        </div>
      )}

      {/* Danh sách voucher */}
      {showVoucherList && !appliedVoucher && (
        <div className="voucher-list">
          {!vouchers || vouchers.length === 0 ? (
            <div className="no-vouchers">
              <p>Bạn chưa có voucher nào</p>
              <small>Voucher sẽ được gửi qua email hoặc SMS</small>
              <br />
              <small>💡 Thử nhận voucher trước bằng cách nhập mã voucher</small>
            </div>
          ) : (
            vouchers.map((userVoucher) => {
              // Kiểm tra null/undefined
              if (!userVoucher || !userVoucher.voucher) {
                return null; // Bỏ qua voucher không hợp lệ
              }
              
              const voucher = userVoucher.voucher;
              const canApply = canApplyVoucher(userVoucher);
              
              return (
                <div 
                  key={userVoucher.id} 
                  className={`voucher-item ${!canApply ? 'disabled' : ''}`}
                >
                  <div className="voucher-info">
                    <div className="voucher-code">
                      <span className="voucher-icon">🎫</span>
                      <strong>{voucher.code || 'N/A'}</strong>
                    </div>
                    <div className="voucher-details">
                      <div className="voucher-discount">
                        Giảm {formatDiscount(voucher)}
                      </div>
                      <div className="voucher-condition">
                        Đơn tối thiểu: {formatCurrency(voucher.minOrderValue || 0)}
                      </div>
                      <div className="voucher-expiry">
                        HSD: {voucher.expiryDate ? new Date(voucher.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="voucher-actions">
                    {canApply ? (
                      <button
                        className="apply-voucher-btn"
                        onClick={() => handleApplyVoucher(voucher.code)}
                        disabled={applyingVoucher}
                      >
                        {applyingVoucher ? 'Đang áp dụng...' : 'Áp dụng'}
                      </button>
                    ) : (
                      <div className="cannot-apply">
                        Đơn hàng chưa đủ điều kiện
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default VoucherSelector;
