package com.example.demo.shipper;

import lombok.*;
import java.time.LocalDateTime;

// This class is a plain DTO variant kept for shipper-side usage only.
// The application uses the shared JPA entity in `com.example.demo.order.OrderStatusHistory`.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusHistory {
    private Integer id;
    private Integer orderId;
    private String status;
    private String notes;
    private Long changedBy;
    private LocalDateTime createdAt;
}