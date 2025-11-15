package com.example.demo.Orders;

import com.example.demo.dto.OrderDTO;
import com.example.demo.config.RoleChecker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    
    private final OrderService orderService;
    private final RoleChecker roleChecker;

    @Autowired
    public OrderController(OrderService orderService, RoleChecker roleChecker) {
        this.orderService = orderService;
        this.roleChecker = roleChecker;
    }

    // GET: Lấy tất cả đơn hàng (chỉ admin và seller)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public List<OrderDTO> getAllOrders() {
        return orderService.getAllOrders();
    }
    
    // GET: Lấy lịch sử đơn hàng theo order ID
    @GetMapping("/{id}/history")
    @PreAuthorize("isAuthenticated()")
    public List<com.example.demo.Orders.OrderHistory> getOrderHistory(@PathVariable Integer id) {
        return orderService.getOrderHistory(id);
    }

    // POST: Chấp nhận đơn hàng (seller)
    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Map<String, Object>> acceptOrder(@PathVariable Integer id) {
        try {
            var currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "User not authenticated"
                ));
            }

            boolean success = orderService.acceptOrder(id, currentUser.getId());
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order accepted successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Could not accept order"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Internal server error: " + e.getMessage()
            ));
        }
    }
    
    // GET: Test endpoint
    @GetMapping("/test")
    public String test() {
        return "Orders API is working!";
    }
    
    // POST: Create new order (authenticated users)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> orderData) {
        try {
            // Extract order information
            @SuppressWarnings("unchecked")
            Map<String, Object> deliveryInfo = (Map<String, Object>) orderData.get("deliveryInfo");
            @SuppressWarnings("unchecked")
            Map<String, Object> paymentInfo = (Map<String, Object>) orderData.get("paymentInfo");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> cartItems = (List<Map<String, Object>>) orderData.get("cartItems");
            Integer payosOrderCode = (Integer) orderData.get("payosOrderCode");
            Integer totalAmount = (Integer) orderData.get("totalAmount");
            String status = (String) orderData.getOrDefault("status", "pending");
            
            // Get current user ID from authentication
            var currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
            }
            
            
            // Create order using service
            Map<String, Object> result = orderService.createOrder(
                currentUser.getId(), // Pass the actual buyer ID
                deliveryInfo, 
                paymentInfo, 
                cartItems, 
                payosOrderCode, 
                totalAmount, 
                status
            );
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error creating order: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    // GET: Lấy đơn hàng theo buyer ID (authenticated users)
    @GetMapping("/buyer/{buyerId}")
    @PreAuthorize("isAuthenticated()")
    public List<OrderDTO> getOrdersByBuyerId(@PathVariable Integer buyerId) {
        return orderService.getOrdersByBuyerId(buyerId);
    }
    
    // GET: Lấy đơn hàng theo shop ID (seller và admin)
    @GetMapping("/shop/{shopId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public List<OrderDTO> getOrdersByShopId(@PathVariable Integer shopId) {
        return orderService.getOrdersByShopId(shopId);
    }
    
    // POST: Webhook endpoint để xử lý kết quả thanh toán từ PayOS
    @PostMapping("/payment-webhook")
    public ResponseEntity<Map<String, Object>> handlePaymentWebhook(@RequestBody Map<String, Object> webhookData) {
        try {
            // Extract webhook data
            Integer orderCode = (Integer) webhookData.get("orderCode");
            String status = (String) webhookData.get("status");
            Integer amount = (Integer) webhookData.get("amount");
            String transactionId = (String) webhookData.get("transactionId");
            String timestamp = (String) webhookData.get("timestamp");
            
            // Process payment result
            boolean success = orderService.processPaymentResult(orderCode, status, amount, transactionId, timestamp);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment webhook processed successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to process payment webhook"
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Internal server error",
                "error", e.getMessage()
            ));
        }
    }


    // PUT: Cập nhật trạng thái đơn theo PayOS orderCode (buyer)
    @PutMapping("/customer/orders/{orderCode}/status")
    public ResponseEntity<Map<String, Object>> updateStatusByOrderCode(
            @PathVariable Integer orderCode,
            @RequestBody Map<String, String> body) {
        try {
            
            String status = body.getOrDefault("status", "confirmed");
            boolean ok = orderService.updateStatusByPayosOrderCode(orderCode, status);
            
            if (ok) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Status updated"));
            } else {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Order not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Internal server error: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }


}