package com.example.demo.roleapplication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoleApplicationRepository extends JpaRepository<RoleApplication, Integer> {
    
    // Find applications by user
    List<RoleApplication> findByUserIdOrderByCreatedAtDesc(Integer userId);
    
    // Find applications by status
    List<RoleApplication> findByStatusOrderByCreatedAtDesc(String status);
    
    // Find pending applications
    List<RoleApplication> findByStatusOrderByCreatedAtAsc(String status);
    
    // Check if user already has pending application for role
    boolean existsByUserIdAndRequestedRoleAndStatus(Integer userId, String requestedRole, String status);
    
    // Find user's application for specific role
    Optional<RoleApplication> findByUserIdAndRequestedRole(Integer userId, String requestedRole);
}
