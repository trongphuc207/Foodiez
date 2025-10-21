package com.example.demo.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
    
    // Query by user role
    List<Notification> findByUserRoleOrderByCreatedAtDesc(String userRole);
    long countByUserRoleAndIsReadFalse(String userRole);
    
    // Query by type
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, String type);
    List<Notification> findByUserRoleAndTypeOrderByCreatedAtDesc(String userRole, String type);
    
    // Query by priority
    List<Notification> findByUserIdAndPriorityOrderByCreatedAtDesc(Long userId, String priority);
    
    // Admin queries for notification management
    @Query("SELECT n FROM Notification n WHERE n.userRole = :role ORDER BY n.createdAt DESC")
    List<Notification> findAllByRole(@Param("role") String role);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userRole = :role")
    long countByRole(@Param("role") String role);
    
    // Query for notification log
    @Query("SELECT n FROM Notification n ORDER BY n.createdAt DESC")
    List<Notification> findAllOrderByCreatedAtDesc();
}
