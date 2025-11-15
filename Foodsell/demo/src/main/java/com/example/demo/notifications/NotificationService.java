package com.example.demo.notifications;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

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
    
    // Tạo notification trong transaction riêng để không ảnh hưởng transaction chính
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification createNotificationInNewTransaction(Integer userId, String type, String title, String message) {
        Notification notification = new Notification(userId, type, title, message);
        return notificationRepository.save(notification);
    }

    // Cập nhật notification
    public Notification updateNotification(Integer id, String type, String title, String message, Boolean isRead) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        if (type != null) n.setType(type);
        if (title != null) n.setTitle(title);
        if (message != null) n.setMessage(message);
        if (isRead != null) n.setIsRead(isRead);
        return notificationRepository.save(n);
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

    // Lấy log theo type và/hoặc khoảng thời gian
    public List<Notification> getLogs(String type, LocalDateTime start, LocalDateTime end) {
        if (type != null && start != null && end != null) {
            // filter by time, then by type (hoặc viết query riêng nếu cần hiệu năng)
            return notificationRepository.findByCreatedAtBetween(start, end)
                    .stream().filter(n -> type.equalsIgnoreCase(n.getType())).toList();
        } else if (start != null && end != null) {
            return notificationRepository.findByCreatedAtBetween(start, end);
        } else if (type != null) {
            return notificationRepository.findByTypeOrderByCreatedAtDesc(type);
        }
        // Mặc định: trả về tất cả, mới nhất trước
        return notificationRepository.findAll().stream()
                .sorted((a,b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }
}