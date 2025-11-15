package com.example.demo;

import com.example.demo.config.RoleChecker;
import com.example.demo.dto.OrderDTO;
import com.example.demo.Orders.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerController {
    
    private final OrderService orderService;
    private final RoleChecker roleChecker;

    @Autowired
    public CustomerController(OrderService orderService, RoleChecker roleChecker) {
        this.orderService = orderService;
        this.roleChecker = roleChecker;
    }

    // GET: Dashboard customer (accessible by all authenticated users)
    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getCustomerDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("message", "Customer Dashboard");
        dashboard.put("role", "customer");
        dashboard.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(dashboard);
    }
    
    // GET: Đơn hàng của tôi (accessible by all authenticated users)
    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public List<OrderDTO> getMyOrders() {
        // Lấy user hiện tại và trả về orders của user đó
        var currentUser = roleChecker.getCurrentUser();
        System.out.println("🔍 DEBUG: Current user: " + (currentUser != null ? currentUser.getId() : "null"));
        
        if (currentUser != null) {
            var orders = orderService.getOrdersByBuyerId(currentUser.getId());
            System.out.println("🔍 DEBUG: Found " + orders.size() + " orders for user " + currentUser.getId());
            for (var order : orders) {
                System.out.println("🔍 DEBUG: Order ID: " + order.getId() + ", Status: " + order.getStatus() + ", Total: " + order.getTotalAmount());
            }
            return orders;
        }
        
        System.out.println("🔍 DEBUG: No current user found");
        return List.of();
    }
    
    // GET: Giỏ hàng của tôi
    @GetMapping("/cart")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getMyCart() {
        Map<String, Object> cart = new HashMap<>();
        cart.put("message", "My Cart");
        cart.put("items", List.of());
        cart.put("total", 0);
        
        return ResponseEntity.ok(cart);
    }
    
    // POST: Thêm sản phẩm vào giỏ hàng
    @PostMapping("/cart/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody Map<String, Object> cartItem) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product added to cart");
        response.put("item", cartItem);       
        return ResponseEntity.ok(response);
    }
    
    // GET: Sản phẩm yêu thích
    @GetMapping("/favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getFavorites() {
        Map<String, Object> favorites = new HashMap<>();
        favorites.put("message", "My Favorites");
        favorites.put("items", List.of());
        
        return ResponseEntity.ok(favorites);
    }
    
    // POST: Thêm vào yêu thích
    @PostMapping("/favorites/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> addToFavorites(@RequestBody Map<String, Object> favoriteItem) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product added to favorites");
        response.put("item", favoriteItem);
        
        return ResponseEntity.ok(response);
    }
    
    // GET: Địa chỉ giao hàng
    @GetMapping("/delivery-addresses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getDeliveryAddresses() {
        Map<String, Object> addresses = new HashMap<>();
        addresses.put("message", "My Delivery Addresses");
        addresses.put("addresses", List.of());
        
        return ResponseEntity.ok(addresses);
    }
    
    // POST: Thêm địa chỉ giao hàng
    @PostMapping("/delivery-addresses/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> addDeliveryAddress(@RequestBody Map<String, Object> address) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Delivery address added");
        response.put("address", address);
        
        return ResponseEntity.ok(response);
    }
    
    // PUT: Cập nhật trạng thái đơn hàng (cho PayOS callback)
    @PutMapping("/orders/{orderCode}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable String orderCode,
            @RequestBody Map<String, String> statusUpdate) {
        
        String newStatus = statusUpdate.get("status");
        
        // TODO: Implement actual status update logic
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order status updated to: " + newStatus);
        response.put("orderCode", orderCode);
        
        return ResponseEntity.ok(response);
    }
    
    // GET: Chi tiết đơn hàng
    @GetMapping("/orders/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> getOrderDetails(@PathVariable Integer orderId) {
        var currentUser = roleChecker.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        
        // Lấy order details từ OrderService
        OrderDTO orderDTO = orderService.getOrderById(orderId);
        
        if (orderDTO == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Verify user owns this order
        if (!orderDTO.getBuyerId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(orderDTO);
    }
    
    // POST: Hủy đơn hàng
    @PostMapping("/orders/{orderId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> cancelOrder(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> cancelData) {
        String reason = cancelData.getOrDefault("reason", "Customer cancelled");

        var currentUser = roleChecker.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "User not authenticated"
            ));
        }

        // Ensure the requester owns this order (optional double-check)
        var dto = orderService.getOrderById(orderId);
        if (dto == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Order not found"
            ));
        }
        if (!dto.getBuyerId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "You are not the owner of this order"
            ));
        }

    var result = orderService.cancelOrNotifyForPaid(orderId, currentUser.getId(), reason);
    boolean success = Boolean.TRUE.equals(result.get("success"));
    boolean forwarded = Boolean.TRUE.equals(result.get("forwardedToChat"));
    if (success && !forwarded) {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Order cancelled successfully",
            "orderId", orderId,
            "reason", reason
        ));
    } else if (success && forwarded) {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "forwardedToChat", true,
            "message", "Order cancellation request forwarded to shop chat for manual handling",
            "orderId", orderId,
            "conversationId", result.get("conversationId")
        ));
    } else {
        // Map error codes to 409 for policy rejects, otherwise 500
        String code = result.get("code") == null ? "cancel_not_allowed" : String.valueOf(result.get("code"));
        int status = "internal_error".equals(code) ? 500 : 409;
        return ResponseEntity.status(status).body(Map.of(
            "success", false,
            "code", code,
            "message", result.getOrDefault("message", "Cannot cancel: seller may have accepted or cancel window expired")
        ));
    }
    }
    
    // POST: Đánh giá đơn hàng
    @PostMapping("/orders/{orderId}/review")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> reviewOrder(
            @PathVariable Integer orderId,
            @RequestBody Map<String, Object> reviewData) {
        
        Integer rating = (Integer) reviewData.get("rating");
        String comment = (String) reviewData.get("comment");
        String imageUrl = (String) reviewData.get("imageUrl");
        
        // TODO: Implement actual review logic
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Review submitted successfully");
        response.put("orderId", orderId);
        response.put("rating", rating);
        response.put("comment", comment);
        response.put("imageUrl", imageUrl);
        
        return ResponseEntity.ok(response);
    }
}
