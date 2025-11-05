package com.example.demo.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

/**
 * OAuth2 Configuration
 * This bean is only created when OAuth2 properties are configured in application.properties
 * If OAuth2 is disabled, Spring Boot will auto-configure this from properties when available
 */
@Configuration
public class OAuth2Config {

    /**
     * Create ClientRegistrationRepository bean only when OAuth2 is enabled
     * This prevents the error when oauth2Login() is configured but no ClientRegistrationRepository exists
     * 
     * Note: Spring Boot will auto-configure this from application.properties when:
     * - spring.security.oauth2.client.registration.google.client-id is set
     * - spring.security.oauth2.client.registration.google.client-secret is set
     * 
     * If you want to manually configure, uncomment the properties in application.properties
     * and this bean will not be needed (Spring Boot auto-configuration will handle it)
     */
    @Bean
    @ConditionalOnProperty(
        prefix = "spring.security.oauth2.client.registration.google",
        name = "client-id"
    )
    public ClientRegistrationRepository clientRegistrationRepository() {
        // This will be auto-configured by Spring Boot from application.properties
        // when OAuth2 properties are present
        return null; // Spring Boot will provide the actual implementation
    }

    /**
     * Alternative: Create a minimal ClientRegistrationRepository when OAuth2 config is missing
     * This prevents errors when oauth2Login() is enabled but no config exists
     * 
     * Uncomment this method if you want to provide a fallback empty repository
     */
    /*
    @Bean
    @ConditionalOnMissingBean(ClientRegistrationRepository.class)
    public ClientRegistrationRepository emptyClientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository();
    }
    */
}

