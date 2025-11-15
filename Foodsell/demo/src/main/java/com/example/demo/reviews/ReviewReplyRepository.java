package com.example.demo.reviews;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Integer> {
    
    // Lấy reply của một review cụ thể
    @Query("SELECT rr FROM ReviewReply rr WHERE rr.reviewId = :reviewId ORDER BY rr.createdAt ASC")
    List<ReviewReply> findByReviewId(@Param("reviewId") Integer reviewId);
    
    // Lấy reply của merchant cho một review cụ thể
    @Query("SELECT rr FROM ReviewReply rr WHERE rr.reviewId = :reviewId AND rr.merchantId = :merchantId")
    Optional<ReviewReply> findByReviewIdAndMerchantId(@Param("reviewId") Integer reviewId, @Param("merchantId") Integer merchantId);
    
    // Lấy tất cả reply của một merchant
    @Query("SELECT rr FROM ReviewReply rr WHERE rr.merchantId = :merchantId ORDER BY rr.createdAt DESC")
    List<ReviewReply> findByMerchantId(@Param("merchantId") Integer merchantId);
}