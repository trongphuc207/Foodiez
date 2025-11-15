import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../../api/review';
import './ReviewReply.css';

const ReviewReply = ({ reviewId, userRole, onReply }) => {
  const [replies, setReplies] = useState([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReplies();
  }, [reviewId]);

  const loadReplies = async () => {
    try {
      const response = await reviewAPI.getReviewReplies(reviewId);
      if (response.success) {
        setReplies(response.data || []);
      }
    } catch (err) {
      console.error('Không thể tải phản hồi:', err);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      alert('Vui lòng nhập nội dung phản hồi!');
      return;
    }

    setLoading(true);
    try {
      await onReply(reviewId, replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
      loadReplies(); // Reload replies
    } catch (err) {
      alert('Không thể gửi phản hồi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-reply">
      {/* Hiển thị các reply hiện có */}
      {replies.length > 0 && (
        <div className="replies-list">
          {replies.map((reply) => (
            <div key={reply.id} className="reply-item">
              <div className="reply-header">
                <span className="reply-author">Chủ shop</span>
                <span className="reply-date">
                  {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="reply-content">
                <p>{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nút trả lời cho merchant */}
      {userRole === 'SELLER' && !showReplyForm && (
        <button 
          className="reply-btn"
          onClick={() => setShowReplyForm(true)}
        >
          Trả lời đánh giá
        </button>
      )}

      {/* Form trả lời */}
      {showReplyForm && (
        <form className="reply-form" onSubmit={handleReplySubmit}>
          <div className="form-group">
            <label htmlFor="replyContent">Phản hồi của bạn:</label>
            <textarea
              id="replyContent"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Cảm ơn khách hàng và chia sẻ thêm thông tin..."
              rows={3}
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setShowReplyForm(false)}
              className="cancel-btn"
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewReply;