package com.example.demo.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Repository
public class AdminRepository {

    @Autowired
    private JdbcTemplate jdbc;

    // ==== DASHBOARD ====
    public int countUsers() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
    }

    public int countOrders() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM orders WHERE deleted_at IS NULL", Integer.class);
    }

    public int countProducts() {
        try {
            return jdbc.queryForObject("SELECT COUNT(*) FROM products", Integer.class);
        } catch (Exception e) {
            return 0;
        }
    }

    public int countVouchers() {
        try {
            return jdbc.queryForObject("SELECT COUNT(*) FROM vouchers", Integer.class);
        } catch (Exception e) {
            return 0;
        }
    }

    public double sumMonthlyRevenue() {
        try {
            Double sum = jdbc.queryForObject(
                "SELECT ISNULL(SUM(total),0) FROM orders " +
                "WHERE deleted_at IS NULL AND status='COMPLETED' " +
                "AND MONTH(created_at)=MONTH(GETDATE()) AND YEAR(created_at)=YEAR(GETDATE())",
                Double.class
            );
            return sum != null ? sum : 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    // ==== USERS ====
    public List<AdminUserDTO> findAllUsers() {
        String sql = """
            SELECT id, full_name, email, role,
                   CAST(ISNULL(is_banned, 0) AS BIT) AS banned
            FROM users
        """;
        return jdbc.query(sql, (rs, i) -> mapUser(rs));
    }

    private AdminUserDTO mapUser(ResultSet rs) throws SQLException {
        return new AdminUserDTO(
            rs.getInt("id"),
            rs.getString("full_name"),
            rs.getString("email"),
            rs.getString("role"),
            rs.getBoolean("banned")
        );
    }

    // ✅ Ban/Unban SQL chuẩn SQL Server
    public void setUserBanned(int userId, boolean banned) {
        try {
            jdbc.update("UPDATE users SET is_banned = ? WHERE id = ?", banned ? 1 : 0, userId);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Không thể cập nhật trạng thái người dùng: " + e.getMessage());
        }
    }

    // ==== ORDERS ====
    public List<Map<String, Object>> findAllOrders() {
        String sql = """
            SELECT id, customer_name, total, status, created_at
            FROM orders
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
        """;
        return jdbc.queryForList(sql);
    }

    // ==== VOUCHERS ====
    public List<Map<String, Object>> findAllVouchers() {
        String sql = """
            SELECT id, code, discount, expiry_date
            FROM vouchers
            ORDER BY expiry_date DESC
        """;
        return jdbc.queryForList(sql);
    }

    // ==== REPORTS ====
    public Map<String, Object> generateReports() {
        Map<String, Object> data = new HashMap<>();
        data.put("monthlyRevenue", sumMonthlyRevenue());
        data.put("totalOrders", countOrders());
        data.put("totalUsers", countUsers());
        data.put("totalVouchers", countVouchers());
        data.put("totalProducts", countProducts());
        return data;
    }
    // ==== PRODUCTS ====
public List<Map<String, Object>> findAllProducts() {
    String sql = """
        SELECT id, name, price, category, stock_quantity
        FROM products
        ORDER BY id DESC
    """;
    return jdbc.queryForList(sql);
}
// ==== PRODUCTS CRUD ====
public void addProduct(Map<String, Object> body) {
    jdbc.update(
        "INSERT INTO products (name, price, category, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?)",
        body.get("name"), body.get("price"), body.get("category"), body.get("stock"), body.get("image")
    );
}

public void updateProduct(int id, Map<String, Object> body) {
    jdbc.update(
        "UPDATE products SET name=?, price=?, category=?, stock_quantity=?, image_url=? WHERE id=?",
        body.get("name"), body.get("price"), body.get("category"), body.get("stock"), body.get("image"), id
    );
}

public void deleteProduct(int id) {
    jdbc.update("DELETE FROM products WHERE id=?", id);
}
public int sumProductStock() {
    try {
        Integer sum = jdbc.queryForObject("SELECT ISNULL(SUM(stock_quantity), 0) FROM products", Integer.class);
        return sum != null ? sum : 0;
    } catch (Exception e) {
        return 0;
    }
}


}
