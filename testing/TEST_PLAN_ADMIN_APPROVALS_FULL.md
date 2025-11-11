# 📋 TEST PLAN - ADMIN ROLE APPLICATION APPROVAL SYSTEM

## 📊 DOCUMENT INFORMATION

| **Field** | **Details** |
|-----------|-------------|
| **Project Name** | Foodiez - Food Delivery Platform |
| **Module** | Admin Role Application Approval System |
| **Version** | 1.0 |
| **Date** | November 7, 2025 |
| **Prepared By** | [Your Team Name] |
| **Test Type** | Functional Testing, Integration Testing, Unit Testing |
| **Test Level** | System Testing |
| **Testing Tools** | JUnit 5, Selenium WebDriver, Postman |
| **Test Duration** | 8 minutes presentation per member |

---

## 🎯 1. INTRODUCTION

### 1.1 Purpose
This test plan describes the comprehensive testing strategy, scope, resources, and schedule for testing the Admin Role Application Approval functionality in the Foodiez system. The system allows users to apply for Seller or Shipper roles, and Admins can approve or reject these applications.

### 1.2 Project Overview
**Foodiez** is a food delivery platform with multiple user roles:
- **Buyer/Customer**: Order food, browse products
- **Seller**: Manage shop, add products (requires approval)
- **Shipper**: Deliver orders (requires approval)
- **Admin**: Manage users, approve applications, moderate content

### 1.3 Scope

**In Scope:**
- ✅ User role application submission (Seller/Shipper)
- ✅ Admin viewing pending/all applications
- ✅ Admin approving applications (with auto role update)
- ✅ Admin rejecting applications (with reason)
- ✅ User role update after approval
- ✅ Shop creation for approved Seller applications
- ✅ Authentication and authorization
- ✅ Input validation and error handling
- ✅ Database operations and integrity
- ✅ REST API endpoints testing
- ✅ Frontend UI testing with Selenium

**Out of Scope:**
- ❌ User registration and login flows
- ❌ Product management after approval
- ❌ Order processing workflows
- ❌ Payment integration
- ❌ Performance and load testing

---

## 🏗️ 2. SYSTEM ARCHITECTURE

### 2.1 Technology Stack
- **Backend**: Spring Boot 3.x, Java 17
- **Database**: SQL Server
- **Frontend**: React.js
- **Authentication**: JWT Token
- **Testing Tools**: JUnit 5, Mockito, Selenium WebDriver

### 2.2 Database Schema
```sql
CREATE TABLE role_applications (
    id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL,
    requested_role NVARCHAR(20) NOT NULL CHECK (requested_role IN ('seller', 'shipper')),
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reason NVARCHAR(MAX),
    admin_note NVARCHAR(MAX),
    reviewed_by INT,
    created_at DATETIME2 DEFAULT GETDATE(),
    reviewed_at DATETIME2,
    shop_name NVARCHAR(255),
    shop_address NVARCHAR(MAX),
    shop_description NVARCHAR(MAX),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

### 2.3 API Endpoints

#### User Endpoints (Authenticated)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/role-applications/apply` | Submit role application | User Token |
| GET | `/api/role-applications/my-applications` | View own applications | User Token |

#### Admin Endpoints (Admin Only)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/role-applications/pending` | Get pending applications | Admin Token |
| GET | `/api/role-applications/all` | Get all applications | Admin Token |
| POST | `/api/role-applications/{id}/approve` | Approve application | Admin Token |
| POST | `/api/role-applications/{id}/reject` | Reject application | Admin Token |

---

## 🧪 3. TEST STRATEGY

### 3.1 Testing Levels

#### 3.1.1 Unit Testing (JUnit 5)
- **Service Layer**: Test business logic in `RoleApplicationService`
- **Controller Layer**: Test request/response handling
- **Repository Layer**: Test database queries
- **Coverage Target**: 80% code coverage

#### 3.1.2 Integration Testing
- **API Integration**: Test complete request flow
- **Database Integration**: Test data persistence
- **Authentication Integration**: Test JWT token validation

#### 3.1.3 System Testing
- **Functional Testing**: Test end-to-end workflows
- **UI Testing**: Test with Selenium WebDriver
- **Decision Table Testing**: Test all condition combinations

### 3.2 Testing Techniques

#### 3.2.1 Decision Table Testing
Test all combinations of inputs and conditions:
- User role (buyer/seller/shipper/admin)
- Application status (pending/approved/rejected)
- Required fields present/missing
- Authentication valid/invalid

#### 3.2.2 Use Case Testing
Test realistic user scenarios:
- UC1: Customer applies for Seller role
- UC2: Admin approves Seller application (creates shop)
- UC3: Admin rejects application with reason
- UC4: Customer applies for Shipper role
- UC5: View application history

