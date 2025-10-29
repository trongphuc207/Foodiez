package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor//để không cần tạo class để sử dụng this.orderId = orderID...
public class OrderSummaryDTO {
    private Integer id;
    private BigDecimal totalAmount;
    private String status;
    private Long itemCount;
}
