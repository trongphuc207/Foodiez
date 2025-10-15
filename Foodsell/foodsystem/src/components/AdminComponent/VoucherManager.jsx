import React, { useState, useEffect } from 'react';
import { createVoucher, generateVoucherCode, getActiveVouchers } from '../../api/voucher';
import './VoucherManager.css';

const VoucherManager = () => {
  const [vouchers, setVouchers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    expiryDate: '',
    maxUses: ''
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const data = await getActiveVouchers();
      setVouchers(data);
    } catch (err) {
      setError('Không thể tải danh sách voucher');
    }
  };

  // Tạo mã voucher tự động
  const handleGenerateCode = async () => {
    try {
      const code = await generateVoucherCode();
      setFormData(prev => ({ ...prev, code }));
    } catch (err) {
      setError('Không thể tạo mã voucher');
    }
  };

  // Tạo voucher mới
  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const voucherData = {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: parseFloat(formData.minOrderValue) || 0,
        expiryDate: formData.expiryDate,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        createdBy: 1 // TODO: Lấy từ authentication context
      };

      await createVoucher(voucherData);
      
      // Reset form
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: '',
        expiryDate: '',
        maxUses: ''
      });
      
      setShowCreateForm(false);
      loadVouchers(); // Reload danh sách
      
      alert('Tạo voucher thành công!');
    } catch (err) {
      setError(err.message || 'Không thể tạo voucher');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDiscount = (voucher) => {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discountValue}%`;
    } else {
      return formatCurrency(voucher.discountValue);
    }
  };

  return (
    <div className="voucher-manager">
      <div className="voucher-header">
        <h2>🎫 Quản lý Voucher</h2>
        <button 
          className="create-voucher-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Tạo voucher mới
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Form tạo voucher */}
      {showCreateForm && (
        <div className="create-voucher-form">
          <h3>Tạo voucher mới</h3>
          <form onSubmit={handleCreateVoucher}>
            <div className="form-group">
              <label>Mã voucher:</label>
              <div className="code-input-group">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Nhập mã voucher hoặc tạo tự động"
                  required
                />
                <button 
                  type="button" 
                  className="generate-code-btn"
                  onClick={handleGenerateCode}
                >
                  Tạo mã
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Loại giảm giá:</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VND)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Giá trị giảm giá:</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                placeholder={formData.discountType === 'percentage' ? '10' : '10000'}
                min="0"
                step={formData.discountType === 'percentage' ? '1' : '1000'}
                required
              />
            </div>

            <div className="form-group">
              <label>Đơn hàng tối thiểu (VND):</label>
              <input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData(prev => ({ ...prev, minOrderValue: e.target.value }))}
                placeholder="50000"
                min="0"
                step="1000"
              />
            </div>

            <div className="form-group">
              <label>Ngày hết hạn:</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label>Số lần sử dụng tối đa (để trống = không giới hạn):</label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                placeholder="100"
                min="1"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowCreateForm(false)}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Đang tạo...' : 'Tạo voucher'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách voucher */}
      <div className="vouchers-list">
        <h3>Danh sách voucher</h3>
        {vouchers.length === 0 ? (
          <p>Chưa có voucher nào</p>
        ) : (
          <div className="vouchers-grid">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="voucher-card">
                <div className="voucher-code">
                  <span className="voucher-icon">🎫</span>
                  <strong>{voucher.code}</strong>
                </div>
                <div className="voucher-details">
                  <div className="discount-info">
                    Giảm: {formatDiscount(voucher)}
                  </div>
                  <div className="condition-info">
                    Đơn tối thiểu: {formatCurrency(voucher.minOrderValue)}
                  </div>
                  <div className="expiry-info">
                    HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="usage-info">
                    Đã dùng: {voucher.usedCount} / {voucher.maxUses || '∞'}
                  </div>
                </div>
                <div className="voucher-status">
                  {voucher.isActive ? (
                    <span className="status-active">Hoạt động</span>
                  ) : (
                    <span className="status-inactive">Không hoạt động</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherManager;
