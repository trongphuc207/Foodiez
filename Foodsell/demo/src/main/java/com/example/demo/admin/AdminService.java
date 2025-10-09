package com.example.demo.admin;

import com.example.demo.dto.AdminDashboard;
import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import com.example.demo.orders.Order;
import com.example.demo.orders.OrderRepository;
import com.example.demo.shops.Shop;
import com.example.demo.shops.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AdminService {
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private OrderRepository orderRepo;
    @Autowired
    private ShopRepository shopRepo;

    public AdminDashboard getDashboardSummary() {
        long userCount = userRepo.count();
        long orderCount = orderRepo.count();
        long shopCount = shopRepo.count();
        BigDecimal totalRevenue = orderRepo.sumTotalAmountOrZero();
        return new AdminDashboard(userCount, orderCount, shopCount, totalRevenue);
    }

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    public List<Shop> getAllShops() {
        return shopRepo.findAll();
    }
}
