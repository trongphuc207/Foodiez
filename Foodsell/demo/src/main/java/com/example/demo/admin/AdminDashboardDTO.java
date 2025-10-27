package com.example.demo.admin;

public class AdminDashboardDTO {
    private int totalUsers;
    private int totalOrders;
    private int totalProducts;
    private int totalVouchers;
    private double totalRevenue;
    private int totalStock; // 👈 thêm

    public AdminDashboardDTO() {
    }

    public AdminDashboardDTO(int totalUsers, int totalOrders, int totalProducts, int totalVouchers, double totalRevenue,
            int totalStock) {
        this.totalUsers = totalUsers;
        this.totalOrders = totalOrders;
        this.totalProducts = totalProducts;
        this.totalVouchers = totalVouchers;
        this.totalRevenue = totalRevenue;
        this.totalStock = totalStock;
    }

    // getters/setters
    public int getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(int totalUsers) {
        this.totalUsers = totalUsers;
    }

    public int getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }

    public int getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(int totalProducts) {
        this.totalProducts = totalProducts;
    }

    public int getTotalVouchers() {
        return totalVouchers;
    }

    public void setTotalVouchers(int totalVouchers) {
        this.totalVouchers = totalVouchers;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public int getTotalStock() {
        return totalStock;
    }

    public void setTotalStock(int totalStock) {
        this.totalStock = totalStock;
    }
}
