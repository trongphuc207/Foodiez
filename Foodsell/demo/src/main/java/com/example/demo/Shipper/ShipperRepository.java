package com.example.demo.Shipper;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipperRepository extends JpaRepository<Shipper, Integer> {
    
    // Tìm shipper theo user ID
    Optional<Shipper> findByUserId(Integer userId);
    
    // Tìm các shipper có sẵn trong khu vực
    @Query("SELECT s FROM Shipper s WHERE s.isAvailable = true AND s.deliveryArea LIKE %:area%")
    List<Shipper> findAvailableShippersInArea(@Param("area") String area);
    
    // Tìm shipper có rating cao nhất
    @Query("SELECT s FROM Shipper s WHERE s.isAvailable = true ORDER BY s.rating DESC")
    List<Shipper> findTopRatedAvailableShippers();
    
    // Đếm số lượng shipper theo trạng thái
    @Query("SELECT COUNT(s) FROM Shipper s WHERE s.isAvailable = :available")
    Long countByAvailability(@Param("available") Boolean available);
    
    // Tìm shipper theo loại phương tiện
    List<Shipper> findByVehicleTypeAndIsAvailable(String vehicleType, Boolean isAvailable);
}
