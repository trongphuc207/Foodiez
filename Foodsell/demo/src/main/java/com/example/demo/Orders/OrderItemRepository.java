package com.example.demo.Orders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByOrderId(Integer orderId);

    // Kiểm tra order thuộc về buyer (customerId) và có chứa productId cần review
    @Query("select (count(oi) > 0) from OrderItem oi join oi.order o " +
           "where oi.orderId = :orderId and oi.productId = :productId and o.buyerId = :customerId")
    boolean existsForCustomerAndProduct(@Param("orderId") Integer orderId,
                                        @Param("productId") Integer productId,
                                        @Param("customerId") Integer customerId);
}

