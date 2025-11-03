# 🍽️ Food Delivery Business Model

## Đặc điểm của hệ thống

Đây là **Food Delivery App** (ứng dụng giao đồ ăn), KHÔNG phải E-commerce với quản lý tồn kho.

---

## 📦 Quy trình hoạt động

### 1. **Khách hàng đặt món**
```
Khách hàng chọn món → Đặt hàng → Thanh toán
```

### 2. **Merchant nhận đơn và chế biến**
```
Nhận đơn → Xác nhận → Nấu món ăn → Đóng gói → Giao cho shipper
```

### 3. **Giao hàng**
```
Shipper nhận → Giao đến khách hàng → Hoàn thành đơn
```

---

## 🎯 Không có tồn kho (No Inventory)

### ❌ **KHÔNG sử dụng:**
- `inventory` (hàng tồn kho)
- `stock_quantity` (số lượng tồn)
- `totalStock` (tổng tồn kho)
- Warehouse management
- Stock counting

### ✅ **SỬ DỤNG thay thế:**

#### 1. **`is_available` (Boolean)**
Món có sẵn để nấu không?
- `true` - Có thể nhận order và nấu
- `false` - Tạm thời không nhận order

**Ví dụ:**
```json
{
  "name": "Phở Bò",
  "is_available": true  // Có thể đặt món
}
```

#### 2. **`status` (Enum)**
Trạng thái bán hàng của món ăn:

| Status | Ý nghĩa | UI Display |
|--------|---------|------------|
| `active` | Đang bán | ✅ Đang bán |
| `inactive` | Tạm ngừng bán | ⏸️ Tạm ngừng |
| `out_of_stock` | Hết nguyên liệu | 🚫 Hết nguyên liệu |

**Ví dụ:**
```json
{
  "name": "Bún Chả",
  "status": "active",  // Đang bán
  "is_available": true
}
```

```json
{
  "name": "Gà Nướng", 
  "status": "out_of_stock",  // Hết nguyên liệu (hết thịt gà)
  "is_available": false
}
```

---

## 🔄 Status Flow (Luồng trạng thái)

### Món ăn (Product Status):
```
active (đang bán bình thường)
   ↓
inactive (merchant tạm ngừng - vd: nghỉ giữa giờ)
   ↓
out_of_stock (hết nguyên liệu - vd: hết thịt)
   ↓
active (nhập thêm nguyên liệu, mở bán lại)
```

### Đơn hàng (Order Status):
```
pending (chờ xác nhận)
   ↓
confirmed (đã xác nhận)
   ↓
preparing (đang nấu)
   ↓
shipping (đang giao)
   ↓
delivered (đã giao)

Có thể cancelled (hủy) bất cứ lúc nào trước shipping
```

---

## 💡 Use Cases

### **Case 1: Món bán chạy, hết nguyên liệu**
```javascript
// Merchant hết thịt bò để nấu phở
{
  "name": "Phở Bò",
  "status": "out_of_stock",  // Hết nguyên liệu
  "is_available": false       // Không nhận order
}

// Khách hàng: Thấy "🚫 Hết nguyên liệu", không thể đặt
// Merchant: Sẽ nhập nguyên liệu và update status → "active"
```

### **Case 2: Nghỉ giữa giờ**
```javascript
// Quán nghỉ 14h-17h
{
  "name": "Cơm Tấm",
  "status": "inactive",    // Tạm ngừng bán
  "is_available": false
}

// Khách hàng: Thấy "⏸️ Tạm ngừng bán"
// 17h merchant mở lại → status = "active"
```

### **Case 3: Món đặc biệt chỉ bán vào cuối tuần**
```javascript
// Thứ 2-5: inactive
// Thứ 6-7, CN: active
{
  "name": "Lẩu Thái",
  "status": "active",      // Cuối tuần
  "is_available": true
}
```

---

## 📊 Dashboard Metrics

### ❌ **KHÔNG dùng:**
```javascript
{
  "totalStock": 500,        // SAI - không có tồn kho
  "lowStockItems": 10,      // SAI - không có cảnh báo tồn kho
  "stockValue": 50000000    // SAI - không có giá trị tồn
}
```

