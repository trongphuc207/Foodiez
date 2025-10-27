package com.example.demo.Cart;

import com.example.demo.config.RoleChecker;
import com.example.demo.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller xử lý các API endpoints cho giỏ hàng
 * 
 * Mục đích: Cung cấp REST API để frontend tương tác với giỏ hàng
 * Logic: 
 * - GET /api/cart - Lấy thông tin giỏ hàng
 * - POST /api/cart/add - Thêm sản phẩm vào giỏ hàng
 * - PUT /api/cart/update - Cập nhật số lượng sản phẩm
 * - DELETE /api/cart/remove - Xóa sản phẩm khỏi giỏ hàng
 * - DELETE /api/cart/clear - Xóa toàn bộ giỏ hàng
 */
@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private static final Logger logger = LoggerFactory.getLogger(CartController.class);

    @Autowired
    private CartService cartService;

    @Autowired
    private RoleChecker roleChecker;

    private Integer getCurrentUserId() {
        var currentUser = roleChecker.getCurrentUser();
        if (currentUser == null) {
            logger.error("User not found in security context");
            throw new RuntimeException("User not authenticated");
        }
        logger.debug("Current user ID: {}", currentUser.getId());
        return currentUser.getId();
    }

    /**
     * Test endpoint để debug authentication
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testAuth() {
        try {
            logger.info("Test auth endpoint called");
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("message", "Authentication test successful");
            responseData.put("timestamp", System.currentTimeMillis());
            responseData.put("success", true);
            
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            logger.error("Test auth failed: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Test failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Test endpoint để debug CartService
     */
    @GetMapping("/test-cart")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> testCartService() {
        try {
            Integer userId = getCurrentUserId();
            logger.info("Testing CartService for user: {}", userId);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("userId", userId);
            responseData.put("message", "CartService test successful");
            responseData.put("timestamp", System.currentTimeMillis());
            responseData.put("success", true);
            
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            logger.error("CartService test failed: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "CartService test failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Lấy thông tin giỏ hàng của user hiện tại
     * @return ResponseEntity chứa thông tin giỏ hàng
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyCart() {
        try {
            Integer userId = getCurrentUserId();
            logger.info("Getting cart for user: {}", userId);
            
            Cart cart = cartService.getOrCreateCart(userId);
            logger.info("Cart created/retrieved: {}", cart.getId());
            
            BigDecimal total = cartService.calculateTotal(userId);
            logger.info("Total calculated: {}", total);
            
            long itemCount = cartService.getCartItemCount(userId);
            logger.info("Item count: {}", itemCount);
            
            Map<String, Object> cartDetails = new HashMap<>();
            cartDetails.put("id", cart.getId());
            cartDetails.put("userId", cart.getUserId());
            cartDetails.put("createdAt", cart.getCreatedAt());
            cartDetails.put("updatedAt", cart.getUpdatedAt());
            cartDetails.put("items", cart.getCartItems());
            cartDetails.put("totalAmount", total);
            cartDetails.put("itemCount", itemCount);
            cartDetails.put("isEmpty", cartService.isCartEmpty(userId));

            logger.info("Cart retrieved successfully for user: {}, itemCount: {}", userId, itemCount);
            return ResponseEntity.ok(ApiResponse.success(cartDetails, "Cart retrieved successfully"));
        } catch (Exception e) {
            logger.error("Error getting cart: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Internal error: " + e.getMessage()));
        }
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     * @param request Chứa productId và quantity
     * @return ResponseEntity
     */
    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addToCart(@RequestBody Map<String, Integer> request) {
        try {
            Integer userId = getCurrentUserId();
            Integer productId = request.get("productId");
            Integer quantity = request.getOrDefault("quantity", 1);
            
            logger.info("Adding to cart - userId: {}, productId: {}, quantity: {}", userId, productId, quantity);

            Cart cart = cartService.addToCart(userId, productId, quantity);
            
            // Lấy thông tin chi tiết của cart sau khi thêm
            BigDecimal total = cartService.calculateTotal(userId);
            long itemCount = cartService.getCartItemCount(userId);
            boolean isEmpty = cartService.isCartEmpty(userId);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("cartId", cart.getId());
            responseData.put("userId", userId);
            responseData.put("productId", productId);
            responseData.put("quantity", quantity);
            responseData.put("totalAmount", total);
            responseData.put("itemCount", itemCount);
            responseData.put("isEmpty", isEmpty);
            responseData.put("message", "Product added to cart successfully");
            
            logger.info("Product added successfully to cart: {}, total: {}, items: {}", cart.getId(), total, itemCount);
            return ResponseEntity.ok(ApiResponse.success(responseData, "Product added to cart"));
        } catch (RuntimeException e) {
            logger.error("Error adding to cart: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     * @param request Chứa productId và quantity
     * @return ResponseEntity
     */
    @PutMapping("/update-quantity")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCartItemQuantity(@RequestBody Map<String, Integer> request) {
        try {
            Integer userId = getCurrentUserId();
            Integer productId = request.get("productId");
            Integer quantity = request.get("quantity");
            
            logger.info("Updating cart item - userId: {}, productId: {}, quantity: {}", userId, productId, quantity);

            Cart cart = cartService.updateQuantity(userId, productId, quantity);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("cartId", cart.getId());
            responseData.put("message", "Cart item quantity updated successfully");
            
            logger.info("Cart item updated successfully for cart: {}", cart.getId());
            return ResponseEntity.ok(ApiResponse.success(responseData, "Cart item quantity updated"));
        } catch (RuntimeException e) {
            logger.error("Error updating cart item: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     * @param productId ID của sản phẩm
     * @return ResponseEntity
     */
    @DeleteMapping("/remove/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> removeFromCart(@PathVariable Integer productId) {
        try {
            Integer userId = getCurrentUserId();
            logger.info("Removing from cart - userId: {}, productId: {}", userId, productId);
            
            cartService.removeFromCart(userId, productId);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("message", "Product removed from cart successfully");
            
            logger.info("Product removed successfully from cart");
            return ResponseEntity.ok(ApiResponse.success(responseData, "Product removed from cart"));
        } catch (RuntimeException e) {
            logger.error("Error removing from cart: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Xóa toàn bộ giỏ hàng
     * @return ResponseEntity
     */
    @DeleteMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> clearCart() {
        try {
            Integer userId = getCurrentUserId();
            logger.info("Clearing cart for user: {}", userId);
            
            cartService.clearCart(userId);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("message", "Cart cleared successfully");
            
            logger.info("Cart cleared successfully for user: {}", userId);
            return ResponseEntity.ok(ApiResponse.success(responseData, "Cart cleared"));
        } catch (RuntimeException e) {
            logger.error("Error clearing cart: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }
}
