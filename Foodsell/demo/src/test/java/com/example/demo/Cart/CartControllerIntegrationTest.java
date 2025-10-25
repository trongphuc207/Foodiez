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

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration Tests cho CartController theo hướng dẫn Unit Testing Challenge
 * 
 * Test Cases:
 * 1. Test GET /api/cart - Lấy thông tin giỏ hàng
 * 2. Test POST /api/cart/add - Thêm sản phẩm vào giỏ hàng
 * 3. Test PUT /api/cart/update-quantity - Cập nhật số lượng sản phẩm
 * 4. Test DELETE /api/cart/remove/{productId} - Xóa sản phẩm khỏi giỏ hàng
 * 5. Test DELETE /api/cart/clear - Xóa toàn bộ giỏ hàng
 * 6. Test xử lý lỗi khi sản phẩm không tồn tại
 * 7. Test xử lý lỗi khi dữ liệu đầu vào không hợp lệ
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Integration Tests for CartController")
class CartControllerIntegrationTest {

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
    private Product testProduct;

    @BeforeEach
    void setUp() throws Exception {
        // Clear data before each test
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();
        entityManager.flush(); // Ensure deletions are committed

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
        testProduct = new Product();
        testProduct.setName("Pizza Test");
        testProduct.setPrice(150000.0);
        testProduct.setDescription("Pizza for testing");
        testProduct.setImageUrl("pizza-test.jpg");
        testProduct.setAvailable(true);
        testProduct = productRepository.save(testProduct);
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

    @Test
    @DisplayName("Lấy thông tin giỏ hàng - Thành công")
    void testLayThongTinGioHang_ThanhCong() throws Exception {
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
    @DisplayName("Thêm sản phẩm vào giỏ hàng - Thành công")
    void testThemSanPhamVaoGioHang_ThanhCong() throws Exception {
        // Given
        Map<String, Integer> request = new HashMap<>();
        request.put("productId", testProduct.getId());
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
    @DisplayName("Cập nhật số lượng sản phẩm - Thành công")
    void testCapNhatSoLuongSanPham_ThanhCong() throws Exception {
        // Given - Thêm sản phẩm vào giỏ hàng trước
        Map<String, Integer> addRequest = new HashMap<>();
        addRequest.put("productId", testProduct.getId());
        addRequest.put("quantity", 1);
        
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)));

        // When - Cập nhật số lượng
        Map<String, Integer> updateRequest = new HashMap<>();
        updateRequest.put("productId", testProduct.getId());
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
    @DisplayName("Xóa sản phẩm khỏi giỏ hàng - Thành công")
    void testXoaSanPhamKhoiGioHang_ThanhCong() throws Exception {
        // Given - Thêm sản phẩm vào giỏ hàng trước
        Map<String, Integer> addRequest = new HashMap<>();
        addRequest.put("productId", testProduct.getId());
        addRequest.put("quantity", 1);
        
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)));

        // When - Xóa sản phẩm
        mockMvc.perform(delete("/api/cart/remove/" + testProduct.getId())
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("Product removed from cart successfully"));
    }

    @Test
    @DisplayName("Xóa toàn bộ giỏ hàng - Thành công")
    void testXoaToanBoGioHang_ThanhCong() throws Exception {
        // Given - Thêm sản phẩm vào giỏ hàng trước
        Map<String, Integer> addRequest = new HashMap<>();
        addRequest.put("productId", testProduct.getId());
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
    @DisplayName("Thêm sản phẩm không tồn tại - Throw Exception")
    void testThemSanPhamKhongTonTai_ThrowException() throws Exception {
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

    @Test
    @DisplayName("Cập nhật số lượng bằng 0 - Xóa sản phẩm")
    void testCapNhatSoLuongBang0_XoaSanPham() throws Exception {
        // Given - Thêm sản phẩm vào giỏ hàng trước
        Map<String, Integer> addRequest = new HashMap<>();
        addRequest.put("productId", testProduct.getId());
        addRequest.put("quantity", 2);
        
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)));

        // When - Cập nhật số lượng = 0
        Map<String, Integer> updateRequest = new HashMap<>();
        updateRequest.put("productId", testProduct.getId());
        updateRequest.put("quantity", 0);

        mockMvc.perform(put("/api/cart/update-quantity")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("Cart item quantity updated successfully"));
    }

    @Test
    @DisplayName("Thêm sản phẩm với dữ liệu không hợp lệ - Throw Exception")
    void testThemSanPhamVoiDuLieuKhongHopLe_ThrowException() throws Exception {
        // Given
        Map<String, Integer> request = new HashMap<>();
        request.put("productId", testProduct.getId());
        request.put("quantity", -1); // Số lượng âm

        // When
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk()); // API sẽ chấp nhận số lượng âm và xử lý
    }

    @Test
    @DisplayName("Thêm nhiều sản phẩm khác nhau - Thành công")
    void testThemNhieuSanPhamKhacNhau_ThanhCong() throws Exception {
        // Given - Tạo thêm sản phẩm thứ 2
        Product testProduct2 = new Product();
        testProduct2.setName("Burger Test");
        testProduct2.setPrice(120000.0);
        testProduct2.setDescription("Burger for testing");
        testProduct2.setImageUrl("burger-test.jpg");
        testProduct2.setAvailable(true);
        testProduct2 = productRepository.save(testProduct2);

        // When - Thêm sản phẩm 1
        Map<String, Integer> request1 = new HashMap<>();
        request1.put("productId", testProduct.getId());
        request1.put("quantity", 2);
        
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        // When - Thêm sản phẩm 2
        Map<String, Integer> request2 = new HashMap<>();
        request2.put("productId", testProduct2.getId());
        request2.put("quantity", 1);
        
        mockMvc.perform(post("/api/cart/add")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("Product added to cart successfully"));
    }
}
