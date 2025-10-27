# 🛒 Cart Testing Project

## 📋 **Tổng quan dự án**

Dự án **Cart Testing** là một implementation comprehensive testing cho module giỏ hàng (Shopping Cart) trong ứng dụng Spring Boot. Dự án đạt được **87% coverage** với **45 test cases** chuyên nghiệp.

### **🎯 Mục tiêu dự án**
- Implement comprehensive testing cho Cart functionality
- Đạt coverage >80% cho tất cả metrics
- Tạo professional documentation và guides
- Demo complete API functionality
- Establish best practices cho testing

---

## 🚀 **Kết quả đạt được**

### **📊 Test Coverage**
- **Instructions Coverage:** 87% ✅
- **Branches Coverage:** 87% ✅
- **Lines Coverage:** 87% ✅
- **Methods Coverage:** 92% ✅

### **🧪 Test Statistics**
- **Total Test Cases:** 45
- **Unit Tests:** 21 (CartService)
- **Integration Tests:** 24 (CartController)
- **Test Execution Time:** <15 giây
- **Test Success Rate:** 100%

### **📁 Project Structure**
```
src/
├── main/java/com/example/demo/Cart/
│   ├── Cart.java                    # Entity
│   ├── CartItem.java               # Entity
│   ├── CartService.java            # Business Logic
│   ├── CartController.java         # API Endpoints
│   ├── CartRepository.java         # Data Access
│   └── CartItemRepository.java     # Data Access
└── test/java/com/example/demo/Cart/
    ├── CartServiceTestGrouped.java           # Unit Tests
    ├── CartControllerIntegrationTestGrouped.java # Integration Tests
    ├── CartServiceTest.java                 # Legacy Unit Tests
    └── CartControllerIntegrationTest.java    # Legacy Integration Tests
```

---

## 🛠️ **Công nghệ sử dụng**

### **Backend Framework**
- **Spring Boot:** 3.2.0
- **Java:** 17
- **Maven:** Build tool
- **H2 Database:** Testing
- **SQL Server:** Production

### **Testing Framework**
- **JUnit 5:** Test framework
- **Mockito:** Mocking framework
- **JaCoCo:** Code coverage
- **MockMvc:** Integration testing
- **TestRestTemplate:** API testing

### **Tools & Libraries**
- **Postman:** API testing
- **Spring Security:** Authentication
- **JWT:** Token-based auth
- **Lombok:** Code generation
- **Hibernate:** ORM

---

## 📋 **Chức năng đã test**

### **🛒 Cart Management**
- ✅ **Add to Cart:** Thêm sản phẩm vào giỏ hàng
- ✅ **Remove from Cart:** Xóa sản phẩm khỏi giỏ hàng
- ✅ **Update Quantity:** Cập nhật số lượng sản phẩm
- ✅ **Get Cart:** Lấy thông tin giỏ hàng
- ✅ **Clear Cart:** Xóa toàn bộ giỏ hàng
- ✅ **Calculate Total:** Tính tổng tiền giỏ hàng
- ✅ **Get Item Count:** Đếm số sản phẩm trong giỏ
- ✅ **Check Empty:** Kiểm tra giỏ hàng có rỗng không

### **🔗 API Endpoints**
- ✅ **GET /api/cart:** Lấy thông tin giỏ hàng
- ✅ **POST /api/cart/add:** Thêm sản phẩm vào giỏ hàng
- ✅ **PUT /api/cart/update-quantity:** Cập nhật số lượng sản phẩm
- ✅ **DELETE /api/cart/remove/{productId}:** Xóa sản phẩm khỏi giỏ hàng
- ✅ **DELETE /api/cart/clear:** Xóa toàn bộ giỏ hàng

---

## 🧪 **Test Structure**

### **📊 Test Categories**
Mỗi logical function có **3 test cases**:

1. **Happy Path:** Trường hợp thành công bình thường
2. **Edge Case:** Trường hợp biên và điều kiện đặc biệt
3. **Error Case:** Xử lý lỗi và exception handling

### **🔧 Test Types**
- **Unit Tests:** Test individual components (CartService)
- **Integration Tests:** Test component interactions (CartController)
- **End-to-End Tests:** Test complete workflows
- **Performance Tests:** Test execution time và memory usage

---

## 🚀 **Cách chạy dự án**

### **Prerequisites**
- Java 17+
- Maven 3.6+
- IDE (IntelliJ IDEA, Eclipse, VS Code)

### **1. Clone Repository**
```bash
git clone [repository-url]
cd ProjectTestFer202/Foodsell/demo
```

### **2. Run Tests**
```bash
# Chạy tất cả tests
mvn test

# Chạy Cart tests cụ thể
mvn test -Dtest=CartServiceTestGrouped
mvn test -Dtest=CartControllerIntegrationTestGrouped

# Chạy với profile test
mvn test -Dspring.profiles.active=test
```

### **3. Generate Coverage Report**
```bash
# Tạo coverage report
mvn clean test jacoco:report

# Xem coverage report
# Mở file: target/site/jacoco/index.html
```

### **4. Run Spring Boot Application**
```bash
# PowerShell
Set-Location E:\ProjectTestFer202\Foodsell\demo
.\mvnw spring-boot:run

# Hoặc
cd E:\ProjectTestFer202\Foodsell\demo
mvn spring-boot:run
```

