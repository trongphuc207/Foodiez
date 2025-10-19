import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { complaintAPI } from '../../api/complaint';
import ComplaintList from '../../components/ComplaintComponent/ComplaintList';
import './ComplaintManagementPage.css';

export default function ComplaintManagementPage() {
  const { user, isAuthenticated } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadComplaints();
      loadStats();
    }
  }, [isAuthenticated, user, filter]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      let data;
      
      switch (filter) {
        case 'unresolved':
          data = await complaintAPI.getUnresolvedComplaints();
          break;
        case 'pending':
          data = await complaintAPI.getComplaintsByStatus('PENDING');
          break;
        case 'under_review':
          data = await complaintAPI.getComplaintsByStatus('UNDER_REVIEW');
          break;
        case 'resolved':
          data = await complaintAPI.getComplaintsByStatus('RESOLVED');
          break;
        default:
          data = await complaintAPI.getAllComplaints();
      }
      
      setComplaints(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error loading complaints:', err);
      setError('Không thể tải danh sách khiếu nại');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await complaintAPI.getComplaintStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleComplaintUpdate = () => {
    loadComplaints();
    loadStats();
  };

  if (!isAuthenticated) {
    return (
      <div className="complaint-management-page">
        <div className="unauthorized">
          <h2>🔒 Truy cập bị từ chối</h2>
          <p>Vui lòng đăng nhập để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="complaint-management-page">
        <div className="unauthorized">
          <h2>🚫 Không có quyền truy cập</h2>
          <p>Chỉ Admin mới có thể truy cập trang quản lý khiếu nại.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="complaint-management-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="complaint-management-page">
      <div className="page-header">
        <h1>🚨 Quản lý khiếu nại Review</h1>
        <p>Quản lý và giải quyết các khiếu nại về đánh giá sản phẩm</p>
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <h2>📊 Thống kê</h2>
        <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-number">{stats.pending || 0}</div>
            <div className="stat-label">Chờ xử lý</div>
          </div>
          <div className="stat-card under-review">
            <div className="stat-number">{stats.underReview || 0}</div>
            <div className="stat-label">Đang xem xét</div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-number">{stats.resolved || 0}</div>
            <div className="stat-label">Đã giải quyết</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-number">{stats.rejected || 0}</div>
            <div className="stat-label">Từ chối</div>
          </div>
          <div className="stat-card closed">
            <div className="stat-number">{stats.closed || 0}</div>
            <div className="stat-label">Đóng</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h2>🔍 Bộ lọc</h2>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({complaints.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unresolved' ? 'active' : ''}`}
            onClick={() => setFilter('unresolved')}
          >
            Chưa xử lý ({stats.pending + stats.underReview || 0})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Chờ xử lý ({stats.pending || 0})
          </button>
          <button
            className={`filter-btn ${filter === 'under_review' ? 'active' : ''}`}
            onClick={() => setFilter('under_review')}
          >
            Đang xem xét ({stats.underReview || 0})
          </button>
          <button
            className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Đã giải quyết ({stats.resolved || 0})
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadComplaints} className="retry-btn">
            Thử lại
          </button>
        </div>
      )}

      {/* Complaints List */}
      <div className="complaints-section">
        <ComplaintList
          complaints={complaints}
          onUpdate={handleComplaintUpdate}
          userRole="admin"
        />
      </div>
    </div>
  );
}
