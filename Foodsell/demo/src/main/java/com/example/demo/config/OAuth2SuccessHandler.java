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
        
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");
        
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
        
        // Redirect to frontend with token
        String redirectUrl = "http://localhost:3000/auth/success?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}
