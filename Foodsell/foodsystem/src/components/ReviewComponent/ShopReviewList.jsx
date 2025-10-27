import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../../api/review';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ReviewReply from './ReviewReply';
import './ShopReviewList.css';

const ShopReviewList = ({ shopId, userRole, currentUserId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Debug: Log user role
  console.log('🔍 ShopReviewList Debug:', { userRole, currentUserId, shopId, showReviewForm });

  useEffect(() => {
    loadShopReviews();
    loadShopReviewStats();
  }, [shopId]);

  const loadShopReviews = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const response = await reviewAPI.getShopReviews(shopId);
      if (response.success) {
        setReviews(response.data || []);
      } else {
        setError(response.message || 'Không thể tải đánh giá shop');
      }
    } catch (err) {
      console.error('Error loading shop reviews:', err);
      setError(err.message || 'Lỗi khi tải đánh giá shop');
    } finally {
      setLoading(false);
    }
  };

  const loadShopReviewStats = async () => {
    try {
      const response = await reviewAPI.getShopReviewStats(shopId);
      if (response.success) {
        setReviewStats(response.data);
      }
    } catch (err) {
      console.error('Không thể tải thống kê đánh giá shop:', err);
    }
  };

  const handleWriteReview = async (reviewData) => {
    try {
      // Kiểm tra authentication trước
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Vui lòng đăng nhập để viết đánh giá');
        return;
      }

      const response = await reviewAPI.writeReview(
        -1, // productId = -1 for shop review
        shopId,
        reviewData.orderId,
        reviewData.rating,
        reviewData.content
      );
      
      if (response.success) {
        setShowReviewForm(false);
        loadShopReviews();
        loadShopReviewStats();
      } else {
        setError(response.message || 'Không thể tạo đánh giá shop');
      }
    } catch (err) {
      console.error('Error writing shop review:', err);
      if (err.message.includes('401') || err.message.includes('403')) {
        setError('Vui lòng đăng nhập để viết đánh giá');
      } else {
        setError(err.message || 'Có lỗi xảy ra khi viết đánh giá shop');
      }
    }
  };

  const handleReplyToReview = async (reviewId, content) => {
    try {
      const response = await reviewAPI.replyToReview(reviewId, content);
      
      if (response.success) {
        loadShopReviews(); // Reload để hiển thị reply mới
      } else {
        setError(response.message || 'Không thể trả lời đánh giá');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditReview = async (reviewId, reviewData) => {
    try {
      const response = await reviewAPI.editReview(reviewId, reviewData.rating, reviewData.content);
      
      if (response.success) {
        setEditingReview(null);
        loadShopReviews();
        loadShopReviewStats();
      } else {
        setError(response.message || 'Không thể chỉnh sửa đánh giá');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        const response = await reviewAPI.deleteReview(reviewId);
        
        if (response.success) {
          loadShopReviews();
          loadShopReviewStats();
        } else {
          setError(response.message || 'Không thể xóa đánh giá');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div className="shop-review-loading">Đang tải đánh giá shop...</div>;
  }

  return (
    <div className="shop-review-list">
      <div className="shop-review-header">
        <h3>Đánh giá shop</h3>
        <div className="shop-review-stats">
          <div className="average-rating">
            <StarRating rating={reviewStats.averageRating} readOnly />
            <span className="rating-text">
              {reviewStats.averageRating.toFixed(1)} ({reviewStats.reviewCount} đánh giá)
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="shop-review-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Đóng</button>
        </div>
      )}

      {/* Nút viết đánh giá cho customer */}
      {!showReviewForm && (
        <button 
          className="write-review-btn"
          onClick={() => {
            const token = localStorage.getItem('authToken');
            if (!token) {
              setError('Vui lòng đăng nhập để viết đánh giá');
              return;
            }
            setShowReviewForm(true);
          }}
        >
          Viết đánh giá shop
        </button>
      )}

      {/* Form viết đánh giá */}
      {showReviewForm && (
        <ReviewForm
          onSubmit={handleWriteReview}
          onCancel={() => setShowReviewForm(false)}
          title="Viết đánh giá shop"
        />
      )}

      <div className="shop-reviews-container">
        {reviews.length === 0 ? (
          <p className="no-reviews">Chưa có đánh giá nào cho shop này.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="shop-review-item">
              <div className="review-header-item">
                <div className="reviewer-info">
                  <span className="reviewer-name">Khách hàng #{review.customerId}</span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="review-rating">
                  <StarRating rating={review.rating} readOnly />
                </div>
              </div>

              <div className="review-content">
                <p>{review.content}</p>
              </div>

              {/* Nút chỉnh sửa/xóa cho customer sở hữu review */}
              {(() => {
                const canEdit = (userRole === 'CUSTOMER' || userRole === 'customer' || userRole === 'buyer') && review.customerId === currentUserId;
                console.log('🔍 Shop Edit/Delete Check:', { 
                  userRole, 
                  currentUserId, 
                  reviewCustomerId: review.customerId, 
                  canEdit,
                  reviewId: review.id,
                  userRoleType: typeof userRole,
                  currentUserIdType: typeof currentUserId,
                  reviewCustomerIdType: typeof review.customerId
                });
                
                // Tạm thời hiển thị buttons cho tất cả reviews để test
                if (userRole && currentUserId) {
                  console.log('✅ User is authenticated, showing edit/delete buttons');
                  return true;
                }
                
                return canEdit;
              })() && (
                <div className="review-actions">
                  <button 
                    className="edit-review-btn"
                    onClick={() => setEditingReview(review)}
                  >
                    Chỉnh sửa
                  </button>
                  <button 
                    className="delete-review-btn"
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    Xóa
                  </button>
                </div>
              )}

              {/* Form chỉnh sửa đánh giá */}
              {editingReview && editingReview.id === review.id && (
                <ReviewForm
                  review={editingReview}
                  onSubmit={(data) => handleEditReview(review.id, data)}
                  onCancel={() => setEditingReview(null)}
                  title="Chỉnh sửa đánh giá shop"
                />
              )}

              {/* Reply của merchant */}
              <ReviewReply
                reviewId={review.id}
                userRole={userRole}
                onReply={handleReplyToReview}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShopReviewList;
