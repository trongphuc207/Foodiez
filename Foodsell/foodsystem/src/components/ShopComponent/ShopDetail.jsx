import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shopAPI } from '../../api/shop';
import { productAPI } from '../../api/product';
import './ShopDetail.css';

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadShopData();
  }, [id]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load shop details
      const shopResponse = await shopAPI.getShopById(id);
      setShop(shopResponse.data);
      
      // Load products for this shop
      const productsResponse = await productAPI.getProductsByShopId(id);
      setProducts(productsResponse.data || []);
      
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu shop:', error);
      setError('Không thể tải dữ liệu shop');
    } finally {
      setLoading(false);
    }
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

  const handleProductClick = (productId) => {
    // Navigate to product detail or open modal
    console.log('Product clicked:', productId);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId.toString() === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="shop-detail-container">
        <div className="loading">
          <h2>Đang tải thông tin shop...</h2>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="shop-detail-container">
        <div className="error">
          <h2>Không tìm thấy shop</h2>
          <button onClick={() => navigate('/shops')} className="back-btn">
            ← Quay lại danh sách shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-detail-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/')}>Home</span>
        <span>»</span>
        <span onClick={() => navigate('/shops')}>Shops</span>
        <span>»</span>
        <span>{shop.name}</span>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Side - Shop Image */}
        <div className="shop-image-section">
          <div className="shop-image">
            <img 
              src="/placeholder.jpg" 
              alt={shop.name}
              onError={(e) => {
                e.target.src = '/placeholder.jpg';
              }}
            />
          </div>
        </div>

        {/* Right Side - Shop Information */}
        <div className="shop-info-section">
          <h1 className="shop-name">{shop.name}</h1>
          
          <div className="shop-address">
            <span className="address-icon">📍</span>
            <span>{shop.address}</span>
          </div>

          <div className="shop-rating-section">
            <div className="rating">
              {renderStars(shop.rating)}
              <span className="rating-text">{shop.rating.toFixed(1)}</span>
            </div>
            <span className="review-count">999+ đánh giá</span>
          </div>

          <div className="shop-hours">
            <span className="hours-icon">🕒</span>
            <span>Mở cửa {shop.openingHours || '24/7'}</span>
          </div>

          <div className="shop-price-range">
            <span>Giá: $25.000 - $40.000</span>
          </div>

          <div className="shop-service-info">
            <div className="service-fee">PHÍ DỊCH VỤ 0.0% Quán Đối Tác</div>
            <div className="service-by">DỊCH VỤ BỞI FoodieExpress</div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        {/* Left Column - Menu Categories */}
        <div className="menu-categories">
          <div className="menu-header">THỰC ĐƠN</div>
          <div className="category-list">
            <div 
              className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              TẤT CẢ MÓN
            </div>
            <div 
              className={`category-item ${selectedCategory === '1' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('1')}
            >
              MÓN CHÍNH
            </div>
            <div 
              className={`category-item ${selectedCategory === '2' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('2')}
            >
              COMBO SIÊU KHỦNG
            </div>
            <div 
              className={`category-item ${selectedCategory === '3' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('3')}
            >
              MÓN ĂN THÊM
            </div>
            <div 
              className={`category-item ${selectedCategory === '4' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('4')}
            >
              ĐỒ UỐNG
            </div>
          </div>
        </div>

        {/* Middle Column - Products */}
        <div className="products-section">
          <div className="promotion-banner">
            <div className="promotion-content">
              <span className="promotion-icon">🏷️</span>
              <span>GIẢM 30.000₫ cho đơn hàng đầu tiên</span>
              <button className="copy-code-btn">Copy code</button>
            </div>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Tìm món"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="products-list">
            <h3>TẤT CẢ MÓN ({filteredProducts.length} món)</h3>
            
            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <p>Không tìm thấy món ăn nào</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="product-card" onClick={() => handleProductClick(product.id)}>
                    <div className="product-image">
                      <img 
                        src={product.imageUrl || '/placeholder.jpg'} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="product-info">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-description">{product.description}</p>
                      <div className="product-price">${product.price}</div>
                      <div className="product-status">
                        {product.available ? (
                          <span className="in-stock">✓ Còn hàng</span>
                        ) : (
                          <span className="out-of-stock">✗ Hết hàng</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - QR Code */}
        <div className="qr-section">
          <div className="qr-code">
            <div className="qr-placeholder">
              <div className="qr-text">QR CODE</div>
              <div className="qr-subtext">Quét để đặt hàng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;