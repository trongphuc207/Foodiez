package com.example.demo.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerDashboardDTO {
    private Integer totalOrders;
    private Integer todayOrders;
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private Integer pendingOrders;
    private Integer completedOrders;
    private Integer cancelledOrders;
    private Integer totalProducts;
    private Integer activeProducts;
    private Integer totalCustomers;
}

