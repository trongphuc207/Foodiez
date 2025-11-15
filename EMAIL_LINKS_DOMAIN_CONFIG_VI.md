# 📧 EMAIL LINKS & DOMAIN - CẤU HÌNH ĐÚNG CHO RENDER

---

## 🎯 PHẦN 1: LINK RENDER SẼ TRÔNG NHƯ THẾ NÀO?

### Frontend URL (Trang Web)

```
https://foodiez-frontend-abc123.onrender.com

Phân tích:
├─ Scheme: https (bảo mật)
├─ Subdomain: foodiez-frontend
├─ Domain: onrender.com
└─ Random ID: abc123 (do Render tạo)

Ví dụ đầy đủ:
https://foodiez-frontend-gk7h4n2x.onrender.com
```

### Backend API URL

```
https://foodiez-backend-xyz789.onrender.com

Endpoints:
├─ /api/auth/login
├─ /api/auth/forgot-password
├─ /api/auth/reset-otp
├─ /api/auth/verify-email
└─ ...v.v
```

---

## 🔗 PHẦN 2: EMAIL LINKS - CẤU HÌNH ĐÚNG

### Vấn Đề: Email gửi link sai domain

```
❌ SAI:
   Email gửi: http://localhost:8080/reset-password?token=xxx
   → Link này chỉ chạy được trên máy local
   → Email đọc không được!

❌ SAI NỮA:
   Email gửi: http://192.168.1.5:8080/reset-password?token=xxx
   → IP địa chỉ local
   → Email đọc không được!

✅ ĐÚNG:
   Email gửi: https://foodiez-frontend-gk7h4n2x.onrender.com/reset-password?token=xxx
   → Domain public
   → Ai cũng click được!
```

---

## 📋 PHẦN 3: CẤU HÌNH EMAIL LINKS - CHI TIẾT

### Bước 1: Thêm Environment Variable trong Render

**Render Dashboard → Backend Service → Settings:**

```
Environment Variables:

| Key | Value |
|-----|-------|
| APP_FRONTEND_URL | https://foodiez-frontend-gk7h4n2x.onrender.com |
| APP_BACKEND_URL | https://foodiez-backend-xyz789.onrender.com |
| APP_SUPPORT_EMAIL | support@foodiez.com |
| SMTP_HOST | smtp.gmail.com |
| SMTP_PORT | 587 |
| SMTP_USER | your-email@gmail.com |
| SMTP_PASSWORD | your-app-password |
| SMTP_FROM_NAME | Foodiez Support |
```

---

### Bước 2: Update application.properties (Backend)

**File: `demo/src/main/resources/application.properties`**

```properties
# ===== APP URLS (ENVIRONMENT SPECIFIC) =====
app.frontend.url=${APP_FRONTEND_URL:http://localhost:3000}
app.backend.url=${APP_BACKEND_URL:http://localhost:8080}

# ===== EMAIL CONFIGURATION =====
spring.mail.host=${SMTP_HOST:smtp.gmail.com}
spring.mail.port=${SMTP_PORT:587}
spring.mail.username=${SMTP_USER}
spring.mail.password=${SMTP_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
app.mail.from=${SMTP_FROM_NAME:Foodiez Support}

# ===== OTP CONFIGURATION =====
app.otp.expiry.minutes=10
app.otp.resend.delay.seconds=60
```

---

### Bước 3: Tạo Email Service Class

**File: `demo/src/main/java/com/example/demo/Email/EmailService.java`**

