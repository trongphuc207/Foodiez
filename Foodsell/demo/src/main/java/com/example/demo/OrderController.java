package com.example.demo;

import com.example.demo.dto.OrderDTO;
import com.example.demo.Orders.OrderService;
import com.example.demo.Orders.OrderHistory;
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
    public List<OrderHistory> getOrderHistory(@PathVariable Integer id) {
        return orderService.getOrderHistory(id);
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
            System.out.println("Creating order with data: " + orderData);
            
            // Extract order information
            Map<String, Object> deliveryInfo = (Map<String, Object>) orderData.get("deliveryInfo");
            Map<String, Object> paymentInfo = (Map<String, Object>) orderData.get("paymentInfo");
            List<Map<String, Object>> cartItems = (List<Map<String, Object>>) orderData.get("cartItems");
            Integer payosOrderCode = (Integer) orderData.get("payosOrderCode");
            Integer totalAmount = (Integer) orderData.get("totalAmount");
            String status = (String) orderData.getOrDefault("status", "pending");
            
            // Create order using service
            Map<String, Object> result = orderService.createOrder(
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
            System.err.println("Error creating order: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error creating order: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    // POST: Create test order data
    @PostMapping("/create-test-data")
    public String createTestData() {
        try {
            orderService.createTestData();
            return "Test data created successfully!";
        } catch (Exception e) {
            return "Error creating test data: " + e.getMessage();
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
            System.out.println("Received PayOS webhook: " + webhookData);
            
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
            System.err.println("Error processing payment webhook: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Internal server error",
                "error", e.getMessage()
            ));
        }
    }
}