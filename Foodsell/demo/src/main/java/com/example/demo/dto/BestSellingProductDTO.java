package com.example.demo.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BestSellingProductDTO {
    private Integer id;
    private String name;
    private Integer totalSold;
    private BigDecimal revenue;
    private String imageUrl;
}

