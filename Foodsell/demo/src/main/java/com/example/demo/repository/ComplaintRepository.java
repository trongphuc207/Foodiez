package com.example.demo.repository;

import com.example.demo.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    
    // Find by complaint number
    Optional<Complaint> findByComplaintNumber(String complaintNumber);
    
    // Find all complaints by complainant
    List<Complaint> findByComplainantIdOrderByCreatedAtDesc(Long complainantId);
    
    // Find all complaints against a user (respondent)
    List<Complaint> findByRespondentIdOrderByCreatedAtDesc(Long respondentId);
    
    // Find complaints by status
    List<Complaint> findByStatusOrderByCreatedAtDesc(String status);
    
    // Find complaints by status and priority (for admin dashboard)
    List<Complaint> findByStatusAndPriorityOrderByCreatedAtDesc(String status, String priority);
    
    // Find complaints assigned to admin
    List<Complaint> findByAssignedAdminIdOrderByCreatedAtDesc(Long adminId);
    
    // Find all pending complaints (for admin)
    @Query("SELECT c FROM Complaint c WHERE c.status = 'pending' ORDER BY c.priority DESC, c.createdAt ASC")
    List<Complaint> findAllPendingComplaints();
    
    // Find complaints by category
    List<Complaint> findByCategoryOrderByCreatedAtDesc(String category);
    
    // Search complaints by subject or description
    @Query("SELECT c FROM Complaint c WHERE LOWER(c.subject) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY c.createdAt DESC")
    List<Complaint> searchComplaints(@Param("keyword") String keyword);
    
    // Count complaints by status
    long countByStatus(String status);
    
    // Count complaints by complainant
    long countByComplainantId(Long complainantId);
    
    // Get statistics
    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> getComplaintStatsByStatus();
    
    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> getComplaintStatsByCategory();
}
