package com.example.demo.Vouchers;

import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin(origins = "http://localhost:3000")
public class VoucherController {
    
    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    // GET: Get all active vouchers
    @GetMapping
    public List<Voucher> getActiveVouchers() {
        return voucherService.getActiveVouchers();
    }

    // POST: Create new voucher (Admin only)
    @PostMapping
    public Voucher createVoucher(@RequestBody Voucher voucher) {
        return voucherService.createVoucher(voucher);
    }

    // POST: Claim voucher by user
    @PostMapping("/claim")
    public UserVoucher claimVoucher(@RequestParam Integer userId, @RequestParam String voucherCode) {
        return voucherService.claimVoucher(userId, voucherCode);
    }

    // GET: Get user's vouchers
    @GetMapping("/user/{userId}")
    public List<UserVoucher> getUserVouchers(@PathVariable Integer userId) {
        return voucherService.getUserVouchers(userId);
    }

    // GET: Get user's unused vouchers
    @GetMapping("/user/{userId}/unused")
    public List<UserVoucher> getUserUnusedVouchers(@PathVariable Integer userId) {
        return voucherService.getUserUnusedVouchers(userId);
    }

    // POST: Apply voucher to order
    @PostMapping("/apply")
    public BigDecimal applyVoucher(@RequestParam Integer userId, 
                                  @RequestParam String voucherCode, 
                                  @RequestParam BigDecimal orderAmount) {
        return voucherService.applyVoucher(userId, voucherCode, orderAmount);
    }

    // POST: Use voucher
    @PostMapping("/use")
    public String useVoucher(@RequestParam Integer userId, 
                            @RequestParam String voucherCode, 
                            @RequestParam Integer orderId) {
        voucherService.useVoucher(userId, voucherCode, orderId);
        return "Voucher used successfully";
    }

    // GET: Generate voucher code
    @GetMapping("/generate-code")
    public String generateVoucherCode() {
        return voucherService.generateVoucherCode();
    }
}


