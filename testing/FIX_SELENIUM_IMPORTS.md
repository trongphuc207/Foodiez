# 🔧 HƯỚNG DẪN KHẮC PHỤC LỖI IMPORT SELENIUM

## ❌ LỖI BẠN GẶP PHẢI:

```
The import org.openqa.selenium cannot be resolved
```

## ✅ GIẢI PHÁP HOÀN CHỈNH:

### Bước 1: Cập nhật `pom.xml`

Tôi đã thêm các dependencies Selenium vào file `pom.xml`. Bây giờ bạn cần:

#### 1.1. Chạy Maven để tải dependencies:

```bash
cd Foodsell/demo
mvn clean install
```

Hoặc trong IDE:
- **IntelliJ IDEA**: Click chuột phải vào `pom.xml` → Maven → Reload Project
- **VS Code**: Ctrl+Shift+P → "Maven: Reload Projects"
- **Eclipse**: Chuột phải vào project → Maven → Update Project

---

### Bước 2: Verify Dependencies Đã Được Tải

Kiểm tra xem các file `.jar` đã được tải về:

```bash
# Kiểm tra Selenium
mvn dependency:tree | findstr selenium

# Kết quả mong đợi:
# [INFO] +- org.seleniumhq.selenium:selenium-java:jar:4.15.0:test
# [INFO] +- org.seleniumhq.selenium:selenium-support:jar:4.15.0:test
```

---

### Bước 3: Các Dependencies Đã Thêm

```xml
<!-- Selenium WebDriver for UI Testing -->
<dependency>
  <groupId>org.seleniumhq.selenium</groupId>
  <artifactId>selenium-java</artifactId>
  <version>4.15.0</version>
  <scope>test</scope>
</dependency>

<!-- Selenium Support (WebDriverWait, ExpectedConditions) -->
<dependency>
  <groupId>org.seleniumhq.selenium</groupId>
  <artifactId>selenium-support</artifactId>
  <version>4.15.0</version>
  <scope>test</scope>
</dependency>

<!-- WebDriverManager - Automatically manages browser drivers -->
<dependency>
  <groupId>io.github.bonigarcia</groupId>
  <artifactId>webdrivermanager</artifactId>
  <version>5.6.2</version>
  <scope>test</scope>
</dependency>

<!-- Mockito for Mocking in Tests -->
<dependency>
  <groupId>org.mockito</groupId>
  <artifactId>mockito-core</artifactId>
  <version>5.7.0</version>
  <scope>test</scope>
</dependency>

<!-- Mockito JUnit Jupiter Integration -->
<dependency>
  <groupId>org.mockito</groupId>
  <artifactId>mockito-junit-jupiter</artifactId>
  <version>5.7.0</version>
  <scope>test</scope>
</dependency>
```

---

### Bước 4: Cập Nhật Code Test

File `AdminApprovalSeleniumTest.java` đã được cập nhật với:

#### 4.1. Import WebDriverManager:
```java
import io.github.bonigarcia.wdm.WebDriverManager;
```

#### 4.2. Sử dụng WebDriverManager trong setup:
```java
@BeforeAll
static void setUpClass() {
    // Setup ChromeDriver automatically using WebDriverManager
    WebDriverManager.chromedriver().setup();
    
    ChromeOptions options = new ChromeOptions();
    options.addArguments("--start-maximized");
    options.addArguments("--disable-notifications");
    options.addArguments("--remote-allow-origins=*");
    
    driver = new ChromeDriver(options);
    wait = new WebDriverWait(driver, Duration.ofSeconds(TIMEOUT_SECONDS));
}
```

**Lợi ích**: WebDriverManager tự động tải ChromeDriver phù hợp với phiên bản Chrome của bạn!

---

### Bước 5: Chạy Tests

#### 5.1. Compile project:
```bash
mvn clean compile
```

#### 5.2. Run Selenium tests:
```bash
mvn test -Dtest=AdminApprovalSeleniumTest
```

#### 5.3. Nếu chỉ muốn run 1 test method:
```bash
mvn test -Dtest=AdminApprovalSeleniumTest#testAdminLogin
```

---

## 🔍 TROUBLESHOOTING

### Lỗi 1: "ChromeDriver not found"

**Không còn xảy ra** vì WebDriverManager tự động tải ChromeDriver!

Nhưng nếu vẫn lỗi:
```bash
# Download manual:
# https://chromedriver.chromium.org/
# Giải nén và add vào PATH
```

---

### Lỗi 2: "Cannot resolve symbol WebDriverManager"

**Nguyên nhân**: Maven chưa tải dependency

**Giải pháp**:
```bash
# Xóa cache Maven và tải lại
rm -rf ~/.m2/repository/io/github/bonigarcia
mvn clean install -U
```

Hoặc trong IDE:
- IntelliJ: File → Invalidate Caches → Restart
- VS Code: Xóa folder `.vscode` và reload

---

### Lỗi 3: "Session not created: This version of ChromeDriver only supports Chrome version XX"

**Nguyên nhân**: Chrome browser và ChromeDriver không match

**Giải pháp**: WebDriverManager sẽ tự động fix! Nhưng nếu vẫn lỗi:

```java
// Chỉ định phiên bản Chrome cụ thể
WebDriverManager.chromedriver()
    .browserVersion("120.0.6099.109")
    .setup();
```

Hoặc update Chrome browser:
```
Mở Chrome → Settings → About Chrome → Update
```

