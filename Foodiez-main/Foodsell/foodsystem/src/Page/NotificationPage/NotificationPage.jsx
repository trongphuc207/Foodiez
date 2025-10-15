import React from 'react';
import { useMyNotifications } from '../../hooks/useNotifications';
import NotificationList from '../../components/NotificationComponent/NotificationList';
import './NotificationPage.css';

export default function NotificationPage() {
  const { data, isLoading, error } = useMyNotifications({ page: 0, size: 20 });
  const notifications = data?.data || data?.notifications || [];

  if (isLoading) return <div className="notif-page">Đang tải...</div>;
  if (error) return <div className="notif-page">Lỗi tải thông báo</div>;

  return (
    <div className="notif-page">
      <NotificationList notifications={notifications} />
    </div>
  );
}





