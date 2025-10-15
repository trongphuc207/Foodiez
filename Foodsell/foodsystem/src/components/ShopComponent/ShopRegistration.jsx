import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopAPI } from '../../api/shop';
import { useAuth } from '../../hooks/useAuth';
import './ShopRegistration.css';

const ShopRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    openingHours: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Bạn cần đăng nhập để tạo shop');
      return;
    }

    if (!formData.name.trim() || !formData.address.trim()) {
      setError('Tên shop và địa chỉ là bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const shopData = {
        ...formData,
        sellerId: user.id
      };
      
      const response = await shopAPI.createShop(shopData);
      
      if (response.success) {
        alert('Tạo shop thành công!');
        navigate('/shops');
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tạo shop');
      }
    } catch (error) {
      console.error('Lỗi khi tạo shop:', error);
      setError('Có lỗi xảy ra khi tạo shop. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="shop-registration-container">
        <div className="login-required">
          <h2>Bạn cần đăng nhập</h2>
          <p>Vui lòng đăng nhập để tạo shop</p>
          <button onClick={() => navigate('/login')} className="login-btn">
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-registration-container">
      <div className="registration-header">
        <h1>Tạo cửa hàng mới</h1>
        <p>Điền thông tin để tạo cửa hàng của bạn</p>
      </div>

      <div className="registration-form-container">
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">Tên cửa hàng *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên cửa hàng"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả cửa hàng</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả về cửa hàng của bạn..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ cửa hàng"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="openingHours">Giờ mở cửa</label>
            <input
              type="text"
              id="openingHours"
              name="openingHours"
              value={formData.openingHours}
              onChange={handleInputChange}
              placeholder="VD: 8:00 - 22:00"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/shops')}
              className="cancel-btn"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo cửa hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopRegistration;