### ✅ **ĐÚNG - Dùng:**
```javascript
{
  "totalProducts": 50,           // Tổng số món ăn
  "activeProducts": 45,          // Món đang bán
  "inactiveProducts": 3,         // Món tạm ngừng
  "outOfStockProducts": 2,       // Món hết nguyên liệu
  
  "totalOrders": 150,            // Tổng đơn hàng
  "todayOrders": 25,             // Đơn hôm nay
  "pendingOrders": 5,            // Đơn chờ xác nhận
  
  "totalRevenue": 45000000,      // Tổng doanh thu
  "todayRevenue": 2500000,       // Doanh thu hôm nay
  
  "totalCustomers": 78           // Số khách hàng
}
```

---

## 🗄️ Database Schema

### Products Table
```sql
CREATE TABLE products (
    id INT PRIMARY KEY,
    shop_id INT,
    name NVARCHAR(255),
    description NVARCHAR(MAX),
    price DECIMAL(10,2),
    
    -- Trạng thái có sẵn
    is_available BIT DEFAULT 1,
    
    -- Trạng thái bán hàng
    status NVARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    
    image_url NVARCHAR(500),
    category_id INT,
    created_at DATETIME2,
    updated_at DATETIME2
    
    -- ❌ KHÔNG có: stock_quantity, min_stock, max_stock
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY,
    buyer_id INT,
    shop_id INT,
    total_amount DECIMAL(10,2),
    
    -- Trạng thái đơn hàng
    status NVARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'preparing', 
                         'shipping', 'delivered', 'cancelled')),
    
    recipient_name NVARCHAR(100),
    recipient_phone NVARCHAR(20),
    address_text NVARCHAR(MAX),
    notes NVARCHAR(MAX),
    created_at DATETIME2
);
```

---

## 🎨 UI/UX Guidelines

### Merchant View (Seller Dashboard):
```
✅ Đang bán: 45 món
⏸️ Tạm ngừng: 3 món  
🚫 Hết nguyên liệu: 2 món

[Món ăn bán chạy]
1. Phở Bò - 350 đã bán
2. Bánh Mì - 280 đã bán

[Đơn hàng hôm nay: 25]
- Chờ xác nhận: 5
- Đang nấu: 8
- Đang giao: 10
- Hoàn thành: 2
```

### Customer View:
```
[Phở Bò]  50,000đ
✓ Có thể đặt
[+ Thêm vào giỏ]

[Bún Chả]  45,000đ
🚫 Hết nguyên liệu
[Không thể đặt]

[Cơm Tấm]  40,000đ
⏸️ Tạm ngừng bán
[Không thể đặt]
```

---

## 🔧 API Endpoints

### Update Product Availability
```http
PUT /api/products/{id}
{
  "status": "out_of_stock",  // Hết nguyên liệu
  "is_available": false
}
```

### Get Available Products
```http
GET /api/products?is_available=true&status=active
```

### Order Flow
```http
# 1. Customer creates order
POST /api/orders
{
  "items": [
    {"productId": 1, "quantity": 2}  // Không cần check stock
  ]
}

# 2. Merchant confirms
PUT /api/seller/orders/{orderId}/status
{"status": "confirmed"}

# 3. Merchant prepares (nấu món)
PUT /api/seller/orders/{orderId}/status
{"status": "preparing"}

# 4. Ready for shipping
PUT /api/seller/orders/{orderId}/status
{"status": "shipping"}
```

---

## 🎯 Best Practices

### 1. **Real-time Updates**
- Merchant update status ngay khi hết nguyên liệu
- Customer thấy realtime (WebSocket/Polling)

### 2. **Smart Status Management**
```javascript
// Tự động inactive nếu quán đóng cửa
if (currentTime < openingHours || currentTime > closingHours) {
  updateAllProducts({ is_available: false });
}
```

### 3. **Customer Experience**
- Hiển thị rõ lý do không thể đặt
- Suggest món thay thế
- Notify khi món có lại

### 4. **Merchant Tools**
- Quick toggle ON/OFF bán hàng
- Bulk update status cho nhiều món
- Set schedule (vd: chỉ bán cuối tuần)

---

## 📝 Summary

| Feature | E-Commerce | Food Delivery (This App) |
|---------|-----------|-------------------------|
| Inventory | ✅ Có tồn kho | ❌ Không có |
| Stock Count | ✅ Đếm số lượng | ❌ Không đếm |
| Prepare Time | ❌ Ship luôn | ✅ Nấu mới |
| Freshness | - | ✅ Quan trọng |
| Availability | Based on stock | Based on nguyên liệu |
| Order Flow | Pick → Pack → Ship | Confirm → Cook → Ship |

**Key Concept:**
> Khách đặt món → Merchant nấu món → Giao hàng tươi ngon! 🍜




