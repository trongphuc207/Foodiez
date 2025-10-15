package com.example.demo.review;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ReviewService {
    private final ReviewRepository reviewRepo;
    private final ShopReviewRepository shopReviewRepo;

    public ReviewService(ReviewRepository reviewRepo, ShopReviewRepository shopReviewRepo) {
        this.reviewRepo = reviewRepo;
        this.shopReviewRepo = shopReviewRepo;
    }

    // product reviews
    public Review createProductReview(Review review) { return reviewRepo.save(review); }
    public List<Review> listProductReviews(Long productId) { return reviewRepo.findByProductIdOrderByCreatedAtDesc(productId); }
    public void deleteProductReview(Long id) { reviewRepo.deleteById(id); }
    public double averageProductRating(Long productId) {
        Double a = reviewRepo.getAverageRatingByProductId(productId);
        return a == null ? 0.0 : a;
    }

    // shop reviews
    public ShopReview createShopReview(ShopReview r) { return shopReviewRepo.save(r); }
    public List<ShopReview> listShopReviews(Long shopId) { return shopReviewRepo.findByShopIdOrderByCreatedAtDesc(shopId); }
    public void deleteShopReview(Long id) { shopReviewRepo.deleteById(id); }
    public double averageShopRating(Long shopId) {
        Double a = shopReviewRepo.getAverageRatingByShopId(shopId);
        return a == null ? 0.0 : a;
    }
}
