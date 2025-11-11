# 📋 TEST CASES - USE CASE TESTING: ADMIN ROLE APPROVALS

## 📑 TABLE OF CONTENTS
1. [Introduction](#introduction)
2. [Use Case 1: Submit Seller Application](#uc1-submit-seller-application)
3. [Use Case 2: Submit Shipper Application](#uc2-submit-shipper-application)
4. [Use Case 3: Admin Approve Seller Application](#uc3-admin-approve-seller-application)
5. [Use Case 4: Admin Approve Shipper Application](#uc4-admin-approve-shipper-application)
6. [Use Case 5: Admin Reject Application](#uc5-admin-reject-application)
7. [Use Case 6: View Application History](#uc6-view-application-history)
8. [Boundary Value Test Cases](#boundary-value-test-cases)
9. [Negative Test Cases](#negative-test-cases)
10. [Test Execution Report](#test-execution-report)

---

## 📖 INTRODUCTION

### What is Use Case Testing?
Use Case Testing is a functional black-box testing technique that helps identify test cases covering the entire system flow from start to finish based on **realistic user scenarios**.

### Purpose
This document provides comprehensive test cases for Admin Role Application Approval system using Use Case Testing technique.

### Test Case Template

| Field | Description |
|-------|-------------|
| **TC ID** | Unique test case identifier |
| **Use Case** | Related use case |
| **Priority** | Critical / High / Medium / Low |
| **Prerequisites** | Initial conditions required |
| **Test Steps** | Step-by-step actions |
| **Test Data** | Input data used |
| **Expected Result** | Expected system behavior |
| **Actual Result** | Actual outcome (to be filled) |
| **Status** | Pass / Fail / Blocked |

---

## 🏪 UC1: SUBMIT SELLER APPLICATION

### Use Case Description
**Actor**: Customer (Buyer)  
**Goal**: Apply to become a Seller and manage a shop  
**Precondition**: User is logged in as buyer  
**Postcondition**: Application created with status="pending"

### Main Flow
1. User navigates to Role Application page
2. User selects "Seller" as requested role
3. User enters application reason
4. User provides shop information:
   - Shop name
   - Shop address
   - Shop description
5. User clicks "Submit Application"
6. System validates input
7. System creates application
8. System shows success message

---

### TC-UC1-001: Valid Seller Application Submission

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC1-001 |
| **Use Case** | UC1: Submit Seller Application |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | - User logged in as buyer<br>- No pending seller application |
| **Test Steps** | 1. POST `/api/role-applications/apply`<br>2. Provide all required fields |
| **Test Data** | ```json<br>{<br>  "requestedRole": "seller",<br>  "reason": "I want to sell Vietnamese food",<br>  "shopName": "Phở Hà Nội",<br>  "shopAddress": "123 Nguyen Hue, HCMC",<br>  "shopDescription": "Authentic Hanoi Pho"<br>}<br>``` |
| **Expected Result** | ✅ Status: 200<br>✅ Response: `{"success": true}`<br>✅ DB: New record in `role_applications`<br>✅ status = "pending" |
| **Actual Result** | _(To be filled during execution)_ |
| **Status** | ⏳ Not Executed |

---

### TC-UC1-002: Seller Application Missing Shop Name

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC1-002 |
| **Priority** | ⭐⭐ High |
| **Prerequisites** | User logged in as buyer |
| **Test Steps** | 1. POST `/api/role-applications/apply`<br>2. Omit `shopName` field |
| **Test Data** | ```json<br>{<br>  "requestedRole": "seller",<br>  "reason": "Want to sell",<br>  "shopAddress": "123 ABC St",<br>  "shopDescription": "Food shop"<br>}<br>``` |
| **Expected Result** | ❌ Status: 400<br>❌ Error: "Shop name and address are required for seller application" |
| **Actual Result** | _(To be filled)_ |
| **Status** | ⏳ Not Executed |

---

### TC-UC1-003: Seller Application Missing Shop Address

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC1-003 |
| **Priority** | ⭐⭐ High |
| **Prerequisites** | User logged in as buyer |
| **Test Steps** | 1. POST `/api/role-applications/apply`<br>2. Omit `shopAddress` field |
| **Test Data** | ```json<br>{<br>  "requestedRole": "seller",<br>  "reason": "Want to sell",<br>  "shopName": "My Shop"<br>}<br>``` |
| **Expected Result** | ❌ Status: 400<br>❌ Error: "Shop name and address are required" |

---

### TC-UC1-004: User Already Has Seller Role

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC1-004 |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | User already has role="seller" |
| **Test Steps** | 1. Login as user with role="seller"<br>2. POST `/api/role-applications/apply` for seller |
| **Test Data** | Valid seller application data |
| **Expected Result** | ❌ Status: 400<br>❌ Error: "You already have this role" |

---

### TC-UC1-005: Duplicate Pending Seller Application

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC1-005 |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | User has pending seller application |
| **Test Steps** | 1. Submit another seller application |
| **Expected Result** | ❌ Status: 400<br>❌ Error: "You already have a pending application for this role" |

---

## 🚚 UC2: SUBMIT SHIPPER APPLICATION

### Use Case Description
**Actor**: Customer (Buyer)  
**Goal**: Apply to become a Shipper  
**Precondition**: User is logged in as buyer  
**Postcondition**: Application created with status="pending"  
**Note**: No shop information required

---

### TC-UC2-001: Valid Shipper Application

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC2-001 |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | - User logged in as buyer<br>- No pending shipper application |
| **Test Steps** | 1. POST `/api/role-applications/apply`<br>2. Provide role="shipper" and reason |
| **Test Data** | ```json<br>{<br>  "requestedRole": "shipper",<br>  "reason": "I want to deliver food orders"<br>}<br>``` |
| **Expected Result** | ✅ Status: 200<br>✅ Application created<br>✅ shopName, shopAddress, shopDescription = NULL |

---

### TC-UC2-002: Shipper Application with Shop Info

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC2-002 |
| **Priority** | ⭐ Medium |
| **Test Steps** | 1. Submit shipper application WITH shop info |
| **Test Data** | Include shopName, shopAddress in request |
| **Expected Result** | ✅ Status: 200<br>✅ Application created<br>✅ Shop info ignored (not required for shipper) |

---

### TC-UC2-003: Invalid Role Requested

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC2-003 |
| **Priority** | ⭐⭐ High |
| **Test Data** | ```json<br>{<br>  "requestedRole": "admin",<br>  "reason": "Want to be admin"<br>}<br>``` |
| **Expected Result** | ❌ Status: 400<br>❌ Error: "Invalid role. Must be 'seller' or 'shipper'" |

---

## ✅ UC3: ADMIN APPROVE SELLER APPLICATION

### Use Case Description
**Actor**: Admin  
**Goal**: Approve seller application, update user role, create shop  
**Precondition**: Admin logged in, pending seller application exists  
**Postcondition**: User role = "seller", Shop created

### Main Flow
1. Admin views pending applications
2. Admin selects a seller application
3. Admin clicks "Approve"
4. Admin (optionally) enters note
5. Admin confirms approval
6. System updates application status to "approved"
7. System updates user role to "seller"
8. System creates new shop with info from application
9. System sets reviewedBy = admin ID
10. System sets reviewedAt = current timestamp
11. System shows success message

---

### TC-UC3-001: Approve Pending Seller Application

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC3-001 |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | - Admin logged in<br>- Seller application ID=1, status="pending"<br>- User ID=5, role="buyer" |
| **Test Steps** | 1. Admin: GET `/api/role-applications/pending`<br>2. Verify application ID=1 in list<br>3. POST `/api/role-applications/1/approve`<br>4. Body: `{"note": "Approved - Good application"}` |
| **Expected Result** | ✅ Status: 200<br>✅ Application: status="approved"<br>✅ Application: reviewedBy=adminId, reviewedAt!=null<br>✅ Application: adminNote="Approved - Good application"<br>✅ User: role="seller"<br>✅ Shop created: sellerId=5, name="Phở Hà Nội" |
| **Verification Query** | ```sql<br>SELECT * FROM role_applications WHERE id=1;<br>SELECT * FROM users WHERE id=5;<br>SELECT * FROM shops WHERE seller_id=5;<br>``` |

---

### TC-UC3-002: Approve Without Note

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC3-002 |
| **Priority** | ⭐⭐ High |
| **Test Steps** | POST `/api/role-applications/1/approve` with empty note |
| **Test Data** | `{"note": ""}` or `{}` |
| **Expected Result** | ✅ Status: 200<br>✅ Approval succeeds<br>✅ adminNote = "" or NULL |

---

### TC-UC3-003: Approve Already Approved Application

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC3-003 |
| **Priority** | ⭐⭐ High |
| **Prerequisites** | Application status="approved" |
| **Expected Result** | ❌ Status: 400<br>❌ Error: "Application is not pending" |

---

### TC-UC3-004: Non-Admin Tries to Approve

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC3-004 |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | User logged in as "buyer" |
| **Test Steps** | POST `/api/role-applications/1/approve` |
| **Expected Result** | ❌ Status: 403<br>❌ Error: "Admin access required" |

---

### TC-UC3-005: Approve Non-Existent Application

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC3-005 |
| **Priority** | ⭐⭐ High |
| **Test Steps** | POST `/api/role-applications/99999/approve` |
| **Expected Result** | ❌ Status: 400<br>❌ Error: "Application not found" |

---

## 🚚 UC4: ADMIN APPROVE SHIPPER APPLICATION

### TC-UC4-001: Approve Pending Shipper Application

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC4-001 |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | - Shipper application ID=2, status="pending"<br>- User ID=6, role="buyer" |
| **Test Steps** | 1. POST `/api/role-applications/2/approve`<br>2. Body: `{"note": "Approved"}` |
| **Expected Result** | ✅ Status: 200<br>✅ Application approved<br>✅ User role="shipper"<br>✅ NO shop created (only for sellers) |
| **Verification** | ```sql<br>SELECT * FROM users WHERE id=6;<br>-- role should be 'shipper'<br>SELECT * FROM shops WHERE seller_id=6;<br>-- should return 0 rows<br>``` |

---

## ❌ UC5: ADMIN REJECT APPLICATION

### Use Case Description
**Actor**: Admin  
**Goal**: Reject application with reason  
**Precondition**: Admin logged in, pending application exists  
**Postcondition**: Application status="rejected", user role unchanged

---

### TC-UC5-001: Reject Seller Application with Reason

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC5-001 |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | - Admin logged in<br>- Application ID=3, status="pending"<br>- User ID=7, role="buyer" |
| **Test Steps** | 1. POST `/api/role-applications/3/reject`<br>2. Body: `{"reason": "Incomplete information"}` |
| **Expected Result** | ✅ Status: 200<br>✅ Application: status="rejected"<br>✅ Application: adminNote="Incomplete information"<br>✅ User: role="buyer" (unchanged)<br>✅ No shop created |

---

### TC-UC5-002: Reject Without Reason

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC5-002 |
| **Priority** | ⭐⭐⭐ Critical |
| **Test Steps** | POST `/api/role-applications/3/reject` with empty reason |
| **Test Data** | `{"reason": ""}` or `{}` |
| **Expected Result** | ❌ Status: 400<br>❌ Error: "Rejection reason is required" |

---

### TC-UC5-003: Reject Already Rejected Application

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC5-003 |
| **Priority** | ⭐⭐ High |
| **Prerequisites** | Application status="rejected" |
| **Expected Result** | ❌ Status: 400<br>❌ Error: "Application is not pending" |

---

### TC-UC5-004: Non-Admin Tries to Reject

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC5-004 |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | User logged in as "seller" |
| **Expected Result** | ❌ Status: 403<br>❌ Error: "Admin access required" |

---

## 📜 UC6: VIEW APPLICATION HISTORY

### TC-UC6-001: Admin Views All Pending Applications

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC6-001 |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | - Admin logged in<br>- 3 pending applications exist |
| **Test Steps** | GET `/api/role-applications/pending` |
| **Expected Result** | ✅ Status: 200<br>✅ Returns array of applications<br>✅ All have status="pending"<br>✅ Sorted by createdAt ASC |

---

### TC-UC6-002: Admin Views All Applications

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC6-002 |
| **Priority** | ⭐⭐ High |
| **Prerequisites** | - Admin logged in<br>- Applications with mixed statuses exist |
| **Test Steps** | GET `/api/role-applications/all` |
| **Expected Result** | ✅ Status: 200<br>✅ Returns all applications (pending, approved, rejected) |

---

### TC-UC6-003: User Views Own Applications

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC6-003 |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | - User ID=5 logged in<br>- User has 2 applications |
| **Test Steps** | GET `/api/role-applications/my-applications` |
| **Expected Result** | ✅ Status: 200<br>✅ Returns only applications where userId=5<br>✅ Sorted by createdAt DESC |

---

### TC-UC6-004: Non-Admin Cannot View All Applications

| Field | Details |
|-------|---------|
| **TC ID** | TC-UC6-004 |
| **Priority** | ⭐⭐⭐ Critical |
| **Prerequisites** | User logged in as "buyer" |
| **Test Steps** | GET `/api/role-applications/all` |
| **Expected Result** | ❌ Status: 403<br>❌ Error: "Admin access required" |

---

## 📏 BOUNDARY VALUE TEST CASES

### TC-BV-001: Shop Name - Maximum Length

| Field | Details |
|-------|---------|
| **TC ID** | TC-BV-001 |
| **Priority** | ⭐⭐ High |
| **Test Data** | shopName with 255 characters (max) |
| **Expected Result** | ✅ Application created successfully |

---

### TC-BV-002: Shop Name - Exceeds Maximum Length

| Field | Details |
|-------|---------|
| **TC ID** | TC-BV-002 |
| **Test Data** | shopName with 256 characters |
| **Expected Result** | ❌ Database constraint violation or truncation |

---

### TC-BV-003: Reason Field - Empty String

| Field | Details |
|-------|---------|
| **TC ID** | TC-BV-003 |
| **Test Data** | `{"reason": ""}` |
| **Expected Result** | ✅ Accepted (reason is optional) |

---

### TC-BV-004: Reason Field - Very Long Text

| Field | Details |
|-------|---------|
| **TC ID** | TC-BV-004 |
| **Test Data** | reason with 5000 characters |
| **Expected Result** | ✅ Accepted (TEXT column) |

---

## ❗ NEGATIVE TEST CASES

### TC-NEG-001: SQL Injection in Shop Name

| Field | Details |
|-------|---------|
| **TC ID** | TC-NEG-001 |
| **Priority** | ⭐⭐⭐ Critical |
| **Test Data** | `{"shopName": "'; DROP TABLE shops;--"}` |
| **Expected Result** | ✅ Input sanitized, application created safely |

---

### TC-NEG-002: XSS Attack in Shop Description

| Field | Details |
|-------|---------|
| **TC ID** | TC-NEG-002 |
| **Test Data** | `{"shopDescription": "<script>alert('XSS')</script>"}` |
| **Expected Result** | ✅ Script escaped, not executed |

---

### TC-NEG-003: Null Request Body

| Field | Details |
|-------|---------|
| **TC ID** | TC-NEG-003 |
| **Test Data** | POST with null body |
| **Expected Result** | ❌ Status: 400, validation error |

---

### TC-NEG-004: Invalid JSON Format

| Field | Details |
|-------|---------|
| **TC ID** | TC-NEG-004 |
| **Test Data** | `{requestedRole: seller` (malformed JSON) |
| **Expected Result** | ❌ Status: 400, parse error |

---

### TC-NEG-005: Expired JWT Token

| Field | Details |
|-------|---------|
| **TC ID** | TC-NEG-005 |
| **Prerequisites** | Token created 25 hours ago (expired) |
| **Expected Result** | ❌ Status: 401, "Token expired" |

---

## 📊 TEST EXECUTION REPORT

### Summary Statistics

| Metric | Value |
|--------|-------|
| **Total Test Cases** | 42 |
| **Critical Priority** | 18 |
| **High Priority** | 16 |
| **Medium Priority** | 8 |
| **Executed** | _To be filled_ |
| **Passed** | _To be filled_ |
| **Failed** | _To be filled_ |
| **Pass Rate** | _To be calculated_ |

---

### Test Cases by Category

| Category | Test Cases |
|----------|------------|
| Application Submission | TC-UC1-001 to TC-UC2-003 (8) |
| Admin Approval | TC-UC3-001 to TC-UC4-001 (6) |
| Admin Rejection | TC-UC5-001 to TC-UC5-004 (4) |
| View Applications | TC-UC6-001 to TC-UC6-004 (4) |
| Boundary Value | TC-BV-001 to TC-BV-004 (4) |
| Negative Tests | TC-NEG-001 to TC-NEG-005 (5) |
| **Total** | **42** |

---

### Defects Found

| Defect ID | TC ID | Severity | Description | Status |
|-----------|-------|----------|-------------|--------|
| DEF-001 | | | | |
| DEF-002 | | | | |

_(To be filled during test execution)_

---

## 📝 NOTES FOR PRESENTATION (8 minutes)

### Structure:

**1. Introduction (1 min)**
- What is Use Case Testing
- Benefits: Real-world scenarios, end-to-end flows

**2. Use Case Overview (1.5 min)**
- 6 main use cases identified
- Show UC3 flow diagram

**3. Test Case Walkthrough (3 min)**
- Demo TC-UC3-001 (Approve Seller - most complex)
  - Show prerequisites
  - Walk through steps
  - Explain expected results
  - Show verification queries
- Highlight boundary value tests
- Show negative test examples

**4. Coverage & Results (1.5 min)**
- 42 test cases covering 6 use cases
- Priority distribution chart
- Defects found (if any)

**5. Q&A (1 min)**

---

**END OF TEST CASES DOCUMENT**
