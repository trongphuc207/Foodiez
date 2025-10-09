package com.example.demo.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    @Autowired private AnalyticsService analyticsService;

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Double>> sales() {
        AdminAuth.requireAdmin();
        return ResponseEntity.ok(analyticsService.getSalesReport());
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Long>> users() {
        AdminAuth.requireAdmin();
        return ResponseEntity.ok(analyticsService.getUserStats());
    }

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Long>> orders() {
        AdminAuth.requireAdmin();
        return ResponseEntity.ok(analyticsService.getOrderStats());
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Double>> revenue() {
        AdminAuth.requireAdmin();
        return ResponseEntity.ok(analyticsService.getRevenueStats());
    }
}
