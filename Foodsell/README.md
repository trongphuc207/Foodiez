# 🍔 Foodsell - Food Delivery Application

A comprehensive food delivery platform connecting customers, sellers, shippers, and administrators. Foodsell is a modern food delivery application built with React.js and Spring Boot, featuring real-time order tracking, AI-powered chatbot, and seamless payment integration.

**Project Status:** 70% Complete

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Main Features](#main-features)
- [Specific Logic Details](#specific-logic-details)
- [File Structure](#file-structure)
- [How to Run](#how-to-run)
- [Common Issues](#common-issues)
- [Additional Notes](#additional-notes)
- [License](#license)

---

## 🎯 Project Overview

### Application Description

**Foodsell** is a full-featured food delivery application that facilitates the entire food ordering and delivery process. Unlike traditional e-commerce platforms, Foodsell uses a **food delivery model** where products are prepared on-demand rather than managed through inventory systems.

### Key Characteristics

- **No Inventory Management**: Products use availability flags (`is_available`) instead of stock quantities
- **On-Demand Preparation**: Orders trigger product preparation at restaurants
- **Status-Based Workflow**: Orders progress through status flags (pending → confirmed → preparing → shipping → delivered)
- **Multi-Role System**: Four distinct user roles with specialized dashboards and functionalities

### User Roles

| Role | Description | Key Responsibilities |
|------|-------------|---------------------|
| **👤 Customer** | End users who browse and order food | Browse products, manage cart, place orders, track deliveries, write reviews, chat with sellers/shippers |
| **🏪 Seller** | Restaurant owners/managers | Manage products, process orders, update order status, view analytics, respond to reviews |
| **🚚 Shipper** | Delivery personnel | Accept delivery assignments, update delivery status, track routes, manage earnings |
| **👨‍💼 Admin** | System administrators | Oversee all operations, manage users, approve shops, handle disputes, view system-wide analytics |

### Business Model

The application follows a **food delivery model** where:
- Products have `is_available` boolean flags instead of `stock_quantity`
- Products can be in states: `ACTIVE` (available), `INACTIVE` (temporarily unavailable), or `OUT_OF_STOCK` (ingredients unavailable)
- Orders are created with `pending` status and progress through a defined workflow
- Real-time notifications keep all parties informed of order status changes

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React.js** | 19.1.1 | Core UI framework |
| **React Router DOM** | 6.30.1 | Client-side routing |
| **React Query** | 5.90.2 | Data fetching and caching |
| **Bootstrap** | 5.3.8 | CSS framework for responsive design |
| **Ant Design** | 5.27.4 | UI component library |
| **Styled Components** | 6.1.19 | CSS-in-JS styling |
| **Font Awesome** | 7.1.0 | Icon library |
| **React Icons** | 5.5.0 | Additional icon components |
| **SockJS & STOMP** | 7.2.1 | WebSocket client for real-time chat |
| **JWT Decode** | 4.0.0 | JWT token parsing |
| **@googlemaps/react-wrapper** | 1.2.0 | Google Maps integration |
| **@react-oauth/google** | 0.12.2 | Google OAuth2 authentication |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Spring Boot** | 3.2.0 | Main application framework |
| **Java** | 21 | Programming language |
| **Spring Data JPA** | 3.2.0 | Database abstraction layer |
| **Spring Security** | 3.2.0 | Authentication and authorization |
| **Spring WebSocket** | 3.2.0 | Real-time communication |
| **JWT (jjwt)** | 0.11.5 | Token-based authentication |
| **Lombok** | 1.18.32 | Boilerplate code reduction |
| **Spring Mail** | 3.2.0 | Email notifications |
| **Spring WebFlux** | 3.2.0 | Reactive HTTP client for PayOS integration |

### Database

| Database | Purpose | Notes |
|----------|---------|-------|
| **SQL Server** | Primary database | Recommended for production |
| **MySQL** | Alternative option | Supported via Maven dependency |

### Third-Party Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **PayOS** | Payment gateway | Client ID, API Key, Checksum Key required |
| **Google Gemini AI** | AI chatbot (gemini-2.5-flash) | API key required |
| **Google OAuth2** | Social login | Client ID and Secret required |
| **Gmail SMTP** | Email notifications | App password required |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Maven** | Dependency management and build tool |
| **Node.js/npm** | Frontend package management |
| **JaCoCo** | Code coverage analysis |

---

## ✨ Main Features

### 1. User Authentication & Authorization

**Description:** Secure authentication system with JWT tokens, Google OAuth2, and role-based access control.

**Input:**
- Email/password for traditional login
- Google account credentials for OAuth2
- Registration form data (name, email, password, phone)

**Process:**
1. User submits credentials
2. Backend validates credentials against database
3. JWT token generated with user role and ID
4. Token stored in localStorage (frontend) and sent in Authorization header
5. Protected routes check token validity and user role

**Output:**
- JWT token for authenticated sessions
- User profile data with role information
- Redirect to role-specific dashboard

---

### 2. Product Management (Seller)

**Description:** Sellers can create, update, and manage their product catalog with image uploads and availability flags.

**Input:**
- Product details (name, description, price, category)
- Product image (MultipartFile)
- Availability status (is_available boolean)

**Process:**
1. Seller uploads product image via `/api/products/{id}/upload-image`
2. FileUploadService validates and saves image to `uploads/product-images/`
3. Product entity created/updated with image URL
4. Product status set: `ACTIVE`, `INACTIVE`, or `OUT_OF_STOCK`

**Output:**
- Product saved with image URL
- Product list updated in seller dashboard
- Products visible to customers when `is_available = true`

---

### 3. Order Management & Status Workflow

**Description:** Comprehensive order lifecycle management with role-based status updates and real-time notifications.

**Input:**
- Cart items from customer
- Delivery address and recipient information
- Payment method selection

**Process:**

**Order Creation Flow:**
1. Customer adds items to cart
2. Checkout creates order with `status = "pending"`
3. PayOS payment link generated
4. Customer redirected to PayOS payment page

**Payment Webhook:**
5. PayOS sends webhook on payment success/failure
6. Backend updates order: `pending_payment` → `confirmed` (on success)
7. Order history entry created
8. Email notification sent to customer and seller

**Status Workflow:**
```
pending → confirmed → preparing → shipping → delivered
   ↓
cancelled (if payment fails or user cancels)
```

**Role-Based Updates:**
- **Seller:** Can update `confirmed` → `preparing` → `shipping`
- **Shipper:** Can update `shipping` → `delivered` (after pickup)
- **Customer:** Can cancel if status is `pending` or `confirmed`
- **System:** Auto-updates via PayOS webhook

**Output:**
- Order created with unique order code
- Real-time status updates via WebSocket
- Email notifications at each status change
- Order history tracking all status transitions

---

### 4. Shopping Cart Management

**Description:** Persistent shopping cart with local storage backup and real-time synchronization.

**Input:**
- Product ID and quantity
- Cart operations (add, update, remove)

**Process:**
1. Customer adds product to cart
2. Cart stored in React Context API
3. Cart data synced to backend via `/api/cart` endpoints
4. Cart persisted in localStorage for offline access
5. Cart restored on page reload

**Output:**
- Updated cart with items and totals
- Cart count badge in navigation
- Cart summary for checkout

---

### 5. Payment Integration (PayOS)

**Description:** Seamless payment processing using PayOS payment gateway with webhook verification.

**Input:**
- Order details (total amount, order code)
- Customer information

**Process:**
1. Checkout creates order with `pending_payment` status
2. PayOSService generates payment link using PayOS API
3. Customer redirected to PayOS payment page
4. After payment, PayOS sends webhook to `/api/payos/webhook`
5. Webhook handler verifies checksum
6. Order status updated to `confirmed` on success
7. Payment failure sets status to `cancelled`

**Output:**
- PayOS payment link
- Payment confirmation page
- Order status updated in database
- Email confirmation sent

---

### 6. Real-Time Chat System

**Description:** WebSocket-based real-time messaging between customers, sellers, and shippers.

**Input:**
- Message content and recipient ID
- File attachments (optional)

**Process:**
1. Client connects via SockJS/STOMP to `/ws/chat`
2. Messages sent to `/app/chat.sendMessage`
3. Backend broadcasts to recipient via WebSocket
4. Messages stored in database (conversations, messages tables)
5. Real-time delivery confirmation

**Output:**
- Instant message delivery
- Chat history persistence
- Online/offline status indicators
- File sharing support

---

### 7. AI-Powered Chatbot (Gemini)

**Description:** Intelligent chatbot using Google Gemini AI for product search, recommendations, and customer support.

**Input:**
- User query (text message)
- Context (user cart, browsing history)

**Process:**
1. User sends message to chatbot
2. Frontend calls `/api/gemini/chat` endpoint
3. GeminiService sends request to Google Gemini API (gemini-2.5-flash model)
4. AI processes query with product catalog context
5. Response includes product recommendations and actions
6. User can add products to cart directly from chatbot

**Output:**
- AI-generated responses
- Product recommendations
- Direct cart addition links
- Contextual assistance

---

### 8. Review & Rating System

**Description:** Customer reviews and ratings for products and shops with seller reply functionality.

**Input:**
- Rating (1-5 stars)
- Review text and optional image
- Product/Shop ID

**Process:**
1. Customer submits review after order delivery
2. Review saved with rating, text, and image URL
3. Product/Shop average rating recalculated
4. Seller can reply to reviews
5. Reviews displayed on product/shop pages

**Output:**
- Review saved and displayed
- Updated average ratings
- Seller reply functionality
- Review moderation (admin)

---

### 9. Voucher System

**Description:** Discount voucher management with validation and application during checkout.

**Input:**
- Voucher code
- Voucher details (discount type, value, expiry)

**Process:**
1. Admin/Seller creates voucher with code and discount rules
2. Customer applies voucher code at checkout
3. Backend validates voucher (expiry, usage limits, minimum order)
4. Discount applied to order total
5. Voucher usage tracked

**Output:**
- Discounted order total
- Voucher validation response
- Usage tracking

---

### 10. Delivery Address Management

**Description:** Multiple delivery address management with Google Maps integration.

**Input:**
- Address text, coordinates (latitude/longitude)
- Recipient name and phone

**Process:**
1. Customer adds address via Google Maps picker
2. Coordinates extracted from map selection
3. Address saved to delivery_addresses table
4. Address selected during checkout
5. Coordinates used for shipper route optimization

**Output:**
- Saved delivery addresses
- Map visualization
- Route calculation for shippers

---

### 11. Seller Dashboard & Analytics

**Description:** Comprehensive analytics dashboard for sellers with revenue, order, and product statistics.

**Input:**
- Date range filters
- Status filters

**Process:**
1. Seller accesses dashboard
2. Backend aggregates data:
   - Total revenue (today, this month, all time)
   - Order counts by status
   - Product statistics (active, inactive, out of stock)
   - Top selling products
   - Customer statistics
3. Data formatted and returned as DTOs
4. Frontend displays charts and metrics

**Output:**
- Revenue statistics
- Order analytics
- Product performance metrics
- Customer insights

---

### 12. Shipper Order Management

**Description:** Order assignment and delivery tracking system for shippers.

**Input:**
- Order assignment request
- Delivery status updates

**Process:**
1. Seller marks order as `shipping` and assigns to shipper
2. Shipper receives notification of available order
3. Shipper accepts order (updates `assignment_status = "accepted"`)
4. Shipper updates status: `picked_up` → `on_the_way` → `delivered`
5. Order marked as `delivered` on final update
6. Shipper earnings calculated

**Output:**
- Order assignment confirmation
- Delivery status updates
- Earnings tracking
- Route optimization data

---

### 13. Admin User Management

**Description:** Comprehensive user management with role assignment and account control.

**Input:**
- User search/filter criteria
- Role assignment
- Account lock/unlock actions

**Process:**
1. Admin views user list with filters
2. Admin can assign roles (CUSTOMER, SELLER, SHIPPER, ADMIN)
3. Admin can lock/unlock accounts
4. Changes logged and notifications sent
5. User permissions updated immediately

**Output:**
- Updated user roles
- Account status changes
- Audit logs

---

### 14. Notification System

**Description:** Real-time and email notifications for order updates, promotions, and system events.

**Input:**
- Event triggers (order status change, new message, etc.)
- Notification preferences

**Process:**
1. System event occurs (e.g., order status change)
2. NotificationService creates notification record
3. WebSocket broadcasts to connected clients
4. Email sent via Spring Mail (Gmail SMTP)
5. Notification bell updates in UI
6. User marks notifications as read

**Output:**
- Real-time notification popup
- Email notification
- Notification list in UI
- Unread count badge

---

### 15. Product Search & Filtering

**Description:** Advanced product search with filters, categories, and AI-powered recommendations.

**Input:**
- Search query
- Category filters
- Price range
- Shop filters

**Process:**
1. Customer enters search query
2. Backend searches products by name, description, category
3. Filters applied (category, price, availability, shop)
4. Results sorted by relevance or price
5. Pagination applied for large result sets
6. Results cached via React Query

**Output:**
- Filtered product list
- Search suggestions
- Category breadcrumbs
- Result count and pagination

---

## 🔧 Specific Logic Details

### Image Upload System

#### Backend Implementation

The image upload system uses Spring Boot's `MultipartFile` to handle file uploads.

**FileUploadService.java:**
```java
@Service
public class FileUploadService {
    private final String uploadDir = "uploads/profile-images/";
    private final String productImagesDir = "uploads/product-images/";
    
    public String uploadProductImage(MultipartFile file) throws IOException {
        // 1. Validate file (not empty, valid type, size < 10MB)
        // 2. Create upload directory if not exists
        // 3. Generate unique filename (UUID + extension)
        // 4. Save file to disk
        // 5. Return relative path for database storage
    }
}
```

**Controller Endpoint:**
```java
@PostMapping("/{id}/upload-image")
public ResponseEntity<?> uploadProductImage(
    @PathVariable Integer id,
    @RequestParam("file") MultipartFile file) {
    String imageUrl = fileUploadService.uploadProductImage(file);
    product.setImageUrl(imageUrl);
    productRepository.save(product);
    return ResponseEntity.ok(imageUrl);
}
```

**Configuration (application.properties):**
```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
spring.servlet.multipart.enabled=true
```

#### Frontend Implementation

**React FormData Upload:**
```javascript
const handleImageUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`/api/products/${productId}/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const imageUrl = await response.json();
  // Update product with imageUrl
};
```

**File Storage:**
- Profile images: `uploads/profile-images/`
- Product images: `uploads/product-images/`
- Images served via StaticResourceConfig at `/uploads/**`

---

### API Testing Guide

#### Using Postman

**1. Authentication:**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**2. Authenticated Request:**
```http
GET http://localhost:8080/api/products/search?keyword=pho
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**3. File Upload:**
```http
POST http://localhost:8080/api/products/1/upload-image
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [select file]
```

#### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password123"}'
```

**Search Products:**
```bash
curl -X GET "http://localhost:8080/api/products/search?keyword=pho" \
  -H "Authorization: Bearer {token}"
```

#### Frontend-Backend Connection

**CORS Configuration:**
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        return source;
    }
}
```

**React Query Usage:**
```javascript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['products', keyword],
  queryFn: async () => {
    const response = await fetch(
      `http://localhost:8080/api/products/search?keyword=${keyword}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.json();
  }
});
```

---

### Database Schema

#### Core Tables

**users**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255),
    phone NVARCHAR(20),
    role NVARCHAR(50) NOT NULL DEFAULT 'CUSTOMER', -- CUSTOMER, SELLER, SHIPPER, ADMIN
    profile_image_url NVARCHAR(500),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME
);
```

**shops**
```sql
CREATE TABLE shops (
    id INT PRIMARY KEY IDENTITY(1,1),
    seller_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    address NVARCHAR(500),
    phone NVARCHAR(20),
    image_url NVARCHAR(500),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME
);
```

**products**
```sql
CREATE TABLE products (
    id INT PRIMARY KEY IDENTITY(1,1),
    shop_id INT NOT NULL FOREIGN KEY REFERENCES shops(id),
    category_id INT FOREIGN KEY REFERENCES categories(id),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(19,4) NOT NULL,
    image_url NVARCHAR(500),
    is_available BIT DEFAULT 1, -- Availability flag (not stock quantity)
    status NVARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, OUT_OF_STOCK
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME
);
```

**orders**
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY IDENTITY(1,1),
    buyer_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    shop_id INT NOT NULL FOREIGN KEY REFERENCES shops(id),
    delivery_address_id INT NOT NULL FOREIGN KEY REFERENCES delivery_addresses(id),
    total_amount DECIMAL(19,4) NOT NULL,
    status NVARCHAR(50) DEFAULT 'pending', -- pending, confirmed, preparing, shipping, delivered, cancelled
    assignment_status NVARCHAR(50) DEFAULT 'pending', -- pending, assigned, accepted, rejected
    assigned_shipper_id INT FOREIGN KEY REFERENCES users(id),
    assigned_seller_id INT FOREIGN KEY REFERENCES users(id),
    voucher_id INT FOREIGN KEY REFERENCES vouchers(id),
    order_code INT,
    recipient_name NVARCHAR(255),
    recipient_phone NVARCHAR(20),
    delivery_fee DECIMAL(10,2),
    address_text NVARCHAR(MAX),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    notes NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME,
    assigned_at DATETIME,
    accepted_at DATETIME
);
```

**order_items**
```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL FOREIGN KEY REFERENCES orders(id),
    product_id INT NOT NULL FOREIGN KEY REFERENCES products(id),
    quantity INT NOT NULL,
    price DECIMAL(19,4) NOT NULL, -- Price at time of order
    created_at DATETIME DEFAULT GETDATE()
);
```

**order_history**
```sql
CREATE TABLE order_history (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL FOREIGN KEY REFERENCES orders(id),
    old_status NVARCHAR(50),
    new_status NVARCHAR(50) NOT NULL,
    changed_by INT FOREIGN KEY REFERENCES users(id),
    change_reason NVARCHAR(255),
    notes NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);
```

**reviews**
```sql
CREATE TABLE reviews (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    product_id INT FOREIGN KEY REFERENCES products(id),
    shop_id INT FOREIGN KEY REFERENCES shops(id),
    order_id INT FOREIGN KEY REFERENCES orders(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    image_url NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME
);
```

**vouchers**
```sql
CREATE TABLE vouchers (
    id INT PRIMARY KEY IDENTITY(1,1),
    code NVARCHAR(50) UNIQUE NOT NULL,
    shop_id INT FOREIGN KEY REFERENCES shops(id), -- NULL for global vouchers
    discount_type NVARCHAR(50) NOT NULL, -- PERCENTAGE, FIXED_AMOUNT
    discount_value DECIMAL(19,4) NOT NULL,
    min_order_amount DECIMAL(19,4),
    max_discount DECIMAL(19,4),
    usage_limit INT,
    used_count INT DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);
```

**notifications**
```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX),
    type NVARCHAR(50), -- ORDER, PROMOTION, SYSTEM
    related_id INT, -- Order ID, etc.
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
);
```

#### Relationships

- **users** → **shops** (One-to-Many: One seller can have one shop)
- **shops** → **products** (One-to-Many: One shop has many products)
- **users** → **orders** (One-to-Many: One customer has many orders)
- **orders** → **order_items** (One-to-Many: One order has many items)
- **orders** → **order_history** (One-to-Many: One order has many history entries)
- **products** → **reviews** (One-to-Many: One product has many reviews)
- **users** → **reviews** (One-to-Many: One user can write many reviews)

---

### Securing API Keys

#### Using .gitignore

**Add to .gitignore:**
```
# Keys and Secrets
**/application-dev.properties
**/application-prod.properties
**/config.env
**/*.key
**/*.pem
**/credentials.json
.env
```

#### Environment Variables

**1. Create `.env` file (not committed):**
```properties
PAYOS_CLIENT_ID=your-client-id
PAYOS_API_KEY=your-api-key
PAYOS_CHECKSUM_KEY=your-checksum-key
GEMINI_API_KEY=your-gemini-key
JWT_SECRET=your-jwt-secret
DB_PASSWORD=your-db-password
```

**2. Spring Boot Configuration:**
```properties
# application.properties (use placeholders)
payos.client-id=${PAYOS_CLIENT_ID}
payos.api-key=${PAYOS_API_KEY}
payos.checksum-key=${PAYOS_CHECKSUM_KEY}
gemini.api-key=${GEMINI_API_KEY}
jwt.secret=${JWT_SECRET}
spring.datasource.password=${DB_PASSWORD}
```

**3. Load from Environment:**
```java
@Value("${payos.client-id}")
private String payosClientId;

@Value("${gemini.api-key}")
private String geminiApiKey;
```

**4. Run with Environment Variables:**
```bash
# Windows PowerShell
$env:PAYOS_CLIENT_ID="your-id"; $env:PAYOS_API_KEY="your-key"; mvn spring-boot:run

# Linux/Mac
export PAYOS_CLIENT_ID=your-id
export PAYOS_API_KEY=your-key
mvn spring-boot:run
```

---

### Order Processing Logic

#### Complete Order Flow

**1. Checkout Process:**
```
Customer clicks "Checkout"
  ↓
Cart items validated (product availability checked)
  ↓
Order created with status = "pending"
  ↓
Order items created with product prices (snapshot)
  ↓
Voucher validated and applied (if provided)
  ↓
Total calculated (items + delivery fee - voucher discount)
  ↓
PayOS payment link generated
  ↓
Customer redirected to PayOS
```

**2. Payment Webhook:**
```
PayOS processes payment
  ↓
PayOS sends webhook to /api/payos/webhook
  ↓
Backend verifies checksum signature
  ↓
If payment success:
  - Order status: "pending_payment" → "confirmed"
  - Order history entry created
  - Email sent to customer (order confirmation)
  - Email sent to seller (new order notification)
  - WebSocket notification to seller
  ↓
If payment failed:
  - Order status: "pending_payment" → "cancelled"
  - Order history entry created
  - Email sent to customer (payment failed)
```

**3. Seller Processing:**
```
Seller receives order notification
  ↓
Seller views order details
  ↓
Seller confirms order: status = "confirmed" → "preparing"
  - Order history updated
  - Notification sent to customer
  ↓
Seller starts preparation
  ↓
When ready: status = "preparing" → "shipping"
  - Order assigned to shipper (if available)
  - Notification sent to shipper
  - Notification sent to customer
```

**4. Shipper Delivery:**
```
Shipper receives order assignment
  ↓
Shipper accepts order: assignment_status = "assigned" → "accepted"
  - accepted_at timestamp set
  - Notification sent to customer
  ↓
Shipper picks up order: status = "shipping" (picked_up flag)
  - Notification sent to customer
  ↓
Shipper en route: status = "shipping" (on_the_way flag)
  - Real-time location updates (optional)
  ↓
Shipper delivers: status = "shipping" → "delivered"
  - delivered_at timestamp set
  - Order history updated
  - Email sent to customer (delivery confirmation)
  - Review prompt sent to customer
  - Shipper earnings calculated
```

**5. Order Completion:**
```
Order status = "delivered"
  ↓
Customer can write review
  ↓
Order archived in order history
  ↓
Analytics updated (seller revenue, shipper earnings)
```

#### Status Transition Rules

| Current Status | Allowed Next Status | Who Can Update |
|----------------|---------------------|----------------|
| `pending` | `confirmed`, `cancelled` | System (PayOS), Customer |
| `confirmed` | `preparing`, `cancelled` | Seller, Customer (cancel only) |
| `preparing` | `shipping` | Seller |
| `shipping` | `delivered` | Shipper |
| `delivered` | (final state) | - |
| `cancelled` | (final state) | - |

---

## 📁 File Structure

```
Foodsell/
│
├── demo/                          # Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/demo/
│   │   │   │   ├── admin/         # Admin controllers and services
│   │   │   │   ├── Cart/          # Shopping cart management
│   │   │   │   ├── categories/    # Product categories
│   │   │   │   ├── chat/          # WebSocket chat system
│   │   │   │   ├── config/        # Configuration (Security, CORS, FileUpload, JWT)
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   ├── exception/     # Global exception handling
│   │   │   │   ├── favorites/     # Favorite products
│   │   │   │   ├── gemini/        # Gemini AI chatbot integration
│   │   │   │   ├── notifications/ # Notification system
│   │   │   │   ├── Orders/        # Order management
│   │   │   │   ├── PayOS/         # Payment gateway integration
│   │   │   │   ├── products/      # Product management
│   │   │   │   ├── reviews/       # Review and rating system
│   │   │   │   ├── shipper/       # Shipper management
│   │   │   │   ├── shops/         # Shop management
│   │   │   │   ├── Users/         # User authentication and management
│   │   │   │   └── Vouchers/      # Voucher system
│   │   │   └── resources/
│   │   │       ├── application.properties  # Configuration
│   │   │       └── schema.sql              # Database schema (optional)
│   │   └── test/                  # Unit and integration tests
│   ├── uploads/                   # Uploaded files
│   │   ├── profile-images/        # User profile images
│   │   └── product-images/        # Product images
│   ├── scripts/                   # SQL scripts and utilities
│   ├── pom.xml                    # Maven dependencies
│   └── mvnw                       # Maven wrapper
│
├── foodsystem/                    # Frontend (React.js)
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── api/                   # API service functions
│   │   ├── components/            # Reusable React components
│   │   │   ├── GeminiChatbot/     # AI chatbot component
│   │   │   ├── Cart/              # Shopping cart components
│   │   │   ├── Product/           # Product display components
│   │   │   └── ...                # Other components
│   │   ├── config/                # Configuration files
│   │   ├── contexts/              # React Context (Cart, Auth)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── Page/                  # Page components
│   │   │   ├── OrderPage/         # Order management pages
│   │   │   ├── ProductPage/       # Product listing pages
│   │   │   └── ...                # Other pages
│   │   ├── routes/                # Route configuration
│   │   ├── utils/                 # Utility functions
│   │   ├── App.js                 # Main App component
│   │   └── index.js               # Entry point
│   ├── package.json               # npm dependencies
│   └── build/                     # Production build output
│
├── docs/                          # Documentation (if any)
├── FEATURES_LIST.md               # Feature list documentation
├── lamlai.sql                     # Database backup/script
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

---

## 🚀 How to Run

### Prerequisites

- **Java 21** or higher
- **Maven 3.6+**
- **Node.js 18+** and npm
- **SQL Server** (or MySQL as alternative)
- **Git**

### Backend Setup

**1. Clone the repository:**
```bash
git clone <repository-url>
cd Foodsell
```

**2. Configure Database:**

Edit `demo/src/main/resources/application.properties`:
```properties
# SQL Server Configuration
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=food_delivery_db10;encrypt=false;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=your_password

# Or MySQL Configuration
# spring.datasource.url=jdbc:mysql://localhost:3306/food_delivery_db
# spring.datasource.username=root
# spring.datasource.password=your_password
# spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

**3. Configure API Keys:**

Create environment variables or update `application.properties`:
```properties
# PayOS Configuration
payos.client-id=your-payos-client-id
payos.api-key=your-payos-api-key
payos.checksum-key=your-payos-checksum-key
payos.webhook-url=http://localhost:8080/api/payos/webhook

# Gemini AI Configuration
gemini.api-key=your-gemini-api-key
gemini.model-name=gemini-2.5-flash

# JWT Configuration
jwt.secret=your-secret-key-min-256-bits
jwt.expiration=86400000

# Email Configuration (Gmail SMTP)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

**4. Initialize Database:**

Option A: Auto-create (JPA):
```properties
spring.jpa.hibernate.ddl-auto=update
```

Option B: Import SQL:
```bash
# SQL Server
sqlcmd -S localhost -U sa -P your_password -d food_delivery_db10 -i lamlai.sql
```

**5. Run Backend:**
```bash
cd demo
mvn clean install
mvn spring-boot:run
```

Backend will start on `http://localhost:8080`

### Frontend Setup

**1. Install Dependencies:**
```bash
cd foodsystem
npm install
```

**2. Configure API Endpoint:**

Update API base URL in `foodsystem/src/config/api.js` (if needed):
```javascript
export const API_BASE_URL = 'http://localhost:8080/api';
```

**3. Run Frontend:**
```bash
npm start
```

Frontend will start on `http://localhost:3000`

### Testing Accounts

After database initialization, you can create test accounts via registration or use existing ones:

**Default Roles:**
- Customer: Register via `/register` or Google OAuth
- Seller: Register and create shop via seller dashboard
- Shipper: Register and create shipper profile
- Admin: Create via database or admin panel (if implemented)

**Test Credentials (if seeded):**
```
Customer: customer@example.com / password123
Seller: seller@example.com / password123
Shipper: shipper@example.com / password123
Admin: admin@example.com / password123
```

---

## ⚠️ Common Issues

### Database Connection Issues

**Problem:** Cannot connect to SQL Server/MySQL

**Solutions:**
1. Verify database is running:
   ```bash
   # SQL Server
   sqlcmd -S localhost -U sa -P your_password
   
   # MySQL
   mysql -u root -p
   ```

2. Check connection string in `application.properties`
3. Ensure database exists: `CREATE DATABASE food_delivery_db10;`
4. Verify firewall allows connections on port 1433 (SQL Server) or 3306 (MySQL)
5. For SQL Server, enable TCP/IP in SQL Server Configuration Manager

---

### Port Conflicts

**Problem:** Port 8080 or 3000 already in use

**Solutions:**

**Backend (8080):**
```properties
# Change in application.properties
server.port=8081
```

**Frontend (3000):**
```bash
# Set PORT environment variable
PORT=3001 npm start

# Or create .env file in foodsystem/
PORT=3001
```

---

### CORS Errors

**Problem:** Frontend cannot access backend API

**Solutions:**
1. Verify CORS configuration in `CorsConfig.java` includes frontend URL
2. Check backend is running on correct port
3. Ensure `Access-Control-Allow-Origin` header is present
4. For development, temporarily allow all origins (not for production):
   ```java
   configuration.setAllowedOrigins(Arrays.asList("*"));
   ```

---

### JWT Token Expiry

**Problem:** "Token expired" errors

**Solutions:**
1. Increase token expiration in `application.properties`:
   ```properties
   jwt.expiration=86400000  # 24 hours in milliseconds
   ```

2. Implement token refresh mechanism
3. Clear localStorage and re-login:
   ```javascript
   localStorage.removeItem('token');
   window.location.href = '/login';
   ```

---

### File Upload Limits

**Problem:** "File too large" errors

**Solutions:**
1. Increase limits in `application.properties`:
   ```properties
   spring.servlet.multipart.max-file-size=50MB
   spring.servlet.multipart.max-request-size=50MB
   ```

2. Check nginx/apache limits (if using reverse proxy)
3. Verify file size in frontend before upload:
   ```javascript
   if (file.size > 10 * 1024 * 1024) {
     alert('File too large. Maximum 10MB allowed.');
     return;
   }
   ```

---

### PayOS Webhook Not Working

**Problem:** Payment webhook not received

**Solutions:**
1. Use ngrok for local testing:
   ```bash
   ngrok http 8080
   # Update payos.webhook-url with ngrok URL
   ```

2. Verify webhook URL is accessible (not localhost in production)
3. Check PayOS dashboard for webhook logs
4. Verify checksum key matches PayOS configuration

---

### Gemini API Errors

**Problem:** Chatbot not responding

**Solutions:**
1. Verify API key is correct in `application.properties`
2. Check API quota/limits in Google Cloud Console
3. Verify model name: `gemini-2.5-flash`
4. Check network connectivity to `generativelanguage.googleapis.com`

---

## 📝 Additional Notes

### Currency

- All prices are in **VND (Vietnamese Dong)**
- Format: `100,000 VND` or `100.000₫`
- Database stores as `DECIMAL(19,4)` for precision

### User Roles

The system supports four roles with distinct permissions:

- **CUSTOMER**: Browse, order, review, chat
- **SELLER**: Manage products, process orders, view analytics
- **SHIPPER**: Accept deliveries, update status, track earnings
- **ADMIN**: Full system access, user management, analytics

### Real-Time Features

- **WebSocket Chat**: Real-time messaging between users
- **Order Notifications**: Instant status updates via WebSocket
- **Live Order Tracking**: Real-time order status changes

### File Storage

- Files stored locally in `uploads/` directory
- For production, consider cloud storage (AWS S3, Google Cloud Storage)
- Static files served via `StaticResourceConfig` at `/uploads/**`

### Development vs Production

**Development:**
- JPA auto-update: `spring.jpa.hibernate.ddl-auto=update`
- SQL logging enabled: `spring.jpa.show-sql=true`
- CORS allows localhost

**Production:**
- Use `spring.jpa.hibernate.ddl-auto=validate` or `none`
- Disable SQL logging
- Configure proper CORS origins
- Use environment variables for secrets
- Enable HTTPS
- Configure reverse proxy (nginx/apache)

---

## 📄 License

This project is for **educational purposes** only. 

---

## 🤝 Contributing

This is a personal/educational project. Contributions and suggestions are welcome!

---

## 📧 Contact

For questions or issues, please open an issue on the repository.

---

**Last Updated:** 2024

**Project Status:** 70% Complete - Active Development


