
package com.example.demo.products;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByNameContainingIgnoreCase(String name);
    
    // For seller - see all their products (including pending/rejected)
    List<Product> findByShopId(int shopId);
    
    // For customers - only approved products by shop
    @Query("SELECT p FROM Product p WHERE p.shopId = :shopId AND p.approvalStatus = 'approved' AND p.available = true")
    List<Product> findApprovedProductsByShopId(@Param("shopId") int shopId);
    
    // For admin approval system
    List<Product> findByApprovalStatusOrderByCreatedAtAsc(String approvalStatus);
    List<Product> findAllByOrderByCreatedAtDesc();
    
    // For customer - only show approved products
    @Query("SELECT p FROM Product p WHERE p.approvalStatus = 'approved' AND p.available = true")
    List<Product> findAllApprovedProducts();
    
    // Tìm kiếm theo tên hoặc mô tả (chỉ sản phẩm đã duyệt)
    @Query("SELECT p FROM Product p WHERE " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND p.approvalStatus = 'approved' AND p.available = true")
    List<Product> searchProducts(@Param("keyword") String keyword);
    
    
    // Count products by shop
    long countByShopId(Integer shopId);
    
    // Count products by shop and status
    long countByShopIdAndStatus(Integer shopId, String status);
}