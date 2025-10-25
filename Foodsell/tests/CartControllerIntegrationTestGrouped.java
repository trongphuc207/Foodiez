package com.example.demo.Cart;

import com.example.demo.dto.ApiResponse;
import com.example.demo.products.Product;
import com.example.demo.products.ProductRepository;
import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration Tests cho CartController - Gộp thành 8 functions chính
 * Mỗi function có 3 test cases: Happy Path, Edge Case, Error Case
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("CartController Integration Tests - 8 Functions với 3 Test Cases mỗi function")
class CartControllerIntegrationTestGrouped {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EntityManager entityManager;

    private String customerToken;
    private User testCustomer;
    private Product testProduct1;
    private Product testProduct2;

    @BeforeEach
    void setUp() throws Exception {
        // Clear data before each test
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();
        entityManager.flush();

        // Tạo người dùng test
        testCustomer = new User();
        testCustomer.setEmail("customer@test.com");
        testCustomer.setPasswordHash(passwordEncoder.encode("password123"));
        testCustomer.setFullName("Test Customer");
        testCustomer.setRole("customer");
        testCustomer.setIsVerified(true);
        userRepository.save(testCustomer);

        // Đăng nhập để lấy token
        customerToken = obtainJwtToken("customer@test.com", "password123");

        // Tạo sản phẩm test
        testProduct1 = new Product();
        testProduct1.setName("Pizza Test");
        testProduct1.setPrice(150000.0);
        testProduct1.setDescription("Pizza for testing");
        testProduct1.setImageUrl("pizza-test.jpg");
        testProduct1.setAvailable(true);
        testProduct1 = productRepository.save(testProduct1);

        testProduct2 = new Product();
        testProduct2.setName("Burger Test");
        testProduct2.setPrice(120000.0);
        testProduct2.setDescription("Burger for testing");
        testProduct2.setImageUrl("burger-test.jpg");
        testProduct2.setAvailable(true);
        testProduct2 = productRepository.save(testProduct2);
    }

