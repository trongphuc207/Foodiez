package com.example.demo.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepo;

    public AdminDashboardDTO getDashboard() {
        return new AdminDashboardDTO(
                adminRepo.countUsers(),
                adminRepo.countOrders(),
                adminRepo.countProducts(),
                adminRepo.countVouchers(),
                adminRepo.sumMonthlyRevenue(),
                adminRepo.sumProductStock() // thêm dòng này
        );
    }

    public List<AdminUserDTO> getUsers() {
        return adminRepo.findAllUsers();
    }

    public void banUser(int id) {
        adminRepo.setUserBanned(id, true);
    }

    public void unbanUser(int id) {
        adminRepo.setUserBanned(id, false);
    }

    public List<Map<String, Object>> getOrders() {
        return adminRepo.findAllOrders();
    }

    public List<Map<String, Object>> getVouchers() {
        return adminRepo.findAllVouchers();
    }

    public Map<String, Object> getReportData() {
        return adminRepo.generateReports();
    }

    public List<Map<String, Object>> getProducts() {
        return adminRepo.findAllProducts();
    }

    public void addProduct(Map<String, Object> body) {
        adminRepo.addProduct(body);
    }

    public void updateProduct(int id, Map<String, Object> body) {
        adminRepo.updateProduct(id, body);
    }

    public void deleteProduct(int id) {
        adminRepo.deleteProduct(id);
    }

}
