import React, { useState, useEffect, useCallback } from 'react';
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
  const [status, setStatus] = useState('');
  const [shouldHide, setShouldHide] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statistics, setStatistics] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0 });

  const loadAllReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getAllReviews(
        filterStatus || null,
        searchKeyword || null
      );
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
  }, [filterStatus, searchKeyword]);

  const loadStatistics = useCallback(async () => {
    try {
      const response = await reviewAPI.getReviewStatistics();
      if (response.success) {
        setStatistics(response.data || { total: 0, pending: 0, resolved: 0, rejected: 0 });
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  useEffect(() => {
    loadAllReviews();
  }, [loadAllReviews]);

  const handleHideReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn ẩn đánh giá này?')) {
      try {
        const response = await reviewAPI.hideReview(reviewId);
        if (response.success) {
          loadAllReviews();
          loadStatistics();
        } else {
          setError(response.message || 'Không thể ẩn đánh giá');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleResolveComplaint = async (reviewId) => {
    const trimmed = resolution.trim();
    if (!trimmed) {
      alert('Vui lòng nhập nội dung xử lý khiếu nại!');
      return;
    }

    if (!status) {
      alert('Vui lòng chọn trạng thái xử lý!');
      return;
    }

    try {
      const response = await reviewAPI.resolveReviewComplaint(
        reviewId,
        trimmed,
        status,
        shouldHide
      );
      if (response.success) {
        setShowResolutionForm(false);
        setResolution('');
        setStatus('');
        setShouldHide(false);
        setSelectedReview(null);
        loadAllReviews();
        loadStatistics();
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

  const getProcessingStatusBadge = (status) => {
    if (!status) return null;
    const statusUpper = status.toUpperCase();
    let className = 'processing-status-badge';
    let text = statusUpper;
    
    if (statusUpper === 'PENDING') {
      className += ' pending';
      text = 'Chờ xử lý';
    } else if (statusUpper === 'RESOLVED') {
      className += ' resolved';
      text = 'Đã xử lý';
    } else if (statusUpper === 'REJECTED') {
      className += ' rejected';
      text = 'Đã từ chối';
    }
    
    return <span className={className}>{text}</span>;
  };

  const handleSearch = () => {
    loadAllReviews();
  };

  const handleClearFilters = () => {
    setFilterStatus('');
    setSearchKeyword('');
  };

  if (loading && reviews.length === 0) {
    return <div className="admin-review-loading">Đang tải danh sách đánh giá...</div>;
  }

  return (
    <div className="admin-review-management">
      <div className="admin-review-header">
        <h2>Quản lý đánh giá</h2>
        <div className="statistics-container">
          <div className="stat-item">
            <span className="stat-label">Tổng số:</span>
            <span className="stat-value">{statistics.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Chờ xử lý:</span>
            <span className="stat-value pending">{statistics.pending}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Đã xử lý:</span>
            <span className="stat-value resolved">{statistics.resolved}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Đã từ chối:</span>
            <span className="stat-value rejected">{statistics.rejected}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="filter-search-section">
        <div className="filter-group">
          <label htmlFor="status-filter">Lọc theo trạng thái:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="RESOLVED">Đã xử lý</option>
            <option value="REJECTED">Đã từ chối</option>
          </select>
        </div>
        <div className="search-group">
          <input
            type="text"
            placeholder="Tìm kiếm theo nội dung..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Tìm kiếm</button>
        </div>
        {(filterStatus || searchKeyword) && (
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Xóa bộ lọc
          </button>
        )}
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
              <th>Trạng thái hiển thị</th>
              <th>Trạng thái xử lý</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">Không có đánh giá nào</td>
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
                      {review.content && review.content.length > 50 
                        ? `${review.content.substring(0, 50)}...` 
                        : (review.content || '')
                      }
                    </div>
                  </td>
                  <td>{getStatusBadge(review.isVisible)}</td>
                  <td>{getProcessingStatusBadge(review.status)}</td>
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
                          setResolution(review.resolutionNotes || '');
                          setStatus(review.status || 'PENDING');
                          setShouldHide(false);
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
                  <label>Trạng thái hiển thị:</label>
                  {getStatusBadge(selectedReview.isVisible)}
                </div>
                <div className="detail-row">
                  <label>Trạng thái xử lý:</label>
                  {getProcessingStatusBadge(selectedReview.status)}
                </div>
                <div className="detail-row">
                  <label>Kết quả xử lý:</label>
                  <span>{selectedReview.resolutionNotes ? selectedReview.resolutionNotes : 'Chưa có ghi chú xử lý'}</span>
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
                  setStatus('');
                  setShouldHide(false);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="resolution-form">
                <div className="form-group">
                  <label htmlFor="status">Trạng thái xử lý: <span style={{color: 'red'}}>*</span></label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="RESOLVED">Đã xử lý</option>
                    <option value="REJECTED">Đã từ chối</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="resolution">Nội dung xử lý: <span style={{color: 'red'}}>*</span></label>
                  <textarea
                    id="resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Nhập nội dung xử lý khiếu nại..."
                    rows={4}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="shouldHide">
                    <input
                      type="checkbox"
                      id="shouldHide"
                      checked={shouldHide}
                      onChange={(e) => setShouldHide(e.target.checked)}
                    />
                    Ẩn đánh giá này
                  </label>
                  <small style={{display: 'block', color: '#666', marginTop: '5px'}}>
                    (Đánh giá sẽ tự động bị ẩn nếu trạng thái là "Đã từ chối")
                  </small>
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
                  setStatus('');
                  setShouldHide(false);
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