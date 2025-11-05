# Seller API Documentation

## Base URL
```
http://localhost:8080/api/seller
```

## Authentication
All endpoints require `SELLER` or `ADMIN` role with JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📊 Dashboard

### GET /dashboard/{shopId}
Get comprehensive dashboard statistics for seller.

**Parameters:**
- `shopId` (path): Shop ID

**Response:**
```json
{
  "success": true,
  "message": "Dashboard loaded successfully",
  "data": {
    "totalOrders": 150,
    "todayOrders": 12,
    "totalRevenue": 45000000.00,
    "todayRevenue": 2500000.00,
    "pendingOrders": 5,
    "completedOrders": 140,
    "cancelledOrders": 5,
    "totalProducts": 25,
    "activeProducts": 23,
    "totalCustomers": 78
  }
}
```

---

## 📦 Orders Management

### GET /orders/{shopId}
Get all orders for seller's shop with optional status filter.

**Parameters:**
- `shopId` (path): Shop ID
- `status` (query, optional): Order status (pending, confirmed, preparing, shipping, delivered, cancelled)

**Example:**
```
GET /api/seller/orders/1
GET /api/seller/orders/1?status=pending
```

**Response:**
```json
{
  "success": true,
  "message": "Orders loaded successfully",
  "data": [
    {
      "id": 45,
      "buyerId": 12,
      "buyerName": "Nguyen Van A",
      "recipientName": "Nguyen Van A",
      "recipientPhone": "0912345678",
      "addressText": "123 Nguyen Hue, Da Nang",
      "totalAmount": 350000.00,
      "status": "pending",
      "notes": "Please deliver before 5 PM",
      "createdAt": "2024-10-28T09:30:00",
      "items": [
        {
          "productName": "Pho Bo",
          "quantity": 2,
          "unitPrice": 50000.00
        },
        {
          "productName": "Tra Da",
          "quantity": 2,
          "unitPrice": 10000.00
        }
      ]
    }
  ]
}
```

### GET /orders/detail/{orderId}
Get detailed information about a specific order.

**Parameters:**
- `orderId` (path): Order ID

### PUT /orders/{orderId}/status
Update order status.

**Parameters:**
- `orderId` (path): Order ID

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Order confirmed, preparing food"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": 45,
    "status": "confirmed",
    "updatedAt": "2024-10-28T10:00:00"
  }
}
```

**Status Flow:**
```
pending → confirmed → preparing → shipping → delivered
                    ↘ cancelled (can cancel anytime before shipping)
