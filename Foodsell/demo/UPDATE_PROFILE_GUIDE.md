# Hướng dẫn cập nhật Database để thêm thông tin Profile

## Các bước thực hiện:

### 1. Chạy file SQL để thêm các cột vào database

Mở SQL Server Management Studio (SSMS) và chạy file `add_user_fields.sql`:

```sql
-- File: add_user_fields.sql
-- Thêm 3 cột mới vào bảng users: date_of_birth, gender, id_number
```

**Hoặc** chạy trực tiếp lệnh sau trong SSMS:

```sql
USE [foodsell]
GO

-- Add date_of_birth column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'date_of_birth')
BEGIN
    ALTER TABLE [dbo].[users] ADD [date_of_birth] [datetime2](7) NULL;
END
GO

-- Add gender column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'gender')
BEGIN
    ALTER TABLE [dbo].[users] ADD [gender] [nvarchar](10) NULL;
END
GO

-- Add id_number column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'id_number')
BEGIN
    ALTER TABLE [dbo].[users] ADD [id_number] [nvarchar](20) NULL;
END
GO
```

### 2. Khởi động lại backend

```powershell
cd "C:\Users\Admin\Downloads\HK5\New folder\Foodiez\Foodsell\demo"
mvn spring-boot:run
```

### 3. Test API

Sau khi thêm các cột, bạn có thể test API cập nhật profile:

**Endpoint:** `PUT http://localhost:8080/api/auth/profile`

**Request Body:**
```json
{
  "fullName": "Nguyen Van A",
  "phone": "0123456789",
  "address": "123 Nguyen Hue, Da Nang",
  "dateOfBirth": "1990-01-15T00:00:00",
  "gender": "male",
  "idNumber": "123456789012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "phone": "0123456789",
    "address": "123 Nguyen Hue, Da Nang",
    "dateOfBirth": "1990-01-15T00:00:00",
    "gender": "male",
    "idNumber": "123456789012",
    ...
  }
}
```

## Các thay đổi đã thực hiện:

### Backend (Java):
1. ✅ **User.java** - Thêm 3 fields mới:
   - `dateOfBirth` (LocalDateTime)
   - `gender` (String)
   - `idNumber` (String)

2. ✅ **ProfileUpdateRequest.java** - Thêm các fields mới để nhận dữ liệu từ frontend

3. ✅ **AuthController.java** - Cập nhật `updateProfile()` để xử lý các fields mới

### Database:
4. ✅ **add_user_fields.sql** - Script SQL để thêm các cột mới vào bảng `users`

## Lưu ý:
- Các trường mới đều là **NULL-able** (có thể để trống)
- Frontend đã có sẵn các input fields cho Date of Birth, Gender, và ID Number
- Sau khi cập nhật database và khởi động lại backend, thông tin sẽ hiển thị thay vì "Not provided"