#### 3.2.3 Boundary Value Analysis
- Test field length limits (shop_name: 255 chars)
- Test database constraints
- Test null/empty values

#### 3.2.4 Equivalence Partitioning
- Valid roles: seller, shipper
- Invalid roles: admin, buyer, random
- Valid statuses: pending, approved, rejected

---

## 📋 4. TEST CASES OVERVIEW

### 4.1 Test Case Categories

| Category | # of Test Cases | Priority |
|----------|----------------|----------|
| **Application Submission** | 12 | High |
| **Admin Approval Flow** | 15 | High |
| **Admin Rejection Flow** | 10 | High |
| **Authorization Checks** | 8 | Critical |
| **Input Validation** | 14 | High |
| **Database Operations** | 6 | Medium |
| **Shop Creation** | 5 | High |
| **UI Testing** | 10 | Medium |
| **Total** | **80** | - |

### 4.2 Test Case Distribution by Technique

| Technique | Test Cases | File Reference |
|-----------|------------|----------------|
| **Decision Table Testing** | 32 | DECISION_TABLES_ADMIN_APPROVALS.md |
| **Use Case Testing** | 28 | TEST_CASES_USE_CASES_ADMIN.md |
| **Boundary Value** | 12 | TEST_CASES_USE_CASES_ADMIN.md |
| **Exploratory** | 8 | Manual testing notes |

---

## 🛠️ 5. TEST TOOLS & ENVIRONMENT

### 5.1 Testing Tools

#### 5.1.1 JUnit 5 (Backend Unit Tests)
```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>5.10.0</version>
    <scope>test</scope>
</dependency>
```

**Usage**: Test service methods, repository queries, controller endpoints

#### 5.1.2 Selenium WebDriver (UI Automation)
```xml
<dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-java</artifactId>
    <version>4.15.0</version>
</dependency>
```

**Usage**: Automate browser testing for admin approval workflows

#### 5.1.3 Postman (API Testing)
- Manual API testing
- Collection of all endpoints
- Environment variables for tokens

#### 5.1.4 Mockito (Mocking Framework)
```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.6.0</version>
</dependency>
```

### 5.2 Test Environment

| Component | Configuration |
|-----------|---------------|
| **Database** | SQL Server 2019+ (Test Database) |
| **Backend** | Spring Boot running on localhost:8080 |
| **Frontend** | React dev server on localhost:3000 |
| **Browser** | Chrome 120+ for Selenium tests |
| **Java Version** | JDK 17 |

### 5.3 Test Data Setup

#### 5.3.1 Pre-requisite Users
```sql
-- Admin user
INSERT INTO users (email, password_hash, role, full_name) 
VALUES ('admin@test.com', '$2a$10$...', 'admin', 'Test Admin');

-- Customer users for testing
INSERT INTO users (email, password_hash, role, full_name) 
VALUES ('customer1@test.com', '$2a$10$...', 'buyer', 'Customer One');

INSERT INTO users (email, password_hash, role, full_name) 
VALUES ('customer2@test.com', '$2a$10$...', 'buyer', 'Customer Two');
```

#### 5.3.2 Sample Applications
```sql
-- Pending seller application
INSERT INTO role_applications (user_id, requested_role, status, reason, shop_name, shop_address)
VALUES (2, 'seller', 'pending', 'I want to sell food', 'Test Shop', '123 Test Street');

-- Pending shipper application
INSERT INTO role_applications (user_id, requested_role, status, reason)
VALUES (3, 'shipper', 'pending', 'I want to deliver orders');
```

---

## 📊 6. TEST EXECUTION PLAN

### 6.1 Test Phases

#### Phase 1: Unit Testing (Days 1-2)
- ✅ Write JUnit tests for Service layer
- ✅ Write JUnit tests for Controller layer
- ✅ Achieve 80%+ code coverage
- ✅ Fix all failing tests

#### Phase 2: Integration Testing (Days 3-4)
- ✅ Test API endpoints with Postman
- ✅ Test database operations
- ✅ Test authentication flows
- ✅ Document API test results

#### Phase 3: System Testing (Days 5-6)
- ✅ Execute decision table test cases
- ✅ Execute use case test cases
- ✅ Perform boundary value testing
- ✅ Log defects in tracking system

#### Phase 4: UI Automation (Days 7-8)
- ✅ Write Selenium test scripts
- ✅ Execute automated UI tests
- ✅ Capture screenshots for failures
- ✅ Generate test report

### 6.2 Test Schedule

| Week | Activity | Deliverable |
|------|----------|-------------|
| Week 1 | Unit tests + Integration tests | JUnit test reports |
| Week 2 | System testing + Decision tables | Test case execution report |
| Week 3 | UI automation + Regression | Selenium test report |
| Week 4 | Bug fixes + Retesting | Final test summary |

---

## ✅ 7. TEST DELIVERABLES

