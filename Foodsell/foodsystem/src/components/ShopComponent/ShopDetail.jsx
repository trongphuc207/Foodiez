import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shopAPI } from '../../api/shop';
import { productAPI } from '../../api/product';
import { useCart } from '../../contexts/CartContext';
import ProductDetail from '../FoodProductComponent/ProductDetail';
import './ShopDetail.css';

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

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
    // Tìm sản phẩm theo ID và mở modal chi tiết
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleQuantityChange = (productId, change) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = productQuantities[product.id] || 1;
    
    // Create cart product object
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || "/placeholder.jpg",
      shop: shop?.name || 'Unknown Shop',
      description: product.description,
      categoryId: product.categoryId,
      shopId: product.shopId,
      status: product.status,
      available: product.available
    };

    // Add quantity copies to cart
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct);
    }

    alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
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
        <span onClick={() => navigate('/')}>Trang chủ</span>
        <span>»</span>
        <span onClick={() => navigate('/shops')}>Cửa hàng</span>
        <span>»</span>
        <span>{shop.name}</span>
      </div>

      {/* Main Shop Information Card */}
      <div className="shop-info-card">
        <div className="shop-header">
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
            <span>Mở cửa {shop.openingHours || '8AM-10PM'}</span>
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

      {/* Bottom Section with Menu, Products, and QR */}
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
                      <div className="product-price">{product.price.toLocaleString('vi-VN')} VND</div>
                      <div className="product-status">
                        {!product.available ? (
                          <span className="out-of-stock">✗ Không có sẵn</span>
                        ) : product.status === 'out_of_stock' ? (
                          <span className="out-of-stock">✗ Hết hàng</span>
                        ) : (
                          <span className="in-stock">✓ Còn hàng</span>
                        )}
                      </div>
                      
                      {/* Add to Cart Section */}
                      {product.available && product.status !== 'out_of_stock' && (
                        <div className="add-to-cart-section">
                          <div className="quantity-selector">
                            <label className="quantity-label">Số lượng:</label>
                            <div className="quantity-controls">
                              <button 
                                className="quantity-btn minus"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(product.id, -1);
                                }}
                              >
                                -
                              </button>
                              <input 
                                type="number" 
                                className="quantity-input"
                                value={productQuantities[product.id] || 1}
                                onChange={(e) => setProductQuantities(prev => ({
                                  ...prev,
                                  [product.id]: Math.max(1, parseInt(e.target.value) || 1)
                                }))}
                                min="1"
                              />
                              <button 
                                className="quantity-btn plus"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(product.id, 1);
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button 
                            className="add-to-cart-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                          >
                            🛒 THÊM VÀO GIỎ HÀNG
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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