package com.example.demo.admin;

import com.example.demo.Users.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        User principal = (User) authentication.getPrincipal();
        if (principal == null || principal.getRole() == null || !"admin".equalsIgnoreCase(principal.getRole())) {
            throw new RuntimeException("Only admin can create users.");
        }
        // ensure caller is admin using repository check via update path side-effect
        String fullName = null;
        if (body.containsKey("name")) fullName = Objects.toString(body.get("name"), null);
        if (body.containsKey("fullName")) fullName = Objects.toString(body.get("fullName"), fullName);
        if (body.containsKey("full_name")) fullName = Objects.toString(body.get("full_name"), fullName);
        String email = Objects.toString(body.getOrDefault("email", null), null);
        String role = Objects.toString(body.getOrDefault("role", "buyer"), "buyer").toLowerCase();
        String password = Objects.toString(body.getOrDefault("password", null), null);

        if (password == null || password.length() < 1) {
            throw new RuntimeException("Password is required");
        }

        // Use BCrypt encoder bean via simple new instance to avoid extra wiring
        String hash = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(password);
        // Leverage repo validation for admin and constraints by attempting a no-op update on self
        // alternatively, rely on SecurityConfig role rules if configured
        int newId = adminService.createUserByAdmin(fullName, email, hash, role);
        return ResponseEntity.ok(Map.of("success", true, "id", newId, "message", "User created"));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable int id,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        int adminId = ((User) authentication.getPrincipal()).getId();
        String fullName = null;
        if (body.containsKey("name")) fullName = Objects.toString(body.get("name"), null);
        if (body.containsKey("fullName")) fullName = Objects.toString(body.get("fullName"), fullName);
        if (body.containsKey("full_name")) fullName = Objects.toString(body.get("full_name"), fullName);
        String role = null;
        if (body.containsKey("role")) role = Objects.toString(body.get("role"), null);
        if (role != null) role = role.toLowerCase();
        // Accept both phone/address and common alias names
        String phone = null;
        if (body.containsKey("phone")) phone = Objects.toString(body.get("phone"), null);
        if (phone == null && body.containsKey("phoneNumber")) phone = Objects.toString(body.get("phoneNumber"), null);
        String address = null;
        if (body.containsKey("address")) address = Objects.toString(body.get("address"), null);
        if (address == null && body.containsKey("addressText")) address = Objects.toString(body.get("addressText"), null);

        adminService.updateUserByAdmin(adminId, id, fullName, role, phone, address);
        return ResponseEntity.ok(Map.of("success", true, "message", "User updated"));
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

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(
            @PathVariable int id,
            @RequestParam(name = "hard", required = false, defaultValue = "false") boolean hard,
            Authentication authentication
    ) {
        int adminId = ((User) authentication.getPrincipal()).getId();
        if (hard) {
            adminService.hardDeleteUserByAdmin(adminId, id);
            return ResponseEntity.ok(Map.of("success", true, "message", "User permanently deleted"));
        } else {
            adminService.softDeleteUserByAdmin(adminId, id);
            return ResponseEntity.ok(Map.of("success", true, "message", "User soft-deleted (banned)"));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getOrders() {
        return ResponseEntity.ok(adminService.getOrders());
    }

    @GetMapping("/vouchers")
    public ResponseEntity<List<Map<String, Object>>> getVouchers() {
        return ResponseEntity.ok(adminService.getVouchers());
    }

    // ===== VOUCHERS CRUD =====
    @PostMapping("/vouchers")
    public ResponseEntity<Map<String, Object>> addVoucher(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        User principal = (User) authentication.getPrincipal();
        if (principal == null || principal.getRole() == null || !"admin".equalsIgnoreCase(principal.getRole())) {
            throw new RuntimeException("Only admin can create vouchers.");
        }
        String code = Objects.toString(body.getOrDefault("code", null), null);
        Double discount = null;
        if (body.containsKey("discount")) discount = toDouble(body.get("discount"));
        if (discount == null && body.containsKey("percent")) discount = toDouble(body.get("percent"));
        String expiry = null;
        if (body.containsKey("expiryDate")) expiry = Objects.toString(body.get("expiryDate"), null);
        if (expiry == null && body.containsKey("expiresAt")) expiry = Objects.toString(body.get("expiresAt"), null);
        // Optional fields
        Double minOrderValue = null;
        if (body.containsKey("minOrderValue")) minOrderValue = toDouble(body.get("minOrderValue"));
        if (minOrderValue == null && body.containsKey("min_order_value")) minOrderValue = toDouble(body.get("min_order_value"));
        Integer maxUses = null;
        try { if (body.containsKey("maxUses")) maxUses = Integer.valueOf(String.valueOf(body.get("maxUses"))); } catch (Exception ignored) {}
        try { if (maxUses == null && body.containsKey("max_uses")) maxUses = Integer.valueOf(String.valueOf(body.get("max_uses"))); } catch (Exception ignored) {}

        int id = adminService.addVoucher(principal.getId(), code, discount, expiry, minOrderValue, maxUses);
        return ResponseEntity.ok(Map.of("success", true, "id", id, "message", "Voucher created"));
    }

    @PutMapping("/vouchers/{id}")
    public ResponseEntity<Map<String, Object>> updateVoucher(
            @PathVariable int id,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        User principal = (User) authentication.getPrincipal();
        if (principal == null || principal.getRole() == null || !"admin".equalsIgnoreCase(principal.getRole())) {
            throw new RuntimeException("Only admin can update vouchers.");
        }
        String code = body.containsKey("code") ? Objects.toString(body.get("code"), null) : null;
        Double discount = null;
        if (body.containsKey("discount")) discount = toDouble(body.get("discount"));
        if (discount == null && body.containsKey("percent")) discount = toDouble(body.get("percent"));
        String expiry = null;
        if (body.containsKey("expiryDate")) expiry = Objects.toString(body.get("expiryDate"), null);
        if (expiry == null && body.containsKey("expiresAt")) expiry = Objects.toString(body.get("expiresAt"), null);
        Double minOrderValue = null;
        if (body.containsKey("minOrderValue")) minOrderValue = toDouble(body.get("minOrderValue"));
        if (minOrderValue == null && body.containsKey("min_order_value")) minOrderValue = toDouble(body.get("min_order_value"));
        Integer maxUses = null;
        try { if (body.containsKey("maxUses")) maxUses = Integer.valueOf(String.valueOf(body.get("maxUses"))); } catch (Exception ignored) {}
        try { if (maxUses == null && body.containsKey("max_uses")) maxUses = Integer.valueOf(String.valueOf(body.get("max_uses"))); } catch (Exception ignored) {}
        adminService.updateVoucher(principal.getId(), id, code, discount, expiry, minOrderValue, maxUses);
        return ResponseEntity.ok(Map.of("success", true, "message", "Voucher updated"));
    }

    @DeleteMapping("/vouchers/{id}")
    public ResponseEntity<Map<String, Object>> deleteVoucher(
            @PathVariable int id,
            Authentication authentication
    ) {
        User principal = (User) authentication.getPrincipal();
        if (principal == null || principal.getRole() == null || !"admin".equalsIgnoreCase(principal.getRole())) {
            throw new RuntimeException("Only admin can delete vouchers.");
        }
        adminService.deleteVoucher(principal.getId(), id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Voucher deleted"));
    }

    private Double toDouble(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).doubleValue();
        try { return Double.parseDouble(String.valueOf(o)); } catch (Exception e) { return null; }
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getReports() {
        return ResponseEntity.ok(adminService.getReportData());
    }
    // ===== Products =====
@GetMapping("/products")
public ResponseEntity<List<Map<String, Object>>> getProducts() {
    return ResponseEntity.ok(adminService.getProducts());
}
}
