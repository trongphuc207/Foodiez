package com.example.demo.Orders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Integer buyerId);
    
    List<Order> findByShopIdOrderByCreatedAtDesc(Integer shopId);
    
    Optional<Order> findByOrderCode(Integer orderCode);
    
    @Query("SELECT o FROM Order o WHERE o.shopId = :shopId")
    List<Order> findByShopIdWithOrderItems(@Param("shopId") Integer shopId);
    
    @Query("SELECT o FROM Order o WHERE o.shopId = :shopId AND o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findByShopIdAndStatusOrderByCreatedAtDesc(@Param("shopId") Integer shopId, @Param("status") String status);
    
    long countByShopId(Integer shopId);
    
    @Query("SELECT o FROM Order o WHERE o.shopId = :shopId AND o.createdAt >= :startDate AND o.createdAt < :endDate")
    List<Order> findByShopIdBetweenDates(@Param("shopId") Integer shopId, 
                                         @Param("startDate") java.time.LocalDateTime startDate,
                                         @Param("endDate") java.time.LocalDateTime endDate);
    
    // Shipper-related queries
    List<Order> findByAssignedShipperId(Integer shipperId);
    
    @Query("SELECT o FROM Order o WHERE o.assignedShipperId = :shipperId AND o.status = :status")
    List<Order> findByAssignedShipperIdAndStatus(@Param("shipperId") Integer shipperId, @Param("status") String status);
    
    @Query("SELECT o FROM Order o WHERE o.assignmentStatus = :status AND o.assignedShipperId IS NULL ORDER BY o.createdAt DESC")
    List<Order> findByAssignmentStatusAndAssignedShipperIdIsNullOrderByCreatedAtDesc(@Param("status") String status);
    
    @Query("SELECT o FROM Order o WHERE o.assignedShipperId = :shipperId AND o.status = 'completed'")
    List<Order> findCompletedOrdersByShipperId(@Param("shipperId") Integer shipperId);
    
    // Seller-related queries
    @Query("SELECT o FROM Order o WHERE o.assignedSellerId = :sellerId AND o.assignmentStatus = :status")
    List<Order> findByAssignedSellerIdAndAssignmentStatus(@Param("sellerId") Integer sellerId, @Param("status") String status);
    
    @Query("SELECT o FROM Order o WHERE o.assignedShipperId = :shipperId AND o.assignmentStatus = :status")
    List<Order> findByAssignedShipperIdAndAssignmentStatus(@Param("shipperId") Integer shipperId, @Param("status") String status);
    
    // Count queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.shopId = :shopId AND o.status = :status")
    long countByShopIdAndStatus(@Param("shopId") Integer shopId, @Param("status") String status);
    
    // Search queries
    @Query("SELECT o FROM Order o WHERE (o.notes LIKE %:keyword% OR o.recipientName LIKE %:keyword% OR o.recipientPhone LIKE %:keyword%) AND o.assignmentStatus = :status")
    List<Order> searchAvailableOrdersByKeyword(@Param("keyword") String keyword, @Param("status") String status);
    
    // Find by notes containing
    @Query("SELECT o FROM Order o WHERE o.notes LIKE %:keyword%")
    List<Order> findByNotesContaining(@Param("keyword") String keyword);
}

