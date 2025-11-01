package com.example.demo.Orders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.demo.dto.OrderSummaryDTO;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    
    // Find orders by buyer ID
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Integer buyerId);
    
    // Find orders by shop ID ordered by created date
    List<Order> findByShopIdOrderByCreatedAtDesc(Integer shopId);
    
    // Find orders by assigned shipper
    List<Order> findByAssignedShipperId(Integer shipperId);
    
    // Find orders by assigned shipper and status
    List<Order> findByAssignedShipperIdAndStatus(Integer shipperId, String status);
    
    // Find orders by shop ID and status
    List<Order> findByShopIdAndStatus(Integer shopId, String status);
    
    // Find orders by status
    List<Order> findByStatusOrderByCreatedAtDesc(String status);
    
    // Find orders by notes containing text
    List<Order> findByNotesContaining(String text);
    
    // Find orders by buyer ID and status
    List<Order> findByBuyerIdAndStatusOrderByCreatedAtDesc(Integer buyerId, String status);
    
    // Find orders by shop ID and status
    List<Order> findByShopIdAndStatusOrderByCreatedAtDesc(Integer shopId, String status);
    
    // Thêm các query cho hệ thống phân phối đơn hàng
    List<Order> findByAssignedSellerIdAndAssignmentStatus(Integer sellerId, String assignmentStatus);
    
    List<Order> findByAssignedShipperIdAndAssignmentStatus(Integer shipperId, String assignmentStatus);
    
    List<Order> findByAssignmentStatusOrderByCreatedAtDesc(String assignmentStatus);
    
    List<Order> findByAssignedSellerIdOrderByCreatedAtDesc(Integer sellerId);
    
    List<Order> findByAssignedShipperIdOrderByCreatedAtDesc(Integer shipperId);
    
    // Find order by ID with order items (for detailed view)
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :orderId")
    Optional<Order> findByIdWithOrderItems(@Param("orderId") Integer orderId);
    
    // Find orders by buyer ID with order items
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.buyerId = :buyerId ORDER BY o.createdAt DESC")
    List<Order> findByBuyerIdWithOrderItems(@Param("buyerId") Integer buyerId);
    
    // Find orders by shop ID with order items
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.shopId = :shopId ORDER BY o.createdAt DESC")
    List<Order> findByShopIdWithOrderItems(@Param("shopId") Integer shopId);
    
    // Count orders by status
    long countByStatus(String status);
    
    // Count orders by buyer ID
    long countByBuyerId(Integer buyerId);
    
    // Count orders by shop ID
    long countByShopId(Integer shopId);
    
    // Find orders created between dates
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findOrdersBetweenDates(@Param("startDate") java.time.LocalDateTime startDate, 
                                      @Param("endDate") java.time.LocalDateTime endDate);
    
    // Find orders by buyer ID between dates
    @Query("SELECT o FROM Order o WHERE o.buyerId = :buyerId AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findByBuyerIdBetweenDates(@Param("buyerId") Integer buyerId,
                                         @Param("startDate") java.time.LocalDateTime startDate, 
                                         @Param("endDate") java.time.LocalDateTime endDate);
    
    // Find orders by shop ID between dates
    @Query("SELECT o FROM Order o WHERE o.shopId = :shopId AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findByShopIdBetweenDates(@Param("shopId") Integer shopId,
                                        @Param("startDate") java.time.LocalDateTime startDate, 
                                        @Param("endDate") java.time.LocalDateTime endDate);
    
    // Map query result to DTO - Order summaries by buyer
    @Query("SELECT new com.example.demo.dto.OrderSummaryDTO(" +
           "o.id, o.totalAmount, o.status, COUNT(oi.id)) " +
           "FROM Order o LEFT JOIN o.orderItems oi " +
           "WHERE o.buyerId = :buyerId " +
           "GROUP BY o.id, o.totalAmount, o.status " +
           "ORDER BY o.id DESC")
    List<OrderSummaryDTO> findOrderSummariesByBuyerId(@Param("buyerId") Integer buyerId);

    // Find by PayOS order code stored in notes (pattern: "PayOS:{code}")
    Optional<Order> findFirstByNotesContaining(String text);
    
    // Find by orderCode (PayOS order code)
    Optional<Order> findByOrderCode(Integer orderCode);

    // Find completed (delivered) orders for a shipper
    @Query("SELECT o FROM Order o WHERE o.assignedShipperId = :shipperId AND o.status = 'delivered' ORDER BY o.updatedAt DESC")
    List<Order> findCompletedOrdersByShipperId(@Param("shipperId") Integer shipperId);
}
