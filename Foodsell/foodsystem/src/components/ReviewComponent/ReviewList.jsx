import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../../api/review';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ReviewReply from './ReviewReply';
import './ReviewList.css';

const ReviewList = ({ productId, shopId, userRole, currentUserId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Debug: Log user role
  console.log('🔍 ReviewList Debug:', { userRole, currentUserId, productId, shopId, showReviewForm });

  useEffect(() => {
    loadReviews();
    loadReviewStats();
  }, [productId, shopId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getProductReviews(productId);
      if (response.success) {
        setReviews(response.data || []);
      } else {
        setError(response.message || 'Không thể tải đánh giá');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewStats = async () => {
    try {
      const response = await reviewAPI.getProductReviewStats(productId);
      if (response.success) {
        setReviewStats(response.data);
      }
    } catch (err) {
      console.error('Không thể tải thống kê đánh giá:', err);
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
        productId,
        shopId,
        reviewData.orderId,
        reviewData.rating,
        reviewData.content
      );
      
      if (response.success) {
        setShowReviewForm(false);
        loadReviews();
        loadReviewStats();
      } else {
        setError(response.message || 'Không thể tạo đánh giá');
      }
    } catch (err) {
      console.error('Error writing review:', err);
      if (err.message.includes('401') || err.message.includes('403')) {
        setError('Vui lòng đăng nhập để viết đánh giá');
      } else {
        setError(err.message || 'Có lỗi xảy ra khi viết đánh giá');
      }
    }
  };

  const handleEditReview = async (reviewId, reviewData) => {
    try {
      const response = await reviewAPI.editReview(reviewId, reviewData.rating, reviewData.content);
      
      if (response.success) {
        setEditingReview(null);
        loadReviews();
        loadReviewStats();
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
          loadReviews();
          loadReviewStats();
        } else {
          setError(response.message || 'Không thể xóa đánh giá');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleReplyToReview = async (reviewId, content) => {
    try {
      const response = await reviewAPI.replyToReview(reviewId, content);
      
      if (response.success) {
        loadReviews(); // Reload để hiển thị reply mới
      } else {
        setError(response.message || 'Không thể trả lời đánh giá');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="review-loading">Đang tải đánh giá...</div>;
  }

  return (
    <div className="review-list">
      <div className="review-header">
        <h3>Đánh giá sản phẩm</h3>
        <div className="review-stats">
          <div className="average-rating">
            <StarRating rating={reviewStats.averageRating} readOnly />
            <span className="rating-text">
              {reviewStats.averageRating.toFixed(1)} ({reviewStats.reviewCount} đánh giá)
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="review-error">
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
          Viết đánh giá
        </button>
      )}

      {/* Form viết đánh giá */}
      {showReviewForm && (
        <ReviewForm
          onSubmit={handleWriteReview}
          onCancel={() => setShowReviewForm(false)}
          title="Viết đánh giá mới"
        />
      )}

      {/* Danh sách đánh giá */}
      <div className="reviews-container">
        {reviews.length === 0 ? (
          <p className="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
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
                console.log('🔍 Edit/Delete Check:', { 
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
                  title="Chỉnh sửa đánh giá"
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

export default ReviewList;
