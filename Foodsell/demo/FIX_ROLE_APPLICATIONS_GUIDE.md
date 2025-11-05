# 🔧 FIX ROLE APPLICATIONS - STEP BY STEP GUIDE

## 📋 Vấn đề ban đầu:
1. ❌ Gửi đơn thành công nhưng Admin không tải được danh sách đơn
2. ❌ Lỗi: "Không thể tải danh sách đơn"

---

## 🔍 Nguyên nhân:
1. ✅ **Bảng `role_applications` đã có trong `database.sql`** nhưng **chưa được tạo trong database thực tế**
2. ❌ **Frontend dùng sai token key**: 
   - `localStorage.getItem('token')` ❌
   - Phải dùng: `localStorage.getItem('authToken')` ✅

---

## ✅ Giải pháp đã làm:

### 1. Sửa token key trong 3 file frontend:
- ✅ `RoleApplications.jsx` - Admin component (3 chỗ)
  - `load()` function
  - `handleApprove()` function
  - `handleReject()` function
- ✅ `CustomerProfile.jsx` - User component (2 chỗ)
  - `loadApplications()` function
  - `handleApplicationFormSubmit()` function

### 2. Tạo script kiểm tra và tạo bảng:
- ✅ `check_role_applications_table.sql` - Kiểm tra xem bảng đã tồn tại chưa và tạo nếu thiếu

---

## 🚀 CÁCH TEST:

### STEP 1: Kiểm tra và tạo bảng trong database
```powershell
# Chạy trong thư mục demo
cd "C:\Users\Admin\Downloads\HK5\New folder\Foodiez\Foodsell\demo"

# Chạy script kiểm tra
sqlcmd -S localhost -d Foodiez -i "check_role_applications_table.sql"
```

**Kết quả mong đợi:**
- Nếu bảng chưa có: "✓ Table created successfully!"
- Nếu đã có: "✓ Table role_applications EXISTS"

---

### STEP 2: Restart backend
```bash
# Stop backend hiện tại (Ctrl+C trong terminal java)
# Sau đó chạy lại:
mvn spring-boot:run
```

---

### STEP 3: Restart frontend
```bash
# Stop frontend (Ctrl+C trong terminal node)
# Sau đó:
npm start
```

---

### STEP 4: Test flow đầy đủ

#### A. Test User gửi đơn:
1. ✅ Đăng nhập với tài khoản **buyer** (không phải admin)
2. ✅ Vào **Customer Profile** → Tab "Applications"
3. ✅ Click "Apply as Seller" hoặc "Apply as Shipper"
4. ✅ Điền thông tin (form đã pre-fill sẵn)
5. ✅ Click **Submit Application**
6. ✅ Kiểm tra:
   - Console: "✅ Application submitted successfully"
   - Alert: "Đơn xin chuyển vai trò đã được gửi!"
   - Tab "My Applications" hiển thị đơn vừa gửi với status "pending"

#### B. Test Admin xem và duyệt đơn:
1. ✅ Logout → Đăng nhập với tài khoản **admin**
   - Email: `admin@example.com`
   - Password: (password bạn đã set)
2. ✅ Vào **Admin Dashboard** → Click "Đơn xin vai trò" (role-applications)
3. ✅ Kiểm tra:
   - Tab "Đang chờ duyệt (0)" → Phải hiển thị số lượng đơn pending
   - Không còn lỗi "Không thể tải danh sách đơn"
   - Hiển thị danh sách đơn với đầy đủ thông tin:
     * User ID, Email, Full Name
     * Requested Role (seller/shipper)
     * Reason
     * Shop info (nếu là seller)
     * Created At
4. ✅ Click "Duyệt" hoặc "Từ chối":
   - Nhập note/lý do
   - Click confirm
   - Kiểm tra thông báo: "Đã duyệt đơn thành công!" hoặc "Đã từ chối đơn"
5. ✅ Kiểm tra database:
```sql
SELECT id, user_id, requested_role, status, created_at, reviewed_at 
FROM role_applications 
ORDER BY created_at DESC;
```

---

## 🐛 Nếu vẫn lỗi:

### Lỗi: "Không thể tải danh sách đơn"
**Nguyên nhân:** Bảng chưa được tạo trong database

**Giải pháp:**
```sql
-- Chạy trực tiếp trong SSMS hoặc sqlcmd:
USE Foodiez;
GO

-- Tạo bảng
CREATE TABLE [dbo].[role_applications](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [user_id] [int] NOT NULL,
    [requested_role] [nvarchar](50) NOT NULL,
    [status] [nvarchar](50) NOT NULL,
    [reason] [nvarchar](max) NULL,
    [admin_note] [nvarchar](max) NULL,
    [reviewed_by] [int] NULL,
    [created_at] [datetime2](7) NULL,
    [reviewed_at] [datetime2](7) NULL,
    [shop_name] [nvarchar](255) NULL,
    [shop_address] [nvarchar](max) NULL,
    [shop_description] [nvarchar](max) NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);

-- Add foreign keys
ALTER TABLE [dbo].[role_applications] WITH CHECK 
ADD FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([id]);

ALTER TABLE [dbo].[role_applications] WITH CHECK 
ADD FOREIGN KEY([reviewed_by]) REFERENCES [dbo].[users] ([id]);

-- Add constraints
ALTER TABLE [dbo].[role_applications] WITH CHECK 
ADD CHECK (([status]='rejected' OR [status]='approved' OR [status]='pending'));

ALTER TABLE [dbo].[role_applications] WITH CHECK 
ADD CHECK (([requested_role]='shipper' OR [requested_role]='seller'));
GO
```

---

### Lỗi: "401 Unauthorized" hoặc "403 Forbidden"
**Nguyên nhân:** Token không đúng hoặc user không có quyền

**Giải pháp:**
1. Kiểm tra token trong localStorage:
```javascript
// Mở Chrome DevTools Console
console.log('Token:', localStorage.getItem('authToken'));
```
2. Logout và login lại
3. Kiểm tra role của user trong database:
```sql
SELECT id, email, role FROM users WHERE email = 'admin@example.com';
-- role phải là 'admin'
```

---

## 📝 Backend API Endpoints:

### User endpoints (authenticated):
- `POST /api/role-applications/apply` - Gửi đơn xin chuyển vai trò
- `GET /api/role-applications/my-applications` - Xem đơn của mình

### Admin endpoints (admin only):
- `GET /api/role-applications/pending` - Lấy đơn pending
- `GET /api/role-applications/all` - Lấy tất cả đơn
- `POST /api/role-applications/{id}/approve` - Duyệt đơn
- `POST /api/role-applications/{id}/reject` - Từ chối đơn

---

## ✅ Checklist hoàn thành:
- [x] Sửa token key trong RoleApplications.jsx (3 chỗ)
- [x] Sửa token key trong CustomerProfile.jsx (2 chỗ)
- [x] Tạo script check_role_applications_table.sql
- [ ] Chạy script tạo bảng trong database
- [ ] Restart backend và frontend
- [ ] Test user gửi đơn
- [ ] Test admin xem và duyệt đơn

---

## 🎯 Kết quả mong đợi:
✅ User gửi đơn thành công
✅ Admin xem được danh sách đơn
✅ Admin duyệt/từ chối đơn thành công
✅ User role được cập nhật sau khi duyệt
✅ Shop được tạo tự động nếu apply seller

---

**📌 LƯU Ý:** Bảng `role_applications` phải tồn tại trong database trước khi test!
