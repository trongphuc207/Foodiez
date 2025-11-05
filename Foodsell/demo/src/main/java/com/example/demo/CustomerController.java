package com.example.demo;

import com.example.demo.config.RoleChecker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerController {
    
    private final RoleChecker roleChecker;

    @Autowired
    public CustomerController(RoleChecker roleChecker) {
        this.roleChecker = roleChecker;
    }

    // GET: Dashboard customer (accessible by all authenticated users)
    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getCustomerDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("message", "Customer Dashboard");
        dashboard.put("role", "customer");
        dashboard.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(dashboard);
    }
    
    // GET: Giỏ hàng của tôi
    @GetMapping("/cart")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getMyCart() {
        Map<String, Object> cart = new HashMap<>();
        cart.put("message", "My Cart");
        cart.put("items", List.of());
        cart.put("total", 0);
        
        return ResponseEntity.ok(cart);
    }
    
    // POST: Thêm sản phẩm vào giỏ hàng
    @PostMapping("/cart/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody Map<String, Object> cartItem) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product added to cart");
        response.put("item", cartItem);
        
        return ResponseEntity.ok(response);
    }
    
    // GET: Sản phẩm yêu thích
    @GetMapping("/favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getFavorites() {
        Map<String, Object> favorites = new HashMap<>();
        favorites.put("message", "My Favorites");
        favorites.put("items", List.of());
        
        return ResponseEntity.ok(favorites);
    }
    
    // POST: Thêm vào yêu thích
    @PostMapping("/favorites/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> addToFavorites(@RequestBody Map<String, Object> favoriteItem) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product added to favorites");
        response.put("item", favoriteItem);
        
        return ResponseEntity.ok(response);
    }
    
    // GET: Địa chỉ giao hàng
    @GetMapping("/delivery-addresses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getDeliveryAddresses() {
        Map<String, Object> addresses = new HashMap<>();
        addresses.put("message", "My Delivery Addresses");
        addresses.put("addresses", List.of());
        
        return ResponseEntity.ok(addresses);
    }
    
    // POST: Thêm địa chỉ giao hàng
    @PostMapping("/delivery-addresses/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> addDeliveryAddress(@RequestBody Map<String, Object> address) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Delivery address added");
        response.put("address", address);
        
        return ResponseEntity.ok(response);
    }
    
}
