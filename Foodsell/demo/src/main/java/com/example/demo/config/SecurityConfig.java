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

                .requestMatchers("/api/auth/**").permitAll() // Allow all auth endpoints
                .requestMatchers("/api/products/**").permitAll() // Allow all products endpoints
                .requestMatchers("/api/categories/**").permitAll() // Allow all categories endpoints
                .requestMatchers("/api/shops/**").permitAll() // Allow all shops endpoints
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/login/oauth2/code/**").permitAll()
                // Protected endpoints
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
=======
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/products/**").permitAll()
                .requestMatchers("/api/orders/test").permitAll()
                .requestMatchers("/api/payos/**").permitAll()
                .requestMatchers("/test/**").permitAll()
                
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