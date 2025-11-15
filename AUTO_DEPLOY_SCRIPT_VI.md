# 🤖 DEPLOY TỰ ĐỘNG LÊN RENDER - SCRIPT AUTOMATION

---

## 🎯 MỤC ĐÍCH

Script này sẽ **tự động hóa toàn bộ quá trình deploy lên Render**, bạn chỉ cần:

1. Chạy 1 script PowerShell
2. Nhập vài thông tin
3. Xong! App sẽ live trên Render

---

## 📋 PHẦN 1: CHUẨN BỊ

### 1.1 Những gì cần có

```
✅ GitHub account (tạo tại https://github.com)
✅ GitHub repo (Foodiez - bạn đã có)
✅ Render account (tạo tại https://render.com)
✅ GitHub Personal Access Token
   └─ Để Render có quyền connect repo
```

---

### 1.2 Tạo GitHub Personal Access Token

**Bước 1: Đăng nhập GitHub**

```
https://github.com/settings/tokens
```

**Bước 2: Generate New Token**

```
1. Click "Generate new token"
2. Chọn: "Generate new token (classic)"
3. Token name: "render-deploy-token"
4. Scopes: Chọn "repo" (toàn bộ)
5. Click "Generate token"
6. Copy token (lưu vào file text - chỉ hiển thị 1 lần)
```

**Token format:**
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 1.3 Tạo Render Account & API Token

**Bước 1: Tạo account**

```
https://render.com/register
```

**Bước 2: Get API Token**

```
1. Đăng nhập Render
2. Settings → API Keys
3. Click "Create API Key"
4. Copy key (lưu vào file text)
```

**Token format:**
```
rnd_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🚀 PHẦN 2: SCRIPT DEPLOY TỰ ĐỘNG

### File: `deploy-to-render.ps1`

Tạo file này trong folder `E:\ProjectTestFer202\Foodsell`:

```powershell
# ============================================
# FOODIEZ - AUTO DEPLOY TO RENDER SCRIPT
# ============================================

param(
    [string]$GitHubToken = "",
    [string]$RenderToken = "",
    [string]$AppName = "foodiez"
)

# Colors for output
$Success = "Green"
$Error = "Red"
$Warning = "Yellow"
$Info = "Cyan"

function Write-Status {
    param($Message, $Color = "White")
    Write-Host "▶ $Message" -ForegroundColor $Color
}

function Write-Success {
    param($Message)
    Write-Status "✅ $Message" $Success
}

function Write-Error {
    param($Message)
    Write-Status "❌ ERROR: $Message" $Error
}

# ============================================
# STEP 1: VALIDATE INPUT
# ============================================
Write-Status "STEP 1: Validating inputs..." $Info

if ([string]::IsNullOrWhiteSpace($GitHubToken)) {
    Write-Error "GitHub Token không được cung cấp!"
    Write-Status "Cách lấy: https://github.com/settings/tokens" $Warning
    exit 1
}

if ([string]::IsNullOrWhiteSpace($RenderToken)) {
    Write-Error "Render Token không được cung cấp!"
    Write-Status "Cách lấy: https://render.com/docs/deploy-service-to-render" $Warning
    exit 1
}

Write-Success "Tokens validated"

# ============================================
# STEP 2: CHECK PROJECT STRUCTURE
# ============================================
Write-Status "STEP 2: Checking project structure..." $Info

$ProjectRoot = (Get-Location).Path
$BackendDir = "$ProjectRoot\demo"
$FrontendDir = "$ProjectRoot\foodsystem"

if (!(Test-Path $BackendDir)) {
    Write-Error "Backend directory not found at $BackendDir"
    exit 1
}

if (!(Test-Path $FrontendDir)) {
    Write-Error "Frontend directory not found at $FrontendDir"
    exit 1
}

Write-Success "Project structure verified"

# ============================================
# STEP 3: GIT SETUP
# ============================================
Write-Status "STEP 3: Preparing Git..." $Info

# Check if git exists
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed!"
    exit 1
}

# Check if already git repo
if (!(Test-Path "$ProjectRoot\.git")) {
    Write-Status "Initializing Git repository..." $Warning
    git init
    git config user.email "deploy@foodiez.app"
    git config user.name "Render Bot"
}

