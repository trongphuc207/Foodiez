package com.example.demo;

import com.example.demo.config.RoleChecker;
import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {
    
    private final UserRepository userRepository;
    private final RoleChecker roleChecker;

    @Autowired
    public AdminController(UserRepository userRepository, RoleChecker roleChecker) {
        this.userRepository = userRepository;
        this.roleChecker = roleChecker;
    }

    // GET: Dashboard admin
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("message", "Admin Dashboard");
        dashboard.put("role", "admin");
        dashboard.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(dashboard);
    }
    
    // GET: Danh sách tất cả users
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    // POST: Cập nhật role của user
    @PostMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Integer userId,
            @RequestBody Map<String, String> roleUpdate) {
        
        String newRole = roleUpdate.get("role");
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "User not found");
            return ResponseEntity.badRequest().body(error);
        }
        
        user.setRole(newRole);
        userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User role updated to: " + newRole);
        response.put("userId", userId);
        response.put("email", user.getEmail());
        
        return ResponseEntity.ok(response);
    }
    
    // GET: Thống kê hệ thống
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalOrders", 1245);
        stats.put("totalRevenue", "25.8M");
        stats.put("message", "System statistics");
        
        return ResponseEntity.ok(stats);
    }
}
