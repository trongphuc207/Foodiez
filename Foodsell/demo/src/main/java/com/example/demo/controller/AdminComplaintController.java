package com.example.demo.controller;

import com.example.demo.entity.Complaint;
import com.example.demo.entity.ComplaintResponse;
import com.example.demo.service.ComplaintService;
import com.example.demo.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/complaints")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private JwtUtil jwtUtil;

    // Get all complaints
    @GetMapping
    public ResponseEntity<?> getAllComplaints(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            
            if (!"admin".equals(role)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin access required");
                return ResponseEntity.status(403).body(response);
            }
            
            List<Complaint> complaints = complaintService.getAllComplaints();
            
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

    // Get pending complaints
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingComplaints(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            
            if (!"admin".equals(role)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin access required");
                return ResponseEntity.status(403).body(response);
            }
            
            List<Complaint> complaints = complaintService.getPendingComplaints();
            
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
            String role = jwtUtil.extractRole(jwt);
            
            if (!"admin".equals(role)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin access required");
                return ResponseEntity.status(403).body(response);
            }
            
            Complaint complaint = complaintService.getComplaintById(id);
            
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

    // Assign complaint to admin
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignComplaint(
            @PathVariable Long id,
            @RequestBody Map<String, Long> payload,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long currentAdminId = jwtUtil.extractUserId(jwt);
            
            if (!"admin".equals(role)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin access required");
                return ResponseEntity.status(403).body(response);
            }
            
            Long adminId = payload.get("adminId");
            if (adminId == null) {
                adminId = currentAdminId; // Assign to self if not specified
            }
            
            Complaint complaint = complaintService.assignComplaint(id, adminId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", complaint);
            response.put("message", "Complaint assigned successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Update complaint status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long adminId = jwtUtil.extractUserId(jwt);
            
            if (!"admin".equals(role)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin access required");
                return ResponseEntity.status(403).body(response);
            }
            
            String status = payload.get("status");
            Complaint complaint = complaintService.updateComplaintStatus(id, status, adminId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", complaint);
            response.put("message", "Status updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Make decision (approve/reject)
    @PostMapping("/{id}/decision")
    public ResponseEntity<?> makeDecision(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            
            if (!"admin".equals(role)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin access required");
                return ResponseEntity.status(403).body(response);
            }
            
            String decision = payload.get("decision"); // approved/rejected/needs_more_info
            String reason = payload.get("reason");
            String adminNote = payload.get("adminNote");
            
            Complaint complaint = complaintService.makeDecision(id, decision, reason, adminNote);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", complaint);
            response.put("message", "Decision made successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Add internal note
    @PostMapping("/{id}/note")
    public ResponseEntity<?> addInternalNote(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long adminId = jwtUtil.extractUserId(jwt);
            
            if (!"admin".equals(role)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin access required");
                return ResponseEntity.status(403).body(response);
            }
            
            String note = payload.get("note");
            
            ComplaintResponse response = complaintService.addResponse(id, adminId, "admin", note, true);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            result.put("message", "Internal note added successfully");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }

    // Get statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getStatistics(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            
            if (!"admin".equals(role)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin access required");
                return ResponseEntity.status(403).body(response);
            }
            
            List<Object[]> statsByStatus = complaintService.getStatsByStatus();
            List<Object[]> statsByCategory = complaintService.getStatsByCategory();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("byStatus", statsByStatus);
            stats.put("byCategory", statsByCategory);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
