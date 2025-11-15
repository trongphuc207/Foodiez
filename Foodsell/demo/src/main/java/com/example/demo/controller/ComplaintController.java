package com.example.demo.controller;

import com.example.demo.entity.Complaint;
import com.example.demo.entity.ComplaintImage;
import com.example.demo.entity.ComplaintResponse;
import com.example.demo.service.ComplaintService;
import com.example.demo.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:3000")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private JwtUtil jwtUtil;

    // Create complaint for banned users (no token required)
    @PostMapping("/banned-user")
    public ResponseEntity<?> createBannedUserComplaint(@RequestBody Complaint complaint) {
        try {
            // Validate required fields for banned user complaints
            if (complaint.getComplainantId() == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Set default values for banned user complaints
            complaint.setComplainantType("user");
            complaint.setCategory("account_ban");
            complaint.setRespondentType("admin");
            complaint.setPriority("high");
            
            Complaint created = complaintService.createComplaint(complaint);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", created);
            response.put("message", "Complaint created successfully");
            System.out.println("✅ Banned user complaint created: ID=" + created.getId() + ", User=" + complaint.getComplainantId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error creating banned user complaint: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Create new complaint
    @PostMapping
    public ResponseEntity<?> createComplaint(
            @RequestBody Complaint complaint,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            String userRole = jwtUtil.extractRole(jwt);
            
            complaint.setComplainantId(userId);
            complaint.setComplainantType(userRole);
            
            Complaint created = complaintService.createComplaint(complaint);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", created);
            response.put("message", "Complaint created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get my complaints
    @GetMapping("/my")
    public ResponseEntity<?> getMyComplaints(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            
            List<Complaint> complaints = complaintService.getComplaintsByComplainant(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", complaints);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get complaints against me
    @GetMapping("/against-me")
    public ResponseEntity<?> getComplaintsAgainstMe(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            
            List<Complaint> complaints = complaintService.getComplaintsAgainstUser(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", complaints);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get complaint detail
    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintDetail(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            
            Complaint complaint = complaintService.getComplaintById(id);
            
            // Check permission
            if (!complaint.getComplainantId().equals(userId) && 
                !complaint.getRespondentId().equals(userId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You don't have permission to view this complaint");
                return ResponseEntity.status(403).body(response);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", complaint);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Add response to complaint
    @PostMapping("/{id}/response")
    public ResponseEntity<?> addResponse(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            String userRole = jwtUtil.extractRole(jwt);
            
            String message = payload.get("message");
            
            ComplaintResponse response = complaintService.addResponse(id, userId, userRole, message, false);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            result.put("message", "Response added successfully");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }

    // Upload image
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "imageType", required = false) String imageType,
            @RequestParam(value = "description", required = false) String description,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            
            Complaint complaint = complaintService.getComplaintById(id);
            
            // Check permission (Lombok getters may not show in IDE but work at runtime)
            if (!complaint.getComplainantId().equals(userId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You can only upload images to your own complaints");
                return ResponseEntity.status(403).body(response);
            }
            
            ComplaintImage image = complaintService.uploadImage(id, file, imageType, description);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", image);
            response.put("message", "Image uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Upload image for banned user (no token required)
    @PostMapping("/{id}/upload-image-banned")
    public ResponseEntity<?> uploadImageBannedUser(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "imageType", required = false) String imageType,
            @RequestParam(value = "description", required = false) String description) {
        try {
            ComplaintImage image = complaintService.uploadImage(id, file, imageType, description);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", image);
            response.put("message", "Image uploaded successfully");
            System.out.println("✅ Banned user uploaded image to complaint: " + id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error uploading image for banned user: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Delete complaint
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            
            complaintService.deleteComplaint(id, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Complaint deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Search complaints
    @GetMapping("/search")
    public ResponseEntity<?> searchComplaints(
            @RequestParam String keyword,
            @RequestHeader("Authorization") String token) {
        try {
            List<Complaint> complaints = complaintService.searchComplaints(keyword);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", complaints);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
