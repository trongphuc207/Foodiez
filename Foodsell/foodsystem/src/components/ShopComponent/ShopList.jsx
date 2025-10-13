import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopAPI } from '../../api/shop';
import './ShopList.css';

const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const response = await shopAPI.getAllShops();
      setShops(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách shop:', error);
      alert('Lỗi khi tải danh sách shop');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadShops();
      return;
    }

    try {
      setLoading(true);
      const response = await shopAPI.searchShops(searchKeyword);
      setShops(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm shop:', error);
      alert('Lỗi khi tìm kiếm shop');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByRating = async () => {
    if (!filterRating) {
      loadShops();
      return;
    }

    try {
      setLoading(true);
      const response = await shopAPI.getShopsByRating(parseFloat(filterRating));
      setShops(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lọc shop theo rating:', error);
      alert('Lỗi khi lọc shop theo rating');
    } finally {
      setLoading(false);
    }
  };

  const handleShopClick = (shopId) => {
    navigate(`/shops/${shopId}`);
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
      <div className="shop-list-container">
        <div className="loading">
          <h2>Đang tải danh sách shop...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-list-container">
      <div className="shop-list-header">
        <h1>Danh sách cửa hàng</h1>
        
        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm cửa hàng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-btn">
              🔍 Tìm kiếm
            </button>
          </div>

          <div className="filter-section">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              onBlur={handleFilterByRating}
            >
              <option value="">Tất cả rating</option>
              <option value="4.5">4.5+ sao</option>
              <option value="4.0">4.0+ sao</option>
              <option value="3.5">3.5+ sao</option>
              <option value="3.0">3.0+ sao</option>
            </select>
            <button onClick={handleFilterByRating} className="filter-btn">
              🔽 Lọc
            </button>
          </div>
        </div>
      </div>

      <div className="shops-grid">
        {shops.length === 0 ? (
          <div className="no-shops">
            <h3>Không tìm thấy cửa hàng nào</h3>
            <p>Hãy thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc</p>
          </div>
        ) : (
          shops.map((shop) => (
            <div key={shop.id} className="shop-card" onClick={() => navigate(`/shops/${shop.id}`)}>
              <div className="shop-card-header">
                <h3 className="shop-name">{shop.name}</h3>
                <div className="shop-rating">
                  {renderStars(shop.rating)}
                  <span className="rating-text">({shop.rating.toFixed(1)})</span>
                </div>
              </div>
              
              <div className="shop-info">
                <p className="shop-description">{shop.description}</p>
                <div className="shop-details">
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{shop.address}</span>
                  </div>
                  {shop.openingHours && (
                    <div className="detail-item">
                      <span className="detail-icon">🕒</span>
                      <span className="detail-text">{shop.openingHours}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="shop-actions">
                <button className="view-shop-btn">
                  Xem chi tiết →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShopList;

