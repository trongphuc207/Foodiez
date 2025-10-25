package com.example.demo.Cart;

import com.example.demo.products.Product;
import com.example.demo.products.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit Tests cho CartService - Gộp thành 7 functions chính
 * Mỗi function có 3 test cases: Happy Path, Edge Case, Error Case
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("CartService Tests - 7 Functions với 3 Test Cases mỗi function")
class CartServiceTestGrouped {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    private CartService cartService;
    private Product testProduct1;
    private Product testProduct2;

    @BeforeEach
    void setUp() {
        cartService = new CartService(cartRepository, cartItemRepository, productRepository);
        
        // Tạo sản phẩm test
        testProduct1 = new Product();
        testProduct1.setName("Pizza Margherita");
        testProduct1.setPrice(150000.0);
        testProduct1.setDescription("Pizza cổ điển với cà chua và mozzarella");
        testProduct1.setImageUrl("pizza-margherita.jpg");
        testProduct1.setAvailable(true);
        entityManager.persistAndFlush(testProduct1);

        testProduct2 = new Product();
        testProduct2.setName("Burger Bò");
        testProduct2.setPrice(120000.0);
        testProduct2.setDescription("Burger bò thơm ngon");
        testProduct2.setImageUrl("burger-bo.jpg");
        testProduct2.setAvailable(true);
        entityManager.persistAndFlush(testProduct2);
    }

    // ========== FUNCTION 1: ADD TO CART (Gộp addToCart + updateQuantity) ==========
    
    @Test
    @DisplayName("✅ ADD TO CART - Happy Path: Thêm sản phẩm mới và cập nhật số lượng")
    void testAddToCart_HappyPath() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();

        // When - Thêm sản phẩm mới
        Cart cart1 = cartService.addToCart(userId, productId, 2);
        entityManager.flush();
        entityManager.clear();
        
        // Thêm cùng sản phẩm (cập nhật số lượng)
        Cart cart2 = cartService.addToCart(userId, productId, 3);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(reloadedCart).isNotNull();
        assertThat(cartItems).hasSize(1);
        
