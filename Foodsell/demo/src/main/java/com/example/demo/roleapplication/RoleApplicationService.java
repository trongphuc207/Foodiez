package com.example.demo.roleapplication;

import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import com.example.demo.shops.Shop;
import com.example.demo.shops.ShopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoleApplicationService {
    
    private final RoleApplicationRepository roleApplicationRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;

    public RoleApplicationService(RoleApplicationRepository roleApplicationRepository, 
                                 UserRepository userRepository,
                                 ShopRepository shopRepository) {
        this.roleApplicationRepository = roleApplicationRepository;
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
    }

    // Create new role application
    public RoleApplication createApplication(Integer userId, String requestedRole, String reason,
                                            String shopName, String shopAddress, String shopDescription) {
        System.out.println("📝 Creating application - UserId: " + userId + ", Role: " + requestedRole);
        
        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("✅ User found: " + user.getEmail() + ", Current role: " + user.getRole());

        // Check if user already has this role
        if (user.getRole() != null && user.getRole().equalsIgnoreCase(requestedRole)) {
            System.out.println("❌ User already has role: " + requestedRole);
            throw new RuntimeException("You already have this role");
        }

        // Check if user has pending application for this role
        if (roleApplicationRepository.existsByUserIdAndRequestedRoleAndStatus(userId, requestedRole, "pending")) {
            System.out.println("❌ User already has pending application for: " + requestedRole);
            throw new RuntimeException("You already have a pending application for this role");
        }

        RoleApplication application;
        if ("seller".equalsIgnoreCase(requestedRole)) {
            // Seller application requires shop info
            if (shopName == null || shopAddress == null) {
                System.out.println("❌ Missing shop info for seller application");
                throw new RuntimeException("Shop name and address are required for seller application");
            }
            application = new RoleApplication(userId, requestedRole, reason, shopName, shopAddress, shopDescription);
        } else {
            System.out.println("📋 Creating shipper application");
            application = new RoleApplication(userId, requestedRole, reason);
        }

        RoleApplication saved = roleApplicationRepository.save(application);
        System.out.println("✅ Application created successfully - ID: " + saved.getId());
        return saved;
    }

    // Get all pending applications
    public List<RoleApplication> getPendingApplications() {
        return roleApplicationRepository.findByStatusOrderByCreatedAtAsc("pending");
    }

    // Get user's applications
    public List<RoleApplication> getUserApplications(Integer userId) {
        return roleApplicationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Approve application
    public void approveApplication(Integer applicationId, Integer adminId, String note) {
        RoleApplication application = roleApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!"pending".equals(application.getStatus())) {
            throw new RuntimeException("Application is not pending");
        }

        User user = userRepository.findById(application.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Approve application
        application.approve(adminId, note);
        roleApplicationRepository.save(application);

        // Change user role
        user.setRole(application.getRequestedRole());
        userRepository.save(user);

        // If seller, create shop
        if ("seller".equalsIgnoreCase(application.getRequestedRole())) {
            Shop shop = new Shop();
            shop.setSellerId(user.getId());
            shop.setName(application.getShopName());
            shop.setAddress(application.getShopAddress());
            shop.setDescription(application.getShopDescription());
            shop.setOpeningHours("9:00 AM - 10:00 PM"); // Default
            shopRepository.save(shop);
        }
    }

    // Reject application
    public void rejectApplication(Integer applicationId, Integer adminId, String reason) {
        RoleApplication application = roleApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!"pending".equals(application.getStatus())) {
            throw new RuntimeException("Application is not pending");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required");
        }

        application.reject(adminId, reason);
        roleApplicationRepository.save(application);
    }

    // Get all applications (for admin)
    public List<RoleApplication> getAllApplications() {
        return roleApplicationRepository.findAll();
    }

    // Get all applications with user info (for admin)
    public List<Map<String, Object>> getAllApplicationsWithUserInfo() {
        List<RoleApplication> applications = roleApplicationRepository.findAll();
        return applications.stream().map(app -> {
            User user = userRepository.findById(app.getUserId()).orElse(null);
            Map<String, Object> result = new HashMap<>();
            result.put("id", app.getId());
            result.put("userId", app.getUserId());
            result.put("userName", user != null ? user.getFullName() : "Unknown");
            result.put("userEmail", user != null ? user.getEmail() : "Unknown");
            result.put("userPhone", user != null && user.getPhone() != null ? user.getPhone() : "");
            result.put("userIdNumber", user != null && user.getIdNumber() != null ? user.getIdNumber() : "");
            result.put("requestedRole", app.getRequestedRole());
            result.put("status", app.getStatus());
            result.put("reason", app.getReason() != null ? app.getReason() : "");
            result.put("adminNote", app.getAdminNote() != null ? app.getAdminNote() : "");
            result.put("reviewedBy", app.getReviewedBy() != null ? app.getReviewedBy() : "");
            result.put("createdAt", app.getCreatedAt());
            result.put("processedAt", app.getReviewedAt());
            result.put("shopName", app.getShopName() != null ? app.getShopName() : "");
            result.put("shopAddress", app.getShopAddress() != null ? app.getShopAddress() : "");
            result.put("shopDescription", app.getShopDescription() != null ? app.getShopDescription() : "");
            return result;
        }).collect(Collectors.toList());
    }
}