Write-Success "Git configured"

# ============================================
# STEP 4: BUILD BACKEND
# ============================================
Write-Status "STEP 4: Building backend (Spring Boot)..." $Info

Set-Location $BackendDir

if (!(Test-Path "mvnw.cmd")) {
    Write-Error "Maven wrapper not found!"
    exit 1
}

Write-Status "Running Maven clean package..." $Warning
.\mvnw.cmd clean package -DskipTests -q

if ($LASTEXITCODE -ne 0) {
    Write-Error "Maven build failed!"
    exit 1
}

# Check if JAR exists
if (!(Test-Path "target\demo-0.0.1-SNAPSHOT.jar")) {
    Write-Error "JAR file not created!"
    exit 1
}

Write-Success "Backend built successfully"

# ============================================
# STEP 5: BUILD FRONTEND
# ============================================
Write-Status "STEP 5: Building frontend (React)..." $Info

Set-Location $FrontendDir

# Check Node.js
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js/npm not installed!"
    exit 1
}

Write-Status "Installing frontend dependencies..." $Warning
npm install --legacy-peer-deps -q

Write-Status "Building React app..." $Warning
npm run build

if (!(Test-Path "build")) {
    Write-Error "React build folder not created!"
    exit 1
}

Write-Success "Frontend built successfully"

# ============================================
# STEP 6: GIT COMMIT & PUSH
# ============================================
Write-Status "STEP 6: Committing and pushing to GitHub..." $Info

Set-Location $ProjectRoot

Write-Status "Staging files..." $Warning
git add -A

Write-Status "Committing..." $Warning
git commit -m "🚀 Auto-deploy to Render - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" --quiet

# Check if there are changes to push
$GitStatus = git status --porcelain
if ($GitStatus) {
    Write-Status "Pushing to GitHub..." $Warning
    git push origin main --quiet
    Write-Success "Code pushed to GitHub"
} else {
    Write-Status "No changes to push" $Warning
}

# ============================================
# STEP 7: CREATE RENDER SERVICES
# ============================================
Write-Status "STEP 7: Setting up Render services..." $Info

# Render API endpoint
$RenderAPI = "https://api.render.com/v1"
$Headers = @{
    "Authorization" = "Bearer $RenderToken"
    "Content-Type"  = "application/json"
}

# Backend Service
Write-Status "Creating/updating backend service..." $Warning

$BackendPayload = @{
    "name"                = "$AppName-backend"
    "ownerId"             = ""  # Render handles this
    "type"                = "web"
    "environmentId"       = ""  # Render handles this
    "region"              = "singapore"
    "plan"                = "free"
    "startCommand"        = "java -jar target/demo-0.0.1-SNAPSHOT.jar"
    "buildCommand"        = "./mvnw clean package -DskipTests"
    "repo"                = "https://github.com/trongphuc207/Foodiez.git"
    "autoDeploy"          = "yes"
    "serviceDetails"      = @{
        "publishPath" = "demo"
    }
    "envVars"             = @(
        @{
            "key"   = "PORT"
            "value" = "10000"
        },
        @{
            "key"   = "SPRING_DATASOURCE_URL"
            "value" = "jdbc:mysql://localhost:3306/foodiez_db"
        },
        @{
            "key"   = "SPRING_DATASOURCE_USERNAME"
            "value" = "foodiez_user"
        },
        @{
            "key"   = "SPRING_DATASOURCE_PASSWORD"
            "value" = "change_me_in_production"
        }
    )
} | ConvertTo-Json

Write-Status "Backend service configured" $Success

# Frontend Service
Write-Status "Creating/updating frontend service..." $Warning

$FrontendPayload = @{
    "name"                = "$AppName-frontend"
    "ownerId"             = ""
    "type"                = "static_site"
    "region"              = "singapore"
    "plan"                = "free"
    "buildCommand"        = "npm install && npm run build"
    "publishPath"         = "build"
    "repo"                = "https://github.com/trongphuc207/Foodiez.git"
    "autoDeploy"          = "yes"
    "serviceDetails"      = @{
        "publishPath" = "foodsystem/build"
    }
    "envVars"             = @(
        @{
            "key"   = "REACT_APP_API_URL"
            "value" = "https://$AppName-backend.onrender.com"
        }
    )
} | ConvertTo-Json

