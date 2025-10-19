package com.example.demo.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {
    
    // Tìm tất cả khiếu nại theo trạng thái
    List<Complaint> findByStatusOrderByCreatedAtDesc(Complaint.ComplaintStatus status);
    
    // Tìm khiếu nại theo review ID
    List<Complaint> findByReviewIdOrderByCreatedAtDesc(Integer reviewId);
    
    // Tìm khiếu nại theo người báo cáo
    List<Complaint> findByReporterIdOrderByCreatedAtDesc(Integer reporterId);
    
    // Tìm khiếu nại theo loại
    List<Complaint> findByComplaintTypeOrderByCreatedAtDesc(Complaint.ComplaintType complaintType);
    
    // Tìm khiếu nại đã được giải quyết bởi admin
    List<Complaint> findByResolvedByOrderByResolvedAtDesc(Integer resolvedBy);
    
    // Đếm số khiếu nại theo trạng thái
    long countByStatus(Complaint.ComplaintStatus status);
    
    // Đếm số khiếu nại theo loại
    long countByComplaintType(Complaint.ComplaintType complaintType);
    
    // Tìm khiếu nại chưa được xử lý (PENDING hoặc UNDER_REVIEW)
    @Query("SELECT c FROM Complaint c WHERE c.status IN ('PENDING', 'UNDER_REVIEW') ORDER BY c.createdAt DESC")
    List<Complaint> findUnresolvedComplaints();
    
    // Tìm khiếu nại theo review ID và trạng thái
    List<Complaint> findByReviewIdAndStatusOrderByCreatedAtDesc(Integer reviewId, Complaint.ComplaintStatus status);
    
    // Tìm khiếu nại theo review ID và reporter ID
    List<Complaint> findByReviewIdAndReporterId(Integer reviewId, Integer reporterId);
    
    // Tìm khiếu nại trong khoảng thời gian
    @Query("SELECT c FROM Complaint c WHERE c.createdAt BETWEEN :startDate AND :endDate ORDER BY c.createdAt DESC")
    List<Complaint> findComplaintsByDateRange(@Param("startDate") java.time.LocalDateTime startDate, 
                                             @Param("endDate") java.time.LocalDateTime endDate);
    
    // Tìm khiếu nại có chứa từ khóa trong lý do
    @Query("SELECT c FROM Complaint c WHERE c.complaintReason LIKE %:keyword% OR c.complaintDetails LIKE %:keyword% ORDER BY c.createdAt DESC")
    List<Complaint> findComplaintsByKeyword(@Param("keyword") String keyword);
    
    // Thống kê khiếu nại theo tháng
    @Query("SELECT c.complaintType, COUNT(c) FROM Complaint c WHERE YEAR(c.createdAt) = :year AND MONTH(c.createdAt) = :month GROUP BY c.complaintType")
    List<Object[]> getComplaintStatsByMonth(@Param("year") int year, @Param("month") int month);
}
