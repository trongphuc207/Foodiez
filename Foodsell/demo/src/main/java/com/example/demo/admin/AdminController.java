package com.example.demo.admin;

import com.example.demo.dto.AdminDashboard;
import com.example.demo.Users.User;
import com.example.demo.orders.Order;
import com.example.demo.shops.Shop;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private AdminService adminService;
    @Autowired private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboard> dashboard() {
        AdminAuth.requireAdmin();
        return ResponseEntity.ok(adminService.getDashboardSummary());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> users() {
        AdminAuth.requireAdmin();
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> orders() {
        AdminAuth.requireAdmin();
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @GetMapping("/shops")
    public ResponseEntity<List<Shop>> shops() {
        AdminAuth.requireAdmin();
        return ResponseEntity.ok(adminService.getAllShops());
    }

    // bạn yêu cầu có /api/admin/analytics => trả gộp
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> analyticsSummary() {
        AdminAuth.requireAdmin();
        return ResponseEntity.ok(Map.of(
                "sales",   analyticsService.getSalesReport(),
                "users",   analyticsService.getUserStats(),
                "orders",  analyticsService.getOrderStats(),
                "revenue", analyticsService.getRevenueStats()
        ));
    }
}
