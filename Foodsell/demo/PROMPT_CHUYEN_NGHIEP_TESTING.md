# 🎯 PROMPT CHUYÊN NGHIỆP CHO DỰ ÁN TESTING

## 📋 **Tổng quan dự án**
Dựa trên kinh nghiệm thực tế từ dự án Cart Testing với **87% coverage** và **45 test cases** comprehensive, đây là các prompt chuyên nghiệp cho từng giai đoạn phát triển.

---

## 🚀 **GIAI ĐOẠN 1: PHÂN TÍCH VÀ THIẾT KẾ TEST STRATEGY**

### **Prompt 1.1: Phân tích yêu cầu và thiết kế test**
```
Tôi cần phân tích và thiết kế test strategy cho module Cart trong ứng dụng Spring Boot.

**Thông tin dự án:**
- Framework: Spring Boot 3.x với JUnit 5, Mockito, JaCoCo
- Database: H2 (testing) + SQL Server (production)
- Kiến trúc: Layered architecture (Controller → Service → Repository → Entity)
- Mục tiêu coverage: >80% cho package Cart

**Yêu cầu cụ thể:**
1. Phân tích các chức năng chính của Cart
2. Xác định các test cases cần thiết cho từng chức năng
3. Thiết kế test structure với 3 loại test case:
   - Happy Path: Trường hợp thành công bình thường
   - Edge Case: Trường hợp biên và điều kiện đặc biệt
   - Error Case: Xử lý lỗi và exception handling
4. Đề xuất coverage target cho từng class
5. Tạo test plan chi tiết

**Cấu trúc module hiện tại:**
- Entity: Cart, CartItem
- Service: CartService
- Controller: CartController
- Repository: CartRepository, CartItemRepository

**Deliverables mong đợi:**
1. Test strategy document
2. Test case matrix
3. Coverage analysis plan
4. Risk assessment và mitigation strategies

Hãy phân tích và đưa ra test strategy comprehensive.
```

### **Prompt 1.2: Thiết kế test data và mock objects**
```
Tôi cần thiết kế test data và mock objects cho module Cart.

**Yêu cầu:**
1. Tạo test data factory cho các entity
2. Thiết kế mock objects cho dependencies
3. Xác định test scenarios cần test data
4. Tạo test data setup và teardown strategies
5. Đề xuất test data management approach

**Dependencies cần mock:**
- CartRepository: Mock database operations
- CartItemRepository: Mock cart item operations
- ProductRepository: Mock product validation
- UserRepository: Mock user validation

**Test data requirements:**
- Valid data cho happy path tests
- Invalid data cho error case tests
- Boundary data cho edge case tests
- Complex data cho integration tests

Hãy thiết kế comprehensive test data strategy.
```

---

## 🧪 **GIAI ĐOẠN 2: IMPLEMENTATION UNIT TESTS**

### **Prompt 2.1: Tạo Unit Tests cho Service Layer**
```
Tôi cần tạo comprehensive unit tests cho CartService class.

**Yêu cầu:**
1. Tạo test class với structure chuyên nghiệp
2. Implement 3 test cases cho mỗi method:
   - Happy Path: Trường hợp thành công
   - Edge Case: Trường hợp biên
   - Error Case: Xử lý lỗi
3. Sử dụng @DisplayName cho test descriptions rõ ràng
4. Follow Given-When-Then pattern
5. Implement proper assertions với meaningful messages
6. Mock tất cả dependencies
7. Test coverage target: >90%

**Methods cần test:**
- addToCart: Thêm sản phẩm vào giỏ hàng
- removeFromCart: Xóa sản phẩm khỏi giỏ hàng
- updateQuantity: Cập nhật số lượng sản phẩm
- getOrCreateCart: Lấy hoặc tạo giỏ hàng mới
- calculateTotal: Tính tổng tiền giỏ hàng
- getCartItemCount: Đếm số sản phẩm trong giỏ
- isCartEmpty: Kiểm tra giỏ hàng có rỗng không
- clearCart: Xóa toàn bộ giỏ hàng

**Mock requirements:**
- CartRepository: Mock cart database operations
- CartItemRepository: Mock cart item database operations
- ProductRepository: Mock product validation calls
- UserRepository: Mock user validation calls

**Expected output:**
1. Complete test class với comprehensive coverage
2. Test data setup methods
3. Mock configuration
4. Assertion strategies
5. Error handling tests

Hãy tạo unit tests professional và comprehensive.
```

