package com.example.demo.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDTO>> getUsers() {
        return ResponseEntity.ok(adminService.getUsers());
    }

    @PostMapping("/users/{id}/ban")
    public ResponseEntity<Map<String, Object>> banUser(@PathVariable int id) {
        adminService.banUser(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "User banned"));
    }

    @PostMapping("/users/{id}/unban")
    public ResponseEntity<Map<String, Object>> unbanUser(@PathVariable int id) {
        adminService.unbanUser(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "User unbanned"));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getOrders() {
        return ResponseEntity.ok(adminService.getOrders());
    }

    @GetMapping("/vouchers")
    public ResponseEntity<List<Map<String, Object>>> getVouchers() {
        return ResponseEntity.ok(adminService.getVouchers());
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getReports() {
        return ResponseEntity.ok(adminService.getReportData());
    }
}
