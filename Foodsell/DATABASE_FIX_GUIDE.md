# 🔧 HƯỚNG DẪN FIX DATABASE SCHEMA

## 🚨 **VẤN ĐỀ HIỆN TẠI**

Database của bạn có **2 bảng review khác nhau**:
- `reviews` - cho product reviews
- `shop_reviews` - cho shop reviews

Nhưng Hibernate chỉ có **1 entity `Review`**, gây ra xung đột!

## ✅ **GIẢI PHÁP**

### **Bước 1: Chạy Script Fix Database**

1. Mở **SQL Server Management Studio**
2. Kết nối đến database `food_delivery_db6`
3. Mở file `fix_database_schema.sql`
4. **Chạy toàn bộ script**

### **Bước 2: Kiểm Tra Kết Quả**

Script sẽ:
- ✅ Backup dữ liệu cũ
- ✅ Xóa 2 bảng cũ (`reviews`, `shop_reviews`)
- ✅ Tạo bảng `reviews` mới phù hợp với Hibernate
- ✅ Tạo bảng `review_replies` mới
- ✅ Migrate dữ liệu từ bảng cũ
- ✅ Cập nhật shop ratings

### **Bước 3: Restart Backend**

Sau khi chạy script thành công:

```bash
cd D:\SWP391\Foodiez\Foodsell\demo
.\mvnw.cmd spring-boot:run
```

## 📋 **CẤU TRÚC MỚI**

### **Bảng `reviews`**
```sql
- id (int, identity, primary key)
- customer_id (int, foreign key to users)
- product_id (int, foreign key to products) 
- shop_id (int, foreign key to shops)
- order_id (int, foreign key to orders, nullable)
- rating (int, 1-5)
- content (nvarchar(max), nullable)
- is_visible (bit, default 1)
- created_at (datetime2, default getdate())
- updated_at (datetime2, default getdate())
```

### **Bảng `review_replies`**
```sql
- id (int, identity, primary key)
- review_id (int, foreign key to reviews)
- merchant_id (int, foreign key to users)
- content (nvarchar(max))
- created_at (datetime2, default getdate())
- updated_at (datetime2, default getdate())
```

## 🎯 **KẾT QUẢ MONG ĐỢI**

Sau khi fix:
- ✅ Không còn xung đột với Hibernate
- ✅ Review API hoạt động bình thường
- ✅ Products API hoạt động bình thường
- ✅ Frontend load được sản phẩm và reviews

## ⚠️ **LƯU Ý**

- Script sẽ **backup dữ liệu cũ** trước khi thay đổi
- Nếu có lỗi, có thể restore từ bảng backup
- Đảm bảo **không có kết nối active** đến database khi chạy script

## 🆘 **NẾU GẶP LỖI**

1. Kiểm tra SQL Server service đang chạy
2. Đảm bảo có quyền admin trên database
3. Kiểm tra không có foreign key constraints đang block
4. Chạy từng phần script nếu cần

---

**Chạy script này sẽ fix hoàn toàn vấn đề xung đột với Hibernate!** 🚀
