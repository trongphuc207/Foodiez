# HỆ THỐNG KHIẾU NẠI (COMPLAINT SYSTEM) - HƯỚNG DẪN IMPLEMENTATION

## 📋 TỔNG QUAN

Hệ thống khiếu nại cho phép Customer, Seller, và Shipper gửi đơn khiếu nại với bằng chứng (hình ảnh). Admin có thể xem chi tiết và quyết định chấp nhận hoặc từ chối khiếu nại.

## 🗂️ CẤU TRÚC DATABASE

### 1. Bảng `complaints` - Thông tin khiếu nại chính
- **complaint_number**: Mã đơn khiếu nại (CPL-YYYYMMDD-XXXXX)
- **complainant_id**: ID người khiếu nại
- **complainant_type**: Loại người khiếu nại (customer/seller/shipper)
- **respondent_id**: ID người bị khiếu nại
- **respondent_type**: Loại người bị khiếu nại (customer/seller/shipper/admin/system)
- **category**: Loại khiếu nại (product_quality, delivery_issue, seller_service, etc.)
- **subject**: Tiêu đề
- **description**: Mô tả chi tiết
- **status**: Trạng thái (pending/under_review/resolved/rejected)
- **priority**: Mức độ ưu tiên (low/normal/high/urgent)
- **assigned_admin_id**: Admin phụ trách
- **admin_decision**: Quyết định (approved/rejected/needs_more_info)
- **related_order_id**: Đơn hàng liên quan (optional)
- **related_product_id**: Sản phẩm liên quan (optional)

### 2. Bảng `complaint_images` - Hình ảnh bằng chứng
- **complaint_id**: FK đến complaints
- **image_url**: URL hình ảnh
- **image_type**: Loại hình (evidence/product/delivery/other)
- **description**: Mô tả hình ảnh

### 3. Bảng `complaint_responses` - Trao đổi/phản hồi
- **complaint_id**: FK đến complaints
- **user_id**: Người phản hồi
- **user_role**: Vai trò (admin/customer/seller/shipper)
- **message**: Nội dung
- **is_internal_note**: Ghi chú nội bộ (chỉ admin thấy)

### 4. Bảng `complaint_categories` - Danh mục khiếu nại
Các loại khiếu nại:
- **product_quality**: Chất lượng sản phẩm
- **delivery_issue**: Vấn đề giao hàng
- **seller_service**: Dịch vụ người bán
- **shipper_service**: Dịch vụ shipper
- **payment_issue**: Vấn đề thanh toán
- **account_ban**: Khiếu nại khóa tài khoản
- **fraud_scam**: Lừa đảo
- **other**: Khác

## 🎯 CASE SỬ DỤNG

### Case 1: Customer khiếu nại Seller
```
Customer → Chọn đơn hàng → "Khiếu nại sản phẩm" 
→ Chọn loại: "Chất lượng sản phẩm"
→ Mô tả: "Sản phẩm bị hỏng, không giống hình"
→ Upload 3-5 ảnh bằng chứng
→ Gửi khiếu nại
→ Admin xem → Chấp nhận → Hoàn tiền cho customer
```

### Case 2: Seller khiếu nại Admin (Account Ban)
```
Seller bị khóa tài khoản oan
→ Vào trang Khiếu nại → "Tạo khiếu nại mới"
→ Chọn: "Khiếu nại khóa tài khoản"
→ Đối tượng: "Admin/System"
→ Mô tả: "Tài khoản bị khóa nhầm, tôi không vi phạm"
→ Upload bằng chứng (screenshot giao dịch sạch)
→ Admin xem xét → Mở khóa tài khoản nếu hợp lý
```

### Case 3: Customer khiếu nại Shipper
```
Customer → "Shipper giao hàng thái độ tệ, hàng bị móp méo"
→ Loại: "Vấn đề giao hàng"
→ Upload ảnh hàng bị hỏng
→ Admin xem → Liên hệ shipper → Xử lý kỷ luật
```