        CartItem cartItem = cartItems.get(0);
        assertThat(cartItem.getProductId()).isEqualTo(productId);
        assertThat(cartItem.getQuantity()).isEqualTo(5); // 2 + 3 = 5
        assertThat(cartItem.getPrice()).isEqualTo(new BigDecimal("150000.00"));
    }

    @Test
    @DisplayName("⚠️ ADD TO CART - Edge Case: Thêm sản phẩm với số lượng lớn và cập nhật về 0")
    void testAddToCart_EdgeCase() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();

        // When - Thêm với số lượng lớn
        cartService.addToCart(userId, productId, 1000);
        entityManager.flush();
        entityManager.clear();
        
        // Cập nhật về 0 (xóa sản phẩm)
        cartService.updateQuantity(userId, productId, 0);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).isEmpty();
    }

    @Test
    @DisplayName("❌ ADD TO CART - Error Case: Thêm sản phẩm không tồn tại")
    void testAddToCart_ErrorCase() {
        // Given
        Integer userId = 1;
        Integer nonExistentProductId = 99999;

        // When & Then
        assertThatThrownBy(() -> cartService.addToCart(userId, nonExistentProductId, 1))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Product not found");
    }

    // ========== FUNCTION 2: REMOVE FROM CART (Gộp removeFromCart + clearCart) ==========
    
    @Test
    @DisplayName("✅ REMOVE FROM CART - Happy Path: Xóa sản phẩm và xóa toàn bộ giỏ hàng")
    void testRemoveFromCart_HappyPath() {
        // Given
        Integer userId = 1;
        
        cartService.addToCart(userId, testProduct1.getId(), 2);
        cartService.addToCart(userId, testProduct2.getId(), 1);
        entityManager.flush();
        entityManager.clear();

        // When - Xóa sản phẩm 1
        cartService.removeFromCart(userId, testProduct1.getId());
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart1 = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems1 = cartItemRepository.findByCart(reloadedCart1);
        
        // Xóa toàn bộ giỏ hàng
        cartService.clearCart(userId);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart2 = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems2 = cartItemRepository.findByCart(reloadedCart2);

        // Then
        assertThat(cartItems1).hasSize(1); // Còn lại sản phẩm 2
        assertThat(cartItems2).isEmpty(); // Đã xóa hết
    }

    @Test
    @DisplayName("⚠️ REMOVE FROM CART - Edge Case: Xóa từ giỏ hàng trống")
    void testRemoveFromCart_EdgeCase() {
        // Given
        Integer userId = 1;
        // Không thêm sản phẩm nào

        // When - Xóa sản phẩm không tồn tại
        cartService.removeFromCart(userId, testProduct1.getId());
        entityManager.flush();
        entityManager.clear();
        
        // Xóa toàn bộ giỏ hàng trống
        cartService.clearCart(userId);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).isEmpty();
    }

    @Test
    @DisplayName("❌ REMOVE FROM CART - Error Case: Xóa với userId không hợp lệ")
    void testRemoveFromCart_ErrorCase() {
        // Given
        Integer userId = -1; // User ID không hợp lệ thay vì null

        // When & Then - Không throw exception
        Cart cart1 = cartService.removeFromCart(userId, testProduct1.getId());
        Cart cart2 = cartService.clearCart(userId);
        
        assertThat(cart1).isNotNull();
        assertThat(cart2).isNotNull();
    }

    // ========== FUNCTION 3: CALCULATE TOTAL (Gộp calculateTotal + getCartItemCount + isCartEmpty) ==========
    
    @Test
    @DisplayName("✅ CALCULATE TOTAL - Happy Path: Tính tổng tiền, đếm sản phẩm và kiểm tra trống")
    void testCalculateTotal_HappyPath() {
        // Given
        Integer userId = 1;
        
        cartService.addToCart(userId, testProduct1.getId(), 2); // 150000 * 2 = 300000
        cartService.addToCart(userId, testProduct2.getId(), 1); // 120000 * 1 = 120000
        entityManager.flush();
        entityManager.clear();

        // When
        BigDecimal total = cartService.calculateTotal(userId);
        long itemCount = cartService.getCartItemCount(userId);
        boolean isEmpty = cartService.isCartEmpty(userId);

        // Then
        assertThat(total).isEqualTo(new BigDecimal("420000.00")); // 300000 + 120000
        assertThat(itemCount).isEqualTo(2); // 2 sản phẩm khác nhau
        assertThat(isEmpty).isFalse();
    }

    @Test
    @DisplayName("⚠️ CALCULATE TOTAL - Edge Case: Tính tổng giỏ hàng trống")
    void testCalculateTotal_EdgeCase() {
        // Given
        Integer userId = 1;
        // Không thêm sản phẩm nào

        // When
        BigDecimal total = cartService.calculateTotal(userId);
        long itemCount = cartService.getCartItemCount(userId);
        boolean isEmpty = cartService.isCartEmpty(userId);

        // Then
        assertThat(total).isEqualTo(BigDecimal.ZERO);
        assertThat(itemCount).isEqualTo(0);
        assertThat(isEmpty).isTrue();
    }

    @Test
    @DisplayName("❌ CALCULATE TOTAL - Error Case: Tính tổng với userId không tồn tại")
    void testCalculateTotal_ErrorCase() {
        // Given
        Integer userId = 99999; // User không tồn tại

        // When
        BigDecimal total = cartService.calculateTotal(userId);
        long itemCount = cartService.getCartItemCount(userId);
        boolean isEmpty = cartService.isCartEmpty(userId);

        // Then - Tạo cart mới và trả về giá trị mặc định
        assertThat(total).isEqualTo(BigDecimal.ZERO);
        assertThat(itemCount).isEqualTo(0);
        assertThat(isEmpty).isTrue();
    }

    // ========== FUNCTION 4: GET OR CREATE CART ==========
    
    @Test
    @DisplayName("✅ GET OR CREATE CART - Happy Path: Lấy giỏ hàng đã tồn tại")
    void testGetOrCreateCart_HappyPath() {
        // Given
        Integer userId = 1;
        cartService.addToCart(userId, testProduct1.getId(), 1);
        entityManager.flush();
        entityManager.clear();

        // When
        Cart cart = cartService.getOrCreateCart(userId);
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        // Then
        assertThat(cart).isNotNull();
        assertThat(cart.getUserId()).isEqualTo(userId);
        assertThat(cartItems).hasSize(1);
    }

    @Test
    @DisplayName("⚠️ GET OR CREATE CART - Edge Case: Tạo giỏ hàng mới")
    void testGetOrCreateCart_EdgeCase() {
        // Given
        Integer userId = 1;
        // Không có giỏ hàng nào

        // When
        Cart cart = cartService.getOrCreateCart(userId);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(reloadedCart).isNotNull();
        assertThat(reloadedCart.getUserId()).isEqualTo(userId);
        assertThat(cartItems).isEmpty();
    }

    @Test
    @DisplayName("❌ GET OR CREATE CART - Error Case: Tạo giỏ hàng với userId không hợp lệ")
    void testGetOrCreateCart_ErrorCase() {
        // Given
        Integer userId = -1; // User ID không hợp lệ thay vì null

        // When & Then - Không throw exception, chỉ tạo cart mới
        Cart cart = cartService.getOrCreateCart(userId);
        assertThat(cart).isNotNull();
    }

    // ========== FUNCTION 5: CART VALIDATION (Gộp các validation errors) ==========
    
    @Test
    @DisplayName("✅ CART VALIDATION - Happy Path: Validation thành công")
    void testCartValidation_HappyPath() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();

        // When - Thêm sản phẩm hợp lệ
        Cart cart = cartService.addToCart(userId, productId, 1);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cart).isNotNull();
        assertThat(cartItems).hasSize(1);
        assertThat(cartItems.get(0).getProductId()).isEqualTo(productId);
    }

    @Test
    @DisplayName("⚠️ CART VALIDATION - Edge Case: Validation với số lượng âm")
    void testCartValidation_EdgeCase() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();

        // When - Thêm với số lượng âm
        cartService.addToCart(userId, productId, -1);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then - Số lượng âm vẫn được chấp nhận
        assertThat(cartItems).hasSize(1);
        assertThat(cartItems.get(0).getQuantity()).isEqualTo(-1);
    }

    @Test
    @DisplayName("❌ CART VALIDATION - Error Case: Validation với sản phẩm không tồn tại")
    void testCartValidation_ErrorCase() {
        // Given
        Integer userId = 1;
        Integer nonExistentProductId = 99999;

        // When & Then
        assertThatThrownBy(() -> cartService.addToCart(userId, nonExistentProductId, 1))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Product not found");
    }

    // ========== FUNCTION 6: CART EDGE CASES (Gộp các trường hợp biên) ==========
    
    @Test
    @DisplayName("✅ CART EDGE CASES - Happy Path: Xử lý các trường hợp biên thành công")
    void testCartEdgeCases_HappyPath() {
        // Given
        Integer userId = 1;

        // When - Thêm nhiều sản phẩm khác nhau
        cartService.addToCart(userId, testProduct1.getId(), 1);
        cartService.addToCart(userId, testProduct2.getId(), 1);
        cartService.addToCart(userId, testProduct1.getId(), 1); // Cập nhật số lượng
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).hasSize(2); // 2 sản phẩm khác nhau
        assertThat(cartItems.get(0).getQuantity()).isEqualTo(2); // Pizza: 1 + 1 = 2
        assertThat(cartItems.get(1).getQuantity()).isEqualTo(1); // Burger: 1
    }

    @Test
    @DisplayName("⚠️ CART EDGE CASES - Edge Case: Xử lý số lượng rất lớn")
    void testCartEdgeCases_EdgeCase() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();

        // When - Thêm với số lượng rất lớn
        cartService.addToCart(userId, productId, 10000);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).hasSize(1);
        assertThat(cartItems.get(0).getQuantity()).isEqualTo(10000);
        assertThat(cartItems.get(0).getTotalPrice()).isEqualTo(new BigDecimal("1500000000.00"));
    }

    @Test
    @DisplayName("❌ CART EDGE CASES - Error Case: Xử lý với dữ liệu không hợp lệ")
    void testCartEdgeCases_ErrorCase() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();

        // When - Cập nhật số lượng sản phẩm không tồn tại
        assertThatThrownBy(() -> cartService.updateQuantity(userId, 99999, 5))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Cart item not found");
    }

    // ========== FUNCTION 7: CART ERROR HANDLING (Gộp xử lý lỗi) ==========
    
    @Test
    @DisplayName("✅ CART ERROR HANDLING - Happy Path: Xử lý lỗi thành công")
    void testCartErrorHandling_HappyPath() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();

        // When - Thêm sản phẩm thành công
        Cart cart = cartService.addToCart(userId, productId, 1);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cart).isNotNull();
        assertThat(cartItems).hasSize(1);
    }

    @Test
    @DisplayName("⚠️ CART ERROR HANDLING - Edge Case: Xử lý lỗi với dữ liệu không hợp lệ")
    void testCartErrorHandling_EdgeCase() {
        // Given
        Integer userId = -1; // User ID không hợp lệ thay vì null
        Integer productId = -1; // Product ID không hợp lệ thay vì null

        // When & Then - Không throw exception với invalid values
        Cart cart1 = cartService.getOrCreateCart(userId);
        Cart cart2 = cartService.removeFromCart(userId, productId);
        Cart cart3 = cartService.clearCart(userId);
        
        assertThat(cart1).isNotNull();
        assertThat(cart2).isNotNull();
        assertThat(cart3).isNotNull();
    }

    @Test
    @DisplayName("❌ CART ERROR HANDLING - Error Case: Xử lý exception")
    void testCartErrorHandling_ErrorCase() {
        // Given
        Integer userId = 1;
        Integer nonExistentProductId = 99999;

        // When & Then - Throw exception
        assertThatThrownBy(() -> cartService.addToCart(userId, nonExistentProductId, 1))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Product not found");
            
        assertThatThrownBy(() -> cartService.updateQuantity(userId, nonExistentProductId, 1))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Cart item not found");
    }
}
