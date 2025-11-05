# Foodiez - New Features Implementation

## Tổng quan các tính năng mới

### 1. 🚫 Admin Ban Shop với Rating Thấp
Admin có thể ban các shop có rating dưới 2.5 sao với lý do cụ thể.

**Entity Changes:**
- `Shop`: Thêm `isBanned`, `banReason`

**API Endpoints:**
- `GET /admin/shops` - Lấy danh sách tất cả shops
- `GET /admin/shops/low-rating` - Lấy shops có rating < 2.5
- `POST /admin/shops/{id}/ban` - Ban shop (body: `{reason}`)
- `POST /admin/shops/{id}/unban` - Unban shop

**Lý do ban:**
- Rating dưới 2.5 sao
- Đánh giá thấp từ khách hàng
- Địa chỉ không đúng với đăng ký

---

### 2. 🎟️ Voucher System Upgrade
Cải tiến hệ thống voucher với giới hạn số lượng và mỗi user chỉ được sử dụng 1 lần.

**Entity Changes:**
- `Voucher`: Thêm `quantity` (số lượng voucher khả dụng)
- Validation: Check quantity > 0 trước khi hiển thị

**Logic:**
- User chỉ được claim 1 voucher 1 lần (đã có kiểm tra)
- Khi claim voucher, `quantity` giảm đi 1
- Khi `quantity = 0`, voucher không hiển thị nữa
- User không thể claim voucher đã hết số lượng

**API Endpoints:**
- `GET /api/vouchers` - Lấy vouchers có `quantity > 0`
- `POST /api/vouchers/claim` - Claim voucher (giảm quantity)
- `GET /api/vouchers/user/{userId}/available` - Lấy vouchers khả dụng của user

**Cách tạo voucher với quantity:**
```json
POST /admin/vouchers
{
  "code": "SUMMER2024",
  "discount": 20,
  "expiryDate": "2024-12-31",
  "quantity": 100,
  "maxUses": null
}
```

---

### 3. 👥 Role Application System
Customer có thể apply để chuyển role thành Seller hoặc Shipper.

**Entity:**
- `RoleApplication`:
  - `userId` - User apply
  - `requestedRole` - 'seller' hoặc 'shipper'
  - `status` - 'pending', 'approved', 'rejected'
  - `reason` - Lý do apply từ user
  - `adminNote` - Ghi chú từ admin
  - `reviewedBy` - Admin ID
  - `shopName`, `shopAddress`, `shopDescription` - Cho seller

**Customer APIs:**
```
POST /api/role-applications/apply
Body: {
  "requestedRole": "seller|shipper",
  "reason": "Lý do apply",
  "shopName": "Tên shop" (nếu seller),
  "shopAddress": "Địa chỉ" (nếu seller),
  "shopDescription": "Mô tả" (nếu seller)
}

GET /api/role-applications/my-applications
- Xem các đơn apply của mình
```

**Admin APIs:**
```
GET /api/role-applications/pending
- Xem các đơn đang chờ duyệt

GET /api/role-applications/all
- Xem tất cả đơn apply

POST /api/role-applications/{id}/approve
Body: { "note": "Ghi chú" }
- Approve đơn: User sẽ được chuyển role
- Nếu seller: Tự động tạo shop

POST /api/role-applications/{id}/reject
Body: { "reason": "Lý do từ chối" }
- Reject đơn: User không được chuyển role
- Thông báo lý do cho user
```

**Flow:**
1. Customer submit application
2. Admin review application
3. Nếu approve:
   - User role được chuyển
   - Nếu seller: Shop được tạo tự động
   - User nhận thông báo approved
4. Nếu reject:
   - User role không thay đổi
   - User nhận thông báo với lý do reject

---

### 4. ✅ Product Approval System
Seller phải submit sản phẩm để admin duyệt trước khi hiển thị.

**Entity Changes:**
- `Product`: Thêm `approvalStatus`, `rejectionReason`
  - `approvalStatus`: 'pending', 'approved', 'rejected'
  - Default: 'pending' khi tạo mới

**Seller Flow:**
1. Seller tạo product
2. Product có `approvalStatus = 'pending'`
3. Chỉ hiển thị với seller, chưa hiển thị công khai
4. Chờ admin duyệt

**Admin APIs:**
```
GET /admin/products/pending
- Lấy danh sách products đang chờ duyệt

POST /admin/products/{id}/approve
- Duyệt product: approvalStatus = 'approved'
- Product được hiển thị công khai

POST /admin/products/{id}/reject
Body: { "reason": "Lý do từ chối" }
- Từ chối product: approvalStatus = 'rejected'
- Seller nhận được lý do
```

