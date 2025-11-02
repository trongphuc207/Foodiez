package com.example.demo.shipper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
            var orders = shipperService.getShipperOrders(authentication.getName(), status);
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
            var orders = shipperService.getAvailableOrders(authentication.getName(), keyword, area);
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

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        try {
            var dashboard = shipperService.getShipperDashboard(authentication.getName());
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
            shipperService.updateOrderStatus(orderId, request.getStatus(), request.getNote(), authentication.getName());
            return ResponseEntity.ok(Map.of("success", true));
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
            Authentication authentication) {
        try {
            shipperService.acceptOrder(orderId, authentication.getName());
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
            var earnings = shipperService.getShipperEarnings(authentication.getName());
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
            var history = shipperService.getDeliveryHistory(authentication.getName());
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
            var profile = shipperService.getShipperProfile(authentication.getName());
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