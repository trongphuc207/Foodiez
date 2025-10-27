package com.example.demo.notifications;

import com.example.demo.config.RoleChecker;
import com.example.demo.dto.ApiResponse;
import com.example.demo.Users.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private RoleChecker roleChecker;
    
    // ===== USER NOTIFICATIONS =====
    
    // Lấy tất cả notifications của user hiện tại
    @GetMapping("/my-notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications() {
        try {
            User currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập để xem thông báo"));
            }
            List<Notification> notifications = notificationService.getNotificationsByUserId(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success(notifications, "Lấy danh sách thông báo thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Lấy notifications chưa đọc
    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyUnreadNotifications() {
        try {
            User currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập để xem thông báo chưa đọc"));
            }
            List<Notification> notifications = notificationService.getUnreadNotificationsByUserId(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success(notifications, "Lấy danh sách thông báo chưa đọc thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Đếm số notifications chưa đọc
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        try {
            User currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập"));
            }
            long count = notificationService.getUnreadCountByUserId(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success(count, "Lấy số thông báo chưa đọc thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Đánh dấu notification là đã đọc
    @PutMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable Integer notificationId) {
        try {
            User currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập"));
            }
            Notification notification = notificationService.markNotificationAsRead(notificationId);
            return ResponseEntity.ok(ApiResponse.success(notification, "Đánh dấu thông báo đã đọc thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Đánh dấu tất cả notifications là đã đọc
    @PutMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> markAllAsRead() {
        try {
            User currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập"));
            }
            notificationService.markAllNotificationsAsRead(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Đánh dấu tất cả thông báo đã đọc thành công!", "Đánh dấu tất cả thông báo đã đọc thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ===== ADMIN ENDPOINTS =====
    
    // Tạo notification mới (Admin only)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'admin')")
    public ResponseEntity<ApiResponse<Notification>> createNotification(@RequestBody Map<String, Object> request) {
        try {
            Integer userId = (Integer) request.get("userId");
            String type = (String) request.get("type");
            String title = (String) request.get("title");
            String message = (String) request.get("message");
            
            Notification notification = notificationService.createNotification(userId, type, title, message);
            return ResponseEntity.ok(ApiResponse.success(notification, "Tạo thông báo thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Xóa notification (Admin only)
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'admin')")
    public ResponseEntity<ApiResponse<String>> deleteNotification(@PathVariable Integer notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok(ApiResponse.success("Xóa thông báo thành công!", "Xóa thông báo thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ===== SYSTEM ENDPOINTS (Internal use) =====
    
    // Tạo order notification cho merchant
    @PostMapping("/system/order")
    public ResponseEntity<ApiResponse<Notification>> createOrderNotification(@RequestBody Map<String, Object> request) {
        try {
            Integer merchantId = (Integer) request.get("merchantId");
            Integer orderId = (Integer) request.get("orderId");
            String action = (String) request.get("action");
            
            String title = "Đơn hàng mới";
            String message = "Bạn có đơn hàng mới #" + orderId;
            if ("CANCELLED".equals(action)) {
                title = "Đơn hàng bị hủy";
                message = "Đơn hàng #" + orderId + " đã bị hủy";
            }
            
            Notification notification = notificationService.createNotification(merchantId, "ORDER", title, message);
            return ResponseEntity.ok(ApiResponse.success(notification, "Tạo order notification thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Tạo promotion notification cho customer
    @PostMapping("/system/promotion")
    public ResponseEntity<ApiResponse<Notification>> createPromotionNotification(@RequestBody Map<String, Object> request) {
        try {
            Integer customerId = (Integer) request.get("customerId");
            String promotionTitle = (String) request.get("promotionTitle");
            Integer shopId = (Integer) request.get("shopId");
            
            String title = "Khuyến mãi mới!";
            String message = promotionTitle + " - Shop #" + shopId;
            
            Notification notification = notificationService.createNotification(customerId, "PROMOTION", title, message);
            return ResponseEntity.ok(ApiResponse.success(notification, "Tạo promotion notification thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}