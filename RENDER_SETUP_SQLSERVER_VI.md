# 🗄️ RENDER SETUP WITH SQL SERVER - FULL GUIDE

---

## ⚠️ IMPORTANT: SQL Server + Render

```
Vấn đề:
├─ Render FREE tier KHÔNG support SQL Server
├─ Render chỉ support: PostgreSQL, MySQL
├─ SQL Server cần license hoặc setup riêng
└─ ❌ Không thể dùng SQL Server trực tiếp trên Render

Giải pháp:
├─ Option 1: Dùng Azure SQL Database (Azure free tier)
├─ Option 2: Dùng SQL Server trên local (dev only)
├─ Option 3: Dùng PostgreSQL thay thế (recommended)
└─ Option 4: Dùng Azure App Service (trả phí)
```

---

## ✅ OPTION 1: SQL Server + Azure (RECOMMENDED)

### Setup:

```
Cost: FREE (Azure free tier)
├─ 12 tháng free SQL Database
├─ 10GB storage
└─ Không cần credit card

Backend (Render):
├─ Repo: GitHub
├─ Build: mvn + Spring Boot
├─ Deploy: Render Web Service
└─ Cost: FREE tier

Database (Azure):
├─ SQL Server (Azure SQL Database)
├─ 10GB free storage
├─ Accessible từ Render
└─ Cost: FREE tier
```

---

## 🔧 PHẦN 1: SETUP SQL SERVER CONNECTION STRING

### Bước 1: Check Current Config

**File: `demo/src/main/resources/application.properties`**

```properties
# Tìm dòng này:
spring.datasource.url=jdbc:sqlserver://[server].database.windows.net:1433;database=[dbname]
spring.datasource.username=[username]
spring.datasource.password=[password]
spring.datasource.driverClassName=com.microsoft.sqlserver.jdbc.SQLServerDriver
```

---

### Bước 2: Get SQL Server Connection String from Azure

```
1. Go to: https://portal.azure.com
2. Search: "SQL databases"
3. Select your database
4. Copy connection string:
   
   Server=tcp:[server-name].database.windows.net,1433;
   Initial Catalog=[database-name];
   Persist Security Info=False;
   User ID=[username];
   Password=[password];
   Encrypt=True;
   Connection Timeout=30;
```

---

### Bước 3: Convert to Spring Boot Format

```properties
# Azure SQL Server connection string for Spring Boot

spring.datasource.url=jdbc:sqlserver://[server-name].database.windows.net:1433;database=[database-name];encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;

spring.datasource.username=[username]@[server-name]

spring.datasource.password=[password]

spring.datasource.driverClassName=com.microsoft.sqlserver.jdbc.SQLServerDriver

spring.jpa.hibernate.ddl-auto=update

spring.jpa.show-sql=false

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect
```

---

## 🚀 PHẦN 2: SETUP RENDER FOR SPRING BOOT + SQL SERVER

### Bước 1: Create Backend Web Service on Render

```
1. https://dashboard.render.com
2. New → Web Service
3. Select: trongphuc207/Foodiez (GitHub repo)
4. Configure:
```

**Service Config:**
```
Name:                    foodiez-backend
Environment:             Java
Build Command:           ./mvnw clean package -DskipTests
Start Command:           java -jar target/demo-0.0.1-SNAPSHOT.jar
Plan:                    Free
Region:                  Singapore (closest to Vietnam)
Auto-deploy:             Yes
```

**Environment Variables (Important!):**

```
SPRING_DATASOURCE_URL=jdbc:sqlserver://[server-name].database.windows.net:1433;database=[database-name];encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;

SPRING_DATASOURCE_USERNAME=[username]@[server-name]

SPRING_DATASOURCE_PASSWORD=[password]

SPRING_JPA_HIBERNATE_DDL_AUTO=update

SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.SQLServerDialect

APP_FRONTEND_URL=https://foodiez-frontend-xxx.onrender.com
```

---

### Bước 2: Create Frontend Static Site on Render

```
1. New → Static Site
2. Select: trongphuc207/Foodiez (GitHub repo)
3. Configure:
```

**Service Config:**
```
Name:                   foodiez-frontend
Root Directory:         foodsystem
Build Command:          npm install --legacy-peer-deps && npm run build
Publish Directory:      build
Plan:                   Free
Auto-deploy:            Yes
```

**Environment Variables:**

```
REACT_APP_API_URL=https://foodiez-backend-xxx.onrender.com

REACT_APP_API_BASE_URL=https://foodiez-backend-xxx.onrender.com
```

---

## 📋 PHẦN 3: UPDATE APPLICATION.PROPERTIES

### File: `demo/src/main/resources/application.properties`

