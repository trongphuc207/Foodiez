package com.example.demo.gemini;

import com.example.demo.dto.ApiResponse;
import com.example.demo.Users.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
@CrossOrigin(origins = "http://localhost:3000")
public class GeminiChatController {
    
    @Autowired
    private GeminiService geminiService;
    
    @Value("${gemini.api-key}")
    private String apiKey;
    
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Message không được để trống"));
            }
            
            System.out.println("📨 Received chat request: " + message);
            
            // Lấy current user nếu đã đăng nhập
            Integer userId = null;
            String userRole = null;
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof User) {
                    User user = (User) authentication.getPrincipal();
                    userId = user.getId();
                    userRole = user.getRole();
                    System.out.println("👤 Current user ID: " + userId + ", Role: " + userRole);
                }
            } catch (Exception e) {
                System.out.println("ℹ️ No authenticated user or error getting user: " + e.getMessage());
            }
            
            String response = geminiService.chat(message, userId, userRole);
            
            System.out.println("✅ Chat response generated, length: " + (response != null ? response.length() : 0));
            
            Map<String, String> responseData = new HashMap<>();
            responseData.put("response", response != null ? response : "Không có phản hồi");
            
            return ResponseEntity.ok(ApiResponse.success(responseData, "Chat thành công"));
        } catch (Exception e) {
            System.err.println("❌ Error in chat endpoint: " + e.getClass().getName());
            System.err.println("❌ Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Lỗi khi xử lý chat: " + e.getMessage()));
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> test() {
        Map<String, Object> result = new HashMap<>();
        result.put("apiKeyConfigured", apiKey != null && !apiKey.trim().isEmpty());
        result.put("apiKeyLength", apiKey != null ? apiKey.length() : 0);
        result.put("apiKeyPrefix", apiKey != null && apiKey.length() > 10 ? apiKey.substring(0, 10) + "..." : "N/A");
        
        // Thử một request đơn giản
        try {
            System.out.println("🧪 Starting test with API key: " + (apiKey != null ? apiKey.substring(0, 10) + "..." : "null"));
            String testResponse = geminiService.chat("Xin chào", null, null);
            result.put("testSuccess", !testResponse.startsWith("Xin lỗi"));
            result.put("testResponse", testResponse.length() > 200 ? testResponse.substring(0, 200) + "..." : testResponse);
            result.put("testResponseLength", testResponse.length());
        } catch (Exception e) {
            result.put("testSuccess", false);
            result.put("testError", e.getMessage());
            result.put("testErrorClass", e.getClass().getName());
            System.err.println("❌ Test error: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
        }
        
        // Thêm thông tin hướng dẫn
        result.put("instructions", "Nếu testSuccess = false, vui lòng:");
        result.put("step1", "1. Kiểm tra log trong console để xem lỗi cụ thể (tìm dòng bắt đầu bằng 🔄 hoặc ❌)");
        result.put("step2", "2. Vào Google Cloud Console và bật 'Generative Language API'");
        result.put("step3", "3. Kiểm tra API key có quyền truy cập không (API restrictions)");
        result.put("step4", "4. Thử tạo API key mới từ https://makersuite.google.com/app/apikey");
        result.put("note", "Vui lòng kiểm tra log trong console để xem model nào đang được thử và lỗi cụ thể");
        
        return ResponseEntity.ok(ApiResponse.success(result, "Test endpoint - Kiểm tra log trong console để xem chi tiết"));
    }
    
    @GetMapping("/test-direct")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testDirect() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Kiểm tra API key
            if (apiKey == null || apiKey.trim().isEmpty()) {
                result.put("success", false);
                result.put("error", "API key is null or empty");
                return ResponseEntity.ok(ApiResponse.success(result, "Direct test endpoint"));
            }
            
            // Test trực tiếp với một request đơn giản nhất
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s", apiKey);
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", "Xin chào");
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", java.util.List.of(part));
            
            requestBody.put("contents", java.util.List.of(content));
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);
            
            System.out.println("🧪 Direct test URL: " + url.replace(apiKey, "***"));
            System.out.println("🧪 Request body: " + requestBody);
            
            try {
                @SuppressWarnings("unchecked")
                org.springframework.http.ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, 
                    org.springframework.http.HttpMethod.POST, 
                    entity, 
                    (Class<Map<String, Object>>) (Class<?>) Map.class
                );
                
                System.out.println("✅ Direct test response status: " + response.getStatusCode());
                
                result.put("success", true);
                result.put("statusCode", response.getStatusCode().value());
                result.put("responseBody", response.getBody());
                result.put("message", "Direct test thành công!");
                
                // Parse response để lấy text
                if (response.getBody() != null) {
                    Map<String, Object> body = response.getBody();
                    @SuppressWarnings("unchecked")
                    java.util.List<Map<String, Object>> candidates = (java.util.List<Map<String, Object>>) body.get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        Map<String, Object> candidate = candidates.get(0);
                        @SuppressWarnings("unchecked")
                        Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                        if (contentMap != null) {
                            @SuppressWarnings("unchecked")
                            java.util.List<Map<String, Object>> parts = (java.util.List<Map<String, Object>>) contentMap.get("parts");
                            if (parts != null && !parts.isEmpty()) {
                                String text = (String) parts.get(0).get("text");
                                result.put("responseText", text);
                            }
                        }
                    }
                }
                
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                result.put("success", false);
                result.put("statusCode", e.getStatusCode().value());
                String errorBody = e.getResponseBodyAsString();
                result.put("errorBody", errorBody);
                result.put("message", "Direct test failed: " + e.getStatusCode());
                System.err.println("❌ Direct test error: " + e.getStatusCode() + " - " + errorBody);
                
                // Parse error message
                if (errorBody != null && errorBody.contains("error")) {
                    try {
                        // Cố gắng extract error message
                        int errorIndex = errorBody.indexOf("\"message\"");
                        if (errorIndex > 0) {
                            int start = errorBody.indexOf("\"", errorIndex + 10) + 1;
                            int end = errorBody.indexOf("\"", start);
                            if (end > start) {
                                String errorMsg = errorBody.substring(start, end);
                                result.put("errorMessage", errorMsg);
                            }
                        }
                    } catch (Exception parseEx) {
                        // Ignore
                    }
                }
            } catch (org.springframework.web.client.RestClientException e) {
                result.put("success", false);
                result.put("error", e.getMessage());
                result.put("errorClass", e.getClass().getName());
                result.put("message", "Network error: " + e.getMessage());
                System.err.println("❌ Direct test network error: " + e.getClass().getName() + " - " + e.getMessage());
                e.printStackTrace();
            }
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("errorClass", e.getClass().getName());
            result.put("message", "Unexpected error: " + e.getMessage());
            System.err.println("❌ Direct test exception: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(ApiResponse.success(result, "Direct test endpoint"));
    }
}