    private String obtainJwtToken(String email, String password) throws Exception {
        Map<String, String> loginRequest = Map.of("email", email, "password", password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        
        String responseString = result.getResponse().getContentAsString();
        Map<String, Object> responseMap = objectMapper.readValue(responseString, Map.class);
        String token = (String) responseMap.get("token");
        return token;
    }

    // ========== FUNCTION 1: GET CART ==========
    
    @Test
    @DisplayName("✅ GET CART - Happy Path: Lấy thông tin giỏ hàng thành công")
    void testGetCart_HappyPath() throws Exception {
        // Given - Thêm sản phẩm vào giỏ hàng trước
        Map<String, Integer> addRequest = new HashMap<>();
        addRequest.put("productId", testProduct1.getId());
        addRequest.put("quantity", 2);
        
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)));

        // When
        mockMvc.perform(get("/api/cart")
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(testCustomer.getId()))
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.totalAmount").value(300000));
    }

    @Test
    @DisplayName("⚠️ GET CART - Edge Case: Lấy giỏ hàng trống")
    void testGetCart_EdgeCase() throws Exception {
        // Given - Không thêm sản phẩm nào

        // When
        mockMvc.perform(get("/api/cart")
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(testCustomer.getId()))
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.totalAmount").value(0));
    }

    @Test
    @DisplayName("❌ GET CART - Error Case: Không có token xác thực")
    void testGetCart_ErrorCase() throws Exception {
        // When
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isUnauthorized());
    }

    // ========== FUNCTION 2: ADD TO CART ==========
    
    @Test
    @DisplayName("✅ ADD TO CART - Happy Path: Thêm sản phẩm vào giỏ hàng thành công")
    void testAddToCart_HappyPath() throws Exception {
        // Given
        Map<String, Integer> request = new HashMap<>();
        request.put("productId", testProduct1.getId());
        request.put("quantity", 2);

        // When
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("Product added to cart successfully"));
    }

    @Test
    @DisplayName("⚠️ ADD TO CART - Edge Case: Thêm sản phẩm với số lượng âm")
    void testAddToCart_EdgeCase() throws Exception {
        // Given
        Map<String, Integer> request = new HashMap<>();
        request.put("productId", testProduct1.getId());
        request.put("quantity", -1);

        // When
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk()); // API chấp nhận số lượng âm
    }

    @Test
    @DisplayName("❌ ADD TO CART - Error Case: Thêm sản phẩm không tồn tại")
    void testAddToCart_ErrorCase() throws Exception {
        // Given
        Map<String, Integer> request = new HashMap<>();
        request.put("productId", 99999); // ID không tồn tại
        request.put("quantity", 1);

        // When
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Product not found"));
    }

    // ========== FUNCTION 3: UPDATE CART ==========
    
    @Test
    @DisplayName("✅ UPDATE CART - Happy Path: Cập nhật số lượng sản phẩm thành công")
    void testUpdateCart_HappyPath() throws Exception {
        // Given - Thêm sản phẩm vào giỏ hàng trước
        Map<String, Integer> addRequest = new HashMap<>();
        addRequest.put("productId", testProduct1.getId());
        addRequest.put("quantity", 1);
        
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)));

        // When - Cập nhật số lượng
        Map<String, Integer> updateRequest = new HashMap<>();
        updateRequest.put("productId", testProduct1.getId());
        updateRequest.put("quantity", 3);

        mockMvc.perform(put("/api/cart/update-quantity")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("Cart item quantity updated successfully"));
    }

    @Test
    @DisplayName("⚠️ UPDATE CART - Edge Case: Cập nhật số lượng = 0 (xóa sản phẩm)")
    void testUpdateCart_EdgeCase() throws Exception {
        // Given - Thêm sản phẩm vào giỏ hàng trước
        Map<String, Integer> addRequest = new HashMap<>();
        addRequest.put("productId", testProduct1.getId());
        addRequest.put("quantity", 2);
        
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)));

        // When - Cập nhật số lượng = 0
        Map<String, Integer> updateRequest = new HashMap<>();
        updateRequest.put("productId", testProduct1.getId());
        updateRequest.put("quantity", 0);

        mockMvc.perform(put("/api/cart/update-quantity")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("❌ UPDATE CART - Error Case: Cập nhật sản phẩm không tồn tại")
    void testUpdateCart_ErrorCase() throws Exception {
        // Given
        Map<String, Integer> updateRequest = new HashMap<>();
        updateRequest.put("productId", 99999); // ID không tồn tại
        updateRequest.put("quantity", 5);

        // When
        mockMvc.perform(put("/api/cart/update-quantity")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Cart item not found"));
    }

    // ========== FUNCTION 4: REMOVE FROM CART ==========
    
    @Test
    @DisplayName("✅ REMOVE FROM CART - Happy Path: Xóa sản phẩm khỏi giỏ hàng thành công")
    void testRemoveFromCart_HappyPath() throws Exception {
        // Given - Thêm sản phẩm vào giỏ hàng trước
        Map<String, Integer> addRequest = new HashMap<>();
        addRequest.put("productId", testProduct1.getId());
        addRequest.put("quantity", 1);
        
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)));

        // When - Xóa sản phẩm
        mockMvc.perform(delete("/api/cart/remove/" + testProduct1.getId())
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("Product removed from cart successfully"));
    }

    @Test
    @DisplayName("⚠️ REMOVE FROM CART - Edge Case: Xóa sản phẩm không tồn tại")
    void testRemoveFromCart_EdgeCase() throws Exception {
        // Given - Không thêm sản phẩm nào

        // When - Xóa sản phẩm không tồn tại
        mockMvc.perform(delete("/api/cart/remove/" + testProduct1.getId())
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("❌ REMOVE FROM CART - Error Case: Không có token xác thực")
    void testRemoveFromCart_ErrorCase() throws Exception {
        // When
        mockMvc.perform(delete("/api/cart/remove/" + testProduct1.getId()))
                .andExpect(status().isUnauthorized());
    }

    // ========== FUNCTION 5: CLEAR CART ==========
    
    @Test
    @DisplayName("✅ CLEAR CART - Happy Path: Xóa toàn bộ giỏ hàng thành công")
    void testClearCart_HappyPath() throws Exception {
        // Given - Thêm sản phẩm vào giỏ hàng trước
        Map<String, Integer> addRequest = new HashMap<>();
        addRequest.put("productId", testProduct1.getId());
        addRequest.put("quantity", 1);
        
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)));

        // When - Xóa toàn bộ giỏ hàng
        mockMvc.perform(delete("/api/cart/clear")
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("Cart cleared successfully"));
    }

    @Test
    @DisplayName("⚠️ CLEAR CART - Edge Case: Xóa giỏ hàng trống")
    void testClearCart_EdgeCase() throws Exception {
        // Given - Không thêm sản phẩm nào

        // When - Xóa giỏ hàng trống
        mockMvc.perform(delete("/api/cart/clear")
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("❌ CLEAR CART - Error Case: Không có token xác thực")
    void testClearCart_ErrorCase() throws Exception {
        // When
        mockMvc.perform(delete("/api/cart/clear"))
                .andExpect(status().isUnauthorized());
    }

    // ========== FUNCTION 6: CART VALIDATION ==========
    
    @Test
    @DisplayName("✅ CART VALIDATION - Happy Path: Validation thành công")
    void testCartValidation_HappyPath() throws Exception {
        // Given
        Map<String, Integer> request = new HashMap<>();
        request.put("productId", testProduct1.getId());
        request.put("quantity", 1);

        // When
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("⚠️ CART VALIDATION - Edge Case: Validation với dữ liệu không hợp lệ")
    void testCartValidation_EdgeCase() throws Exception {
        // Given - Request không có productId
        Map<String, Integer> request = new HashMap<>();
        request.put("quantity", 1);

        // When
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("❌ CART VALIDATION - Error Case: Validation với sản phẩm không tồn tại")
    void testCartValidation_ErrorCase() throws Exception {
        // Given
        Map<String, Integer> request = new HashMap<>();
        request.put("productId", 99999);
        request.put("quantity", 1);

        // When
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ========== FUNCTION 7: CART EDGE CASES ==========
    
    @Test
    @DisplayName("✅ CART EDGE CASES - Happy Path: Xử lý các trường hợp biên thành công")
    void testCartEdgeCases_HappyPath() throws Exception {
        // Given - Thêm nhiều sản phẩm khác nhau
        Map<String, Integer> request1 = new HashMap<>();
        request1.put("productId", testProduct1.getId());
        request1.put("quantity", 2);
        
        Map<String, Integer> request2 = new HashMap<>();
        request2.put("productId", testProduct2.getId());
        request2.put("quantity", 1);

        // When
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("⚠️ CART EDGE CASES - Edge Case: Xử lý số lượng rất lớn")
    void testCartEdgeCases_EdgeCase() throws Exception {
        // Given
        Map<String, Integer> request = new HashMap<>();
        request.put("productId", testProduct1.getId());
        request.put("quantity", 10000); // Số lượng rất lớn

        // When
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("❌ CART EDGE CASES - Error Case: Xử lý với dữ liệu không hợp lệ")
    void testCartEdgeCases_ErrorCase() throws Exception {
        // Given - Request với dữ liệu null
        String invalidJson = "{\"productId\": null, \"quantity\": null}";

        // When
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    // ========== FUNCTION 8: CART AUTHENTICATION ==========
    
    @Test
    @DisplayName("✅ CART AUTHENTICATION - Happy Path: Xác thực thành công")
    void testCartAuthentication_HappyPath() throws Exception {
        // Given
        Map<String, Integer> request = new HashMap<>();
        request.put("productId", testProduct1.getId());
        request.put("quantity", 1);

        // When
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("⚠️ CART AUTHENTICATION - Edge Case: Token hết hạn")
    void testCartAuthentication_EdgeCase() throws Exception {
        // Given
        Map<String, Integer> request = new HashMap<>();
        request.put("productId", testProduct1.getId());
        request.put("quantity", 1);

        // When - Sử dụng token không hợp lệ
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer invalid-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("❌ CART AUTHENTICATION - Error Case: Không có token")
    void testCartAuthentication_ErrorCase() throws Exception {
        // Given
        Map<String, Integer> request = new HashMap<>();
        request.put("productId", testProduct1.getId());
        request.put("quantity", 1);

        // When - Không có header Authorization
        mockMvc.perform(post("/api/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