```properties
# ============================================================
# SQL SERVER Configuration (Azure SQL Database)
# ============================================================

# Using environment variables from Render
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:sqlserver://localhost:1433;database=foodiez;integratedSecurity=true}

spring.datasource.username=${SPRING_DATASOURCE_USERNAME:sa}

spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:}

spring.datasource.driverClassName=com.microsoft.sqlserver.jdbc.SQLServerDriver

# ============================================================
# JPA/Hibernate Configuration
# ============================================================

spring.jpa.database-platform=${SPRING_JPA_DATABASE_PLATFORM:org.hibernate.dialect.SQLServerDialect}

spring.jpa.hibernate.ddl-auto=${SPRING_JPA_HIBERNATE_DDL_AUTO:update}

spring.jpa.show-sql=false

spring.jpa.properties.hibernate.format_sql=true

# ============================================================
# Application Configuration
# ============================================================

app.frontend.url=${APP_FRONTEND_URL:http://localhost:3000}

spring.mail.host=${SMTP_HOST:smtp.gmail.com}

spring.mail.port=${SMTP_PORT:587}

spring.mail.username=${SMTP_USER}

spring.mail.password=${SMTP_PASSWORD}

spring.mail.properties.mail.smtp.auth=true

spring.mail.properties.mail.smtp.starttls.enable=true

spring.mail.properties.mail.smtp.starttls.required=true

# ============================================================
# Server Configuration
# ============================================================

server.port=8080

server.servlet.context-path=/api

logging.level.root=INFO

logging.level.com.example.demo=DEBUG
```

---

## 🔍 PHẦN 4: CHECK POM.XML - Dependencies

### Ensure SQL Server Driver in `pom.xml`:

```xml
<!-- File: demo/pom.xml -->

<dependencies>
    
    <!-- SQL Server Driver -->
    <dependency>
        <groupId>com.microsoft.sqlserver</groupId>
        <artifactId>mssql-jdbc</artifactId>
        <version>12.2.0.jre11</version>
    </dependency>
    
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>
    
    <!-- Other dependencies... -->
    
</dependencies>
```

---

## 🛠️ PHẦN 5: UPDATE REACT FRONTEND

### File: `foodsystem/.env`

```env
REACT_APP_API_URL=https://foodiez-backend-xxx.onrender.com
REACT_APP_API_BASE_URL=https://foodiez-backend-xxx.onrender.com
```

### File: `foodsystem/src/api/axiosConfig.js` (or similar)

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;
```

---

## 📊 PHẦN 6: FULL DEPLOYMENT FLOW

### Architecture:

```
┌─────────────────────────────────────────────────────────┐
│  Client Browser                                         │
│  https://foodiez-frontend-xxx.onrender.com             │
│  (React Static Site)                                    │
└────────────────────┬────────────────────────────────────┘
                     │ API Calls
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Backend Server (Render Web Service)                    │
│  https://foodiez-backend-xxx.onrender.com              │
│  (Spring Boot + Java)                                   │
└────────────────────┬────────────────────────────────────┘
                     │ Query/Update
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Database Server (Azure SQL Database)                   │
│  [server-name].database.windows.net:1433               │
│  (SQL Server 2019/2022)                                │
│  10GB free storage                                      │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ PHẦN 7: STEP-BY-STEP DEPLOYMENT

### Step 1: Update Local Code

```bash
cd E:\ProjectTestFer202\Foodsell

# Update application.properties
# (with environment variables)

# Update .env for React
# (with Render backend URL)

# Commit
git add .
git commit -m "Configure for Render deployment with SQL Server"
git push origin main
```

---

### Step 2: Create Azure SQL Database (if not exists)

```
1. Go to: https://portal.azure.com
2. Create new resource: SQL Database
3. Set:
   ├─ Database name: foodiez
   ├─ Server: Create new
   ├─ Server name: foodiez-server (unique)
   ├─ Admin username: sqladmin
   ├─ Password: [strong password]
   ├─ Firewall: Allow Azure services to access
   └─ Pricing: Free tier (if available)

4. Get connection string:
   ├─ Database settings
   ├─ Connection strings
   ├─ Copy JDBC string
   └─ Save for Render setup
```

---

### Step 3: Create Backend Service on Render

```
1. https://dashboard.render.com
2. New → Web Service
3. Connect GitHub:
   ├─ Select: trongphuc207/Foodiez
   ├─ Branch: main
   └─ Root Dir: demo

4. Configure Service:
   ├─ Name: foodiez-backend
   ├─ Environment: Java
   ├─ Build: ./mvnw clean package -DskipTests
   ├─ Start: java -jar target/demo-0.0.1-SNAPSHOT.jar
   └─ Plan: Free

5. Set Environment Variables:
   ├─ SPRING_DATASOURCE_URL=...
   ├─ SPRING_DATASOURCE_USERNAME=...
   ├─ SPRING_DATASOURCE_PASSWORD=...
   ├─ SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.SQLServerDialect
   └─ APP_FRONTEND_URL=https://foodiez-frontend-xxx.onrender.com

6. Create Service
   ├─ Wait 10-15 min for build
   └─ ✅ Backend live at https://foodiez-backend-xxx.onrender.com
```

---

### Step 4: Create Frontend Service on Render

