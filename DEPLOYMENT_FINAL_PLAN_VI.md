# 🚀 DEPLOYMENT PLAN CHO FOODSELL - FOOD DELIVERY APP

---

## 📱 PROJECT OVERVIEW

```
FOODSELL - Food Delivery Platform (70% Complete)
├─ Customers: Order food online
├─ Sellers: Manage restaurants & orders
├─ Shippers: Deliver orders
└─ Admins: Manage system

Multi-role system with real-time chat, AI chatbot, payment integration
```

---

## 🎯 DEPLOYMENT GOAL (MỤC ĐÍCH CUỐI CÙNG)

```
Deploy Foodsell to public server để:

1. ✅ Customers có thể:
   - Truy cập website: https://foodiez-frontend-xxx.onrender.com
   - Đăng nhập, duyệt đồ ăn, đặt hàng
   - Thanh toán qua PayOS
   - Chat với sellers/shippers
   - Nhận email reset password, OTP

2. ✅ Sellers có thể:
   - Quản lý shop (products, orders, prices)
   - Thực hiện payment processing (PayOS)
   - Nhận thông báo real-time orders

3. ✅ Shippers có thể:
   - Xem orders để giao hàng
   - Update delivery status
   - Track routes

4. ✅ Admins có thể:
   - Quản lý toàn bộ hệ thống
   - Approve shops
   - Xem analytics

5. ✅ System:
   - Email notifications (Password reset, OTP)
   - AI Chatbot (Gemini API)
   - Real-time WebSocket chat
   - Payment processing (PayOS)
   - Database persistence (SQL Server)
```

---

## 🔧 INFRASTRUCTURE REQUIREMENTS

### Hiện Tại (Local):

```
Frontend: http://localhost:3000 (React dev server)
Backend:  http://localhost:8080 (Spring Boot)
Database: localhost:1433 (SQL Server local)
```

### Sau Deploy:

```
Frontend: https://foodiez-frontend-xxx.onrender.com (Render Static Site)
Backend:  https://foodiez-backend-xxx.onrender.com (Render Web Service)
Database: [server].database.windows.net:1433 (Azure SQL Database)
Email:    smtp.gmail.com:587 (Gmail SMTP)
Payment:  PayOS API (Merchant integration)
AI:       Gemini API
WebSocket: Render backend (auto-supported)
```

---

## 📋 DEPENDENCIES & CONFIGURATIONS

### Backend Dependencies:

```
✅ Spring Boot 3.2.0
✅ Spring Data JPA (SQL Server)
✅ Spring Security (JWT)
✅ Spring WebSocket (Real-time chat)
✅ Spring Mail (Email notifications)
✅ SQL Server JDBC Driver
✅ JWT (jjwt) Token-based auth
✅ PayOS Client (Payment integration)
✅ Google Gemini SDK (AI chatbot)
```

### Frontend Dependencies:

```
✅ React 19.1.1
✅ React Router DOM (Navigation)
✅ React Query (Data fetching)
✅ STOMP WebSocket (Real-time chat)
✅ Google OAuth (Login)
✅ Bootstrap + Ant Design (UI)
✅ Font Awesome + React Icons (Icons)
✅ JWT Decode (Token parsing)
```

### External Services:

```
✅ Azure SQL Database (Database)
✅ Gmail SMTP (Email)
✅ PayOS (Payment gateway)
✅ Google Gemini AI (Chatbot)
✅ Render (Hosting)
✅ GitHub (Version control)
```

---

