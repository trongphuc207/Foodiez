import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopAPI } from '../../api/shop';
import { productAPI } from '../../api/product';
import { useAuth } from '../../hooks/useAuth';
import './ShopDashboard.css';

const ShopDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadShopData();
  }, [user, navigate]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load shop by seller ID
      const shopResponse = await shopAPI.getShopBySellerId(user.id);
      setShop(shopResponse.data);
      
      // Load shop products
      const productsResponse = await productAPI.getAllProducts();
      const shopProducts = productsResponse.filter(product => product.shopId === shopResponse.data.id);
      setProducts(shopProducts);
      
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu shop:', error);
      setError('Không thể tải dữ liệu shop');
    } finally {
      setLoading(false);
    }
  };

  const handleEditShop = () => {
    navigate('/shops/edit');
  };

  const handleAddProduct = () => {
    navigate('/admin');
  };

  const handleViewProducts = () => {
    navigate('/shops');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">☆</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="shop-dashboard-container">
        <div className="loading">
          <h2>Đang tải dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="shop-dashboard-container">
        <div className="no-shop">
          <h2>Bạn chưa có shop</h2>
          <p>Tạo shop để bắt đầu bán hàng</p>
          <button onClick={() => navigate('/shops/register')} className="create-shop-btn">
            Tạo shop ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard cửa hàng</h1>
        <div className="header-actions">
          <button onClick={handleEditShop} className="edit-btn">
            ✏️ Chỉnh sửa shop
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="shop-info-card">
          <div className="shop-header">
            <h2>{shop.name}</h2>
            <div className="shop-rating">
              {renderStars(shop.rating)}
              <span className="rating-text">({shop.rating.toFixed(1)})</span>
            </div>
          </div>
          
          <div className="shop-details">
            <div className="detail-item">
              <span className="detail-icon">📝</span>
              <div className="detail-content">
                <h4>Mô tả</h4>
                <p>{shop.description || 'Chưa có mô tả'}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <div className="detail-content">
                <h4>Địa chỉ</h4>
                <p>{shop.address}</p>
              </div>
            </div>
            
            {shop.openingHours && (
              <div className="detail-item">
                <span className="detail-icon">🕒</span>
                <div className="detail-content">
                  <h4>Giờ mở cửa</h4>
                  <p>{shop.openingHours}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{products.length}</h3>
              <p>Sản phẩm</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{shop.rating.toFixed(1)}</h3>
              <p>Đánh giá</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🛍️</div>
            <div className="stat-content">
              <h3>0</h3>
              <p>Đơn hàng</p>
            </div>
          </div>
        </div>

        <div className="products-section">
          <div className="section-header">
            <h2>Sản phẩm của shop</h2>
            <div className="section-actions">
              <button onClick={handleAddProduct} className="add-product-btn">
                ➕ Thêm sản phẩm
              </button>
              <button onClick={handleViewProducts} className="view-products-btn">
                👁️ Xem tất cả
              </button>
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="no-products">
              <p>Bạn chưa có sản phẩm nào</p>
              <button onClick={handleAddProduct} className="add-first-product-btn">
                Thêm sản phẩm đầu tiên
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.slice(0, 6).map((product) => (
                <div key={product.id} className="product-card">
                  {product.imageUrl && (
                    <div className="product-image">
                      <img src={product.imageUrl} alt={product.name} />
                    </div>
                  )}
                  
                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <p className="product-price">{product.price.toLocaleString('vi-VN')} VND</p>
                    <span className={`product-status ${product.available ? 'available' : 'unavailable'}`}>
                      {product.available ? 'Có sẵn' : 'Hết hàng'}
                    </span>
                  </div>
                </div>
              ))}
              
              {products.length > 6 && (
                <div className="view-more-card">
                  <p>Và {products.length - 6} sản phẩm khác...</p>
                  <button onClick={handleViewProducts} className="view-more-btn">
                    Xem tất cả
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;








