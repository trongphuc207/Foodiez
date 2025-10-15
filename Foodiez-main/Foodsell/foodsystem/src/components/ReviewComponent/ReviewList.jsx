import React from 'react';
import './Review.css';

export default function ReviewList({ reviews = [], onEdit, onDelete }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="review-empty">Chưa có đánh giá nào</div>
    );
  }

  return (
    <div className="review-list">
      {reviews.map((r) => (
        <div key={r.id} className="review-item">
          <div className="review-header">
            <div className="review-author">{r.user?.name || r.userName || 'Người dùng'}</div>
            <div className="review-rating">{'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}</div>
          </div>
          <div className="review-comment">{r.comment}</div>
          <div className="review-footer">
            <span className="review-date">{new Date(r.createdAt || r.created_at || Date.now()).toLocaleString()}</span>
            {onEdit && <button className="review-btn" onClick={() => onEdit(r)}>Sửa</button>}
            {onDelete && <button className="review-btn danger" onClick={() => onDelete(r.id)}>Xóa</button>}
          </div>
        </div>
      ))}
    </div>
  );
}





