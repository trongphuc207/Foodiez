package com.example.demo.reviews;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.demo.dto.ApiResponse;
import com.example.demo.config.RoleChecker;
import com.example.demo.Users.User;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private RoleChecker roleChecker;

    @Value("${app.upload.base-dir:uploads}")
    private String uploadBaseDir;
    
    // ===== CUSTOMER ENDPOINTS =====
    
    // UC46: Write Review - Customer viết review cho sản phẩm
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'customer', 'BUYER', 'buyer')")
    public ResponseEntity<ApiResponse<Review>> writeReview(@RequestBody Map<String, Object> request) {
        try {
            // Lấy customer ID từ JWT token
            User currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập để viết đánh giá"));
            }
            
            Integer customerId = currentUser.getId();
            Integer productId = (Integer) request.get("productId");
            Integer shopId = (Integer) request.get("shopId");
            Integer orderId = (Integer) request.get("orderId");
            Integer rating = (Integer) request.get("rating");
            String content = (String) request.get("content");
            
            Review review = reviewService.writeReview(customerId, productId, shopId, orderId, rating, content);
            return ResponseEntity.ok(ApiResponse.success(review, "Đánh giá sản phẩm thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Write Review with imageUrl (alternative endpoint to include image)
    @PostMapping("/with-image")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'customer', 'BUYER', 'buyer')")
    public ResponseEntity<ApiResponse<Review>> writeReviewWithImage(@RequestBody Map<String, Object> request) {
        try {
            User currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập để viết đánh giá"));
            }

            Integer customerId = currentUser.getId();
            Integer productId = (Integer) request.get("productId");
            Integer shopId = (Integer) request.get("shopId");
            Integer orderId = (Integer) request.get("orderId");
            Integer rating = (Integer) request.get("rating");
            String content = (String) request.get("content");
            String imageUrl = (String) request.get("imageUrl");

            Review review = reviewService.writeReview(customerId, productId, shopId, orderId, rating, content, imageUrl);
            return ResponseEntity.ok(ApiResponse.success(review, "Đánh giá sản phẩm thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Upload review image (returns url)
    @PostMapping(value = "/image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadReviewImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("No file"));
            }
            String ct = file.getContentType();
            if (ct == null || !(ct.startsWith("image/") || ct.equalsIgnoreCase("application/octet-stream"))) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Unsupported file type"));
            }
            // Build absolute uploads path based on working dir, and ensure it exists
            java.nio.file.Path uploadRoot = java.nio.file.Paths.get(uploadBaseDir, "reviews").toAbsolutePath().normalize();
            java.nio.file.Files.createDirectories(uploadRoot);

            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf('.'));
            } else if (ct != null && ct.startsWith("image/")) {
                String t = ct.substring("image/".length());
                if (!t.isEmpty() && !"octet-stream".equalsIgnoreCase(t)) ext = "." + t;
            }

            String name = java.util.UUID.randomUUID().toString().replaceAll("-", "") + ext;
            System.out.println("[ReviewUpload] BaseDir=" + uploadRoot + ", file=" + name + ", ct=" + ct);
            java.nio.file.Path target = uploadRoot.resolve(name);
            try (java.io.InputStream in = file.getInputStream()) {
                java.nio.file.Files.copy(in, target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
            String url = "/uploads/reviews/" + name;
            Map<String, String> data = new HashMap<>();
            data.put("url", url);
            return ResponseEntity.ok(ApiResponse.success(data, "Uploaded"));
        } catch (org.springframework.web.multipart.MaxUploadSizeExceededException ex) {
            return ResponseEntity.status(413).body(ApiResponse.error("File too large"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Internal server error: " + (e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage())));
        }
    }
    
    // UC48: Edit Review - Customer chỉnh sửa review
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'customer', 'BUYER', 'buyer')")
    public ResponseEntity<ApiResponse<Review>> editReview(@PathVariable Integer reviewId, 
                                                         @RequestBody Map<String, Object> request) {
        try {
            User currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập để chỉnh sửa đánh giá"));
            }
            
            System.out.println("🔍 Edit Review Debug - User: " + currentUser.getEmail() + ", Role: " + currentUser.getRole() + ", ID: " + currentUser.getId());
            
            Integer customerId = currentUser.getId();
            Integer rating = (Integer) request.get("rating");
            String content = (String) request.get("content");
            
            Review review = reviewService.editReview(reviewId, customerId, rating, content);
            return ResponseEntity.ok(ApiResponse.success(review, "Chỉnh sửa đánh giá thành công!"));
        } catch (Exception e) {
            System.err.println("❌ Edit Review Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // UC49: Delete Review - Customer xóa review
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'customer', 'BUYER', 'buyer')")
    public ResponseEntity<ApiResponse<String>> deleteReview(@PathVariable Integer reviewId) {
        try {
            User currentUser = roleChecker.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đăng nhập để xóa đánh giá"));
            }
            
            System.out.println("🔍 Delete Review Debug - User: " + currentUser.getEmail() + ", Role: " + currentUser.getRole() + ", ID: " + currentUser.getId());
            
            Integer customerId = currentUser.getId();
            reviewService.deleteReview(reviewId, customerId);
            return ResponseEntity.ok(ApiResponse.success("Xóa đánh giá thành công!", "Xóa đánh giá thành công!"));
        } catch (Exception e) {
            System.err.println("❌ Delete Review Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Lấy review của customer
    @GetMapping("/customer/my-reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<Review>>> getCustomerReviews() {
        try {
            Integer customerId = roleChecker.getCurrentUser().getId();
            List<Review> reviews = reviewService.getCustomerReviews(customerId);
            return ResponseEntity.ok(ApiResponse.success(reviews, "Lấy danh sách đánh giá thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ===== MERCHANT ENDPOINTS =====
    
    // UC50: View Customer Reviews - Public access để hiển thị reviews
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<ApiResponse<List<Review>>> getShopReviews(@PathVariable Integer shopId) {
        try {
            List<Review> reviews = reviewService.getShopReviews(shopId);
            return ResponseEntity.ok(ApiResponse.success(reviews, "Lấy danh sách đánh giá shop thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // UC51: Reply to Review - Merchant trả lời review
    @PostMapping("/{reviewId}/reply")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ReviewReply>> replyToReview(@PathVariable Integer reviewId,
                                                                 @RequestBody Map<String, String> request) {
        try {
            Integer merchantId = roleChecker.getCurrentUser().getId();
            String content = request.get("content");
            
            ReviewReply reply = reviewService.replyToReview(reviewId, merchantId, content);
            return ResponseEntity.ok(ApiResponse.success(reply, "Trả lời đánh giá thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ===== ADMIN ENDPOINTS =====
    
    // UC52: View All Reviews - Admin xem tất cả review
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Review>>> getAllReviews() {
        try {
            List<Review> reviews = reviewService.getAllReviews();
            return ResponseEntity.ok(ApiResponse.success(reviews, "Lấy tất cả đánh giá thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // UC53: Remove Inappropriate Review - Admin ẩn review
    @PutMapping("/admin/{reviewId}/hide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> hideReview(@PathVariable Integer reviewId) {
        try {
            reviewService.hideReview(reviewId);
            return ResponseEntity.ok(ApiResponse.success("Ẩn đánh giá thành công!", "Ẩn đánh giá thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // UC54: Resolve Review Complaint - Admin xử lý khiếu nại
    @PutMapping("/admin/{reviewId}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> resolveReviewComplaint(@PathVariable Integer reviewId,
                                                                     @RequestBody Map<String, String> request) {
        try {
            String resolution = request.get("resolution");
            reviewService.resolveReviewComplaint(reviewId, resolution);
            return ResponseEntity.ok(ApiResponse.success("Xử lý khiếu nại thành công!", "Xử lý khiếu nại thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ===== PUBLIC ENDPOINTS =====
    
    // Lấy review của sản phẩm (public)
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<Review>>> getProductReviews(@PathVariable Integer productId) {
        try {
            List<Review> reviews = reviewService.getProductReviews(productId);
            return ResponseEntity.ok(ApiResponse.success(reviews, "Lấy đánh giá sản phẩm thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Lấy thống kê rating của sản phẩm (public)
    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductReviewStats(@PathVariable Integer productId) {
        try {
            Integer averageRating = reviewService.getProductAverageRating(productId);
            Long reviewCount = reviewService.getProductReviewCount(productId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("averageRating", averageRating);
            stats.put("reviewCount", reviewCount);
            
            return ResponseEntity.ok(ApiResponse.success(stats, "Lấy thống kê đánh giá thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Lấy thống kê rating của shop (public)
    @GetMapping("/shop/{shopId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getShopReviewStats(@PathVariable Integer shopId) {
        try {
            Integer averageRating = reviewService.getShopAverageRating(shopId);
            Long reviewCount = reviewService.getShopReviewCount(shopId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("averageRating", averageRating);
            stats.put("reviewCount", reviewCount);
            
            return ResponseEntity.ok(ApiResponse.success(stats, "Lấy thống kê đánh giá shop thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Lấy reply của review (public)
    @GetMapping("/{reviewId}/replies")
    public ResponseEntity<ApiResponse<List<ReviewReply>>> getReviewReplies(@PathVariable Integer reviewId) {
        try {
            List<ReviewReply> replies = reviewService.getReviewReplies(reviewId);
            return ResponseEntity.ok(ApiResponse.success(replies, "Lấy phản hồi đánh giá thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Test endpoint
    @GetMapping("/test")
    public String test() {
        return "Review API is working!";
    }
}