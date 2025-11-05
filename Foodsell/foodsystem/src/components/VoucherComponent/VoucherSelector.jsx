import React, { useState, useEffect, useCallback } from 'react';
import { getUserUnusedVouchers, applyVoucher, getActiveVouchers, claimVoucher } from '../../api/voucher';
import './VoucherSelector.css';

const VoucherSelector = ({ userId, orderAmount, onVoucherApplied, appliedVoucher, onRemoveVoucher }) => {
  const [vouchers, setVouchers] = useState([]);
  const [availableVouchers, setAvailableVouchers] = useState([]); // Voucher có sẵn chưa claim
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [claimingVoucher, setClaimingVoucher] = useState(null);

  const loadUserVouchers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Loading vouchers for user ID:', userId);
      const userVouchers = await getUserUnusedVouchers(userId);
      console.log('📦 Received vouchers:', userVouchers);
      console.log('📊 Number of vouchers:', userVouchers?.length || 0);
      
      // Log chi tiết từng voucher
      if (userVouchers && userVouchers.length > 0) {
        userVouchers.forEach((uv, index) => {
          console.log(`Voucher ${index + 1}:`, {
            userVoucherId: uv.id,
            voucherId: uv.voucherId,
            isUsed: uv.isUsed,
            code: uv.voucher?.code,
            discount: uv.voucher?.discountValue,
            minOrder: uv.voucher?.minOrderValue,
            quantity: uv.voucher?.quantity,
            maxUses: uv.voucher?.maxUses,
            usedCount: uv.voucher?.usedCount
          });
        });
      }
      
      setVouchers(userVouchers);
    } catch (err) {
      console.error('❌ Error loading vouchers:', err);
      setError('Không thể tải danh sách voucher: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Lấy danh sách voucher của user
  useEffect(() => {
    if (userId) {
      loadUserVouchers();
      loadAvailableVouchers(); // Load thêm voucher có sẵn
    }
  }, [userId, loadUserVouchers]);

  // Load voucher có sẵn (chưa claim)
  const loadAvailableVouchers = async () => {
    try {
      console.log('🔍 Loading available vouchers...');
      const activeVouchers = await getActiveVouchers();
      console.log('📦 Active vouchers:', activeVouchers);
      setAvailableVouchers(activeVouchers || []);
    } catch (err) {
      console.error('❌ Error loading available vouchers:', err);
    }
  };

  // Claim voucher
  const handleClaimVoucher = async (voucherCode) => {
    setClaimingVoucher(voucherCode);
    setError('');
    try {
      console.log('🎫 Claiming voucher:', voucherCode);
      await claimVoucher(userId, voucherCode);
      console.log('✅ Voucher claimed successfully!');
      
      // Reload voucher list
      await loadUserVouchers();
      await loadAvailableVouchers();
      
      alert('Nhận voucher thành công! Bạn có thể sử dụng voucher này ngay bây giờ.');
    } catch (err) {
      console.error('❌ Error claiming voucher:', err);
      setError(err.message || 'Không thể nhận voucher');
    } finally {
      setClaimingVoucher(null);
    }
  };

  // Áp dụng voucher
  const handleApplyVoucher = async (voucherCode) => {
    setApplyingVoucher(true);
    setError('');
    
    console.log('🎯 Attempting to apply voucher:', {
      userId,
      voucherCode,
      orderAmount
    });
    
    try {
      const discountAmount = await applyVoucher(userId, voucherCode, orderAmount);
      
      console.log('✅ Voucher applied successfully! Discount:', discountAmount);
      
      // Tìm thông tin voucher để hiển thị
      const voucher = vouchers.find(v => v.voucher.code === voucherCode);
      
      if (voucher) {
        const voucherInfo = {
          code: voucherCode,
          discountAmount: discountAmount,
          voucher: voucher.voucher,
          userVoucher: voucher
        };
        
        console.log('📦 Voucher info to be applied:', voucherInfo);
        
        onVoucherApplied(voucherInfo);
        setShowVoucherList(false);
      }
    } catch (err) {
      console.error('❌ Error applying voucher:', err);
      console.error('Error message:', err.message);
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
    
    // Kiểm tra đơn hàng đủ điều kiện tối thiểu
    const meetMinOrderValue = orderAmount >= (voucher.minOrderValue || 0);
    
    // Kiểm tra voucher còn số lượng (quantity > 0)
    const hasQuantity = voucher.quantity === null || voucher.quantity > 0;
    
    // Kiểm tra voucher chưa vượt quá số lần sử dụng (usedCount < maxUses)
    const hasUsageLeft = voucher.maxUses === null || (voucher.usedCount || 0) < voucher.maxUses;
    
    // Kiểm tra voucher chưa hết hạn
    const notExpired = voucher.expiryDate && new Date(voucher.expiryDate) >= new Date();
    
    // Kiểm tra voucher đang active
    const isActive = voucher.isActive !== false;
    
    return meetMinOrderValue && hasQuantity && hasUsageLeft && notExpired && isActive;
  };

  // Lấy lý do không thể áp dụng voucher
  const getCannotApplyReason = (userVoucher) => {
    if (!userVoucher || !userVoucher.voucher) {
      return 'Voucher không hợp lệ';
    }
    
    const voucher = userVoucher.voucher;
    
    // Kiểm tra từng điều kiện và trả về lý do đầu tiên không đạt
    if (voucher.isActive === false) {
      return 'Voucher đã bị vô hiệu hóa';
    }
    
    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return 'Voucher đã hết hạn';
    }
    
    if (voucher.quantity !== null && voucher.quantity <= 0) {
      return 'Voucher đã hết số lượng';
    }
    
    if (voucher.maxUses !== null && (voucher.usedCount || 0) >= voucher.maxUses) {
      return 'Voucher đã hết lượt sử dụng';
    }
    
    if (orderAmount < (voucher.minOrderValue || 0)) {
      return `Đơn hàng chưa đủ ${formatCurrency(voucher.minOrderValue || 0)}`;
    }
    
    return 'Không thể áp dụng';
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
              <small>💡 Hãy nhận voucher có sẵn bên dưới!</small>
            </div>
          ) : (
            <>
              <div className="voucher-section-title">Voucher của bạn</div>
              {vouchers.map((userVoucher) => {
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
                        {voucher.quantity !== null && (
                          <div className={`voucher-quantity ${voucher.quantity <= 10 ? 'low-stock' : ''}`}>
                            Còn lại: {voucher.quantity} voucher
                          </div>
                        )}
                        {voucher.maxUses !== null && (
                          <div className="voucher-usage">
                            Đã dùng: {voucher.usedCount || 0}/{voucher.maxUses}
                          </div>
                        )}
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
                        <div className="cannot-apply" title={getCannotApplyReason(userVoucher)}>
                          {getCannotApplyReason(userVoucher)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Voucher có sẵn để claim */}
          {availableVouchers && availableVouchers.length > 0 && (
            <>
              <div className="voucher-section-title" style={{marginTop: '1rem'}}>
                Voucher có sẵn (Nhận ngay!)
              </div>
              {availableVouchers.map((voucher) => {
                // Check if user already has this voucher
                const alreadyClaimed = vouchers.some(uv => uv.voucher.id === voucher.id);
                
                return (
                  <div 
                    key={voucher.id} 
                    className={`voucher-item ${alreadyClaimed ? 'claimed' : 'available'}`}
                  >
                    <div className="voucher-info">
                      <div className="voucher-code">
                        <span className="voucher-icon">🎁</span>
                        <strong>{voucher.code || 'N/A'}</strong>
                      </div>
                      <div className="voucher-details">
                        <div className="voucher-discount">
                          Giảm {formatDiscount(voucher)}
                        </div>
                        <div className="voucher-condition">
                          Đơn tối thiểu: {formatCurrency(voucher.minOrderValue || 0)}
                        </div>
                        {voucher.quantity !== null && (
                          <div className={`voucher-quantity ${voucher.quantity <= 10 ? 'low-stock' : ''}`}>
                            Còn lại: {voucher.quantity} voucher
                          </div>
                        )}
                        <div className="voucher-expiry">
                          HSD: {voucher.expiryDate ? new Date(voucher.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="voucher-actions">
                      {alreadyClaimed ? (
                        <div className="already-claimed">
                          ✓ Đã nhận
                        </div>
                      ) : (
                        <button
                          className="claim-voucher-btn"
                          onClick={() => handleClaimVoucher(voucher.code)}
                          disabled={claimingVoucher === voucher.code}
                        >
                          {claimingVoucher === voucher.code ? 'Đang nhận...' : 'Nhận voucher'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VoucherSelector;
