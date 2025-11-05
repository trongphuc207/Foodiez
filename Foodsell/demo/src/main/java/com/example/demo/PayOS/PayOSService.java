package com.example.demo.PayOS;

import com.example.demo.Orders.OrderRepository;
import com.example.demo.Orders.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

@Service
public class PayOSService {

    @Value("${payos.client-id}")
    private String clientId;
    
    @Value("${payos.api-key}")
    private String apiKey;
    
    @Value("${payos.checksum-key}")
    private String checksumKey;
    
    @Value("${payos.base-url}")
    private String baseUrl;

    @Autowired
    private OrderRepository orderRepository;

    private final RestTemplate restTemplate;

    public PayOSService() {
        this.restTemplate = new RestTemplate();
    }

    // Tạo payment link
    public Map<String, Object> createPaymentLink(Map<String, Object> paymentData) {
        try {
            System.out.println("=== PAYOS CREATE PAYMENT LINK ===");
            System.out.println("Input payment data: " + paymentData);
            System.out.println("Client ID: " + clientId);
            System.out.println("API Key: " + apiKey);
            System.out.println("Base URL: " + baseUrl);
            
            // Tạo checksum
            String checksum = createChecksum(paymentData);
            paymentData.put("signature", checksum);
            
            System.out.println("Final payment data with signature: " + paymentData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);
            
            System.out.println("Request headers: " + headers);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(paymentData, headers);
            
            String apiUrl = baseUrl + "/v2/payment-requests";
            System.out.println("API URL: " + apiUrl);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            System.out.println("Response status: " + response.getStatusCode());
            System.out.println("Response body: " + response.getBody());

            Map<String, Object> result = new HashMap<>();
            Map<String, Object> responseBody = response.getBody();
            if ("00".equals(responseBody.get("code"))) {
                result.put("success", true);
                result.put("data", responseBody.get("data"));
                System.out.println("✅ Payment link created successfully");
            } else {
                result.put("success", false);
                result.put("message", responseBody.get("desc"));
                System.out.println("❌ Payment creation failed: " + responseBody.get("desc"));
            }
            return result;
        } catch (Exception e) {
            System.err.println("❌ Error creating payment link: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Error creating payment: " + e.getMessage());
            return errorResult;
        }
    }

    // Lấy thông tin payment
    public Map<String, Object> getPaymentInfo(Integer orderCode) {
        try {
            System.out.println("=== GET PAYMENT INFO ===");
            System.out.println("Order Code: " + orderCode);
            System.out.println("Client ID: " + clientId);
            System.out.println("API Key: " + apiKey);
            System.out.println("Base URL: " + baseUrl);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            HttpEntity<String> request = new HttpEntity<>(headers);

            String apiUrl = baseUrl + "/v2/payment-requests/" + orderCode;
            System.out.println("API URL: " + apiUrl);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.GET,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );

            System.out.println("Response status: " + response.getStatusCode());
            System.out.println("Response body: " + response.getBody());

            Map<String, Object> result = new HashMap<>();
            Map<String, Object> responseBody = response.getBody();
            if ("00".equals(responseBody.get("code"))) {
                result.put("success", true);
                result.put("data", responseBody.get("data"));
                System.out.println("✅ Payment info retrieved successfully");
            } else {
                result.put("success", false);
                result.put("message", responseBody.get("desc"));
                System.out.println("❌ Failed to get payment info: " + responseBody.get("desc"));
            }
            return result;
        } catch (Exception e) {
            System.err.println("❌ Error getting payment info from PayOS: " + e.getMessage());
            e.printStackTrace();
            
            // Fallback: Check order status in database
            System.out.println("=== FALLBACK: CHECKING ORDER IN DATABASE ===");
            try {
                Order order = orderRepository.findByNotesContaining("PayOS:" + orderCode).stream().findFirst().orElse(null);
                if (order != null) {
                    System.out.println("Found order in database: " + order.getId());
                    System.out.println("Order status: " + order.getStatus());
                    
                    Map<String, Object> fallbackResult = new HashMap<>();
                    fallbackResult.put("success", true);
                    
                    Map<String, Object> paymentData = new HashMap<>();
                    paymentData.put("orderCode", orderCode);
                    paymentData.put("status", order.getStatus().equals("paid") ? "PAID" : "PENDING");
                    paymentData.put("amount", order.getTotalAmount().intValue());
                    
                    fallbackResult.put("data", paymentData);
                    System.out.println("✅ Using fallback data from database");
                    return fallbackResult;
                } else {
                    System.out.println("❌ No order found in database for order code: " + orderCode);
                }
            } catch (Exception dbError) {
                System.err.println("❌ Database fallback error: " + dbError.getMessage());
            }
            
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Error getting payment info: " + e.getMessage());
            return errorResult;
        }
    }

    // Hủy payment
    public Map<String, Object> cancelPayment(Integer orderCode, String reason) {
        try {
            Map<String, Object> cancelData = new HashMap<>();
            cancelData.put("orderCode", orderCode);
            cancelData.put("cancellationReason", reason);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(cancelData, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    baseUrl + "/v2/payment-requests/" + orderCode + "/cancel",
                    HttpMethod.POST,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );

            Map<String, Object> result = new HashMap<>();
            Map<String, Object> responseBody = response.getBody();
            if ("00".equals(responseBody.get("code"))) {
                result.put("success", true);
                result.put("data", responseBody.get("data"));
            } else {
                result.put("success", false);
                result.put("message", responseBody.get("desc"));
            }
            return result;
        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Error canceling payment: " + e.getMessage());
            return errorResult;
        }
    }

    // Tạo checksum theo format PayOS (giống mã mẫu)
    private String createChecksum(Map<String, Object> data) throws NoSuchAlgorithmException, InvalidKeyException {
        System.out.println("=== CREATING PAYOS CHECKSUM ===");
        System.out.println("Input data: " + data);
        
        // Lấy các field theo thứ tự cố định như mã mẫu
        Integer amount = (Integer) data.get("amount");
        String cancelUrl = (String) data.get("cancelUrl");
        String description = (String) data.get("description");
        Integer orderCode = (Integer) data.get("orderCode");
        String returnUrl = (String) data.get("returnUrl");
        
        System.out.println("Amount: " + amount);
        System.out.println("Cancel URL: " + cancelUrl);
        System.out.println("Description: " + description);
        System.out.println("Order Code: " + orderCode);
        System.out.println("Return URL: " + returnUrl);

        // Tạo raw data theo format cố định như mã mẫu (không sort)
        String rawData = "amount=" + amount +
                "&cancelUrl=" + cancelUrl +
                "&description=" + description +
                "&orderCode=" + orderCode +
                "&returnUrl=" + returnUrl;
        
        System.out.println("Raw data for checksum: " + rawData);

        // Tạo HMAC SHA256
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(checksumKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(rawData.getBytes(StandardCharsets.UTF_8));

        // Convert to hex
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }

        String checksum = hexString.toString();
        System.out.println("Generated checksum: " + checksum);
        System.out.println("Checksum key: " + checksumKey);
        
        return checksum;
    }

    // Verify checksum
    public boolean verifyChecksum(Map<String, Object> data, String signature) {
        try {
            String calculatedChecksum = createChecksum(data);
            return calculatedChecksum.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
