# Hướng Dẫn Cập Nhật Rating Column

## Vấn Đề
Khi thay đổi kiểu dữ liệu rating từ `Double` sang `Integer` trong Entity, Hibernate cố gắng drop và recreate cột, nhưng SQL Server có constraint DEFAULT không cho phép làm điều này.

## Giải Pháp

### Bước 1: Tắt Hibernate DDL Auto (Đã làm)
```properties
spring.jpa.hibernate.ddl-auto=none
```

### Bước 2: Chạy Script SQL Thủ Công

1. **Mở SQL Server Management Studio (SSMS)**
2. **Kết nối đến database**: `food_delivery_db6`
3. **Chạy script**: `update_rating_column.sql`

Script sẽ:
- Xóa constraint DEFAULT nếu có
- Thay đổi kiểu dữ liệu cột rating thành INT
- Cập nhật dữ liệu hiện có (làm tròn về số nguyên)
- Thêm constraint CHECK (rating từ 1-5)

### Bước 3: Bật Lại Hibernate DDL Auto (Sau khi chạy script)

Sau khi chạy script SQL thành công, đổi lại:
```properties
spring.jpa.hibernate.ddl-auto=update
```

### Bước 4: Chạy Project

```bash
cd D:\SWP391\Foodiez\Foodsell\demo
.\mvnw.cmd spring-boot:run
```

## Lưu Ý

- **Backup database** trước khi chạy script
- Script sẽ làm tròn tất cả rating hiện có về số nguyên
- Nếu có lỗi, kiểm tra tên constraint trong database

## Kiểm Tra Kết Quả

Sau khi chạy script, kiểm tra:
```sql
-- Kiểm tra kiểu dữ liệu
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME IN ('shops', 'shippers', 'reviews') 
AND COLUMN_NAME = 'rating';

-- Kiểm tra constraint
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_NAME IN ('shops', 'shippers', 'reviews');
```