## 📊 DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│  END USERS (Customers, Sellers, Shippers, Admins)          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Browser Requests                                          │
│  https://foodiez-frontend-xxx.onrender.com                │
│                 ↓↑                                          │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND (React Static Site on Render)                    │
│  - Built output: /build directory                          │
│  - HTTPS: Automatic SSL certificate                        │
│  - Assets: CSS, JS, Images                                 │
│  - API Calls: https://foodiez-backend-xxx.onrender.com    │
│  - WebSocket: wss://foodiez-backend-xxx.onrender.com      │
│                 ↓↑                                          │
├─────────────────────────────────────────────────────────────┤
│  BACKEND (Spring Boot Web Service on Render)               │
│  - REST API endpoints: /api/*                              │
│  - WebSocket endpoint: /ws/chat                            │
│  - Auth: JWT tokens                                        │
│  - Email: SMTP integration                                 │
│  - Payment: PayOS API calls                                │
│  - AI: Gemini API calls                                    │
│  - Database: Connection to Azure SQL                       │
│                 ↓↑                                          │
├─────────────────────────────────────────────────────────────┤
│  EXTERNAL SERVICES                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DATABASE: Azure SQL Database                              │
│  - Server: [name].database.windows.net:1433               │
│  - Tables: Users, Products, Orders, etc.                  │
│                                                             │
│  EMAIL: Gmail SMTP                                         │
│  - smtp.gmail.com:587                                     │
│  - Password reset, OTP codes, notifications              │
│                                                             │
│  PAYMENT: PayOS                                            │
│  - Checkout API                                            │
│  - Payment verification                                    │
│  - Webhook for payment updates                             │
│                                                             │
│  AI: Google Gemini                                         │
│  - gemini-2.5-flash model                                 │
│  - Real-time customer support chat                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 STEP-BY-STEP DEPLOYMENT CHECKLIST

### PHASE 1: PREPARATION (Local)

#### 1.1 Code Preparation

```bash
# Step 1: Ensure code is ready
cd E:\ProjectTestFer202\Foodsell

# Step 2: Check git status
git status

# Step 3: Add all changes
git add .

# Step 4: Commit
git commit -m "Prepare for production deployment"

# Step 5: Push to GitHub (repo chính)
git push origin main
# (or current branch)

# ✅ Code on GitHub: https://github.com/trongphuc207/Foodiez
```

---

#### 1.2 Backend Configuration

**File: `demo/src/main/resources/application.properties`**

```properties
# ============================================================
# PRODUCTION CONFIGURATION FOR RENDER + SQL SERVER
# ============================================================

# Server
server.port=8080
server.servlet.context-path=/api

# ============================================================
# DATABASE (Azure SQL Server)
# ============================================================

spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.SQLServer2012Dialect
spring.jpa.show-sql=false

# ============================================================
# JWT SECURITY
# ============================================================

jwt.secret=${JWT_SECRET:fallback_secret_key_change_in_production}
jwt.expiration=86400000

# ============================================================
# EMAIL (Gmail SMTP)
# ============================================================

spring.mail.host=${SMTP_HOST:smtp.gmail.com}
spring.mail.port=${SMTP_PORT:587}
spring.mail.username=${SMTP_USER}
spring.mail.password=${SMTP_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# ============================================================
# APPLICATION
# ============================================================

app.frontend.url=${APP_FRONTEND_URL:https://foodiez-frontend-xxx.onrender.com}

# ============================================================
# PAYOS PAYMENT GATEWAY
# ============================================================

payos.client-id=${PAYOS_CLIENT_ID}
payos.api-key=${PAYOS_API_KEY}
payos.checksum-key=${PAYOS_CHECKSUM_KEY}
payos.base-url=https://api-merchant.payos.vn
payos.webhook-url=${PAYOS_WEBHOOK_URL}

# ============================================================
# GEMINI AI CHATBOT
# ============================================================

gemini.api-key=${GEMINI_API_KEY}
gemini.model-name=gemini-2.5-flash
gemini.api-base-url=https://generativelanguage.googleapis.com/v1beta

# ============================================================
# LOGGING
# ============================================================

logging.level.root=INFO
logging.level.com.example.demo=INFO
logging.file.name=/tmp/logs/spring-boot.log
```

---

#### 1.3 Frontend Configuration

**File: `foodsystem/.env`**

```env
REACT_APP_API_URL=https://foodiez-backend-xxx.onrender.com
REACT_APP_API_BASE_URL=https://foodiez-backend-xxx.onrender.com
REACT_APP_GOOGLE_MAPS_KEY=[Your Google Maps API Key]
REACT_APP_GOOGLE_CLIENT_ID=[Your Google OAuth Client ID]
```

---

#### 1.4 Verify pom.xml Dependencies

```xml
<!-- Ensure you have SQL Server driver -->
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <version>12.2.0.jre11</version>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>

<!-- Email -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- WebSocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- WebFlux for HTTP client -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

---

### PHASE 2: AZURE SETUP

#### 2.1 Create SQL Server Database

```
1. Go to: https://portal.azure.com
2. Search: SQL databases
3. Create new:
   - Database name: foodiez
   - Server: Create new
   - Server name: foodiez-server (unique)
   - Admin username: sqladmin
   - Password: [strong password]
   - Pricing: Free tier

4. Get connection string:
   Server=tcp:foodiez-server.database.windows.net,1433;
   Initial Catalog=foodiez;
   Persist Security Info=False;
   User ID=sqladmin@foodiez-server;
   Password=[password];
   Encrypt=True;
   Connection Timeout=30;

5. Convert to Spring Boot:
   jdbc:sqlserver://foodiez-server.database.windows.net:1433;
   database=foodiez;
   encrypt=true;
   trustServerCertificate=false;
   hostNameInCertificate=*.database.windows.net;
   loginTimeout=30;
```

---

### PHASE 3: RENDER SETUP

#### 3.1 Create Backend Web Service

```
1. https://dashboard.render.com
2. New → Web Service
3. Connect GitHub:
   - Repository: trongphuc207/Foodiez
   - Branch: main

4. Configure Service:
   ├─ Name: foodiez-backend
   ├─ Environment: Java
   ├─ Build Command: ./mvnw clean package -DskipTests
   ├─ Start Command: java -jar target/demo-0.0.1-SNAPSHOT.jar
   ├─ Plan: Free
   └─ Instance Type: starter

5. Set Environment Variables:
   ├─ SPRING_DATASOURCE_URL=jdbc:sqlserver://foodiez-server.database.windows.net:1433;database=foodiez;...
   ├─ SPRING_DATASOURCE_USERNAME=sqladmin@foodiez-server
   ├─ SPRING_DATASOURCE_PASSWORD=[Azure SQL password]
   ├─ JWT_SECRET=[generate strong random key]
   ├─ SMTP_HOST=smtp.gmail.com
   ├─ SMTP_PORT=587
   ├─ SMTP_USER=testemaild086@gmail.com
   ├─ SMTP_PASSWORD=[Gmail app password]
   ├─ APP_FRONTEND_URL=https://foodiez-frontend-xxx.onrender.com
   ├─ PAYOS_CLIENT_ID=5513515b-57cc-4a50-83f7-c4fd8d962917
   ├─ PAYOS_API_KEY=fa82899f-08a0-4d3f-96fb-03a2bbd23134
   ├─ PAYOS_CHECKSUM_KEY=ab6f189d5108574c5769199c91cc588362ef73ca156aa9b8449ca45e5f7507b6
   ├─ PAYOS_WEBHOOK_URL=https://foodiez-backend-xxx.onrender.com/api/payos/webhook
   ├─ GEMINI_API_KEY=AIzaSyDn3hcTBHRhy4awsnJ_KIn3QFf8N6Uc5fw
   └─ (Add others as needed)

6. Create Service
   - ⏳ Wait 10-15 minutes for build
   - ✅ Backend live at: https://foodiez-backend-xxx.onrender.com
```

---

#### 3.2 Create Frontend Static Site

```
1. New → Static Site
2. Connect GitHub:
   - Repository: trongphuc207/Foodiez
   - Branch: main
   - Root Directory: foodsystem

3. Configure Service:
   ├─ Name: foodiez-frontend
   ├─ Build Command: npm install --legacy-peer-deps && npm run build
   ├─ Publish Directory: build
   ├─ Plan: Free
   └─ Environment: Node.js

4. Set Environment Variables:
   ├─ REACT_APP_API_URL=https://foodiez-backend-xxx.onrender.com
   ├─ REACT_APP_API_BASE_URL=https://foodiez-backend-xxx.onrender.com
   └─ REACT_APP_GOOGLE_MAPS_KEY=[Google Maps API Key]

5. Create Service
   - ⏳ Wait 5-10 minutes for build
   - ✅ Frontend live at: https://foodiez-frontend-xxx.onrender.com
```

---

### PHASE 4: TESTING & VERIFICATION

#### 4.1 Basic Connectivity Test

```
1. Test Frontend:
   - Open: https://foodiez-frontend-xxx.onrender.com
   - Should load homepage
   - Should see logo, navigation menu

2. Test Backend API:
   - Open: https://foodiez-backend-xxx.onrender.com/api/health
   - Should return: {"status":"UP"}

3. Test Database Connection:
   - Check Render backend logs
   - Should NOT see connection errors
   - Should see: "Database connected successfully"
```

---

#### 4.2 Functional Testing

```
1. Authentication (Login/Signup):
   - Create new account
   - Verify email is sent
   - Click email link → reset password
   - Login with new credentials
   - ✅ JWT token received

2. Customer Operations:
   - Browse products
   - Add to cart
   - Checkout
   - PayOS payment gateway appears
   - ✅ Order created

3. Real-time Features:
   - Chat with seller
   - Messages appear in real-time (WebSocket)
   - ✅ Chat working

4. AI Chatbot:
   - Ask chatbot question
   - Gemini AI responds
   - ✅ AI chat working

5. Seller Dashboard:
   - Login as seller
   - View orders
   - Update order status
   - Notifications in real-time
   - ✅ Seller operations working
```

---

#### 4.3 Performance & Security Check

```
Render Dashboard → Backend service:
├─ Build logs: ✅ No errors
├─ CPU usage: Should be < 50% idle
├─ Memory: Should be < 30% usage
├─ Response time: < 500ms for API calls
├─ Error rate: 0% (no 5xx errors)
└─ Uptime: Running continuously

Security:
├─ HTTPS enabled: ✅ Yes (Render automatic)
├─ JWT tokens working: ✅ Yes
├─ Environment variables hidden: ✅ Yes
├─ No hardcoded passwords: ✅ Yes
├─ Email credentials secure: ✅ Yes
└─ PayOS keys secure: ✅ Yes
```

---

## 🎯 FINAL DELIVERABLES (CỦA BẠN AFTER DEPLOY)

### What Users See:

```
1. Customers:
   ✅ Website: https://foodiez-frontend-xxx.onrender.com
   ✅ Can register/login
   ✅ Can browse restaurants & food
   ✅ Can place orders
   ✅ Can track delivery in real-time
   ✅ Can chat with seller/shipper
   ✅ Receive emails (reset password, order updates)
   ✅ Can rate & review

2. Sellers:
   ✅ Access: https://foodiez-frontend-xxx.onrender.com (seller role)
   ✅ Dashboard with orders
   ✅ Manage products & pricing
   ✅ Process payments
   ✅ Real-time order notifications

3. Shippers:
   ✅ Access: https://foodiez-frontend-xxx.onrender.com (shipper role)
   ✅ Dashboard with delivery orders
   ✅ Update delivery status
   ✅ Track route

4. Admins:
   ✅ System-wide analytics
   ✅ User management
   ✅ Shop approval
   ✅ Dispute resolution

5. System Services:
   ✅ Email notifications (Gmail SMTP)
   ✅ AI chatbot (Gemini API)
   ✅ Real-time chat (WebSocket)
   ✅ Payment processing (PayOS)
   ✅ Database persistence (SQL Server)
   ✅ 24/7 uptime (Render + Azure)
```

---

## 💰 COST BREAKDOWN

```
Frontend (Render):       FREE (forever free tier)
Backend (Render):        FREE (forever free tier)
Database (Azure):        FREE (12 months, 10GB free tier)
Email (Gmail):           FREE (own account)
Payment (PayOS):         Per transaction (charged by PayOS)
AI (Gemini):            FREE (Google free tier quota)
─────────────────────────────────────────
TOTAL INITIAL COST:      $0
MONTHLY AFTER 12 MONTHS: PayOS fees only
```

---

## 📋 QUICK REFERENCE TABLE

| Component | Current | Deployed | Cost |
|-----------|---------|----------|------|
| Frontend | localhost:3000 | foodiez-frontend-xxx.onrender.com | FREE |
| Backend | localhost:8080 | foodiez-backend-xxx.onrender.com | FREE |
| Database | localhost:1433 | Azure SQL Server | FREE (12mo) |
| Email | Local Gmail | Gmail SMTP | FREE |
| Payment | PayOS Test | PayOS Live | Per transaction |
| AI Chat | Gemini API | Gemini API | FREE (quota) |
| Hosting | Your machine | Render + Azure | FREE |
| SSL/TLS | None | Render automatic | FREE |

---

## ✅ FINAL CHECKLIST

Before going live:

```
☑ Code pushed to GitHub (main branch)
☑ SQL Server database created on Azure
☑ Render backend service created
☑ Render frontend service created
☑ All environment variables set
☑ PayOS configured (client ID, keys)
☑ Gemini API key configured
☑ Gmail SMTP credentials working
☑ Email reset link working
☑ Chat (WebSocket) working
☑ Payment gateway working
☑ AI chatbot responding
☑ Frontend → Backend API communication OK
☑ Database persistence working
☑ HTTPS working (automatic Render)
☑ Performance acceptable
☑ No error logs
☑ ✅ READY FOR PUBLIC USE!
```

---

## 🚀 SUMMARY

### Tóm tắt Deployment:

```
1. GITHUB:
   - Push code to trongphuc207/Foodiez (main branch)

2. AZURE:
   - Create SQL Server database
   - Get connection string

3. RENDER:
   - Create 2 services (backend + frontend)
   - Set environment variables
   - Auto-deploy on GitHub push

4. TESTING:
   - Verify frontend loads
   - Verify backend API works
   - Test user features
   - Test payments
   - Test email
   - Test AI chat

5. LIVE:
   - Share public URLs with users
   - Monitor for errors
   - Handle customer support
   - Scale if needed
```

---

## 📞 SUPPORT & MONITORING

### After Deployment:

```
Monitor:
├─ Render Dashboard: Check logs daily
├─ Azure Portal: Monitor database usage
├─ Email failures: Check SMTP logs
├─ Payment errors: Check PayOS webhook logs
└─ User feedback: Listen for issues

Scale Up (if needed):
├─ Render: Upgrade from free tier
├─ Azure SQL: Increase storage/compute
├─ More emails: Consider SendGrid instead of Gmail
└─ More users: Add caching layer (Redis)
```

---

**🎉 DEPLOYMENT COMPLETE! Foodsell Food Delivery Platform is LIVE! 🚀**

**Bạn sẽ có 1 ứng dụng hoàn chỉnh để:**
- Khách hàng đặt hàng online
- Cửa hàng quản lý đơn
- Tài xế giao hàng
- Admin quản lý hệ thống

**Tất cả hoạt động 24/7 trên cloud, không cần máy tính đang chạy! ✅**
