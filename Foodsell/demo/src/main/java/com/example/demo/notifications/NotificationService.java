package com.example.demo.notifications;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    // Tạo notification mới
    public Notification createNotification(Integer userId, String type, String title, String message) {
        Notification notification = new Notification(userId, type, title, message);
        return notificationRepository.save(notification);
    }
    
    // Lấy tất cả notifications của user
    public List<Notification> getNotificationsByUserId(Integer userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    // Lấy notifications chưa đọc của user
    public List<Notification> getUnreadNotificationsByUserId(Integer userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }
    
    // Đếm số notifications chưa đọc
    public long getUnreadCountByUserId(Integer userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    // Đánh dấu notification là đã đọc
    public Notification markNotificationAsRead(Integer notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            throw new RuntimeException("Notification not found with ID: " + notificationId);
        }
        Notification notification = notificationOpt.get();
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }
    
    // Đánh dấu tất cả notifications của user là đã đọc
    public void markAllNotificationsAsRead(Integer userId) {
        List<Notification> unreadNotifications = getUnreadNotificationsByUserId(userId);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }
    
    // Xóa notification
    public void deleteNotification(Integer notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found with ID: " + notificationId);
        }
        notificationRepository.deleteById(notificationId);
    }
    
    // Lấy notification theo ID
    public Optional<Notification> getNotificationById(Integer notificationId) {
        return notificationRepository.findById(notificationId);
    }
    
    // Lấy notifications theo type
    public List<Notification> getNotificationsByType(String type) {
        return notificationRepository.findByTypeOrderByCreatedAtDesc(type);
    }
}
