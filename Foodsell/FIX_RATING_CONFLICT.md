# 🔧 FIX LỖI RATING CONFLICT

## ❌ Vấn Đề Hiện Tại
- **Lỗi**: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
- **Nguyên nhân**: SQL Server constraint conflict khi Hibernate cố thay đổi cột rating từ Double sang Integer
- **Chi tiết**: SQL Server có constraint DEFAULT không cho phép drop cột rating

## ✅ Giải Pháp

### Bước 1: Chạy Script SQL
1. **Mở SQL Server Management Studio (SSMS)**
2. **Kết nối đến database**: `food_delivery_db6`
3. **Chạy script**: `update_rating_column.sql`

### Bước 2: Script Sẽ Làm Gì
```sql
-- 1. Xóa tất cả constraint DEFAULT cho cột rating
-- 2. Thay đổi kiểu dữ liệu: Double → Integer
-- 3. Cập nhật dữ liệu hiện có (làm tròn)
-- 4. Thêm constraint CHECK (rating 1-5)
```

### Bước 3: Sau Khi Chạy Script
1. **Restart backend**:
   ```bash
   cd D:\SWP391\Foodiez\Foodsell\demo
   .\mvnw.cmd spring-boot:run
   ```

2. **Restart frontend**:
   ```bash
   cd D:\SWP391\Foodiez\Foodsell\foodsystem
   npm start
   ```

## 🎯 Kết Quả Mong Đợi
- ✅ Backend khởi động thành công
- ✅ Frontend load review không lỗi
- ✅ Rating hiển thị đúng (số nguyên 1-5)
- ✅ API review hoạt động bình thường

## 🚨 Lưu Ý Quan Trọng
- **Backup database** trước khi chạy script
- Script sẽ làm tròn tất cả rating hiện có về số nguyên
- Nếu có lỗi, kiểm tra tên database trong script

## 🔍 Kiểm Tra Sau Khi Fix
```sql
-- Kiểm tra kiểu dữ liệu
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME IN ('shops', 'shippers', 'reviews') 
AND COLUMN_NAME = 'rating';
```

**Kết quả mong đợi**: `DATA_TYPE = int`
