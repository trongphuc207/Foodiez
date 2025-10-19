import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { complaintAPI } from '../../api/complaint';
import './Complaint.css';

const STATUS_COLORS = {
  PENDING: '#ff9800',
  UNDER_REVIEW: '#2196f3',
  RESOLVED: '#4caf50',
  REJECTED: '#f44336',
  CLOSED: '#9e9e9e'
};

const STATUS_LABELS = {
  PENDING: 'Chờ xử lý',
  UNDER_REVIEW: 'Đang xem xét',
  RESOLVED: 'Đã giải quyết',
  REJECTED: 'Từ chối',
  CLOSED: 'Đóng'
};

const COMPLAINT_TYPE_LABELS = {
  INAPPROPRIATE_CONTENT: 'Nội dung không phù hợp',
  FAKE_REVIEW: 'Đánh giá giả mạo',
  SPAM: 'Spam',
  HARASSMENT: 'Quấy rối',
  COPYRIGHT_VIOLATION: 'Vi phạm bản quyền',
  OTHER: 'Khác'
};

export default function ComplaintList({ complaints, onUpdate, userRole = 'customer' }) {
  const { user } = useAuth();
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [resolutionData, setResolutionData] = useState({
    status: 'RESOLVED',
    adminNotes: '',
    resolution: ''
  });

  const handleResolveComplaint = async (complaintId) => {
    try {
      await complaintAPI.resolveComplaint(complaintId, resolutionData);
      alert('Giải quyết khiếu nại thành công!');
      setResolvingComplaint(null);
      setResolutionData({
        status: 'RESOLVED',
        adminNotes: '',
        resolution: ''
      });
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error resolving complaint:', error);
      alert('Có lỗi xảy ra khi giải quyết khiếu nại');
    }
  };

  const handleUpdateStatus = async (complaintId, status) => {
    try {
      await complaintAPI.updateComplaintStatus(complaintId, status);
      alert('Cập nhật trạng thái thành công!');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (!complaints || complaints.length === 0) {
    return (
      <div className="complaint-list-container">
        <div className="complaint-empty">
          <div className="empty-icon">📝</div>
          <p>Chưa có khiếu nại nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="complaint-list-container">
      <div className="complaint-list-header">
        <h3>📋 Danh sách khiếu nại ({complaints.length})</h3>
      </div>

      <div className="complaint-list">
        {complaints.map(complaint => (
          <div key={complaint.id} className="complaint-item">
            <div className="complaint-header">
              <div className="complaint-info">
                <span className="complaint-id">#{complaint.id}</span>
                <span 
                  className="complaint-status"
                  style={{ backgroundColor: STATUS_COLORS[complaint.status] }}
                >
                  {STATUS_LABELS[complaint.status]}
                </span>
                <span className="complaint-type">
                  {COMPLAINT_TYPE_LABELS[complaint.complaintType]}
                </span>
              </div>
              <div className="complaint-date">
                {formatDate(complaint.createdAt)}
              </div>
            </div>

            <div className="complaint-content">
              <div className="complaint-reason">
                <strong>Lý do:</strong> {complaint.complaintReason}
              </div>
              
              {complaint.complaintDetails && (
                <div className="complaint-details">
                  <strong>Chi tiết:</strong> {complaint.complaintDetails}
                </div>
              )}

              <div className="complaint-meta">
                <span><strong>Review ID:</strong> {complaint.reviewId}</span>
                <span><strong>Người báo cáo:</strong> {complaint.reporterName}</span>
              </div>
            </div>

            {complaint.adminNotes && (
              <div className="admin-notes">
                <strong>Ghi chú Admin:</strong> {complaint.adminNotes}
              </div>
            )}

            {complaint.resolution && (
              <div className="resolution">
                <strong>Giải pháp:</strong> {complaint.resolution}
              </div>
            )}

            {complaint.resolvedAt && (
              <div className="resolution-info">
                <span>Giải quyết lúc: {formatDate(complaint.resolvedAt)}</span>
              </div>
            )}

            {/* Admin actions */}
            {userRole === 'admin' && (
              <div className="complaint-actions">
                {complaint.status === 'PENDING' && (
                  <>
                    <button
                      className="action-btn review-btn"
                      onClick={() => handleUpdateStatus(complaint.id, 'UNDER_REVIEW')}
                    >
                      Xem xét
                    </button>
                    <button
                      className="action-btn resolve-btn"
                      onClick={() => setResolvingComplaint(complaint.id)}
                    >
                      Giải quyết
                    </button>
                  </>
                )}

                {complaint.status === 'UNDER_REVIEW' && (
                  <button
                    className="action-btn resolve-btn"
                    onClick={() => setResolvingComplaint(complaint.id)}
                  >
                    Giải quyết
                  </button>
                )}

                <button
                  className="action-btn reject-btn"
                  onClick={() => handleUpdateStatus(complaint.id, 'REJECTED')}
                >
                  Từ chối
                </button>

                <button
                  className="action-btn close-btn"
                  onClick={() => handleUpdateStatus(complaint.id, 'CLOSED')}
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resolution Modal */}
      {resolvingComplaint && (
        <div className="resolution-modal">
          <div className="resolution-modal-content">
            <div className="modal-header">
              <h3>Giải quyết khiếu nại #{resolvingComplaint}</h3>
              <button
                className="close-modal-btn"
                onClick={() => setResolvingComplaint(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={resolutionData.status}
                  onChange={(e) => setResolutionData(prev => ({
                    ...prev,
                    status: e.target.value
                  }))}
                  className="form-select"
                >
                  <option value="RESOLVED">Đã giải quyết</option>
                  <option value="REJECTED">Từ chối</option>
                  <option value="CLOSED">Đóng</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ghi chú Admin</label>
                <textarea
                  value={resolutionData.adminNotes}
                  onChange={(e) => setResolutionData(prev => ({
                    ...prev,
                    adminNotes: e.target.value
                  }))}
                  placeholder="Ghi chú nội bộ..."
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Giải pháp</label>
                <textarea
                  value={resolutionData.resolution}
                  onChange={(e) => setResolutionData(prev => ({
                    ...prev,
                    resolution: e.target.value
                  }))}
                  placeholder="Mô tả giải pháp đã thực hiện..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setResolvingComplaint(null)}
              >
                Hủy
              </button>
              <button
                className="submit-btn"
                onClick={() => handleResolveComplaint(resolvingComplaint)}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
