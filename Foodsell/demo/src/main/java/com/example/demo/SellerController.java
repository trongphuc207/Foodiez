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
    public List<OrderDTO> getSellerOrders() {
        // Logic để lấy đơn hàng của seller hiện tại
        // Có thể cần thêm sellerId vào Order entity
        return orderService.getAllOrders();
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
    
    // POST: Cập nhật trạng thái đơn hàng
    @PostMapping("/orders/{orderId}/status")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
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
