package com.example.demo.notifications;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    // Tạo notification mới
    public Notification createNotification(Integer userId, String type, String title, String message) {
        // Validate và normalize type trước khi tạo
        if (type == null || type.trim().isEmpty()) {
            throw new IllegalArgumentException("Notification type cannot be null or empty");
        }
        
        String normalizedType = type.toUpperCase().trim();
        // Database CHECK constraint cho phép: ORDER, PROMOTION, MESSAGE, DELIVERY, SYSTEM
        java.util.Set<String> validTypes = java.util.Set.of("ORDER", "PROMOTION", "MESSAGE", "DELIVERY", "SYSTEM");
        if (!validTypes.contains(normalizedType)) {
            System.out.println("⚠️ createNotification: Invalid type '" + type + "', using SYSTEM instead");
            normalizedType = "SYSTEM";
        }
        
        System.out.println("📢 NotificationService.createNotification: userId=" + userId + 
            ", type=" + normalizedType + ", title=" + title);
        
        try {
            Notification notification = new Notification(userId, normalizedType, title, message);
            Notification saved = notificationRepository.save(notification);
            System.out.println("✅ Notification saved: ID=" + saved.getId());
            return saved;
        } catch (Exception e) {
            System.err.println("❌ Error saving notification: " + e.getMessage());
            System.err.println("❌ Error class: " + e.getClass().getName());
            e.printStackTrace();
            throw new RuntimeException("Failed to create notification: " + e.getMessage(), e);
        }
    }
    
    // Tạo notification trong transaction riêng để không ảnh hưởng transaction chính
    // Sử dụng noRollbackFor để đảm bảo exception không làm rollback transaction chính
    @Transactional(propagation = Propagation.REQUIRES_NEW, noRollbackFor = {Exception.class})
    public Notification createNotificationInNewTransaction(Integer userId, String type, String title, String message) {
        System.out.println("📢 ===== NotificationService.createNotificationInNewTransaction START =====");
        System.out.println("📢 Parameters: userId=" + userId + ", type=" + type + ", title=" + title + ", message=" + message);
        
        // Validate inputs - không throw exception, chỉ log và return null
        if (userId == null) {
            System.err.println("❌ ERROR: userId is null! Cannot create notification.");
            return null;
        }
        if (type == null || type.trim().isEmpty()) {
            System.err.println("❌ ERROR: type is null or empty! Cannot create notification.");
            return null;
        }
        if (title == null || title.trim().isEmpty()) {
            System.err.println("❌ ERROR: title is null or empty! Cannot create notification.");
            return null;
        }
        if (message == null || message.trim().isEmpty()) {
            System.err.println("❌ ERROR: message is null or empty! Cannot create notification.");
            return null;
        }
        
        try {
            // Normalize type trước khi tạo Notification
            // Database CHECK constraint cho phép: ORDER, PROMOTION, MESSAGE, DELIVERY, SYSTEM
            String normalizedType = (type != null) ? type.toUpperCase().trim() : "SYSTEM";
            java.util.Set<String> validTypes = java.util.Set.of("ORDER", "PROMOTION", "MESSAGE", "DELIVERY", "SYSTEM");
            if (!validTypes.contains(normalizedType)) {
                System.out.println("⚠️ createNotificationInNewTransaction: Invalid type '" + type + "' mapped to SYSTEM");
                normalizedType = "SYSTEM";
            }
            
            Notification notification = new Notification(userId, normalizedType, title, message);
            System.out.println("📢 Notification object created successfully");
            System.out.println("📢 Notification details: userId=" + notification.getUserId() + 
                ", type=" + notification.getType() + 
                ", title=" + notification.getTitle() + 
                ", isRead=" + notification.getIsRead());
            
            Notification saved = notificationRepository.save(notification);
            System.out.println("📢 Notification saved to repository: ID=" + saved.getId());
            
            // Flush và clear để đảm bảo notification được ghi vào database ngay lập tức
            entityManager.flush();
            System.out.println("📢 EntityManager flushed");
            
            // Clear persistence context để đảm bảo dữ liệu được commit
            entityManager.clear();
            System.out.println("📢 EntityManager cleared");
            
            // Verify notification đã được lưu bằng cách query lại
            Notification verified = notificationRepository.findById(saved.getId()).orElse(null);
            if (verified != null) {
                System.out.println("📢 ✅ Notification verified in database: ID=" + verified.getId() + 
                    ", UserId=" + verified.getUserId() + 
                    ", Type=" + verified.getType() + 
                    ", Title=" + verified.getTitle() +
                    ", IsRead=" + verified.getIsRead());
            } else {
                System.err.println("❌ ❌ ❌ WARNING: Notification NOT found in database after save! ID=" + saved.getId());
            }
            
            System.out.println("📢 ===== NotificationService.createNotificationInNewTransaction SUCCESS =====");
            return saved; // Return saved notification
        } catch (Exception e) {
            System.err.println("❌ ===== NotificationService.createNotificationInNewTransaction ERROR =====");
            System.err.println("❌ Error: " + e.getMessage());
            System.err.println("❌ Error Class: " + e.getClass().getName());
            e.printStackTrace();
            System.err.println("❌ ===== END ERROR =====");
            // Không throw exception để không ảnh hưởng order creation
            // Return null thay vì throw
            return null;
        }
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
        System.out.println("📢 NotificationService.getNotificationsByUserId called with userId: " + userId);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        System.out.println("📢 Found " + notifications.size() + " notifications for userId: " + userId);
        
        // Log tất cả notifications để debug
        for (int i = 0; i < notifications.size(); i++) {
            Notification n = notifications.get(i);
            System.out.println("📢 Notification " + (i + 1) + ": ID=" + n.getId() + 
                ", Type=" + n.getType() + 
                ", Title=" + n.getTitle() + 
                ", UserId=" + n.getUserId() + 
                ", IsRead=" + n.getIsRead() + 
                ", CreatedAt=" + n.getCreatedAt());
        }
        
        return notifications;
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