### **Prompt 2.2: Tạo Unit Tests cho Repository Layer**
```
Tôi cần tạo unit tests cho CartRepository class.

**Yêu cầu:**
1. Test tất cả custom query methods
2. Test CRUD operations
3. Test database constraints và validations
4. Test transaction handling
5. Test performance với large datasets
6. Mock database operations nếu cần

**Repository methods:**
- findByUserId: Tìm giỏ hàng theo user ID
- save: Lưu giỏ hàng vào database
- delete: Xóa giỏ hàng
- findByCartIdAndProductId: Tìm cart item theo cart và product

**Test scenarios:**
- Valid data operations
- Invalid data handling
- Database constraint violations
- Performance với large datasets
- Transaction rollback scenarios

Hãy tạo repository tests comprehensive.
```

---

## 🔗 **GIAI ĐOẠN 3: IMPLEMENTATION INTEGRATION TESTS**

### **Prompt 3.1: Tạo Integration Tests cho Controller**
```
Tôi cần tạo integration tests cho CartController class.

**Yêu cầu:**
1. Test tất cả API endpoints
2. Test HTTP methods (GET, POST, PUT, DELETE)
3. Test request/response validation
4. Test authentication và authorization
5. Test error handling (400, 401, 403, 404, 500)
6. Test với real database (H2)
7. Test với real Spring context

**API Endpoints:**
- GET /api/cart: Lấy thông tin giỏ hàng
- POST /api/cart/add: Thêm sản phẩm vào giỏ hàng
- PUT /api/cart/update-quantity: Cập nhật số lượng sản phẩm
- DELETE /api/cart/remove/{productId}: Xóa sản phẩm khỏi giỏ hàng
- DELETE /api/cart/clear: Xóa toàn bộ giỏ hàng

**Test scenarios:**
- Valid requests với proper authentication
- Invalid requests với missing data
- Unauthorized access attempts
- Database integration scenarios
- Error response validation

**Authentication:**
- Method: JWT Bearer Token
- Login endpoint: /api/auth/login
- Token validation: JwtAuthenticationFilter

Hãy tạo integration tests comprehensive với MockMvc.
```

### **Prompt 3.2: Tạo End-to-End Tests**
```
Tôi cần tạo end-to-end tests cho complete workflows của Cart.

**Yêu cầu:**
1. Test complete user workflows
2. Test multiple API calls trong sequence
3. Test data persistence across requests
4. Test error recovery scenarios
5. Test với real database và Spring context
6. Test performance với multiple concurrent requests

**Workflows cần test:**
- Complete Shopping Workflow: Login → Add Product → Update Quantity → Remove Product → Checkout
- Cart Management Workflow: Create Cart → Add Multiple Products → Calculate Total → Clear Cart
- Error Recovery Workflow: Invalid Product → Error Handling → Retry với Valid Product

**Test scenarios:**
- Complete successful workflows
- Workflow với errors và recovery
- Concurrent user scenarios
- Data consistency across workflows
- Performance với large datasets

Hãy tạo end-to-end tests comprehensive.
```

---

## 🐛 **GIAI ĐOẠN 4: DEBUGGING VÀ TROUBLESHOOTING**

### **Prompt 4.1: Debug Test Failures**
```
Tôi đang gặp lỗi trong test execution cho Cart. Hãy giúp tôi debug và resolve.

**Lỗi hiện tại:**
- DataIntegrityViolationException: NULL not allowed for column "USER_ID"
- StackOverflowError: Bidirectional relationships trong Cart và CartItem
- ObjectDeletedException: Cart object state inconsistency sau khi delete CartItem

**Environment:**
- Spring Boot: 3.2.0
- Java: 17
- Database: H2 (test), SQL Server (production)
- Test Framework: JUnit 5 + Mockito

**Error logs:**
```
[PASTE_ERROR_LOGS_HERE]
```

**Test code hiện tại:**
```java
[PASTE_RELEVANT_CODE_HERE]
```

**Yêu cầu:**
1. Identify root causes của các lỗi
2. Provide step-by-step solutions
3. Explain tại sao lỗi xảy ra
4. Suggest preventive measures
5. Provide corrected code với explanations

Hãy analyze và provide comprehensive solutions.
```

