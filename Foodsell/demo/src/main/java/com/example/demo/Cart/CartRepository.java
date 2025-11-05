package com.example.demo.Cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository cho Cart Entity
 * 
 * Mục đích: Cung cấp các phương thức truy vấn database cho Cart
 * Logic: Tìm kiếm cart theo userId, xóa cart theo userId
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    
    /**
     * Tìm cart theo userId
     * @param userId ID của user
     * @return Optional<Cart>
     */
    Optional<Cart> findByUserId(Integer userId);
    
    /**
     * Xóa cart theo userId
     * @param userId ID của user
     */
    void deleteByUserId(Integer userId);
    
    /**
     * Kiểm tra cart có tồn tại theo userId
     * @param userId ID của user
     * @return true nếu tồn tại, false nếu không
     */
    boolean existsByUserId(Integer userId);
}
