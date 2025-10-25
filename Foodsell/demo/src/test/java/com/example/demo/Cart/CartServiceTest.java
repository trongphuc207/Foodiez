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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit Tests cho CartService theo hướng dẫn Unit Testing Challenge
 * 
 * Test Cases:
 * 1. Test thêm sản phẩm vào giỏ hàng mới
 * 2. Test thêm sản phẩm đã có trong giỏ hàng (cập nhật số lượng)
 * 3. Test xóa sản phẩm khỏi giỏ hàng
 * 4. Test cập nhật số lượng sản phẩm
 * 5. Test xóa toàn bộ giỏ hàng
 * 6. Test tính tổng tiền giỏ hàng
 * 7. Test xử lý lỗi khi sản phẩm không tồn tại
 * 8. Test xử lý số lượng = 0 (xóa sản phẩm)
 */
@DataJpaTest
@ActiveProfiles("test")
class CartServiceTest {

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
    @DisplayName("✅ Test: Thêm sản phẩm vào giỏ hàng mới - HAPPY PATH")
    void testThemSanPhamVaoGioHangMoi_HappyPath() {
        // Given - Chuẩn bị dữ liệu test
        Integer userId = 1;
        Integer productId = testProduct1.getId();
        Integer quantity = 2;
        
        System.out.println("\n=== TEST CASE: Thêm sản phẩm vào giỏ hàng mới (Happy Path) ===");
        System.out.println("📋 Given:");
        System.out.println("   - User ID: " + userId);
        System.out.println("   - Product ID: " + productId);
        System.out.println("   - Product Name: " + testProduct1.getName());
        System.out.println("   - Product Price: " + testProduct1.getPrice() + " VND");
        System.out.println("   - Quantity: " + quantity);

        // When - Thực hiện hành động
        System.out.println("\n🔄 When: Thêm sản phẩm vào giỏ hàng...");
        Cart cart = cartService.addToCart(userId, productId, quantity);
        entityManager.flush();
        entityManager.clear();
        
        // Reload cart từ database
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then - Kiểm tra kết quả
        System.out.println("\n✅ Then: Kiểm tra kết quả...");
        
        assertThat(reloadedCart).isNotNull();
        assertThat(reloadedCart.getUserId()).isEqualTo(userId);
        assertThat(cartItems).hasSize(1);
        
        CartItem cartItem = cartItems.get(0);
        assertThat(cartItem.getProductId()).isEqualTo(productId);
        assertThat(cartItem.getQuantity()).isEqualTo(quantity);
        assertThat(cartItem.getPrice()).isEqualTo(new BigDecimal("150000.00"));
        
        // Hiển thị kết quả chi tiết
        System.out.println("   ✅ Cart ID: " + reloadedCart.getId());
        System.out.println("   ✅ Cart Items Count: " + cartItems.size());
        System.out.println("   ✅ Item Product ID: " + cartItem.getProductId());
        System.out.println("   ✅ Item Quantity: " + cartItem.getQuantity());
        System.out.println("   ✅ Item Price: " + cartItem.getPrice() + " VND");
        System.out.println("   ✅ Total Amount: " + cartItem.getTotalPrice() + " VND");
        System.out.println("🎉 TEST RESULT: THÀNH CÔNG!");
        System.out.println("==========================================\n");
    }

    @Test
    @DisplayName("⚠️ Test: Thêm sản phẩm với số lượng lớn - EDGE CASE")
    void testThemSanPhamVoiSoLuongLon_EdgeCase() {
        // Given - Số lượng rất lớn
        Integer userId = 1;
        Integer productId = testProduct1.getId();
        Integer quantity = 1000; // Số lượng lớn
        
        System.out.println("\n=== TEST CASE: Thêm sản phẩm với số lượng lớn (Edge Case) ===");
        System.out.println("📋 Given:");
        System.out.println("   - User ID: " + userId);
        System.out.println("   - Product ID: " + productId);
        System.out.println("   - Quantity: " + quantity + " (số lượng lớn)");

        // When - Thực hiện hành động
        System.out.println("\n🔄 When: Thêm sản phẩm với số lượng lớn...");
        Cart cart = cartService.addToCart(userId, productId, quantity);
        entityManager.flush();
        entityManager.clear();
        
        // Reload cart từ database
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then - Kiểm tra kết quả
        System.out.println("\n✅ Then: Kiểm tra kết quả...");
        
        assertThat(reloadedCart).isNotNull();
        assertThat(cartItems).hasSize(1);
        
        CartItem cartItem = cartItems.get(0);
        assertThat(cartItem.getQuantity()).isEqualTo(quantity);
        assertThat(cartItem.getTotalPrice()).isEqualTo(new BigDecimal("150000000.00")); // 150000 * 1000
        
        System.out.println("   ✅ Cart ID: " + reloadedCart.getId());
        System.out.println("   ✅ Item Quantity: " + cartItem.getQuantity());
        System.out.println("   ✅ Total Amount: " + cartItem.getTotalPrice() + " VND");
        System.out.println("🎉 TEST RESULT: THÀNH CÔNG!");
        System.out.println("==========================================\n");
    }

