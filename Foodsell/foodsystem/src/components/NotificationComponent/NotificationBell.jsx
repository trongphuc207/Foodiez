import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../../api/notification';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    loadNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCount();
      if (showDropdown) {
        loadNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [showDropdown]);

  const loadUnreadCount = async () => {
    try {
      const res = await notificationAPI.getUnreadCount();
      if (res?.success) setUnreadCount(res.data);
    } catch (e) { console.error('Unread count error:', e); }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getMyNotifications();
      if (res?.success) setNotifications((res.data || []).slice(0, 10));
    } catch (e) {
      console.error('Notifications load error:', e);
    } finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) { console.error('Mark as read error:', e); }
  };

  const markAll = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error('Mark all error:', e); }
  };

  const iconOf = (type) => {
    switch ((type || '').toUpperCase()) {
      case 'ORDER': return '🧾';
      case 'PROMOTION': return '🏷️';
      case 'MESSAGE': return '💬';
      case 'DELIVERY': return '🚚';
      case 'SYSTEM': default: return '🔔';
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return 'Vừa xong';
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div className="notification-bell">
      <div className="bell-icon" onClick={() => setShowDropdown(!showDropdown)}>
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Thông báo</h4>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={markAll}>Đánh dấu tất cả đã đọc</button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">Không có thông báo nào</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notification-item ${!n.isRead ? 'unread' : ''}`} onClick={() => markAsRead(n.id)}>
                  <div className="notification-icon">{iconOf(n.type)}</div>
                  <div className="notification-content">
                    <div className="notification-title">{n.title}</div>
                    <div className="notification-text">{n.message}</div>
                    <div className="notification-time">{formatTime(n.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notification-footer">
            <button className="view-all-btn" onClick={() => { 
              setShowDropdown(false);
              window.location.href = '/notifications'; 
            }}>Xem tất cả</button>
          </div>
        </div>
      )}

      {showDropdown && <div className="notification-overlay" onClick={() => setShowDropdown(false)}></div>}
    </div>
  );
};

export default NotificationBell;

