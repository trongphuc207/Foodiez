package com.example.demo.reviews;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    // Lấy tất cả review của một sản phẩm (visible only)
    @Query(value = "SELECT id, customer_id, product_id, shop_id, order_id, rating, content, image_url, is_visible, created_at, updated_at FROM reviews WHERE product_id = :productId AND (is_visible = 1 OR is_visible IS NULL) ORDER BY created_at DESC", nativeQuery = true)
    List<Review> findByProductIdAndVisible(@Param("productId") Integer productId);
    
    // Lấy tất cả review của một shop (có shop_id trong bảng reviews)
    @Query(value = "SELECT id, customer_id, product_id, shop_id, order_id, rating, content, image_url, is_visible, created_at, updated_at FROM reviews WHERE shop_id = :shopId AND (is_visible = 1 OR is_visible IS NULL) ORDER BY created_at DESC", nativeQuery = true)
    List<Review> findByShopIdAndVisible(@Param("shopId") Integer shopId);
    
    // Lấy review của customer cho một sản phẩm cụ thể
    @Query("SELECT r FROM Review r WHERE r.customerId = :customerId AND r.productId = :productId")
    Optional<Review> findByCustomerIdAndProductId(@Param("customerId") Integer customerId, @Param("productId") Integer productId);
    
    // Lấy review của customer cho một shop cụ thể (shop review)
    @Query("SELECT r FROM Review r WHERE r.customerId = :customerId AND r.shopId = :shopId AND r.productId = :productId")
    Optional<Review> findByCustomerIdAndShopIdAndProductId(@Param("customerId") Integer customerId, @Param("shopId") Integer shopId, @Param("productId") Integer productId);
    
    // Lấy review của customer cho một order cụ thể
    @Query("SELECT r FROM Review r WHERE r.customerId = :customerId AND r.orderId = :orderId")
    Optional<Review> findByCustomerIdAndOrderId(@Param("customerId") Integer customerId, @Param("orderId") Integer orderId);
    
    // Lấy tất cả review của một customer
    @Query("SELECT r FROM Review r WHERE r.customerId = :customerId ORDER BY r.createdAt DESC")
    List<Review> findByCustomerId(@Param("customerId") Integer customerId);
    
    // Lấy tất cả review (admin only - bao gồm cả invisible)
    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    List<Review> findAllOrderByCreatedAtDesc();
    
    // Tính rating trung bình của một sản phẩm (chỉ tính reviews visible)
    @Query(value = "SELECT CAST(ROUND(AVG(CAST(rating AS FLOAT)), 0) AS INT) FROM reviews WHERE product_id = :productId AND (is_visible = 1 OR is_visible IS NULL)", nativeQuery = true)
    Integer getAverageRatingByProductId(@Param("productId") Integer productId);
    
    // Tính rating trung bình của một shop (có shop_id trong bảng reviews)
    @Query(value = "SELECT CAST(ROUND(AVG(CAST(rating AS FLOAT)), 0) AS INT) FROM reviews WHERE shop_id = :shopId AND (is_visible = 1 OR is_visible IS NULL)", nativeQuery = true)
    Integer getAverageRatingByShopId(@Param("shopId") Integer shopId);
    
    // Đếm số lượng review của một sản phẩm (chỉ tính reviews visible)
    @Query(value = "SELECT COUNT(*) FROM reviews WHERE product_id = :productId AND (is_visible = 1 OR is_visible IS NULL)", nativeQuery = true)
    Long countByProductIdAndVisible(@Param("productId") Integer productId);
    
    // Đếm số lượng review của một shop (có shop_id trong bảng reviews)
    @Query(value = "SELECT COUNT(*) FROM reviews WHERE shop_id = :shopId AND (is_visible = 1 OR is_visible IS NULL)", nativeQuery = true)
    Long countByShopIdAndVisible(@Param("shopId") Integer shopId);
}
