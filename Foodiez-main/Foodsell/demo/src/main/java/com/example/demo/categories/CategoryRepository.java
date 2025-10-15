package com.example.demo.categories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
    // Tìm category theo tên (case-insensitive)
    Optional<Category> findByNameIgnoreCase(String name);
    
    // Kiểm tra category có tồn tại theo tên
    boolean existsByNameIgnoreCase(String name);
    
    // Tìm kiếm categories theo tên (partial match, case-insensitive)
    List<Category> findByNameContainingIgnoreCase(String name);
    
    // Tìm kiếm categories theo description (partial match, case-insensitive)
    List<Category> findByDescriptionContainingIgnoreCase(String description);
    
    // Lấy tất cả categories sắp xếp theo tên
    List<Category> findAllByOrderByNameAsc();
    
    // Lấy tất cả categories sắp xếp theo ngày tạo (mới nhất trước)
    List<Category> findAllByOrderByCreatedAtDesc();
    
    // Đếm số lượng categories
    long count();
    
    // Custom query: Tìm categories có tên chứa keyword
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Category> searchByName(@Param("keyword") String keyword);
    
    // Custom query: Tìm categories có description chứa keyword
    @Query("SELECT c FROM Category c WHERE LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Category> searchByDescription(@Param("keyword") String keyword);
    
    // Custom query: Tìm kiếm tổng hợp
    @Query("SELECT c FROM Category c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Category> searchCategories(@Param("keyword") String keyword);
}


