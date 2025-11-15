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
# Foodsell - Food Delivery Application

## Project Overview

**Foodsell** is a comprehensive food delivery application that connects customers, sellers (merchants), shippers, and administrators in a unified platform. The system enables customers to browse and order food from various restaurants, while providing sellers with tools to manage their products and orders, shippers with order delivery management, and administrators with system-wide oversight and control.

The application follows a **Food Delivery Model** (not inventory-based e-commerce), where products are prepared after orders are placed, and availability is managed through status flags rather than stock quantities.

---

## Tech Stack

### Frontend
- **React.js** (v19.1.1) - UI framework
- **React Router DOM** (v6.30.1) - Client-side routing
- **React Query** (@tanstack/react-query v5.90.2) - Data fetching and caching
- **Bootstrap** (v5.3.8) - CSS framework
- **Ant Design** (v5.27.4) - UI component library
- **Styled Components** (v6.1.19) - CSS-in-JS styling
- **Font Awesome** - Icons
- **React Icons** - Icon library
- **SockJS Client** & **@stomp/stompjs** - WebSocket client for real-time chat
- **JWT Decode** - Token parsing
- **Google Maps React Wrapper** - Map integration
- **@react-oauth/google** - Google OAuth integration

### Backend
- **Spring Boot** (v3.2.0) - Java framework
- **Java** (v21) - Programming language
- **Spring Data JPA** - Database ORM
- **Spring Security** - Authentication and authorization
- **Spring WebSocket** - Real-time communication
- **JWT** (io.jsonwebtoken v0.11.5) - Token-based authentication
- **Lombok** (v1.18.32) - Code generation
- **Spring Mail** - Email service
- **Spring WebFlux** - Reactive HTTP client for PayOS integration
- **Hibernate** - JPA implementation

### Database
- **SQL Server** - Primary database
- **MySQL Connector** - Alternative database support (optional)

### Third-Party Services
- **PayOS** - Payment gateway integration
- **Google Gemini AI** (gemini-2.5-flash) - AI chatbot for customer support
- **Google OAuth2** - Social authentication
- **Gmail SMTP** - Email service

### Development Tools
- **Maven** - Build tool
- **Node.js & npm** - Frontend package management
- **JaCoCo** - Code coverage tool

---

## Main Features

### 1. Product Search

**Description:** Allows users to search for food products by keyword with advanced filtering options including category, price range, and shop.

**Input:**
- Search keyword (text string)
- Optional filters: category ID, price range, shop ID

**Process:**
- Frontend sends search query to `/api/products/search?keyword={keyword}`
- Backend `ProductService` searches database using `findByNameContainingIgnoreCase()` or custom `searchProducts()` method
- Results are filtered by category, price, and availability status
- Products with `is_available=true` and `status='active'` are returned

**Output:**
- List of matching products with details (name, price, image, description, shop info)
- Displayed in paginated grid/list view
- Shows "No results found" message if no matches

**AI Assistance Summary:** Prompt used to generate search product page in React with search bar, result list, and filtering capabilities.

---

### 2. Add to Cart

**Description:** Enables customers to add products to their shopping cart with quantity selection.

**Input:**
- Product ID
- Quantity (default: 1)
- Product details (name, price, image)

**Process:**
- Frontend `CartContext` manages cart state using React Context API
- Cart items stored in localStorage for persistence
- Quantity validation ensures positive numbers
- Duplicate products are merged with updated quantities

**Output:**
- Cart item added/updated in cart state
- Cart icon badge updates with item count
- Success notification displayed
- Cart persists across page refreshes

**AI Assistance Summary:** Prompt used to generate cart management system with React Context API, localStorage persistence, and quantity controls.

---

### 3. Checkout

**Description:** Complete order placement process with delivery address selection, payment method, and voucher application.

**Input:**
- Cart items
- Delivery address (name, phone, full address, coordinates)
- Payment method (PayOS online payment)
- Optional voucher code
- Delivery notes

