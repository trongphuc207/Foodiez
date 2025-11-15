# 🚀 RENDER DEPLOYMENT - STEP BY STEP GUIDE

---

## 📋 TÌNH HÌNH CỦA BẠN

```
✅ Code trên GitHub: trongphuc207/Foodiez
✅ Branch deploy: feature/checkout-districts
✅ Backend: Spring Boot (Foodsell/demo)
✅ Frontend: React (Foodsell/foodsystem)
✅ Database: SQL Server (Azure)
```

---

## 🎯 MỤC ĐÍCH

Deploy Foodsell lên Render để:
- Frontend: `https://foodiez-frontend-xxx.onrender.com`
- Backend: `https://foodiez-backend-xxx.onrender.com`
- Database: Azure SQL Server

---

## ⚠️ PREREQUISITES (Chuẩn bị trước)

```
☑ GitHub account (có rồi)
☑ Render account (cần tạo)
☑ Azure account (cần tạo)
☑ Gmail account (có rồi)
```

---

## 📍 BƯỚC 1: TẠO RENDER ACCOUNT

```
1. Go to: https://render.com
2. Click "Get Started"
3. Sign up with GitHub:
   ├─ Click "Sign up with GitHub"
   ├─ Authorize Render
   └─ ✅ Account created

4. Go to Dashboard: https://dashboard.render.com
   └─ ✅ Ready to create services
```

---

## 📍 BƯỚC 2: TẠO AZURE SQL DATABASE

### 2.1 Create Azure Account

```
1. Go to: https://azure.microsoft.com/free
2. Click "Start free"
3. Sign in with Microsoft account
4. Verify email
5. ✅ Free tier activated ($200 credit for 30 days)
```

### 2.2 Create SQL Database

```
1. Go to: https://portal.azure.com
2. Search: "SQL databases"
3. Click "Create"
4. Fill form:
   ├─ Subscription: Choose one
   ├─ Resource group: Create new → "foodiez-rg"
   ├─ Database name: "foodiez_db"
   ├─ Server: "Create new"
   │  ├─ Server name: "foodiez-server" (must be unique)
   │  ├─ Location: Southeast Asia (closest to Vietnam)
   │  ├─ Admin username: "sqladmin"
   │  ├─ Password: [Strong password - save this!]
   │  │  Example: "P@ssw0rd!Foodiez2025"
   │  └─ ✅ Create
   ├─ Compute + Storage: Basic (for free tier)
   └─ ✅ Review + Create

5. Wait ~5 minutes for deployment
   └─ ✅ Database created
```

### 2.3 Get Connection String

```
1. Go to: Azure Portal → SQL databases → foodiez_db
2. Click "Connection strings"
3. Copy JDBC string:

   jdbc:sqlserver://foodiez-server.database.windows.net:1433;database=foodiez_db;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;

4. Save this string for later!
```

---

## 📍 BƯỚC 3: CREATE BACKEND SERVICE ON RENDER

### 3.1 Start Creating Service

```
1. Go to: https://dashboard.render.com
2. Click: "New +" → "Web Service"
3. Connect GitHub:
   ├─ Click "Connect account"
   ├─ Authorize Render to access your GitHub
   ├─ Select repository: "Foodiez"
   └─ ✅ Connected
```

### 3.2 Configure Backend Service

```
Fill form with these values:

Name:                   foodiez-backend
Root Directory:         Foodsell/demo
Environment:            Java
Build Command:          ./mvnw clean package -DskipTests
Start Command:          java -jar target/demo-0.0.1-SNAPSHOT.jar
Plan:                   Free
Instance Type:          Starter

⭐ IMPORTANT: Branch = feature/checkout-districts
(NOT main - because main doesn't have code)
```

### 3.3 Set Environment Variables

```
Click "Environment" tab and add these variables:

SPRING_DATASOURCE_URL
├─ Value: jdbc:sqlserver://foodiez-server.database.windows.net:1433;database=foodiez_db;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;

SPRING_DATASOURCE_USERNAME
├─ Value: sqladmin@foodiez-server

SPRING_DATASOURCE_PASSWORD
├─ Value: [Your Azure SQL password]

SPRING_JPA_HIBERNATE_DDL_AUTO
├─ Value: update

SPRING_JPA_DATABASE_PLATFORM
├─ Value: org.hibernate.dialect.SQLServer2012Dialect

JWT_SECRET
├─ Value: [Generate a strong random key]
│  Example: your_super_secret_key_12345678901234567890

SMTP_HOST
├─ Value: smtp.gmail.com

SMTP_PORT
├─ Value: 587

SMTP_USER
├─ Value: testemaild086@gmail.com

SMTP_PASSWORD
├─ Value: esfz jvcf lfrc xfgq
│  (Gmail app password - same from application.properties)

APP_FRONTEND_URL
├─ Value: https://foodiez-frontend-xxx.onrender.com
│  (Replace xxx with actual Render domain - we'll get this later)

PAYOS_CLIENT_ID
├─ Value: 5513515b-57cc-4a50-83f7-c4fd8d962917

PAYOS_API_KEY
├─ Value: fa82899f-08a0-4d3f-96fb-03a2bbd23134

PAYOS_CHECKSUM_KEY
├─ Value: ab6f189d5108574c5769199c91cc588362ef73ca156aa9b8449ca45e5f7507b6

PAYOS_WEBHOOK_URL
├─ Value: https://foodiez-backend-xxx.onrender.com/api/payos/webhook
│  (Replace xxx with actual backend domain)

GEMINI_API_KEY
├─ Value: AIzaSyDn3hcTBHRhy4awsnJ_KIn3QFf8N6Uc5fw
```

