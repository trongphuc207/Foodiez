import React, { useState } from 'react';
import { useMyNotifications, useUnreadCount } from '../../hooks/useNotifications';
import NotificationList from '../../components/NotificationComponent/NotificationList';
import { useAuth } from '../../hooks/useAuth';
import './NotificationPage.css';

export default function NotificationPage() {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  
  const { data, isLoading, error } = useMyNotifications({ page: 0, size: 50 });
  const { data: unreadCount } = useUnreadCount(user?.id);
  
  const notifications = data?.data || data?.notifications || [];

  if (isLoading) return <div className="notif-page">Đang tải...</div>;
  if (error) return <div className="notif-page">Lỗi tải thông báo</div>;

  const unreadNotifications = notifications.filter(n => !n.isRead && !n.read);
  const hasUnreadNotifications = unreadNotifications.length > 0;

  return (
    <div className="notif-page">
      <div className="notif-page-header">
        <div className="notif-page-title">
          <h1>Thông báo của tôi</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">
              {unreadCount} thông báo chưa đọc
            </span>
          )}
        </div>
        
        <div className="notif-page-controls">
          <button 
            className={`notif-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </button>
          
          <button 
            className={`notif-btn ${showPriority ? 'active' : ''}`}
            onClick={() => setShowPriority(!showPriority)}
          >
            {showPriority ? 'Ẩn mức độ' : 'Hiện mức độ'}
          </button>
        </div>
      </div>

      <div className="notif-page-stats">
        <div className="stat-item">
          <span className="stat-number">{notifications.length}</span>
          <span className="stat-label">Tổng thông báo</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{unreadNotifications.length}</span>
          <span className="stat-label">Chưa đọc</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{notifications.length - unreadNotifications.length}</span>
          <span className="stat-label">Đã đọc</span>
        </div>
      </div>

      <NotificationList 
        notifications={notifications}
        userId={user?.id}
        userRole={user?.role}
        showFilters={showFilters}
        showPriority={showPriority}
      />
    </div>
  );
}