---

### Lỗi 4: Tests chạy nhưng không thấy browser

**Nguyên nhân**: Đang chạy headless mode

**Giải pháp**: Comment dòng này:
```java
// options.addArguments("--headless");
```

---

### Lỗi 5: "Element not found" hoặc "Timeout"

**Nguyên nhân**: 
- Backend/Frontend chưa chạy
- Selector không đúng
- Trang load chậm

**Giải pháp**:
```java
// Tăng timeout
private static final int TIMEOUT_SECONDS = 30; // Thay vì 10

// Hoặc thêm explicit wait
WebDriverWait longWait = new WebDriverWait(driver, Duration.ofSeconds(30));
longWait.until(ExpectedConditions.presenceOfElementLocated(By.id("element-id")));
```

---

## 📚 SELENIUM CHEAT SHEET

### Tìm Elements:

```java
// By ID
driver.findElement(By.id("email"));

// By Name
driver.findElement(By.name("password"));

// By Class Name
driver.findElement(By.className("btn-primary"));

// By CSS Selector
driver.findElement(By.cssSelector(".modal .btn-confirm"));

// By XPath
driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));

// By Link Text
driver.findElement(By.linkText("Login"));

// By Partial Link Text
driver.findElement(By.partialLinkText("Log"));
```

### Tương tác với Elements:

```java
// Click
element.click();

// Type text
element.sendKeys("Hello World");

// Clear input
element.clear();

// Get text
String text = element.getText();

// Get attribute
String href = element.getAttribute("href");

// Check if displayed
boolean visible = element.isDisplayed();

// Check if enabled
boolean enabled = element.isEnabled();
```

### Wait Strategies:

```java
// Implicit Wait (global)
driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));

// Explicit Wait
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

// Wait for element to be present
wait.until(ExpectedConditions.presenceOfElementLocated(By.id("element")));

// Wait for element to be visible
wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("element")));

// Wait for element to be clickable
wait.until(ExpectedConditions.elementToBeClickable(By.id("element")));

// Wait for URL to contain
wait.until(ExpectedConditions.urlContains("/admin"));

// Wait for title
wait.until(ExpectedConditions.titleIs("Dashboard"));
```

### Browser Actions:

```java
// Navigate to URL
driver.get("http://localhost:3000");

// Get current URL
String url = driver.getCurrentUrl();

// Get title
String title = driver.getTitle();

// Back
driver.navigate().back();

// Forward
driver.navigate().forward();

// Refresh
driver.navigate().refresh();

// Maximize window
driver.manage().window().maximize();

// Take screenshot
TakesScreenshot ts = (TakesScreenshot) driver;
File source = ts.getScreenshotAs(OutputType.FILE);
```

---

## ✅ CHECKLIST TRƯỚC KHI CHẠY TESTS

- [ ] Backend running (port 8080)
- [ ] Frontend running (port 3000)
- [ ] Database có test data
- [ ] Chrome browser installed
- [ ] Maven dependencies downloaded
- [ ] No compile errors in IDE

---

## 🎯 RUN TESTS SUCCESSFULLY

### Full Command:
```bash
# 1. Navigate to project
cd Foodsell/demo

# 2. Clean install
mvn clean install

# 3. Run all tests
mvn test

# 4. Run only Selenium tests
mvn test -Dtest=AdminApprovalSeleniumTest

# 5. Run with detailed output
mvn test -Dtest=AdminApprovalSeleniumTest -X
```

---

## 📊 EXPECTED OUTPUT

Khi chạy thành công, bạn sẽ thấy:

```
========================================
Starting Selenium UI Test Suite
========================================

✓ Admin logged in successfully
✅ TC-SEL-001 PASSED: Admin login successful

✓ Navigated to Role Applications page
Found 3 pending applications
✅ TC-SEL-002 PASSED: Pending applications displayed

...

========================================
Selenium UI Test Suite Completed
========================================

Tests run: 8, Failures: 0, Errors: 0, Skipped: 0

[INFO] BUILD SUCCESS
```

---

## 💡 TIPS

### 1. Debug Mode:
```java
// Add this to see what's happening
System.out.println("Current URL: " + driver.getCurrentUrl());
System.out.println("Page Source: " + driver.getPageSource());
```

### 2. Slow Down Tests (for demo):
```java
// Add Thread.sleep() to see actions
element.click();
Thread.sleep(1000); // Wait 1 second
```

### 3. Run in Headless Mode (CI/CD):
```java
options.addArguments("--headless");
options.addArguments("--no-sandbox");
options.addArguments("--disable-dev-shm-usage");
```

### 4. Handle Alerts:
```java
// Accept alert
driver.switchTo().alert().accept();

// Dismiss alert
driver.switchTo().alert().dismiss();

// Get alert text
String alertText = driver.switchTo().alert().getText();
```

### 5. Switch Windows/Tabs:
```java
// Get all window handles
Set<String> windows = driver.getWindowHandles();

// Switch to new window
for (String window : windows) {
    driver.switchTo().window(window);
}
```

---

## 🎉 KẾT LUẬN

Sau khi làm theo các bước trên, lỗi import sẽ được khắc phục và bạn có thể:

✅ Chạy Selenium tests thành công
✅ Tự động test UI workflows
✅ Capture screenshots khi test fails
✅ Demo live cho presentation

**Good luck!** 🚀

---

**END OF GUIDE**
