package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from the uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
        
        // Serve product images
        registry.addResourceHandler("/uploads/product-images/**")
                .addResourceLocations("file:./uploads/product-images/");
        
        System.out.println("📁 Static resources configured for: ./uploads/");
        System.out.println("📁 Product images configured for: ./uploads/product-images/");
    }
}