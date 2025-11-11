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
        return jdbc.queryForObject("SELECT COUNT(*) FROM orders", Integer.class);
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
                "SELECT ISNULL(SUM(total_amount),0) FROM orders " +
                "WHERE status IN ('confirmed', 'completed', 'delivered') " +
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
                   CAST(ISNULL(is_banned, 0) AS BIT) AS banned,
                   ISNULL(status, 'ACTIVE') AS status
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
        );
    }

    // ✅ Ban/Unban SQL chuẩn SQL Server - Cập nhật cả 3 fields: is_banned, status, banned
    // Nếu user là seller, cũng ban/unban shop của họ
    public void setUserBanned(int userId, boolean banned) {
        try {
            String status = banned ? "BANNED" : "ACTIVE";
            
            // Get user role
            String role = jdbc.queryForObject("SELECT role FROM users WHERE id = ?", String.class, userId);
            
            // Update user ban status
            jdbc.update(
                "UPDATE users SET is_banned = ?, status = ?, banned = ? WHERE id = ?", 
                banned ? 1 : 0, 
                status,
                banned ? 1 : 0,
                userId
            );
            System.out.println("✅ User " + userId + " ban status updated: " + status);
            
            // If user is seller, also ban/unban their shop
            if ("seller".equalsIgnoreCase(role)) {
                Integer shopCount = jdbc.queryForObject(
                    "SELECT COUNT(1) FROM shops WHERE seller_id = ?", 
                    Integer.class, 
                    userId
                );
                
                if (shopCount != null && shopCount > 0) {
                    if (banned) {
                        jdbc.update(
                            "UPDATE shops SET is_banned = 1, ban_reason = ? WHERE seller_id = ?",
                            "Tài khoản chủ shop bị khóa bởi quản trị viên",
                            userId
                        );
                        System.out.println("✅ Shop của seller " + userId + " đã bị khóa");
                    } else {
                        jdbc.update(
                            "UPDATE shops SET is_banned = 0, ban_reason = NULL WHERE seller_id = ?",
                            userId
                        );
                        System.out.println("✅ Shop của seller " + userId + " đã được mở khóa");
                    }
                }
            }
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

    public void updateUserByAdmin(int adminId, int userId, String fullName, String role, String phone, String address, String email) {
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

        // Validate email if provided
        if (email != null) {
            if (!email.contains("@") || email.startsWith("deleted+")) {
                throw new RuntimeException("Invalid email");
            }
            Integer same = jdbc.queryForObject("SELECT COUNT(1) FROM users WHERE email = ? AND id <> ?", Integer.class, email, userId);
            if (same != null && same > 0) {
                throw new RuntimeException("Email already exists");
            }
        }

        jdbc.update(
            "UPDATE users SET full_name = COALESCE(?, full_name), role = COALESCE(?, role), phone = COALESCE(?, phone), address = COALESCE(?, address), email = COALESCE(?, email), updated_at = GETDATE() WHERE id = ?",
            fullName, role, phone, address, email, userId
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

        try {
            System.out.println("🗑️ Starting hard delete for user ID: " + userId);
            
            // 1. Remove notifications
            int notifDeleted = jdbc.update("DELETE FROM notifications WHERE user_id = ?", userId);
            System.out.println("  - Deleted " + notifDeleted + " notifications");
            
            // 2. Remove messages (where user is sender)
            int msgDeleted = jdbc.update("DELETE FROM messages WHERE sender_id = ?", userId);
            System.out.println("  - Deleted " + msgDeleted + " messages");
            
            // 3. Remove chats (where user is buyer or seller)
            int chatDeleted = jdbc.update("DELETE FROM chats WHERE buyer_id = ? OR seller_id = ?", userId, userId);
            System.out.println("  - Deleted " + chatDeleted + " chats");
            
            // 4. Remove deliveries if user is shipper
            int delivDeleted = jdbc.update("DELETE FROM deliveries WHERE shipper_id = ?", userId);
            System.out.println("  - Deleted " + delivDeleted + " deliveries");
            
            // 5. Remove role applications
            try {
                int roleAppDeleted = jdbc.update("DELETE FROM role_applications WHERE user_id = ?", userId);
                System.out.println("  - Deleted " + roleAppDeleted + " role applications");
            } catch (Exception e) {
                System.out.println("  ⚠️ role_applications table may not exist, skipping...");
            }
            
            // 6. Remove order items + orders (if user is buyer)
            int orderItemsDeleted = jdbc.update("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE buyer_id = ?)", userId);
            System.out.println("  - Deleted " + orderItemsDeleted + " order items");
            int ordersDeleted = jdbc.update("DELETE FROM orders WHERE buyer_id = ?", userId);
            System.out.println("  - Deleted " + ordersDeleted + " orders");

            // 7. Remove delivery addresses
            int addrDeleted = jdbc.update("DELETE FROM delivery_addresses WHERE user_id = ?", userId);
            System.out.println("  - Deleted " + addrDeleted + " delivery addresses");

            // 8. Remove vouchers created by user
            int voucherDeleted = jdbc.update("DELETE FROM vouchers WHERE created_by = ?", userId);
            System.out.println("  - Deleted " + voucherDeleted + " vouchers");

            // 9. Remove reviews and shop reviews
            int reviewsDeleted = jdbc.update("DELETE FROM reviews WHERE user_id = ?", userId);
            System.out.println("  - Deleted " + reviewsDeleted + " reviews");
            int shopReviewsDeleted = jdbc.update("DELETE FROM shop_reviews WHERE user_id = ?", userId);
            System.out.println("  - Deleted " + shopReviewsDeleted + " shop reviews");

            // 10. If user is a seller, remove their shops and products
            Integer shopCount = jdbc.queryForObject("SELECT COUNT(1) FROM shops WHERE seller_id = ?", Integer.class, userId);
            if (shopCount != null && shopCount > 0) {
                System.out.println("  - User is seller, deleting " + shopCount + " shops...");
                
                // Remove complaints for this shop first
                try {
                    int complaintsDeleted = jdbc.update("DELETE FROM complaints WHERE shop_id IN (SELECT id FROM shops WHERE seller_id = ?)", userId);
                    System.out.println("    - Deleted " + complaintsDeleted + " complaints");
                } catch (Exception e) {
                    System.out.println("    ⚠️ complaints table may not exist, skipping...");
                }
                
                // Delete products belonging to their shops
                int productsDeleted = jdbc.update("DELETE FROM products WHERE shop_id IN (SELECT id FROM shops WHERE seller_id = ?)", userId);
                System.out.println("    - Deleted " + productsDeleted + " products");
                
                // Delete shops
                int shopsDeleted = jdbc.update("DELETE FROM shops WHERE seller_id = ?", userId);
                System.out.println("    - Deleted " + shopsDeleted + " shops");
            }

            // 11. Finally delete the user record
            jdbc.update("DELETE FROM users WHERE id = ?", userId);
            System.out.println("✅ Successfully deleted user ID: " + userId);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Hard delete failed: " + e.getMessage());
        }
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
            SELECT o.id, o.recipient_name AS customer_name, o.total_amount AS total, 
                   o.status, o.created_at
            FROM orders o
            ORDER BY o.created_at DESC
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
        SELECT p.id, p.name, p.price, c.name AS category, p.category_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
    """;
    return jdbc.queryForList(sql);
}
// ==== PRODUCTS CRUD ====
public void addProduct(Map<String, Object> body) {
    jdbc.update(
        "INSERT INTO products (name, price, category_id, shop_id, image_url, approval_status) VALUES (?, ?, ?, ?, ?, 'pending')",
        body.get("name"), body.get("price"), body.get("categoryId"), body.get("shopId"), body.get("image")
    );
}

public void updateProduct(int id, Map<String, Object> body) {
    jdbc.update(
        "UPDATE products SET name=?, price=?, category_id=?, image_url=? WHERE id=?",
        body.get("name"), body.get("price"), body.get("categoryId"), body.get("image"), id
    );
}

public void deleteProduct(int id) {
    jdbc.update("DELETE FROM products WHERE id=?", id);
}
public int sumProductStock() {
    try {
        // Products table doesn't have stock_quantity column, return count instead
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM products WHERE is_available = 1", Integer.class);
        return count != null ? count : 0;
    } catch (Exception e) {
        return 0;
    }
}

    // ==== SHOPS MANAGEMENT ====
    public List<Map<String, Object>> findAllShops() {
        String sql = """
            SELECT s.id, s.name, s.address, s.rating, s.seller_id, s.is_banned, s.ban_reason,
                   u.full_name AS seller_name, u.email AS seller_email
            FROM shops s
            LEFT JOIN users u ON s.seller_id = u.id
            ORDER BY s.created_at DESC
        """;
        return jdbc.queryForList(sql);
    }

    public List<Map<String, Object>> findShopsWithRatingBelow(double maxRating) {
        String sql = """
            SELECT s.id, s.name, s.address, s.rating, s.seller_id, s.is_banned, s.ban_reason,
                   u.full_name AS seller_name, u.email AS seller_email
            FROM shops s
            LEFT JOIN users u ON s.seller_id = u.id
            WHERE s.rating IS NOT NULL AND s.rating < ?
            ORDER BY s.rating ASC
        """;
        return jdbc.queryForList(sql, maxRating);
    }

    public void banShop(int shopId, String reason) {
        try {
            // Get seller_id from shop
            Integer sellerId = jdbc.queryForObject(
                "SELECT seller_id FROM shops WHERE id = ?", 
                Integer.class, 
                shopId
            );
            
            if (sellerId == null) {
                throw new RuntimeException("Shop not found");
            }
            
            // Ban the shop
            jdbc.update(
                "UPDATE shops SET is_banned = 1, ban_reason = ? WHERE id = ?",
                reason, shopId
            );
            System.out.println("✅ Shop " + shopId + " banned with reason: " + reason);
            
            // Ban the seller's account too
            jdbc.update(
                "UPDATE users SET is_banned = 1, status = 'BANNED', banned = 1 WHERE id = ?",
                sellerId
            );
            System.out.println("✅ Seller account " + sellerId + " also banned due to shop violation");
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Không thể khóa shop: " + e.getMessage());
        }
    }

    public void unbanShop(int shopId) {
        try {
            // Get seller_id from shop
            Integer sellerId = jdbc.queryForObject(
                "SELECT seller_id FROM shops WHERE id = ?", 
                Integer.class, 
                shopId
            );
            
            if (sellerId == null) {
                throw new RuntimeException("Shop not found");
            }
            
            // Unban the shop
            jdbc.update(
                "UPDATE shops SET is_banned = 0, ban_reason = NULL WHERE id = ?",
                shopId
            );
            System.out.println("✅ Shop " + shopId + " unbanned");
            
            // Unban the seller's account too
            jdbc.update(
                "UPDATE users SET is_banned = 0, status = 'ACTIVE', banned = 0 WHERE id = ?",
                sellerId
            );
            System.out.println("✅ Seller account " + sellerId + " also unbanned");
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Không thể mở khóa shop: " + e.getMessage());
        }
    }

    // ==== PRODUCT APPROVAL ====
    public List<Map<String, Object>> findProductsByApprovalStatus(String status) {
        String sql = """
            SELECT p.id, p.name, p.description, p.price, p.shop_id, p.category_id,
                   p.approval_status, p.rejection_reason, p.created_at, p.image_url,
                   s.name AS shop_name, u.full_name AS seller_name,
                   c.name AS category_name
            FROM products p
            LEFT JOIN shops s ON p.shop_id = s.id
            LEFT JOIN users u ON s.seller_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.approval_status = ?
            ORDER BY p.created_at ASC
        """;
        return jdbc.queryForList(sql, status);
    }

    public void updateProductApprovalStatus(int productId, String status, String rejectionReason) {
        if ("rejected".equals(status)) {
            jdbc.update(
                "UPDATE products SET approval_status = ?, rejection_reason = ? WHERE id = ?",
                status, rejectionReason, productId
            );
        } else {
            jdbc.update(
                "UPDATE products SET approval_status = ?, rejection_reason = NULL WHERE id = ?",
                status, productId
            );
        }
    }


}
