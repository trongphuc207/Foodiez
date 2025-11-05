# 🗄️ HƯỚNG DẪN CẤU HÌNH DATABASE - FOODIEZ PROJECT

## 📋 **VẤN ĐỀ HIỆN TẠI**
Spring Boot không thể kết nối đến SQL Server database với lỗi:
```
Login failed for user 'sa'
```

## 🔧 **GIẢI PHÁP**

### **1. Cài đặt SQL Server**

#### **Option A: SQL Server Express (Miễn phí)**
1. Tải SQL Server Express từ: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Cài đặt với cấu hình mặc định
3. Chọn "Mixed Mode Authentication" và đặt password cho `sa` user

#### **Option B: SQL Server Developer Edition (Miễn phí)**
1. Tải SQL Server Developer Edition từ Microsoft
2. Cài đặt với cấu hình mặc định
3. Chọn "Mixed Mode Authentication"

#### **Option C: Docker (Khuyến nghị)**
```bash
# Chạy SQL Server trong Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=1234" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

### **2. Cấu hình Database**

#### **Tạo Database:**
```sql
-- Kết nối SQL Server Management Studio hoặc sqlcmd
CREATE DATABASE food_delivery_db10;
GO

-- Đảm bảo sa user có quyền
USE food_delivery_db10;
GO

-- Tạo user nếu cần
CREATE LOGIN sa WITH PASSWORD = '1234';
GO

-- Cấp quyền
ALTER SERVER ROLE sysadmin ADD MEMBER sa;
GO
```

#### **Hoặc sử dụng SQL Server Management Studio:**
1. Mở SQL Server Management Studio
2. Kết nối với server (localhost)
3. Right-click "Databases" → "New Database"
4. Tên: `food_delivery_db10`
5. Click "OK"

### **3. Kiểm tra kết nối**

#### **Test connection với sqlcmd:**
```bash
sqlcmd -S localhost -U sa -P 1234 -d food_delivery_db10
```

#### **Hoặc test với SQL Server Management Studio:**
- Server: `localhost` hoặc `localhost\SQLEXPRESS`
- Authentication: SQL Server Authentication
- Login: `sa`
- Password: `1234`

### **4. Cấu hình Firewall (nếu cần)**
```bash
# Mở port 1433 trong Windows Firewall
netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=TCP localport=1433
```

## 🚀 **CHẠY PROJECT**

### **Bước 1: Chạy Backend (Spring Boot)**
```bash
cd Foodsell/demo
mvn spring-boot:run
```

### **Bước 2: Chạy Frontend (React)**
```bash
cd Foodsell/foodsystem
npm start
```

### **Bước 3: Truy cập ứng dụng**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Test**: http://localhost:8080/api/reviews/test

## 🔍 **TROUBLESHOOTING**

### **Lỗi thường gặp:**

#### **1. "Login failed for user 'sa'"**
- Kiểm tra password của sa user
- Đảm bảo SQL Server đang chạy
- Kiểm tra SQL Server Authentication mode

#### **2. "Connection refused"**
- Kiểm tra SQL Server service đang chạy
- Kiểm tra port 1433 có bị block không
- Kiểm tra firewall settings

#### **3. "Database does not exist"**
- Tạo database `food_delivery_db10`
- Kiểm tra tên database trong application.properties

### **Kiểm tra SQL Server Service:**
```bash
# Windows
services.msc
# Tìm "SQL Server (MSSQLSERVER)" và đảm bảo đang chạy
```

### **Kiểm tra port:**
```bash
netstat -an | findstr 1433
```

## 📝 **CẤU HÌNH ALTERNATIVE**

### **Nếu muốn thay đổi database:**
Cập nhật file `application.properties`:
```properties
# Thay đổi database name
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=YOUR_DB_NAME;encrypt=false;trustServerCertificate=true

# Thay đổi username/password
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### **Nếu muốn sử dụng H2 Database (in-memory):**
```properties
# Thay thế SQL Server config bằng H2
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.h2.console.enabled=true
```

## ✅ **KIỂM TRA THÀNH CÔNG**

Khi cấu hình đúng, bạn sẽ thấy:
```
2025-10-22T15:52:43.154+07:00  INFO --- [demo] [main] com.example.demo.DemoApplication : Started DemoApplication in X.XXX seconds
```

Và có thể truy cập:
- http://localhost:8080/api/reviews/test → "Review API is working!"

## 🆘 **HỖ TRỢ**

Nếu vẫn gặp vấn đề:
1. Kiểm tra log của Spring Boot
2. Kiểm tra SQL Server error log
3. Thử kết nối database bằng tool khác (SSMS, DBeaver)
4. Kiểm tra network và firewall settings

**Chúc bạn thành công! 🎉**
