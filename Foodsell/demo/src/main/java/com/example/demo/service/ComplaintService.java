package com.example.demo.service;

import com.example.demo.entity.Complaint;
import com.example.demo.entity.ComplaintImage;
import com.example.demo.entity.ComplaintResponse;
import com.example.demo.repository.ComplaintRepository;
import com.example.demo.admin.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbc;

    private static final String UPLOAD_DIR = "uploads/complaint-images/";

    // Create new complaint
    @Transactional
    public Complaint createComplaint(Complaint complaint) {
        // Generate unique complaint number if not provided
        if (complaint.getComplaintNumber() == null || complaint.getComplaintNumber().isEmpty()) {
            complaint.setComplaintNumber(generateComplaintNumber());
        }
        
        complaint.setStatus("pending");
        complaint.setPriority(complaint.getPriority() != null ? complaint.getPriority() : "normal");
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());
        
        System.out.println("💾 Saving complaint: " + complaint.getComplaintNumber() + " from user " + complaint.getComplainantId());
        return complaintRepository.save(complaint);
    }
    
    // Generate unique complaint number
    private String generateComplaintNumber() {
        String prefix = "CPL";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.format("%04d", (int)(Math.random() * 10000));
        return prefix + timestamp.substring(timestamp.length() - 8) + random;
    }

    // Get complaint by ID
    public Complaint getComplaintById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
    }

    // Get complaint by number
    public Complaint getComplaintByNumber(String complaintNumber) {
        return complaintRepository.findByComplaintNumber(complaintNumber)
                .orElseThrow(() -> new RuntimeException("Complaint not found with number: " + complaintNumber));
    }

    // Get complaints by complainant
    public List<Complaint> getComplaintsByComplainant(Long complainantId) {
        return complaintRepository.findByComplainantIdOrderByCreatedAtDesc(complainantId);
    }

    // Get complaints against a user
    public List<Complaint> getComplaintsAgainstUser(Long respondentId) {
        return complaintRepository.findByRespondentIdOrderByCreatedAtDesc(respondentId);
    }

    // Get all complaints (admin)
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // Get pending complaints
    public List<Complaint> getPendingComplaints() {
        return complaintRepository.findAllPendingComplaints();
    }

    // Get complaints by status
    public List<Complaint> getComplaintsByStatus(String status) {
        return complaintRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    // Update complaint status
    @Transactional
    public Complaint updateComplaintStatus(Long id, String status, Long adminId) {
        Complaint complaint = getComplaintById(id);
        complaint.setStatus(status);
        complaint.setUpdatedAt(LocalDateTime.now());
        
        if (adminId != null && complaint.getAssignedAdminId() == null) {
            complaint.setAssignedAdminId(adminId);
        }
        
        if ("resolved".equals(status) || "rejected".equals(status)) {
            complaint.setResolvedAt(LocalDateTime.now());
        }
        
        return complaintRepository.save(complaint);
    }

    // Assign complaint to admin
    @Transactional
    public Complaint assignComplaint(Long id, Long adminId) {
        Complaint complaint = getComplaintById(id);
        complaint.setAssignedAdminId(adminId);
        complaint.setStatus("under_review");
        complaint.setUpdatedAt(LocalDateTime.now());
        return complaintRepository.save(complaint);
    }

    // Make admin decision
    @Transactional
    public Complaint makeDecision(Long id, String decision, String reason, String adminNote) {
        Complaint complaint = getComplaintById(id);
        complaint.setAdminDecision(decision);
        complaint.setDecisionReason(reason);
        complaint.setAdminNote(adminNote);
        complaint.setUpdatedAt(LocalDateTime.now());
        
        if ("approved".equals(decision)) {
            complaint.setStatus("resolved");
            complaint.setResolvedAt(LocalDateTime.now());
            
            // If this is an account_ban complaint and approved, unban the user
            if ("account_ban".equals(complaint.getCategory()) && complaint.getComplainantId() != null) {
                try {
                    adminRepository.setUserBanned(complaint.getComplainantId().intValue(), false);
                    System.out.println("✅ User " + complaint.getComplainantId() + " unbanned due to approved complaint #" + id);
                } catch (Exception e) {
                    System.err.println("❌ Failed to unban user " + complaint.getComplainantId() + ": " + e.getMessage());
                }
            }
            
            // If this is a shop_ban complaint and approved, unban the shop
            if ("shop_ban".equals(complaint.getCategory()) && complaint.getComplainantId() != null) {
                try {
                    // Find shop by seller_id (complainantId is the seller's userId)
                    Integer shopCount = jdbc.queryForObject(
                        "SELECT COUNT(1) FROM shops WHERE seller_id = ?", 
                        Integer.class, 
                        complaint.getComplainantId().intValue()
                    );
                    
                    if (shopCount != null && shopCount > 0) {
                        jdbc.update(
                            "UPDATE shops SET is_banned = 0, ban_reason = NULL WHERE seller_id = ?",
                            complaint.getComplainantId().intValue()
                        );
                        System.out.println("✅ Shop of seller " + complaint.getComplainantId() + " unbanned due to approved complaint #" + id);
                        
                        // Also unban the user account
                        adminRepository.setUserBanned(complaint.getComplainantId().intValue(), false);
                        System.out.println("✅ User " + complaint.getComplainantId() + " also unbanned");
                    }
                } catch (Exception e) {
                    System.err.println("❌ Failed to unban shop for seller " + complaint.getComplainantId() + ": " + e.getMessage());
                }
            }
        } else if ("rejected".equals(decision)) {
            complaint.setStatus("rejected");
            complaint.setResolvedAt(LocalDateTime.now());
        }
        
        return complaintRepository.save(complaint);
    }

    // Add response to complaint
    @Transactional
    public ComplaintResponse addResponse(Long complaintId, Long userId, String userRole, String message, Boolean isInternal) {
        Complaint complaint = getComplaintById(complaintId);
        
        ComplaintResponse response = new ComplaintResponse();
        response.setComplaint(complaint);
        response.setUserId(userId);
        response.setUserRole(userRole);
        response.setMessage(message);
        response.setIsInternalNote(isInternal != null ? isInternal : false);
        response.setCreatedAt(LocalDateTime.now());
        
        complaint.addResponse(response);
        complaint.setUpdatedAt(LocalDateTime.now());
        complaintRepository.save(complaint);
        
        return response;
    }

    // Upload complaint image
    @Transactional
    public ComplaintImage uploadImage(Long complaintId, MultipartFile file, String imageType, String description) throws IOException {
        Complaint complaint = getComplaintById(complaintId);
        
        // Create upload directory if not exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : "";
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        
        // Create image record
        ComplaintImage image = new ComplaintImage();
        image.setComplaint(complaint);
        image.setImageUrl("/uploads/complaint-images/" + filename);
        image.setImageType(imageType != null ? imageType : "evidence");
        image.setDescription(description);
        image.setUploadedAt(LocalDateTime.now());
        
        complaint.addImage(image);
        complaint.setUpdatedAt(LocalDateTime.now());
        complaintRepository.save(complaint);
        
        return image;
    }

    // Search complaints
    public List<Complaint> searchComplaints(String keyword) {
        return complaintRepository.searchComplaints(keyword);
    }

    // Get statistics
    public List<Object[]> getStatsByStatus() {
        return complaintRepository.getComplaintStatsByStatus();
    }

    public List<Object[]> getStatsByCategory() {
        return complaintRepository.getComplaintStatsByCategory();
    }

    // Delete complaint (only if pending and by complainant)
    @Transactional
    public void deleteComplaint(Long id, Long userId) {
        Complaint complaint = getComplaintById(id);
        
        if (!complaint.getComplainantId().equals(userId)) {
            throw new RuntimeException("You can only delete your own complaints");
        }
        
        if (!"pending".equals(complaint.getStatus())) {
            throw new RuntimeException("Cannot delete complaint that is already being reviewed");
        }
        
        complaintRepository.delete(complaint);
    }
}
