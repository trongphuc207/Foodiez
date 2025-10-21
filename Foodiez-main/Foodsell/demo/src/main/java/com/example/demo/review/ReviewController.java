package com.example.demo.review;

import com.example.demo.review.dto.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // ========== CUSTOMER ENDPOINTS ==========

    /**
     * ID 46: Write Review - Tạo đánh giá mới
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @RequestHeader("User-Id") Integer userId,
            @RequestHeader("User-Name") String userName) {
        
        ReviewResponse review = reviewService.createReview(request, userId, userName);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Tạo đánh giá thành công");
        response.put("data", review);
        
        return ResponseEntity.created(URI.create("/api/reviews/" + review.getId())).body(response);
    }

    /**
     * ID 48: Edit Review - Cập nhật đánh giá
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<Map<String, Object>> updateReview(
            @PathVariable Integer reviewId,
            @Valid @RequestBody UpdateReviewRequest request,
            @RequestHeader("User-Id") Integer userId) {
        
        ReviewResponse review = reviewService.updateReview(reviewId, request, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cập nhật đánh giá thành công");
        response.put("data", review);
        
        return ResponseEntity.ok(response);
    }

    /**
     * ID 49: Delete Review - Xóa đánh giá
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @PathVariable Integer reviewId,
            @RequestHeader("User-Id") Integer userId) {
        
        reviewService.deleteReview(reviewId, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Xóa đánh giá thành công");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy đánh giá của user hiện tại
     */
    @GetMapping("/my-reviews")
    public ResponseEntity<Map<String, Object>> getMyReviews(
            @RequestHeader("User-Id") Integer userId) {
        
        List<ReviewResponse> reviews = reviewService.getUserReviews(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách đánh giá thành công");
        response.put("data", reviews);
        
        return ResponseEntity.ok(response);
    }

    // ========== MERCHANT ENDPOINTS ==========

    /**
     * ID 50: View Customer Reviews - Xem đánh giá khách hàng
     */
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<Map<String, Object>> getShopReviews(
            @PathVariable Integer shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ReviewResponse> reviews = reviewService.getShopReviews(shopId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách đánh giá cửa hàng thành công");
        response.put("data", reviews.getContent());
        response.put("totalElements", reviews.getTotalElements());
        response.put("totalPages", reviews.getTotalPages());
        response.put("currentPage", reviews.getNumber());
        
        return ResponseEntity.ok(response);
    }

    /**
     * ID 51: Reply to Review - Trả lời đánh giá
     */
    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<Map<String, Object>> replyToReview(
            @PathVariable Integer reviewId,
            @Valid @RequestBody ReplyReviewRequest request,
            @RequestHeader("User-Id") Integer merchantId) {
        
        ReviewResponse review = reviewService.replyToReview(reviewId, request, merchantId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Trả lời đánh giá thành công");
        response.put("data", review);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy đánh giá chưa được trả lời
     */
    @GetMapping("/shop/{shopId}/unreplied")
    public ResponseEntity<Map<String, Object>> getUnrepliedReviews(@PathVariable Integer shopId) {
        List<ReviewResponse> reviews = reviewService.getUnrepliedReviews(shopId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách đánh giá chưa trả lời thành công");
        response.put("data", reviews);
        
        return ResponseEntity.ok(response);
    }

    // ========== ADMIN ENDPOINTS ==========

    /**
     * ID 52: View All Reviews - Xem tất cả đánh giá
     */
    @GetMapping("/admin/all")
    public ResponseEntity<Map<String, Object>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ReviewResponse> reviews = reviewService.getAllReviews(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách tất cả đánh giá thành công");
        response.put("data", reviews.getContent());
        response.put("totalElements", reviews.getTotalElements());
        response.put("totalPages", reviews.getTotalPages());
        response.put("currentPage", reviews.getNumber());
        
        return ResponseEntity.ok(response);
    }

    /**
     * ID 53: Remove Inappropriate Review - Ẩn đánh giá không phù hợp
     */
    @PutMapping("/{reviewId}/hide")
    public ResponseEntity<Map<String, Object>> hideReview(@PathVariable Integer reviewId) {
        reviewService.hideReview(reviewId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Ẩn đánh giá thành công");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa hoàn toàn đánh giá (admin only)
     */
    @DeleteMapping("/{reviewId}/permanent")
    public ResponseEntity<Map<String, Object>> deleteReviewPermanently(@PathVariable Integer reviewId) {
        reviewService.deleteReviewPermanently(reviewId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Xóa đánh giá vĩnh viễn thành công");
        
        return ResponseEntity.ok(response);
    }

    // ========== PUBLIC ENDPOINTS ==========

    /**
     * Lấy đánh giá theo sản phẩm (public)
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<Map<String, Object>> getProductReviews(
            @PathVariable Integer productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ReviewResponse> reviews = reviewService.getProductReviews(productId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách đánh giá sản phẩm thành công");
        response.put("data", reviews.getContent());
        response.put("totalElements", reviews.getTotalElements());
        response.put("totalPages", reviews.getTotalPages());
        response.put("currentPage", reviews.getNumber());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy tất cả đánh giá (public - cho trang reviews)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllReviewsPublic(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewResponse> reviews = reviewService.getAllReviews(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách đánh giá thành công");
        response.put("data", reviews.getContent());
        response.put("totalElements", reviews.getTotalElements());
        response.put("totalPages", reviews.getTotalPages());
        response.put("currentPage", reviews.getNumber());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Tính điểm trung bình của sản phẩm
     */
    @GetMapping("/product/{productId}/average")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Integer productId) {
        Double averageRating = reviewService.getAverageRating(productId);
        Long reviewCount = reviewService.getReviewCount(productId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy điểm trung bình thành công");
        response.put("data", Map.of(
            "averageRating", averageRating != null ? averageRating : 0.0,
            "reviewCount", reviewCount
        ));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Tính điểm trung bình của shop
     */
    @GetMapping("/shop/{shopId}/average")
    public ResponseEntity<Map<String, Object>> getAverageShopRating(@PathVariable Integer shopId) {
        Double averageRating = reviewService.getAverageShopRating(shopId);
        Long reviewCount = reviewService.getReviewCount(shopId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy điểm trung bình cửa hàng thành công");
        response.put("data", Map.of(
            "averageRating", averageRating != null ? averageRating : 0.0,
            "reviewCount", reviewCount
        ));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Tìm kiếm đánh giá
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchReviews(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewResponse> reviews = reviewService.searchReviews(keyword, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Tìm kiếm đánh giá thành công");
        response.put("data", reviews.getContent());
        response.put("totalElements", reviews.getTotalElements());
        response.put("totalPages", reviews.getTotalPages());
        response.put("currentPage", reviews.getNumber());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy đánh giá theo khoảng điểm
     */
    @GetMapping("/product/{productId}/rating-range")
    public ResponseEntity<Map<String, Object>> getReviewsByRatingRange(
            @PathVariable Integer productId,
            @RequestParam Integer minRating,
            @RequestParam Integer maxRating) {
        
        List<ReviewResponse> reviews = reviewService.getReviewsByRatingRange(productId, minRating, maxRating);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy đánh giá theo khoảng điểm thành công");
        response.put("data", reviews);
        
        return ResponseEntity.ok(response);
    }

    // ========== COMPLAINT ENDPOINTS ==========

    /**
     * ID 54: Resolve Review Complaint - Tạo khiếu nại mới
     */
    @PostMapping("/{reviewId}/complaint")
    public ResponseEntity<Map<String, Object>> createComplaint(
            @PathVariable Integer reviewId,
            @RequestParam String complaintType,
            @RequestParam String complaintReason,
            @RequestParam(required = false) String complaintDetails,
            @RequestHeader("User-Id") Integer userId,
            @RequestHeader("User-Name") String userName) {
        
        try {
            ReviewResponse review = reviewService.createComplaint(
                reviewId, complaintType, complaintReason, complaintDetails, userId, userName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Khiếu nại đã được gửi thành công");
            response.put("data", review);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy tất cả khiếu nại (Admin)
     */
    @GetMapping("/complaints")
    public ResponseEntity<Map<String, Object>> getAllComplaints() {
        try {
            List<Complaint> complaints = reviewService.getAllComplaints();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách khiếu nại thành công");
            response.put("data", complaints);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách khiếu nại: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Lấy khiếu nại chưa được xử lý
     */
    @GetMapping("/complaints/unresolved")
    public ResponseEntity<Map<String, Object>> getUnresolvedComplaints() {
        try {
            List<Complaint> complaints = reviewService.getUnresolvedComplaints();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách khiếu nại chưa xử lý thành công");
            response.put("data", complaints);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách khiếu nại: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Lấy khiếu nại theo trạng thái
     */
    @GetMapping("/complaints/status/{status}")
    public ResponseEntity<Map<String, Object>> getComplaintsByStatus(@PathVariable String status) {
        try {
            List<Complaint> complaints = reviewService.getComplaintsByStatus(status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách khiếu nại theo trạng thái thành công");
            response.put("data", complaints);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Trạng thái không hợp lệ");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy khiếu nại theo review ID
     */
    @GetMapping("/{reviewId}/complaints")
    public ResponseEntity<Map<String, Object>> getComplaintsByReviewId(@PathVariable Integer reviewId) {
        try {
            List<Complaint> complaints = reviewService.getComplaintsByReviewId(reviewId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách khiếu nại theo review thành công");
            response.put("data", complaints);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách khiếu nại: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Lấy khiếu nại của user
     */
    @GetMapping("/complaints/my-complaints")
    public ResponseEntity<Map<String, Object>> getUserComplaints(@RequestHeader("User-Id") Integer userId) {
        try {
            List<Complaint> complaints = reviewService.getUserComplaints(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách khiếu nại của bạn thành công");
            response.put("data", complaints);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách khiếu nại: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Giải quyết khiếu nại (Admin)
     */
    @PutMapping("/complaints/{complaintId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveComplaint(
            @PathVariable Integer complaintId,
            @RequestParam String status,
            @RequestParam(required = false) String adminNotes,
            @RequestParam(required = false) String resolution,
            @RequestHeader("User-Id") Integer adminId) {
        
        try {
            ReviewResponse review = reviewService.resolveComplaint(
                complaintId, status, adminNotes, resolution, adminId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Giải quyết khiếu nại thành công");
            response.put("data", review);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Thống kê khiếu nại
     */
    @GetMapping("/complaints/stats")
    public ResponseEntity<Map<String, Object>> getComplaintStats() {
        try {
            Map<String, Long> stats = reviewService.getComplaintStats();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy thống kê khiếu nại thành công");
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy thống kê: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
