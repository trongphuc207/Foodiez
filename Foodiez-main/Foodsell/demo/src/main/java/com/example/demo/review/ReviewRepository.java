package com.example.demo.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    // Find reviews by product (for customers to view)
    @Query("SELECT r FROM Review r WHERE r.productId = :productId AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    List<Review> findActiveReviewsByProductId(@Param("productId") Integer productId);
    
    @Query("SELECT r FROM Review r WHERE r.productId = :productId AND r.status = 'ACTIVE'")
    Page<Review> findActiveReviewsByProductId(@Param("productId") Integer productId, Pageable pageable);

    // Find reviews by shop (for merchants to view)
    @Query("SELECT r FROM Review r WHERE r.shopId = :shopId AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    List<Review> findActiveReviewsByShopId(@Param("shopId") Integer shopId);
    
    @Query("SELECT r FROM Review r WHERE r.shopId = :shopId AND r.status = 'ACTIVE'")
    Page<Review> findActiveReviewsByShopId(@Param("shopId") Integer shopId, Pageable pageable);

    // Find reviews by user (for customers to manage their reviews)
    @Query("SELECT r FROM Review r WHERE r.userId = :userId ORDER BY r.createdAt DESC")
    List<Review> findByUserIdOrderByCreatedAtDesc(@Param("userId") Integer userId);

    // Find all active reviews (for admin)
    @Query("SELECT r FROM Review r WHERE r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    Page<Review> findAllActiveReviews(Pageable pageable);

    // Check if user already reviewed a product
    @Query("SELECT r FROM Review r WHERE r.productId = :productId AND r.userId = :userId AND r.status = 'ACTIVE'")
    Optional<Review> findByProductIdAndUserId(@Param("productId") Integer productId, @Param("userId") Integer userId);

    // Average rating calculations
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = :productId AND r.status = 'ACTIVE'")
    Double getAverageRatingByProductId(@Param("productId") Integer productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.shopId = :shopId AND r.status = 'ACTIVE'")
    Double getAverageRatingByShopId(@Param("shopId") Integer shopId);

    // Count reviews
    @Query("SELECT COUNT(r) FROM Review r WHERE r.productId = :productId AND r.status = 'ACTIVE'")
    Long countActiveReviewsByProductId(@Param("productId") Integer productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.shopId = :shopId AND r.status = 'ACTIVE'")
    Long countActiveReviewsByShopId(@Param("shopId") Integer shopId);

    // Find reviews with merchant replies
    @Query("SELECT r FROM Review r WHERE r.shopId = :shopId AND r.merchantReply IS NOT NULL AND r.status = 'ACTIVE' ORDER BY r.merchantReplyAt DESC")
    List<Review> findReviewsWithRepliesByShopId(@Param("shopId") Integer shopId);

    // Find reviews without merchant replies (for merchants to reply)
    @Query("SELECT r FROM Review r WHERE r.shopId = :shopId AND r.merchantReply IS NULL AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    List<Review> findReviewsWithoutRepliesByShopId(@Param("shopId") Integer shopId);

    // Search reviews by comment content
    @Query("SELECT r FROM Review r WHERE r.comment LIKE %:keyword% AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    Page<Review> searchReviewsByComment(@Param("keyword") String keyword, Pageable pageable);

    // Find reviews by rating range
    @Query("SELECT r FROM Review r WHERE r.productId = :productId AND r.rating >= :minRating AND r.rating <= :maxRating AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    List<Review> findReviewsByProductIdAndRatingRange(@Param("productId") Integer productId, @Param("minRating") Integer minRating, @Param("maxRating") Integer maxRating);
}