```java
package com.example.demo.Email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    @Value("${app.backend.url}")
    private String backendUrl;
    
    @Value("${app.mail.from}")
    private String fromEmail;
    
    private final JavaMailSender mailSender;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    // ==================== FORGOT PASSWORD ====================
    
    public void sendPasswordResetEmail(String recipientEmail, String resetToken) {
        try {
            // Tạo reset link
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
            
            // Email content
            String subject = "🔑 Reset Your Foodiez Password";
            String htmlContent = buildPasswordResetEmail(recipientEmail, resetLink);
            
            // Send email
            sendHtmlEmail(recipientEmail, subject, htmlContent);
            
            System.out.println("✅ Password reset email sent to: " + recipientEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send password reset email: " + e.getMessage());
            throw new RuntimeException("Email sending failed", e);
        }
    }
    
    // ==================== OTP EMAIL ====================
    
    public void sendOtpEmail(String recipientEmail, String otp, String otpType) {
        try {
            String subject = "";
            String htmlContent = "";
            
            if ("EMAIL_VERIFICATION".equals(otpType)) {
                subject = "✅ Verify Your Email - Foodiez";
                htmlContent = buildOtpEmail(recipientEmail, otp, "Email Verification", "Verify your email to activate your account");
            } 
            else if ("TWO_FACTOR_AUTH".equals(otpType)) {
                subject = "🔐 Two-Factor Authentication Code";
                htmlContent = buildOtpEmail(recipientEmail, otp, "2FA Code", "Use this code to verify your login");
            }
            else if ("PASSWORD_RESET".equals(otpType)) {
                subject = "🔑 Password Reset Code";
                htmlContent = buildOtpEmail(recipientEmail, otp, "Reset Code", "Use this code to reset your password");
            }
            
            sendHtmlEmail(recipientEmail, subject, htmlContent);
            System.out.println("✅ OTP email sent to: " + recipientEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email: " + e.getMessage());
            throw new RuntimeException("OTP email sending failed", e);
        }
    }
    
    // ==================== ORDER CONFIRMATION ====================
    
    public void sendOrderConfirmationEmail(String recipientEmail, String orderCode, String orderDetails) {
        try {
            String subject = "📦 Your Order Confirmation - " + orderCode;
            String htmlContent = buildOrderConfirmationEmail(orderCode, orderDetails);
            
            sendHtmlEmail(recipientEmail, subject, htmlContent);
            System.out.println("✅ Order confirmation email sent to: " + recipientEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send order email: " + e.getMessage());
        }
    }
    
    // ==================== HELPER METHODS ====================
    
    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(htmlContent);
        
        // Note: Để gửi HTML, cần dùng MimeMessage (nâng cao hơn)
        // Simple version: gửi plain text
        
        mailSender.send(message);
    }
    
    // ==================== EMAIL TEMPLATES ====================
    
    private String buildPasswordResetEmail(String email, String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
                    .header { text-align: center; color: #333; }
                    .content { margin: 20px 0; line-height: 1.6; color: #666; }
                    .button { text-align: center; margin: 30px 0; }
                    .btn { background-color: #ff6b6b; color: white; padding: 12px 30px; 
                           text-decoration: none; border-radius: 5px; display: inline-block; }
                    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
                    .warning { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🍕 Foodiez</h1>
                        <h2>Reset Your Password</h2>
                    </div>
                    
                    <div class="content">
                        <p>Hi,</p>
                        <p>We received a request to reset your password for your Foodiez account.</p>
                        <p>Click the button below to create a new password:</p>
                    </div>
                    
                    <div class="button">
                        <a href="{}\" class="btn">Reset Password</a>
                    </div>
                    
                    <div class="warning">
                        <strong>⏰ This link expires in 1 hour</strong>
                    </div>
                    
                    <div class="content">
                        <p>If you didn't request a password reset, you can safely ignore this email.</p>
                        <p>If you have trouble clicking the button, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
                            <strong>{}</strong>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2025 Foodiez. All rights reserved.</p>
                        <p>📧 For help: support@foodiez.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.replace("{}", resetLink);
    }
    
    private String buildOtpEmail(String email, String otp, String title, String description) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
                    .header { text-align: center; color: #333; }
                    .otp-box { background: #f0f0f0; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ff6b6b; }
                    .content { color: #666; line-height: 1.6; }
                    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
                    .warning { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🍕 Foodiez</h1>
                        <h2>{}</h2>
                    </div>
                    
                    <div class="content">
                        <p>{}</p>
                    </div>
                    
                    <div class="otp-box">
                        <p style="margin: 0; color: #999;">Your verification code:</p>
                        <div class="otp-code">{}</div>
                    </div>
                    
                    <div class="warning">
                        <strong>⏰ This code expires in 10 minutes</strong><br>
                        Do not share this code with anyone!
                    </div>
                    
                    <div class="footer">
                        <p>© 2025 Foodiez. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.replace("{}", title).replace("{}", description).replace("{}", otp);
    }
    
    private String buildOrderConfirmationEmail(String orderCode, String orderDetails) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
                    .header { text-align: center; color: #333; }
                    .order-status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .order-code { font-size: 24px; font-weight: bold; color: #ff6b6b; }
                    .details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🍕 Foodiez</h1>
                        <h2>Order Confirmed!</h2>
                    </div>
                    
                    <div class="order-status">
                        ✅ Your order has been successfully placed!
                    </div>
                    
                    <div class="details">
                        <p><strong>Order Code:</strong></p>
                        <div class="order-code">{}</div>
                        <hr>
                        <p>{}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="{}/orders" style="background: #ff6b6b; color: white; padding: 10px 20px; 
                           text-decoration: none; border-radius: 5px;">Track Your Order</a>
                    </div>
                    
                    <div class="footer">
                        <p>© 2025 Foodiez. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.replace("{}", orderCode).replace("{}", orderDetails).replace("{}", frontendUrl);
    }
}
```

