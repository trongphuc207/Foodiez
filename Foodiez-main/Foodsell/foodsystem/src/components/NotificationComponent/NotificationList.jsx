import React from 'react';
import './Notification.css';
import { useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';

export default function NotificationList({ notifications = [] }) {
  const markAsRead = useMarkAsRead();
  const markAll = useMarkAllAsRead();

  const handleMarkAll = () => {
    if (notifications.length === 0) return;
    markAll.mutate();
  };

  return (
    <div className="notif-list">
      <div className="notif-header">
        <h3>Thông báo</h3>
        <button className="notif-btn" onClick={handleMarkAll}>Đánh dấu tất cả đã đọc</button>
      </div>
      {notifications.length === 0 ? (
        <div className="notif-empty">Không có thông báo</div>
      ) : notifications.map((n) => (
        <div key={n.id} className={`notif-item ${n.read || n.isRead ? 'read' : 'unread'}`}>
          <div className="notif-title">{n.title || 'Thông báo'}</div>
          <div className="notif-message">{n.message}</div>
          <div className="notif-footer">
            <span>{new Date(n.createdAt || n.created_at || Date.now()).toLocaleString()}</span>
            {!n.read && !n.isRead && (
              <button className="notif-btn" onClick={() => markAsRead.mutate(n.id)}>Đánh dấu đã đọc</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}