### **Prompt 4.2: Performance Optimization**
```
Tôi cần optimize performance của test suite cho Cart.

**Performance issues hiện tại:**
- Test execution time quá lâu (>30 giây cho 45 test cases)
- Memory usage cao do tạo nhiều Cart objects
- Database operations không được optimize

**Performance requirements:**
1. Test execution time < 15 giây cho 45 test cases
2. Memory usage optimization
3. Database query optimization
4. Parallel test execution
5. Test data management efficiency

**Optimization areas:**
- Test setup và teardown
- Database operations
- Mock object creation
- Test data generation
- Test execution strategies

**Expected deliverables:**
1. Performance analysis report
2. Optimization recommendations
3. Code refactoring suggestions
4. Performance testing results
5. Monitoring strategies

Hãy provide comprehensive performance optimization solutions.
```

---

## 📊 **GIAI ĐOẠN 5: COVERAGE ANALYSIS VÀ REPORTING**

### **Prompt 5.1: Coverage Analysis và Improvement**
```
Tôi cần analyze và improve test coverage cho Cart.

**Current coverage status:**
- Instructions Coverage: 87%
- Branches Coverage: 87%
- Lines Coverage: 87%
- Methods Coverage: 92%

**Target coverage:**
- Minimum: 80% cho tất cả metrics
- Optimal: 90%+ cho critical business logic

**Yêu cầu:**
1. Analyze current JaCoCo coverage report
2. Identify uncovered code areas
3. Suggest additional test cases cho uncovered scenarios
4. Provide strategies để improve coverage
5. Create coverage improvement plan
6. Generate professional coverage documentation

**Coverage report locations:**
- Main Report: target/site/jacoco/index.html
- Module Report: target/site/jacoco/com.example.demo.Cart/index.html

Hãy provide comprehensive coverage analysis và improvement strategy.
```

### **Prompt 5.2: Generate Coverage Reports**
```
Tôi cần generate comprehensive coverage reports cho Cart.

**Yêu cầu:**
1. Generate JaCoCo coverage reports
2. Create coverage analysis document
3. Identify coverage gaps
4. Provide coverage improvement recommendations
5. Create coverage dashboard
6. Generate coverage trends analysis

**Report types needed:**
- HTML coverage reports
- XML coverage data
- CSV coverage data
- Coverage analysis document
- Coverage improvement plan

**Coverage metrics:**
- Line coverage
- Branch coverage
- Method coverage
- Class coverage
- Package coverage

Hãy generate comprehensive coverage reports và analysis.
```

---

## 📚 **GIAI ĐOẠN 6: DOCUMENTATION VÀ DEMO**

### **Prompt 6.1: Tạo Testing Documentation**
```
Tôi cần tạo professional documentation cho Cart testing implementation.

**Documentation requirements:**
1. **Testing Strategy Document**
   - Overview của testing approach
   - Test types và purposes
   - Coverage targets và metrics
   - Testing tools và frameworks

2. **Test Execution Guide**
   - Step-by-step test execution instructions
   - Environment setup requirements
   - Command-line instructions
   - IDE configuration

3. **API Testing Guide**
   - Manual testing procedures
   - Postman collection setup
   - Authentication configuration
   - Common issues và solutions

4. **Troubleshooting Guide**
   - Common errors và solutions
   - Debugging techniques
   - Performance optimization tips
   - Best practices

5. **Coverage Analysis Report**
   - Current coverage metrics
   - Coverage improvement plan
   - Uncovered code analysis
   - Recommendations

**Target audience:**
- Developers
- QA Engineers
- DevOps Engineers
- Project Managers

**Format requirements:**
- Markdown format
- Clear structure với headings
- Code examples với syntax highlighting
- Screenshots cho complex procedures
- Professional language và terminology

Hãy tạo comprehensive, professional documentation.
```