---

## 📊 **Coverage Reports**

### **📁 Report Locations**
- **Main Report:** `target/site/jacoco/index.html`
- **Cart Module Report:** `target/site/jacoco/com.example.demo.Cart/index.html`

### **📈 Coverage Metrics**
| Metric | Coverage | Status |
|--------|----------|--------|
| Instructions | 87% | ✅ Excellent |
| Branches | 87% | ✅ Excellent |
| Lines | 87% | ✅ Excellent |
| Methods | 92% | ✅ Excellent |
| Classes | 100% | ✅ Perfect |

---

## 🔧 **API Testing với Postman**

### **Authentication**
1. **Login:** `POST /api/auth/login`
   ```json
   {
     "email": "test@test.com",
     "password": "password123"
   }
   ```

2. **Get JWT Token:** Copy token từ response
3. **Use Token:** Add `Authorization: Bearer [JWT_TOKEN]` header

### **Cart API Endpoints**
```bash
# Lấy giỏ hàng
GET http://localhost:8080/api/cart
Authorization: Bearer [JWT_TOKEN]

# Thêm sản phẩm
POST http://localhost:8080/api/cart/add
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json
{
  "productId": 30,
  "quantity": 2
}

# Cập nhật số lượng
PUT http://localhost:8080/api/cart/update-quantity
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json
{
  "productId": 30,
  "quantity": 5
}

# Xóa sản phẩm
DELETE http://localhost:8080/api/cart/remove/30
Authorization: Bearer [JWT_TOKEN]

# Xóa toàn bộ giỏ hàng
DELETE http://localhost:8080/api/cart/clear
Authorization: Bearer [JWT_TOKEN]
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Test Failures**
```bash
# Lỗi: DataIntegrityViolationException
# Giải pháp: Sử dụng userId hợp lệ thay vì null

# Lỗi: StackOverflowError
# Giải pháp: Thêm @ToString(exclude = {"cartItems"}) vào Cart entity
```

#### **2. API Testing Issues**
```bash
# Lỗi: 403 Forbidden
# Giải pháp: Kiểm tra JWT token và authentication

# Lỗi: Required request body is missing
# Giải pháp: Thêm JSON body vào POST request
```

#### **3. Performance Issues**
```bash
# Lỗi: Test execution quá lâu
# Giải pháp: Optimize test setup và teardown
```

---

## 📚 **Documentation**

### **📁 Documentation Files**
- **`HUONG_DAN_TESTING_GIO_HANG.md`:** Hướng dẫn testing chi tiết
- **`AI_PROMPTS_LOG.md`:** Log các prompt AI đã sử dụng
- **`PROMPT_CHUYEN_NGHIEP_TESTING.md`:** Template prompt chuyên nghiệp
- **`create-test-data.sql`:** Script tạo test data

### **📖 Key Documentation**
1. **Testing Strategy:** Comprehensive approach
2. **API Testing Guide:** Postman collection setup
3. **Coverage Analysis:** Detailed coverage reports
4. **Troubleshooting Guide:** Common issues và solutions
5. **Best Practices:** Professional testing standards

---

## 🎯 **Best Practices**

### **🧪 Testing Standards**
- **Given-When-Then** pattern cho test structure
- **@DisplayName** annotations cho clear descriptions
- **Comprehensive assertions** với meaningful messages
- **Proper mocking** của dependencies
- **Test data management** efficiency

### **📊 Coverage Standards**
- **Minimum coverage:** 80% cho tất cả metrics
- **Optimal coverage:** 90%+ cho critical business logic
- **Regular monitoring** của coverage trends
- **Coverage improvement** planning

### **🔧 Code Quality**
- **Error handling** comprehensive
- **Logging** cho debugging
- **BigDecimal** cho monetary calculations
- **Security configurations** proper
- **Documentation** professional

---

## 🚀 **Future Improvements**

### **📈 Planned Enhancements**
- **Performance testing** với large datasets
- **Load testing** cho concurrent users
- **Security testing** comprehensive
- **API documentation** với Swagger
- **CI/CD integration** với automated testing

### **🔧 Technical Debt**
- **Legacy test cleanup** (CartServiceTest.java, CartControllerIntegrationTest.java)
- **Test data optimization** cho better performance
- **Mock object** standardization
- **Test execution** parallelization

---

## 👥 **Contributors**

### **Development Team**
- **Lead Developer:** [Your Name]
- **QA Engineer:** [QA Name]
- **DevOps Engineer:** [DevOps Name]

### **Special Thanks**
- **AI Assistant:** Claude Sonnet 4 cho comprehensive testing strategy
- **Community:** Spring Boot và JUnit community cho best practices

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 **Contact**

- **Email:** [your-email@example.com]
- **GitHub:** [your-github-username]
- **LinkedIn:** [your-linkedin-profile]

---

## 🎉 **Acknowledgments**

- **Spring Boot Team** cho excellent framework
- **JUnit Team** cho powerful testing framework
- **Mockito Team** cho comprehensive mocking
- **JaCoCo Team** cho detailed coverage analysis

---

**⭐ Nếu dự án này hữu ích, hãy star repository này!** ⭐
