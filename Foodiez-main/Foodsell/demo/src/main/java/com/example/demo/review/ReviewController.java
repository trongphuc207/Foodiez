package com.example.demo.review;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {
    private final ReviewService service;
    public ReviewController(ReviewService service) { this.service = service; }

    // ---------- PRODUCT ----------
    @PostMapping("/products")
    public ResponseEntity<Review> createProduct(@Valid @RequestBody Review req) {
        Review saved = service.createProductReview(req);
        return ResponseEntity.created(URI.create("/api/reviews/products/" + saved.getId())).body(saved);
    }
    @GetMapping("/products/{productId}")
    public List<Review> listByProduct(@PathVariable Long productId) {
        return service.listProductReviews(productId);
    }
    @GetMapping("/products/{productId}/average")
    public Double avgByProduct(@PathVariable Long productId) {
        return service.averageProductRating(productId);
    }
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        service.deleteProductReview(id); return ResponseEntity.noContent().build();
    }

    // ---------- SHOP ----------
    @PostMapping("/shops")
    public ResponseEntity<ShopReview> createShop(@Valid @RequestBody ShopReview req) {
        ShopReview saved = service.createShopReview(req);
        return ResponseEntity.created(URI.create("/api/reviews/shops/" + saved.getId())).body(saved);
    }
    @GetMapping("/shops/{shopId}")
    public List<ShopReview> listByShop(@PathVariable Long shopId) {
        return service.listShopReviews(shopId);
    }
    @GetMapping("/shops/{shopId}/average")
    public Double avgByShop(@PathVariable Long shopId) {
        return service.averageShopRating(shopId);
    }
    @DeleteMapping("/shops/{id}")
    public ResponseEntity<Void> deleteShop(@PathVariable Long id) {
        service.deleteShopReview(id); return ResponseEntity.noContent().build();
    }
}
