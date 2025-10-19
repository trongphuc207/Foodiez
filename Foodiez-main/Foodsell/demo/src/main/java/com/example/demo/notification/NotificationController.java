package com.example.demo.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) { this.service = service; }

    // ========== ADMIN NOTIFICATION MANAGEMENT ==========
    
    // Create Notification (Admin)
    @PostMapping("/admin/create")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification saved = service.createNotification(notification);
        return ResponseEntity.created(URI.create("/api/notifications/" + saved.getId())).body(saved);
    }

    // Edit Notification (Admin)
    @PutMapping("/admin/{id}")
    public ResponseEntity<Notification> updateNotification(@PathVariable Long id, @RequestBody Notification notification) {
        Notification updated = service.updateNotification(id, notification);
        return ResponseEntity.ok(updated);
    }

    // Delete Notification (Admin)
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        service.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    // View Notification Log (Admin)
    @GetMapping("/admin/log")
    public List<Notification> getNotificationLog() {
        return service.getNotificationLog();
    }

    // ========== USER NOTIFICATIONS ==========
    
    // Get notifications by user ID
    @GetMapping("/user/{userId}")
    public List<Notification> byUser(@PathVariable Long userId) {
        return service.listOfUser(userId);
    }

    // Get unread count by user ID
    @GetMapping("/user/{userId}/unread-count")
    public long unread(@PathVariable Long userId) {
        return service.unreadCount(userId);
    }

    // Get notifications by user role
    @GetMapping("/role/{userRole}")
    public List<Notification> byRole(@PathVariable String userRole) {
        return service.getNotificationsByRole(userRole);
    }

    // Get unread count by user role
    @GetMapping("/role/{userRole}/unread-count")
    public long unreadByRole(@PathVariable String userRole) {
        return service.getUnreadCountByRole(userRole);
    }

    // Get notifications by user and type
    @GetMapping("/user/{userId}/type/{type}")
    public List<Notification> byUserAndType(@PathVariable Long userId, @PathVariable String type) {
        return service.getNotificationsByUserAndType(userId, type);
    }

    // Get notifications by role and type
    @GetMapping("/role/{userRole}/type/{type}")
    public List<Notification> byRoleAndType(@PathVariable String userRole, @PathVariable String type) {
        return service.getNotificationsByRoleAndType(userRole, type);
    }

    // ========== NOTIFICATION ACTIONS ==========
    
    // Mark notification as read/unread
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> mark(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean read) {
        service.markRead(id, read);
        return ResponseEntity.noContent().build();
    }

    // Mark all notifications as read for user
    @PatchMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        service.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    // Mark all notifications as read for role
    @PatchMapping("/role/{userRole}/mark-all-read")
    public ResponseEntity<Void> markAllAsReadByRole(@PathVariable String userRole) {
        service.markAllAsReadByRole(userRole);
        return ResponseEntity.noContent().build();
    }

    // ========== NOTIFICATION CREATION HELPERS ==========
    
    // Create order notification
    @PostMapping("/order")
    public ResponseEntity<Notification> createOrderNotification(
            @RequestParam Long userId,
            @RequestParam String userRole,
            @RequestParam String orderStatus,
            @RequestParam Long orderId) {
        Notification notification = service.createOrderNotification(userId, userRole, orderStatus, orderId);
        return ResponseEntity.created(URI.create("/api/notifications/" + notification.getId())).body(notification);
    }

    // Create promotion notification
    @PostMapping("/promotion")
    public ResponseEntity<Notification> createPromotionNotification(
            @RequestParam Long userId,
            @RequestParam String userRole,
            @RequestParam String promotionTitle) {
        Notification notification = service.createPromotionNotification(userId, userRole, promotionTitle);
        return ResponseEntity.created(URI.create("/api/notifications/" + notification.getId())).body(notification);
    }

    // Create delivery notification
    @PostMapping("/delivery")
    public ResponseEntity<Notification> createDeliveryNotification(
            @RequestParam Long userId,
            @RequestParam String userRole,
            @RequestParam String deliveryStatus,
            @RequestParam Long orderId) {
        Notification notification = service.createDeliveryNotification(userId, userRole, deliveryStatus, orderId);
        return ResponseEntity.created(URI.create("/api/notifications/" + notification.getId())).body(notification);
    }

    // Create system notification
    @PostMapping("/system")
    public ResponseEntity<Notification> createSystemNotification(
            @RequestParam Long userId,
            @RequestParam String userRole,
            @RequestParam String title,
            @RequestParam String message) {
        Notification notification = service.createSystemNotification(userId, userRole, title, message);
        return ResponseEntity.created(URI.create("/api/notifications/" + notification.getId())).body(notification);
    }

    // ========== LEGACY SUPPORT ==========
    
    // Legacy endpoint for backward compatibility
    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody Notification n) {
        Notification saved = service.push(n);
        return ResponseEntity.created(URI.create("/api/notifications/" + saved.getId())).body(saved);
    }
}
