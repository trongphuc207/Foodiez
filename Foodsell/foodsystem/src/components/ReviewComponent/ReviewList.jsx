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
        setReviewStats(response.data || { averageRating: 0, reviewCount: 0 });
      }
    } catch (err) {
      console.error('Không thể tải thống kê đánh giá:', err);
    }
  };

  const handleWriteReview = async (reviewData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Vui lòng đăng nhập để viết đánh giá');
        return;
      }

      let imageUrl;
      if (reviewData.file) {
        try {
          const up = await reviewAPI.uploadImage(reviewData.file);
          if (up?.success) imageUrl = up.data?.url || up.url || (up.data && up.data.url);
        } catch (e) {
          console.error('Upload ảnh đánh giá thất bại:', e);
          // vẫn tiếp tục không kèm ảnh
        }
      }

      const response = await reviewAPI.writeReview(
        productId,
        shopId,
        reviewData.orderId,
        reviewData.rating,
        reviewData.content,
        imageUrl
      );

      if (response.success) {
        setShowReviewForm(false);
        await loadReviews();
        await loadReviewStats();
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
    if (window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) {
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

  const resolveUrl = (u) => {
    if (!u) return u;
    const backendUrl = process.env.REACT_APP_ORDER_URL || 'http://localhost:8080';
    return /^https?:\/\//i.test(u) ? u : `${backendUrl}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  return (
    <div className="review-list">
      <div className="review-header">
        <h3>Đánh giá sản phẩm</h3>
        <div className="review-stats">
          <div className="average-rating">
            <StarRating rating={reviewStats.averageRating} readOnly />
            <span className="rating-text">
              {Number(reviewStats.averageRating || 0).toFixed(1)} ({reviewStats.reviewCount} đánh giá)
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

      {showReviewForm && (
        <ReviewForm
          onSubmit={handleWriteReview}
          onCancel={() => setShowReviewForm(false)}
          title="Viết đánh giá mới"
        />
      )}

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
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <div className="review-rating">
                  <StarRating rating={review.rating} readOnly />
                </div>
              </div>

              <div className="review-content">
                {review.imageUrl ? (
                  <a href={resolveUrl(review.imageUrl)} target="_blank" rel="noreferrer">
                    <img
                      alt="Ảnh đánh giá"
                      className="review-image"
                      src={resolveUrl(review.imageUrl)}
                    />
                  </a>
                ) : null}
                <p>{review.content}</p>
              </div>

              {userRole === 'SELLER' && (
                <ReviewReply reviewId={review.id} onReply={() => loadReviews()} />
              )}

              {currentUserId === review.customerId && (
                <div className="review-actions">
                  <button onClick={() => setEditingReview(review)}>Chỉnh sửa</button>
                  <button onClick={() => handleDeleteReview(review.id)}>Xóa</button>
                </div>
              )}

              {editingReview && editingReview.id === review.id && (
                <ReviewForm
                  review={editingReview}
                  onSubmit={(data) => handleEditReview(review.id, data)}
                  onCancel={() => setEditingReview(null)}
                  title="Chỉnh sửa đánh giá"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;