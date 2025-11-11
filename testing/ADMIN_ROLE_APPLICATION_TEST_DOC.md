# Test Documentation: Admin Role Application Approval

This document contains 5 sections as required: Test Plan; NUnit & JUnit; Test tools (Selenium, Katalon, Jira); Test case design with Decision Table testing; Use Case testing techniques. Complete with examples and execution instructions.

---

## 1. Test Plan

### Objectives
- Verify role application submission functionality (seller/shipper) works correctly.
- Verify admin can view, approve, and reject role applications.
- Verify automatic shop creation when approving seller applications.

### Scope
- Backend service endpoints related to role applications.
- Frontend UI (admin dashboard, application submission modal/flow).
- Database: changes to role_applications, users, shops tables.

### Test Environment
- Backend: localhost:8080 (Spring Boot)
- Frontend: localhost:3000 (React)
- Database: SQL Server test instance (schema matching production or in-memory db for unit/integration tests)
- Browser: Chrome (current version)

### Entry Criteria
- Code builds successfully (maven build green).
- Backend and frontend can run locally.
- Test data seeded for all scenarios (admin user, normal user, pending applications...).

### Exit Criteria
- All test cases in Test Plan pass.
- No critical/major defects open.
- Code coverage target achieved (e.g., >= 80% with JaCoCo for service layer).

### Risks & Dependencies
- Database schema changes may break tests.
- UI changes (selectors) will break Selenium tests.
- Chrome version / driver mismatch.

### Schedule & Responsibilities
- Unit tests: developer (in CI) — JUnit + Mockito
- UI tests: QA engineer — Selenium/Katalon
- Test management & tracking: QA lead — Jira

### Reporting Metrics
- Total tests, pass/fail count
- Average test suite execution time
- Defects classified by severity

---

## 2. NUnit & JUnit