### 7.1 Documentation
- ✅ Test Plan (this document)
- ✅ Decision Tables (DECISION_TABLES_ADMIN_APPROVALS.md)
- ✅ Test Cases (TEST_CASES_USE_CASES_ADMIN.md)
- ✅ JUnit Test Code (RoleApplicationServiceTest.java)
- ✅ Selenium Test Scripts (AdminApprovalSeleniumTest.java)
- ✅ Test Execution Report
- ✅ Defect Report

### 7.2 Code Artifacts
- JUnit test classes
- Selenium test scripts
- Test data setup scripts
- Postman collection JSON

---

## 🎯 8. ENTRY & EXIT CRITERIA

### 8.1 Entry Criteria
- ✅ Backend code development completed
- ✅ Database schema created and populated
- ✅ Test environment setup completed
- ✅ Test data prepared
- ✅ Access credentials available

### 8.2 Exit Criteria
- ✅ All high-priority test cases executed
- ✅ 95%+ test cases passed
- ✅ All critical defects fixed
- ✅ Code coverage ≥ 80%
- ✅ Test reports reviewed and approved

---

## 🐛 9. DEFECT MANAGEMENT

### 9.1 Defect Severity Levels

| Severity | Description | Example |
|----------|-------------|---------|
| **Critical** | System crash, data loss | Application crashes on approve |
| **High** | Major feature broken | Non-admin can approve applications |
| **Medium** | Minor feature issue | Error message not shown |
| **Low** | Cosmetic issues | Button alignment issue |

### 9.2 Defect Lifecycle
1. **New** → Defect discovered during testing
2. **Assigned** → Assigned to developer
3. **Fixed** → Developer fixed the issue
4. **Retesting** → QA validates the fix
5. **Closed** → Fix verified and accepted

---

## 👥 10. TEAM & RESPONSIBILITIES

### 10.1 Test Team

| Role | Responsibility | Time |
|------|----------------|------|
| **Test Lead** | Plan, coordinate, report | Full time |
| **QA Engineer 1** | Unit testing, JUnit | 8 min presentation |
| **QA Engineer 2** | Decision table testing | 8 min presentation |
| **QA Engineer 3** | Use case testing | 8 min presentation |
| **QA Engineer 4** | UI automation (Selenium) | 8 min presentation |

### 10.2 Presentation Topics (8 minutes each)

#### Member 1: Test Plan & Unit Testing
- Overview of test plan
- JUnit setup and configuration
- Unit test examples for Service layer
- Code coverage report

#### Member 2: Decision Table Testing
- Explanation of decision table technique
- Decision tables for role approval system
- Test case generation from tables
- Execution results

#### Member 3: Use Case Testing
- Use case testing methodology
- Detailed test cases for each use case
- Test data and expected results
- Defects found and fixed

#### Member 4: Test Automation (Selenium)
- Selenium WebDriver setup
- Page Object Model implementation
- Automated test scenarios demo
- Test execution and reporting

---

## 📈 11. RISK ANALYSIS

### 11.1 Testing Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Test environment unstable | High | Medium | Setup backup environment |
| Database connection issues | High | Low | Use connection pooling |
| Insufficient test data | Medium | Medium | Create data generation script |
| Tool license unavailable | Low | Low | Use open-source alternatives |
| Time constraint | High | Medium | Prioritize critical test cases |

---

## 📞 12. COMMUNICATION PLAN

### 12.1 Status Reporting
- **Daily**: Standup meeting (15 min)
- **Weekly**: Test progress report
- **End of Phase**: Test summary report

### 12.2 Stakeholders
- Project Manager
- Development Team
- Product Owner
- QA Team

---

## 🔄 13. TEST METRICS

### 13.1 Key Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| **Test Case Pass Rate** | (Passed / Total) × 100 | ≥ 95% |
| **Defect Detection Rate** | Defects found / Test cases | Track trend |
| **Code Coverage** | Lines covered / Total lines | ≥ 80% |
| **Test Execution Progress** | Executed / Total | 100% |
| **Defect Fix Rate** | Fixed / Total defects | ≥ 90% |

---

## 📚 14. REFERENCES

### 14.1 Related Documents
- `DECISION_TABLES_ADMIN_APPROVALS.md` - Decision table testing details
- `TEST_CASES_USE_CASES_ADMIN.md` - Detailed test cases
- `IMPLEMENTATION_SUMMARY.md` - System implementation guide
- `FIX_ROLE_APPLICATIONS_GUIDE.md` - Development troubleshooting

### 14.2 Tools Documentation
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [Selenium WebDriver Docs](https://www.selenium.dev/documentation/)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)

---

## ✍️ 15. APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Test Lead** | __________ | __________ | __________ |
| **Project Manager** | __________ | __________ | __________ |
| **QA Manager** | __________ | __________ | __________ |

---

**END OF TEST PLAN**
