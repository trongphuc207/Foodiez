package com.example.demo.Shipper;

import com.example.demo.order.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository("shipperOrderStatusHistoryRepository")
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Integer> {
}