```
1. New → Static Site
2. Connect GitHub:
   ├─ Select: trongphuc207/Foodiez
   ├─ Branch: main
   └─ Root Dir: foodsystem

3. Configure Service:
   ├─ Name: foodiez-frontend
   ├─ Build: npm install --legacy-peer-deps && npm run build
   ├─ Publish Dir: build
   └─ Plan: Free

4. Set Environment Variables:
   ├─ REACT_APP_API_URL=https://foodiez-backend-xxx.onrender.com
   └─ REACT_APP_API_BASE_URL=https://foodiez-backend-xxx.onrender.com

5. Create Service
   ├─ Wait 5-10 min for build
   └─ ✅ Frontend live at https://foodiez-frontend-xxx.onrender.com
```

---

### Step 5: Test the Deployment

```
1. Open browser: https://foodiez-frontend-xxx.onrender.com
2. Test login, create order, etc.
3. Check backend logs: Render dashboard → foodiez-backend → Logs
4. Check database: Azure Portal → SQL Database → Query Editor
5. ✅ Everything working!
```

---

## 🔐 PHẦN 8: SECURITY CHECKLIST

```
☑ SQL Server password: Strong (uppercase, lowercase, number, symbol)
☑ Connection string: NOT in code (use environment variables)
☑ .env file: In .gitignore (not committed)
☑ Render environment variables: Encrypted storage
☑ Azure firewall: Only allow Render IP ranges
☑ GitHub repo: Private (if sensitive)
☑ Credentials: NOT shared in commit messages
☑ HTTPS: Enabled (automatic on Render + Azure)

✅ Secure setup!
```

---

## ⚠️ PHẦN 9: TROUBLESHOOTING

### Issue 1: Connection Timeout

```
Error: "Timeout waiting for JDBC Connection"

Nguyên nhân:
- SQL Server không accessible
- Network firewall block
- Credentials sai

Giải pháp:
1. Check connection string (copy exact from Azure)
2. Verify credentials
3. Check Azure firewall rules
4. Add Render IP ranges to Azure firewall
```

---

### Issue 2: Authentication Failed

```
Error: "Login failed for user"

Nguyên nhân:
- Username/password sai
- Username không include server name

Giải pháp:
1. Username format: username@servername
   ❌ sqladmin
   ✅ sqladmin@foodiez-server
2. Password: Check quotes, special chars
3. Test locally: Use same credentials
```

---

### Issue 3: Database Not Found

```
Error: "Cannot find database"

Nguyên nhân:
- Database name sai
- Database deleted
- Wrong server

Giải pháp:
1. Verify database name in Azure Portal
2. Verify connection string server name
3. Recreate database if needed
```

---

## 📋 PHẦN 10: ENVIRONMENT VARIABLES SUMMARY

### Render - Backend Service:

```
SPRING_DATASOURCE_URL
└─ Format: jdbc:sqlserver://[server].database.windows.net:1433;database=[db];encrypt=true;...

SPRING_DATASOURCE_USERNAME
└─ Format: username@servername

SPRING_DATASOURCE_PASSWORD
└─ Format: [strong_password]

SPRING_JPA_HIBERNATE_DDL_AUTO
└─ Value: update (or create-drop for fresh deploy)

SPRING_JPA_DATABASE_PLATFORM
└─ Value: org.hibernate.dialect.SQLServerDialect

APP_FRONTEND_URL
└─ Value: https://foodiez-frontend-xxx.onrender.com

SMTP_HOST, SMTP_USER, SMTP_PASSWORD
└─ For email service (Gmail SMTP)
```

---

## 🎯 SUMMARY

```
┌─────────────────────────────────────────────────┐
│  DEPLOYMENT WITH SQL SERVER                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Frontend (React):                              │
│  ├─ Render Static Site                         │
│  ├─ URL: foodiez-frontend-xxx.onrender.com    │
│  └─ Cost: FREE                                 │
│                                                 │
│  Backend (Spring Boot):                         │
│  ├─ Render Web Service                         │
│  ├─ URL: foodiez-backend-xxx.onrender.com     │
│  └─ Cost: FREE                                 │
│                                                 │
│  Database (SQL Server):                         │
│  ├─ Azure SQL Database                         │
│  ├─ Server: [name].database.windows.net       │
│  └─ Cost: FREE (12 months)                     │
│                                                 │
│  Total Cost: $0 (initially)                    │
│                                                 │
│  Setup Time: ~30 minutes                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🚀 QUICK CHECKLIST

```
☑ SQL Server running on Azure SQL Database
☑ Connection string converted to Spring Boot format
☑ application.properties updated with env vars
☑ pom.xml has mssql-jdbc dependency
☑ React .env has correct API URL
☑ application.properties committed to GitHub
☑ Render backend service created
☑ Render frontend service created
☑ Environment variables set in Render
☑ Both services deployed successfully
☑ Database migrated/tables created
☑ Frontend → Backend API communication working
☑ ✅ LIVE AND WORKING!
```

---

**Bạn dùng SQL Server (Azure) + Render (Frontend + Backend) = Complete free deployment! 🚀**