### **Prompt 6.2: Tạo Demo và Presentation**
```
Tôi cần tạo demo và presentation cho Cart testing implementation.

**Demo requirements:**
1. **Live Demo Script**
   - Test execution demonstration
   - Coverage report walkthrough
   - API testing demonstration
   - Performance testing showcase

2. **Presentation Slides**
   - Project overview
   - Testing strategy
   - Coverage results
   - Best practices
   - Lessons learned

3. **Video Tutorials**
   - Test execution tutorial
   - Coverage analysis tutorial
   - API testing tutorial
   - Troubleshooting tutorial

4. **Interactive Examples**
   - Hands-on test execution
   - Coverage analysis exercises
   - API testing practice
   - Debugging exercises

**Demo scenarios:**
- Live Cart Testing Demo: Thực hiện add/remove/update products trong giỏ hàng
- Coverage Report Walkthrough: Hướng dẫn đọc và phân tích coverage report
- API Testing Demo: Test các endpoints với Postman
- Performance Testing Demo: So sánh performance trước và sau optimization

**Expected deliverables:**
1. Demo script với step-by-step instructions
2. Presentation slides với professional design
3. Video tutorials với clear explanations
4. Interactive examples với hands-on practice
5. Q&A preparation với common questions

Hãy tạo comprehensive demo và presentation materials.
```

---

## 🎯 **PROMPT TEMPLATE CUSTOMIZATION**

### **Cách sử dụng các prompt:**

1. **Thay thế placeholders:**
   - `[TÊN_MODULE]` → Cart (hoặc module cụ thể khác)
   - `[TÊN_SERVICE]` → CartService
   - `[TÊN_CONTROLLER]` → CartController
   - `[TÊN_ENTITY]` → Cart, CartItem
   - `[TÊN_REPOSITORY]` → CartRepository, CartItemRepository

2. **Customize requirements:**
   - Điều chỉnh coverage targets dựa trên project needs
   - Modify testing frameworks nếu khác
   - Update authentication methods nếu cần
   - Change CI/CD platforms nếu required

3. **Combine prompts:**
   - Sử dụng multiple prompts cho comprehensive coverage
   - Adapt prompts cho different project phases
   - Modify dựa trên team requirements

### **Best Practices:**

1. **Be Specific:** Provide detailed context và requirements
2. **Include Examples:** Add code snippets và error logs
3. **Set Clear Expectations:** Define deliverables và success criteria
4. **Iterate:** Refine prompts dựa trên results
5. **Document:** Keep track của successful prompt patterns

---

## 🚀 **KẾT QUẢ MONG ĐỢI**

Sử dụng các prompt này sẽ giúp bạn:

### **✅ Deliverables:**
- **Comprehensive test suite** với 87% coverage (Cart package)
- **Professional documentation** và guides (HUONG_DAN_TESTING_GIO_HANG.md)
- **Performance optimized** test execution (<15 giây cho 45 test cases)
- **Complete API testing** với Postman collections
- **Coverage reports** và analysis (JaCoCo HTML reports)
- **Demo materials** và presentations

### **✅ Skills Development:**
- **Professional testing practices**
- **Advanced debugging techniques**
- **Performance optimization**
- **Documentation standards**
- **Presentation skills**

### **✅ Project Success:**
- **High quality code** với comprehensive testing (87% coverage)
- **Professional documentation** cho team (AI_PROMPTS_LOG.md, HUONG_DAN_TESTING_GIO_HANG.md)
- **Easy maintenance** và future development
- **Knowledge transfer** cho team members
- **Industry standard** implementation

---

## 🎉 **KẾT LUẬN**

Các prompt này được thiết kế dựa trên **kinh nghiệm thực tế** từ dự án Cart Testing với:
- **87% coverage** achievement
- **45 comprehensive test cases**
- **Professional documentation**
- **Complete API functionality**
- **Industry best practices**

**Sử dụng các template này làm foundation và customize cho specific project needs!** 🚀