### Overview
- **NUnit**: Testing framework for .NET (C#). Use NUnit if your project is .NET-based.
- **JUnit**: Testing framework for Java. Current project uses Spring Boot (Java) → use **JUnit 5 (Jupiter)**.

### When to Use Which
- Java/Spring projects: JUnit 5 + Mockito for unit testing.
- .NET projects: NUnit (or xUnit) + Moq.

### JUnit 5 Example (already in repo):
```java
@ExtendWith(MockitoExtension.class)
public class RoleApplicationServiceTest {
  @Mock RoleApplicationRepository repo;
  @InjectMocks RoleApplicationService service;

  @Test
  void testSubmitValidSellerApplication() {
    // arrange
    when(repo.save(any())).thenAnswer(i -> i.getArgument(0));
    // act
    RoleApplication app = service.createApplication(1, "seller", "reason", "Shop", "Addr", "Desc");
    // assert
    assertEquals("seller", app.getRequestedRole());
  }
}
```

### NUnit Example (reference for .NET migration):
```csharp
[TestFixture]
public class RoleApplicationServiceTests {
  [Test]
  public void SubmitValidSellerApplication() {
    // arrange, act, assert
  }
}
```

### Best Practices
- Unit tests should mock I/O (database, network).
- Write small, independent, fast-running tests.
- Separate integration/E2E tests from unit tests.

---

## 3. Test Tools: Selenium, Katalon, Jira

### Selenium
- **Purpose**: UI automation, end-to-end tests using WebDriver.
- **Pros**: Flexible code (Java/Python/JS), easy CI integration.
- **Cons**: Requires selector maintenance when UI changes, driver/Chrome dependencies.
- **Usage in current repo**: `AdminApprovalSeleniumTest.java` uses WebDriverManager for automatic chromedriver management.

### Quick Selenium Setup (Maven):
```xml
<dependency>
  <groupId>org.seleniumhq.selenium</groupId>
  <artifactId>selenium-java</artifactId>
  <version>4.15.0</version>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>io.github.bonigarcia</groupId>
  <artifactId>webdrivermanager</artifactId>
  <version>5.6.2</version>
  <scope>test</scope>
</dependency>
```

### Katalon
- GUI-based test automation platform for UI/API/mobile.
- **Pros**: Low code, rich GUI, suitable for non-developer QA.
- **Cons**: License costs (free + enterprise tiers), less flexible than code-based approaches.

### Jira (with Xray/Test Management)
- Jira is used for test case management, defects, and test planning.
- Integrate with plugins like Xray/Zephyr to manage test cases and link with CI.
- **Workflow**: Create Test Issues for each test case, link to Test Plan/Epic, track execution results.

### Tool Selection
- If dev team is strong in Java and wants CI integration: choose Selenium (code-based).
- If QA prefers quick no-code approach: try Katalon.
- Regardless of automation tool, use Jira to track test cases/defects.

---

## 4. Design Test Cases with Decision Table Testing

### Description
- Decision tables help separate conditions and actions, generating test cases for each valid combination.
- Focus: submit application → admin approve/reject.

### Key Conditions
1. RequestedRole = {seller, shipper}
2. HasShopInfo = {yes, no}
3. UserAlreadyHasRole = {yes, no}
4. ExistingPendingApplication = {yes, no}
5. ApplicationStatus = {pending, approved, rejected}

### Expected Actions
- CreateApplication = {success, fail with message}
- AdminApprove = {change user role, create shop if seller}
- AdminReject = {status→rejected, adminNote saved}

### Decision Table (simplified) — DT-01: Submission Rules
| Rule | RequestedRole | HasShopInfo | UserAlreadyHasRole | ExistingPending | Expected Result |
|------|---------------|-------------|--------------------|-----------------|--------------------|
| R1   | seller        | yes         | no                 | no              | success (pending)  |
| R2   | seller        | no          | no                 | no              | fail (shop required)|
| R3   | shipper       | n/a         | no                 | no              | success (pending)  |
| R4   | seller        | yes         | yes                | no              | fail (already role)|
| R5   | seller        | yes         | no                 | yes             | fail (duplicate pending)|

### Decision Table — DT-02: Admin Approve
| Rule | ApplicationStatus | RequestedRole | ExpectedPostAction |
|------|-------------------|---------------|--------------------|
| A1   | pending           | seller        | user.role=seller; shop created |
| A2   | pending           | shipper       | user.role=shipper; no shop |
| A3   | approved          | seller        | fail (cannot approve non-pending)|

*(Expand for reject/authorization rules as needed)*

### Test Case Generation
From the tables above, generate specific test cases (e.g., R1→TC-DT-001, ... A1→TC-DT-007, etc.).

---

## 5. Use Case Testing Techniques

### Objective
- Write test cases following each Use Case (UC) describing user and expected system actions.
- Each UC includes test steps, test data, expected results, preconditions.

### Use Cases for Role Application Feature:

#### UC1: Submit Seller Application
- **Actor**: Registered User
- **Preconditions**: User does not have role=seller; no pending seller application
- **Main Flow**:
  1. User logs in
  2. User navigates to "Register as Seller" page or modal
  3. User fills shop name, address, description
  4. User submits
  5. System validates inputs → creates role_application record with status=pending
- **Postconditions**: role_application created with status pending
- **Test Cases Derived**:
  - TC-UC1-01: All fields valid → PASS
  - TC-UC1-02: Missing shop name → FAIL (validation)
  - TC-UC1-03: User already has seller role → FAIL

#### UC2: Submit Shipper Application
- Similar structure (no shop info required)
- **Test Cases**: TC-UC2-01: Valid shipper application → PASS

#### UC3: Admin View Pending Applications
- **Actor**: Admin
- **Preconditions**: Admin logged in
- **Flow**: Admin → Admin Dashboard → Role Applications list → filter/search → open application details
- **Test Cases**:
  - TC-UC3-01: Pending list shows only pending applications
  - TC-UC3-02: Filter by role/region works correctly

#### UC4: Admin Approve Application
- **Actor**: Admin
- **Preconditions**: application.status = pending
- **Flow**:
  1. Admin clicks Approve
  2. Enters admin note
  3. Confirms
  4. System updates application.status=approved, reviewedBy=adminId, adminNote saved
  5. If requestedRole=seller → creates shop record for user
- **Test Cases**:
  - TC-UC4-01: Approve seller → user.role updated & shop created
  - TC-UC4-02: Approve shipper → user.role updated, no shop
  - TC-UC4-03: Approve non-pending → should fail

#### UC5: Admin Reject Application
- **Actor**: Admin
- **Preconditions**: application.status = pending
- **Flow**: Admin clicks Reject → enters reason → confirms → application.status=rejected, adminNote saved
- **Test Cases**:
  - TC-UC5-01: Reject with reason → PASS
  - TC-UC5-02: Reject without reason → validation error

#### UC6: User Views Application Status/History
- **Actor**: User
- **Flow**: User → Profile → My Applications → sees statuses
- **Test Cases**: TC-UC6-01: User sees correct statuses & timestamps

---

## Appendix: Test Case Template

Each test case should include:
- **Test ID**: TC-...
- **Related Use Case / Decision Table rule**
- **Title**
- **Preconditions**
- **Test Data**
- **Steps**
- **Expected Result**
- **Postconditions**
- **Notes**

### Example: TC-UC4-01 (Approve Seller Application)
- **Test ID**: TC-UC4-01
- **Preconditions**: application.id=100, status=pending, requestedRole=seller, shopName present
- **Steps**:
  1. Login as admin
  2. Navigate to /admin/role-applications
  3. Find application id=100
  4. Click Approve, enter note "OK", confirm
- **Expected Result**:
  - HTTP: GET /api/role-applications/100 returns status approved
  - DB: users.id=... role updated to 'seller'
  - DB: shop record created with sellerId=userId

---

## Quick Test Execution Guide

### 1. Run Unit Tests (JUnit):
```powershell
cd Foodsell/demo
mvn test -Dtest=RoleApplicationServiceTest
```

### 2. Run Selenium UI Tests (requires backend + frontend running):
```powershell
# Terminal 1 - Start backend
cd Foodsell/demo
mvn spring-boot:run

# Terminal 2 - Start frontend
cd Foodsell/foodsystem
npm start

# Terminal 3 - Run Selenium tests
cd Foodsell/demo
mvn test -Dtest=AdminApprovalSeleniumTest
```

---

## Final Notes

- If the UI uses a modal (as in current project), Selenium tests need to open the home page and trigger the login modal instead of accessing `/login` directly.
- Use Jira/Xray to map test cases → Test Plan → Test Execution for convenient reporting.
- Consider automating test case creation in Jira using REST API if you have many test cases.

---

**Document saved at**: `testing/ADMIN_ROLE_APPLICATION_TEST_DOC.md`

**Next Steps** (optional):
- Export this document to PDF
- Add Traceability Matrix (test cases → requirement IDs)
- Create Test Issues automatically in Jira (requires API credentials)