```

---

## 💰 Revenue Statistics

### GET /revenue/{shopId}
Get revenue statistics (default: last 30 days).

**Parameters:**
- `shopId` (path): Shop ID
- `startDate` (query, optional): Start date
- `endDate` (query, optional): End date

### GET /revenue/{shopId}/daily?days={days}
Get daily revenue for specified number of days.

**Parameters:**
- `shopId` (path): Shop ID
- `days` (query, default=7): Number of days (7, 30, 60, 90)

**Response:**
```json
{
  "success": true,
  "message": "Daily revenue loaded successfully",
  "data": {
    "totalRevenue": 8500000.00,
    "totalOrders": 75,
    "revenueList": [
      {
        "date": "21/10",
        "month": null,
        "revenue": 1200000.00,
        "orderCount": 10
      },
      {
        "date": "22/10",
        "month": null,
        "revenue": 1350000.00,
        "orderCount": 12
      }
    ]
  }
}
```

### GET /revenue/{shopId}/monthly?year={year}
Get monthly revenue for specified year.

**Parameters:**
- `shopId` (path): Shop ID
- `year` (query, optional): Year (default: current year)

**Response:**
```json
{
  "success": true,
  "message": "Monthly revenue loaded successfully",
  "data": {
    "totalRevenue": 125000000.00,
    "totalOrders": 850,
    "revenueList": [
      {
        "date": null,
        "month": "Tháng 1",
        "revenue": 8500000.00,
        "orderCount": 65
      },
      {
        "date": null,
        "month": "Tháng 2",
        "revenue": 9200000.00,
        "orderCount": 72
      }
    ]
  }
}
```

---

## 👥 Customers Management

### GET /customers/{shopId}
Get all customers who purchased from this shop.

**Parameters:**
- `shopId` (path): Shop ID

**Response:**
```json
{
  "success": true,
  "message": "Customers loaded successfully",
  "data": [
    {
      "id": 12,
      "fullName": "Nguyen Van A",
      "email": "nguyenvana@example.com",
      "phone": "0912345678",
      "totalOrders": 15,
      "totalSpent": 4500000.00,
      "lastOrderDate": "2024-10-28T09:30:00"
    }
  ]
}
```

### GET /customers/{shopId}/top?limit={limit}
Get top customers by total spending.

**Parameters:**
- `shopId` (path): Shop ID
- `limit` (query, default=10): Number of top customers

**Response:** Same as GET /customers/{shopId}, sorted by totalSpent descending

---

## 🍽️ Products Statistics

### GET /products/{shopId}/stats
Get product statistics for shop.

**Parameters:**
- `shopId` (path): Shop ID

### GET /products/{shopId}/best-selling?limit={limit}
Get best selling products by quantity sold.

**Parameters:**
- `shopId` (path): Shop ID
- `limit` (query, default=10): Number of products

**Response:**
```json
{
  "success": true,
  "message": "Best selling products loaded successfully",
  "data": [
    {
      "id": 23,
      "name": "Pho Bo",
      "totalSold": 350,
      "revenue": 17500000.00,
      "imageUrl": "http://localhost:8080/uploads/product-images/pho-bo.jpg"
    },
    {
      "id": 45,
      "name": "Banh Mi Thit",
      "totalSold": 280,
      "revenue": 7000000.00,
      "imageUrl": "http://localhost:8080/uploads/product-images/banh-mi.jpg"
    }
  ]
}
```

---

## ⭐ Reviews

### GET /reviews/{shopId}?type={type}
Get reviews for shop and products.

**Parameters:**
- `shopId` (path): Shop ID
- `type` (query, default=all): Review type (all, product, shop)

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

**Common HTTP Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Invalid parameters or data
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Database Schema Reference

### Orders Table
```sql
- id (INT, PK)
- buyer_id (INT, FK to users)
- shop_id (INT, FK to shops)
- delivery_address_id (INT)
- total_amount (DECIMAL)
- status (VARCHAR): pending, confirmed, preparing, shipping, delivered, cancelled
- voucher_id (INT, nullable)
- notes (NVARCHAR)
- order_code (INT)
- recipient_name (NVARCHAR)
- recipient_phone (NVARCHAR)
- address_text (NVARCHAR)
- latitude, longitude (DECIMAL)
- created_at (DATETIME2)
- updated_at (DATETIME2)
```

### Order Items Table
```sql
- id (INT, PK)
- order_id (INT, FK to orders)
- product_id (INT, FK to products)
- quantity (INT)
- unit_price (DECIMAL)
```

---

## Testing with Postman/Insomnia

1. **Login to get JWT token:**
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "seller@example.com",
  "password": "password123"
}
```

2. **Use token in subsequent requests:**
```
GET http://localhost:8080/api/seller/dashboard/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Notes

- All dates are in ISO 8601 format: `yyyy-MM-ddTHH:mm:ss`
- All amounts are in VND (Vietnamese Dong)
- Revenue statistics exclude cancelled orders
- Customer stats only include completed orders
- Best selling products are sorted by quantity sold, not revenue

### ⚠️ Important: Food Delivery Model

**This is a FOOD DELIVERY app, NOT inventory management:**

- ❌ NO stock/inventory tracking
- ✅ Products have `is_available` (có thể nấu) and `status` (trạng thái)
- ✅ Orders are prepared AFTER customer places order
- ✅ Status `out_of_stock` means "hết nguyên liệu" (out of ingredients), not inventory

**Product Status:**
- `active` - Đang bán (available to order)
- `inactive` - Tạm ngừng (temporarily stopped)
- `out_of_stock` - Hết nguyên liệu (out of ingredients)

See `FOOD_DELIVERY_MODEL.md` for detailed explanation.

---

## Frontend Integration

The React frontend has already been set up to use these APIs. See:
- `foodsystem/src/api/seller.js` - API client
- `foodsystem/src/components/SellerComponent/SellerDashboard.jsx` - Dashboard
- `foodsystem/src/components/SellerComponent/SellerOrders.jsx` - Orders
- `foodsystem/src/components/SellerComponent/SellerRevenue.jsx` - Revenue
- `foodsystem/src/components/SellerComponent/SellerCustomers.jsx` - Customers

