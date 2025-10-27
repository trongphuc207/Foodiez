package com.example.demo.Orders;

import com.example.demo.config.RoleChecker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/orders/assignment")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderAssignmentController {
    
    private final OrderAssignmentService orderAssignmentService;
    private final RoleChecker roleChecker;

    @Autowired
    public OrderAssignmentController(OrderAssignmentService orderAssignmentService, RoleChecker roleChecker) {
        this.orderAssignmentService = orderAssignmentService;
        this.roleChecker = roleChecker;
    }

    /**
     * Seller/Shipper chấp nhận đơn hàng
     */
    @PostMapping("/{orderId}/accept")
    @PreAuthorize("hasRole('SELLER') or hasRole('SHIPPER')")
    public ResponseEntity<Map<String, Object>> acceptOrder(@PathVariable Integer orderId) {
        try {
            var currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
            }

            boolean success = orderAssignmentService.acceptOrder(orderId, currentUser.getId());
            
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Order accepted successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to accept order"));
            }
            
        } catch (Exception e) {
            System.err.println("Error accepting order: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error: " + e.getMessage()));
        }
    }

    /**
     * Seller/Shipper từ chối đơn hàng
     */
    @PostMapping("/{orderId}/reject")
    @PreAuthorize("hasRole('SELLER') or hasRole('SHIPPER')")
    public ResponseEntity<Map<String, Object>> rejectOrder(@PathVariable Integer orderId, @RequestBody Map<String, String> request) {
        try {
            var currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
            }

            String reason = request.getOrDefault("reason", "No reason provided");
            boolean success = orderAssignmentService.rejectOrder(orderId, currentUser.getId(), reason);
            
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Order rejected successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to reject order"));
            }
            
        } catch (Exception e) {
            System.err.println("Error rejecting order: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error: " + e.getMessage()));
        }
    }

    /**
     * Admin phân phối đơn hàng cho seller
     */
    @PostMapping("/{orderId}/assign-seller/{sellerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> assignOrderToSeller(@PathVariable Integer orderId, @PathVariable Integer sellerId) {
        try {
            boolean success = orderAssignmentService.assignOrderToSeller(orderId, sellerId);
            
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Order assigned to seller successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to assign order to seller"));
            }
            
        } catch (Exception e) {
            System.err.println("Error assigning order to seller: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error: " + e.getMessage()));
        }
    }

    /**
     * Admin phân phối đơn hàng cho shipper
     */
    @PostMapping("/{orderId}/assign-shipper/{shipperId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> assignOrderToShipper(@PathVariable Integer orderId, @PathVariable Integer shipperId) {
        try {
            boolean success = orderAssignmentService.assignOrderToShipper(orderId, shipperId);
            
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Order assigned to shipper successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to assign order to shipper"));
            }
            
        } catch (Exception e) {
            System.err.println("Error assigning order to shipper: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách đơn hàng được phân phối cho user hiện tại
     */
    @GetMapping("/my-assigned-orders")
    @PreAuthorize("hasRole('SELLER') or hasRole('SHIPPER')")
    public ResponseEntity<Map<String, Object>> getMyAssignedOrders() {
        try {
            var currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
            }

            var assignedOrders = orderAssignmentService.getAssignedOrders(currentUser.getId(), currentUser.getRole().toLowerCase());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("orders", assignedOrders);
            result.put("count", assignedOrders.size());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("Error getting assigned orders: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error: " + e.getMessage()));
        }
    }
}
