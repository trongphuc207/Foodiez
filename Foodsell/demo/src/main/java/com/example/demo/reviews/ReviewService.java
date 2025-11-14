package com.example.demo.reviews;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import com.example.demo.notifications.NotificationService;
import com.example.demo.shops.ShopRepository;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private ReviewReplyRepository reviewReplyRepository;
    
    @Autowired
    private com.example.demo.Orders.OrderItemRepository orderItemRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private ShopRepository shopRepository;
    
    // ===== CUSTOMER USE CASES =====
    
    // UC46: Write Review - Customer viết review cho sản phẩm sau khi mua hàng thành công
    public Review writeReview(Integer customerId, Integer productId, Integer shopId, 
                             Integer orderId, Integer rating, String content) {
        // Kiểm tra rating hợp lệ (1-5)
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating phải từ 1 đến 5 sao!");
        }
        
        // Nếu là review shop (productId = -1), sử dụng productId = 1 (Pho Bo) để tránh foreign key constraint
        Integer finalProductId = (productId == -1) ? 1 : productId;
        // Bắt buộc: orderId phải hợp lệ và thuộc về customer, có chứa đúng product
        if (orderId == null || orderId <= 0) {
            throw new RuntimeException("Thiếu mã đơn hàng (orderId)");
        }
        boolean canReview = orderItemRepository.existsForCustomerAndProduct(orderId, finalProductId, customerId);
        if (!canReview) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sản phẩm đã mua trong đơn hàng này");
        }
        
        // orderId là optional - có thể null
        Integer finalOrderId = orderId;
        if (orderId != null && orderId <= 0) {
            finalOrderId = null;
        }
        
        // Kiểm tra xem khách hàng đã đánh giá sản phẩm/shop này chưa
        Optional<Review> existingReview = reviewRepository.findByCustomerIdAndShopIdAndProductId(customerId, shopId, finalProductId);
        if (existingReview.isPresent()) {
            if (productId == -1) {
                throw new RuntimeException("Bạn đã đánh giá shop này rồi. Vui lòng sử dụng chức năng chỉnh sửa đánh giá.");
            } else {
                throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi. Vui lòng sử dụng chức năng chỉnh sửa đánh giá.");
            }
        }
        // Chặn trùng theo (customer, product, order)
        if (reviewRepository.existsByCustomerIdAndProductIdAndOrderId(customerId, finalProductId, finalOrderId)) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi");
        }

        Review review = new Review(customerId, finalProductId, shopId, finalOrderId, rating, content);
        // Đảm bảo isVisible luôn được set là true
        review.setIsVisible(true);
        return reviewRepository.save(review);
    }

    // Overload: write review with image URL
    public Review writeReview(Integer customerId, Integer productId, Integer shopId,
                              Integer orderId, Integer rating, String content, String imageUrl) {
        Review base = writeReview(customerId, productId, shopId, orderId, rating, content);
        base.setImageUrl(imageUrl);
        // Đảm bảo isVisible vẫn là true
        base.setIsVisible(true);
        return reviewRepository.save(base);
    }
    
    // UC47: Rate Product - Customer đánh giá sao (1-5) khi viết review
    // (Đã được tích hợp trong writeReview method)
    
    // UC48: Edit Review - Customer chỉnh sửa review đã viết
    public Review editReview(Integer reviewId, Integer customerId, Integer rating, String content) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (!reviewOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy review!");
        }
        
        Review review = reviewOpt.get();
        
        // Kiểm tra quyền sở hữu
        if (!review.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa review này!");
        }
        
        // Kiểm tra rating hợp lệ
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating phải từ 1 đến 5 sao!");
        }
        
        review.setRating(rating);
        review.setContent(content);
        review.setUpdatedAt(java.time.LocalDateTime.now());
        
        return reviewRepository.save(review);
    }
    
    // UC49: Delete Review - Customer xóa review của mình
    public void deleteReview(Integer reviewId, Integer customerId) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (!reviewOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy review!");
        }
        
        Review review = reviewOpt.get();
        
        // Kiểm tra quyền sở hữu
        if (!review.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền xóa review này!");
        }
        
        // Xóa tất cả reply liên quan
        List<ReviewReply> replies = reviewReplyRepository.findByReviewId(reviewId);
        reviewReplyRepository.deleteAll(replies);
        
        // Xóa review
        reviewRepository.delete(review);
    }
    
    // ===== MERCHANT USE CASES =====
    
    // UC50: View Customer Reviews - Merchant xem tất cả review của shop
    public List<Review> getShopReviews(Integer shopId) {
        try {
            System.out.println("🔍 ReviewService.getShopReviews - shopId: " + shopId);
            List<Review> reviews = reviewRepository.findByShopIdAndVisible(shopId);
            System.out.println("✅ ReviewService.getShopReviews - found " + reviews.size() + " reviews");
            return reviews;
        } catch (Exception e) {
            System.err.println("❌ ReviewService.getShopReviews - Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    // UC51: Reply to Review - Merchant trả lời review của customer
    public ReviewReply replyToReview(Integer reviewId, Integer merchantId, String content) {
        // Kiểm tra review có tồn tại không
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (!reviewOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy review!");
        }
        
        // Kiểm tra merchant có quyền reply không (phải là owner của shop)
        // Note: Cần implement logic kiểm tra merchant có phải owner của shop không
        // Tạm thời bỏ qua check này, sẽ implement sau
        
        // Kiểm tra đã reply chưa
        Optional<ReviewReply> existingReply = reviewReplyRepository.findByReviewIdAndMerchantId(reviewId, merchantId);
        if (existingReply.isPresent()) {
            throw new RuntimeException("Bạn đã trả lời review này rồi!");
        }
        
        ReviewReply reply = new ReviewReply(reviewId, merchantId, content);
        return reviewReplyRepository.save(reply);
    }
    
    // ===== ADMIN USE CASES =====
    
    // UC52: View All Reviews - Admin xem tất cả review trên platform
    public List<Review> getAllReviews() {
        return reviewRepository.findAllOrderByCreatedAtDesc();
    }
    
    // UC52 Extended: Get reviews with filter
    public List<Review> getAllReviews(String status, String keyword) {
        if (status != null && !status.trim().isEmpty() && keyword != null && !keyword.trim().isEmpty()) {
            return reviewRepository.searchReviews(status.trim(), keyword.trim());
        } else if (status != null && !status.trim().isEmpty()) {
            return reviewRepository.findByStatusOrderByCreatedAtDesc(status.trim());
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            return reviewRepository.searchReviews(null, keyword.trim());
        }
        return reviewRepository.findAllOrderByCreatedAtDesc();
    }
    
    // Get review statistics
    public Map<String, Long> getReviewStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", reviewRepository.count());
        stats.put("pending", reviewRepository.countByStatus("PENDING"));
        stats.put("resolved", reviewRepository.countByStatus("RESOLVED"));
        stats.put("rejected", reviewRepository.countByStatus("REJECTED"));
        return stats;
    }
    
    // UC53: Remove Inappropriate Review - Admin ẩn/xóa review vi phạm
    public void hideReview(Integer reviewId) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (!reviewOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy review!");
        }
        
        Review review = reviewOpt.get();
        review.setIsVisible(false);
        review.setUpdatedAt(java.time.LocalDateTime.now());
        reviewRepository.save(review);
    }
    
    // UC54: Resolve Review Complaint - Admin xử lý khiếu nại về review
    @Transactional
    public void resolveReviewComplaint(Integer reviewId, String resolution, String status, Boolean shouldHide) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
            if (!reviewOpt.isPresent()) {
                throw new RuntimeException("Không tìm thấy review!");
            }
            
            Review review = reviewOpt.get();
            
            // Cập nhật resolution notes
            if (resolution != null) {
                String trimmed = resolution.trim();
                review.setResolutionNotes(trimmed.isEmpty() ? null : trimmed);
            } else {
                review.setResolutionNotes(null);
            }
            
            // Cập nhật status
            if (status != null && !status.trim().isEmpty()) {
                String statusUpper = status.trim().toUpperCase();
                if (statusUpper.equals("PENDING") || statusUpper.equals("RESOLVED") || statusUpper.equals("REJECTED")) {
                    review.setStatus(statusUpper);
                } else {
                    // Nếu status không hợp lệ, giữ nguyên status hiện tại
                    if (review.getStatus() == null) {
                        review.setStatus("PENDING");
                    }
                }
            } else {
                // Nếu không có status mới, giữ nguyên status hiện tại hoặc set mặc định
                if (review.getStatus() == null || review.getStatus().trim().isEmpty()) {
                    review.setStatus("PENDING");
                }
            }
            
            // Tự động ẩn review nếu bị từ chối (REJECTED) hoặc admin chọn ẩn
            if (shouldHide != null && shouldHide) {
                review.setIsVisible(false);
            } else if ("REJECTED".equals(review.getStatus())) {
                review.setIsVisible(false);
            }
            
            review.setUpdatedAt(java.time.LocalDateTime.now());
            
            // Đảm bảo status không null trước khi save
            if (review.getStatus() == null || review.getStatus().trim().isEmpty()) {
                review.setStatus("PENDING");
            }
            
            // Đảm bảo isVisible không null
            if (review.getIsVisible() == null) {
                review.setIsVisible(true);
            }
            
            reviewRepository.save(review);
        } catch (Exception e) {
            System.err.println("Error in resolveReviewComplaint: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể cập nhật review: " + e.getMessage(), e);
        }
    }
    
    // Gửi notification sau khi resolve (gọi riêng từ controller)
    public void sendNotificationAfterResolve(Integer reviewId) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
            if (!reviewOpt.isPresent()) {
                return;
            }
            Review review = reviewOpt.get();
            sendNotificationAfterResolve(review);
        } catch (Exception e) {
            System.err.println("Failed to load review for notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Tách method gửi notification ra khỏi transaction chính
    @Transactional(propagation = Propagation.REQUIRES_NEW, noRollbackFor = Exception.class)
    private void sendNotificationAfterResolve(Review review) {
        // Gửi notification cho buyer (customer)
        try {
            Integer customerId = review.getCustomerId();
            String notificationMessage = "Admin đã xử lý bình luận của bạn";
            if (review.getResolutionNotes() != null && !review.getResolutionNotes().isEmpty()) {
                notificationMessage += " với lí do: " + review.getResolutionNotes();
            }
            if (review.getIsVisible() != null && !review.getIsVisible()) {
                notificationMessage = "Admin đã ẩn bình luận của bạn";
                if (review.getResolutionNotes() != null && !review.getResolutionNotes().isEmpty()) {
                    notificationMessage += " với lí do: " + review.getResolutionNotes();
                }
            }
            notificationService.createNotification(
                customerId,
                "REVIEW",
                "Xử lý đánh giá",
                notificationMessage
            );
        } catch (Exception e) {
            System.err.println("Failed to send notification to buyer: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Gửi notification cho seller (merchant)
        try {
            Optional<com.example.demo.shops.Shop> shopOpt = shopRepository.findById(review.getShopId());
            if (shopOpt.isPresent()) {
                Integer sellerId = shopOpt.get().getSellerId();
                String notificationMessage = "Admin đã xử lý bình luận của khách hàng #" + review.getCustomerId();
                if (review.getResolutionNotes() != null && !review.getResolutionNotes().isEmpty()) {
                    notificationMessage += " với lí do: " + review.getResolutionNotes();
                }
                if (review.getIsVisible() != null && !review.getIsVisible()) {
                    notificationMessage = "Admin đã ẩn bình luận của khách hàng #" + review.getCustomerId();
                    if (review.getResolutionNotes() != null && !review.getResolutionNotes().isEmpty()) {
                        notificationMessage += " với lí do: " + review.getResolutionNotes();
                    }
                }
                notificationService.createNotification(
                    sellerId,
                    "REVIEW",
                    "Xử lý đánh giá",
                    notificationMessage
                );
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification to seller: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // ===== ADDITIONAL HELPER METHODS =====
    
    // Lấy review theo ID
    public Optional<Review> getReviewById(Integer reviewId) {
        return reviewRepository.findById(reviewId);
    }
    
    // Lấy review của sản phẩm
    public List<Review> getProductReviews(Integer productId) {
        try {
            System.out.println("🔍 ReviewService.getProductReviews - productId: " + productId);
            List<Review> reviews = reviewRepository.findByProductIdAndVisible(productId);
            System.out.println("✅ ReviewService.getProductReviews - found " + reviews.size() + " reviews");
            return reviews;
        } catch (Exception e) {
            System.err.println("❌ ReviewService.getProductReviews - Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    // Lấy review của customer
    public List<Review> getCustomerReviews(Integer customerId) {
        return reviewRepository.findByCustomerId(customerId);
    }
    
    // Tính rating trung bình của sản phẩm
    public Integer getProductAverageRating(Integer productId) {
        Integer avgRating = reviewRepository.getAverageRatingByProductId(productId);
        return avgRating != null ? avgRating : 0;
    }
    
    // Tính rating trung bình của shop
    public Integer getShopAverageRating(Integer shopId) {
        Integer avgRating = reviewRepository.getAverageRatingByShopId(shopId);
        return avgRating != null ? avgRating : 0;
    }
    
    // Đếm số review của sản phẩm
    public Long getProductReviewCount(Integer productId) {
        return reviewRepository.countByProductIdAndVisible(productId);
    }
    
    // Đếm số review của shop
    public Long getShopReviewCount(Integer shopId) {
        return reviewRepository.countByShopIdAndVisible(shopId);
    }
    
    // Lấy reply của review
    public List<ReviewReply> getReviewReplies(Integer reviewId) {
        return reviewReplyRepository.findByReviewId(reviewId);
    }
}

