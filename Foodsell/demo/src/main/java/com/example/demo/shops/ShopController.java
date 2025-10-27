package com.example.demo.shops;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.dto.ApiResponse;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = "http://localhost:3000")
public class ShopController {
    
    private final ShopService shopService;
    
    @Autowired
    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }
    
    // GET: Test endpoint
    @GetMapping("/test")
    public String test() {
        return "ShopController is working!";
    }
    
    // GET: Lấy tất cả shop
    @GetMapping
    public ResponseEntity<ApiResponse<List<Shop>>> getAllShops() {
        try {
            List<Shop> shops = shopService.getAllShops();
            return ResponseEntity.ok(ApiResponse.success(shops, "Lấy danh sách shop thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy danh sách shop: " + e.getMessage()));
        }
    }
    
    // GET: Lấy shop theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Shop>> getShopById(@PathVariable int id) {
        try {
            Optional<Shop> shop = shopService.getShopById(id);
            if (shop.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(shop.get(), "Lấy thông tin shop thành công"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy thông tin shop: " + e.getMessage()));
        }
    }
    
    // GET: Lấy shop theo seller_id
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ApiResponse<Shop>> getShopBySellerId(@PathVariable int sellerId) {
        try {
            Optional<Shop> shop = shopService.getShopBySellerId(sellerId);
            if (shop.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(shop.get(), "Lấy thông tin shop của seller thành công"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy thông tin shop của seller: " + e.getMessage()));
        }
    }
    
    // GET: Tìm kiếm shop theo tên
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Shop>>> searchShops(@RequestParam String keyword) {
        try {
            List<Shop> shops = shopService.searchShops(keyword);
            return ResponseEntity.ok(ApiResponse.success(shops, "Tìm kiếm shop thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi tìm kiếm shop: " + e.getMessage()));
        }
    }
    
    // GET: Lấy shop theo rating
    @GetMapping("/rating/{minRating}")
    public ResponseEntity<ApiResponse<List<Shop>>> getShopsByRating(@PathVariable Double minRating) {
        try {
            List<Shop> shops = shopService.getShopsByRating(minRating);
            return ResponseEntity.ok(ApiResponse.success(shops, "Lấy shop theo rating thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy shop theo rating: " + e.getMessage()));
        }
    }
    
    // GET: Lấy shop được sắp xếp theo rating
    @GetMapping("/top-rated")
    public ResponseEntity<ApiResponse<List<Shop>>> getTopRatedShops() {
        try {
            List<Shop> shops = shopService.getShopsOrderedByRating();
            return ResponseEntity.ok(ApiResponse.success(shops, "Lấy shop được đánh giá cao thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy shop được đánh giá cao: " + e.getMessage()));
        }
    }
    
    // POST: Tạo shop mới
    @PostMapping
    public ResponseEntity<ApiResponse<Shop>> createShop(@RequestBody Shop shop) {
        try {
            Shop createdShop = shopService.createShop(shop);
            return ResponseEntity.ok(ApiResponse.success(createdShop, "Tạo shop thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Lỗi khi tạo shop: " + e.getMessage()));
        }
    }
    
    // PUT: Cập nhật shop
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Shop>> updateShop(@PathVariable int id, @RequestBody Shop shop) {
        try {
            shop.setId(id);
            Shop updatedShop = shopService.updateShop(shop);
            return ResponseEntity.ok(ApiResponse.success(updatedShop, "Cập nhật shop thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Lỗi khi cập nhật shop: " + e.getMessage()));
        }
    }
    
    // PUT: Cập nhật rating cho shop
    @PutMapping("/{id}/rating")
    public ResponseEntity<ApiResponse<Shop>> updateShopRating(@PathVariable int id, @RequestParam Integer rating) {
        try {
            Shop updatedShop = shopService.updateShopRating(id, rating);
            return ResponseEntity.ok(ApiResponse.success(updatedShop, "Cập nhật rating shop thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Lỗi khi cập nhật rating shop: " + e.getMessage()));
        }
    }
    
    // DELETE: Xóa shop
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteShop(@PathVariable int id) {
        try {
            shopService.deleteShop(id);
            return ResponseEntity.ok(ApiResponse.success("Shop đã được xóa", "Xóa shop thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Lỗi khi xóa shop: " + e.getMessage()));
        }
    }
    
    // GET: Thống kê shop
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getShopStats() {
        try {
            long shopCount = shopService.getShopCount();
            return ResponseEntity.ok(ApiResponse.success(shopCount, "Lấy thống kê shop thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy thống kê shop: " + e.getMessage()));
        }
    }
}