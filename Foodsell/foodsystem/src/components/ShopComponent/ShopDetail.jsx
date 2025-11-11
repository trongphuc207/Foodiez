import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shopAPI } from '../../api/shop';
import { productAPI } from '../../api/product';
import { useCart } from '../../contexts/CartContext';
import ProductDetail from '../FoodProductComponent/ProductDetail';
import ShopReviewList from '../ReviewComponent/ShopReviewList';
import { useAuth } from '../../hooks/useAuth';
import { reviewAPI } from '../../api/review';
import { chatAPI } from '../../api/chat';
import './ShopDetail.css';

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const startChat = async () => {
    try {
      const res = await chatAPI.startWithMerchantByShop(Number(id));
      const cid = res?.data?.id || res?.id;
      if (cid) navigate(`/chat?cid=${cid}`); else navigate('/chat');
    } catch (e) {
      console.warn('Start chat error:', e?.message || e);
      navigate('/chat');
    }
  };

  useEffect(() => {
    loadShopData();
    loadReviewStats();
  }, [id]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      setError('');
      const shopResponse = await shopAPI.getShopById(id);
      setShop(shopResponse.data);
      const productsResponse = await productAPI.getProductsByShopId(id);
      setProducts(productsResponse.data || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu shop:', error);
      setError('Không thể tải dữ liệu shop');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewStats = async () => {
    try {
      const res = await reviewAPI.getShopReviewStats(id);
      if (res?.success) {
        setReviewStats({
          averageRating: res.data?.averageRating ?? 0,
          reviewCount: res.data?.reviewCount ?? 0,
        });
      } else {
        setReviewStats({ averageRating: 0, reviewCount: 0 });
      }
    } catch (e) {
      console.warn('Load shop review stats error:', e?.message || e);
      setReviewStats({ averageRating: 0, reviewCount: 0 });
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) stars.push(<span key={i} className="star filled">{'\u2605'}</span>);
    if (hasHalfStar) stars.push(<span key="half" className="star half">{'\u2606'}</span>);
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) stars.push(<span key={`empty-${i}`} className="star empty">{'\u2606'}</span>);
    return stars;
  };

  const handleProductClick = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) setSelectedProduct(product);
  };

  const handleQuantityChange = (productId, change) => {
    setProductQuantities(prev => ({ ...prev, [productId]: Math.max(1, (prev[productId] || 1) + change) }));
  };

  const handleAddToCart = (product) => {
    const quantity = productQuantities[product.id] || 1;
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || '/placeholder.jpg',
      description: product.description,
      categoryId: product.categoryId,
      status: product.status,
      available: product.available
    };
    for (let i = 0; i < quantity; i++) addToCart(cartProduct);
    alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
  };

  // Filter products chỉ theo search keyword (không filter theo category nữa)
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="shop-detail-container">
        <div className="loading">
          <h2>{'Đang tải thông tin shop...'}</h2>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="shop-detail-container">
        <div className="error">
          <h2>{'Không tìm thấy shop'}</h2>
          <button onClick={() => navigate('/shops')} className="back-btn">
            {'← Quay lại danh sách shop'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-detail-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/')}>{'Trang chủ'}</span>
        <span>{'›'}</span>
        <span onClick={() => navigate('/shops')}>{'Cửa hàng'}</span>
        <span>{'›'}</span>
        <span>{shop.name}</span>
      </div>

      {/* Hero Section - Shop Information with Gradient */}
      <div className="shop-hero-section">
        <div className="shop-hero-content">
          <div className="shop-header-modern">
            <h1 className="shop-name-modern">{shop.name}</h1>
            
            <div className="shop-meta-info">
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span className="meta-text">{shop.address}</span>
              </div>
              
              <div className="meta-item">
                <div className="rating-modern">
                  {renderStars(reviewStats.averageRating || 0)}
                  <span className="rating-text-modern">{(reviewStats.averageRating || 0).toFixed(1)}</span>
                </div>
                <span className="review-count-modern">
                  {reviewStats.reviewCount > 999 ? '999+' : reviewStats.reviewCount} đánh giá
                </span>
              </div>
              
              <div className="meta-item">
                <span className="meta-icon">🕒</span>
                <span className="meta-text">Mở cửa {shop.openingHours || '8AM-10PM'}</span>
              </div>
            </div>

            <div className="shop-badges">
              <div className="badge badge-success">
                <span className="badge-icon">✓</span>
                <span>PHÍ DỊCH VỤ 0%</span>
              </div>
              <div className="badge badge-info">
                <span className="badge-icon">🚀</span>
                <span>FoodieExpress</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ margin: '8px 0 16px' }}>
        <button className="btn btn-primary" onClick={startChat}>Chat</button>
      </div>

      {/* Products Section */}
      <div className="products-section-modern">
        {/* Promotion Banner */}
        <div className="promotion-banner-modern">
          <div className="promotion-content-modern">
            <div className="promotion-left">
              <div className="promotion-icon-modern">🎉</div>
              <div className="promotion-text">
                <div className="promotion-title">Ưu đãi đặc biệt</div>
                <div className="promotion-desc">GIẢM 30.000₫ cho đơn hàng đầu tiên</div>
              </div>
            </div>
            <button className="copy-code-btn-modern">
              <span>📋</span>
              <span>Copy code</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-section-modern">
          <div className="search-bar-modern">
            <span className="search-icon-modern">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input-modern"
            />
            {searchKeyword && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchKeyword('')}
              >
                ✕
              </button>
            )}
          </div>
          <div className="products-count">
            <span className="count-number">{filteredProducts.length}</span>
            <span className="count-label">món ăn</span>
          </div>
        </div>
        {/* Products Grid */}
        <div className="products-list-modern">
          {filteredProducts.length === 0 ? (
            <div className="no-products-modern">
              <div className="no-products-icon">🔍</div>
              <h3>Không tìm thấy món ăn nào</h3>
              <p>Thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            <div className="products-grid-modern">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card-modern" onClick={() => handleProductClick(product.id)}>
                  <div className="product-image-modern">
                    <img 
                      src={product.imageUrl || '/placeholder.jpg'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                    <div className="product-overlay">
                      <button className="view-detail-btn">Xem chi tiết</button>
                    </div>
                    {(!product.available || product.status === 'out_of_stock') && (
                      <div className="product-badge-unavailable">
                        {!product.available ? 'Hết hàng' : 'Hết nguyên liệu'}
                      </div>
                    )}
                  </div>
                  <div className="product-info-modern">
                    <h4 className="product-name-modern">{product.name}</h4>
                    <p className="product-description-modern">{product.description || 'Món ăn ngon và hấp dẫn'}</p>
                    <div className="product-footer">
                      <div className="product-price-modern">
                        <span className="price-value">{product.price.toLocaleString('vi-VN')}</span>
                        <span className="price-unit">đ</span>
                      </div>
                      {product.available && product.status !== 'out_of_stock' && (
                        <div className="product-actions-modern">
                          <div className="quantity-controls-modern">
                            <button 
                              className="qty-btn qty-minus"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(product.id, -1);
                              }}
                            >
                              −
                            </button>
                            <span className="qty-value">{productQuantities[product.id] || 1}</span>
                            <button 
                              className="qty-btn qty-plus"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(product.id, 1);
                              }}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            className="add-cart-btn-modern"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                          >
                            <span className="cart-icon">🛒</span>
                            <span>Thêm</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shop Reviews Section */}
      <div className="shop-reviews-section">
        <ShopReviewList
          shopId={parseInt(id)}
          userRole={user?.role}
          currentUserId={user?.id}
        />
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default ShopDetail;

