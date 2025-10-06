package com.example.demo.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import com.example.demo.config.EmailService;
import com.example.demo.config.FileUploadService;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;
    @Autowired
    private FileUploadService fileUploadService;

    public User register(String email, String rawPassword, String fullName) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email đã tồn tại");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setFullName(fullName);
        user.setRole("buyer");
        user.setIsVerified(false); // Explicitly set to false for manual registration
        
        // Generate verification token
        String verificationToken = java.util.UUID.randomUUID().toString();
        LocalDateTime expiryTime = LocalDateTime.now().plusHours(24); // Token expires in 24 hours
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(expiryTime);
        
        User savedUser = userRepository.save(user);
        
        // Send verification email
        try {
            emailService.sendVerificationEmail(email, verificationToken);
            System.out.println("✅ Verification email sent to: " + email);
        } catch (Exception e) {
            System.err.println("❌ Failed to send verification email: " + e.getMessage());
            // Don't throw exception here, user is still created
        }
        
        return savedUser;
    }

    public User login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Sai email hoặc mật khẩu"));

        System.out.println("🔑 Raw password nhập vào: " + rawPassword);
        System.out.println("🔐 Password hash trong DB: " + user.getPasswordHash());
        System.out.println("✅ Matches? " + passwordEncoder.matches(rawPassword, user.getPasswordHash()));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new RuntimeException("Sai email hoặc mật khẩu");
        }
        return user;
    }
    
    public void sendPasswordResetEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Generate reset token
            String resetToken = java.util.UUID.randomUUID().toString();
            LocalDateTime expiryTime = LocalDateTime.now().plusHours(1); // Token expires in 1 hour
            
            // Save reset token to user
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(expiryTime);
            userRepository.save(user);
            
            // Send email with reset link
            emailService.sendPasswordResetEmail(email, resetToken);
            
            // Also log for development
            System.out.println("Password reset email sent to: " + email);
            System.out.println("Reset token: " + resetToken);
            System.out.println("Reset link: http://localhost:3000/reset-password?token=" + resetToken);
        } else {
            throw new RuntimeException("Email không tồn tại");
        }
    }
    
    public User resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
    
    public User resetPasswordWithToken(String resetToken, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetToken(resetToken);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Invalid reset token");
        }
        
        User user = userOpt.get();
        
        // Check if token is expired
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }
        
        // Update password and clear reset token
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    public boolean validateResetToken(String resetToken) {
        Optional<User> userOpt = userRepository.findByResetToken(resetToken);
        if (!userOpt.isPresent()) {
            return false;
        }
        
        User user = userOpt.get();
        return user.getResetTokenExpiry() != null && user.getResetTokenExpiry().isAfter(LocalDateTime.now());
    }
    
    public User verifyEmail(String verificationToken) {
        Optional<User> userOpt = userRepository.findByVerificationToken(verificationToken);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Invalid verification token");
        }
        
        User user = userOpt.get();
        
        // Check if token is expired
        if (user.getVerificationTokenExpiry() == null || user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }
        
        // Verify the user and clear verification token
        user.setIsVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    public boolean validateVerificationToken(String verificationToken) {
        Optional<User> userOpt = userRepository.findByVerificationToken(verificationToken);
        if (!userOpt.isPresent()) {
            return false;
        }
        
        User user = userOpt.get();
        return user.getVerificationTokenExpiry() != null && user.getVerificationTokenExpiry().isAfter(LocalDateTime.now());
    }
    
    public User changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getIsVerified()) {
            throw new RuntimeException("Email is already verified");
        }
        
        // Generate new verification token
        String verificationToken = java.util.UUID.randomUUID().toString();
        LocalDateTime expiryTime = LocalDateTime.now().plusHours(24);
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(expiryTime);
        
        userRepository.save(user);
        
        // Send verification email
        emailService.sendVerificationEmail(email, verificationToken);
        System.out.println("✅ Verification email resent to: " + email);
    }
    
    public User updateProfileImage(String email, MultipartFile imageFile) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Delete old profile image if exists
            if (user.getProfileImage() != null && !user.getProfileImage().isEmpty()) {
                fileUploadService.deleteProfileImage(user.getProfileImage());
            }
            
            // Upload new image
            String imagePath = fileUploadService.uploadProfileImage(imageFile);
            user.setProfileImage(imagePath);
            user.setUpdatedAt(LocalDateTime.now());
            
            return userRepository.save(user);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to update profile image: " + e.getMessage());
            throw new RuntimeException("Failed to update profile image: " + e.getMessage());
        }
    }
    
    public User removeProfileImage(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Delete current profile image if exists
        if (user.getProfileImage() != null && !user.getProfileImage().isEmpty()) {
            fileUploadService.deleteProfileImage(user.getProfileImage());
        }
        
        user.setProfileImage(null);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
}