**Process:**
- Frontend validates cart items and delivery information
- Calculates subtotal, shipping fee, and voucher discount
- Creates PayOS payment link via `/api/payos/create-payment`
- Backend generates order with status 'pending'
- User redirected to PayOS payment gateway
- After payment, webhook updates order status

**Output:**
- PayOS checkout URL for payment
- Order created in database with pending status
- Redirect to payment success/cancel page based on payment result
- Order confirmation email sent (if configured)

**AI Assistance Summary:** Prompt used to generate checkout page with address form, payment integration, voucher application, and order creation workflow.

---

### 4. Order Management

**Description:** Comprehensive order tracking and management for customers, sellers, and shippers with status updates.

**Input:**
- Order ID (for viewing details)
- Status update (for sellers/shippers): confirmed, preparing, shipping, delivered, cancelled
- Filter parameters: status, date range, shop ID

**Process:**
- **Customer:** Views orders via `/api/orders` (filtered by buyer ID)
- **Seller:** Manages shop orders via `/api/seller/orders/{shopId}`, updates status through workflow: pending → confirmed → preparing → shipping
- **Shipper:** Accepts orders, updates delivery status: picked up → on the way → delivered
- Order history tracked in `order_history` table
- Real-time notifications sent on status changes

**Output:**
- Order list with status, items, total amount, delivery info
- Order detail page with full information and status timeline
- Status update confirmation
- Order history log

**AI Assistance Summary:** Prompt used to generate order management system with role-based views, status workflow, and order history tracking.

---

### 5. Seller Dashboard

**Description:** Comprehensive analytics and management interface for sellers to monitor business performance and manage operations.

**Input:**
- Shop ID
- Date range filters (for revenue statistics)
- Status filters (for orders)

**Process:**
- Backend aggregates data from orders, products, and customers tables
- Calculates metrics: total/today orders, revenue, product counts, customer statistics
- Fetches best-selling products by quantity sold
- Retrieves top customers by spending
- Generates revenue charts (daily/monthly)

**Output:**
- Dashboard with key metrics cards (orders, revenue, products, customers)
- Revenue charts (line/bar charts for daily/monthly trends)
- Best-selling products list
- Top customers list
- Order statistics by status

**AI Assistance Summary:** Prompt used to generate seller dashboard with statistics cards, revenue charts, and data aggregation from multiple database tables.

---

### 6. Shipper Management

**Description:** Order delivery management system for shippers to accept, track, and complete deliveries.

**Input:**
- Shipper ID
- Order ID (for accepting/updating)
- Delivery status update
- Location coordinates (for route optimization)

**Process:**
- Shipper views available orders via `/api/shipper/orders/available`
- Accepts order, creating shipping assignment
- Updates delivery status through workflow
- System tracks delivery time and calculates earnings
- Location updates enable route tracking

**Output:**
- Available orders list
- Active deliveries list with customer details and addresses
- Delivery status update confirmation
- Earnings summary (per order and total)
- Delivery history

**AI Assistance Summary:** Prompt used to generate shipper dashboard with order acceptance, status updates, earnings tracking, and delivery management.

---

### 7. Product Management (Seller)

**Description:** CRUD operations for sellers to manage their product catalog including images, pricing, and availability.

**Input:**
- Product details: name, description, price, category, image file
- Product status: active, inactive, out_of_stock
- Availability flag: is_available (boolean)

**Process:**
- Seller creates/updates products via `/api/products` (POST/PUT)
- Image uploaded to `/uploads/product-images/` via `FileUploadService`
- Product saved to database with shop association
- Status and availability flags control product visibility

**Output:**
- Product list for seller's shop
- Product form (create/edit) with image upload
- Success/error messages
- Updated product displayed in shop catalog

**AI Assistance Summary:** Prompt used to generate product management interface with form validation, image upload, and CRUD operations.

