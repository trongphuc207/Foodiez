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
            SELECT id, full_name, email, phone, address, role,
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
            rs.getBoolean("banned"),
            rs.getString("phone"),
            rs.getString("address")
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

    // ==== USERS: Admin updates and deletes ====
    public boolean isAdmin(int adminId) {
        Integer cnt = jdbc.queryForObject(
            "SELECT COUNT(1) FROM users WHERE id=? AND role='admin' AND ISNULL(is_banned,0)=0 AND deleted_at IS NULL",
            Integer.class,
            adminId
        );
        return cnt != null && cnt > 0;
    }

    public void updateUserByAdmin(int adminId, int userId, String fullName, String role, String phone, String address) {
        if (!isAdmin(adminId)) {
            throw new RuntimeException("Only admin can update users.");
        }
        // Validate user exists and not soft-deleted
        Integer exists = jdbc.queryForObject("SELECT COUNT(1) FROM users WHERE id=? AND deleted_at IS NULL", Integer.class, userId);
        if (exists == null || exists == 0) {
            throw new RuntimeException("User not found or deleted.");
        }
        // Validate role if provided
        if (role != null && !List.of("buyer","seller","admin","shipper").contains(role)) {
            throw new RuntimeException("Invalid role value.");
        }
        jdbc.update(
            "UPDATE users SET full_name = COALESCE(?, full_name), role = COALESCE(?, role), phone = COALESCE(?, phone), address = COALESCE(?, address), updated_at = GETDATE() WHERE id = ?",
            fullName, role, phone, address, userId
        );
    }

    public void softDeleteUserByAdmin(int adminId, int userId) {
        if (!isAdmin(adminId)) {
            throw new RuntimeException("Only admin can delete users.");
        }
        Integer exists = jdbc.queryForObject("SELECT COUNT(1) FROM users WHERE id=? AND deleted_at IS NULL", Integer.class, userId);
        if (exists == null || exists == 0) {
            throw new RuntimeException("User not found or already deleted.");
        }
        jdbc.update(
            "UPDATE users SET is_banned=1, is_verified=0, deleted_at=GETDATE(), " +
            "email = CONCAT('deleted+', CAST(id AS NVARCHAR(20)), '@example.com'), " +
            "full_name = CONCAT('[deleted] ', CAST(id AS NVARCHAR(20))), updated_at=GETDATE() WHERE id=?",
            userId
        );
    }

    public void hardDeleteUserByAdmin(int adminId, int userId) {
        if (!isAdmin(adminId)) {
            throw new RuntimeException("Only admin can permanently delete users.");
        }
        Integer exists = jdbc.queryForObject("SELECT COUNT(1) FROM users WHERE id=?", Integer.class, userId);
        if (exists == null || exists == 0) {
            throw new RuntimeException("User not found.");
        }
        // Quick integrity checks similar to stored procedure
        if (jdbc.queryForObject("SELECT COUNT(1) FROM orders WHERE buyer_id=?", Integer.class, userId) > 0)
            throw new RuntimeException("Cannot hard delete: user has orders.");
        if (jdbc.queryForObject("SELECT COUNT(1) FROM delivery_addresses WHERE user_id=?", Integer.class, userId) > 0)
            throw new RuntimeException("Cannot hard delete: user has delivery addresses.");
        if (jdbc.queryForObject("SELECT COUNT(1) FROM vouchers WHERE created_by=?", Integer.class, userId) > 0)
            throw new RuntimeException("Cannot hard delete: user created vouchers.");
        if (jdbc.queryForObject("SELECT COUNT(1) FROM reviews WHERE user_id=?", Integer.class, userId) > 0)
            throw new RuntimeException("Cannot hard delete: user has reviews.");
        if (jdbc.queryForObject("SELECT COUNT(1) FROM shop_reviews WHERE user_id=?", Integer.class, userId) > 0)
            throw new RuntimeException("Cannot hard delete: user has shop reviews.");
        if (jdbc.queryForObject("SELECT COUNT(1) FROM chats WHERE buyer_id=?", Integer.class, userId) > 0)
            throw new RuntimeException("Cannot hard delete: user is referenced in chats.");

        jdbc.update("DELETE FROM users WHERE id=?", userId);
    }

    public int createUserByAdmin(String fullName, String email, String passwordHash, String role) {
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new RuntimeException("Full name is required");
        }
        if (email == null || !email.contains("@") || email.startsWith("deleted+")) {
            throw new RuntimeException("Invalid email");
        }
        if (role == null || !List.of("buyer","seller","admin","shipper").contains(role)) {
            throw new RuntimeException("Invalid role value");
        }
        Integer exists = jdbc.queryForObject("SELECT COUNT(1) FROM users WHERE email = ?", Integer.class, email);
        if (exists != null && exists > 0) {
            throw new RuntimeException("Email already exists");
        }
        jdbc.update(
            "INSERT INTO users (email, password_hash, full_name, role, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, 1, GETDATE(), GETDATE())",
            email, passwordHash, fullName, role
        );
        Integer id = jdbc.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class, email);
        return id != null ? id : 0;
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
        // Match actual DB schema: discount_value, discount_type, expiry_date, created_by
        String sql = """
            SELECT 
                id,
                code,
                discount_type,
                discount_value AS discount,
                min_order_value,
                max_uses,
                used_count,
                expiry_date,
                created_by,
                created_at
            FROM vouchers
            ORDER BY expiry_date DESC, id DESC
        String sql = """
            SELECT id, code, discount, expiry_date
            FROM vouchers
            ORDER BY expiry_date DESC
        """;
        return jdbc.queryForList(sql);
    }

    // ==== VOUCHERS CRUD ====
    public boolean voucherCodeExists(String code, Integer excludeId) {
        Integer count = jdbc.queryForObject(
            excludeId == null
                ? "SELECT COUNT(1) FROM vouchers WHERE code = ?"
                : "SELECT COUNT(1) FROM vouchers WHERE code = ? AND id <> ?",
            Integer.class,
            excludeId == null ? new Object[]{code} : new Object[]{code, excludeId}
        );
        return count != null && count > 0;
    }

    public int insertVoucher(int adminId, String code, double discount, java.sql.Timestamp expiryTs,
                             Double minOrderValue, Integer maxUses) {
        if (!isAdmin(adminId)) throw new RuntimeException("Only admin can create vouchers.");
        if (code == null || code.trim().isEmpty()) throw new RuntimeException("Code is required");
        if (discount <= 0) throw new RuntimeException("Discount must be > 0");
        if (expiryTs == null) throw new RuntimeException("Expiry date is required");
        if (voucherCodeExists(code, null)) throw new RuntimeException("Voucher code already exists");

        // Use real columns: discount_type, discount_value, min_order_value (nullable), max_uses (nullable), used_count default 0
        jdbc.update(
            "INSERT INTO vouchers (code, discount_type, discount_value, min_order_value, expiry_date, max_uses, used_count, created_by, created_at) " +
            "VALUES (?, 'percentage', ?, ?, ?, ?, 0, ?, GETDATE())",
            code,
            discount,
            minOrderValue,
            expiryTs,
            maxUses,
            adminId
        );
        Integer id = jdbc.queryForObject("SELECT id FROM vouchers WHERE code = ?", Integer.class, code);
        return id != null ? id : 0;
    }

    public void updateVoucher(int adminId, int id, String code, Double discount, java.sql.Timestamp expiryTs,
                              Double minOrderValue, Integer maxUses) {
        if (!isAdmin(adminId)) throw new RuntimeException("Only admin can update vouchers.");
        Integer exists = jdbc.queryForObject("SELECT COUNT(1) FROM vouchers WHERE id = ?", Integer.class, id);
        if (exists == null || exists == 0) throw new RuntimeException("Voucher not found");
        if (code != null && voucherCodeExists(code, id)) throw new RuntimeException("Voucher code already exists");

        // Build dynamic update with COALESCE semantics against real columns
        jdbc.update(
            "UPDATE vouchers SET " +
                "code = COALESCE(?, code), " +
                "discount_type = CASE WHEN ? IS NOT NULL THEN 'percentage' ELSE discount_type END, " +
                "discount_value = COALESCE(?, discount_value), " +
                "min_order_value = COALESCE(?, min_order_value), " +
                "max_uses = COALESCE(?, max_uses), " +
                "expiry_date = COALESCE(?, expiry_date) " +
            "WHERE id = ?",
            code,
            discount,
            discount,
            minOrderValue,
            maxUses,
            expiryTs,
            id
        );
    }

    public void deleteVoucher(int adminId, int id) {
        if (!isAdmin(adminId)) throw new RuntimeException("Only admin can delete vouchers.");
        jdbc.update("DELETE FROM vouchers WHERE id = ?", id);
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
