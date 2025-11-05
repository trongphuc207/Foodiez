package com.example.demo.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerOrderDTO {
    private Integer id;
    private Integer buyerId;
    private String buyerName;
    private String recipientName;
    private String recipientPhone;
    private String addressText;
    private BigDecimal totalAmount;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private List<OrderItemInfo> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemInfo {
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
    }
}







