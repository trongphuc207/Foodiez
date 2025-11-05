package com.example.demo.categories;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Data Initializer để tự động seed categories khi ứng dụng khởi động
 */
@Component
public class CategoryDataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(CategoryDataInitializer.class);
    
    private final CategoryService categoryService;
    
    @Autowired
    public CategoryDataInitializer(CategoryService categoryService) {
        this.categoryService = categoryService;
    }
    
    @Override
    public void run(String... args) throws Exception {
        try {
            logger.info("🌱 Checking categories data...");
            long categoryCount = categoryService.getCategoryCount();
            
            if (categoryCount == 0) {
                logger.warn("⚠️ No categories found in database. Initializing default categories...");
                String result = categoryService.seedData();
                logger.info("✅ Category initialization result: {}", result);
            } else {
                logger.info("✅ Found {} categories in database. No initialization needed.", categoryCount);
            }
        } catch (Exception e) {
            logger.error("❌ Error initializing categories: {}", e.getMessage(), e);
            // Không throw exception để ứng dụng vẫn có thể khởi động
        }
    }
}



