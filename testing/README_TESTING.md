# 📚 COMPLETE TEST SUITE - ADMIN ROLE APPLICATION APPROVAL

## 🎯 OVERVIEW

Đây là bộ test case hoàn chỉnh cho chức năng **Admin Duyệt Đơn Xin Vai Trò** trong hệ thống Foodiez.

### 📂 Files Created:

1. **TEST_PLAN_ADMIN_APPROVALS_FULL.md** - Kế hoạch kiểm thử chi tiết
2. **DECISION_TABLES_FULL.md** - Bảng quyết định (Decision Tables)
3. **TEST_CASES_FULL.md** - Test cases chi tiết (Use Case Testing)
4. **RoleApplicationServiceTest.java** - JUnit tests
5. **AdminApprovalSeleniumTest.java** - Selenium UI tests
6. **README_TESTING.md** - File này

---

## 🎓 PRESENTATION STRUCTURE (8 minutes per member)

### **Member 1: Test Plan & JUnit Testing**

#### Timeline (8 minutes):
- **Introduction** (1 min)
  - Overview of test plan document
  - Test scope and objectives
  - Technology stack
  
- **Test Strategy** (2 min)
  - Testing levels: Unit, Integration, System
  - Testing techniques: Decision table, Use case, Boundary value
  - Coverage targets: 80%+ code coverage
  
- **JUnit Demo** (4 min)
  - Show RoleApplicationServiceTest.java
  - Demo 2-3 key test cases:
    - TC-UNIT-001: Submit valid seller application
    - TC-UNIT-007: Admin approve seller (creates shop)
    - TC-UNIT-012: Admin reject application
  - Show test execution and results
  - Show code coverage report
  
- **Q&A** (1 min)

#### Key Files:
- `TEST_PLAN_ADMIN_APPROVALS_FULL.md`
- `RoleApplicationServiceTest.java`

---

### **Member 2: Decision Table Testing**

#### Timeline (8 minutes):
- **Introduction** (1 min)
  - What is Decision Table Testing?
  - Why use it for this project?
  - Benefits: Complete coverage, systematic approach
  
- **DT1: Application Submission** (2 min)
  - Show the decision table
  - Explain conditions (C1-C6)
  - Explain actions (A1-A5)
  - Walk through 2-3 rules
  - Show generated test cases
  
- **DT2 & DT3: Approve/Reject** (3 min)
  - Highlight key differences between approve and reject
  - Show shop creation logic in DT2
  - Demonstrate authorization checks
  - Show traceability matrix
  
- **Coverage Results** (1 min)
  - 31 test cases generated
  - 100% coverage of all conditions
  - Priority distribution
  
- **Q&A** (1 min)

#### Key Files:
- `DECISION_TABLES_FULL.md`

#### Demo Tips:
- Use a large monitor/projector
- Highlight cells as you explain
- Use colors to show pass/fail

---

### **Member 3: Use Case Testing**

#### Timeline (8 minutes):
- **Introduction** (1 min)
  - What is Use Case Testing?
  - Real-world scenarios approach
  - 6 main use cases identified
  
- **UC3 Deep Dive** (3 min)
  - Show UC3: Admin Approve Seller Application
  - Walk through main flow (10 steps)
  - Show TC-UC3-001 in detail:
    - Prerequisites
    - Test steps
    - Test data (JSON)
    - Expected results
    - Verification queries
  
- **Other Use Cases** (2 min)
  - Quick overview of UC1, UC2, UC4, UC5, UC6
  - Show boundary value tests
  - Show negative test cases (SQL injection, XSS)
  
- **Test Execution Report** (1 min)
  - 42 total test cases
  - Priority distribution
  - Defects found (if any)
  
- **Q&A** (1 min)

#### Key Files:
- `TEST_CASES_FULL.md`

#### Demo Tips:
- Have Postman ready to show API calls
- Prepare SQL queries to run live
- Show actual database results

---

### **Member 4: Selenium UI Automation**

#### Timeline (8 minutes):
- **Introduction** (1 min)
  - What is Selenium WebDriver?
  - Why automate UI testing?
  - Tools used: Chrome, Java, JUnit
  
- **Setup & Architecture** (1.5 min)
  - Show Selenium dependencies
  - Explain Page Object Model (briefly)
  - Show ChromeDriver configuration
  
- **Live Demo** (4 min)
  - **TC-SEL-001**: Admin login
    - Show code
    - Run test (open browser, login, verify dashboard)
  
  - **TC-SEL-003**: Approve seller application
    - Navigate to applications page
    - Click approve button
    - Fill modal form
    - Verify success message
  
  - **TC-SEL-005**: Reject application
    - Click reject button
    - Enter rejection reason
    - Verify application removed from pending
  