---

### 8. Shop Management

**Description:** Shop registration, profile management, and settings for sellers.

**Input:**
- Shop details: name, address, phone, description, opening hours
- Shop image file
- Shop category/type

**Process:**
- Seller registers shop via `/api/shops/register`
- Admin approves shop registration (optional workflow)
- Shop profile updated via `/api/shops/{id}`
- Image uploaded to `/uploads/shop-images/`
- Shop information stored in `shops` table

**Output:**
- Shop registration form
- Shop profile page with details and products
- Shop list page for customers to browse
- Shop settings page for sellers

**AI Assistance Summary:** Prompt used to generate shop registration form, shop detail page, and shop management interface.

---

### 9. Review & Rating System

**Description:** Customer review and rating system for products and shops with seller reply functionality.

**Input:**
- Product/Shop ID
- Rating (1-5 stars)
- Review text
- Optional images
- Reply text (for sellers)

**Process:**
- Customer submits review via `/api/reviews` (POST) after order completion
- Review stored with product/shop association
- Average rating calculated and updated
- Seller can reply to reviews via `/api/reviews/{id}/replies`
- Reviews displayed on product/shop detail pages

**Output:**
- Review form with star rating
- Review list with ratings, text, and replies
- Average rating displayed
- Seller reply interface

**AI Assistance Summary:** Prompt used to generate review component with star rating, review form, and seller reply functionality.

---

### 10. Real-Time Chat

**Description:** WebSocket-based real-time messaging between customers, sellers, and shippers.

**Input:**
- Message text
- Recipient ID (shop/shipper/customer)
- Optional file attachments (images)

**Process:**
- WebSocket connection established via `/ws-chat`
- Messages sent through STOMP protocol
- Backend `ChatService` stores messages in database
- Real-time message delivery to connected clients
- Conversation history loaded on chat open

**Output:**
- Chat interface with message list
- Real-time message updates
- Conversation list with unread indicators
- File/image sharing support

**AI Assistance Summary:** Prompt used to generate WebSocket chat system with STOMP protocol, message persistence, and real-time updates.

---

### 11. Voucher System

**Description:** Discount voucher management and application during checkout.

**Input:**
- Voucher code
- Voucher details (discount type, value, expiry date, usage limit)
- Order total (for validation)

**Process:**
- Admin/Seller creates vouchers via `/api/vouchers` (POST)
- Customer applies voucher code at checkout
- System validates voucher (expiry, usage limit, minimum order)
- Discount calculated and applied to order total
- Voucher usage tracked in `user_vouchers` table

**Output:**
- Voucher list page
- Voucher application at checkout
- Discount amount displayed
- Voucher validation messages

**AI Assistance Summary:** Prompt used to generate voucher management system with code validation, discount calculation, and usage tracking.

---

### 12. AI Chatbot (Gemini)

**Description:** AI-powered customer support chatbot using Google Gemini AI for product search, recommendations, and general assistance.

**Input:**
- User message/question
- Context (current page, cart items)

**Process:**
- Frontend sends message to `/api/gemini/chat`
- Backend `GeminiService` formats prompt with product database context
- Gemini AI processes query and generates response
- Response parsed for product recommendations
- Products can be added to cart directly from chatbot

**Output:**
- AI-generated text response
- Product recommendations with details
- "Add to Cart" buttons for recommended products
- Chat history with message timestamps

**AI Assistance Summary:** Prompt used to generate Gemini AI chatbot integration with product search, natural language processing, and cart integration.

---

### 13. Admin Dashboard

**Description:** System-wide administration interface for managing users, orders, products, shops, and vouchers.

**Input:**
- Admin actions: ban/unban users, approve shops, manage vouchers
- Filter parameters for data views

**Process:**
- Admin accesses protected routes via `/admin/*`
- Backend `AdminService` aggregates system-wide statistics
- Admin can perform CRUD operations on all entities
- Role-based access control enforced via Spring Security