### 3.4 Create Service

```
1. Click "Create Web Service"
2. ⏳ Wait 10-15 minutes for first build
3. Watch logs for errors
4. ✅ When green: "Your service is live"
5. Note the URL: https://foodiez-backend-xxx.onrender.com
```

---

## 📍 BƯỚC 4: UPDATE FRONTEND WITH BACKEND URL

### 4.1 Get Backend URL

```
From Render dashboard:
├─ foodiez-backend service
├─ Copy the URL (example: https://foodiez-backend-abc123.onrender.com)
└─ Save for frontend config
```

### 4.2 Update Frontend Environment

**Locally update file: `Foodsell/foodsystem/.env`**

```env
REACT_APP_API_URL=https://foodiez-backend-abc123.onrender.com
REACT_APP_API_BASE_URL=https://foodiez-backend-abc123.onrender.com
```

### 4.3 Commit & Push

```bash
cd E:\ProjectTestFer202
git add Foodsell/foodsystem/.env
git commit -m "Update backend URL for production"
git push origin feature/checkout-districts
```

---

## 📍 BƯỚC 5: CREATE FRONTEND SERVICE ON RENDER

### 5.1 Start Creating Service

```
1. Go to: https://dashboard.render.com
2. Click: "New +" → "Static Site"
3. Connect GitHub: Select "Foodiez" repo
```

### 5.2 Configure Frontend Service

```
Fill form:

Name:                   foodiez-frontend
Root Directory:         Foodsell/foodsystem
Build Command:          npm install --legacy-peer-deps && npm run build
Publish Directory:      build
Plan:                   Free

⭐ Branch: feature/checkout-districts
```

### 5.3 Set Environment Variables

```
REACT_APP_API_URL
├─ Value: https://foodiez-backend-abc123.onrender.com
│  (Same backend URL from step 4)

REACT_APP_API_BASE_URL
├─ Value: https://foodiez-backend-abc123.onrender.com
```

### 5.4 Create Service

```
1. Click "Create Static Site"
2. ⏳ Wait 5-10 minutes for build
3. ✅ When live, note URL: https://foodiez-frontend-xyz789.onrender.com
```

---

## 📍 BƯỚC 6: UPDATE BACKEND WITH FRONTEND URL

### 6.1 Update Backend Env Var

```
Go back to Render Dashboard:
1. foodiez-backend service
2. Settings → Environment
3. Update:
   APP_FRONTEND_URL = https://foodiez-frontend-xyz789.onrender.com
   (Use frontend URL from step 5.4)

4. Click "Save"
5. Service auto-redeploys
6. ⏳ Wait 2-3 minutes
```

---

## 🧪 BƯỚC 7: TESTING

### 7.1 Test Frontend Loads

```
1. Open: https://foodiez-frontend-xyz789.onrender.com
2. Should see:
   ├─ Foodsell homepage
   ├─ Navigation menu
   ├─ Login button
   └─ Product list (empty first time)
3. ✅ Frontend working!
```

### 7.2 Test Backend API

```
1. Open: https://foodiez-backend-abc123.onrender.com/api/health
2. Should return:
   ├─ Status 200 OK
   ├─ Message: "Backend is running"
   └─ ✅ Backend working!
```

### 7.3 Test Database Connection

```
Check backend logs:
1. Render dashboard → foodiez-backend
2. Click "Logs"
3. Look for: "Database connected successfully"
4. If error: Check connection string & credentials
   ├─ Azure SQL password correct?
   ├─ Database name correct?
   ├─ Username format: sqladmin@foodiez-server?
```

### 7.4 Test Frontend → Backend Communication

```
1. On frontend, try login
2. Check backend logs for request
3. Look for errors in browser console (F12)
4. If CORS error:
   ├─ Add CORS headers to backend
   ├─ Test again
```

