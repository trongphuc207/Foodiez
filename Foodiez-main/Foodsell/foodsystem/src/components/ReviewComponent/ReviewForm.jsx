import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Review.css';

export default function ReviewForm({ initialValue, onSubmit, submitting, productId, shopId }) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(initialValue?.rating || 5);
  const [comment, setComment] = useState(initialValue?.comment || '');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setRating(initialValue?.rating || 5);
    setComment(initialValue?.comment || '');
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Vui lòng nhập nhận xét!');
      return;
    }
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đánh giá!');
      return;
    }
    
    const reviewData = {
      rating,
      comment: comment.trim(),
      productId,
      shopId,
      userId: user?.id,
      userName: user?.fullName || user?.name || 'Người dùng'
    };
    
    onSubmit(reviewData);
  };

  const handleCancel = () => {
    setShowForm(false);
    setRating(5);
    setComment('');
  };

  if (!showForm && !initialValue) {
    return (
      <div className="review-form-trigger">
        <button 
          className="write-review-btn"
          onClick={() => setShowForm(true)}
        >
          ✍️ Viết đánh giá
        </button>
      </div>
    );
  }

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h3>{initialValue ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá mới'}</h3>
        {!initialValue && (
          <button className="close-form-btn" onClick={handleCancel}>✕</button>
        )}
      </div>
      
      <form className="review-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Đánh giá sao *</label>
          <div className="star-rating">
            {[1,2,3,4,5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? 'active' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
            <span className="rating-text">({rating} sao)</span>
          </div>
        </div>
        
        <div className="form-group">
          <label>Nhận xét *</label>
          <textarea 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            rows={4} 
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            required
          />
          <div className="char-count">{comment.length}/500</div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={handleCancel}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="review-submit" 
            disabled={submitting || !comment.trim()}
          >
            {submitting ? 'Đang gửi...' : (initialValue ? 'Cập nhật đánh giá' : 'Gửi đánh giá')}
          </button>
        </div>
      </form>
    </div>
  );
}








