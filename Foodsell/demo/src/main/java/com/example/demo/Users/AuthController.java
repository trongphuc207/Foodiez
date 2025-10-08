package com.example.demo.Users;
import com.example.demo.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.demo.config.JwtUtil;
import com.example.demo.config.FileUploadService;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") 
public class AuthController {
    @Autowired
    private AuthService authService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileUploadService fileUploadService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request.getEmail(), request.getPassword(), request.getFullName());
        String token = jwtUtil.generateToken(user.getEmail());
        
        System.out.println("✅ Register successful for: " + user.getEmail());
        return ResponseEntity.ok(ApiResponse.successWithToken(user, token, "Đăng ký thành công"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@Valid @RequestBody LoginRequest request) {
        User user = authService.login(request.getEmail(), request.getPassword());
        String token = jwtUtil.generateToken(user.getEmail());
        
        System.out.println("✅ Login successful for: " + user.getEmail());
        return ResponseEntity.ok(ApiResponse.successWithToken(user, token, "Đăng nhập thành công"));
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.sendPasswordResetEmail(request.getEmail());
        
        return ResponseEntity.ok(ApiResponse.success(null, "Link đặt lại mật khẩu đã được gửi đến email của bạn"));
    }
    
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<Object>> test() {
        try {
            long userCount = userRepository.count();
            return ResponseEntity.ok(ApiResponse.success(userCount, "Database connection successful"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Database connection failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/hello")
    public ResponseEntity<ApiResponse<String>> hello() {
        return ResponseEntity.ok(ApiResponse.success("Hello from backend!", "Backend is working"));
    }
    
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Object>> getAllUsers() {
        var users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }
    
    @GetMapping("/test-static")
    public ResponseEntity<ApiResponse<Object>> testStaticResources() {
        try {
            // Test if static resources are working
            java.io.File uploadDir = new java.io.File("uploads");
            java.io.File profileDir = new java.io.File("uploads/profile-images");
            
            java.util.Map<String, Object> data = new java.util.HashMap<>();
            data.put("uploadDirExists", uploadDir.exists());
            data.put("profileDirExists", profileDir.exists());
            data.put("uploadDirPath", uploadDir.getAbsolutePath());
            data.put("profileDirPath", profileDir.getAbsolutePath());
            
            if (profileDir.exists()) {
                String[] files = profileDir.list();
                data.put("profileImages", files);
                data.put("imageCount", files != null ? files.length : 0);
            }
            
            return ResponseEntity.ok(ApiResponse.success(data, "Static resources check completed"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error checking static resources: " + e.getMessage()));
        }

    }
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(user, "Profile retrieved successfully"));
    }
    
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest request) {
        
        User user = (User) authentication.getPrincipal();
        
        // Update user fields
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Profile updated successfully"));
    }
    
    @PostMapping("/upload-avatar")
    public ResponseEntity<ApiResponse<User>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        try {
            // Upload file and get file path
            String filePath = fileUploadService.uploadProfileImage(file);
            
            // Create full URL for the uploaded image
            String fullImageUrl = "http://localhost:8080/" + filePath;
            
            // Update user's profile image with full URL
            user.setProfileImage(fullImageUrl);
            user.setUpdatedAt(LocalDateTime.now());
            User updatedUser = userRepository.save(user);
            
            System.out.println("✅ Avatar updated for user: " + user.getEmail() + ", Full URL: " + fullImageUrl);
            return ResponseEntity.ok(ApiResponse.success(updatedUser, "Avatar updated successfully"));
        } catch (Exception e) {
            System.err.println("❌ Avatar upload error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to upload avatar: " + e.getMessage()));
        }
    }

    @PostMapping("/remove-avatar")
    public ResponseEntity<ApiResponse<User>> removeAvatar(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Remove profile image
        user.setProfileImage(null);
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        
        System.out.println("✅ Avatar removed for user: " + user.getEmail());
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Avatar removed successfully"));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<User>> googleAuth(@RequestBody java.util.Map<String, String> req) {
        try {
            String credential = req.get("credential");
            System.out.println("🔍 Google OAuth credential received");
            
            // TODO: Verify Google JWT token here
            // For now, we'll decode the token to get user info
            // In production, you should verify the JWT token with Google
            
            // Decode JWT token to get user info (simplified - in production use proper verification)
            String[] parts = credential.split("\\.");
            if (parts.length >= 2) {
                // Decode payload (base64)
                String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                System.out.println("📋 Google payload: " + payload);
                
                // Parse JSON to get user info
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.readTree(payload);
                
                String email = jsonNode.get("email").asText();
                String name = jsonNode.get("name").asText();
                String picture = jsonNode.has("picture") ? jsonNode.get("picture").asText() : "";
                
                System.out.println("👤 Google user - Email: " + email + ", Name: " + name);
                
                // Check if user exists in database
                Optional<User> existingUser = userRepository.findByEmail(email);
                User user;
                
                if (existingUser.isPresent()) {
                    user = existingUser.get();
                    System.out.println("✅ Existing user found: " + user.getEmail());
                } else {
                    // Create new user
                    user = new User();
                    user.setEmail(email);
                    user.setFullName(name);
                    user.setRole("buyer");
                    user.setIsVerified(true);
                    user.setPasswordHash("GOOGLE_OAUTH_USER"); // Set a default password for Google users
                    user.setCreatedAt(java.time.LocalDateTime.now());
                    user.setUpdatedAt(java.time.LocalDateTime.now());
                    
                    user = userRepository.save(user);
                    System.out.println("✅ New user created: " + user.getEmail());
                }
                
                // Generate JWT token
                String token = jwtUtil.generateToken(user.getEmail());
                
                return ResponseEntity.ok(ApiResponse.successWithToken(user, token, "Google authentication successful"));
            } else {
                throw new RuntimeException("Invalid Google credential format");
            }
        } 
        catch (Exception e) {
            System.err.println("❌ Google auth error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Google authentication failed: " + e.getMessage()));
        }

    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<User>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        User user = authService.resetPasswordWithToken(request.getResetToken(), request.getNewPassword());
        
        return ResponseEntity.ok(ApiResponse.success(user, "Password reset successfully"));
    }
    
    @GetMapping("/validate-reset-token")
    public ResponseEntity<ApiResponse<Boolean>> validateResetToken(@RequestParam String token) {
        boolean isValid = authService.validateResetToken(token);
        
        return ResponseEntity.ok(ApiResponse.success(isValid, 
            isValid ? "Token is valid" : "Token is invalid or expired"));
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<User>> verifyEmail(@RequestBody java.util.Map<String, String> req) {
        String verificationToken = req.get("token");
        
        if (verificationToken == null || verificationToken.trim().isEmpty()) {
            throw new IllegalArgumentException("Verification token is required");
        }
        
        User user = authService.verifyEmail(verificationToken);
        
        return ResponseEntity.ok(ApiResponse.success(user, "Email verified successfully"));
    }
    
    @GetMapping("/validate-verification-token")
    public ResponseEntity<ApiResponse<Boolean>> validateVerificationToken(@RequestParam String token) {
        boolean isValid = authService.validateVerificationToken(token);
        
        return ResponseEntity.ok(ApiResponse.success(isValid, 
            isValid ? "Token is valid" : "Token is invalid or expired"));
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerificationEmail(@RequestBody java.util.Map<String, String> req) {
        String email = req.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        
        authService.resendVerificationEmail(email);
        
        return ResponseEntity.ok(ApiResponse.success(null, "Verification email sent successfully"));
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<User>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        
        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();
        
        User updatedUser = authService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
        
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Password changed successfully"));
    }
    
    @PostMapping("/upload-profile-image")
    public ResponseEntity<ApiResponse<User>> uploadProfileImage(
            Authentication authentication,
            @RequestParam("image") MultipartFile imageFile) {
        
        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();
        
        User updatedUser = authService.updateProfileImage(email, imageFile);
        
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Profile image updated successfully"));
    }
    
    @DeleteMapping("/remove-profile-image")
    public ResponseEntity<ApiResponse<User>> removeProfileImage(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();
        
        User updatedUser = authService.removeProfileImage(email);
        
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Profile image removed successfully"));
    }
}