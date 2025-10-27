import React, { useState } from 'react';
import StarRating from './StarRating';
import './ReviewForm.css';

const ReviewForm = ({ review, onSubmit, onCancel, title = "Viết đánh giá" }) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [content, setContent] = useState(review?.content || '');
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá!');
      return;
    }
    
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    const reviewData = {
      rating,
      content: content.trim(),
      orderId: orderId ? parseInt(orderId) : null
    };

    onSubmit(reviewData);
  };

  return (
    <div className="review-form-overlay">
      <div className="review-form">
        <h3>{title}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Đánh giá sao:</label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              readOnly={false}
            />
          </div>

          {!review && (
            <div className="form-group">
              <label htmlFor="orderId">Mã đơn hàng (tùy chọn):</label>
              <input
                type="number"
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Nhập mã đơn hàng nếu có"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="content">Nội dung đánh giá:</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              rows={4}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Hủy
            </button>
            <button type="submit" className="submit-btn">
              {review ? 'Cập nhật' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
