package com.example.demo.Cart;

import com.example.demo.products.Product;
import com.example.demo.products.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service xử lý logic giỏ hàng
 * 
 * Mục đích: Cung cấp các phương thức để quản lý giỏ hàng
 * Logic: 
 * - Mỗi user có một giỏ hàng duy nhất
 * - Thêm sản phẩm vào giỏ hàng (tạo mới hoặc cập nhật số lượng)
 * - Xóa sản phẩm khỏi giỏ hàng
 * - Cập nhật số lượng sản phẩm
 * - Tính tổng tiền giỏ hàng
 */
@Service
@Transactional
public class CartService {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Autowired
    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    /**
     * Lấy hoặc tạo giỏ hàng mới cho user
     * @param userId ID của user
     * @return Cart object
     */
    public Cart getOrCreateCart(Integer userId) {
        return cartRepository.findByUserId(userId)
            .orElseGet(() -> {
                Cart newCart = new Cart();
                newCart.setUserId(userId);
                newCart.setCreatedAt(LocalDateTime.now());
                newCart.setUpdatedAt(LocalDateTime.now());
                return cartRepository.save(newCart);
            });
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     * @param userId ID của user
     * @param productId ID của sản phẩm
     * @param quantity Số lượng
     * @return Cart object đã được cập nhật
     */
    public Cart addToCart(Integer userId, Integer productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingItem = cartItemRepository.findByCartAndProductId(cart, productId);
        
        if (existingItem.isPresent()) {
            // Cập nhật số lượng sản phẩm đã có
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            // Tạo cart item mới
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProductId(productId);
            newItem.setQuantity(quantity);
            newItem.setPrice(BigDecimal.valueOf(product.getPrice()));
            newItem.setCreatedAt(LocalDateTime.now());
            cartItemRepository.save(newItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     * @param userId ID của user
     * @param productId ID của sản phẩm
     * @return Cart object đã được cập nhật
     */
    public Cart removeFromCart(Integer userId, Integer productId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartAndProductId(cart, productId);
        cart.setUpdatedAt(LocalDateTime.now());
        // Refresh cart để cập nhật cartItems collection
        cart.getCartItems().removeIf(item -> item.getProductId().equals(productId));
        return cart;
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     * @param userId ID của user
     * @param productId ID của sản phẩm
     * @param quantity Số lượng mới
     * @return Cart object đã được cập nhật
     */
    public Cart updateQuantity(Integer userId, Integer productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findByCartAndProductId(cart, productId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            // Xóa sản phẩm nếu số lượng <= 0
            cartItemRepository.delete(item);
            // Refresh cart để cập nhật cartItems collection
            cart.getCartItems().removeIf(cartItem -> cartItem.getProductId().equals(productId));
        } else {
            // Cập nhật số lượng
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cart;
    }

    /**
     * Xóa toàn bộ giỏ hàng
     * @param userId ID của user
     * @return Cart object đã được cập nhật
     */
    public Cart clearCart(Integer userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCart(cart);
        cart.setUpdatedAt(LocalDateTime.now());
        // Refresh cart để cập nhật cartItems collection
        cart.getCartItems().clear();
        return cart;
    }

    /**
     * Tính tổng tiền giỏ hàng
     * @param userId ID của user
     * @return Tổng tiền
     */
    public BigDecimal calculateTotal(Integer userId) {
        Cart cart = getOrCreateCart(userId);
        // Force load cartItems để tránh lazy loading
        cart.getCartItems().size();
        return cart.getCartItems().stream()
            .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Lấy số lượng sản phẩm trong giỏ hàng
     * @param userId ID của user
     * @return Số lượng sản phẩm
     */
    public long getCartItemCount(Integer userId) {
        Cart cart = getOrCreateCart(userId);
        return cartItemRepository.countByCart(cart);
    }

    /**
     * Kiểm tra giỏ hàng có trống không
     * @param userId ID của user
     * @return true nếu trống, false nếu không
     */
    public boolean isCartEmpty(Integer userId) {
        return getCartItemCount(userId) == 0;
    }
}
