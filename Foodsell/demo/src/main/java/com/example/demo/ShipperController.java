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
@RequestMapping("/api/shipper")
@CrossOrigin(origins = "http://localhost:3000")
public class ShipperController {
    
    private final OrderService orderService;
    private final RoleChecker roleChecker;

    @Autowired
    public ShipperController(OrderService orderService, RoleChecker roleChecker) {
        this.orderService = orderService;
        this.roleChecker = roleChecker;
    }

    // GET: Lấy đơn hàng cần giao
    @GetMapping("/orders")
    @PreAuthorize("hasRole('SHIPPER') or hasRole('ADMIN')")
    public List<OrderDTO> getShipperOrders() {
        // Logic để lấy đơn hàng cần giao
        return orderService.getAllOrders();
    }
    
    // GET: Dashboard thống kê shipper
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('SHIPPER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getShipperDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("message", "Shipper Dashboard");
        dashboard.put("role", "shipper");
        dashboard.put("timestamp", System.currentTimeMillis());
        
        // Shipper có thể mua hàng như customer
        dashboard.put("canShopAsCustomer", true);
        dashboard.put("note", "As a shipper, you can also shop as a customer");
        
        return ResponseEntity.ok(dashboard);
    }
    
    // POST: Nhận đơn hàng để giao
    @PostMapping("/orders/{orderId}/accept")
    @PreAuthorize("hasRole('SHIPPER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> acceptOrder(@PathVariable Integer orderId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order accepted for delivery");
        response.put("orderId", orderId);
        
        return ResponseEntity.ok(response);
    }
    
    // POST: Cập nhật trạng thái giao hàng
    @PostMapping("/orders/{orderId}/delivery-status")
    @PreAuthorize("hasRole('SHIPPER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateDeliveryStatus(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> statusUpdate) {
        
        String newStatus = statusUpdate.get("status");
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Delivery status updated to: " + newStatus);
        response.put("orderId", orderId);
        
        return ResponseEntity.ok(response);
    }
    
    // GET: Thống kê thu nhập
    @GetMapping("/earnings")
    @PreAuthorize("hasRole('SHIPPER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getEarningsStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEarnings", "480K");
        stats.put("todayEarnings", "25K");
        stats.put("deliveriesCount", 24);
        stats.put("message", "Earnings statistics for shipper");
        
        return ResponseEntity.ok(stats);
    }
}
