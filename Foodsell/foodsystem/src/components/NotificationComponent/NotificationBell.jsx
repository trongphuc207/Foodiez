import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../../api/notification';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadUnreadCount = async () => {
    try {
      console.log('📢 Loading unread count...');
      const res = await notificationAPI.getUnreadCount();
      console.log('📢 Unread count response:', res);
      if (res?.success) {
        console.log('📢 Setting unread count to:', res.data);
        setUnreadCount(res.data);
      } else {
        console.warn('📢 Unread count response not successful:', res);
      }
    } catch (e) { 
      console.error('📢 Unread count error:', e); 
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('📢 Loading notifications...');
      const res = await notificationAPI.getMyNotifications();
      console.log('📢 Notifications response:', res);
      if (res?.success) {
        const notifications = (res.data || []).slice(0, 10);
        console.log('📢 Setting notifications to:', notifications.length, 'items');
        setNotifications(notifications);
      } else {
        console.warn('📢 Notifications response not successful:', res);
        setNotifications([]);
      }
    } catch (e) {
      console.error('📢 Notifications load error:', e);
      setNotifications([]);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    // Chỉ load khi component mount lần đầu, không load lại khi showDropdown thay đổi
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
  }, []); // Chỉ chạy một lần khi mount

  // Lắng nghe event khi có đơn hàng mới được tạo (tách riêng để tránh dependency loop)
  useEffect(() => {
    const handleOrderCreated = async () => {
      console.log('📢 Order created event received, starting notification load...');
      
      // Retry logic để đảm bảo notification được load
      let retryCount = 0;
      const maxRetries = 5; // Giảm số lần retry để tăng tốc
      const retryDelay = 300; // Giảm delay giữa mỗi lần retry
      
      const tryLoadNotification = async () => {
        try {
          // Load cả unread count và notifications
          const countRes = await notificationAPI.getUnreadCount();
          const notifRes = await notificationAPI.getMyNotifications();
          
          console.log('📢 Loading notifications - retry:', retryCount);
          console.log('📢 Unread count response:', JSON.stringify(countRes));
          console.log('📢 Notifications response:', JSON.stringify(notifRes));
          
          const newUnreadCount = countRes?.success ? (countRes.data || 0) : 0;
          const newNotifications = notifRes?.success ? (notifRes.data || []).slice(0, 10) : [];
          
          console.log('📢 Parsed unread count:', newUnreadCount);
          console.log('📢 Parsed notifications count:', newNotifications.length);
          
          // Log tất cả notifications để debug
          if (newNotifications.length > 0) {
            console.log('📢 All notifications:');
            newNotifications.forEach((notif, index) => {
              console.log(`📢 Notification ${index + 1}:`, {
                id: notif.id,
                type: notif.type,
                title: notif.title,
                message: notif.message,
                userId: notif.userId,
                isRead: notif.isRead,
                createdAt: notif.createdAt
              });
            });
          } else {
            console.log('📢 ⚠️ No notifications in response array');
            // Kiểm tra xem có phải response có data nhưng là empty array không
            if (notifRes?.success && Array.isArray(notifRes.data)) {
              console.log('📢 Response has success=true and data is array, but length is 0');
            }
          }
          
          console.log('📢 First notification:', newNotifications[0] ? JSON.stringify(newNotifications[0]) : 'none');
          
          // Cập nhật state ngay lập tức - sử dụng functional update để tránh race condition
          setUnreadCount(prev => {
            console.log('📢 Setting unread count from', prev, 'to', newUnreadCount);
            return newUnreadCount;
          });
          
          setNotifications(prev => {
            console.log('📢 Setting notifications from', prev.length, 'to', newNotifications.length);
            console.log('📢 Previous notifications:', prev);
            console.log('📢 New notifications:', newNotifications);
            return newNotifications;
          });
          
          // Kiểm tra ngay lập tức không cần đợi
          // Kiểm tra xem đã có notification ORDER mới chưa
          const hasOrderNotification = newNotifications.some(n => 
            n.type === 'ORDER' && 
            n.title && n.title.includes('Đặt hàng thành công')
          );
          
          // Kiểm tra xem đã có notification chưa (kiểm tra cả unread count và notifications)
          const hasNotifications = newUnreadCount > 0 || newNotifications.length > 0;
          
          console.log('📢 hasOrderNotification:', hasOrderNotification);
          console.log('📢 hasNotifications:', hasNotifications);
          console.log('📢 newUnreadCount:', newUnreadCount);
          console.log('📢 newNotifications.length:', newNotifications.length);
          console.log('📢 All notification types:', newNotifications.map(n => n.type));
          console.log('📢 All notification titles:', newNotifications.map(n => n.title));
          
          if (hasOrderNotification) {
            console.log('📢 ✅ Order notification found! Opening dropdown...');
            // Tự động mở dropdown để hiển thị notification
            setShowDropdown(true);
          } else if (hasNotifications) {
            console.log('📢 ✅ Some notifications found, but no order notification. Opening dropdown anyway...');
            setShowDropdown(true);
          } else if (retryCount < maxRetries) {
            retryCount++;
            console.log('📢 ⏳ No notifications yet, retrying... (' + retryCount + '/' + maxRetries + ')');
            setTimeout(tryLoadNotification, retryDelay);
          } else {
            console.log('📢 ⚠️ No notifications found after all retries. Opening dropdown anyway...');
            // Vẫn mở dropdown để user có thể kiểm tra
            setShowDropdown(true);
          }
        } catch (error) {
          console.error('📢 ❌ Error loading notifications:', error);
          // Vẫn mở dropdown để user biết có lỗi
          if (retryCount < maxRetries) {
            retryCount++;
            console.log('📢 ⏳ Retrying after error... (' + retryCount + '/' + maxRetries + ')');
            setTimeout(tryLoadNotification, retryDelay);
          } else {
            console.log('📢 ⚠️ Max retries reached. Opening dropdown anyway...');
            setShowDropdown(true);
          }
        }
      };
      
      // Bắt đầu với delay ban đầu để backend có thời gian tạo notification
      // Giảm delay xuống 1 giây để tăng tốc - notification đã được flush ngay
      console.log('📢 Starting notification load after 1 second...');
      setTimeout(tryLoadNotification, 1000);
    };
    
    window.addEventListener('orderCreated', handleOrderCreated);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated);
    };
  }, []); // Chỉ chạy một lần khi mount

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