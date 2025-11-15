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
import java.util.HashMap;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private RoleChecker roleChecker;
    
    @Autowired
    private com.example.demo.Users.UserRepository userRepository;
    
    // ===== USER NOTIFICATIONS =====
    
    // Lấy tất cả notifications của user hiện tại
    @GetMapping("/my-notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications() {
        try {
            User currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                System.err.println("❌ getMyNotifications: User not authenticated");
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập để xem thông báo"));
            }
            
            Integer userId = currentUser.getId();
            System.out.println("📢 ===== GET MY NOTIFICATIONS =====");
            System.out.println("📢 Current User ID: " + userId);
            System.out.println("📢 Current User Email: " + currentUser.getEmail());
            
            List<Notification> notifications = notificationService.getNotificationsByUserId(userId);
            
            System.out.println("📢 Found " + notifications.size() + " notifications for user " + userId);
            if (notifications.size() > 0) {
                System.out.println("📢 First notification: ID=" + notifications.get(0).getId() + 
                    ", Type=" + notifications.get(0).getType() + 
                    ", Title=" + notifications.get(0).getTitle() +
                    ", UserId=" + notifications.get(0).getUserId() +
                    ", IsRead=" + notifications.get(0).getIsRead());
            }
            System.out.println("📢 ===== END GET MY NOTIFICATIONS =====");
            
            return ResponseEntity.ok(ApiResponse.success(notifications, "Lấy danh sách thông báo thành công!"));
        } catch (Exception e) {
            System.err.println("❌ Error in getMyNotifications: " + e.getMessage());
            e.printStackTrace();
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
    
    // Debug endpoint: Kiểm tra notification có được tạo không
    @GetMapping("/debug/recent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRecentNotificationsDebug() {
        try {
            User currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("User not authenticated"));
            }
            
            Integer userId = currentUser.getId();
            List<Notification> allNotifications = notificationService.getNotificationsByUserId(userId);
            List<Notification> orderNotifications = allNotifications.stream()
                .filter(n -> "ORDER".equals(n.getType()))
                .collect(java.util.stream.Collectors.toList());
            
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("userId", userId);
            debugInfo.put("totalNotifications", allNotifications.size());
            debugInfo.put("orderNotifications", orderNotifications.size());
            debugInfo.put("recentOrderNotifications", orderNotifications.stream()
                .limit(5)
                .map(n -> Map.of(
                    "id", n.getId(),
                    "type", n.getType(),
                    "title", n.getTitle(),
                    "message", n.getMessage(),
                    "createdAt", n.getCreatedAt().toString()
                ))
                .collect(java.util.stream.Collectors.toList()));
            
            return ResponseEntity.ok(ApiResponse.success(debugInfo, "Debug info retrieved"));
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
                System.err.println("❌ getUnreadCount: User not authenticated");
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập"));
            }
            Integer userId = currentUser.getId();
            long count = notificationService.getUnreadCountByUserId(userId);
            System.out.println("📢 Unread count for user " + userId + ": " + count);
            return ResponseEntity.ok(ApiResponse.success(count, "Lấy số thông báo chưa đọc thành công!"));
        } catch (Exception e) {
            System.err.println("❌ Error in getUnreadCount: " + e.getMessage());
            e.printStackTrace();
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
        System.out.println("📢 ===== CREATE NOTIFICATION (ADMIN) =====");
        System.out.println("📢 Request body: " + request);
        
        try {
            // Xử lý userId - có thể là Integer hoặc String từ JSON
            Integer userId = null;
            Object userIdObj = request.get("userId");
            System.out.println("📢 userIdObj type: " + (userIdObj != null ? userIdObj.getClass().getName() : "null") + ", value: " + userIdObj);
            
            if (userIdObj != null) {
                if (userIdObj instanceof Integer) {
                    userId = (Integer) userIdObj;
                } else if (userIdObj instanceof String) {
                    try {
                        userId = Integer.parseInt((String) userIdObj);
                    } catch (NumberFormatException e) {
                        System.err.println("❌ Invalid userId format (String): " + userIdObj);
                        return ResponseEntity.badRequest().body(ApiResponse.error("User ID không hợp lệ: " + userIdObj));
                    }
                } else if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).intValue();
                } else {
                    System.err.println("❌ Invalid userId type: " + userIdObj.getClass().getName());
                    return ResponseEntity.badRequest().body(ApiResponse.error("User ID không hợp lệ: " + userIdObj));
                }
            }
            
            System.out.println("📢 Parsed userId: " + userId);
            
            if (userId == null) {
                System.err.println("❌ userId is null");
                return ResponseEntity.badRequest().body(ApiResponse.error("User ID không được để trống"));
            }
            
            String type = (String) request.get("type");
            String title = (String) request.get("title");
            String message = (String) request.get("message");
            
            System.out.println("📢 Raw Type: " + type + ", Title: " + title + ", Message: " + message);
            
            // Validate các trường bắt buộc
            if (type == null || type.trim().isEmpty()) {
                System.err.println("❌ Type is null or empty");
                return ResponseEntity.badRequest().body(ApiResponse.error("Loại thông báo không được để trống"));
            }
            if (title == null || title.trim().isEmpty()) {
                System.err.println("❌ Title is null or empty");
                return ResponseEntity.badRequest().body(ApiResponse.error("Tiêu đề không được để trống"));
            }
            if (message == null || message.trim().isEmpty()) {
                System.err.println("❌ Message is null or empty");
                return ResponseEntity.badRequest().body(ApiResponse.error("Nội dung không được để trống"));
            }
            
            // Normalize type để phù hợp với database constraint
            // Database CHECK constraint cho phép: ORDER, PROMOTION, MESSAGE, DELIVERY, SYSTEM
            String normalizedType = type.toUpperCase().trim();
            
            // Danh sách các type hợp lệ theo database constraint
            java.util.Set<String> validTypes = java.util.Set.of("ORDER", "PROMOTION", "MESSAGE", "DELIVERY", "SYSTEM");
            
            if (!validTypes.contains(normalizedType)) {
                System.out.println("⚠️ Type '" + type + "' không hợp lệ, chuyển thành SYSTEM");
                normalizedType = "SYSTEM";
            }
            
            System.out.println("📢 Normalized Type: " + normalizedType + " (from original: " + type + ")");
            
            // Kiểm tra user có tồn tại không
            if (userRepository != null) {
                System.out.println("📢 Checking if user exists: " + userId);
                java.util.Optional<com.example.demo.Users.User> userOpt = userRepository.findById(userId);
                if (userOpt.isEmpty()) {
                    System.err.println("❌ User not found with ID: " + userId);
                    return ResponseEntity.badRequest().body(ApiResponse.error("Không tìm thấy user với ID: " + userId));
                }
                System.out.println("✅ User found: " + userOpt.get().getEmail());
            } else {
                System.out.println("⚠️ userRepository is null, skipping user validation");
            }
            
            System.out.println("📢 Creating notification...");
            Notification notification = notificationService.createNotification(userId, normalizedType, title, message);
            System.out.println("✅ Notification created successfully: ID=" + notification.getId() + ", UserId=" + notification.getUserId());
            System.out.println("📢 ===== CREATE NOTIFICATION SUCCESS =====");
            return ResponseEntity.ok(ApiResponse.success(notification, "Tạo thông báo thành công!"));
        } catch (Exception e) {
            System.err.println("❌ ===== CREATE NOTIFICATION ERROR =====");
            System.err.println("❌ Error creating notification: " + e.getMessage());
            System.err.println("❌ Error class: " + e.getClass().getName());
            e.printStackTrace();
            System.err.println("❌ ===== END ERROR =====");
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi khi tạo thông báo: " + e.getMessage()));
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

    // Tạo customer message notification cho merchant
    @PostMapping("/system/customer-message")
    public ResponseEntity<ApiResponse<Notification>> createCustomerMessageNotification(@RequestBody Map<String, Object> request) {
        try {
            Integer merchantId = (Integer) request.get("merchantId");
            Integer customerId = (Integer) request.get("customerId");
            String msg = (String) request.get("message");
            String title = "Tin nhắn từ khách hàng";
            String message = "Khách #" + customerId + ": " + (msg != null ? msg : "Bạn có tin nhắn mới");
            Notification notification = notificationService.createNotification(merchantId, "MESSAGE", title, message);
            return ResponseEntity.ok(ApiResponse.success(notification, "Tạo customer message notification thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Tạo order status notification cho customer
    @PostMapping("/system/order-status")
    public ResponseEntity<ApiResponse<Notification>> createOrderStatusNotification(@RequestBody Map<String, Object> request) {
        try {
            Integer customerId = (Integer) request.get("customerId");
            Integer orderId = (Integer) request.get("orderId");
            String status = (String) request.get("status");
            String title = "Cập nhật trạng thái đơn hàng";
            String message = "Đơn hàng #" + orderId + " đã chuyển sang trạng thái: " + status;
            Notification notification = notificationService.createNotification(customerId, "ORDER", title, message);
            return ResponseEntity.ok(ApiResponse.success(notification, "Tạo order status notification thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Tạo delivery assignment notification cho shipper
    @PostMapping("/system/delivery-assignment")
    public ResponseEntity<ApiResponse<Notification>> createDeliveryAssignment(@RequestBody Map<String, Object> request) {
        try {
            Integer shipperId = (Integer) request.get("shipperId");
            Integer orderId = (Integer) request.get("orderId");
            String title = "Đơn giao hàng mới";
            String message = "Bạn được phân công đơn #" + orderId;
            Notification notification = notificationService.createNotification(shipperId, "DELIVERY", title, message);
            return ResponseEntity.ok(ApiResponse.success(notification, "Tạo delivery assignment notification thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Tạo delivery update notification cho shipper
    @PostMapping("/system/delivery-update")
    public ResponseEntity<ApiResponse<Notification>> createDeliveryUpdate(@RequestBody Map<String, Object> request) {
        try {
            Integer shipperId = (Integer) request.get("shipperId");
            Integer orderId = (Integer) request.get("orderId");
            String update = (String) request.get("update");
            String title = "Cập nhật giao hàng";
            String message = "Đơn #" + orderId + ": " + (update != null ? update : "Có cập nhật mới");
            Notification notification = notificationService.createNotification(shipperId, "DELIVERY", title, message);
            return ResponseEntity.ok(ApiResponse.success(notification, "Tạo delivery update notification thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Xem log thông báo (Admin only)
    @GetMapping("/admin/log")
    @PreAuthorize("hasAnyRole('ADMIN', 'admin')")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotificationLog(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "start", required = false) String start,
            @RequestParam(value = "end", required = false) String end) {
        try {
            LocalDateTime s = null, e = null;
            DateTimeFormatter fmt = DateTimeFormatter.ISO_DATE_TIME;
            if (start != null && !start.isBlank()) s = LocalDateTime.parse(start, fmt);
            if (end != null && !end.isBlank()) e = LocalDateTime.parse(end, fmt);
            var list = notificationService.getLogs(type, s, e);
            return ResponseEntity.ok(ApiResponse.success(list, "Lấy log thông báo thành công!"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }
}