### Case 4: Shipper khiếu nại Customer
```
Shipper → "Customer không nhận hàng, không trả lời điện thoại"
→ Loại: "Khác"
→ Upload ảnh đã đến địa chỉ, cuộc gọi nhỡ
→ Admin xem → Liên hệ customer → Giải quyết
```

## 📱 FRONTEND COMPONENTS CẦN TẠO

### 1. **ComplaintListPage.jsx** (Customer/Seller/Shipper)
```javascript
// Hiển thị danh sách khiếu nại của user
// - Tab: "Đã gửi" (My Complaints)
// - Tab: "Liên quan đến tôi" (Complaints against me)
// - Bộ lọc: status, category, date
// - Button: "Tạo khiếu nại mới"
```

### 2. **CreateComplaintModal.jsx** (Customer/Seller/Shipper)
```javascript
// Form tạo khiếu nại mới
// - Select: Loại khiếu nại (category)
// - Select: Đối tượng khiếu nại (respondent) - danh sách user
// - Input: Tiêu đề
// - Textarea: Mô tả chi tiết
// - File upload: Hình ảnh bằng chứng (max 5 ảnh)
// - Optional: Chọn đơn hàng liên quan
```

### 3. **ComplaintDetailModal.jsx** (All users)
```javascript
// Xem chi tiết khiếu nại
// - Thông tin: Mã, Người khiếu nại, Đối tượng, Loại, Trạng thái
// - Nội dung: Tiêu đề, Mô tả
// - Hình ảnh: Gallery bằng chứng
// - Lịch sử phản hồi: Chat-like interface
// - Input: Thêm phản hồi
```

### 4. **AdminComplaintDashboard.jsx** (Admin)
```javascript
// Dashboard quản lý khiếu nại
// - Statistics cards: Pending, Under Review, Resolved, Rejected
// - Table: Danh sách khiếu nại
// - Bộ lọc: status, priority, category, date range
// - Actions: Assign to admin, Change status, View detail
```

### 5. **AdminComplaintDetail.jsx** (Admin)
```javascript
// Chi tiết khiếu nại cho admin
// - Thông tin đầy đủ (bao gồm cả complainant và respondent info)
// - Timeline: Lịch sử trao đổi
// - Actions:
//   + Assign to admin
//   + Change status (Under Review, Resolved, Rejected)
//   + Add admin note (internal)
//   + Make decision: Approve/Reject + reason
//   + Send message to complainant/respondent
```

## 🔧 BACKEND API ENDPOINTS

### User Endpoints (Customer/Seller/Shipper)
```
POST   /api/complaints                    - Tạo khiếu nại mới
GET    /api/complaints/my                 - Danh sách khiếu nại của tôi
GET    /api/complaints/against-me         - Khiếu nại liên quan đến tôi
GET    /api/complaints/{id}               - Chi tiết khiếu nại
POST   /api/complaints/{id}/response      - Thêm phản hồi
POST   /api/complaints/{id}/upload-image  - Upload hình ảnh
DELETE /api/complaints/{id}               - Xóa khiếu nại (chỉ pending)
```

### Admin Endpoints
```
GET    /api/admin/complaints              - Tất cả khiếu nại
GET    /api/admin/complaints/pending      - Khiếu nại chờ xử lý
GET    /api/admin/complaints/stats        - Thống kê
GET    /api/admin/complaints/{id}         - Chi tiết khiếu nại
PUT    /api/admin/complaints/{id}/assign  - Assign cho admin
PUT    /api/admin/complaints/{id}/status  - Cập nhật trạng thái
POST   /api/admin/complaints/{id}/decision - Quyết định (approve/reject)
POST   /api/admin/complaints/{id}/note    - Thêm ghi chú nội bộ
```

## 🚀 HƯỚNG DẪN IMPLEMENTATION

### Bước 1: Chạy SQL Script
```bash
cd demo
# Kết nối SQL Server và chạy
sqlcmd -S localhost -d Foodiez -i "create_complaints_system.sql"
```

