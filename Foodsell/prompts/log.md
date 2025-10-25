# 🎯 PROFESSIONAL TESTING PROMPTS — CART MODULE

## 📋 Project Overview

Based on real implementation for **Cart Testing** with:

* ✅ 87% code coverage
* ✅ 45 total test cases
* ✅ 5 structured test classes:

```
CartServiceTest.java
CartServiceTestExpanded.java
CartServiceTestGrouped.java
CartControllerIntegrationTest.java
CartControllerIntegrationTestGrouped.java
```

---

## 🚀 PHASE 1 — TEST STRATEGY & DESIGN

### ✅ Prompt 1.1 — Test Strategy for Cart Module

```
I need a complete Test Strategy for the **Cart module** of a Spring Boot application.

Project Stack:
- Spring Boot 3.x, JUnit 5, Mockito, JaCoCo
- H2 (Testing), SQL Server (Production)
- Controller → Service → Repository → Entity structure
- Target coverage: >80% for Cart package

Module Structure:
- Entities: Cart, CartItem
- Service: CartService
- Controller: CartController
- Repositories: CartRepository, CartItemRepository
- Test Classes:
  * CartServiceTest.java
  * CartServiceTestExpanded.java
  * CartServiceTestGrouped.java
  * CartControllerIntegrationTest.java
  * CartControllerIntegrationTestGrouped.java

Deliverables:
- Test Strategy Document
- Test Case Matrix
- Coverage Analysis Plan
- Risk Assessment & Mitigation Plan

Please analyze and create a detailed test strategy.
```

---

### ✅ Prompt 1.2 — Test Data & Mock Design

```
I need to create Test Data and Mockito configuration for Cart module.

Mock Requirements:
- CartRepository
- CartItemRepository

Test Data Requirements:
- Valid data for success cases
- Invalid data for error cases
- Boundary quantity values
- Full-cart cases for integration tests

Expected Deliverables:
- TestDataFactory utilities
- Mock configuration setup
- Test scenario mapping using:
  * CartServiceTest.java
  * CartServiceTestExpanded.java
  * CartServiceTestGrouped.java
```

---

## 🧪 PHASE 2 — UNIT TEST IMPLEMENTATION

### ✅ Prompt 2.1 — Unit Tests for CartService.java

```
Write comprehensive unit tests for CartService.java using:
- Given / When / Then pattern
- @DisplayName annotations
- Mockito for mocking

Methods to test:
• addToCart
• removeFromCart
• updateQuantity
• clearCart
• isCartEmpty
• getCartItemCount
• calculateTotal
• getOrCreateCart

Expected outputs:
- Full implementation inside CartServiceTest.java
- Expanded and grouped versions inside:
  * CartServiceTestExpanded.java
  * CartServiceTestGrouped.java
- Coverage > 90%
```

---

## 🌐 PHASE 3 — INTEGRATION TESTING

### ✅ Prompt 3.1 — Integration Tests for CartController.java

```
Create integration tests using MockMvc for:

GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/update-quantity
DELETE /api/cart/remove/{productId}
DELETE /api/cart/clear

Requirements:
- H2 real DB state validation
- JWT Authentication
- Error responses: 400, 401, 403, 404, 500

Deliverables:
- Test cases implemented inside:
  * CartControllerIntegrationTest.java
  * CartControllerIntegrationTestGrouped.java
```

---

## 🔁 PHASE 4 — WORKFLOW / E2E TESTS

```
Test complete cart workflows:
Login → Add product → Update → Remove → Checkout
Test both success and recovery paths

Deliverable:
- Additional tests can be included inside integration test classes
```

---

## 🚑 PHASE 5 — DEBUG & PERFORMANCE

### ✅ Debug Failures

```
Analyze failed tests for Cart module:
- Fix bidirectional Cart–CartItem errors
- Resolve DataIntegrityViolationException
- Fix orphan removal for cart items
```

### ✅ Performance Optimization

```
Goal: Reduce test runtime to < 15 seconds for 45 test cases
- Reuse TestDataFactory
- Reduce DB wipes in @BeforeEach
```

---

## 📊 PHASE 6 — COVERAGE IMPROVEMENT

### ✅ Prompt — Coverage Analysis

```
Analyze JaCoCo report:
target/site/jacoco/index.html

Identify untested flows in:
- CartService edge handling
- Controller authentication error handling
```

### ✅ Deliverables

✔ Coverage dashboard
✔ Improvement plan document
✔ Additional tests in grouped files

---

# ✅ Final Deliverables From Prompts

| Deliverable       | Location                                         |
| ----------------- | ------------------------------------------------ |
| Unit tests        | CartServiceTest.java (and variations)            |
| Integration tests | CartControllerIntegrationTest.java (and grouped) |
| Coverage report   | JaCoCo HTML Reports                              |
| Documentation     | Cart Testing Documentation                       |

---
