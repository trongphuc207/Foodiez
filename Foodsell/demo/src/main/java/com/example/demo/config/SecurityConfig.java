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
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource, OAuth2SuccessHandler oauth2SuccessHandler) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oauth2SuccessHandler)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/verify").permitAll()
                .requestMatchers("/api/auth/validate-reset-token").permitAll()
                .requestMatchers("/api/auth/forgot-password").permitAll()
                .requestMatchers("/api/auth/reset-password").permitAll()
                .requestMatchers("/api/auth/google").permitAll()
                .requestMatchers("/login/oauth2/code/**").permitAll()
                .requestMatchers("/oauth2/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/shops/**").permitAll()
                .requestMatchers("/api/payos/webhook").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/login/oauth2/code/**").permitAll()
                
                // Voucher endpoints (public for now, can be restricted later)
                .requestMatchers("/api/vouchers/**").permitAll()
                
                // Customer endpoints (accessible by all authenticated users)
                .requestMatchers("/api/customer/**").authenticated()
                .requestMatchers("/api/orders/buyer/**").authenticated()
                .requestMatchers("/api/orders").authenticated()
                .requestMatchers("/api/cart/test").permitAll()  // Test endpoint
                .requestMatchers("/api/cart/test-cart").authenticated()  // Test CartService endpoint
                .requestMatchers("/api/cart/**").authenticated()
                // Temporarily allow favorites endpoints for testing; restore to authenticated() after tests
                .requestMatchers("/api/favorites/**").permitAll()
                .requestMatchers("/api/auth/test-auth").authenticated()
                .requestMatchers("/api/shops/*/orders").authenticated()
                
                // Seller endpoints
                .requestMatchers("/api/seller/**").hasAnyRole("SELLER", "ADMIN")
                
                // Shipper endpoints  
                .requestMatchers("/api/shipper/**").hasAnyRole("SHIPPER", "ADMIN")
                
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Order status update endpoint (for payment callbacks)
                .requestMatchers(HttpMethod.PUT, "/api/orders/customer/orders/*/status")
                .permitAll()
                
                // All other requests need authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }
}