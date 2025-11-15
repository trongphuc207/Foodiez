package com.example.demo.delivery;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Integer> {
    Optional<Delivery> findByOrderId(Integer orderId);
    List<Delivery> findByShipperId(Integer shipperId);
    long countByShipperIdAndStatus(Integer shipperId, String status);
}
