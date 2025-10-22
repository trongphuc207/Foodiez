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
    private String recipientName;
    private String recipientPhone;
    private String addressText;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> orderItems;
}
