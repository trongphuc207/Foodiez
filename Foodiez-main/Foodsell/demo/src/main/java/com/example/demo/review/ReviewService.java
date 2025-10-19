package com.example.demo.review;

import com.example.demo.review.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private ComplaintRepository complaintRepository;

    // ========== CUSTOMER USE CASES ==========

    /**
     * ID 46: Write Review - Khách hàng viết đánh giá sản phẩm
     */
    public ReviewResponse createReview(CreateReviewRequest request, Integer userId, String userName) {
        // Kiểm tra xem user đã đánh giá sản phẩm này chưa
        Optional<Review> existingReview = reviewRepository.findByProductIdAndUserId(request.getProductId(), userId);
        if (existingReview.isPresent()) {
            throw new IllegalArgumentException("Bạn đã đánh giá sản phẩm này rồi!");
        }

        Review review = new Review();
        review.setProductId(request.getProductId());
        review.setShopId(request.getShopId());
        review.setUserId(userId);
        review.setUserName(userName);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setImageUrl(request.getImageUrl());
        review.setOrderId(request.getOrderId());
        review.setIsVerified(request.getOrderId() != null); // Xác thực nếu có orderId
        review.setStatus(Review.ReviewStatus.ACTIVE);

        Review savedReview = reviewRepository.save(review);
        return new ReviewResponse(savedReview);
    }

    /**
     * ID 48: Edit Review - Khách hàng chỉnh sửa đánh giá
     */
    public ReviewResponse updateReview(Integer reviewId, UpdateReviewRequest request, Integer userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));

        // Kiểm tra quyền sở hữu
        if (!review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa đánh giá này");
        }

        if (review.getStatus() != Review.ReviewStatus.ACTIVE) {
            throw new IllegalArgumentException("Không thể chỉnh sửa đánh giá đã bị ẩn hoặc xóa");
        }

        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }
        if (request.getImageUrl() != null) {
            review.setImageUrl(request.getImageUrl());
        }

        Review updatedReview = reviewRepository.save(review);
        return new ReviewResponse(updatedReview);
    }

    /**
     * ID 49: Delete Review - Khách hàng xóa đánh giá
     */
    public void deleteReview(Integer reviewId, Integer userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));

        // Kiểm tra quyền sở hữu
        if (!review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa đánh giá này");
        }

        // Soft delete - đánh dấu là DELETED thay vì xóa thật
        review.setStatus(Review.ReviewStatus.DELETED);
        reviewRepository.save(review);
    }

    /**
     * Lấy đánh giá của user
     */
    public List<ReviewResponse> getUserReviews(Integer userId) {
        List<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return reviews.stream()
                .map(ReviewResponse::new)
                .collect(Collectors.toList());
    }

    // ========== MERCHANT USE CASES ==========

    /**
     * ID 50: View Customer Reviews - Merchant xem đánh giá khách hàng
     */
    public Page<ReviewResponse> getShopReviews(Integer shopId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findActiveReviewsByShopId(shopId, pageable);
        return reviews.map(ReviewResponse::new);
    }

    /**
     * ID 51: Reply to Review - Merchant trả lời đánh giá
     */
    public ReviewResponse replyToReview(Integer reviewId, ReplyReviewRequest request, Integer merchantId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));

        // Kiểm tra quyền (merchant chỉ có thể trả lời review của shop mình)
        // TODO: Cần kiểm tra merchantId có thuộc shopId không
        if (review.getStatus() != Review.ReviewStatus.ACTIVE) {
            throw new IllegalArgumentException("Không thể trả lời đánh giá đã bị ẩn hoặc xóa");
        }

        if (review.getMerchantReply() != null) {
            throw new IllegalArgumentException("Đã trả lời đánh giá này rồi");
        }

        review.setMerchantReply(request.getContent());
        Review updatedReview = reviewRepository.save(review);
        return new ReviewResponse(updatedReview);
    }

    /**
     * Lấy đánh giá chưa được trả lời
     */
    public List<ReviewResponse> getUnrepliedReviews(Integer shopId) {
        List<Review> reviews = reviewRepository.findReviewsWithoutRepliesByShopId(shopId);
        return reviews.stream()
                .map(ReviewResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Lấy đánh giá đã được trả lời
     */
    public List<ReviewResponse> getRepliedReviews(Integer shopId) {
        List<Review> reviews = reviewRepository.findReviewsWithRepliesByShopId(shopId);
        return reviews.stream()
                .map(ReviewResponse::new)
                .collect(Collectors.toList());
    }

    // ========== ADMIN USE CASES ==========

    /**
     * ID 52: View All Reviews - Admin xem tất cả đánh giá
     */
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        Page<Review> reviews = reviewRepository.findAllActiveReviews(pageable);
        return reviews.map(ReviewResponse::new);
    }

    /**
     * ID 53: Remove Inappropriate Review - Admin ẩn đánh giá không phù hợp
     */
    public void hideReview(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));

        review.setStatus(Review.ReviewStatus.HIDDEN);
        reviewRepository.save(review);
    }

    /**
     * Admin xóa hoàn toàn đánh giá
     */
    public void deleteReviewPermanently(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));

        reviewRepository.delete(review);
    }

    // ========== PUBLIC USE CASES ==========

    /**
     * Lấy đánh giá theo sản phẩm (cho khách hàng xem)
     */
    public List<ReviewResponse> getProductReviews(Integer productId) {
        List<Review> reviews = reviewRepository.findActiveReviewsByProductId(productId);
        return reviews.stream()
                .map(ReviewResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Lấy đánh giá theo sản phẩm với phân trang
     */
    public Page<ReviewResponse> getProductReviews(Integer productId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findActiveReviewsByProductId(productId, pageable);
        return reviews.map(ReviewResponse::new);
    }

    /**
     * Tính điểm trung bình của sản phẩm
     */
    public Double getAverageRating(Integer productId) {
        return reviewRepository.getAverageRatingByProductId(productId);
    }

    /**
     * Tính điểm trung bình của shop
     */
    public Double getAverageShopRating(Integer shopId) {
        return reviewRepository.getAverageRatingByShopId(shopId);
    }

    /**
     * Đếm số lượng đánh giá
     */
    public Long getReviewCount(Integer productId) {
        return reviewRepository.countActiveReviewsByProductId(productId);
    }

    /**
     * Tìm kiếm đánh giá theo nội dung
     */
    public Page<ReviewResponse> searchReviews(String keyword, Pageable pageable) {
        Page<Review> reviews = reviewRepository.searchReviewsByComment(keyword, pageable);
        return reviews.map(ReviewResponse::new);
    }

    /**
     * Lấy đánh giá theo khoảng điểm
     */
    public List<ReviewResponse> getReviewsByRatingRange(Integer productId, Integer minRating, Integer maxRating) {
        List<Review> reviews = reviewRepository.findReviewsByProductIdAndRatingRange(productId, minRating, maxRating);
        return reviews.stream()
                .map(ReviewResponse::new)
                .collect(Collectors.toList());
    }

    // ========== COMPLAINT MANAGEMENT ==========

    /**
     * ID 54: Resolve Review Complaint - Admin xử lý khiếu nại về review
     */
    public ReviewResponse createComplaint(Integer reviewId, String complaintType, String complaintReason, 
                                        String complaintDetails, Integer reporterId, String reporterName) {
        // Kiểm tra review có tồn tại không
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isEmpty()) {
            throw new IllegalArgumentException("Review không tồn tại");
        }
        
        // Kiểm tra user đã khiếu nại review này chưa
        List<Complaint> existingComplaints = complaintRepository.findByReviewIdAndReporterId(reviewId, reporterId);
        if (!existingComplaints.isEmpty()) {
            throw new IllegalArgumentException("Bạn đã khiếu nại review này rồi");
        }
        
        // Tạo khiếu nại mới
        Complaint.ComplaintType type = Complaint.ComplaintType.valueOf(complaintType);
        Complaint complaint = new Complaint(reviewId, type, complaintReason, reporterId, reporterName);
        
        if (complaintDetails != null && !complaintDetails.trim().isEmpty()) {
            complaint.setComplaintDetails(complaintDetails.trim());
        }
        
        Complaint savedComplaint = complaintRepository.save(complaint);
        
        // Cập nhật thông tin khiếu nại trong review
        Review review = reviewOpt.get();
        review.setComplaintCount(review.getComplaintCount() + 1);
        review.setLastComplaintAt(savedComplaint.getCreatedAt());
        review.setComplaintStatus(Review.ComplaintStatus.PENDING);
        reviewRepository.save(review);
        
        return new ReviewResponse(review);
    }

    /**
     * Lấy tất cả khiếu nại (Admin)
     */
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    /**
     * Lấy khiếu nại chưa được xử lý
     */
    public List<Complaint> getUnresolvedComplaints() {
        return complaintRepository.findUnresolvedComplaints();
    }

    /**
     * Lấy khiếu nại theo trạng thái
     */
    public List<Complaint> getComplaintsByStatus(String status) {
        Complaint.ComplaintStatus complaintStatus = Complaint.ComplaintStatus.valueOf(status.toUpperCase());
        return complaintRepository.findByStatusOrderByCreatedAtDesc(complaintStatus);
    }

    /**
     * Lấy khiếu nại theo review ID
     */
    public List<Complaint> getComplaintsByReviewId(Integer reviewId) {
        return complaintRepository.findByReviewIdOrderByCreatedAtDesc(reviewId);
    }

    /**
     * Lấy khiếu nại của user
     */
    public List<Complaint> getUserComplaints(Integer userId) {
        return complaintRepository.findByReporterIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Giải quyết khiếu nại (Admin)
     */
    public ReviewResponse resolveComplaint(Integer complaintId, String status, String adminNotes, 
                                         String resolution, Integer adminId) {
        Optional<Complaint> complaintOpt = complaintRepository.findById(complaintId);
        if (complaintOpt.isEmpty()) {
            throw new IllegalArgumentException("Khiếu nại không tồn tại");
        }
        
        Complaint complaint = complaintOpt.get();
        Complaint.ComplaintStatus complaintStatus = Complaint.ComplaintStatus.valueOf(status.toUpperCase());
        
        // Cập nhật thông tin giải quyết
        complaint.setStatus(complaintStatus);
        complaint.setAdminNotes(adminNotes);
        complaint.setResolution(resolution);
        complaint.setResolvedBy(adminId);
        complaint.setResolvedAt(java.time.LocalDateTime.now());
        
        Complaint savedComplaint = complaintRepository.save(complaint);
        
        // Cập nhật trạng thái khiếu nại trong review
        Optional<Review> reviewOpt = reviewRepository.findById(complaint.getReviewId());
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            
            // Cập nhật trạng thái khiếu nại
            if (complaintStatus == Complaint.ComplaintStatus.RESOLVED) {
                review.setComplaintStatus(Review.ComplaintStatus.RESOLVED);
                review.setComplaintResolution(resolution);
                review.setComplaintResolvedBy(adminId);
                review.setComplaintResolvedAt(savedComplaint.getResolvedAt());
                
                // Nếu giải pháp yêu cầu ẩn review
                if (resolution != null && resolution.toLowerCase().contains("ẩn review")) {
                    review.setStatus(Review.ReviewStatus.HIDDEN);
                }
            } else if (complaintStatus == Complaint.ComplaintStatus.REJECTED) {
                review.setComplaintStatus(Review.ComplaintStatus.REJECTED);
            } else if (complaintStatus == Complaint.ComplaintStatus.UNDER_REVIEW) {
                review.setComplaintStatus(Review.ComplaintStatus.UNDER_REVIEW);
            }
            
            review.setAdminComplaintNotes(adminNotes);
            reviewRepository.save(review);
            
            return new ReviewResponse(review);
        }
        
        throw new IllegalArgumentException("Review không tồn tại");
    }

    /**
     * Thống kê khiếu nại
     */
    public java.util.Map<String, Long> getComplaintStats() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("pending", complaintRepository.countByStatus(Complaint.ComplaintStatus.PENDING));
        stats.put("underReview", complaintRepository.countByStatus(Complaint.ComplaintStatus.UNDER_REVIEW));
        stats.put("resolved", complaintRepository.countByStatus(Complaint.ComplaintStatus.RESOLVED));
        stats.put("rejected", complaintRepository.countByStatus(Complaint.ComplaintStatus.REJECTED));
        stats.put("closed", complaintRepository.countByStatus(Complaint.ComplaintStatus.CLOSED));
        return stats;
    }
}