    @Test
    @DisplayName("❌ Test: Thêm sản phẩm không tồn tại - ERROR CASE")
    void testThemSanPhamKhongTonTai_ErrorCase() {
        // Given - Sản phẩm không tồn tại
        Integer userId = 1;
        Integer nonExistentProductId = 99999;
        Integer quantity = 1;
        
        System.out.println("\n=== TEST CASE: Thêm sản phẩm không tồn tại (Error Case) ===");
        System.out.println("📋 Given:");
        System.out.println("   - User ID: " + userId);
        System.out.println("   - Product ID: " + nonExistentProductId + " (không tồn tại)");
        System.out.println("   - Quantity: " + quantity);

        // When & Then - Kiểm tra exception
        System.out.println("\n🔄 When: Thêm sản phẩm không tồn tại...");
        System.out.println("❌ Then: Kiểm tra exception...");
        
        assertThatThrownBy(() -> cartService.addToCart(userId, nonExistentProductId, quantity))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Product not found");
        
        System.out.println("   ✅ Exception thrown: RuntimeException");
        System.out.println("   ✅ Error message: 'Product not found'");
        System.out.println("🎉 TEST RESULT: THÀNH CÔNG!");
        System.out.println("==========================================\n");
    }

    // ========== UPDATE QUANTITY FUNCTION - 3 TEST CASES ==========
    
    @Test
    @DisplayName("✅ Test: Cập nhật số lượng sản phẩm đã có - HAPPY PATH")
    void testCapNhatSoLuongSanPhamDaCo_HappyPath() {
        // Given
        Integer userId = 1;
        Integer productId = testProduct1.getId();
        
        // Thêm lần đầu
        cartService.addToCart(userId, productId, 2);
        entityManager.flush();
        entityManager.clear();

        // When - Thêm lần thứ 2
        cartService.addToCart(userId, productId, 3);
        entityManager.flush();
        entityManager.clear();
        
        // Reload từ database
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).hasSize(1);
        CartItem cartItem = cartItems.get(0);
        assertThat(cartItem.getQuantity()).isEqualTo(5); // 2 + 3 = 5
    }

    @Test
    @DisplayName("⚠️ Test: Cập nhật số lượng = 0 (xóa sản phẩm) - EDGE CASE")
    void testCapNhatSoLuongBang0_EdgeCase() {
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
        
        // Reload từ database
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).isEmpty();
    }

    @Test
    @DisplayName("❌ Test: Cập nhật số lượng sản phẩm không tồn tại - ERROR CASE")
    void testCapNhatSoLuongSanPhamKhongTonTai_ErrorCase() {
        // Given
        Integer userId = 1;
        Integer nonExistentProductId = 999;

        // When & Then
        assertThatThrownBy(() -> cartService.updateQuantity(userId, nonExistentProductId, 5))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Cart item not found");
    }

    @Test
    void testXoaSanPhamKhoiGioHang_ThanhCong() {
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
        
        // Reload từ database
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).isEmpty();
    }

    @Test
    void testCapNhatSoLuongSanPham_ThanhCong() {
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
        
        // Reload từ database
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).hasSize(1);
        CartItem cartItem = cartItems.get(0);
        assertThat(cartItem.getQuantity()).isEqualTo(5);
    }

    @Test
    void testCapNhatSoLuongBang0_XoaSanPham() {
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
        
        // Reload từ database
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).isEmpty();
    }

    @Test
    void testXoaToanBoGioHang_ThanhCong() {
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
        
        // Reload từ database
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(cartItems).isEmpty();
    }

    @Test
    void testTinhTongTienGioHang_ThanhCong() {
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
    void testSanPhamKhongTonTai_ThrowException() {
        // Given
        Integer userId = 1;
        Integer nonExistentProductId = 999;

        // When & Then
        assertThatThrownBy(() -> cartService.addToCart(userId, nonExistentProductId, 1))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Product not found");
    }

    @Test
    void testCapNhatSoLuongSanPhamKhongTonTai_ThrowException() {
        // Given
        Integer userId = 1;
        Integer nonExistentProductId = 999;

        // When & Then
        assertThatThrownBy(() -> cartService.updateQuantity(userId, nonExistentProductId, 5))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Cart item not found");
    }

    @Test
    void testLayHoacTaoGioHangMoi_ThanhCong() {
        // Given
        Integer userId = 1;

        // When
        Cart cart = cartService.getOrCreateCart(userId);
        entityManager.flush();
        entityManager.clear();
        
        // Reload từ database
        Cart reloadedCart = cartRepository.findByUserId(userId).orElse(null);
        List<CartItem> cartItems = cartItemRepository.findByCart(reloadedCart);

        // Then
        assertThat(reloadedCart).isNotNull();
        assertThat(reloadedCart.getUserId()).isEqualTo(userId);
        assertThat(cartItems).isEmpty();
    }

    @Test
    void testLayGioHangDaTonTai_ThanhCong() {
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
}