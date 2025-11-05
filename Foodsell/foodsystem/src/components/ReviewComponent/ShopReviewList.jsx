import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../../api/review';
import { productAPI } from '../../api/product';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ReviewReply from './ReviewReply';
import './ShopReviewList.css';

const ShopReviewList = ({ shopId, userRole, currentUserId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // No shop-level write button; reviews are aggregated from dish reviews
  const [editingReview, setEditingReview] = useState(null);
  const [productNames, setProductNames] = useState({});

  useEffect(() => {
    loadShopReviews();
    loadShopReviewStats();
    // Preload all products of this shop to resolve names quickly
    (async () => {
      try {
        const res = await productAPI.getProductsByShopId(shopId);
        const products = res?.data || res || [];
        const map = {};
        (products || []).forEach(p => {
          const id = p.id ?? p.productId;
          const name = p.name ?? p.productName;
          if (id) map[id] = name || `#${id}`;
        });
        if (Object.keys(map).length) setProductNames(map);
      } catch {}
    })();
  }, [shopId]);

  const loadShopReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewAPI.getShopReviews(shopId);
      if (response.success) setReviews(response.data || []);
      else setReviews([]);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải đánh giá shop');
    } finally {
      setLoading(false);
    }
  };

  const loadShopReviewStats = async () => {
    try {
      const response = await reviewAPI.getShopReviewStats(shopId);
      if (response.success) setReviewStats(response.data);
    } catch {}
  };

  // Fetch product names for product reviews
  useEffect(() => {
    const run = async () => {
      const ids = Array.from(new Set((reviews || [])
        .map(r => r.productId)
        .filter(id => typeof id === 'number' && id > 0 && !productNames[id])));
      if (ids.length === 0) return;
      const pairs = await Promise.all(ids.map(async (pid) => {
        try {
          const res = await productAPI.getProductById(pid);
          const name = res?.data?.name || res?.name || `#${pid}`;
          return [pid, name];
        } catch {
          return [pid, `#${pid}`];
        }
      }));
      setProductNames(prev => {
        const next = { ...prev };
        pairs.forEach(([pid, name]) => { next[pid] = name; });
        return next;
      });
    };
    if (reviews?.length) run();
  }, [reviews]);

  // Removed write-review handler; shop rating is aggregated from dish reviews

  const handleReplyToReview = async (reviewId, content) => {
    try {
      const response = await reviewAPI.replyToReview(reviewId, content);
      if (response.success) loadShopReviews();
      else setError(response.message || 'Không thể trả lời đánh giá');
    } catch (err) { setError(err.message); }
  };

  const handleEditReview = async (reviewId, data) => {
    try {
      const response = await reviewAPI.editReview(reviewId, data.rating, data.content);
      if (response.success) { setEditingReview(null); loadShopReviews(); loadShopReviewStats(); }
      else setError(response.message || 'Không thể chỉnh sửa đánh giá');
    } catch (err) { setError(err.message); }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      const response = await reviewAPI.deleteReview(reviewId);
      if (response.success) { loadShopReviews(); loadShopReviewStats(); }
      else setError(response.message || 'Không thể xóa đánh giá');
    } catch (err) { setError(err.message); }
  };

  if (loading) return <div className="shop-review-loading">Đang tải đánh giá shop...</div>;

  return (
    <div className="shop-review-list">
      <div className="shop-review-header">
        <h3>{'\u0110\u00e1nh gi\u00e1 shop'}</h3>
        <div className="shop-review-stats">
          <div className="average-rating">
            <StarRating rating={reviewStats.averageRating} readOnly />
            <span className="rating-text">
              {reviewStats.averageRating.toFixed(1)} ({reviewStats.reviewCount} {'\u0111\u00e1nh gi\u00e1'})
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="shop-review-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>{'\u0110\u00f3ng'}</button>
        </div>
      )}


      <div className="shop-reviews-container">
        {reviews.length === 0 ? (
          <p className="no-reviews">{'Ch\u01b0a c\u00f3 \u0111\u00e1nh gi\u00e1 n\u00e0o cho shop n\u00e0y.'}</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="shop-review-item">
              <div className="review-header-item">
                <div className="reviewer-info">
                  <span className="reviewer-name">{'Kh\u00e1ch h\u00e0ng'} #{review.customerId}</span>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="review-rating"><StarRating rating={review.rating} readOnly /></div>
              </div>
              <div className="review-content">
                {review.productId > 0 && (
                  <div style={{ fontSize: 13, color: '#444', marginBottom: 4 }}>{'M\u00f3n:'} {productNames[review.productId] || `#${review.productId}`}</div>
                )}
                <p>{review.content}</p>
              </div>
              {(() => {
                const canEdit = (userRole === 'CUSTOMER' || userRole === 'customer' || userRole === 'buyer') && review.customerId === currentUserId;
                return canEdit;
              })() && (
                <div className="review-actions">
                  <button className="edit-review-btn" onClick={() => setEditingReview(review)}>{'Ch\u1ec9nh s\u1eeda'}</button>
                  <button className="delete-review-btn" onClick={() => handleDeleteReview(review.id)}>{'X\u00f3a'}</button>
                </div>
              )}
              {editingReview && editingReview.id === review.id && (
                <ReviewForm
                  review={editingReview}
                  onSubmit={(data) => handleEditReview(review.id, data)}
                  onCancel={() => setEditingReview(null)}
                  title={'Ch\u1ec9nh s\u1eeda \u0111\u00e1nh gi\u00e1 shop'}
                />
              )}
              <ReviewReply reviewId={review.id} userRole={userRole} onReply={handleReplyToReview} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShopReviewList;
