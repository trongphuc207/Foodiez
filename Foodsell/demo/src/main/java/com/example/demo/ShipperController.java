package com.example.demo;

import com.example.demo.config.RoleChecker;
import com.example.demo.dto.OrderDTO;
import com.example.demo.Orders.OrderService;
import com.example.demo.Shipper.Shipper;
import com.example.demo.Shipper.ShipperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/shipper")
@CrossOrigin(origins = "http://localhost:3000")
public class ShipperController {
    
    private final OrderService orderService;
    private final RoleChecker roleChecker;
    private final ShipperService shipperService;

    @Autowired
    public ShipperController(OrderService orderService, RoleChecker roleChecker, ShipperService shipperService) {
        this.orderService = orderService;
        this.roleChecker = roleChecker;
        this.shipperService = shipperService;
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
    
    // POST: Tạo profile shipper
    @PostMapping("/profile")
    @PreAuthorize("hasRole('SHIPPER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createShipperProfile(
            @RequestBody Map<String, Object> profileData) {
        try {
            Integer userId = (Integer) profileData.get("userId");
            String vehicleType = (String) profileData.get("vehicleType");
            String licensePlate = (String) profileData.get("licensePlate");
            String deliveryArea = (String) profileData.get("deliveryArea");
            
            Shipper shipper = shipperService.createShipperProfile(userId, vehicleType, licensePlate, deliveryArea);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Shipper profile created successfully");
            response.put("shipper", shipper);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // GET: Lấy thông tin profile shipper
    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasRole('SHIPPER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getShipperProfile(@PathVariable Integer userId) {
        Optional<Shipper> shipper = shipperService.getShipperByUserId(userId);
        
        Map<String, Object> response = new HashMap<>();
        if (shipper.isPresent()) {
            response.put("success", true);
            response.put("shipper", shipper.get());
        } else {
            response.put("success", false);
            response.put("message", "Shipper profile not found");
        }
        
        return ResponseEntity.ok(response);
    }
    
    // PUT: Cập nhật trạng thái sẵn sàng
    @PutMapping("/availability")
    @PreAuthorize("hasRole('SHIPPER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateAvailability(
            @RequestBody Map<String, Object> request) {
        try {
            Integer userId = (Integer) request.get("userId");
            Boolean isAvailable = (Boolean) request.get("isAvailable");
            
            Shipper shipper = shipperService.updateAvailability(userId, isAvailable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Availability updated successfully");
            response.put("shipper", shipper);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // GET: Lấy danh sách shipper có sẵn
    @GetMapping("/available")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAvailableShippers(
            @RequestParam(required = false) String area) {
        List<Shipper> shippers;
        
        if (area != null && !area.isEmpty()) {
            shippers = shipperService.getAvailableShippersInArea(area);
        } else {
            shippers = shipperService.getTopRatedShippers();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("shippers", shippers);
        response.put("count", shippers.size());
        
        return ResponseEntity.ok(response);
    }
    
    // GET: Thống kê tổng quan shipper
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getShipperStats() {
        ShipperService.ShipperStats stats = shipperService.getShipperStats();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("stats", stats);
        
        return ResponseEntity.ok(response);
    }
}
