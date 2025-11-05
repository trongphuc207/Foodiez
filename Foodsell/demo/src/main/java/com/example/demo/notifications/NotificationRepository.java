package com.example.demo.notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    
    // Lấy notifications của user cụ thể
    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);
    
    // Lấy notifications chưa đọc của user
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Integer userId);
    
    // Đếm số notifications chưa đọc
    long countByUserIdAndIsReadFalse(Integer userId);
    
    // Lấy notifications theo type
    List<Notification> findByTypeOrderByCreatedAtDesc(String type);
    
    // Lấy notifications trong khoảng thời gian
    @Query("SELECT n FROM Notification n WHERE n.createdAt BETWEEN :startDate AND :endDate ORDER BY n.createdAt DESC")
    List<Notification> findByCreatedAtBetween(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
}