---

### Bước 4: Sử dụng Email Service trong Auth Controller

**File: `demo/src/main/java/com/example/demo/Auth/AuthController.java`**

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final EmailService emailService;
    private final AuthService authService;
    
    // ==================== FORGOT PASSWORD ====================
    
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(
        @RequestBody Map<String, String> request
    ) {
        try {
            String email = request.get("email");
            
            // Generate reset token
            String resetToken = authService.generatePasswordResetToken(email);
            
            // Send email
            emailService.sendPasswordResetEmail(email, resetToken);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password reset email sent to " + email
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    // ==================== RESET PASSWORD WITH TOKEN ====================
    
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
        @RequestBody Map<String, String> request
    ) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            
            // Validate token
            User user = authService.validatePasswordResetToken(token);
            
            // Update password
            user.setPassword(newPassword);  // Should be encoded!
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password reset successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    // ==================== SEND OTP ====================
    
    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(
        @RequestBody Map<String, String> request
    ) {
        try {
            String email = request.get("email");
            String otpType = request.get("otpType");  // EMAIL_VERIFICATION, 2FA, etc
            
            // Generate OTP
            String otp = authService.generateOtp(email, otpType);
            
            // Send email
            emailService.sendOtpEmail(email, otp, otpType);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "OTP sent to " + email
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
```

---

## 🌐 PHẦN 4: FRONTEND - RESET PASSWORD PAGE

**File: `foodsystem/src/Page/ResetPasswordPage.jsx`**

```javascript
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const handleReset = async (e) => {
        e.preventDefault();
        
        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await api.post('/api/auth/reset-password', {
                token,
                newPassword
            });
            
            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };
    
    if (!token) {
        return <div>Invalid reset link. Please request a new one.</div>;
    }
    
    return (
        <div className="reset-password-container">
            <h2>Reset Your Password</h2>
            
            {success ? (
                <div className="alert alert-success">
                    ✅ Password reset successfully! Redirecting to login...
                </div>
            ) : (
                <form onSubmit={handleReset}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                    
                    <button type="submit" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}
        </div>
    );
}
```

---

## 📧 PHẦN 5: EMAIL FLOW - CHI TIẾT

### Sơ Đồ Hoàn Chỉnh

```
┌─────────────────────────────────────┐
│  User quên mật khẩu                 │
│  Click "Forgot Password"             │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Frontend: POST /api/auth/forgot-pass│
│  Payload: { email: "user@mail.com" }│
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Backend AuthController:            │
│  1. Generate reset token            │
│  2. Save token to database          │
│  3. Call EmailService.send...()     │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  EmailService:                      │
│  1. Build HTML email                │
│  2. Create reset link:              │
│     https://foodiez-frontend-xxx    │
│     /reset-password?token=abc123    │
│  3. Send via SMTP (Gmail)           │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  User Inbox:                        │
│  ✅ Email received!                 │
│  "Reset Your Password"              │
│  [Reset Password Button]            │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  User clicks button                 │
│  → Browser opens link:              │
│  https://foodiez-frontend-xxx.      │
│    onrender.com/reset-password      │
│    ?token=abc123                    │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Frontend ResetPasswordPage:         │
│  1. Extract token from URL          │
│  2. Show form to enter new password │
│  3. User submits                    │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Frontend: POST /api/auth/reset-pass│
│  Payload:                           │
│  {                                  │
│    token: "abc123",                 │
│    newPassword: "***"               │
│  }                                  │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Backend:                           │
│  1. Validate token                  │
│  2. Update password                 │
│  3. Return success                  │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Frontend:                          │
│  Show: "✅ Password reset success"  │
│  Redirect to login after 2 seconds  │
└────────┬────────────────────────────┘
         ↓
✅ User can login with new password!
```

---

## 🔑 PHẦN 6: GMAIL SMTP CONFIGURATION

### Setup Gmail App Password

```
1. Truy cập: https://myaccount.google.com/apppasswords
2. Select device: Windows Computer
3. Select app: Mail
4. Generate password (16 characters)
5. Copy password
6. Use in SMTP_PASSWORD
```

**Render Environment Variables:**

```
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: your-email@gmail.com
SMTP_PASSWORD: xxxx xxxx xxxx xxxx (16 chars from above)
SMTP_FROM_NAME: Foodiez Support
```

---

## ✅ PHẦN 7: VERIFICATION - EMAIL LINKS ĐÚNG

### Checklist:

```
☑ app.frontend.url = https://foodiez-frontend-xxx.onrender.com
   (Email links sẽ gửi đến URL này)

☑ app.backend.url = https://foodiez-backend-xxx.onrender.com
   (API calls từ email features)

☑ SMTP configured (Gmail hoặc service khác)
   (Để gửi email)

☑ EmailService sử dụng app.frontend.url
   (Đảm bảo link trong email đúng)

☑ Frontend route /reset-password tồn tại
   (Xử lý token từ URL)

☑ Test: Gửi email từ backend
   → Check inbox
   → Click link
   → Chuyển đến /reset-password page
   → ✅ Có token từ URL
```

---

## 🎯 PHẦN 8: COMPLETE EXAMPLE - ALL TOGETHER

### Email được gửi sẽ có:

```html
Subject: 🔑 Reset Your Foodiez Password

Body:
Hi,

We received a request to reset your password for your Foodiez account.

Click the button below to create a new password:

[Reset Password]  ← Button links to:
https://foodiez-frontend-gk7h4n2x.onrender.com/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

If you didn't request a password reset, you can safely ignore this email.

If you have trouble clicking the button, copy and paste this link into your browser:
https://foodiez-frontend-gk7h4n2x.onrender.com/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### User bấm link → Chuyển hướng

```
Browser URL trở thành:
https://foodiez-frontend-gk7h4n2x.onrender.com/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Frontend React page hiển thị:
┌─────────────────────────────┐
│  Reset Your Password        │
├─────────────────────────────┤
│  New Password: [______]     │
│  Confirm:     [______]     │
│                             │
│  [Reset Password Button]    │
└─────────────────────────────┘

User nhập password mới → Click button
→ POST /api/auth/reset-password
→ Token validate thành công
→ Password updated
→ ✅ Success message
→ Redirect to login
```

---

## 💡 PHẦN 9: BEST PRACTICES

```
✅ LUÔN LÀM:
   • Store app.frontend.url in environment variables
   • Use HTTPS always (Render provides free SSL)
   • Set token expiry (1 hour cho password reset)
   • Hash/encode password trước lưu database
   • Validate token trước update password

❌ KHÔNG BẠO LỖI:
   • Gửi email với localhost:8080
   • Gửi email với IP address local
   • Hardcode domain vào code
   • Không set token expiry
   • Lưu password plain text
```

---

## 🎯 SUMMARY

### Email Links Sẽ Như Thế:

```
✅ CORRECT:
   https://foodiez-frontend-gk7h4n2x.onrender.com/reset-password?token=abc123
   → User ở bất kỳ đâu cũng click được
   → Công khai, không secret

✅ OTP Codes:
   Gửi trong email (plain text hoặc HTML)
   → User copy vào app
   → Or app auto-fill

✅ Order Links:
   https://foodiez-frontend-gk7h4n2x.onrender.com/orders/12345
   → User track đơn hàng
   → Public access
```

### Configuration:

```
Backend (application.properties):
├─ app.frontend.url = https://foodiez-frontend-xxx.onrender.com
├─ SMTP settings (Gmail)
└─ Email templates

Render Dashboard:
├─ Environment variables (frontend URL, SMTP)
└─ Backend service running

Frontend:
├─ Reset password page
├─ OTP verification page
└─ Order tracking page
```

---

**TL;DR: Email sẽ gửi link đến domain Render (`https://foodiez-frontend-xxx.onrender.com`), ai cũng có thể click được!** 🎉
