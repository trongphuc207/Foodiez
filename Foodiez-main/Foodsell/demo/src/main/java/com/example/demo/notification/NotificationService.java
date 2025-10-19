package com.example.demo.notification;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class NotificationService {
    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) { this.repo = repo; }

    // Basic CRUD operations
    public Notification push(Notification n) { return repo.save(n); }
    public List<Notification> listOfUser(Long userId) { return repo.findByUserIdOrderByCreatedAtDesc(userId); }
    public long unreadCount(Long userId) { return repo.countByUserIdAndIsReadFalse(userId); }
    public void markRead(Long id, boolean read) {
        Notification n = repo.findById(id).orElseThrow();
        n.setIsRead(read);
        repo.save(n);
    }
    
    // Admin notification management
    public Notification createNotification(Notification notification) {
        return repo.save(notification);
    }
    
    public Notification updateNotification(Long id, Notification updatedNotification) {
        Notification existing = repo.findById(id).orElseThrow();
        existing.setTitle(updatedNotification.getTitle());
        existing.setMessage(updatedNotification.getMessage());
        existing.setType(updatedNotification.getType());
        existing.setPriority(updatedNotification.getPriority());
        return repo.save(existing);
    }
    
    public void deleteNotification(Long id) {
        repo.deleteById(id);
    }
    
    public List<Notification> getNotificationLog() {
        return repo.findAllOrderByCreatedAtDesc();
    }
    
    // Role-based queries
    public List<Notification> getNotificationsByRole(String userRole) {
        return repo.findByUserRoleOrderByCreatedAtDesc(userRole);
    }
    
    public long getUnreadCountByRole(String userRole) {
        return repo.countByUserRoleAndIsReadFalse(userRole);
    }
    
    // Type-based queries
    public List<Notification> getNotificationsByUserAndType(Long userId, String type) {
        return repo.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type);
    }
    
    public List<Notification> getNotificationsByRoleAndType(String userRole, String type) {
        return repo.findByUserRoleAndTypeOrderByCreatedAtDesc(userRole, type);
    }
    
    // Priority-based queries
    public List<Notification> getHighPriorityNotifications(Long userId) {
        return repo.findByUserIdAndPriorityOrderByCreatedAtDesc(userId, "HIGH");
    }
    
    // Bulk operations
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = repo.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setIsRead(true));
        repo.saveAll(notifications);
    }
    
    public void markAllAsReadByRole(String userRole) {
        List<Notification> notifications = repo.findByUserRoleOrderByCreatedAtDesc(userRole);
        notifications.forEach(n -> n.setIsRead(true));
        repo.saveAll(notifications);
    }
    
    // Notification creation helpers for different use cases
    public Notification createOrderNotification(Long userId, String userRole, String orderStatus, Long orderId) {
        String title = "Cập nhật đơn hàng";
        String message = String.format("Đơn hàng #%d đã được cập nhật: %s", orderId, orderStatus);
        Notification notification = new Notification(userId, userRole, "ORDER_STATUS", title, message);
        notification.setRelatedId(orderId);
        notification.setRelatedType("ORDER");
        notification.setPriority("HIGH");
        return repo.save(notification);
    }
    
    public Notification createPromotionNotification(Long userId, String userRole, String promotionTitle) {
        String title = "Khuyến mãi mới";
        String message = String.format("Bạn có khuyến mãi mới: %s", promotionTitle);
        Notification notification = new Notification(userId, userRole, "PROMOTION", title, message);
        notification.setPriority("NORMAL");
        return repo.save(notification);
    }
    
    public Notification createDeliveryNotification(Long userId, String userRole, String deliveryStatus, Long orderId) {
        String title = "Cập nhật giao hàng";
        String message = String.format("Đơn hàng #%d: %s", orderId, deliveryStatus);
        Notification notification = new Notification(userId, userRole, "DELIVERY", title, message);
        notification.setRelatedId(orderId);
        notification.setRelatedType("ORDER");
        notification.setPriority("HIGH");
        return repo.save(notification);
    }
    
    public Notification createSystemNotification(Long userId, String userRole, String title, String message) {
        Notification notification = new Notification(userId, userRole, "SYSTEM", title, message);
        notification.setPriority("NORMAL");
        return repo.save(notification);
    }
    
    // Helper methods to create notifications for specific roles
    public Notification createOrderNotificationForBuyer(Long buyerId, String orderStatus, Long orderId) {
        return createOrderNotification(buyerId, "buyer", orderStatus, orderId);
    }
    
    public Notification createOrderNotificationForSeller(Long sellerId, String orderStatus, Long orderId) {
        return createOrderNotification(sellerId, "seller", orderStatus, orderId);
    }
    
    public Notification createDeliveryNotificationForShipper(Long shipperId, String deliveryStatus, Long orderId) {
        return createDeliveryNotification(shipperId, "shipper", deliveryStatus, orderId);
    }
    
    public Notification createPromotionNotificationForBuyer(Long buyerId, String promotionTitle) {
        return createPromotionNotification(buyerId, "buyer", promotionTitle);
    }
    
    // Bulk notification methods
    public void createBulkPromotionNotification(String promotionTitle) {
        // This would typically use a UserRepository to get all buyers
        // For now, we'll create a placeholder
        // In real implementation, you would inject UserRepository and query for buyers
        // List<User> buyers = userRepository.findByRole("buyer");
        // List<Notification> notifications = new ArrayList<>();
        // for (User buyer : buyers) {
        //     notifications.add(createPromotionNotification(buyer.getId(), "buyer", promotionTitle));
        // }
        // repo.saveAll(notifications);
    }
}
