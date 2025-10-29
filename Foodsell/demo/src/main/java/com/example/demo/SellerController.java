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
import com.example.demo.ApiResponse;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "http://localhost:3000")
public class SellerController {
    
    private final OrderService orderService;
    private final RoleChecker roleChecker;

    @Autowired
    public SellerController(OrderService orderService, RoleChecker roleChecker) {
        this.orderService = orderService;
        this.roleChecker = roleChecker;
    }

    // GET: Lấy đơn hàng của seller
    @GetMapping("/orders")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> getSellerOrders(@RequestParam(required = false) Integer shopId) {
        try {
            List<OrderDTO> orders;
            if (shopId != null) {
                orders = orderService.getOrdersByShopId(shopId);
            } else {
                orders = orderService.getAllOrders();
            }
            return ResponseEntity.ok(new ApiResponse(true, "Orders fetched successfully", orders));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse(false, "Failed to fetch orders: " + e.getMessage()));
        }
    }

    // PUT: Cập nhật trạng thái đơn hàng
    @PutMapping("/orders/{orderId}/status")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            if (newStatus == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Status is required"));
            }
            OrderDTO updatedOrder = orderService.updateOrderStatus(orderId, newStatus);
            return ResponseEntity.ok(new ApiResponse(true, "Order status updated successfully", updatedOrder));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse(false, "Failed to update order status: " + e.getMessage()));
        }
    }

    // GET: Lấy chi tiết một đơn hàng
    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> getOrderDetails(@PathVariable Integer orderId) {
        try {
            OrderDTO order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(new ApiResponse(true, "Order details fetched successfully", order));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse(false, "Failed to fetch order details: " + e.getMessage()));
        }
    }
    
    // GET: Dashboard thống kê seller
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSellerDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("message", "Seller Dashboard");
        dashboard.put("role", "seller");
        dashboard.put("timestamp", System.currentTimeMillis());
        
        // Seller có thể mua hàng từ shop khác
        dashboard.put("canShopAsCustomer", true);
        dashboard.put("note", "As a seller, you can also shop from other stores");
        
        return ResponseEntity.ok(dashboard);
    }
    
    // POST: Cập nhật trạng thái đơn hàng theo yêu cầu đặc biệt
    @PostMapping("/orders/{orderId}/status/special")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateOrderStatusSpecial(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> statusUpdate) {
        
        String newStatus = statusUpdate.get("status");
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order status updated to: " + newStatus);
        response.put("orderId", orderId);
        
        return ResponseEntity.ok(response);
    }
    
    // GET: Thống kê doanh thu
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRevenueStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", "5.2M");
        stats.put("todayRevenue", "250K");
        stats.put("ordersCount", 28);
        stats.put("message", "Revenue statistics for seller");
        
        return ResponseEntity.ok(stats);
    }
}
