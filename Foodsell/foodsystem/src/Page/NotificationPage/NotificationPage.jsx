import React, { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../../api/notification';
import './NotificationPage.css';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterRead, setFilterRead] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationAPI.getMyNotifications();
      
      if (response.success) {
        let filtered = response.data || [];
        
        // Filter by type
        if (filterType) {
          filtered = filtered.filter(n => n.type === filterType);
        }
        
        // Filter by read status
        if (filterRead === 'read') {
          filtered = filtered.filter(n => n.isRead);
        } else if (filterRead === 'unread') {
          filtered = filtered.filter(n => !n.isRead);
        }
        
        setNotifications(filtered);
      } else {
        throw new Error(response.message || 'Không thể tải notifications');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterRead]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      alert('Đã đánh dấu tất cả đã đọc!');
    } catch (err) {
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

  const getTypeLabel = (type) => {
    switch (type?.toUpperCase()) {
      case 'ORDER': return 'Đơn hàng';
      case 'PROMOTION': return 'Khuyến mãi';
      case 'MESSAGE': return 'Tin nhắn';
      case 'DELIVERY': return 'Giao hàng';
      case 'SYSTEM': default: return 'Hệ thống';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-page">
      <div className="notification-page-header">
        <h1>🔔 Thông báo của tôi</h1>
        {unreadCount > 0 && (
          <button 
            className="btn btn-primary"
            onClick={markAllAsRead}
          >
            Đánh dấu tất cả đã đọc ({unreadCount} chưa đọc)
          </button>
        )}
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
            <option value="ORDER">Đơn hàng</option>
            <option value="PROMOTION">Khuyến mãi</option>
            <option value="MESSAGE">Tin nhắn</option>
            <option value="DELIVERY">Giao hàng</option>
            <option value="SYSTEM">Hệ thống</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select 
            value={filterRead} 
            onChange={(e) => setFilterRead(e.target.value)}
            className="form-select"
          >
            <option value="">Tất cả</option>
            <option value="unread">Chưa đọc</option>
            <option value="read">Đã đọc</option>
          </select>
        </div>
        
        <button 
          className="btn btn-secondary"
          onClick={() => {
            setFilterType('');
            setFilterRead('');
          }}
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {loading ? (
          <div className="text-center p-4">Đang tải...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-4">
            <p>Không có thông báo nào</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getTypeIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-header-item">
                  <span className="notification-title">{notification.title}</span>
                  <span className="notification-type-badge">{getTypeLabel(notification.type)}</span>
                  {!notification.isRead && (
                    <span className="badge bg-warning">Chưa đọc</span>
                  )}
                </div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatDate(notification.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPage;

