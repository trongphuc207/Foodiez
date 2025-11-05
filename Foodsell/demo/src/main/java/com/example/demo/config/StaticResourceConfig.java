package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload.base-dir:uploads}")
    private String uploadBaseDir;

    private String fileLocation(String... more) {
        Path p = Paths.get(uploadBaseDir, more).toAbsolutePath().normalize();
        return "file:" + p.toString() + (p.toString().endsWith("/") ? "" : "/");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from a configurable base directory
        registry.addResourceHandler("/uploads/**").addResourceLocations(fileLocation());
        registry.addResourceHandler("/uploads/product-images/**").addResourceLocations(fileLocation("product-images"));
        registry.addResourceHandler("/uploads/profile-images/**").addResourceLocations(fileLocation("profile-images"));
        registry.addResourceHandler("/uploads/chat/**").addResourceLocations(fileLocation("chat"));
        registry.addResourceHandler("/uploads/reviews/**").addResourceLocations(fileLocation("reviews"));
    }
}