### 7.5 Test User Features

```
1. Sign up new account
   ├─ Should receive confirmation email
   ├─ ✅ Email working!

2. Browse products
   ├─ Should load from database
   ├─ ✅ Database working!

3. Start chat (if implemented)
   ├─ Should connect via WebSocket
   ├─ ✅ Real-time working!

4. Try payment (if implemented)
   ├─ PayOS gateway should appear
   ├─ ✅ Payment working!
```

---

## 📊 TROUBLESHOOTING

### Issue 1: Backend Build Fails

```
Error: "Build failed"

Check logs for:
├─ Maven compilation errors
├─ Dependency issues
├─ Java version mismatch

Solution:
1. Check pom.xml (SQL Server driver?)
2. Check application.properties (syntax?)
3. Try building locally: ./mvnw clean package
4. Fix errors locally → Push → Render auto-rebuilds
```

### Issue 2: Database Connection Error

```
Error: "Timeout waiting for JDBC Connection"

Check:
├─ Connection string correct?
├─ Username: sqladmin@foodiez-server (not just sqladmin)
├─ Password correct?
├─ Database name correct?
├─ Azure firewall allows Render IP?

Solution:
1. Test connection locally
2. Verify credentials in Azure Portal
3. Add Render IP to Azure firewall (if needed)
```

### Issue 3: Frontend Can't Reach Backend

```
Error: CORS error or "Cannot GET /api/..."

Check:
├─ Backend URL correct in .env?
├─ Backend actually running?
├─ Backend CORS configured?

Solution:
1. Check frontend .env has correct backend URL
2. Test backend directly: https://foodiez-backend-xxx.onrender.com/api/health
3. Add CORS headers to Spring Boot
```

### Issue 4: Build Timeout (>15 minutes)

```
Render free tier has limits.

Solution:
├─ Large dependencies slow build
├─ Try --legacy-peer-deps for npm
├─ Upgrade to paid tier if persistent
```

---

## ✅ SUCCESS CHECKLIST

```
After deployment, verify:

☑ Frontend loads: https://foodiez-frontend-xxx.onrender.com
☑ Backend responds: https://foodiez-backend-xxx.onrender.com/api/health
☑ Database connected (check logs)
☑ Can sign up new account
☑ Email verification works
☑ Can login
☑ Can browse products
☑ Chat works (if implemented)
☑ Payment gateway appears (if implemented)
☑ No 5xx errors in logs
☑ Page loads within 5 seconds
☑ All links working
☑ Responsive on mobile
☑ ✅ READY FOR USERS!
```

---

## 📱 FINAL URLs

```
Share these with users:

Frontend (Main App):
https://foodiez-frontend-xxx.onrender.com

Admin Dashboard (if exists):
https://foodiez-frontend-xxx.onrender.com/admin

Seller Dashboard:
https://foodiez-frontend-xxx.onrender.com/seller

Shipper App:
https://foodiez-frontend-xxx.onrender.com/shipper

API Docs (if available):
https://foodiez-backend-xxx.onrender.com/api/docs
```

---

## 🔄 CONTINUOUS DEPLOYMENT

After initial deployment:

```
Every time you push code:

1. Change code locally
2. git add .
3. git commit -m "Feature: description"
4. git push origin feature/checkout-districts

Render will automatically:
├─ Detect new commit
├─ Build project
├─ Run tests
├─ Deploy to live server
├─ Zero downtime update!
└─ ✅ Live within 5-10 minutes
```

---

## 🎯 QUICK REFERENCE

| Step | What to Do | Time |
|------|-----------|------|
| 1 | Create Render account | 5 min |
| 2 | Create Azure SQL Database | 10 min |
| 3 | Create Render backend service | 15 min |
| 4 | Update frontend .env | 5 min |
| 5 | Create Render frontend service | 10 min |
| 6 | Update backend frontend URL | 5 min |
| 7 | Testing & verification | 15 min |
| **TOTAL** | **Full deployment** | **~65 min** |

---

## 📞 SUPPORT

If stuck:

```
1. Check Render logs (Logs tab in dashboard)
2. Check Azure Portal for database status
3. Try local build: ./mvnw clean package
4. Search error message on Google
5. Contact Render support: https://support.render.com
```

---

## 🎉 SUMMARY

```
✅ Step 1: Render account
✅ Step 2: Azure SQL Database
✅ Step 3: Backend on Render
✅ Step 4: Update frontend config
✅ Step 5: Frontend on Render
✅ Step 6: Update backend config
✅ Step 7: Test everything
✅ ✅ FOODSELL IS LIVE! 🚀
```

---

**Bạn có thể deploy ngay! Làm theo guide này từ A tới Z, trong ~1 giờ Foodsell sẽ live trên internet! 🚀**