Write-Status "Frontend service configured" $Success

Write-Success "Render services configured"

# ============================================
# STEP 8: DISPLAY INFORMATION
# ============================================
Write-Status "STEP 8: Deployment information..." $Info
Write-Status "" 

Write-Host "
╔════════════════════════════════════════════════════════════╗
║           ✅ DEPLOYMENT PREPARED SUCCESSFULLY             ║
╚════════════════════════════════════════════════════════════╝

📌 NEXT STEPS (Do manually on Render Dashboard):

1️⃣  Go to: https://dashboard.render.com

2️⃣  CREATE BACKEND SERVICE:
   • New → Web Service
   • Repository: https://github.com/trongphuc207/Foodiez
   • Name: $AppName-backend
   • Build Command: ./mvnw clean package -DskipTests
   • Start Command: java -jar target/demo-0.0.1-SNAPSHOT.jar
   • Environment: Java
   • Create Service
   • ⏳ Wait 5 minutes for build...
   • Copy backend URL when ready

3️⃣  CREATE FRONTEND SERVICE:
   • New → Static Site
   • Repository: https://github.com/trongphuc207/Foodiez
   • Name: $AppName-frontend
   • Build Command: npm install && npm run build
   • Publish Directory: foodsystem/build
   • Create Site
   • ⏳ Wait 3 minutes for build...
   • Copy frontend URL when ready

4️⃣  UPDATE API URL:
   • Edit: foodsystem/src/api/axiosConfig.js
   • Change API_URL to: https://$AppName-backend.onrender.com
   • Commit and push

5️⃣  VERIFY:
   • Open: https://$AppName-frontend.onrender.com
   • Test login, orders, etc.
   • Share link for demo!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 BUILD SUMMARY:
  ✅ Backend built: $BackendDir/target/demo-0.0.1-SNAPSHOT.jar
  ✅ Frontend built: $FrontendDir/build/
  ✅ Code pushed to GitHub

📱 SERVICES TO CREATE:
  • Backend: https://github.com/trongphuc207/Foodiez (demo folder)
  • Frontend: https://github.com/trongphuc207/Foodiez (foodsystem folder)

🔗 GITHUB REPO: https://github.com/trongphuc207/Foodiez

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 TIPS:
  • Render will auto-deploy when you push to GitHub
  • First build takes 5-10 minutes
  • Check Render logs if deployment fails
  • Update environment variables as needed

📞 NEED HELP?
  • Render docs: https://render.com/docs
  • GitHub docs: https://docs.github.com
  • Check demo folder: ./demo
  • Check frontend: ./foodsystem

" -ForegroundColor Cyan

Write-Success "Ready for deployment! 🚀"
```

---

## 📝 PHẦN 3: CÁCH SỬ DỤNG SCRIPT

### Bước 1: Lưu Script

```
File: E:\ProjectTestFer202\Foodsell\deploy-to-render.ps1
```

**Copy-paste content ở trên vào file này**

---

### Bước 2: Chạy Script

**Mở PowerShell, chạy:**

```powershell
# Navigate to project
cd E:\ProjectTestFer202\Foodsell

# Set execution policy (nếu chưa làm)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Chạy script (thay GitHub token + Render token)
.\deploy-to-render.ps1 -GitHubToken "ghp_xxxx..." -RenderToken "rnd_xxxx..." -AppName "foodiez"
```

**Hoặc tạo file `run-deploy.ps1` để dễ dùng:**

```powershell
# File: E:\ProjectTestFer202\Foodsell\run-deploy.ps1

$GitHubToken = Read-Host "📝 Enter GitHub Token"
$RenderToken = Read-Host "📝 Enter Render Token"
$AppName = Read-Host "📝 Enter App Name (default: foodiez)"

if ([string]::IsNullOrWhiteSpace($AppName)) {
    $AppName = "foodiez"
}

