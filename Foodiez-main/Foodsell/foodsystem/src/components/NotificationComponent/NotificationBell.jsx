import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMyNotifications } from '../../hooks/useNotifications';
import './Notification.css';

export default function NotificationBell() {
  const { data } = useMyNotifications({ page: 0, size: 10 });
  const notifications = data?.data || data?.notifications || [];
  const unreadCount = useMemo(() => notifications.filter(n => !n.read && !n.isRead).length, [notifications]);

  return (
    <Link to="/notifications" className="notif-bell" title="Thông báo">
      <span className="icon">🔔</span>
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
    </Link>
  );
}





