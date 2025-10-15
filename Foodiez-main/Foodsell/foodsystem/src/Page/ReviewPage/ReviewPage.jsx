import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reviewAPI } from '../../api/review';
import ReviewList from '../../components/ReviewComponent/ReviewList';
import './ReviewPage.css';

export default function ReviewPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);

  // Fetch all reviews
  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['reviews', 'all'],
    queryFn: () => reviewAPI.getAllReviews(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const reviews = reviewsData?.data || reviewsData || [];

  // Filter reviews based on selection
  const filteredReviews = reviews.filter(review => {
    if (selectedProduct && review.productId !== selectedProduct) return false;
    if (selectedShop && review.shopId !== selectedShop) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="review-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-page">
        <div className="error">
          <p>Không thể tải đánh giá. Vui lòng thử lại sau.</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-page">
      <div className="review-page-header">
        <h1>Đánh giá sản phẩm</h1>
        <p>Tổng cộng {reviews.length} đánh giá</p>
      </div>

      <div className="review-filters">
        <div className="filter-group">
          <label>Lọc theo sản phẩm:</label>
          <select 
            value={selectedProduct || ''} 
            onChange={(e) => setSelectedProduct(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Tất cả sản phẩm</option>
            {/* You can add product options here if needed */}
          </select>
        </div>

        <div className="filter-group">
          <label>Lọc theo cửa hàng:</label>
          <select 
            value={selectedShop || ''} 
            onChange={(e) => setSelectedShop(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Tất cả cửa hàng</option>
            {/* You can add shop options here if needed */}
          </select>
        </div>

        <button 
          className="clear-filters"
          onClick={() => {
            setSelectedProduct(null);
            setSelectedShop(null);
          }}
        >
          Xóa bộ lọc
        </button>
      </div>

      <div className="review-stats">
        <div className="stat-card">
          <h3>Tổng đánh giá</h3>
          <p className="stat-number">{reviews.length}</p>
        </div>
        <div className="stat-card">
          <h3>Đánh giá trung bình</h3>
          <p className="stat-number">
            {reviews.length > 0 
              ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1)
              : '0.0'
            } ⭐
          </p>
        </div>
        <div className="stat-card">
          <h3>Đánh giá 5 sao</h3>
          <p className="stat-number">
            {reviews.filter(review => review.rating === 5).length}
          </p>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Danh sách đánh giá</h2>
        {filteredReviews.length === 0 ? (
          <div className="no-reviews">
            <p>Không có đánh giá nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          <ReviewList reviews={filteredReviews} />
        )}
      </div>
    </div>
  );
}

