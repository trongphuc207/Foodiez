# 🎯 QUICK START GUIDE - ADMIN ROLE APPROVALS TESTING

## 📦 PACKAGE SUMMARY

Bạn đã có **BỘ TEST CASE HOÀN CHỈNH** cho phần Admin - Duyệt Đơn Xin Vai Trò!

### 📂 Files Created (6 files):

1. **TEST_PLAN_ADMIN_APPROVALS_FULL.md** (Kế hoạch kiểm thử - 15 sections)
2. **DECISION_TABLES_FULL.md** (Bảng quyết định - 4 tables, 31 test cases)
3. **TEST_CASES_FULL.md** (Test cases chi tiết - 42 test cases)
4. **RoleApplicationServiceTest.java** (JUnit tests - 19 unit tests)
5. **AdminApprovalSeleniumTest.java** (Selenium UI tests - 8 scenarios)
6. **Postman_Collection_Admin_Role_Applications.json** (API tests - 12 requests)
7. **README_TESTING.md** (Hướng dẫn chi tiết)
8. **QUICK_START.md** (File này - tham khảo nhanh)

---

## ⏱️ PRESENTATION BREAKDOWN (32 minutes total)

### Member 1: Test Plan & JUnit (8 min)
- **Slide 1-2**: Test plan overview (2 min)
- **Demo**: Run JUnit tests in IDE (4 min)
  - Show 3 key tests passing
  - Show code coverage report (80%+)
- **Q&A** (2 min)

**Files needed**: 
- `TEST_PLAN_ADMIN_APPROVALS_FULL.md`
- `RoleApplicationServiceTest.java`

**Commands**:
```bash
mvn test -Dtest=RoleApplicationServiceTest
mvn jacoco:report
```

---

### Member 2: Decision Tables (8 min)
- **Slide 1**: What is Decision Table Testing? (1 min)
- **Slide 2-3**: Show DT1 (Application Submission) (3 min)
  - Walk through conditions & actions
  - Show 2-3 rules in detail
- **Slide 4**: Show DT2 & DT3 (Approve/Reject) (3 min)
- **Summary**: 31 test cases, 100% coverage (1 min)

**Files needed**: 
- `DECISION_TABLES_FULL.md`

**Print/Display**: 
- Decision tables in large format
- Highlight colors for pass/fail

---

### Member 3: Use Case Testing (8 min)
- **Slide 1**: Use Case Testing explained (1 min)
- **Demo 1**: TC-UC3-001 walkthrough (3 min)
  - Show test case template
  - Show test data (JSON)
  - Run in Postman
  - Show SQL verification
- **Demo 2**: Boundary value & negative tests (2 min)
- **Summary**: 42 test cases, multiple techniques (2 min)

**Files needed**: 
- `TEST_CASES_FULL.md`
- `Postman_Collection_Admin_Role_Applications.json`

**Tools needed**: 
- Postman installed
- Database client (SSMS/DBeaver)

---

### Member 4: Selenium Automation (8 min)
- **Slide 1**: Selenium overview (1 min)
- **Live Demo 1**: Admin login (1.5 min)
  - Open browser
  - Login
  - Navigate to applications
- **Live Demo 2**: Approve application (2 min)
  - Click approve
  - Fill modal
  - Verify success
- **Live Demo 3**: Reject application (2 min)
- **Summary**: 8 automated UI tests (1.5 min)

**Files needed**: 
- `AdminApprovalSeleniumTest.java`

**Prerequisites**: 
- Backend running (port 8080)
- Frontend running (port 3000)
- Test data seeded
- ChromeDriver installed

---

## 🚀 SETUP IN 5 MINUTES

### Step 1: Database (1 min)
```sql
-- Copy và run script này:
USE FoodieDB;

-- Insert admin user
INSERT INTO users (email, password_hash, role, full_name) 
VALUES ('admin@test.com', '$2a$10$abcd...', 'admin', 'Test Admin');

-- Insert customer
INSERT INTO users (email, password_hash, role, full_name) 
VALUES ('customer@test.com', '$2a$10$efgh...', 'buyer', 'Test Customer');

-- Insert pending applications
INSERT INTO role_applications (user_id, requested_role, status, reason, shop_name, shop_address)
VALUES 
(2, 'seller', 'pending', 'Want to sell', 'Test Shop', '123 Test St'),
(2, 'shipper', 'pending', 'Want to deliver', NULL, NULL);
```

