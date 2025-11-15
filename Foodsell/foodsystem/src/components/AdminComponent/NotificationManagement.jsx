import React, { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../../api/notification';
import { adminAPI } from '../../api/admin';
import './NotificationManagement.css';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  const [formData, setFormData] = useState({
    targetType: 'all', // 'all', 'role', 'user'
    role: 'customer', // 'customer', 'seller', 'shipper'
    userId: '',
    type: 'SYSTEM',
    title: '',
    message: ''
  });

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterStartDate) params.append('start', filterStartDate + 'T00:00:00');
      if (filterEndDate) params.append('end', filterEndDate + 'T23:59:59');
      
      const queryString = params.toString();
      const url = queryString 
        ? `${'http://localhost:8080/api'}/notifications/admin/log?${queryString}`
        : `${'http://localhost:8080/api'}/notifications/admin/log`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tải danh sách notifications');
      }
      
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data || []);
      } else {
        throw new Error(result.message || 'Không thể tải danh sách notifications');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStartDate, filterEndDate]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      
      let userIds = [];
      
      // Xác định danh sách user IDs cần gửi
      if (formData.targetType === 'user') {
        // Gửi cho user cụ thể
        if (!formData.userId) {
          throw new Error('Vui lòng nhập User ID');
        }
        userIds = [parseInt(formData.userId)];
      } else if (formData.targetType === 'role') {
        // Gửi cho tất cả users có role cụ thể
        let users;
        try {
          users = await adminAPI.getUsers();
          if (!Array.isArray(users)) {
            throw new Error('Response không phải là array');
          }
          console.log(`📋 Loaded ${users.length} users from API`);
        } catch (err) {
          console.error('Error loading users:', err);
          throw new Error('Không thể tải danh sách người dùng. Vui lòng kiểm tra quyền truy cập hoặc thử lại sau.');
        }
        
        // Map role từ form sang các giá trị có thể có trong database
        const roleMap = {
          'customer': ['customer', 'buyer', 'CUSTOMER', 'BUYER', 'Customer', 'Buyer'],
          'seller': ['seller', 'merchant', 'SELLER', 'MERCHANT', 'Seller', 'Merchant'],
          'shipper': ['shipper', 'SHIPPER', 'Shipper']
        };
        const targetRoles = roleMap[formData.role] || [formData.role, formData.role.toUpperCase(), formData.role.toLowerCase()];
        
        console.log(`🔍 Filtering users by role: ${formData.role}`);
        console.log(`🔍 Target roles to match:`, targetRoles);
        
        // Filter users theo role (case-insensitive)
        const filteredUsers = users.filter(u => {
          if (!u || !u.id) {
            return false;
          }
          const userRole = (u.role || '').trim();
          const matches = targetRoles.some(targetRole => 
            userRole.toLowerCase() === targetRole.toLowerCase()
          );
          if (matches) {
            console.log(`✅ User ${u.id} (${u.email}) has role "${userRole}" - matches!`);
          }
          return matches;
        });
        
        console.log(`📊 Found ${filteredUsers.length} users with role ${formData.role}`);
        
        userIds = filteredUsers
          .map(u => {
            const id = u.id;
            // Đảm bảo id là số nguyên
            if (typeof id === 'number') {
              return id;
            } else if (typeof id === 'string') {
              const parsed = parseInt(id);
              if (!isNaN(parsed)) {
                return parsed;
              }
            }
            console.warn(`⚠️ Invalid user ID format:`, id, 'for user:', u);
            return null;
          })
          .filter(id => id !== null && !isNaN(id));
        
        console.log(`📋 Extracted ${userIds.length} valid user IDs:`, userIds);
        
        if (userIds.length === 0) {
          throw new Error(`Không tìm thấy user nào có role: ${formData.role}`);
        }
      } else {
        // Gửi cho tất cả users
        let users;
        try {
          users = await adminAPI.getUsers();
          if (!Array.isArray(users)) {
            throw new Error('Response không phải là array');
          }
          console.log(`📋 Loaded ${users.length} users from API`);
        } catch (err) {
          console.error('Error loading users:', err);
          throw new Error('Không thể tải danh sách người dùng. Vui lòng kiểm tra quyền truy cập hoặc thử lại sau.');
        }
        
        userIds = users
          .filter(u => u && u.id)
          .map(u => {
            const id = u.id;
            if (typeof id === 'number') {
              return id;
            } else if (typeof id === 'string') {
              const parsed = parseInt(id);
              if (!isNaN(parsed)) {
                return parsed;
              }
            }
            console.warn(`⚠️ Invalid user ID format:`, id, 'for user:', u);
            return null;
          })
          .filter(id => id !== null && !isNaN(id));
        
        console.log(`📋 Extracted ${userIds.length} valid user IDs for all users`);
        
        if (userIds.length === 0) {
          throw new Error('Không tìm thấy user nào');
        }
      }
      
      // Gửi notification cho từng user
      let successCount = 0;
      let failCount = 0;
      
      for (const userId of userIds) {
        try {
          // Đảm bảo userId là số nguyên
          const validUserId = typeof userId === 'number' ? userId : parseInt(userId);
          if (isNaN(validUserId)) {
            console.error(`Invalid userId: ${userId}`);
            failCount++;
            continue;
          }
          
          const notificationData = {
            userId: validUserId,
            type: formData.type,
            title: formData.title,
            message: formData.message
          };
          
          console.log(`Sending notification to user ${validUserId}:`, notificationData);
          
          const result = await notificationAPI.createNotification(notificationData);
          if (result && result.success) {
            successCount++;
            console.log(`✅ Successfully sent notification to user ${validUserId}`);
          } else {
            failCount++;
            console.error(`❌ Failed to send notification to user ${validUserId}:`, result);
          }
        } catch (err) {
          console.error(`❌ Error sending notification to user ${userId}:`, err);
          console.error(`Error details:`, err.message, err.stack);
          failCount++;
        }
      }
      
      setShowCreateModal(false);
      setFormData({ targetType: 'all', role: 'customer', userId: '', type: 'SYSTEM', title: '', message: '' });
      loadNotifications();
      
      if (failCount === 0) {
        alert(`✅ Đã gửi notification thành công cho ${successCount} user(s)!`);
      } else {
        alert(`⚠️ Đã gửi thành công cho ${successCount} user(s), thất bại ${failCount} user(s)`);
      }
    } catch (err) {
      setError(err.message);
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notification) => {
    setSelectedNotification(notification);
    setFormData({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const updateData = {
        type: formData.type,
        title: formData.title,
        message: formData.message
      };
      
      const result = await notificationAPI.editNotification(selectedNotification.id, updateData);
      if (result.success) {
        setShowEditModal(false);
        setSelectedNotification(null);
        setFormData({ userId: '', type: 'SYSTEM', title: '', message: '' });
        loadNotifications();
        alert('Chỉnh sửa notification thành công!');
      } else {
        throw new Error(result.message || 'Không thể chỉnh sửa notification');
      }
    } catch (err) {
      setError(err.message);
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa notification này không?')) {
      return;
    }
    
    try {
      setError(null);
      const result = await notificationAPI.deleteNotification(id);
      if (result.success) {
        loadNotifications();
        alert('Xóa notification thành công!');
      } else {
        throw new Error(result.message || 'Không thể xóa notification');
      }
    } catch (err) {
      setError(err.message);
      alert('Lỗi: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'ORDER': return '🧾';
      case 'PROMOTION': return '🏷️';
      case 'MESSAGE': return '💬';
      case 'DELIVERY': return '🚚';
      case 'SYSTEM': default: return '🔔';
    }
  };

  return (
    <div className="notification-management">
      <div className="notification-header">
        <h2>🔔 Quản lý Thông báo</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Tạo thông báo mới
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="notification-filters">
        <div className="filter-group">
          <label>Loại thông báo:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="form-select"
          >
            <option value="">Tất cả</option>
            <option value="PROMOTION">Khuyến mãi</option>
            <option value="MESSAGE">Tin nhắn</option>
            <option value="SYSTEM">Hệ thống</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Từ ngày:</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className="filter-group">
          <label>Đến ngày:</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="form-control"
          />
        </div>
        
        <button 
          className="btn btn-secondary"
          onClick={() => {
            setFilterType('');
            setFilterStartDate('');
            setFilterEndDate('');
          }}
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Notifications Table */}
      <div className="notification-table-container">
        {loading ? (
          <div className="text-center p-4">Đang tải...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-4">Không có notification nào</div>
        ) : (
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Loại</th>
                <th>User ID</th>
                <th>Tiêu đề</th>
                <th>Nội dung</th>
                <th>Đã đọc</th>
                <th>Thời gian</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id}>
                  <td>{notification.id}</td>
                  <td>
                    <span className="notification-type">
                      {getTypeIcon(notification.type)} {notification.type}
                    </span>
                  </td>
                  <td>{notification.userId}</td>
                  <td>{notification.title}</td>
                  <td className="notification-message">
                    {notification.message?.length > 50 
                      ? notification.message.substring(0, 50) + '...' 
                      : notification.message}
                  </td>
                  <td>
                    {notification.isRead ? (
                      <span className="badge bg-success">Đã đọc</span>
                    ) : (
                      <span className="badge bg-warning">Chưa đọc</span>
                    )}
                  </td>
                  <td>{formatDate(notification.createdAt)}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(notification)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(notification.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo thông báo mới</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Gửi cho:</label>
                <select
                  value={formData.targetType}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value, userId: '' })}
                  className="form-select"
                  required
                >
                  <option value="all">Tất cả users</option>
                  <option value="role">Theo role</option>
                  <option value="user">User cụ thể</option>
                </select>
              </div>
              
              {formData.targetType === 'role' && (
                <div className="form-group">
                  <label>Role:</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller/Merchant</option>
                    <option value="shipper">Shipper</option>
                  </select>
                </div>
              )}
              
              {formData.targetType === 'user' && (
                <div className="form-group">
                  <label>User ID:</label>
                  <input
                    type="number"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="form-control"
                    required
                    placeholder="Nhập User ID"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Loại:</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="SYSTEM">Hệ thống</option>
                  <option value="PROMOTION">Khuyến mãi</option>
                  <option value="MESSAGE">Tin nhắn</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tiêu đề:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Nội dung:</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-control"
                  rows="4"
                  required
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Tạo'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa thông báo</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Loại:</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="SYSTEM">Hệ thống</option>
                  <option value="PROMOTION">Khuyến mãi</option>
                  <option value="MESSAGE">Tin nhắn</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tiêu đề:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Nội dung:</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-control"
                  rows="4"
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">Cập nhật</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;
