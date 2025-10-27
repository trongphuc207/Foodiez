package com.example.demo.reviews;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private ReviewReplyRepository reviewReplyRepository;
    
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
        
        Review review = new Review(customerId, finalProductId, shopId, finalOrderId, rating, content);
        return reviewRepository.save(review);
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
        return reviewRepository.findByShopIdAndVisible(shopId);
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
    public void resolveReviewComplaint(Integer reviewId, String resolution) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (!reviewOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy review!");
        }
        
        Review review = reviewOpt.get();
        // Có thể thêm field resolution vào Review entity nếu cần
        // Tạm thời chỉ cập nhật updatedAt
        review.setUpdatedAt(java.time.LocalDateTime.now());
        reviewRepository.save(review);
    }
    
    // ===== ADDITIONAL HELPER METHODS =====
    
    // Lấy review theo ID
    public Optional<Review> getReviewById(Integer reviewId) {
        return reviewRepository.findById(reviewId);
    }
    
    // Lấy review của sản phẩm
    public List<Review> getProductReviews(Integer productId) {
        return reviewRepository.findByProductIdAndVisible(productId);
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
