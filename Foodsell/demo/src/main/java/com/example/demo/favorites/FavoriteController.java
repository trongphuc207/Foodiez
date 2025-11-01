package com.example.demo.favorites;

import com.example.demo.dto.ApiResponse;
import com.example.demo.favorites.FavoriteProductDTO;
import com.example.demo.Users.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:3000")
public class FavoriteController {

    @PostConstruct
    public void init() {
        System.out.println("🔔 FavoriteController initialized and ready to handle /api/favorites");
    }

    @Autowired
    private FavoriteService service;

    // GET: /api/favorites -> list of productIds for auth user
    @GetMapping
    public ResponseEntity<ApiResponse<List<FavoriteProductDTO>>> getFavorites(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<FavoriteProductDTO> favs = service.getFavoritesForUser(user.getId());
            return ResponseEntity.ok(ApiResponse.success(favs, "Favorites fetched"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch favorites: " + e.getMessage()));
        }
    }

    // POST: /api/favorites { productId }
    @PostMapping
    public ResponseEntity<ApiResponse<String>> addFavorite(@RequestBody FavoriteRequest req, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            boolean added = service.addFavorite(user.getId(), req.getProductId());
            if (added) return ResponseEntity.ok(ApiResponse.success(null, "Added to favorites"));
            return ResponseEntity.ok(ApiResponse.success(null, "Already in favorites"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to add favorite: " + e.getMessage()));
        }
    }

    // DELETE: /api/favorites/{productId}
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<String>> removeFavorite(@PathVariable Integer productId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            System.out.println("🔄 Attempting to remove favorite - User ID: " + user.getId() + ", Product ID: " + productId);
            boolean removed = service.removeFavorite(user.getId(), productId);
            if (removed) {
                System.out.println("✅ Successfully removed favorite - User ID: " + user.getId() + ", Product ID: " + productId);
                return ResponseEntity.ok(ApiResponse.success(null, "Removed from favorites"));
            }
            System.out.println("❌ Favorite not found - User ID: " + user.getId() + ", Product ID: " + productId);
            return ResponseEntity.ok(ApiResponse.success(null, "Not found in favorites"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to remove favorite: " + e.getMessage()));
        }
    }

    // DTO for request
    public static class FavoriteRequest {
        private Integer productId;
        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }
    }
}
