package com.example.demo.dto;

import java.math.BigDecimal;

public class BestSellingProductDTO {
    private Integer productId;
    private String productName;
    private Integer totalSold;
    private BigDecimal revenue;
    private String imageUrl;
    
    public BestSellingProductDTO() {
    }
    
    public BestSellingProductDTO(Integer productId, String productName, Integer totalSold, BigDecimal revenue, String imageUrl) {
        this.productId = productId;
        this.productName = productName;
        this.totalSold = totalSold;
        this.revenue = revenue;
        this.imageUrl = imageUrl;
    }
    
    public Integer getProductId() {
        return productId;
    }
    
    public void setProductId(Integer productId) {
        this.productId = productId;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public Integer getTotalSold() {
        return totalSold;
    }
    
    public void setTotalSold(Integer totalSold) {
        this.totalSold = totalSold;
    }
    
    public BigDecimal getRevenue() {
        return revenue;
    }
    
    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}







