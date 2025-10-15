package com.example.demo.config;

import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
        // 1. Extract token từ request
        String token = extractTokenFromRequest(request);
        
        if (token != null && jwtUtil.validateToken(token)) {
            try {
                // 2. Lấy email từ token
                String email = jwtUtil.getEmailFromToken(token);
                
                // 3. Load user từ database
                Optional<User> userOpt = userRepository.findByEmail(email);
                
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    
                    // 4. Tạo authorities từ role
                    List<GrantedAuthority> authorities = new ArrayList<>();
                    if (user.getRole() != null) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()));
                    }
                    
                    // 5. Tạo Authentication object với authorities
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            user, 
                            null, 
                            authorities
                        );
                    
                    // 6. Set authentication vào SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    System.out.println("✅ JWT Authentication successful for user: " + email + " with role: " + user.getRole());
                }
            } catch (Exception e) {
                // Log error nhưng không throw exception
                System.err.println("❌ JWT authentication failed: " + e.getMessage());
                // Clear security context if authentication fails
                SecurityContextHolder.clearContext();
            }
        }
        
        // 6. Continue với filter chain
        filterChain.doFilter(request, response);
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
