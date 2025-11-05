package com.example.demo.config;

import org.springframework.context.annotation.Configuration;

/**
 * OAuth2 Configuration
 * Spring Boot will auto-configure ClientRegistrationRepository from application.properties
 * when OAuth2 client properties are configured
 */
@Configuration
public class OAuth2Config {
    // Spring Boot auto-configuration will handle OAuth2 setup
    // based on properties in application.properties
}

