package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/products/**").permitAll()
                .requestMatchers("/api/categories/**").permitAll()
                .requestMatchers("/api/shops/**").permitAll()
                .requestMatchers("/api/orders/test").permitAll()
                .requestMatchers("/api/payos/**").permitAll()
                .requestMatchers("/test/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/login/oauth2/code/**").permitAll()
                .requestMatchers("/oauth2/authorization/**").permitAll()
                .requestMatchers("/ws-chat/**").permitAll()
                
                // Voucher endpoints (public for now, can be restricted later)
                .requestMatchers("/api/vouchers/**").permitAll()
                
                // Review endpoints (public for reading reviews and stats)
                .requestMatchers("/api/reviews/product/**").permitAll()
                .requestMatchers("/api/reviews/shop/**").permitAll()
                .requestMatchers("/api/reviews/*/replies").permitAll()
                // .requestMatchers("/api/reviews").permitAll() // POST reviews cần authentication
                
                // Notification system endpoints (public for system calls)
                .requestMatchers("/api/notifications/system/**").permitAll()
                // User notification endpoints (require authentication)
                .requestMatchers("/api/notifications/my-notifications").authenticated()
                .requestMatchers("/api/notifications/unread").authenticated()
                .requestMatchers("/api/notifications/unread-count").authenticated()
                .requestMatchers("/api/notifications/*/read").authenticated()
                .requestMatchers("/api/notifications/mark-all-read").authenticated()
                // Admin notification endpoints
                .requestMatchers("/api/notifications").hasAnyRole("ADMIN", "admin")
                .requestMatchers("/api/notifications/*").hasAnyRole("ADMIN", "admin")
                .requestMatchers("/api/notifications/admin/**").hasAnyRole("ADMIN", "admin")
                
                // Customer endpoints (accessible by all authenticated users)
                .requestMatchers("/api/customer/**").authenticated()
                .requestMatchers("/api/orders/buyer/**").authenticated()
                .requestMatchers("/api/orders").authenticated()
                .requestMatchers("/api/cart/**").authenticated()
                .requestMatchers("/api/favorites/**").authenticated()
                
                // Seller endpoints
                .requestMatchers("/api/seller/**").hasAnyRole("SELLER", "ADMIN")
                
                // Shipper endpoints  
                .requestMatchers("/api/shipper/**").hasAnyRole("SHIPPER", "ADMIN")
                
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/admin/**").hasRole("ADMIN")
                // Chat endpoints
                .requestMatchers("/api/chat/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/chat/**").authenticated()
                
                // All other requests need authentication
                .anyRequest().authenticated()
            )
            // OAuth2 temporarily disabled for testing
            // .oauth2Login(oauth2 -> oauth2
            //     .successHandler(oAuth2SuccessHandler)
            //     .defaultSuccessUrl("http://localhost:3000/auth/success", true)
            // )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }
}