package com.example.demo.shops;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Integer> {
    
    // Tìm shop theo seller_id
    Optional<Shop> findBySellerId(int sellerId);
    
    // Tìm kiếm shop theo tên (case-insensitive)
    List<Shop> findByNameContainingIgnoreCase(String name);
    
    // Tìm kiếm shop theo tên và địa chỉ
    @Query("SELECT s FROM Shop s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Shop> searchByNameOrAddress(@Param("keyword") String keyword);
    
    // Tìm shop theo rating tối thiểu
    List<Shop> findByRatingGreaterThanEqual(Double minRating);
    
    // Lấy shop được sắp xếp theo rating giảm dần
    List<Shop> findAllByOrderByRatingDesc();
}