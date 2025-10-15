import React, { useState, useEffect } from 'react';
import './Review.css';

export default function ReviewForm({ initialValue, onSubmit, submitting }) {
  const [rating, setRating] = useState(initialValue?.rating || 5);
  const [comment, setComment] = useState(initialValue?.comment || '');

  useEffect(() => {
    setRating(initialValue?.rating || 5);
    setComment(initialValue?.comment || '');
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Đánh giá</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5,4,3,2,1].map((v) => (
            <option key={v} value={v}>{v} sao</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Nhận xét</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Chia sẻ trải nghiệm của bạn..." />
      </div>
      <button type="submit" className="review-submit" disabled={submitting}>
        {submitting ? 'Đang gửi...' : (initialValue ? 'Cập nhật' : 'Gửi đánh giá')}
      </button>
    </form>
  );
}





