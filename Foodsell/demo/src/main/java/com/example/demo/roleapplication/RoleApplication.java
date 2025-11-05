package com.example.demo.roleapplication;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "requested_role", nullable = false)
    private String requestedRole; // 'seller' or 'shipper'

    @Column(name = "status", nullable = false)
    private String status = "pending"; // 'pending', 'approved', 'rejected'

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason; // Lý do apply từ user

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote; // Ghi chú/lý do từ admin khi approve/reject

    @Column(name = "reviewed_by")
    private Integer reviewedBy; // Admin ID

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    // Additional info for seller application
    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "shop_address")
    private String shopAddress;

    @Column(name = "shop_description", columnDefinition = "TEXT")
    private String shopDescription;

    // Constructor for creating new application
    public RoleApplication(Integer userId, String requestedRole, String reason) {
        this.userId = userId;
        this.requestedRole = requestedRole;
        this.reason = reason;
        this.status = "pending";
        this.createdAt = LocalDateTime.now();
    }

    // Constructor with shop info for seller
    public RoleApplication(Integer userId, String requestedRole, String reason, 
                          String shopName, String shopAddress, String shopDescription) {
        this(userId, requestedRole, reason);
        this.shopName = shopName;
        this.shopAddress = shopAddress;
        this.shopDescription = shopDescription;
    }

    // Approve application
    public void approve(Integer adminId, String note) {
        this.status = "approved";
        this.reviewedBy = adminId;
        this.adminNote = note;
        this.reviewedAt = LocalDateTime.now();
    }

    // Reject application
    public void reject(Integer adminId, String note) {
        this.status = "rejected";
        this.reviewedBy = adminId;
        this.adminNote = note;
        this.reviewedAt = LocalDateTime.now();
    }
}
