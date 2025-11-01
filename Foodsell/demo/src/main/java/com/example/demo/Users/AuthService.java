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
        user.setIsVerified(false); // Set to false until OTP is verified
        
        User savedUser = userRepository.save(user);
        
        // Send OTP for signup verification
        sendOTPForSignup(email);
        
        return savedUser;
    }

    // Google login is handled in the controller (decoding/verifying the credential there),
    // so service-level helpers were removed to avoid duplication.

    public User login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Sai email hoặc mật khẩu"));

        System.out.println("🔑 Raw password nhập vào: " + rawPassword);
        System.out.println("🔐 Password hash trong DB: " + user.getPasswordHash());
        System.out.println("✅ Matches? " + passwordEncoder.matches(rawPassword, user.getPasswordHash()));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new RuntimeException("Sai email hoặc mật khẩu");
        }

        // Bỏ kiểm tra OTP - cho phép đăng nhập ngay với email/password
        // if (!user.getIsVerified()) {
        //     throw new RuntimeException("Tài khoản chưa được xác thực. Vui lòng kiểm tra email để lấy mã OTP");
        // }

        return user;
    }
    
    public void sendPasswordResetEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Generate reset token
            String resetToken = java.util.UUID.randomUUID().toString();
            LocalDateTime expiryTime = LocalDateTime.now().plusHours(24); // Tăng thời gian hết hạn lên 24 tiếng
            
            System.out.println("🔄 Generating password reset token:");
            System.out.println("Email: " + email);
            System.out.println("Token: " + resetToken);
            System.out.println("Expiry time: " + expiryTime);
            
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
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
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

    public void sendOTPForSignup(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new java.util.Random().nextInt(1000000));
        LocalDateTime otpExpiry = LocalDateTime.now().plusMinutes(10); // OTP expires in 10 minutes

        // Save OTP to user
        user.setOtpCode(otpCode);
        user.setOtpExpiry(otpExpiry);
        userRepository.save(user);

        // Send OTP email
        try {
            emailService.sendOTPEmailSignup(email, otpCode);
            System.out.println("✅ OTP sent to: " + email + " - Code: " + otpCode);
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email: " + e.getMessage());
            // Don't throw exception here, OTP is still saved
        }
    }

    public User verifyOTPAndActivateAccount(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        // Check if OTP code matches
        if (user.getOtpCode() == null || !user.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Mã OTP không đúng");
        }

        // Check if OTP is expired
        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới");
        }

        // Activate account and clear OTP
        user.setIsVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}
