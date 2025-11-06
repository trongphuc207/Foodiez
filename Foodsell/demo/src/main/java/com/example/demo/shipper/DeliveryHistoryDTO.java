package com.example.demo.shipper;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DeliveryHistoryDTO {
    private String orderId;
    private String customerName;
    private String deliveryAddress;
    private String status;
    private LocalDateTime completedAt;
    private String earnings;
    private String distance;
}