**Output:**
- Admin dashboard with system statistics
- User management interface
- Order management across all shops
- Product/shop moderation tools
- Voucher management interface

**AI Assistance Summary:** Prompt used to generate admin dashboard with comprehensive management tools, statistics aggregation, and role-based access control.

---

### 14. Authentication & Authorization

**Description:** JWT-based authentication with Google OAuth support, role-based access control, and password reset.

**Input:**
- Login: email and password
- Register: email, password, full name
- Google OAuth: OAuth token
- Password reset: email (OTP sent), new password

**Process:**
- User registers via `/api/auth/register`, OTP sent to email
- User verifies OTP, account activated
- Login via `/api/auth/login` returns JWT token
- Google OAuth redirects to `/login/oauth2/code/google`
- JWT token stored in localStorage, included in API requests
- Spring Security validates token and enforces role-based access
- Password reset: OTP sent, new password hashed with BCrypt

**Output:**
- JWT token for authenticated requests
- User profile information
- Redirect to appropriate dashboard based on role
- Success/error messages

**AI Assistance Summary:** Prompt used to generate authentication system with JWT, OAuth integration, OTP email service, and role-based route protection.

---

### 15. Notification System

**Description:** Real-time and in-app notifications for order updates, promotions, and system messages.

**Input:**
- Notification type (order, promotion, system)
- Recipient user ID
- Notification message and data

**Process:**
- System creates notifications via `/api/notifications`
- Notifications stored in database
- Real-time delivery via WebSocket (optional)
- Notification bell displays unread count
- User marks notifications as read

**Output:**
- Notification dropdown/bell icon
- Notification list with unread indicators
- Real-time notification updates
- Notification detail view

**AI Assistance Summary:** Prompt used to generate notification system with real-time updates, unread indicators, and notification management.

---

## AI Assistance Summary

The following features were developed with AI assistance using various prompts:

1. **Product Search:** Prompt used to generate search product page in React with search bar, result list, and filtering capabilities.
2. **Add to Cart:** Prompt used to generate cart management system with React Context API, localStorage persistence, and quantity controls.
3. **Checkout:** Prompt used to generate checkout page with address form, payment integration, voucher application, and order creation workflow.
4. **Order Management:** Prompt used to generate order management system with role-based views, status workflow, and order history tracking.
5. **Seller Dashboard:** Prompt used to generate seller dashboard with statistics cards, revenue charts, and data aggregation from multiple database tables.
6. **Shipper Management:** Prompt used to generate shipper dashboard with order acceptance, status updates, earnings tracking, and delivery management.
7. **Product Management:** Prompt used to generate product management interface with form validation, image upload, and CRUD operations.
8. **Shop Management:** Prompt used to generate shop registration form, shop detail page, and shop management interface.
9. **Review System:** Prompt used to generate review component with star rating, review form, and seller reply functionality.
10. **Real-Time Chat:** Prompt used to generate WebSocket chat system with STOMP protocol, message persistence, and real-time updates.
11. **Voucher System:** Prompt used to generate voucher management system with code validation, discount calculation, and usage tracking.
12. **AI Chatbot:** Prompt used to generate Gemini AI chatbot integration with product search, natural language processing, and cart integration.
13. **Admin Dashboard:** Prompt used to generate admin dashboard with comprehensive management tools, statistics aggregation, and role-based access control.
14. **Authentication:** Prompt used to generate authentication system with JWT, OAuth integration, OTP email service, and role-based route protection.
15. **Notifications:** Prompt used to generate notification system with real-time updates, unread indicators, and notification management.

---

## File Structure

