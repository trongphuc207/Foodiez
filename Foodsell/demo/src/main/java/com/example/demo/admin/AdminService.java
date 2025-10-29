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

    // ==== USERS: Admin updates and deletes ====
    public void updateUserByAdmin(int adminId, int userId, String fullName, String role, String phone, String address) {
        adminRepo.updateUserByAdmin(adminId, userId, fullName, role, phone, address);
    }

    public void softDeleteUserByAdmin(int adminId, int userId) {
        adminRepo.softDeleteUserByAdmin(adminId, userId);
    }

    public void hardDeleteUserByAdmin(int adminId, int userId) {
        adminRepo.hardDeleteUserByAdmin(adminId, userId);
    }

    public int createUserByAdmin(String fullName, String email, String passwordHash, String role) {
        return adminRepo.createUserByAdmin(fullName, email, passwordHash, role);
    }

    public List<Map<String, Object>> getOrders() {
        return adminRepo.findAllOrders();
    }

    public List<Map<String, Object>> getVouchers() {
        return adminRepo.findAllVouchers();
    }

    // ==== VOUCHERS CRUD ====
    public int addVoucher(int adminId, String code, Double discount, String expiryDate, Double minOrderValue, Integer maxUses) {
        java.sql.Timestamp ts = parseTimestamp(expiryDate);
        return adminRepo.insertVoucher(adminId, code, discount != null ? discount : 0.0, ts, minOrderValue, maxUses);
    }

    public void updateVoucher(int adminId, int id, String code, Double discount, String expiryDate, Double minOrderValue, Integer maxUses) {
        java.sql.Timestamp ts = parseTimestamp(expiryDate);
        adminRepo.updateVoucher(adminId, id, code, discount, ts, minOrderValue, maxUses);
    }

    public void deleteVoucher(int adminId, int id) {
        adminRepo.deleteVoucher(adminId, id);
    }

    private java.sql.Timestamp parseTimestamp(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            java.time.Instant ins = java.time.Instant.parse(s);
            return java.sql.Timestamp.from(ins);
        } catch (Exception ignored) {}
        try {
            java.time.LocalDate d = java.time.LocalDate.parse(s);
            return java.sql.Timestamp.valueOf(d.atStartOfDay());
        } catch (Exception ignored) {}
        try {
            java.time.LocalDateTime dt = java.time.LocalDateTime.parse(s.replace("Z",""));
            return java.sql.Timestamp.valueOf(dt);
        } catch (Exception ignored) {}
        return null;
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
