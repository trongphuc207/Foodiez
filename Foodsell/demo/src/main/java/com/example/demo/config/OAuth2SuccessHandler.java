package com.example.demo.config;

import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        System.out.println("🔐 OAuth2 Authentication Success Handler triggered");
        
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        System.out.println("👤 OAuth2User details: " + oauth2User.getAttributes());
        
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        
        if (email == null) {
            System.out.println("❌ Error: No email found in OAuth2User attributes");
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "No email found in OAuth2 response");
            return;
        }
        
        System.out.println("🔍 Google OAuth2 Login - Email: " + email + ", Name: " + name);
        
        // Check if user exists
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
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            user = userRepository.save(user);
            System.out.println("✅ New user created: " + user.getEmail());
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());
        
        // Return JSON response
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String jsonResponse = String.format(
            "{\"success\":true,\"data\":{\"user\":{\"id\":%d,\"email\":\"%s\",\"fullName\":\"%s\",\"role\":\"%s\"},\"token\":\"%s\"},\"message\":\"Google login successful\"}",
            user.getId(), user.getEmail(), user.getFullName(), user.getRole(), token
        );
        
        response.getWriter().write(jsonResponse);
    }
}