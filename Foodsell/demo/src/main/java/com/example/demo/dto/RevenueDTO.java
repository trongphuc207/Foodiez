package com.example.demo.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueDTO {
    private BigDecimal totalRevenue;
    private Integer totalOrders;
    private List<RevenueItemDTO> revenueList;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueItemDTO {
        private String date;      // for daily: "2024-01-15"
        private String month;     // for monthly: "Tháng 1", "Tháng 2"
        private BigDecimal revenue;
        private Integer orderCount;
    }
}

