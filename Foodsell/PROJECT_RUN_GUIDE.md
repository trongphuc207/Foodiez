# Hướng Dẫn Chạy Project Foodiez

## Tình Trạng Hiện Tại

### ✅ Đã Hoàn Thành
- ✅ Review System đã được implement đầy đủ (Backend + Frontend)
- ✅ Tất cả use cases đã được cover
- ✅ Frontend dependencies đã được cài đặt
- ✅ Code đã được fix lỗi

### ❌ Vấn Đề Cần Giải Quyết
- ❌ **Backend**: Lỗi kết nối SQL Server - "Login failed for user 'sa'"
- ❌ **Frontend**: Chưa khởi động được

## Các Bước Để Chạy Project

### Bước 1: Cấu Hình SQL Server (QUAN TRỌNG)

**Vấn đề**: Backend không thể kết nối đến SQL Server với user 'sa'

**Giải pháp**:

1. **Kiểm tra SQL Server có đang chạy không**:
   ```powershell
   Get-Service -Name "MSSQL*"
   ```

2. **Khởi động SQL Server nếu chưa chạy**:
   ```powershell
   Start-Service -Name "MSSQLSERVER"
   ```

3. **Kiểm tra cấu hình SQL Server**:
   - Mở SQL Server Management Studio (SSMS)
   - Kết nối với server: `localhost` hoặc `.\SQLEXPRESS`
   - Kiểm tra user 'sa' có tồn tại không
   - Kiểm tra password của user 'sa' có đúng là '1234' không

4. **Tạo database nếu chưa có**:
   ```sql
   CREATE DATABASE food_delivery_db10;
   ```

5. **Cấu hình SQL Server Authentication**:
   - Right-click server → Properties → Security
   - Chọn "SQL Server and Windows Authentication mode"
   - Restart SQL Server service

6. **Reset password cho user 'sa'**:
   ```sql
   ALTER LOGIN sa WITH PASSWORD = '1234';
   ALTER LOGIN sa ENABLE;
   ```

### Bước 2: Chạy Backend (Spring Boot)

```powershell
# Di chuyển đến thư mục backend
cd D:\SWP391\Foodiez\Foodsell\demo

# Chạy Spring Boot
.\mvnw.cmd spring-boot:run
```

**Kết quả mong đợi**:
```
Started DemoApplication in X.XXX seconds (JVM running for X.XXX)
```

### Bước 3: Chạy Frontend (React)

Mở terminal mới:

```powershell
# Di chuyển đến thư mục frontend
cd D:\SWP391\Foodiez\Foodsell\foodsystem

# Chạy React app
npm start
```

**Kết quả mong đợi**:
```
webpack compiled with 0 errors
Local:            http://localhost:3000/
On Your Network:  http://192.168.x.x:3000/
```

### Bước 4: Kiểm Tra Kết Nối

1. **Backend**: http://localhost:8080
2. **Frontend**: http://localhost:3000

## Cấu Hình Database Hiện Tại

File: `Foodsell/demo/src/main/resources/application.properties`

```properties
# Database Configuration
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=food_delivery_db10;encrypt=false;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=1234
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
```

## Troubleshooting

### Lỗi "Login failed for user 'sa'"

**Nguyên nhân**:
- SQL Server chưa được khởi động
- User 'sa' bị disable
- Password không đúng
- SQL Server Authentication chưa được enable

**Giải pháp**:
1. Khởi động SQL Server service
2. Enable SQL Server Authentication
3. Reset password cho user 'sa'
4. Kiểm tra firewall (port 1433)

### Lỗi "Database 'food_delivery_db10' does not exist"

**Giải pháp**:
```sql
CREATE DATABASE food_delivery_db10;
```

### Lỗi Frontend không chạy

**Giải pháp**:
```powershell
# Cài đặt lại dependencies
cd D:\SWP391\Foodiez\Foodsell\foodsystem
npm install
npm start
```

## Review System Features

Sau khi chạy thành công, bạn sẽ có:

### Customer Features
- ✅ Viết review cho sản phẩm/shop
- ✅ Chỉnh sửa review của mình
- ✅ Xóa review của mình
- ✅ Xem tất cả review của sản phẩm/shop

### Merchant Features
- ✅ Trả lời review của customer
- ✅ Chỉnh sửa reply của mình
- ✅ Xóa reply của mình
- ✅ Xem tất cả review của shop

### Admin Features
- ✅ Xem tất cả review trong hệ thống
- ✅ Xóa review không phù hợp
- ✅ Quản lý reply của merchant

## URLs Quan Trọng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Review API**: http://localhost:8080/api/reviews

## Lưu Ý

1. **Đảm bảo SQL Server đang chạy** trước khi chạy backend
2. **Chạy backend trước**, sau đó mới chạy frontend
3. **Kiểm tra port 8080 và 3000** không bị conflict
4. **Review system** đã được tích hợp vào:
   - Product Detail page
   - Shop Detail page  
   - Admin Dashboard

## Hỗ Trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. SQL Server service status
2. Database connection
3. Port availability
4. Dependencies installation
