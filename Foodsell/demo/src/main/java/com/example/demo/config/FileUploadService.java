package com.example.demo.config;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {
    
    private final String uploadDir = "uploads/profile-images/";
    
    public String uploadProfileImage(MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !isValidImageType(contentType)) {
            throw new RuntimeException("Invalid file type. Only JPG, PNG, GIF are allowed");
        }
        
        // Check file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size too large. Maximum 5MB allowed");
        }
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        
        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        System.out.println("✅ Profile image uploaded: " + uniqueFilename);
        
        // Return relative path for storage in database
        return uploadDir + uniqueFilename;
    }
    
    public void deleteProfileImage(String imagePath) {
        try {
            if (imagePath != null && !imagePath.isEmpty()) {
                Path path = Paths.get(imagePath);
                Files.deleteIfExists(path);
                System.out.println("✅ Profile image deleted: " + imagePath);
            }
        } catch (IOException e) {
            System.err.println("❌ Failed to delete profile image: " + imagePath);
            System.err.println("Error: " + e.getMessage());
        }
    }
    
    private boolean isValidImageType(String contentType) {
        return contentType.equals("image/jpeg") || 
               contentType.equals("image/jpg") || 
               contentType.equals("image/png") || 
               contentType.equals("image/gif");
    }
}
