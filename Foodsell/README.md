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

