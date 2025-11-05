import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../../../api/complaint';
import './ComplaintManagement.css';

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, under_review, resolved, rejected
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [stats, setStats] = useState(null);

  // Load complaints
  const loadComplaints = async () => {
    try {
      setLoading(true);
      const result = await complaintAPI.adminGetAllComplaints();
      if (result.success) {
        setComplaints(result.data);
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const result = await complaintAPI.adminGetStatistics();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadComplaints();
    loadStats();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  // Get status badge color
  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: '#fbbf24', text: 'Chờ xử lý' },
      under_review: { color: '#3b82f6', text: 'Đang xem xét' },
      resolved: { color: '#10b981', text: 'Đã giải quyết' },
      rejected: { color: '#ef4444', text: 'Từ chối' }
    };
    const badge = badges[status] || { color: '#6b7280', text: status };
    return (
      <span className="status-badge" style={{ backgroundColor: badge.color }}>
        {badge.text}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const badges = {
      low: { color: '#9ca3af', text: 'Thấp' },
      normal: { color: '#3b82f6', text: 'Bình thường' },
      high: { color: '#f59e0b', text: 'Cao' },
      urgent: { color: '#ef4444', text: 'Khẩn cấp' }
    };
    const badge = badges[priority] || { color: '#6b7280', text: priority };
    return (
      <span className="priority-badge" style={{ backgroundColor: badge.color }}>
        {badge.text}
      </span>
    );
  };

  // View complaint detail
  const viewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  // Assign to self
  const handleAssign = async (id) => {
    try {
      const result = await complaintAPI.adminAssignComplaint(id);
      if (result.success) {
        alert('Đã tiếp nhận khiếu nại!');
        loadComplaints();
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  // Update status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const result = await complaintAPI.adminUpdateStatus(id, newStatus);
      if (result.success) {
        alert('Đã cập nhật trạng thái!');
        loadComplaints();
        if (selectedComplaint && selectedComplaint.id === id) {
          setSelectedComplaint(result.data);
        }
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  // Make decision
  const handleMakeDecision = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDecisionModal(true);
  };

  // Calculate stats from complaints
  const calculateStats = () => {
    const pending = complaints.filter(c => c.status === 'pending').length;
    const underReview = complaints.filter(c => c.status === 'under_review').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const rejected = complaints.filter(c => c.status === 'rejected').length;
    return { pending, underReview, resolved, rejected };
  };

  const localStats = calculateStats();

  return (
    <div className="complaint-management">
      <div className="page-header">
        <h1>📋 Quản lý Khiếu nại</h1>
        <button className="refresh-btn" onClick={loadComplaints}>
          🔄 Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card pending" onClick={() => setFilter('pending')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-label">Chờ xử lý</div>
            <div className="stat-value">{localStats.pending}</div>
          </div>
        </div>
        <div className="stat-card under-review" onClick={() => setFilter('under_review')}>
          <div className="stat-icon">🔍</div>
          <div className="stat-info">
            <div className="stat-label">Đang xem xét</div>
            <div className="stat-value">{localStats.underReview}</div>
          </div>
        </div>
        <div className="stat-card resolved" onClick={() => setFilter('resolved')}>
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">Đã giải quyết</div>
            <div className="stat-value">{localStats.resolved}</div>
          </div>
        </div>
        <div className="stat-card rejected" onClick={() => setFilter('rejected')}>
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-label">Từ chối</div>
            <div className="stat-value">{localStats.rejected}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          Tất cả ({complaints.length})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Chờ xử lý ({localStats.pending})
        </button>
        <button 
          className={filter === 'under_review' ? 'active' : ''} 
          onClick={() => setFilter('under_review')}
        >
          Đang xem xét ({localStats.underReview})
        </button>
        <button 
          className={filter === 'resolved' ? 'active' : ''} 
          onClick={() => setFilter('resolved')}
        >
          Đã giải quyết ({localStats.resolved})
        </button>
        <button 
          className={filter === 'rejected' ? 'active' : ''} 
          onClick={() => setFilter('rejected')}
        >
          Từ chối ({localStats.rejected})
        </button>
      </div>

      {/* Complaints Table */}
      <div className="complaints-table-container">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="no-data">Không có khiếu nại nào</div>
        ) : (
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Người khiếu nại</th>
                <th>Đối tượng</th>
                <th>Loại</th>
                <th>Tiêu đề</th>
                <th>Trạng thái</th>
                <th>Ưu tiên</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(complaint => (
                <tr key={complaint.id}>
                  <td className="complaint-number">{complaint.complaintNumber}</td>
                  <td>
                    <div className="user-info">
                      <span className="user-type">{complaint.complainantType}</span>
                      <span className="user-id">ID: {complaint.complainantId}</span>
                    </div>
                  </td>
                  <td>
                    {complaint.respondentId ? (
                      <div className="user-info">
                        <span className="user-type">{complaint.respondentType}</span>
                        <span className="user-id">ID: {complaint.respondentId}</span>
                      </div>
                    ) : (
                      <span className="no-respondent">System</span>
                    )}
                  </td>
                  <td>{complaint.category}</td>
                  <td className="subject-cell">{complaint.subject}</td>
                  <td>{getStatusBadge(complaint.status)}</td>
                  <td>{getPriorityBadge(complaint.priority)}</td>
                  <td>{new Date(complaint.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-view"
                      onClick={() => viewComplaint(complaint)}
                      title="Xem chi tiết"
                    >
                      👁️
                    </button>
                    {complaint.status === 'pending' && (
                      <button 
                        className="btn-assign"
                        onClick={() => handleAssign(complaint.id)}
                        title="Tiếp nhận"
                      >
                        ✋
                      </button>
                    )}
                    {(complaint.status === 'pending' || complaint.status === 'under_review') && (
                      <button 
                        className="btn-decide"
                        onClick={() => handleMakeDecision(complaint)}
                        title="Quyết định"
                      >
                        ⚖️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedComplaint(null);
          }}
          onStatusChange={handleStatusChange}
          onReload={loadComplaints}
        />
      )}

      {/* Decision Modal */}
      {showDecisionModal && selectedComplaint && (
        <DecisionModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowDecisionModal(false);
            setSelectedComplaint(null);
          }}
          onSuccess={() => {
            setShowDecisionModal(false);
            setSelectedComplaint(null);
            loadComplaints();
          }}
        />
      )}
    </div>
  );
}

// Complaint Detail Modal Component
function ComplaintDetailModal({ complaint, onClose, onStatusChange, onReload }) {
  const [responses, setResponses] = useState(complaint.responses || []);
  const [newResponse, setNewResponse] = useState('');
  const [sending, setSending] = useState(false);

  const handleAddResponse = async () => {
    if (!newResponse.trim()) return;
    
    try {
      setSending(true);
      const result = await complaintAPI.adminAddInternalNote(complaint.id, newResponse);
      if (result.success) {
        alert('Đã thêm ghi chú!');
        setNewResponse('');
        onReload();
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content complaint-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết Khiếu nại</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Basic Info */}
          <div className="detail-section">
            <h3>Thông tin chung</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Mã khiếu nại:</label>
                <span className="complaint-number">{complaint.complaintNumber}</span>
              </div>
              <div className="detail-item">
                <label>Trạng thái:</label>
                <span>{getStatusBadge(complaint.status)}</span>
              </div>
              <div className="detail-item">
                <label>Ưu tiên:</label>
                <span>{getPriorityBadge(complaint.priority)}</span>
              </div>
              <div className="detail-item">
                <label>Ngày tạo:</label>
                <span>{new Date(complaint.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="detail-section">
            <h3>Các bên liên quan</h3>
            <div className="parties-grid">
              <div className="party-card complainant">
                <div className="party-label">Người khiếu nại</div>
                <div className="party-type">{complaint.complainantType}</div>
                <div className="party-id">ID: {complaint.complainantId}</div>
              </div>
              <div className="party-arrow">→</div>
              <div className="party-card respondent">
                <div className="party-label">Đối tượng khiếu nại</div>
                <div className="party-type">{complaint.respondentType || 'System'}</div>
                <div className="party-id">{complaint.respondentId ? `ID: ${complaint.respondentId}` : 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="detail-section">
            <h3>Nội dung khiếu nại</h3>
            <div className="detail-item">
              <label>Loại:</label>
              <span className="category-tag">{complaint.category}</span>
            </div>
            <div className="detail-item">
              <label>Tiêu đề:</label>
              <span>{complaint.subject}</span>
            </div>
            <div className="detail-item full-width">
              <label>Mô tả:</label>
              <div className="description-text">{complaint.description}</div>
            </div>
          </div>

          {/* Images */}
          {complaint.images && complaint.images.length > 0 && (
            <div className="detail-section">
              <h3>Hình ảnh bằng chứng ({complaint.images.length})</h3>
              <div className="images-gallery">
                {complaint.images.map((img, index) => (
                  <div key={index} className="image-item">
                    <img 
                      src={`http://localhost:8080${img.imageUrl}`} 
                      alt={`Evidence ${index + 1}`}
                      onClick={() => window.open(`http://localhost:8080${img.imageUrl}`, '_blank')}
                    />
                    {img.description && <div className="image-desc">{img.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Actions */}
          <div className="detail-section">
            <h3>Hành động</h3>
            <div className="action-buttons">
              <select 
                onChange={(e) => onStatusChange(complaint.id, e.target.value)}
                defaultValue={complaint.status}
                className="status-select"
              >
                <option value="pending">Chờ xử lý</option>
                <option value="under_review">Đang xem xét</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="detail-section">
            <h3>Ghi chú nội bộ (chỉ admin thấy)</h3>
            <div className="response-input">
              <textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="Nhập ghi chú nội bộ..."
                rows="3"
              />
              <button 
                onClick={handleAddResponse}
                disabled={sending || !newResponse.trim()}
                className="btn-send"
              >
                {sending ? 'Đang gửi...' : '📝 Thêm ghi chú'}
              </button>
            </div>
            
            {complaint.adminNote && (
              <div className="admin-note-box">
                <strong>Ghi chú hiện tại:</strong>
                <p>{complaint.adminNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Decision Modal Component
function DecisionModal({ complaint, onClose, onSuccess }) {
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!decision) {
      alert('Vui lòng chọn quyết định!');
      return;
    }
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do!');
      return;
    }

    try {
      setSubmitting(true);
      const result = await complaintAPI.adminMakeDecision(
        complaint.id,
        decision,
        reason,
        adminNote
      );
      if (result.success) {
        alert('Đã đưa ra quyết định!');
        onSuccess();
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content decision-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚖️ Quyết định Khiếu nại</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="complaint-summary">
            <strong>{complaint.complaintNumber}</strong> - {complaint.subject}
          </div>

          <div className="form-group">
            <label>Quyết định *</label>
            <select value={decision} onChange={(e) => setDecision(e.target.value)}>
              <option value="">-- Chọn quyết định --</option>
              <option value="approved">✅ Chấp nhận (Approved)</option>
              <option value="rejected">❌ Từ chối (Rejected)</option>
              <option value="needs_more_info">❓ Cần thêm thông tin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Lý do * (hiển thị cho người dùng)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do quyết định..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Ghi chú nội bộ (chỉ admin thấy)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Ghi chú nội bộ (optional)..."
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button 
              className="btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Đang xử lý...' : '✓ Xác nhận quyết định'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getStatusBadge(status) {
  const badges = {
    pending: { color: '#fbbf24', text: 'Chờ xử lý' },
    under_review: { color: '#3b82f6', text: 'Đang xem xét' },
    resolved: { color: '#10b981', text: 'Đã giải quyết' },
    rejected: { color: '#ef4444', text: 'Từ chối' }
  };
  const badge = badges[status] || { color: '#6b7280', text: status };
  return (
    <span className="status-badge" style={{ backgroundColor: badge.color }}>
      {badge.text}
    </span>
  );
}

function getPriorityBadge(priority) {
  const badges = {
    low: { color: '#9ca3af', text: 'Thấp' },
    normal: { color: '#3b82f6', text: 'Bình thường' },
    high: { color: '#f59e0b', text: 'Cao' },
    urgent: { color: '#ef4444', text: 'Khẩn cấp' }
  };
  const badge = badges[priority] || { color: '#6b7280', text: priority };
  return (
    <span className="priority-badge" style={{ backgroundColor: badge.color }}>
      {badge.text}
    </span>
  );
}
