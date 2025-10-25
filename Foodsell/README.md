# HƯỚNG DẪN TESTING CHỨC NĂNG GIỎ HÀNG

## Tổng quan

Tài liệu này hướng dẫn cách test chức năng giỏ hàng (Shopping Cart) trong hệ thống Food Delivery theo đúng yêu cầu đã được định nghĩa.

## Kiến trúc hệ thống

### Backend (Spring Boot)
- **CartService**: Xử lý logic giỏ hàng
- **CartController**: API endpoints cho giỏ hàng
- **Cart Entity**: Entity giỏ hàng
- **CartItem Entity**: Entity sản phẩm trong giỏ hàng
- **CartRepository**: Repository cho Cart
- **CartItemRepository**: Repository cho CartItem

### Frontend (React)
- **CartContext**: Quản lý state giỏ hàng
- **Cart Component**: UI component giỏ hàng
- **ProductDetail**: Component thêm sản phẩm vào giỏ hàng

## Các loại testing

### 1. Unit Testing

#### Backend Unit Tests
```bash
# Chạy unit tests cho CartService
.\mvnw test -Dtest=CartServiceTest
```

**Coverage**: 99% instruction, 83% branch

**Test cases bao gồm**:
- Thêm sản phẩm vào giỏ hàng mới
- Thêm sản phẩm vào giỏ hàng đã có sản phẩm
- Cập nhật số lượng sản phẩm
- Xóa sản phẩm khỏi giỏ hàng
- Xóa toàn bộ giỏ hàng
- Tính tổng tiền giỏ hàng
- Kiểm tra giỏ hàng trống
- Xử lý lỗi khi sản phẩm không tồn tại
- Xử lý số lượng âm
- Xử lý số lượng = 0

#### Frontend Unit Tests
```bash
# Chạy frontend tests
cd foodsystem
npm test
```

**Test cases bao gồm**:
- Thêm sản phẩm vào giỏ hàng
- Xóa sản phẩm khỏi giỏ hàng
- Cập nhật số lượng
- Tính tổng tiền
- Lưu/khôi phục từ localStorage
- Xử lý edge cases

### 2. Integration Testing

#### Backend Integration Tests
```bash
# Chạy integration tests
.\mvnw test -Dtest=CartControllerIntegrationTest
```

**Test cases bao gồm**:
- GET /api/cart - Lấy thông tin giỏ hàng
- POST /api/cart/add - Thêm sản phẩm vào giỏ hàng
- DELETE /api/cart/remove/{productId} - Xóa sản phẩm
- PUT /api/cart/update-quantity - Cập nhật số lượng
- DELETE /api/cart/clear - Xóa toàn bộ giỏ hàng
- Xử lý authentication
- Xử lý lỗi validation

### 3. End-to-End Testing

#### Manual Testing qua Web Interface
1. **Truy cập**: `http://localhost:3000`
2. **Đăng nhập**: Sử dụng tài khoản customer
3. **Thêm sản phẩm**: Click "Thêm vào giỏ hàng"
4. **Kiểm tra giỏ hàng**: Click icon giỏ hàng
5. **Cập nhật số lượng**: Sử dụng +/- buttons
6. **Xóa sản phẩm**: Click "Xóa"
7. **Thanh toán**: Click "Thanh toán"

#### API Testing với Postman/curl
```bash
# Lấy token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"password123"}'

# Lấy giỏ hàng
curl -X GET http://localhost:8080/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"

# Thêm sản phẩm
curl -X POST http://localhost:8080/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

### 4. Performance Testing

#### Load Testing
```bash
# Sử dụng Apache Bench
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/cart
```

#### Stress Testing
- Test với 100+ sản phẩm trong giỏ hàng
- Test với nhiều user đồng thời
- Test với database lớn

## Cấu hình Testing

### Database Testing
```properties
# application-test.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

### Test Data Setup
```java
@BeforeEach
void setUp() {
    // Tạo user test
    testUser = new User();
    testUser.setEmail("testuser@example.com");
    testUser.setPasswordHash("password123");
    testUser.setRole("customer");
    testUser.setIsVerified(true);
    
    // Tạo sản phẩm test
    testProduct = new Product();
    testProduct.setName("Pizza Test");
    testProduct.setPrice(150000.0);
    testProduct.setAvailable(true);
}
```

## Kết quả Testing

### Coverage Report
- **CartService**: 99% instruction, 83% branch
- **CartController**: 84% instruction, 50% branch
- **Tổng Cart Package**: 85% instruction, 75% branch

### Test Results
```
Tests run: 20, Failures: 0, Errors: 0, Skipped: 0
- Unit Tests: 11 passed
- Integration Tests: 9 passed
```

## Các lỗi thường gặp và cách xử lý

### 1. Lazy Loading Exception
**Lỗi**: `LazyInitializationException`
**Nguyên nhân**: Truy cập cartItems ngoài transaction
**Giải pháp**: Sử dụng `FetchType.EAGER` hoặc `@Transactional`

### 2. StackOverflowError
**Lỗi**: `StackOverflowError` trong `toString()`
**Nguyên nhân**: Bidirectional relationship
**Giải pháp**: Thêm `@ToString(exclude = {"cartItems"})`

### 3. Authentication Error
**Lỗi**: `401 Unauthorized`
**Nguyên nhân**: Thiếu JWT token
**Giải pháp**: Thêm `Authorization: Bearer TOKEN` header

### 4. BigDecimal Format Error
**Lỗi**: `NumberFormatException`
**Nguyên nhân**: Sai format BigDecimal
**Giải pháp**: Sử dụng `new BigDecimal("150000.00")`

## Best Practices

### 1. Test Isolation
- Mỗi test độc lập
- Cleanup data sau mỗi test
- Sử dụng `@Transactional` cho rollback

### 2. Mocking
- Mock external dependencies
- Sử dụng `@MockBean` cho Spring tests
- Verify interactions với `verify()`

### 3. Assertions
- Sử dụng AssertJ cho assertions mạnh mẽ
- Test cả happy path và error cases
- Kiểm tra edge cases

### 4. Performance
- Sử dụng `@DirtiesContext` khi cần
- Tránh `@SpringBootTest` cho unit tests đơn giản
- Sử dụng `@DataJpaTest` cho repository tests

## Monitoring và Debugging

### Logging
```java
private static final Logger logger = LoggerFactory.getLogger(CartService.class);

logger.info("Adding to cart - userId: {}, productId: {}, quantity: {}", 
           userId, productId, quantity);
```

### Debug Tools
- H2 Console: `http://localhost:8080/h2-console`
- JaCoCo Report: `target/site/jacoco/index.html`
- Spring Boot Actuator: `/actuator/health`

## Kết luận

Hệ thống giỏ hàng đã được test đầy đủ với:
- ✅ 20 test cases (11 unit + 9 integration)
- ✅ 85% code coverage
- ✅ Tất cả test cases pass
- ✅ Xử lý đầy đủ error cases
- ✅ Performance testing ready
- ✅ Documentation đầy đủ

Hệ thống sẵn sàng cho production deployment.
