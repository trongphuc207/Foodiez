package com.example.demo.Vouchers;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VoucherService {
    
    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;

    public VoucherService(VoucherRepository voucherRepository, UserVoucherRepository userVoucherRepository) {
        this.voucherRepository = voucherRepository;
        this.userVoucherRepository = userVoucherRepository;
    }

    // Create new voucher (Admin only)
    public Voucher createVoucher(Voucher voucher) {
        if (voucherRepository.existsByCode(voucher.getCode())) {
            throw new RuntimeException("Voucher code already exists");
        }
        return voucherRepository.save(voucher);
    }

    // Get all active vouchers
    public List<Voucher> getActiveVouchers() {
        return voucherRepository.findActiveVouchers(LocalDate.now());
    }

    // Claim voucher by user
    public UserVoucher claimVoucher(Integer userId, String voucherCode) {
        Voucher voucher = voucherRepository.findByCode(voucherCode)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        if (!voucher.isValid()) {
            throw new RuntimeException("Voucher is not valid");
        }

        if (userVoucherRepository.existsByUserIdAndVoucherId(userId, voucher.getId())) {
            throw new RuntimeException("You have already claimed this voucher");
        }

        UserVoucher userVoucher = new UserVoucher(userId, voucher.getId());
        return userVoucherRepository.save(userVoucher);
    }

    // Get user's vouchers
    public List<UserVoucher> getUserVouchers(Integer userId) {
        return userVoucherRepository.findByUserIdOrderByClaimedAtDesc(userId);
    }

    // Get user's unused vouchers
    public List<UserVoucher> getUserUnusedVouchers(Integer userId) {
        return userVoucherRepository.findByUserIdAndIsUsedFalseOrderByClaimedAtDesc(userId);
    }

    // Validate and apply voucher
    public BigDecimal applyVoucher(Integer userId, String voucherCode, BigDecimal orderAmount) {
        Voucher voucher = voucherRepository.findByCode(voucherCode)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        UserVoucher userVoucher = userVoucherRepository.findByUserIdAndVoucherId(userId, voucher.getId())
                .orElseThrow(() -> new RuntimeException("You don't have this voucher"));

        if (userVoucher.getIsUsed()) {
            throw new RuntimeException("Voucher already used");
        }

        BigDecimal discount = voucher.calculateDiscount(orderAmount);
        if (discount.compareTo(BigDecimal.ZERO) == 0) {
            throw new RuntimeException("Voucher cannot be applied to this order");
        }

        return discount;
    }

    // Use voucher (mark as used)
    public void useVoucher(Integer userId, String voucherCode, Integer orderId) {
        Voucher voucher = voucherRepository.findByCode(voucherCode)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        UserVoucher userVoucher = userVoucherRepository.findByUserIdAndVoucherId(userId, voucher.getId())
                .orElseThrow(() -> new RuntimeException("You don't have this voucher"));

        userVoucher.markAsUsed(orderId);
        userVoucherRepository.save(userVoucher);

        // Update voucher usage count
        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);
    }

    // Generate voucher code
    public String generateVoucherCode() {
        String code;
        do {
            code = "VOUCHER" + System.currentTimeMillis() % 10000;
        } while (voucherRepository.existsByCode(code));
        return code;
    }
}


