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
 * Unit Tests cho CartService với mỗi function có 3 test cases
 * 
 * Mỗi function có:
 * 1. Happy Path Test (Thành công)
 * 2. Edge Case Test (Trường hợp biên)
 * 3. Error Case Test (Xử lý lỗi)
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("CartService Tests - 3 Test Cases per Function")
class CartServiceTestExpanded {

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

    // ========== ADD TO CART FUNCTION - 3 TEST CASES ==========
    
    @Test
    @DisplayName("✅ ADD TO CART - Happy Path: Thêm sản phẩm vào giỏ hàng mới")
    void testAddToCart_HappyPath() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();
        Integer quantity = 2;

        // When
        Cart cart = cartService.addToCart(userId, productId, quantity);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(reloadedCart).isNotNull();
        assertThat(cartItems).hasSize(1);
        
        CartItem cartItem = cartItems.get(0);
        assertThat(cartItem.getProductId()).isEqualTo(productId);
        assertThat(cartItem.getQuantity()).isEqualTo(quantity);
        assertThat(cartItem.getPrice()).isEqualTo(new BigDecimal("150000.00"));
    }

    @Test
    @DisplayName("⚠️ ADD TO CART - Edge Case: Thêm sản phẩm với số lượng lớn")
    void testAddToCart_EdgeCase() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();
        Integer quantity = 1000; // Số lượng lớn

        // When
        Cart cart = cartService.addToCart(userId, productId, quantity);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(reloadedCart).isNotNull();
        assertThat(cartItems).hasSize(1);
        
        CartItem cartItem = cartItems.get(0);
        assertThat(cartItem.getQuantity()).isEqualTo(quantity);
        assertThat(cartItem.getTotalPrice()).isEqualTo(new BigDecimal("150000000.00"));
    }

    @Test
    @DisplayName("❌ ADD TO CART - Error Case: Thêm sản phẩm không tồn tại")
    void testAddToCart_ErrorCase() {
        // Given
        Integer userId = 1;
        Integer nonExistentProductId = 99999;
        Integer quantity = 1;

        // When & Then
        assertThatThrownBy(() -> cartService.addToCart(userId, nonExistentProductId, quantity))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Product not found");
    }

    // ========== REMOVE FROM CART FUNCTION - 3 TEST CASES ==========
    
    @Test
    @DisplayName("✅ REMOVE FROM CART - Happy Path: Xóa sản phẩm khỏi giỏ hàng")
    void testRemoveFromCart_HappyPath() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();
        
        cartService.addToCart(userId, productId, 2);
        entityManager.flush();
        entityManager.clear();

        // When
        cartService.removeFromCart(userId, productId);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).isEmpty();
    }

    @Test
    @DisplayName("⚠️ REMOVE FROM CART - Edge Case: Xóa sản phẩm từ giỏ hàng có nhiều sản phẩm")
    void testRemoveFromCart_EdgeCase() {
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
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).hasSize(1);
        assertThat(cartItems.get(0).getProductId()).isEqualTo(testProduct2.getId());
    }

    @Test
    @DisplayName("❌ REMOVE FROM CART - Error Case: Xóa sản phẩm không tồn tại")
    void testRemoveFromCart_ErrorCase() {
        // Given
        Integer userId = 1;
        Integer nonExistentProductId = 999;

        // When & Then - Không throw exception, chỉ trả về cart rỗng
        Cart cart = cartService.removeFromCart(userId, nonExistentProductId);
        assertThat(cart).isNotNull();
    }

    // ========== UPDATE QUANTITY FUNCTION - 3 TEST CASES ==========
    
    @Test
    @DisplayName("✅ UPDATE QUANTITY - Happy Path: Cập nhật số lượng sản phẩm")
    void testUpdateQuantity_HappyPath() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();
        
        cartService.addToCart(userId, productId, 2);
        entityManager.flush();
        entityManager.clear();

        // When
        cartService.updateQuantity(userId, productId, 5);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).hasSize(1);
        CartItem cartItem = cartItems.get(0);
        assertThat(cartItem.getQuantity()).isEqualTo(5);
    }

    @Test
    @DisplayName("⚠️ UPDATE QUANTITY - Edge Case: Cập nhật số lượng = 0 (xóa sản phẩm)")
    void testUpdateQuantity_EdgeCase() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();
        
        cartService.addToCart(userId, productId, 2);
        entityManager.flush();
        entityManager.clear();

        // When
        cartService.updateQuantity(userId, productId, 0);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).isEmpty();
    }

    @Test
    @DisplayName("❌ UPDATE QUANTITY - Error Case: Cập nhật số lượng sản phẩm không tồn tại")
    void testUpdateQuantity_ErrorCase() {
        // Given
        Integer userId = 1;
        Integer nonExistentProductId = 999;

        // When & Then
        assertThatThrownBy(() -> cartService.updateQuantity(userId, nonExistentProductId, 5))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Cart item not found");
    }

    // ========== CLEAR CART FUNCTION - 3 TEST CASES ==========
    
    @Test
    @DisplayName("✅ CLEAR CART - Happy Path: Xóa toàn bộ giỏ hàng")
    void testClearCart_HappyPath() {
        // Given
        Integer userId = 1;
        
        cartService.addToCart(userId, testProduct1.getId(), 2);
        cartService.addToCart(userId, testProduct2.getId(), 1);
        entityManager.flush();
        entityManager.clear();

        // When
        cartService.clearCart(userId);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).isEmpty();
    }

    @Test
    @DisplayName("⚠️ CLEAR CART - Edge Case: Xóa giỏ hàng đã trống")
    void testClearCart_EdgeCase() {
        // Given
        Integer userId = 1;
        // Không thêm sản phẩm nào

        // When
        cartService.clearCart(userId);
        entityManager.flush();
        entityManager.clear();
        
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).isEmpty();
    }

    @Test
    @DisplayName("❌ CLEAR CART - Error Case: Xóa giỏ hàng với userId null")
    void testClearCart_ErrorCase() {
        // Given
        Integer userId = null;

        // When & Then - Không throw exception, chỉ tạo cart mới
        Cart cart = cartService.clearCart(userId);
        assertThat(cart).isNotNull();
    }

    // ========== CALCULATE TOTAL FUNCTION - 3 TEST CASES ==========
    
    @Test
    @DisplayName("✅ CALCULATE TOTAL - Happy Path: Tính tổng tiền giỏ hàng")
    void testCalculateTotal_HappyPath() {
        // Given
        Integer userId = 1;
        
        cartService.addToCart(userId, testProduct1.getId(), 2); // 150000 * 2 = 300000
        cartService.addToCart(userId, testProduct2.getId(), 1); // 120000 * 1 = 120000
        entityManager.flush();
        entityManager.clear();

        // When
        BigDecimal total = cartService.calculateTotal(userId);

        // Then
        assertThat(total).isEqualTo(new BigDecimal("420000.00")); // 300000 + 120000
    }

    @Test
    @DisplayName("⚠️ CALCULATE TOTAL - Edge Case: Tính tổng giỏ hàng trống")
    void testCalculateTotal_EdgeCase() {
        // Given
        Integer userId = 1;
        // Không thêm sản phẩm nào

        // When
        BigDecimal total = cartService.calculateTotal(userId);

        // Then
        assertThat(total).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("❌ CALCULATE TOTAL - Error Case: Tính tổng với userId không tồn tại")
    void testCalculateTotal_ErrorCase() {
        // Given
        Integer userId = 99999; // User không tồn tại

        // When
        BigDecimal total = cartService.calculateTotal(userId);

        // Then - Tạo cart mới và trả về 0
        assertThat(total).isEqualTo(BigDecimal.ZERO);
    }

    // ========== GET OR CREATE CART FUNCTION - 3 TEST CASES ==========
    
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
    @DisplayName("❌ GET OR CREATE CART - Error Case: Tạo giỏ hàng với userId null")
    void testGetOrCreateCart_ErrorCase() {
        // Given
        Integer userId = null;

        // When & Then - Không throw exception, chỉ tạo cart mới
        Cart cart = cartService.getOrCreateCart(userId);
        assertThat(cart).isNotNull();
    }

    // ========== GET CART ITEM COUNT FUNCTION - 3 TEST CASES ==========
    
    @Test
    @DisplayName("✅ GET CART ITEM COUNT - Happy Path: Đếm số lượng sản phẩm trong giỏ hàng")
    void testGetCartItemCount_HappyPath() {
        // Given
        Integer userId = 1;
        
        cartService.addToCart(userId, testProduct1.getId(), 2);
        cartService.addToCart(userId, testProduct2.getId(), 1);
        entityManager.flush();
        entityManager.clear();

        // When
        long count = cartService.getCartItemCount(userId);

        // Then
        assertThat(count).isEqualTo(2); // 2 sản phẩm khác nhau
    }

    @Test
    @DisplayName("⚠️ GET CART ITEM COUNT - Edge Case: Đếm giỏ hàng trống")
    void testGetCartItemCount_EdgeCase() {
        // Given
        Integer userId = 1;
        // Không thêm sản phẩm nào

        // When
        long count = cartService.getCartItemCount(userId);

        // Then
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("❌ GET CART ITEM COUNT - Error Case: Đếm với userId không tồn tại")
    void testGetCartItemCount_ErrorCase() {
        // Given
        Integer userId = 99999; // User không tồn tại

        // When
        long count = cartService.getCartItemCount(userId);

        // Then - Tạo cart mới và trả về 0
        assertThat(count).isEqualTo(0);
    }

    // ========== IS CART EMPTY FUNCTION - 3 TEST CASES ==========
    
    @Test
    @DisplayName("✅ IS CART EMPTY - Happy Path: Kiểm tra giỏ hàng có sản phẩm")
    void testIsCartEmpty_HappyPath() {
        // Given
        Integer userId = 1;
        cartService.addToCart(userId, testProduct1.getId(), 1);
        entityManager.flush();
        entityManager.clear();

        // When
        boolean isEmpty = cartService.isCartEmpty(userId);

        // Then
        assertThat(isEmpty).isFalse();
    }

    @Test
    @DisplayName("⚠️ IS CART EMPTY - Edge Case: Kiểm tra giỏ hàng trống")
    void testIsCartEmpty_EdgeCase() {
        // Given
        Integer userId = 1;
        // Không thêm sản phẩm nào

        // When
        boolean isEmpty = cartService.isCartEmpty(userId);

        // Then
        assertThat(isEmpty).isTrue();
    }

    @Test
    @DisplayName("❌ IS CART EMPTY - Error Case: Kiểm tra với userId null")
    void testIsCartEmpty_ErrorCase() {
        // Given
        Integer userId = null;

        // When
        boolean isEmpty = cartService.isCartEmpty(userId);

        // Then - Tạo cart mới và trả về true
        assertThat(isEmpty).isTrue();
    }
}
