package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Integer id;
    private Integer orderId;
    private Integer productId;
    private String productName; // Thêm tên sản phẩm
    private String productImage; // Thêm hình ảnh sản phẩm
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
