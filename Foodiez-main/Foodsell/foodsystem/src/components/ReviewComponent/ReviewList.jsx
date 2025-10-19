import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ComplaintForm from '../ComplaintComponent/ComplaintForm';
import './Review.css';

export default function ReviewList({ reviews = [], onEdit, onDelete, onReply, userRole = 'customer' }) {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [complainingTo, setComplainingTo] = useState(null);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="review-empty">
        <div className="empty-icon">⭐</div>
        <p>Chưa có đánh giá nào</p>
        <small>Hãy là người đầu tiên đánh giá sản phẩm này!</small>
      </div>
    );
  }

  const handleReply = (reviewId) => {
    if (replyText.trim()) {
      onReply(reviewId, replyText.trim());
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const canEditReview = (review) => {
    return user && (user.id === review.userId || user.role === 'admin');
  };

  const canDeleteReview = (review) => {
    return user && (user.id === review.userId || user.role === 'admin');
  };

  const canReplyToReview = (review) => {
    return user && (user.role === 'merchant' || user.role === 'admin') && review.userId !== user.id;
  };

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <div className="review-author-info">
              <div className="review-author">{review.user?.name || review.userName || 'Người dùng'}</div>
              <div className="review-verified">
                {review.isVerified ? '✓ Đã xác thực' : 'Chưa xác thực'}
              </div>
            </div>
            <div className="review-rating">
              <div className="stars">
                {'★'.repeat(review.rating || 0)}
                {'☆'.repeat(5 - (review.rating || 0))}
              </div>
              <span className="rating-number">({review.rating}/5)</span>
            </div>
          </div>
          
          <div className="review-content">
            <div className="review-comment">{review.comment}</div>
            
            {/* Hiển thị reply của merchant */}
            {review.merchantReply && (
              <div className="merchant-reply">
                <div className="reply-header">
                  <span className="reply-author">🏪 Phản hồi từ cửa hàng</span>
                  <span className="reply-date">
                    {new Date(review.merchantReply.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="reply-content">{review.merchantReply.content}</div>
              </div>
            )}
          </div>
          
          <div className="review-footer">
            <div className="review-meta">
              <span className="review-date">
                {new Date(review.createdAt || review.created_at || Date.now()).toLocaleString()}
              </span>
              {review.updatedAt && review.updatedAt !== review.createdAt && (
                <span className="review-updated">(Đã chỉnh sửa)</span>
              )}
            </div>
            
            <div className="review-actions">
              {/* Nút trả lời cho merchant */}
              {canReplyToReview(review) && !review.merchantReply && (
                <button 
                  className="review-btn reply-btn"
                  onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                >
                  💬 Trả lời
                </button>
              )}
              
              {/* Nút chỉnh sửa cho chủ review hoặc admin */}
              {canEditReview(review) && (
                <button 
                  className="review-btn edit-btn" 
                  onClick={() => onEdit(review)}
                >
                  ✏️ Sửa
                </button>
              )}
              
              {/* Nút xóa cho chủ review hoặc admin */}
              {canDeleteReview(review) && (
                <button 
                  className="review-btn danger-btn" 
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
                      onDelete(review.id);
                    }
                  }}
                >
                  🗑️ Xóa
                </button>
              )}
              
              {/* Nút khiếu nại cho user khác (không phải chủ review) */}
              {user && user.id !== review.userId && (
                <button 
                  className="review-btn complaint-btn" 
                  onClick={() => setComplainingTo(review.id)}
                >
                  🚨 Khiếu nại
                </button>
              )}
            </div>
          </div>
          
          {/* Form trả lời */}
          {replyingTo === review.id && (
            <div className="reply-form">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết phản hồi cho khách hàng..."
                rows={3}
              />
              <div className="reply-actions">
                <button 
                  className="cancel-reply-btn"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                >
                  Hủy
                </button>
                <button 
                  className="send-reply-btn"
                  onClick={() => handleReply(review.id)}
                  disabled={!replyText.trim()}
                >
                  Gửi phản hồi
                </button>
              </div>
            </div>
          )}
          
          {/* Complaint Form */}
          {complainingTo === review.id && (
            <ComplaintForm
              reviewId={review.id}
              onSuccess={() => {
                setComplainingTo(null);
                alert('Khiếu nại đã được gửi thành công!');
              }}
              onCancel={() => setComplainingTo(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
}








