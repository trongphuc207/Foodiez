package com.example.demo.Users;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    Optional<User> findByVerificationToken(String verificationToken);
    
    // Thêm query cho hệ thống phân phối đơn hàng
    List<User> findByRoleAndIsVerified(String role, Boolean isVerified);
    List<User> findByRole(String role);
}
