package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.core.io.Resource;
import java.io.IOException;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Only configure specific paths for static resources, leave /api/** for controllers
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
        
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        
        System.out.println("📁 Static resources configured: /uploads/**, /static/**");
    }
}