package com.example.demo.admin;

import com.example.demo.products.Product;
import com.example.demo.products.ProductRepository;
import com.example.demo.Users.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminProductController {

    @Autowired
    private ProductRepository productRepository;

    // Get all pending products
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingProducts(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            if (!"admin".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Admin access required"));
            }
            
            List<Product> products = productRepository.findByApprovalStatusOrderByCreatedAtAsc("pending");
            return ResponseEntity.ok(Map.of("success", true, "products", products));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Get all products with approval status
    @GetMapping("/all")
    public ResponseEntity<?> getAllProductsForReview(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            if (!"admin".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Admin access required"));
            }
            
            List<Product> products = productRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(Map.of("success", true, "products", products));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Approve product
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveProduct(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            User admin = (User) authentication.getPrincipal();
            if (!"admin".equalsIgnoreCase(admin.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Admin access required"));
            }

            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (!"pending".equalsIgnoreCase(product.getApprovalStatus())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Product is not pending"));
            }

            // Approve product
            product.setApprovalStatus("approved");
            product.setReviewedBy(admin.getId());
            product.setReviewedAt(LocalDateTime.now());
            product.setAdminNote(body.get("note"));
            product.setAvailable(true); // Make it available for customers
            
            productRepository.save(product);

            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Product approved successfully",
                "product", product
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Reject product
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectProduct(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            User admin = (User) authentication.getPrincipal();
            if (!"admin".equalsIgnoreCase(admin.getRole())) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Admin access required"));
            }

            String reason = body.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Rejection reason is required"));
            }

            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (!"pending".equalsIgnoreCase(product.getApprovalStatus())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Product is not pending"));
            }

            // Reject product
            product.setApprovalStatus("rejected");
            product.setReviewedBy(admin.getId());
            product.setReviewedAt(LocalDateTime.now());
            product.setAdminNote(reason);
            product.setAvailable(false); // Hide from customers
            
            productRepository.save(product);

            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Product rejected successfully",
                "product", product
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
