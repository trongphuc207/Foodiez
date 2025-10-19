import React, { useState } from 'react';
import './Notification.css';
import { useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';

export default function NotificationList({ 
  notifications = [], 
  userId, 
  userRole, 
  showFilters = false,
  showPriority = false 
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  
  const markAsRead = useMarkAsRead();
  const markAll = useMarkAllAsRead(userId);

  const handleMarkAll = () => {
    if (notifications.length === 0) return;
    markAll.mutate();
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead.mutate(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_STATUS':
        return '📦';
      case 'PROMOTION':
        return '🎉';
      case 'DELIVERY':
        return '🚚';
      case 'SYSTEM':
        return '🔔';
      case 'REVIEW':
        return '⭐';
      default:
        return '📢';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'priority-urgent';
      case 'HIGH':
        return 'priority-high';
      case 'NORMAL':
        return 'priority-normal';
      case 'LOW':
        return 'priority-low';
      default:
        return 'priority-normal';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = filterType === 'ALL' || notification.type === filterType;
    const priorityMatch = filterPriority === 'ALL' || notification.priority === filterPriority;
    return typeMatch && priorityMatch;
  });

  const notificationTypes = [...new Set(notifications.map(n => n.type))];
  const notificationPriorities = [...new Set(notifications.map(n => n.priority))];

  return (
    <div className="notif-list">
      <div className="notif-header">
        <h3>Thông báo</h3>
        <div className="notif-actions">
          {showFilters && (
            <div className="notif-filters">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="notif-filter"
              >
                <option value="ALL">Tất cả loại</option>
                {notificationTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'ORDER_STATUS' ? 'Đơn hàng' :
                     type === 'PROMOTION' ? 'Khuyến mãi' :
                     type === 'DELIVERY' ? 'Giao hàng' :
                     type === 'SYSTEM' ? 'Hệ thống' :
                     type === 'REVIEW' ? 'Đánh giá' : type}
                  </option>
                ))}
              </select>
              {showPriority && (
                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="notif-filter"
                >
                  <option value="ALL">Tất cả mức độ</option>
                  {notificationPriorities.map(priority => (
                    <option key={priority} value={priority}>
                      {priority === 'URGENT' ? 'Khẩn cấp' :
                       priority === 'HIGH' ? 'Cao' :
                       priority === 'NORMAL' ? 'Bình thường' :
                       priority === 'LOW' ? 'Thấp' : priority}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          <button className="notif-btn" onClick={handleMarkAll}>
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>
      
      {filteredNotifications.length === 0 ? (
        <div className="notif-empty">
          {notifications.length === 0 ? 'Không có thông báo' : 'Không có thông báo phù hợp với bộ lọc'}
        </div>
      ) : (
        <div className="notif-items">
          {filteredNotifications.map((n) => (
            <div 
              key={n.id} 
              className={`notif-item ${n.read || n.isRead ? 'read' : 'unread'} ${getPriorityClass(n.priority)}`}
            >
              <div className="notif-icon">
                {getNotificationIcon(n.type)}
              </div>
              <div className="notif-content">
                <div className="notif-title">
                  {n.title || 'Thông báo'}
                  {showPriority && n.priority === 'URGENT' && (
                    <span className="priority-badge urgent">Khẩn cấp</span>
                  )}
                  {showPriority && n.priority === 'HIGH' && (
                    <span className="priority-badge high">Quan trọng</span>
                  )}
                </div>
                <div className="notif-message">{n.message}</div>
                <div className="notif-meta">
                  <span className="notif-type">
                    {n.type === 'ORDER_STATUS' ? 'Đơn hàng' :
                     n.type === 'PROMOTION' ? 'Khuyến mãi' :
                     n.type === 'DELIVERY' ? 'Giao hàng' :
                     n.type === 'SYSTEM' ? 'Hệ thống' :
                     n.type === 'REVIEW' ? 'Đánh giá' : n.type}
                  </span>
                  <span className="notif-time">
                    {new Date(n.createdAt || n.created_at || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="notif-actions">
                {!n.read && !n.isRead && (
                  <button 
                    className="notif-btn small" 
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}








