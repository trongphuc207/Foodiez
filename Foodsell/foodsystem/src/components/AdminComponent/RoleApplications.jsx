import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export default function RoleApplications() {
  const [applications, setApplications] = useState([]);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' | 'reject' | 'view'
  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    setErr('');
    try {
      const token = localStorage.getItem('authToken'); // FIX: use 'authToken' not 'token'
      const res = await axios.get(`${API_BASE}/role-applications/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Backend returns {success: true, applications: [...]}
      const appList = res.data.applications || res.data;
      setApplications(Array.isArray(appList) ? appList : []);
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || 'Không thể tải danh sách đơn');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (appId, note) => {
    setErr(''); setOk('');
    try {
      const token = localStorage.getItem('authToken'); // FIX: use 'authToken' not 'token'
      await axios.post(`${API_BASE}/role-applications/${appId}/approve`, 
        { note: note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOk('Đã duyệt đơn thành công!');
      setSelectedApp(null);
      setAdminNote('');
      await load();
      setTimeout(() => setOk(''), 3000);
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || 'Không thể duyệt đơn');
    }
  };

  const handleReject = async (appId, note) => {
    if (!note || note.trim() === '') {
      setErr('Vui lòng nhập lý do từ chối');
      return;
    }
    
    setErr(''); setOk('');
    try {
      const token = localStorage.getItem('authToken'); // FIX: use 'authToken' not 'token'
      await axios.post(`${API_BASE}/role-applications/${appId}/reject`, 
        { reason: note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOk('Đã từ chối đơn');
      setSelectedApp(null);
      setAdminNote('');
      setRejectReason('');
      await load();
      setTimeout(() => setOk(''), 3000);
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || 'Không thể từ chối đơn');
    }
  };

  const openModal = (app, type) => {
    setSelectedApp(app);
    setActionType(type);
    setAdminNote('');
    setRejectReason('');
    setErr('');
  };

  const closeModal = () => {
    setSelectedApp(null);
    setActionType('');
    setAdminNote('');
    setRejectReason('');
  };

  const confirmAction = () => {
    if (actionType === 'approve') {
      handleApprove(selectedApp.id, adminNote);
    } else if (actionType === 'reject') {
      handleReject(selectedApp.id, rejectReason);
    }
  };

  // FIX: Compare with lowercase 'pending' 
  const pendingApps = applications.filter(a => 
    (a.status || '').toLowerCase() === 'pending'
  );
  const processedApps = applications.filter(a => 
    (a.status || '').toLowerCase() !== 'pending'
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN');
  };

  const renderAppCard = (app) => {
    const statusLower = (app.status || '').toLowerCase();
    
    const statusColor = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'danger'
    };
    
    const statusText = {
      'pending': 'Chờ duyệt',
      'approved': 'Đã duyệt',
      'rejected': 'Đã từ chối'
    };
    
    const roleText = {
      'seller': 'Người bán',
      'shipper': 'Shipper'
    };
    
    const roleLower = (app.requestedRole || '').toLowerCase();

    return (
      <div key={app.id} className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <h5 className="card-title mb-2">
                Đơn #{app.id} - {roleText[roleLower] || app.requestedRole}
                <span className={`badge bg-${statusColor[statusLower] || 'secondary'} ms-2`}>
                  {statusText[statusLower] || app.status}
                </span>
              </h5>
              
              <div className="mb-2">
                <strong>User:</strong> {app.userName} ({app.userEmail})
              </div>
              
              <div className="mb-2">
                <strong>Ngày nộp:</strong> {formatDate(app.createdAt)}
              </div>

              {statusLower === 'approved' && (
                <div className="text-success mt-2">
                  <strong>✓ Đã duyệt</strong>
                  {app.reviewedAt && <span className="small"> - {formatDate(app.reviewedAt)}</span>}
                  {app.adminNote && <div className="small text-muted">Ghi chú: {app.adminNote}</div>}
                </div>
              )}

              {statusLower === 'rejected' && (
                <div className="text-danger mt-2">
                  <strong>✗ Đã từ chối</strong>
                  {app.reviewedAt && <span className="small"> - {formatDate(app.reviewedAt)}</span>}
                  {app.adminNote && <div className="small">Lý do: {app.adminNote}</div>}
                </div>
              )}
            </div>

            {/* 3 BUTTONS: Xem chi tiết, Đồng ý, Từ chối */}
            {statusLower === 'pending' && (
              <div className="d-flex gap-2 flex-column">
                <button 
                  className="btn btn-info btn-sm"
                  onClick={() => openModal(app, 'view')}
                >
                  👁️ Xem chi tiết
                </button>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => openModal(app, 'approve')}
                >
                  ✓ Đồng ý
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => openModal(app, 'reject')}
                >
                  ✗ Từ chối
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {err && <div className="alert alert-danger" role="alert">{err}</div>}
      {ok && <div className="alert alert-success" role="alert">{ok}</div>}
      
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2>Đơn xin chuyển vai trò</h2>
        <button className="btn btn-sm btn-outline-secondary" onClick={load}>
          Tải lại
        </button>
      </div>

      {/* Pending Applications */}
      <div className="mb-4">
        <h4>
          <span className="badge bg-warning text-dark">
            Đang chờ duyệt ({pendingApps.length})
          </span>
        </h4>
        {pendingApps.length === 0 ? (
          <div className="alert alert-info">Không có đơn nào đang chờ duyệt</div>
        ) : (
          pendingApps.map(app => renderAppCard(app))
        )}
      </div>

      {/* Processed Applications */}
      <div>
        <h4>
          <span className="badge bg-secondary">
            Đã xử lý ({processedApps.length})
          </span>
        </h4>
        {processedApps.length === 0 ? (
          <div className="alert alert-secondary">Chưa có đơn nào được xử lý</div>
        ) : (
          processedApps.map(app => renderAppCard(app))
        )}
      </div>

      {/* Modal for View / Approve / Reject */}
      {selectedApp && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={closeModal}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {actionType === 'view' && '👁️ Chi tiết đơn'}
                  {actionType === 'approve' && '✓ Duyệt đơn'}
                  {actionType === 'reject' && '✗ Từ chối đơn'}
                  {' '}#{selectedApp.id}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {/* User Info */}
                <div className="mb-3 p-3 bg-light rounded">
                  <h6 className="mb-2"><strong>👤 Thông tin người nộp đơn:</strong></h6>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Họ tên:</strong> {selectedApp.userName}<br/>
                      <strong>Email:</strong> {selectedApp.userEmail}
                    </div>
                    <div className="col-md-6">
                      <strong>Vai trò yêu cầu:</strong> {
                        (selectedApp.requestedRole || '').toLowerCase() === 'seller' ? 'Người bán 🏪' : 'Shipper 🚚'
                      }<br/>
                      <strong>Ngày nộp:</strong> {formatDate(selectedApp.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Shop Info for Seller */}
                {(selectedApp.requestedRole || '').toLowerCase() === 'seller' && (
                  <div className="alert alert-info">
                    <h6><strong>📦 Thông tin Shop:</strong></h6>
                    <strong>Tên shop:</strong> {selectedApp.shopName || 'N/A'}<br/>
                    <strong>Địa chỉ:</strong> {selectedApp.shopAddress || 'N/A'}<br/>
                    <strong>Mô tả:</strong> {selectedApp.shopDescription || 'N/A'}
                  </div>
                )}

                {/* Reason from user */}
                {selectedApp.reason && (
                  <div className="mb-3">
                    <strong>💬 Lý do xin chuyển vai trò:</strong>
                    <div className="p-2 bg-light rounded mt-1">
                      {selectedApp.reason}
                    </div>
                  </div>
                )}

                {/* View mode - show action buttons */}
                {actionType === 'view' && (
                  <div className="d-flex gap-2 mt-3">
                    <button 
                      className="btn btn-success flex-fill"
                      onClick={() => setActionType('approve')}
                    >
                      ✓ Đồng ý duyệt
                    </button>
                    <button 
                      className="btn btn-danger flex-fill"
                      onClick={() => setActionType('reject')}
                    >
                      ✗ Từ chối
                    </button>
                  </div>
                )}

                {/* Approve mode - show note input */}
                {actionType === 'approve' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label"><strong>Ghi chú (tùy chọn):</strong></label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Ghi chú cho đơn được duyệt..."
                      ></textarea>
                    </div>
                    <div className="alert alert-success mb-0">
                      <strong>📋 Sau khi duyệt:</strong><br/>
                      ✓ User sẽ được chuyển sang vai trò mới<br/>
                      {(selectedApp.requestedRole || '').toLowerCase() === 'seller' && 
                        '✓ Shop sẽ được tạo tự động với thông tin đã cung cấp'}
                    </div>
                  </>
                )}

                {/* Reject mode - show reason input (REQUIRED) */}
                {actionType === 'reject' && (
                  <>
                    <div className="alert alert-warning">
                      <strong>⚠️ Lưu ý:</strong> Vui lòng nhập lý do từ chối để người dùng biết và sửa đổi.
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Lý do từ chối: <span className="text-danger">*</span></strong></label>
                      <textarea 
                        className="form-control" 
                        rows="4"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="VD: Thông tin shop không đầy đủ, địa chỉ không hợp lệ, thiếu chứng từ..."
                        required
                      ></textarea>
                      {err && <div className="text-danger small mt-1">{err}</div>}
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  {actionType === 'view' ? 'Đóng' : 'Hủy'}
                </button>
                {actionType === 'approve' && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={confirmAction}
                  >
                    ✓ Xác nhận duyệt
                  </button>
                )}
                {actionType === 'reject' && (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={confirmAction}
                    disabled={!rejectReason.trim()}
                  >
                    ✗ Xác nhận từ chối
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