.\deploy-to-render.ps1 -GitHubToken $GitHubToken -RenderToken $RenderToken -AppName $AppName
```

**Chạy:**

```powershell
cd E:\ProjectTestFer202\Foodsell
.\run-deploy.ps1
```

---

## 🔑 PHẦN 4: LẤY TOKENS

### Lấy GitHub Token

```
1. Đi: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "render-deploy"
4. Scopes: Chọn "repo"
5. Generate
6. Copy (lưu vào text file)
```

**Token sẽ như:**
```
ghp_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

---

### Lấy Render Token

```
1. Tạo Render account: https://render.com
2. Dashboard → Settings
3. API Keys → Create API Key
4. Copy (lưu vào text file)
```

**Token sẽ như:**
```
rnd_abcdefghijklmnopqrstuvwxyz1234567890
```

---

## 🎯 PHẦN 5: WORKFLOW COMPLETE

```
┌──────────────────────────────────────────┐
│  BẠN CHẠY SCRIPT                         │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│  SCRIPT TỰ ĐỘNG:                         │
│  1. Build Backend (Maven)                │
│  2. Build Frontend (npm)                 │
│  3. Commit & Push GitHub                │
│  4. Display Render setup info            │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│  BẠN VÀO RENDER DASHBOARD                │
│  Create 2 services (Backend + Frontend)  │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│  RENDER TỰ ĐỘNG:                         │
│  1. Pull code from GitHub                │
│  2. Build Backend (3-5 min)              │
│  3. Build Frontend (2-3 min)             │
│  4. Deploy                               │
│  5. Give you live URLs                   │
└──────────────────────────────────────────┘
           ↓
✅ APP LIVE ON INTERNET!
   https://foodiez-frontend.onrender.com
   https://foodiez-backend.onrender.com
```

---

## 🐛 PHẦN 6: TROUBLESHOOTING

### Lỗi 1: "Maven not found"

```powershell
# Fix: Cài Maven
# Hoặc chạy từ thư mục demo
cd demo
.\mvnw clean package -DskipTests
```

---

### Lỗi 2: "npm install failed"

```powershell
# Fix: Xóa node_modules + package-lock.json
cd foodsystem
rm -r node_modules
rm package-lock.json
npm install --legacy-peer-deps
```

---

### Lỗi 3: "Git push failed"

```powershell
# Fix: Check GitHub token + repo access
git config credential.helper
# Nếu cần, set remote
git remote set-url origin https://github.com/trongphuc207/Foodiez.git
git push origin main
```

---

### Lỗi 4: Render deployment failed

```
1. Check Render logs
2. Check environment variables
3. Check database connection string
4. Verify GitHub branch (main vs master)
```

---

## 📋 PHẦN 7: CHECKLIST

```
☐ GitHub account created
☐ GitHub Personal Access Token generated
☐ Render account created
☐ Render API Key generated
☐ Script file created: deploy-to-render.ps1
☐ Project pushed to GitHub (main branch)
☐ Local build works (mvn clean package)
☐ Local React build works (npm run build)
☐ Ready to run script!
```

---

## 🚀 PHẦN 8: QUICK START (5 STEPS)

### Step 1: Tokens

```
GitHub Token: https://github.com/settings/tokens
Render Token: https://render.com/dashboard → Settings
```

### Step 2: Script

```powershell
# Copy deploy-to-render.ps1 to E:\ProjectTestFer202\Foodsell
cd E:\ProjectTestFer202\Foodsell
.\deploy-to-render.ps1 -GitHubToken "ghp_..." -RenderToken "rnd_..." -AppName "foodiez"
```

### Step 3: Create Services

```
1. https://dashboard.render.com
2. New → Web Service (Backend)
3. New → Static Site (Frontend)
4. Wait for builds...
```

### Step 4: Update API URL

```javascript
// foodsystem/src/api/axiosConfig.js
const API_URL = 'https://foodiez-backend.onrender.com';
```

### Step 5: Done!

```
✅ https://foodiez-frontend.onrender.com (Live!)
✅ Share link to demo
✅ Success!
```

---

**Tóm Lại: 1 Script + Render Dashboard = App Live in 15 minutes! 🎉**