### Bước 2: Verify Java Entities
Đã tạo 3 entities:
- ✅ `Complaint.java`
- ✅ `ComplaintImage.java`
- ✅ `ComplaintResponse.java`

### Bước 3: Tạo Service và Controller
Cần tạo:
- `ComplaintService.java` - Business logic
- `ComplaintController.java` - User endpoints
- `AdminComplaintController.java` - Admin endpoints
- `ComplaintImageService.java` - Upload/delete images

### Bước 4: Tạo Frontend Components
1. Tạo folder `src/components/ComplaintComponent`
2. Tạo các component theo danh sách trên
3. Tạo API service `src/api/complaint.js`
4. Thêm routes vào App.js
5. Thêm menu item vào Navigation

### Bước 5: Upload Image Configuration
- Tạo folder `demo/uploads/complaint-images/`
- Cấu hình Spring Boot file upload
- Maximum file size: 5MB per image
- Maximum 5 images per complaint

## 📊 WORKFLOW KHIẾU NẠI

```
1. User tạo khiếu nại → Status: PENDING
2. Admin xem và assign → Status: UNDER_REVIEW
3. Admin yêu cầu thêm thông tin → User cung cấp
4. Admin quyết định:
   - Chấp nhận → Status: RESOLVED, Decision: APPROVED
   - Từ chối → Status: REJECTED, Decision: REJECTED
5. Notification gửi đến complainant và respondent
```

## 🎨 UI/UX SUGGESTIONS

### Status Colors
- **Pending**: 🟡 Yellow (#fbbf24)
- **Under Review**: 🔵 Blue (#3b82f6)
- **Resolved**: 🟢 Green (#10b981)
- **Rejected**: 🔴 Red (#ef4444)

### Priority Colors
- **Low**: Gray
- **Normal**: Blue
- **High**: Orange
- **Urgent**: Red

### Image Gallery
- Lightbox để xem ảnh lớn
- Zoom in/out
- Download image

## 🔐 SECURITY & PERMISSIONS

### Customer
- ✅ Tạo khiếu nại
- ✅ Xem khiếu nại của mình
- ✅ Phản hồi khiếu nại của mình
- ❌ Xóa khiếu nại đã được admin xem

### Seller/Shipper
- ✅ Tạo khiếu nại
- ✅ Xem khiếu nại của mình
- ✅ Xem khiếu nại liên quan đến mình
- ✅ Phản hồi để giải trình

### Admin
- ✅ Xem tất cả khiếu nại
- ✅ Assign khiếu nại
- ✅ Cập nhật trạng thái
- ✅ Quyết định approve/reject
- ✅ Thêm ghi chú nội bộ
- ✅ Gửi tin nhắn cho các bên

## 📝 SAMPLE DATA

Sau khi chạy SQL script, bạn có thể tạo complaint test:
```sql
INSERT INTO complaints (
    complaint_number, complainant_id, complainant_type, 
    respondent_id, respondent_type, category, 
    subject, description, status, priority
) VALUES (
    'CPL-20251105-00001', 2, 'customer', 
    3, 'seller', 'product_quality',
    'Sản phẩm không đúng mô tả', 
    'Tôi đặt mua bánh mì nhưng nhận được bánh bao. Chất lượng kém.',
    'pending', 'high'
);
```

## ⏰ NOTIFICATION (OPTIONAL)

Gửi thông báo khi:
1. Có khiếu nại mới (gửi đến admin)
2. Admin yêu cầu thêm thông tin (gửi đến complainant)
3. Khiếu nại được giải quyết (gửi đến complainant và respondent)
4. Có phản hồi mới (gửi đến các bên liên quan)

---

## 🚦 NEXT STEPS

1. ✅ Chạy SQL script tạo tables
2. ⏳ Tạo ComplaintService.java
3. ⏳ Tạo ComplaintController.java  
4. ⏳ Tạo AdminComplaintController.java
5. ⏳ Tạo Frontend Components
6. ⏳ Test end-to-end workflow

Bạn có muốn tôi tiếp tục implement các phần tiếp theo không?
