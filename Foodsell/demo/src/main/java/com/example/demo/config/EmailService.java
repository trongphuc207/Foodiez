package com.example.demo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetToken) {
        try {
            if (mailSender != null) {
                System.out.println("📧 Attempting to send email to: " + to);
                
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject("Reset Your Password - FoodieExpress");
                
                String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
                
                String emailBody = "Hello,\n\n" +
                        "You have requested to reset your password for your FoodieExpress account.\n\n" +
                        "Click the link below to reset your password:\n" +
                        resetLink + "\n\n" +
                        "This link will expire in 1 hour.\n\n" +
                        "If you did not request this password reset, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "FoodieExpress Team";
                
                message.setText(emailBody);
                
                mailSender.send(message);
                System.out.println("✅ Password reset email sent successfully to: " + to);
            } else {
                // Mock email sending for development
                System.out.println("📧 [MOCK EMAIL] MailSender is null - using mock mode");
                System.out.println("📧 [MOCK EMAIL] Password reset email would be sent to: " + to);
                System.out.println("📧 [MOCK EMAIL] Reset token: " + resetToken);
                System.out.println("📧 [MOCK EMAIL] Reset link: http://localhost:3000/reset-password?token=" + resetToken);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to: " + to);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace(); // Print full stack trace for debugging
            
            // Fallback to mock mode
            System.out.println("📧 [FALLBACK MOCK] Password reset email would be sent to: " + to);
            System.out.println("📧 [FALLBACK MOCK] Reset token: " + resetToken);
            System.out.println("📧 [FALLBACK MOCK] Reset link: http://localhost:3000/reset-password?token=" + resetToken);
        }
    }
    public void sendOTPEmailSignup(String to, String otp) {
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject("Your OTP Code - FoodieExpress");
                
                String emailBody = "Hello,\n\n" +
                        "Your One-Time Password (OTP) for your FoodieExpress account is:\n\n" +
                        otp + "\n\n" +
                        "This OTP is valid for 10 minutes.\n\n" +
                        "If you did not request this OTP, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "FoodieExpress Team";
                
                message.setText(emailBody);
                
                mailSender.send(message);
                System.out.println("✅ OTP email sent successfully to: " + to);
            } else {
                // Mock email sending for development
                System.out.println("📧 [MOCK EMAIL] OTP email would be sent to: " + to);
                System.out.println("📧 [MOCK EMAIL] OTP: " + otp);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email to: " + to);
            System.err.println("Error: " + e.getMessage());
            // Don't throw exception in development mode
            System.out.println("📧 [MOCK EMAIL] OTP email would be sent to: " + to);
            System.out.println("📧 [MOCK EMAIL] OTP: " + otp);
        }
    }
    public void sendVerificationEmail(String to, String verificationToken) {
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject("Verify Your Email - FoodieExpress");
                
                String verificationLink = "http://localhost:3000/verify-email?token=" + verificationToken;
                
                String emailBody = "Hello,\n\n" +
                        "Thank you for registering with FoodieExpress!\n\n" +
                        "Please click the link below to verify your email address:\n" +
                        verificationLink + "\n\n" +
                        "This link will expire in 24 hours.\n\n" +
                        "If you did not create this account, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "FoodieExpress Team";
                
                message.setText(emailBody);
                
                mailSender.send(message);
                System.out.println("✅ Verification email sent successfully to: " + to);
            } else {
                // Mock email sending for development
                System.out.println("📧 [MOCK EMAIL] Verification email would be sent to: " + to);
                System.out.println("📧 [MOCK EMAIL] Verification token: " + verificationToken);
                System.out.println("📧 [MOCK EMAIL] Verification link: http://localhost:3000/verify-email?token=" + verificationToken);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send verification email to: " + to);
            System.err.println("Error: " + e.getMessage());
            // Don't throw exception in development mode
            System.out.println("📧 [MOCK EMAIL] Verification email would be sent to: " + to);
            System.out.println("📧 [MOCK EMAIL] Verification token: " + verificationToken);
        }
    }
}