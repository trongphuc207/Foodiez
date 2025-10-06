package com.example.demo.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import com.example.demo.config.EmailService;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;

    public User register(String email, String rawPassword, String fullName) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email đã tồn tại");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setFullName(fullName);
        user.setRole("buyer");
        return userRepository.save(user);
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
}
