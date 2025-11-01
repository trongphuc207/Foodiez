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
    
    private boolean isPublicEndpoint(String uri, String method) {
        return uri.startsWith("/api/auth/login") ||
               uri.startsWith("/api/auth/register") ||
               uri.startsWith("/api/auth/verify") ||
               uri.startsWith("/api/auth/forgot-password") ||
               uri.startsWith("/api/auth/reset-password") ||
               // Allow validating reset tokens without a Bearer JWT
               uri.startsWith("/api/auth/validate-reset-token") ||
               // Allow Google auth endpoints (login via Google should be public)
               uri.startsWith("/api/auth/google") ||
               (uri.startsWith("/api/products") && method.equals("GET")) ||
               (uri.startsWith("/api/categories") && method.equals("GET")) ||
               (uri.startsWith("/api/shops") && method.equals("GET")) ||
               uri.startsWith("/api/payos/webhook") ||
               uri.startsWith("/uploads/") ||
               uri.startsWith("/login/oauth2/code/");
    };
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        
        // Kiểm tra nếu request là cho public endpoint
        if (isPublicEndpoint(requestURI, method)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        System.out.println("\n🔍 JWT Filter - Processing protected endpoint: " + method + " " + requestURI);
        
        // Extract và validate token
        String token = extractTokenFromRequest(request);
        if (token == null) {
            System.out.println("❌ No token found for protected endpoint");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized: No token provided\"}");
            return;
        }
        
        try {
            if (!jwtUtil.validateToken(token)) {
                System.out.println("❌ Invalid token");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Unauthorized: Invalid token\"}");
                return;
            }

            // Lấy email từ token
            String email = jwtUtil.getEmailFromToken(token);
            
            // Load user từ database
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                // Tạo authorities từ role
                List<GrantedAuthority> authorities = new ArrayList<>();
                if (user.getRole() != null) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()));
                }
                
                // Tạo Authentication object với authorities
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        user, 
                        null, 
                        authorities
                    );
                
                // Set authentication vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                System.out.println("✅ JWT Authentication successful for user: " + email);
                System.out.println("👤 User details - ID: " + user.getId() + ", Role: " + user.getRole());
                System.out.println("🔒 Authorities granted: " + authorities);
            } else {
                System.out.println("❌ User not found for email: " + email);
                throw new ServletException("User not found");
            }
            
            // Continue với filter chain
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            System.err.println("❌ JWT authentication failed: " + e.getMessage());
            e.printStackTrace(); // Print stack trace for debugging
            
            // Clear security context if authentication fails
            SecurityContextHolder.clearContext();
            
            // Set error response
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        System.out.println("🔑 Authorization header: " + (bearerToken != null ? "Present" : "Not present"));
        
        if (bearerToken == null) {
            return null;
        }
        
        if (!bearerToken.startsWith("Bearer ")) {
            System.out.println("❌ Invalid token format - Missing 'Bearer ' prefix");
            return null;
        }
        
        String token = bearerToken.substring(7);
        System.out.println("🔑 Token format validation: OK");
        return token;
    }
}
