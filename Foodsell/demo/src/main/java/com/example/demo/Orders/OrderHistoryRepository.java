package com.example.demo.Orders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Integer> {
    
    // Lấy lịch sử theo order ID
    List<OrderHistory> findByOrderIdOrderByCreatedAtDesc(Integer orderId);
    
    // Lấy lịch sử theo action
    List<OrderHistory> findByActionOrderByCreatedAtDesc(String action);
    
    // Lấy lịch sử theo status_to
    List<OrderHistory> findByStatusToOrderByCreatedAtDesc(String statusTo);
    
    // Query tùy chỉnh để lấy lịch sử với thông tin chi tiết
    @Query("SELECT oh FROM OrderHistory oh WHERE oh.orderId = :orderId ORDER BY oh.createdAt DESC")
    List<OrderHistory> findOrderHistoryByOrderId(Integer orderId);
}
