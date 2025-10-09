package com.example.demo.admin;

import com.example.demo.orders.OrderRepository;
import com.example.demo.Users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {
    @Autowired private OrderRepository orderRepo;
    @Autowired private UserRepository  userRepo;

    public Map<String, Double> getSalesReport() {
        Map<String, Double> m = new HashMap<>();
        m.put("today", orderRepo.sumRevenueByDate(LocalDate.now()).doubleValue());
        m.put("month", orderRepo.sumRevenueByMonth(LocalDate.now().getYear(),
                                                  LocalDate.now().getMonthValue()).doubleValue());
        return m;
    }

    public Map<String, Long> getUserStats() {
        Map<String, Long> m = new HashMap<>();
        m.put("buyers",  userRepo.countByRole("buyer"));
        m.put("sellers", userRepo.countByRole("seller"));
        m.put("shippers",userRepo.countByRole("shipper"));
        m.put("admins",  userRepo.countByRole("admin"));
        return m;
    }

    public Map<String, Long> getOrderStats() {
        Map<String, Long> m = new HashMap<>();
        m.put("pending",   orderRepo.countByStatus("pending"));
        m.put("delivered", orderRepo.countByStatus("delivered"));
        m.put("cancelled", orderRepo.countByStatus("cancelled"));
        return m;
    }

    public Map<String, Double> getRevenueStats() {
        Map<String, Double> m = new HashMap<>();
        m.put("total", orderRepo.sumTotalAmountOrZero().doubleValue());
        return m;
    }
}
