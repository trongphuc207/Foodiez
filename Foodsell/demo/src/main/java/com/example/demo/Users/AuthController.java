package com.example.demo.Users;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.config.JwtUtil;

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

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> req) {
        try {
            System.out.println("🔍 Register request: " + req);
            
            // Validation
            Map<String, String> validationErrors = validateRegisterRequest(req);
            if (!validationErrors.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Validation failed");
                errorResponse.put("details", validationErrors);
                return ResponseEntity.status(400).body(errorResponse);
            }
            
        User user = authService.register(req.get("email"), req.get("password"), req.get("fullName"));
            String token = jwtUtil.generateToken(user.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", token);
            
            System.out.println("✅ Register successful for: " + user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Register error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    private Map<String, String> validateRegisterRequest(Map<String, String> req) {
        Map<String, String> errors = new HashMap<>();
        
        // Email validation
        String email = req.get("email");
        if (email == null || email.trim().isEmpty()) {
            errors.put("email", "Email is required");
        } else if (!isValidEmail(email)) {
            errors.put("email", "Email format is invalid");
        }
        
        // Password validation
        String password = req.get("password");
        if (password == null || password.trim().isEmpty()) {
            errors.put("password", "Password is required");
        } else if (password.length() < 6) {
            errors.put("password", "Password must be at least 6 characters");
        } else if (password.length() > 50) {
            errors.put("password", "Password must be less than 50 characters");
        }
        
        // Full name validation
        String fullName = req.get("fullName");
        if (fullName == null || fullName.trim().isEmpty()) {
            errors.put("fullName", "Full name is required");
        } else if (fullName.trim().length() < 2) {
            errors.put("fullName", "Full name must be at least 2 characters");
        } else if (fullName.trim().length() > 100) {
            errors.put("fullName", "Full name must be less than 100 characters");
        }
        
        return errors;
    }
    
    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> req) {
        try {
            System.out.println("🔍 Login request: " + req);
            
            // Validation
            Map<String, String> validationErrors = validateLoginRequest(req);
            if (!validationErrors.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Validation failed");
                errorResponse.put("details", validationErrors);
                return ResponseEntity.status(400).body(errorResponse);
            }
            
        User user = authService.login(req.get("email"), req.get("password"));
            String token = jwtUtil.generateToken(user.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", token);
            
            System.out.println("✅ Login successful for: " + user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Login error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    private Map<String, String> validateLoginRequest(Map<String, String> req) {
        Map<String, String> errors = new HashMap<>();
        
        // Email validation
        String email = req.get("email");
        if (email == null || email.trim().isEmpty()) {
            errors.put("email", "Email is required");
        } else if (!isValidEmail(email)) {
            errors.put("email", "Email format is invalid");
        }
        
        // Password validation
        String password = req.get("password");
        if (password == null || password.trim().isEmpty()) {
            errors.put("password", "Password is required");
        } else if (password.length() < 1) {
            errors.put("password", "Password cannot be empty");
        }
        
        return errors;
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> req) {
        try {
            // Validation
            Map<String, String> validationErrors = validateForgotPasswordRequest(req);
            if (!validationErrors.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Validation failed");
                errorResponse.put("details", validationErrors);
                return ResponseEntity.status(400).body(errorResponse);
            }
            
            String email = req.get("email");
            authService.sendPasswordResetEmail(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password reset link has been sent to your email");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Forgot password error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    private Map<String, String> validateForgotPasswordRequest(Map<String, String> req) {
        Map<String, String> errors = new HashMap<>();
        
        // Email validation
        String email = req.get("email");
        if (email == null || email.trim().isEmpty()) {
            errors.put("email", "Email is required");
        } else if (!isValidEmail(email)) {
            errors.put("email", "Email format is invalid");
        }
        
        return errors;
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        try {
            long userCount = userRepository.count();
            response.put("status", "success");
            response.put("message", "Database connection successful");
            response.put("userCount", userCount);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Database connection failed: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        try {
            var users = userRepository.findAll();
            response.put("status", "success");
            response.put("message", "Users retrieved successfully");
            response.put("users", users);
            response.put("count", users.size());
        } catch (Exception e) {
            System.err.println("❌ Get users error: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", "Failed to get users: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestHeader("Authorization") String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Extract email from JWT token
            String email = jwtUtil.getEmailFromToken(token.replace("Bearer ", ""));
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            response.put("status", "success");
            response.put("user", user);
        } catch (Exception e) {
            System.err.println("❌ Get profile error: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(401).body(response);
        }
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> req) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Extract email from JWT token
            String email = jwtUtil.getEmailFromToken(token.replace("Bearer ", ""));
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validation
            Map<String, String> validationErrors = validateProfileUpdate(req);
            if (!validationErrors.isEmpty()) {
                response.put("error", "Validation failed");
                response.put("details", validationErrors);
                return ResponseEntity.status(400).body(response);
            }
            
            // Update user fields
            if (req.containsKey("fullName")) {
                user.setFullName(req.get("fullName"));
            }
            if (req.containsKey("phone")) {
                user.setPhone(req.get("phone"));
            }
            if (req.containsKey("address")) {
                user.setAddress(req.get("address"));
            }
            
            user.setUpdatedAt(java.time.LocalDateTime.now());
            User updatedUser = userRepository.save(user);
            
            response.put("status", "success");
            response.put("message", "Profile updated successfully");
            response.put("user", updatedUser);
            
        } catch (Exception e) {
            System.err.println("❌ Update profile error: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
        return ResponseEntity.ok(response);
    }
    
    private Map<String, String> validateProfileUpdate(Map<String, String> req) {
        Map<String, String> errors = new HashMap<>();
        
        // Full name validation
        if (req.containsKey("fullName")) {
            String fullName = req.get("fullName");
            if (fullName == null || fullName.trim().isEmpty()) {
                errors.put("fullName", "Full name is required");
            } else if (fullName.trim().length() < 2) {
                errors.put("fullName", "Full name must be at least 2 characters");
            } else if (fullName.trim().length() > 100) {
                errors.put("fullName", "Full name must be less than 100 characters");
            }
        }
        
        // Phone validation
        if (req.containsKey("phone")) {
            String phone = req.get("phone");
            if (phone == null || phone.trim().isEmpty()) {
                errors.put("phone", "Phone is required");
            } else if (phone.trim().length() < 10) {
                errors.put("phone", "Phone must be at least 10 characters");
            }
        }
        
        // Address validation
        if (req.containsKey("address")) {
            String address = req.get("address");
            if (address == null || address.trim().isEmpty()) {
                errors.put("address", "Address is required");
            } else if (address.trim().length() < 10) {
                errors.put("address", "Address must be at least 10 characters");
            }
        }
        
        return errors;
    }
    
    @PostMapping("/google")
    public ResponseEntity<Map<String, Object>> googleAuth(@RequestBody Map<String, String> req) {
        Map<String, Object> response = new HashMap<>();
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
                
                response.put("status", "success");
                response.put("message", "Google authentication successful");
                response.put("user", user);
                response.put("token", token);
                
            } else {
                throw new RuntimeException("Invalid Google credential format");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Google auth error: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> req) {
        Map<String, Object> response = new HashMap<>();
        try {
            String resetToken = req.get("resetToken");
            String newPassword = req.get("newPassword");
            
            // Validation
            if (resetToken == null || resetToken.trim().isEmpty()) {
                response.put("error", "Reset token is required");
                return ResponseEntity.status(400).body(response);
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.put("error", "New password is required");
                return ResponseEntity.status(400).body(response);
            }
            
            if (newPassword.length() < 6) {
                response.put("error", "Password must be at least 6 characters");
                return ResponseEntity.status(400).body(response);
            }
            
            User user = authService.resetPasswordWithToken(resetToken, newPassword);
            
            response.put("status", "success");
            response.put("message", "Password reset successfully");
            response.put("user", user);
            
        } catch (Exception e) {
            System.err.println("❌ Reset password error: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/validate-reset-token")
    public ResponseEntity<Map<String, Object>> validateResetToken(@RequestParam String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean isValid = authService.validateResetToken(token);
            
            response.put("status", "success");
            response.put("valid", isValid);
            response.put("message", isValid ? "Token is valid" : "Token is invalid or expired");
            
        } catch (Exception e) {
            System.err.println("❌ Validate token error: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
        return ResponseEntity.ok(response);
    }
}
