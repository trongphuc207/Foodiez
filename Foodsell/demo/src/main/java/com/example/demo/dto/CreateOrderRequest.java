package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    @NotNull(message = "Buyer ID is required")
    private Integer buyerId;

    @NotNull(message = "Shop ID is required")
    private Integer shopId;

    @NotNull(message = "Delivery address ID is required")
    private Integer deliveryAddressId;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.01", message = "Total amount must be greater than 0")
    private BigDecimal totalAmount;

    private Integer voucherId;

    private String notes;

    private String recipientName;

    private String recipientPhone;

    private String addressText;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @NotNull(message = "Order items are required")
    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemRequest> orderItems;
}

