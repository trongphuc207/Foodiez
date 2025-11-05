package com.example.demo.Shipper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.example.demo.Users.User;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/shipper")
public class ShipperController {

    @Autowired
    private ShipperService shipperService;

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(
            @RequestParam(required = false) String status,
            Authentication authentication) {
        try {
            // Get email from authenticated principal (User) to avoid principal.toString() issues
            String email = null;
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                email = ((User) authentication.getPrincipal()).getEmail();
            } else if (authentication != null) {
                email = authentication.getName();
            }
            var orders = shipperService.getShipperOrders(email, status);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", orders
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String area,
            Authentication authentication) {
        try {
            String email = null;
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                email = ((User) authentication.getPrincipal()).getEmail();
            } else if (authentication != null) {
                email = authentication.getName();
            }
            var orders = shipperService.getAvailableOrders(email, keyword, area);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", orders
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/orders/{orderId}/accept")
    public ResponseEntity<?> acceptOrder(
            @PathVariable Integer orderId,
            @RequestBody(required = false) AcceptOrderRequest request,
            Authentication authentication) {
        try {
            String note = request != null ? request.getNote() : null;
            String email = null;
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                email = ((User) authentication.getPrincipal()).getEmail();
            } else if (authentication != null) {
                email = authentication.getName();
            }
            shipperService.acceptOrder(orderId, email, note);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã nhận đơn hàng thành công"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        try {
            String email = null;
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                email = ((User) authentication.getPrincipal()).getEmail();
            } else if (authentication != null) {
                email = authentication.getName();
            }
            var dashboard = shipperService.getShipperDashboard(email);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", dashboard
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody OrderStatusUpdateRequest request,
            Authentication authentication) {
        try {
            String email = null;
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                email = ((User) authentication.getPrincipal()).getEmail();
            } else if (authentication != null) {
                email = authentication.getName();
            }
            shipperService.updateOrderStatus(orderId, request.getStatus(), request.getNote(), email);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/earnings")
    public ResponseEntity<?> getEarnings(Authentication authentication) {
        try {
            String email = null;
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                email = ((User) authentication.getPrincipal()).getEmail();
            } else if (authentication != null) {
                email = authentication.getName();
            }
            var earnings = shipperService.getShipperEarnings(email);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", earnings
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication authentication) {
        try {
            String email = null;
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                email = ((User) authentication.getPrincipal()).getEmail();
            } else if (authentication != null) {
                email = authentication.getName();
            }
            var history = shipperService.getDeliveryHistory(email);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", history
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String email = null;
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                email = ((User) authentication.getPrincipal()).getEmail();
            } else if (authentication != null) {
                email = authentication.getName();
            }
            var profile = shipperService.getShipperProfile(email);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", profile
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}