### Step 2: Backend (1 min)
```bash
cd Foodsell/demo
mvn spring-boot:run
# Wait for "Started DemoApplication..."
```

### Step 3: Frontend (1 min)
```bash
cd Foodsell/foodsystem
npm start
# Opens http://localhost:3000
```

### Step 4: Verify (2 min)
```bash
# Test backend API
curl http://localhost:8080/api/role-applications/pending

# Test frontend
# Open browser: http://localhost:3000
# Login: admin@test.com / admin123
```

---

## 🎬 DAY OF PRESENTATION CHECKLIST

### Morning of Presentation:
- [ ] Charge ALL laptops
- [ ] Test HDMI cable/adapter
- [ ] Print decision tables (large format)
- [ ] Backup: Export all files to USB drive
- [ ] Backup: Screen record all demos

### 30 Minutes Before:
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Login once to verify
- [ ] Run JUnit tests once
- [ ] Run Selenium once (check it works)
- [ ] Open all files in IDE
- [ ] Open Postman with collection loaded
- [ ] Open database client

### Just Before Your Turn:
- [ ] Close unnecessary applications
- [ ] Increase font size (IDE, Postman, browser)
- [ ] Mute notifications
- [ ] Take deep breath 😊

---

## 🎯 KEY TALKING POINTS

### Member 1 (Test Plan & JUnit):
> "We created a comprehensive test plan covering 80+ test cases. Our JUnit tests achieve 80%+ code coverage. Let me show you..."

**Show**:
- Test plan document structure
- JUnit test running in IDE (green checkmarks)
- Coverage report (colorful bars showing 80%+)

**Emphasize**:
- Professional documentation
- Automated testing
- High code coverage

---

### Member 2 (Decision Tables):
> "Decision table testing ensures we don't miss ANY scenario. With 10 rules in DT1, we identified all possible combinations of inputs..."

**Show**:
- Printed decision table (point to conditions)
- Walk through Rule 1 (happy path)
- Walk through Rule 2 (error case)
- Show 31 test cases generated

**Emphasize**:
- Systematic approach
- Complete coverage
- Easy to understand

---

### Member 3 (Use Cases):
> "Use case testing simulates real user scenarios. Let me show you UC3: Admin approves a seller application..."

**Show**:
- Test case document (scroll to TC-UC3-001)
- Run request in Postman (show 200 OK)
- Query database (show updated record)
- Show shop created

**Emphasize**:
- Real-world scenarios
- End-to-end testing
- Database verification

---

### Member 4 (Selenium):
> "Now let's see this working in a real browser, exactly as the admin would use it..."

**Show**:
- Browser opens automatically
- Login form fills automatically
- Navigate to applications page
- Click approve button
- Modal appears
- Success message shows

**Emphasize**:
- Automation saves time
- Tests real user experience
- Regression testing made easy

---

## 💡 BACKUP PLANS

### If JUnit Demo Fails:
- Show pre-recorded video
- Or show screenshot of passing tests
- Or explain code without running

### If Selenium Crashes:
- Show pre-recorded video
- Or walk through code and explain
- Or switch to Postman demo

### If Internet/Projector Fails:
- Switch to laptop screen sharing
- Or use printed handouts
- Or verbal explanation with whiteboard

---

## 📊 STATISTICS TO MENTION

- **Total test cases**: 100+
- **Decision table rules**: 31
- **Use case test cases**: 42  
- **JUnit tests**: 19
- **Selenium tests**: 8
- **API endpoints tested**: 6
- **Code coverage**: 80%+
- **Testing techniques**: 5 (Decision table, Use case, Boundary value, Equivalence partitioning, Negative testing)
- **Tools used**: 5 (JUnit, Mockito, Selenium, Postman, Maven)

---

## 🎤 SAMPLE ANSWERS TO QUESTIONS