```
Foodsell/
├── demo/                          # Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/demo/
│   │   │   │   ├── admin/         # Admin management
│   │   │   │   ├── Cart/          # Shopping cart
│   │   │   │   ├── categories/    # Product categories
│   │   │   │   ├── chat/          # Real-time chat
│   │   │   │   ├── config/        # Security, JWT, CORS config
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   ├── favorites/     # Favorite products
│   │   │   │   ├── gemini/        # AI chatbot service
│   │   │   │   ├── notifications/ # Notification system
│   │   │   │   ├── Orders/        # Order management
│   │   │   │   ├── PayOS/         # Payment integration
│   │   │   │   ├── products/      # Product management
│   │   │   │   ├── reviews/       # Review system
│   │   │   │   ├── shipper/       # Shipper management
│   │   │   │   ├── shops/         # Shop management
│   │   │   │   ├── Users/         # User authentication
│   │   │   │   └── Vouchers/      # Voucher system
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/  # Database migrations
│   │   └── test/                  # Unit tests
│   ├── uploads/                   # Uploaded files
│   │   ├── product-images/
│   │   └── profile-images/
│   ├── pom.xml                    # Maven dependencies
│   └── SELLER_API_DOCUMENTATION.md
│
├── foodsystem/                    # Frontend (React)
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── api/                   # API client functions
│   │   │   ├── address.js
│   │   │   ├── admin.js
│   │   │   ├── auth.js
│   │   │   ├── category.js
│   │   │   ├── chat.js
│   │   │   ├── customer.js
│   │   │   ├── gemini.js
│   │   │   ├── notification.js
│   │   │   ├── payment.js
│   │   │   ├── product.js
│   │   │   ├── review.js
│   │   │   ├── seller.js
│   │   │   ├── shipper.js
│   │   │   ├── shop-orders.js
│   │   │   ├── shop.js
│   │   │   └── voucher.js
│   │   ├── components/            # React components
│   │   │   ├── AdminComponent/    # Admin dashboard
│   │   │   ├── CartComponent/     # Shopping cart
│   │   │   ├── CheckoutComponent/ # Checkout page
│   │   │   ├── Chat/              # Chat interface
│   │   │   ├── CustomerProfileComponent/
│   │   │   ├── FoodProductComponent/ # Product display
│   │   │   ├── GeminiChatbot/     # AI chatbot
│   │   │   ├── ReviewComponent/   # Reviews
│   │   │   ├── SellerComponent/   # Seller dashboard
│   │   │   ├── ShipperDashboard/  # Shipper interface
│   │   │   ├── ShopComponent/     # Shop pages
│   │   │   ├── ShopManagementComponent/
│   │   │   └── VoucherComponent/
│   │   ├── contexts/              # React Context
│   │   │   └── CartContext.jsx
│   │   ├── hooks/                 # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useAuthQueries.js
│   │   │   ├── useCommon.js
│   │   │   └── useShop.js
│   │   ├── Page/                  # Page components
│   │   │   ├── HomePage/
│   │   │   ├── productPPage/
│   │   │   ├── CheckoutPage/
│   │   │   ├── OrderPage/
│   │   │   └── ...
│   │   ├── routes/                # Route configuration
│   │   │   └── index.js
│   │   ├── config/                # Configuration
│   │   │   ├── queryClient.js
│   │   │   └── shippingConfig.js
│   │   ├── utils/                 # Utility functions
│   │   ├── App.js                 # Main app component
│   │   └── index.js               # Entry point
│   └── package.json
│
├── docs/                          # Documentation
│   └── diagrams/
│
├── tools/                         # Utility scripts
│
└── README.md                      # This file
```

---

## How to Run the Project

### Prerequisites

