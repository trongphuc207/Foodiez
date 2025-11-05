package com.example.demo.Shipper;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ShipperRepository extends JpaRepository<Shipper, Long> {
    Optional<Shipper> findByUserId(Long userId);

    @Query(value = "SELECT COALESCE(SUM(o.delivery_fee), 0) FROM orders o " +
           "WHERE o.assigned_shipper_id = :shipperId " +
           "AND o.status = 'delivered' " +
           "AND CAST(o.updated_at AS DATE) = CAST(GETDATE() AS DATE)", nativeQuery = true)
    double calculateDailyEarnings(@Param("shipperId") Long shipperId);

    @Query(value = "SELECT COALESCE(SUM(o.delivery_fee), 0) FROM orders o " +
           "WHERE o.assigned_shipper_id = :shipperId " +
           "AND o.status = 'delivered' " +
           "AND o.updated_at >= DATEADD(day, -7, GETDATE())", nativeQuery = true)
    double calculateWeeklyEarnings(@Param("shipperId") Long shipperId);

    @Query(value = "SELECT COALESCE(SUM(o.delivery_fee), 0) FROM orders o " +
           "WHERE o.assigned_shipper_id = :shipperId " +
           "AND o.status = 'delivered' " +
           "AND o.updated_at >= DATEADD(month, -1, GETDATE())", nativeQuery = true)
    double calculateMonthlyEarnings(@Param("shipperId") Long shipperId);

    @Query(value = "SELECT COUNT(*) FROM orders o " +
           "WHERE o.assigned_shipper_id = :shipperId " +
           "AND o.status = 'delivered'", nativeQuery = true)
    int countCompletedOrders(@Param("shipperId") Long shipperId);
}