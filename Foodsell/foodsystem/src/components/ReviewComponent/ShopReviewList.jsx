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

  const resolveUrl = (u) => {
    if (!u) return u;
    return /^https?:\/\//i.test(u) ? u : `http://localhost:8080${u.startsWith('/') ? '' : '/'}${u}`;
  };

  // Fetch missing product names for reviews
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
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
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
        <h3>Đánh giá shop</h3>
        <div className="shop-review-stats">
          <div className="average-rating">
            <StarRating rating={reviewStats.averageRating} readOnly size="small" />
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

      <div className="shop-reviews-container">
        {reviews.length === 0 ? (
          <p className="no-reviews">Chưa có đánh giá nào cho shop này.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="shop-review-item">
              <div className="review-header-item">
                <div className="reviewer-info">
                  <span className="reviewer-name">Khách hàng #{review.customerId}</span>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="review-rating"><StarRating rating={review.rating} readOnly /></div>
              </div>

              <div className="review-body">
                <div className="review-media">
                  {review.imageUrl ? (
                    <a href={resolveUrl(review.imageUrl)} target="_blank" rel="noreferrer">
                      <img alt="Ảnh đánh giá" className="review-image" src={resolveUrl(review.imageUrl)} />
                    </a>
                  ) : null}
                </div>
                <div className="review-text">
                  {review.productId > 0 && (
                    <div className="review-dish">Món: {productNames[review.productId] || `#${review.productId}`}</div>
                  )}
                  <p className="review-content-text">{review.content}</p>
                </div>
              </div>

              {(() => {
                const canEdit = (userRole === 'CUSTOMER' || userRole === 'customer' || userRole === 'buyer') && review.customerId === currentUserId;
                return canEdit;
              })() && (
                <div className="review-actions">
                  <button className="edit-review-btn" onClick={() => setEditingReview(review)}>Chỉnh sửa</button>
                  <button className="delete-review-btn" onClick={() => handleDeleteReview(review.id)}>Xóa</button>
                </div>
              )}

              {editingReview && editingReview.id === review.id && (
                <ReviewForm
                  review={editingReview}
                  onSubmit={(data) => handleEditReview(review.id, data)}
                  onCancel={() => setEditingReview(null)}
                  title={'Chỉnh sửa đánh giá shop'}
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


