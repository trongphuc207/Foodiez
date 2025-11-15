package com.example.demo.roleapplication;

import com.example.demo.Users.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/role-applications")
@CrossOrigin(origins = "http://localhost:3000")
public class RoleApplicationController {
    
    @Autowired
    private RoleApplicationService roleApplicationService;

    // Customer: Apply for role (shipper or seller)
    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyForRole(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            String requestedRole = (String) body.get("requestedRole");
            String reason = (String) body.get("reason");
            String shopName = (String) body.get("shopName");
            String shopAddress = (String) body.get("shopAddress");
            String shopDescription = (String) body.get("shopDescription");

            if (requestedRole == null || (!requestedRole.equalsIgnoreCase("seller") && !requestedRole.equalsIgnoreCase("shipper"))) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid role. Must be 'seller' or 'shipper'"));
            }

            RoleApplication application = roleApplicationService.createApplication(
                    user.getId(), requestedRole, reason, shopName, shopAddress, shopDescription);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Application submitted successfully",
                    "application", application
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Customer: Get own applications
    @GetMapping("/my-applications")
    public ResponseEntity<Map<String, Object>> getMyApplications(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<RoleApplication> applications = roleApplicationService.getUserApplications(user.getId());
            return ResponseEntity.ok(Map.of("success", true, "applications", applications));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Admin: Get all pending applications
    @GetMapping("/pending")
    public ResponseEntity<Map<String, Object>> getPendingApplications(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            if (!"admin".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Admin access required"));
            }
            
            List<RoleApplication> applications = roleApplicationService.getPendingApplications();
            return ResponseEntity.ok(Map.of("success", true, "applications", applications));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Admin: Get all applications
    @GetMapping("/all")
    public ResponseEntity<?> getAllApplications(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            if (!"admin".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Admin access required"));
            }
            
            List<Map<String, Object>> applications = roleApplicationService.getAllApplicationsWithUserInfo();
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Admin: Approve application
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveApplication(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            if (!"admin".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Admin access required"));
            }

            String note = (String) body.get("note");
            roleApplicationService.approveApplication(id, user.getId(), note);

            return ResponseEntity.ok(Map.of("success", true, "message", "Application approved successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Admin: Reject application
    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectApplication(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            if (!"admin".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Admin access required"));
            }

            String reason = (String) body.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Rejection reason is required"));
            }

            roleApplicationService.rejectApplication(id, user.getId(), reason);

            return ResponseEntity.ok(Map.of("success", true, "message", "Application rejected successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