**Product Display Logic:**
- Public: Chỉ hiển thị products có `approvalStatus = 'approved'`
- Seller: Hiển thị tất cả products của mình (pending, approved, rejected)
- Admin: Hiển thị tất cả products

---

## 🗄️ Database Migration

Chạy file `database_migration.sql` để update database schema:

```bash
# Kết nối SQL Server và chạy:
sqlcmd -S localhost -U sa -P your_password -d food_delivery_db6 -i database_migration.sql
```

Hoặc copy nội dung file và chạy trong SQL Server Management Studio.

---

## 🚀 Testing

### 1. Test Ban Shop
```bash
# Login as admin
POST /auth/login
{ "email": "admin@test.com", "password": "admin123" }

# Get shops with low rating
GET /admin/shops/low-rating

# Ban a shop
POST /admin/shops/1/ban
{ "reason": "Rating dưới 2.5 sao, nhiều khiếu nại" }

# Unban a shop
POST /admin/shops/1/unban
```

### 2. Test Voucher với Quantity
```bash
# Admin tạo voucher
POST /admin/vouchers
{
  "code": "TEST100",
  "discount": 10,
  "expiryDate": "2024-12-31",
  "quantity": 2,
  "maxUses": null
}

# User 1 claim voucher (quantity: 2 -> 1)
POST /api/vouchers/claim
{ "userId": 1, "voucherCode": "TEST100" }

# User 2 claim voucher (quantity: 1 -> 0)
POST /api/vouchers/claim
{ "userId": 2, "voucherCode": "TEST100" }

# User 3 không thể claim (out of stock)
POST /api/vouchers/claim
{ "userId": 3, "voucherCode": "TEST100" }
# => Error: "Voucher is out of stock"

# Voucher không hiển thị trong active vouchers nữa
GET /api/vouchers
# => Không có TEST100
```

### 3. Test Role Application
```bash
# Customer apply for seller
POST /api/role-applications/apply
{
  "requestedRole": "seller",
  "reason": "Tôi muốn bán đồ ăn",
  "shopName": "Quán Phở Ngon",
  "shopAddress": "123 Đường ABC",
  "shopDescription": "Phở bò truyền thống"
}

# Admin xem pending applications
GET /api/role-applications/pending

# Admin approve
POST /api/role-applications/1/approve
{ "note": "Đơn hợp lệ, chấp nhận" }

# Check user role
GET /auth/me
# => role: "seller"

# Check shop created
GET /api/shops/seller/1
# => Shop "Quán Phở Ngon" exists
```

### 4. Test Product Approval
```bash
# Seller tạo product
POST /api/products
{
  "name": "Phở Bò",
  "price": 50000,
  "shopId": 1,
  "categoryId": 1
}
# => approvalStatus: "pending"

# Admin xem pending products
GET /admin/products/pending

# Admin approve
POST /admin/products/1/approve
# => approvalStatus: "approved"

# Product hiển thị công khai
GET /api/products
# => Có "Phở Bò"
```

---

## 📝 Notes

### Voucher Quantity vs Max Uses
- `quantity`: Số lượng voucher có sẵn để claim
- `maxUses`: Số lần tối đa mỗi voucher có thể được sử dụng

**Ví dụ:**
- Voucher có `quantity = 100`, `maxUses = 1`
  - 100 users có thể claim
  - Mỗi user chỉ dùng 1 lần

- Voucher có `quantity = NULL`, `maxUses = 50`
  - Unlimited users có thể claim
  - Nhưng chỉ được dùng 50 lần total

### Role Application Flow
1. **Customer → Admin**: Apply for role
2. **Admin review**: Check requirements
3. **Approve**: User role changed + Shop created (if seller)
4. **Reject**: User notified with reason

### Product Approval Flow
1. **Seller creates product**: `approvalStatus = 'pending'`
2. **Admin reviews**: Check product quality
3. **Approve**: Product goes live
4. **Reject**: Seller notified with reason

---

## 🔒 Security

- All admin endpoints require admin role
- Role applications validated before processing
- Shop ban requires reason
- Product rejection requires reason
- User can only see their own applications

---

## 💡 Future Enhancements

1. **Notification System**: Thông báo real-time cho user
2. **Email Notifications**: Gửi email khi application approved/rejected
3. **Shop Appeal**: Shop có thể appeal khi bị ban
4. **Product Edit After Rejection**: Seller có thể sửa và resubmit
5. **Auto-ban**: Tự động ban shop khi rating < 2.5
6. **Voucher Analytics**: Thống kê sử dụng voucher

---

## 📞 Contact

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ dev team.
