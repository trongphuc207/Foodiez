package com.example.demo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetToken) {
        try {
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
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to: " + to);
            System.err.println("Error: " + e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}

