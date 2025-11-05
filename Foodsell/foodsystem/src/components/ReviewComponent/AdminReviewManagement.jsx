import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../../api/review';
import StarRating from './StarRating';
import './AdminReviewManagement.css';

const AdminReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    loadAllReviews();
  }, []);

  const loadAllReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getAllReviews();
      if (response.success) {
        setReviews(response.data || []);
      } else {
        setError(response.message || 'Không thể tải danh sách đánh giá');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHideReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn ẩn đánh giá này?')) {
      try {
        const response = await reviewAPI.hideReview(reviewId);
        if (response.success) {
          loadAllReviews(); // Reload danh sách
        } else {
          setError(response.message || 'Không thể ẩn đánh giá');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleResolveComplaint = async (reviewId) => {
    if (!resolution.trim()) {
      alert('Vui lòng nhập nội dung xử lý khiếu nại!');
      return;
    }

    try {
      const response = await reviewAPI.resolveReviewComplaint(reviewId, resolution);
      if (response.success) {
        setShowResolutionForm(false);
        setResolution('');
        setSelectedReview(null);
        loadAllReviews();
      } else {
        setError(response.message || 'Không thể xử lý khiếu nại');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadge = (isVisible) => {
    return (
      <span className={`status-badge ${isVisible ? 'visible' : 'hidden'}`}>
        {isVisible ? 'Hiển thị' : 'Đã ẩn'}
      </span>
    );
  };

  if (loading) {
    return <div className="admin-review-loading">Đang tải danh sách đánh giá...</div>;
  }

  return (
    <div className="admin-review-management">
      <div className="admin-review-header">
        <h2>Quản lý đánh giá</h2>
        <p>Tổng số đánh giá: {reviews.length}</p>
      </div>

      {error && (
        <div className="admin-review-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Đóng</button>
        </div>
      )}

      <div className="reviews-table-container">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Shop</th>
              <th>Đánh giá</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">Không có đánh giá nào</td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.id}</td>
                  <td>#{review.customerId}</td>
                  <td>#{review.productId}</td>
                  <td>#{review.shopId}</td>
                  <td>
                    <StarRating rating={review.rating} readOnly size="small" />
                  </td>
                  <td className="content-cell">
                    <div className="content-preview">
                      {review.content.length > 50 
                        ? `${review.content.substring(0, 50)}...` 
                        : review.content
                      }
                    </div>
                  </td>
                  <td>{getStatusBadge(review.isVisible)}</td>
                  <td>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        className="view-btn"
                        onClick={() => setSelectedReview(review)}
                      >
                        Xem
                      </button>
                      {review.isVisible && (
                        <button 
                          className="hide-btn"
                          onClick={() => handleHideReview(review.id)}
                        >
                          Ẩn
                        </button>
                      )}
                      <button 
                        className="resolve-btn"
                        onClick={() => {
                          setSelectedReview(review);
                          setShowResolutionForm(true);
                        }}
                      >
                        Xử lý
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal xem chi tiết review */}
      {selectedReview && !showResolutionForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chi tiết đánh giá #{selectedReview.id}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedReview(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="review-detail">
                <div className="detail-row">
                  <label>Khách hàng:</label>
                  <span>#{selectedReview.customerId}</span>
                </div>
                <div className="detail-row">
                  <label>Sản phẩm:</label>
                  <span>#{selectedReview.productId}</span>
                </div>
                <div className="detail-row">
                  <label>Shop:</label>
                  <span>#{selectedReview.shopId}</span>
                </div>
                <div className="detail-row">
                  <label>Đánh giá:</label>
                  <StarRating rating={selectedReview.rating} readOnly />
                </div>
                <div className="detail-row">
                  <label>Nội dung:</label>
                  <div className="content-full">{selectedReview.content}</div>
                </div>
                <div className="detail-row">
                  <label>Trạng thái:</label>
                  {getStatusBadge(selectedReview.isVisible)}
                </div>
                <div className="detail-row">
                  <label>Ngày tạo:</label>
                  <span>{new Date(selectedReview.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                {selectedReview.updatedAt && (
                  <div className="detail-row">
                    <label>Cập nhật lần cuối:</label>
                    <span>{new Date(selectedReview.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="close-btn"
                onClick={() => setSelectedReview(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xử lý khiếu nại */}
      {showResolutionForm && selectedReview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Xử lý khiếu nại đánh giá #{selectedReview.id}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowResolutionForm(false);
                  setSelectedReview(null);
                  setResolution('');
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="resolution-form">
                <div className="form-group">
                  <label htmlFor="resolution">Nội dung xử lý:</label>
                  <textarea
                    id="resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Nhập nội dung xử lý khiếu nại..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowResolutionForm(false);
                  setSelectedReview(null);
                  setResolution('');
                }}
              >
                Hủy
              </button>
              <button 
                className="submit-btn"
                onClick={() => handleResolveComplaint(selectedReview.id)}
              >
                Xử lý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewManagement;
