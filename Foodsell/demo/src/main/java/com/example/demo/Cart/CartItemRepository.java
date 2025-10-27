package com.example.demo.Cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho CartItem Entity
 * 
 * Mục đích: Cung cấp các phương thức truy vấn database cho CartItem
 * Logic: Tìm kiếm cart item theo cart và productId, xóa theo cart
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    
    /**
     * Tìm cart item theo cart và productId
     * @param cart Cart object
     * @param productId ID của product
     * @return Optional<CartItem>
     */
    Optional<CartItem> findByCartAndProductId(Cart cart, Integer productId);
    
    /**
     * Lấy tất cả cart items theo cart
     * @param cart Cart object
     * @return List<CartItem>
     */
    List<CartItem> findByCart(Cart cart);
    
    /**
     * Xóa cart item theo cart và productId
     * @param cart Cart object
     * @param productId ID của product
     */
    void deleteByCartAndProductId(Cart cart, Integer productId);
    
    /**
     * Xóa tất cả cart items theo cart
     * @param cart Cart object
     */
    void deleteByCart(Cart cart);
    
    /**
     * Đếm số lượng cart items trong cart
     * @param cart Cart object
     * @return Số lượng cart items
     */
    long countByCart(Cart cart);
}
