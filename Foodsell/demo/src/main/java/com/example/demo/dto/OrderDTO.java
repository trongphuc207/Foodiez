package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Integer id;
    private Integer buyerId;
    private Integer shopId;
    private Integer deliveryAddressId;
    private BigDecimal totalAmount;
    private String status;
    private Integer voucherId;
    private String notes;
    private Integer orderCode;
    private String recipientName;
    private String recipientPhone;
    private String addressText;
        private Double deliveryFee;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemDTO> orderItems;

    // Thêm trường assignmentStatus để FE hiển thị trạng thái xử lý
    private String assignmentStatus;
    // Cancellation info
    private Boolean isCancelled;
    private LocalDateTime cancelledAt;
    private String cancelReason;
}