- **Results & Benefits** (0.5 min)
  - 8 UI test scenarios automated
  - Regression testing made easy
  - Screenshot capture on failure
  
- **Q&A** (1 min)

#### Key Files:
- `AdminApprovalSeleniumTest.java`

#### Demo Tips:
- **Disable headless mode** for live demo
- Pre-seed test data in database
- Have backup video recording if demo fails
- Show screenshots folder

---

## 🛠️ SETUP INSTRUCTIONS

### Prerequisites:
```bash
# 1. Java 17
java -version

# 2. Maven
mvn -version

# 3. Node.js for frontend
node -version

# 4. SQL Server running
# 5. ChromeDriver in PATH
chromedriver --version
```

### Database Setup:
```sql
-- Run these scripts first:
-- 1. database.sql (main schema)
-- 2. Insert test users
INSERT INTO users (email, password_hash, role, full_name) 
VALUES 
('admin@test.com', '$2a$10$...', 'admin', 'Test Admin'),
('customer1@test.com', '$2a$10$...', 'buyer', 'Test Customer 1'),
('customer2@test.com', '$2a$10$...', 'buyer', 'Test Customer 2');

-- 3. Insert pending applications
INSERT INTO role_applications (user_id, requested_role, status, reason, shop_name, shop_address)
VALUES 
(2, 'seller', 'pending', 'I want to sell food', 'Test Shop', '123 Test St'),
(3, 'shipper', 'pending', 'I want to deliver orders', NULL, NULL);
```

### Backend Setup:
```bash
cd Foodsell/demo

# Install dependencies
mvn clean install

# Run application
mvn spring-boot:run

# Backend will run on http://localhost:8080
```

### Frontend Setup:
```bash
cd Foodsell/foodsystem

# Install dependencies
npm install

# Run dev server
npm start

# Frontend will run on http://localhost:3000
```

### Run JUnit Tests:
```bash
cd Foodsell/demo

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=RoleApplicationServiceTest

# Generate coverage report
mvn jacoco:report
# Report at: target/site/jacoco/index.html
```

### Run Selenium Tests:
```bash
# Make sure backend and frontend are running

# Run Selenium tests
mvn test -Dtest=AdminApprovalSeleniumTest

# For headless mode, edit test file and uncomment:
# options.addArguments("--headless");
```

---

## 📊 TEST COVERAGE SUMMARY

| Category | Test Cases | Files |
|----------|------------|-------|
| **Test Plan** | 80 (planned) | TEST_PLAN_ADMIN_APPROVALS_FULL.md |
| **Decision Tables** | 31 | DECISION_TABLES_FULL.md |
| **Use Case Tests** | 42 | TEST_CASES_FULL.md |
| **JUnit Tests** | 19 | RoleApplicationServiceTest.java |
| **Selenium Tests** | 8 | AdminApprovalSeleniumTest.java |
| **Total** | **100+** | - |

---

## ✅ TEST EXECUTION CHECKLIST

### Before Presentation:

- [ ] All 4 members have practiced their parts
- [ ] Database seeded with test data
- [ ] Backend running successfully
- [ ] Frontend running successfully
- [ ] JUnit tests passing (run `mvn test`)
- [ ] Selenium tests working (test once before demo)
- [ ] ChromeDriver installed and in PATH
- [ ] Backup slides/video prepared
- [ ] Laptops charged
- [ ] HDMI cable/adapters ready

### During Presentation:

#### Member 1:
- [ ] Open TEST_PLAN document
- [ ] Open RoleApplicationServiceTest.java in IDE
- [ ] Run tests and show results
- [ ] Show code coverage report

#### Member 2:
- [ ] Open DECISION_TABLES document
- [ ] Use large font for visibility
- [ ] Highlight tables as you explain
- [ ] Show traceability matrix

#### Member 3:
- [ ] Open TEST_CASES document
- [ ] Have Postman collection ready
- [ ] Have database client ready (SSMS/DBeaver)
- [ ] Prepare to run SQL queries

#### Member 4:
- [ ] Backend and frontend running
- [ ] Selenium test file open in IDE
- [ ] Chrome browser visible (not headless)
- [ ] Run 2-3 tests live
- [ ] Show screenshots folder

---

## 🎯 KEY POINTS TO EMPHASIZE

### Technical Skills Demonstrated:

