package com.example.demo.dto;

import java.math.BigDecimal;

public class AdminDashboard {
    private long userCount;
    private long orderCount;
    private long shopCount;
    private BigDecimal totalRevenue;

    public AdminDashboard() {}
    public AdminDashboard(long userCount, long orderCount, long shopCount, BigDecimal totalRevenue) {
        this.userCount = userCount;
        this.orderCount = orderCount;
        this.shopCount = shopCount;
        this.totalRevenue = totalRevenue;
    }
    public long getUserCount() { return userCount; }
    public void setUserCount(long userCount) { this.userCount = userCount; }
    public long getOrderCount() { return orderCount; }
    public void setOrderCount(long orderCount) { this.orderCount = orderCount; }
    public long getShopCount() { return shopCount; }
    public void setShopCount(long shopCount) { this.shopCount = shopCount; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
}
