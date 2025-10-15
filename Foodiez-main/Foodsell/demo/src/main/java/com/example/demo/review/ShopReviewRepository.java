package com.example.demo.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ShopReviewRepository extends JpaRepository<ShopReview, Long> {
    List<ShopReview> findByShopIdOrderByCreatedAtDesc(Long shopId);
    List<ShopReview> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("select avg(r.rating) from ShopReview r where r.shopId = :shopId")
    Double getAverageRatingByShopId(Long shopId);
}
