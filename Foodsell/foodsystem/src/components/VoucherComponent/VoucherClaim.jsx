import React, { useState } from 'react';
import { claimVoucher } from '../../api/voucher';
import './VoucherClaim.css';

const VoucherClaim = ({ userId, onVoucherClaimed }) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleClaimVoucher = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await claimVoucher(userId, voucherCode);
      setSuccess(`✅ Đã nhận voucher ${voucherCode} thành công!`);
      setVoucherCode('');
      
      // Gọi callback để thông báo cho component cha
      if (onVoucherClaimed) {
        onVoucherClaimed(result);
      }
    } catch (err) {
      // Xử lý lỗi cụ thể
      if (err.message.includes('already claimed')) {
        setError('🎫 Bạn đã nhận voucher này rồi! Vui lòng chọn voucher khác.');
      } else if (err.message.includes('not found')) {
        setError('❌ Mã voucher không tồn tại! Vui lòng kiểm tra lại.');
      } else if (err.message.includes('not valid')) {
        setError('⏰ Voucher đã hết hạn hoặc không còn hiệu lực!');
      } else {
        setError(`❌ ${err.message || 'Không thể nhận voucher'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voucher-claim">
      <div className="claim-header">
        <h3>🎫 Nhận voucher</h3>
        <p>Nhập mã voucher để nhận ưu đãi</p>
      </div>

      <form onSubmit={handleClaimVoucher} className="claim-form">
        <div className="form-group">
          <label>Mã voucher:</label>
          <input
            type="text"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã voucher (VD: SAVE10)"
            required
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="claim-btn"
          disabled={loading || !voucherCode.trim()}
        >
          {loading ? 'Đang xử lý...' : 'Nhận voucher'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          ✅ {success}
        </div>
      )}

      <div className="claim-info">
        <h4>💡 Cách nhận voucher:</h4>
        <ul>
          <li>Nhận mã voucher qua email/SMS từ hệ thống</li>
          <li>Nhận mã từ chương trình khuyến mãi</li>
          <li>Nhận mã từ admin hoặc nhân viên</li>
          <li>Mã voucher có thể có dạng: SAVE10, DISCOUNT20K, WELCOME50</li>
        </ul>
        
        <h4>🎫 Mã voucher mẫu để test:</h4>
        <ul>
          <li><strong>1223ABD</strong> - Giảm 10%, đơn tối thiểu 20k (đã claim)</li>
          <li><strong>4567EFG</strong> - Giảm 15%, đơn tối thiểu 15k</li>
          <li><strong>89HIJKO</strong> - Giảm 5%, đơn tối thiểu 10k</li>
        </ul>
        
        <p><small>💡 <strong>Lưu ý:</strong> Mỗi user chỉ có thể nhận 1 voucher 1 lần. Nếu đã nhận rồi, hãy thử mã khác!</small></p>
      </div>
    </div>
  );
};

export default VoucherClaim;