1. **Testing Techniques**:
   - ✅ Decision Table Testing
   - ✅ Use Case Testing
   - ✅ Boundary Value Analysis
   - ✅ Equivalence Partitioning
   - ✅ Negative Testing

2. **Tools Used**:
   - ✅ JUnit 5 (Unit Testing)
   - ✅ Mockito (Mocking)
   - ✅ Selenium WebDriver (UI Automation)
   - ✅ Postman (API Testing)
   - ✅ Maven (Build & Test Execution)

3. **Coverage**:
   - ✅ 80%+ code coverage
   - ✅ 100% decision table coverage
   - ✅ All use cases covered
   - ✅ Security testing (authorization, injection)

4. **Documentation**:
   - ✅ Professional test plan
   - ✅ Detailed test cases
   - ✅ Traceability matrix
   - ✅ Clear test data

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: ChromeDriver not found
```bash
# Solution: Download ChromeDriver
# https://chromedriver.chromium.org/
# Add to PATH or specify location in code
```

### Issue 2: Tests fail with 401 Unauthorized
```bash
# Solution: Check JWT token generation
# Verify admin user exists in database
# Check token expiration time
```

### Issue 3: Database connection error
```bash
# Solution: Verify SQL Server running
# Check application.properties connection string
# Verify database name and credentials
```

### Issue 4: Frontend not loading
```bash
# Solution:
npm install
npm start
# Check port 3000 is not in use
```

### Issue 5: Maven build fails
```bash
# Solution:
mvn clean
mvn install -DskipTests
mvn test
```

---

## 📝 QUESTIONS YOU MIGHT BE ASKED

### Q1: Why use Decision Table Testing?
**Answer**: Decision tables help us systematically test all combinations of inputs and conditions. For role applications, we have multiple variables (role type, user status, authentication, shop info). Decision tables ensure we don't miss any scenario and provide 100% coverage.

### Q2: What's the difference between JUnit and Selenium?
**Answer**: 
- **JUnit**: Tests backend logic (service layer, business rules) without UI. Fast, isolated tests.
- **Selenium**: Tests the complete user interface flow in a real browser. Slower but tests end-to-end user experience.

### Q3: How do you handle test data?
**Answer**: We use:
1. SQL scripts to seed test data before tests
2. `@BeforeEach` to create fresh test objects
3. Mocking (Mockito) to isolate unit tests
4. Transaction rollback to keep database clean

### Q4: What if a test fails during demo?
**Answer**: We have:
1. Backup video recording
2. Screenshots of successful test runs
3. Pre-run tests before presentation
4. Clear error messages and debugging logs

### Q5: How do you measure test coverage?
**Answer**: We use:
- JaCoCo Maven plugin for code coverage
- Manual tracking for decision table coverage (31/31 = 100%)
- Test case execution report (passed/failed/blocked)
- Target: 80%+ code coverage, 95%+ test pass rate

### Q6: Why test security (SQL injection, XSS)?
**Answer**: Security is critical in web applications. We test:
- SQL injection to ensure parameterized queries
- XSS to ensure output encoding
- Authorization to prevent privilege escalation
These are in our negative test cases (TC-NEG-001, TC-NEG-002).

---

## 🎬 FINAL CHECKLIST

### 1 Day Before Presentation:
- [ ] Practice full run-through (32 minutes total)
- [ ] Test all demos work
- [ ] Prepare backup materials
- [ ] Charge devices

### 1 Hour Before:
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Run all tests once to verify
- [ ] Open all required files
- [ ] Test projector connection

### During Presentation:
- [ ] Speak clearly and slowly
- [ ] Point to screen when explaining
- [ ] Keep within time limits (8 min each)
- [ ] Handle Q&A professionally
- [ ] Stay calm if something fails

---

## 🏆 SUCCESS CRITERIA

### You did GREAT if:
- ✅ All members present within time limit
- ✅ Test plan is clear and comprehensive
- ✅ Decision tables are well-explained
- ✅ Use cases cover real scenarios
- ✅ Live demos work smoothly
- ✅ Questions answered confidently
- ✅ Documentation is professional
- ✅ Code is clean and well-commented

---

## 📞 SUPPORT

If you have questions while preparing:
1. Review all markdown files carefully
2. Run tests multiple times to familiarize
3. Practice explaining out loud
4. Time yourself (8 minutes)
5. Get feedback from teammates

---

## 🎉 GOOD LUCK!

Remember:
- **Confidence** is key
- **Practice** makes perfect
- **Teamwork** wins
- **Professional** attitude
- **Clear** communication

You've got this! 💪

---

**END OF README**