- **Java 21** or higher
- **Maven 3.6+**
- **Node.js 16+** and **npm**
- **SQL Server** (or MySQL) database
- **Git**

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Foodsell
   ```

2. **Configure database:**
   - Create a SQL Server database named `food_delivery_db6` (or update `application.properties`)
   - Update database credentials in `demo/src/main/resources/application.properties`:
     ```properties
     spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=food_delivery_db6
     spring.datasource.username=sa
     spring.datasource.password=1234
     ```

3. **Configure third-party services:**
   - Update PayOS credentials in `application.properties`:
     ```properties
     payos.client-id=your-client-id
     payos.api-key=your-api-key
     payos.checksum-key=your-checksum-key
     ```
   - Update Gemini AI API key:
     ```properties
     gemini.api-key=your-gemini-api-key
     ```
   - Update Gmail SMTP credentials for email service:
     ```properties
     spring.mail.username=your-email@gmail.com
     spring.mail.password=your-app-password
     ```

4. **Build and run the backend:**
   ```bash
   cd demo
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```
   Or on Windows:
   ```bash
   mvnw.cmd clean install
   mvnw.cmd spring-boot:run
   ```
   
   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd foodsystem
   npm install
   ```

2. **Configure API endpoint (if needed):**
   - Update API base URL in `src/api/*.js` files if backend runs on different port
   - Default: `http://localhost:8080`

3. **Start the development server:**
   ```bash
   npm start
   ```
   
   The frontend will start on `http://localhost:3000`

### Database Initialization

1. **Run database migrations:**
   - The application uses JPA `ddl-auto=update` to create/update tables automatically
   - Alternatively, import the SQL file `lamlai.sql` if available

2. **Initialize categories (optional):**
   - Categories are auto-initialized via `CategoryDataInitializer` on first run

### Testing the Application

1. **Create test accounts:**
   - Register a new customer account via the frontend
   - Verify email with OTP
   - Login to access customer features

2. **Test seller features:**
   - Register a shop via `/shops/register`
   - Access seller dashboard at `/seller/dashboard`
   - Add products and manage orders

3. **Test shipper features:**
   - Create a shipper account (or assign shipper role via admin)
   - Access shipper dashboard at `/shipper/dashboard`
   - Accept and deliver orders

4. **Test admin features:**
   - Create admin account (or use `/api/auth/make-admin/{email}`)
   - Access admin dashboard at `/admin/dashboard`
   - Manage users, orders, and system settings

### Common Issues and Solutions

1. **Database connection error:**
   - Verify SQL Server is running
   - Check database credentials in `application.properties`
   - Ensure database exists

2. **Port already in use:**
   - Change backend port in `application.properties`: `server.port=8081`
   - Update frontend API URLs accordingly

3. **CORS errors:**
   - Verify `CorsConfig` allows `http://localhost:3000`
   - Check `@CrossOrigin` annotations on controllers

4. **JWT token expired:**
   - Token expiration is set to 24 hours (86400000 ms)
   - Update `jwt.expiration` in `application.properties` if needed

5. **File upload errors:**
   - Ensure `uploads/` directory exists in `demo/` folder
   - Check file size limits in `application.properties`

### Production Deployment

1. **Build frontend for production:**
   ```bash
   cd foodsystem
   npm run build
   ```

2. **Build backend JAR:**
   ```bash
   cd demo
   ./mvnw clean package
   ```

3. **Run production JAR:**
   ```bash
   java -jar target/demo-0.0.1-SNAPSHOT.jar
   ```

4. **Configure production database and environment variables:**
   - Update `application.properties` with production database credentials
   - Set secure JWT secret key
   - Configure production PayOS and Gemini API keys
   - Set up proper email service credentials

---

## Additional Notes

- The application uses a **Food Delivery Model**, not inventory management
- Products use `is_available` and `status` flags instead of stock quantities
- Order status workflow: `pending → confirmed → preparing → shipping → delivered`
- All monetary values are in VND (Vietnamese Dong)
- The system supports multiple roles: CUSTOMER, SELLER, SHIPPER, ADMIN
- Real-time features use WebSocket for chat and notifications
- File uploads are stored locally in `uploads/` directory

---

## License

This project is developed for academic/educational purposes.

---

**Last Updated:** 2024