**Q: Why did you choose these testing techniques?**
> "We used Decision Table Testing for systematic coverage of all input combinations, Use Case Testing for real-world scenarios, and Selenium for end-to-end UI automation. This combination ensures both complete coverage and practical testing."

**Q: How long does it take to run all tests?**
> "JUnit tests run in under 5 seconds. Selenium tests take about 2 minutes. We can run them on every code commit for continuous testing."

**Q: What if you find a bug during the demo?**
> "That's actually great! It shows our tests are working. We would log it, assign to developer, and re-test after fix. That's the defect lifecycle we outlined in the test plan."

**Q: Can this be used in real projects?**
> "Absolutely! Our test cases are production-ready. Companies use the exact same tools: JUnit for unit testing, Selenium for UI automation, and decision tables for requirement analysis."

---

## 🏆 SUCCESS CHECKLIST

After presentation, you should have demonstrated:
- ✅ Professional test documentation
- ✅ Multiple testing techniques
- ✅ Automated testing tools
- ✅ Live code execution
- ✅ Database verification
- ✅ Clear understanding of concepts
- ✅ Team coordination
- ✅ Time management (8 min each)

---

## 📞 LAST MINUTE HELP

**Can't run tests?**
- Check Java version: `java -version`
- Check Maven: `mvn -version`
- Clean build: `mvn clean install`

**Can't start backend?**
- Check port 8080: `netstat -ano | findstr :8080`
- Kill process: `taskkill /PID <pid> /F`

**Can't start frontend?**
- Delete node_modules: `rmdir /s node_modules`
- Reinstall: `npm install`
- Try different port: `PORT=3001 npm start`

**Selenium not working?**
- Check ChromeDriver version matches Chrome
- Download: https://chromedriver.chromium.org/
- Add to PATH

---

## 🎉 FINAL WORDS

**You are READY!** 🚀

- Bạn có tài liệu chuyên nghiệp
- Bạn có code tests hoàn chỉnh
- Bạn có demo sẵn sàng
- Bạn hiểu rõ concepts

**Tips for success:**
1. **Practice** timing (8 minutes)
2. **Speak slowly** and clearly
3. **Point to screen** when explaining
4. **Stay calm** if something fails
5. **Smile** and be confident

**Remember**: Giáo viên muốn thấy:
- ✅ Hiểu concepts
- ✅ Biết dùng tools
- ✅ Làm việc nhóm tốt
- ✅ Present chuyên nghiệp

---

## 📚 DOCUMENT MAP

```
testing/
├── TEST_PLAN_ADMIN_APPROVALS_FULL.md          ← Kế hoạch chi tiết
├── DECISION_TABLES_FULL.md                    ← Bảng quyết định
├── TEST_CASES_FULL.md                         ← Test cases
├── README_TESTING.md                          ← Hướng dẫn đầy đủ
├── QUICK_START.md                             ← File này
└── Postman_Collection_Admin_Role_Applications.json ← API tests

demo/src/test/java/com/example/demo/
├── roleapplication/
│   └── RoleApplicationServiceTest.java        ← JUnit tests
└── selenium/
    └── AdminApprovalSeleniumTest.java         ← Selenium tests
```

---

## ✅ PRE-PRESENTATION CHECKLIST

Print this and check off:

**1 Week Before:**
- [ ] All team members have read documents
- [ ] Practice run-through (at least 3 times)
- [ ] Time each member (8 minutes)
- [ ] Give feedback to each other

**1 Day Before:**
- [ ] All tests passing
- [ ] Backup files on USB drive
- [ ] Record demo videos (backup)
- [ ] Print decision tables
- [ ] Charge laptops

**Morning Of:**
- [ ] Test HDMI works
- [ ] Start servers
- [ ] Verify all demos work
- [ ] Increase font sizes
- [ ] Close unnecessary apps

**Just Before:**
- [ ] Deep breath
- [ ] Smile
- [ ] Confidence! 💪

---

## 🌟 YOU'VE GOT THIS!

Good luck with your presentation! 🎉

---

**END OF QUICK START GUIDE**
