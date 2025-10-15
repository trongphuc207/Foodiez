package com.example.demo.Orders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    
    // Find order items by order ID
    List<OrderItem> findByOrderId(Integer orderId);
    
    // Find order items by product ID
    List<OrderItem> findByProductId(Integer productId);
    
    // Count order items by order ID
    long countByOrderId(Integer orderId);
    
    // Count order items by product ID
    long countByProductId(Integer productId);
}