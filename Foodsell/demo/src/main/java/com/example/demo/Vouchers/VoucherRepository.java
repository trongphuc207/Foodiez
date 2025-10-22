package com.example.demo.Vouchers;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer> {
    
    // Find voucher by code
    Optional<Voucher> findByCode(String code);
    
    // Find active vouchers
    @Query("SELECT v FROM Voucher v WHERE v.isActive = true AND v.expiryDate > :currentDate")
    List<Voucher> findActiveVouchers(@Param("currentDate") LocalDate currentDate);
    
    // Find vouchers by creator
    List<Voucher> findByCreatedByOrderByCreatedAtDesc(Integer createdBy);
    
    // Check if voucher code exists
    boolean existsByCode(String code);
}

@Repository
interface UserVoucherRepository extends JpaRepository<UserVoucher, Integer> {
    
    // Find vouchers by user
    List<UserVoucher> findByUserIdOrderByClaimedAtDesc(Integer userId);
    
    // Find unused vouchers by user
    List<UserVoucher> findByUserIdAndIsUsedFalseOrderByClaimedAtDesc(Integer userId);
    
    // Find user voucher by user and voucher
    Optional<UserVoucher> findByUserIdAndVoucherId(Integer userId, Integer voucherId);
    
    // Check if user already claimed this voucher
    boolean existsByUserIdAndVoucherId(Integer userId, Integer voucherId);
}


