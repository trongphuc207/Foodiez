
package com.example.demo.products;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByShopId(int shopId);
    
    // Tìm kiếm theo tên hoặc mô tả
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);
    
    
    // Count products by shop
    long countByShopId(Integer shopId);
    
    // Count products by shop and status
    long countByShopIdAndStatus(Integer shopId, String status);
    
    // Tìm sản phẩm theo giá (dưới hoặc bằng một giá trị)
    @Query("SELECT p FROM Product p WHERE p.price <= :maxPrice AND p.available = true AND p.status = 'active' ORDER BY p.price ASC")
    List<Product> findByPriceLessThanEqual(@Param("maxPrice") double maxPrice);
    
    // Tìm sản phẩm theo khoảng giá
    @Query("SELECT p FROM Product p WHERE p.price >= :minPrice AND p.price <= :maxPrice AND p.available = true AND p.status = 'active' ORDER BY p.price ASC")
    List<Product> findByPriceBetween(@Param("minPrice") double minPrice, @Param("maxPrice") double maxPrice);
    
    // Tìm sản phẩm theo giá (trên hoặc bằng một giá trị)
    @Query("SELECT p FROM Product p WHERE p.price >= :minPrice AND p.available = true AND p.status = 'active' ORDER BY p.price ASC")
    List<Product> findByPriceGreaterThanEqual(@Param("minPrice") double minPrice);
    
    // Tìm sản phẩm theo categoryId
    @Query("SELECT p FROM Product p WHERE p.categoryId = :categoryId AND p.available = true AND p.status = 'active' ORDER BY p.name ASC")
    List<Product> findByCategoryId(@Param("categoryId") int categoryId);
    
    // Tìm sản phẩm theo approval status
    List<Product> findByApprovalStatusOrderByCreatedAtAsc(String approvalStatus);
    
    // Lấy tất cả sản phẩm sắp xếp theo ngày tạo giảm dần
    List<Product> findAllByOrderByCreatedAtDesc();
}