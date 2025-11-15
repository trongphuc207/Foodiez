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
$ErrorColor = "Red"
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

function Write-ErrorMsg {
    param($Message)
    Write-Status "❌ ERROR: $Message" $ErrorColor
}

# ============================================
# STEP 1: VALIDATE INPUT
# ============================================
Write-Status "STEP 1: Validating inputs..." $Info

if ([string]::IsNullOrWhiteSpace($GitHubToken)) {
    Write-Status "💡 GitHub Token không được cung cấp - sẽ sử dụng existing git config" $Warning
} else {
    Write-Success "GitHub Token provided"
}

if ([string]::IsNullOrWhiteSpace($RenderToken)) {
    Write-Status "💡 Render Token không bắt buộc ngay bây giờ (sẽ tạo thủ công trên dashboard)" $Warning
} else {
    Write-Success "Render Token provided"
}

# ============================================
# STEP 2: CHECK PROJECT STRUCTURE
# ============================================
Write-Status "STEP 2: Checking project structure..." $Info

$ProjectRoot = (Get-Location).Path
$BackendDir = "$ProjectRoot\demo"
$FrontendDir = "$ProjectRoot\foodsystem"

if (!(Test-Path $BackendDir)) {
    Write-ErrorMsg "Backend directory not found at $BackendDir"
    exit 1
}

if (!(Test-Path $FrontendDir)) {
    Write-ErrorMsg "Frontend directory not found at $FrontendDir"
    exit 1
}

Write-Success "Project structure verified"

# ============================================
# STEP 3: GIT SETUP
# ============================================
Write-Status "STEP 3: Preparing Git..." $Info

# Check if git exists
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "Git is not installed! Please install git first."
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
    Write-ErrorMsg "Maven wrapper (mvnw.cmd) not found!"
    Set-Location $ProjectRoot
    exit 1
}

Write-Status "Running Maven clean package..." $Warning
.\mvnw.cmd clean package -DskipTests -q

if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Maven build failed!"
    Set-Location $ProjectRoot
    exit 1
}

# Check if JAR exists
if (!(Test-Path "target\demo-0.0.1-SNAPSHOT.jar")) {
    Write-ErrorMsg "JAR file not created!"
    Set-Location $ProjectRoot
    exit 1
}

Write-Success "Backend built successfully"
Write-Status "JAR file: $(ls target\demo-0.0.1-SNAPSHOT.jar | Select-Object -ExpandProperty Length) bytes" $Info

# ============================================
# STEP 5: BUILD FRONTEND
# ============================================
Write-Status "STEP 5: Building frontend (React)..." $Info

Set-Location $FrontendDir

# Check Node.js
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "Node.js/npm not installed!"
    Set-Location $ProjectRoot
    exit 1
}

Write-Status "Installing frontend dependencies..." $Warning
npm install --legacy-peer-deps

Write-Status "Building React app..." $Warning
npm run build

if (!(Test-Path "build")) {
    Write-ErrorMsg "React build folder not created!"
    Set-Location $ProjectRoot
    exit 1
}

Write-Success "Frontend built successfully"
Write-Status "Build folder size: $(du -s build | Select-Object -First 1)" $Info

# ============================================
# STEP 6: GIT COMMIT & PUSH
# ============================================
Write-Status "STEP 6: Committing and pushing to GitHub..." $Info

Set-Location $ProjectRoot

Write-Status "Staging files..." $Warning
git add -A

# Check if there are changes
$GitStatus = git status --porcelain
if ($GitStatus) {
    Write-Status "Committing..." $Warning
    git commit -m "🚀 Auto-deploy to Render - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" --quiet
    
    Write-Status "Pushing to GitHub..." $Warning
    $currentBranch = git rev-parse --abbrev-ref HEAD
    
    try {
        git push origin $currentBranch --quiet
        Write-Success "Code pushed to GitHub"
    } catch {
        Write-Status "⚠️  Git push encountered an issue - you may need to push manually" $Warning
        Write-Status "Run: git push origin $currentBranch" $Info
    }
} else {
    Write-Status "No changes to commit" $Warning
}

# ============================================
# STEP 7: DISPLAY DEPLOYMENT INSTRUCTIONS
# ============================================
Write-Status "STEP 7: Deployment information..." $Info
Write-Status "" 

$BackendJarSize = (ls $BackendDir\target\demo-0.0.1-SNAPSHOT.jar | Select-Object -ExpandProperty Length) / 1MB
$BuildSize = 0
Get-ChildItem $FrontendDir\build -Recurse | ForEach-Object { $BuildSize += $_.Length }
$BuildSize = $BuildSize / 1MB

Write-Host "
╔════════════════════════════════════════════════════════════╗
║        ✅ BUILD COMPLETED - READY FOR DEPLOYMENT          ║
╚════════════════════════════════════════════════════════════╝

📊 BUILD SUMMARY:
  ✅ Backend: $([Math]::Round($BackendJarSize, 2)) MB
  ✅ Frontend: $([Math]::Round($BuildSize, 2)) MB
  ✅ Code pushed to GitHub

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 YOUR REPOSITORY:
  📍 https://github.com/trongphuc207/Foodiez

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 NEXT STEPS - DEPLOY TO RENDER:

1️⃣  OPEN RENDER DASHBOARD:
    🌐 https://dashboard.render.com

2️⃣  CREATE BACKEND SERVICE:
    ├─ Click: New → Web Service
    ├─ Connect: GitHub (authorize)
    ├─ Repository: Foodiez
    ├─ Settings:
    │  ├─ Name: $AppName-backend
    │  ├─ Root Directory: demo
    │  ├─ Environment: Java
    │  ├─ Build Command:
    │  │  ./mvnw clean package -DskipTests
    │  ├─ Start Command:
    │  │  java -jar target/demo-0.0.1-SNAPSHOT.jar
    │  └─ Instance Type: Free
    └─ Click: Create Web Service
    ⏳ Wait 5-10 minutes for build & deployment...
    📋 After complete: Copy the URL (e.g., https://$AppName-backend-xxx.onrender.com)

3️⃣  CREATE FRONTEND SERVICE:
    ├─ Click: New → Static Site
    ├─ Connect: Foodiez (same repo)
    ├─ Settings:
    │  ├─ Name: $AppName-frontend
    │  ├─ Root Directory: foodsystem
    │  ├─ Build Command:
    │  │  npm install --legacy-peer-deps && npm run build
    │  └─ Publish Directory: build
    └─ Click: Create Static Site
    ⏳ Wait 3-5 minutes for build & deployment...
    📋 After complete: Copy the URL (e.g., https://$AppName-frontend-xxx.onrender.com)

4️⃣  UPDATE API ENDPOINT IN FRONTEND:
    ├─ File: foodsystem/src/api/axiosConfig.js
    ├─ Find: const API_URL = ...
    ├─ Change to: const API_URL = 'https://$AppName-backend-xxx.onrender.com'
    ├─ Save file
    ├─ Run in PowerShell:
    │  ├─ git add .
    │  ├─ git commit -m 'Update API endpoint'
    │  └─ git push
    └─ ⏳ Render auto re-deploys frontend (~2 min)

5️⃣  TEST YOUR APP:
    ├─ Open: https://$AppName-frontend-xxx.onrender.com
    ├─ Test login
    ├─ Test order creation
    ├─ Test other features
    └─ ✅ All working? Great!

6️⃣  SHARE WITH OTHERS:
    ├─ Frontend URL: https://$AppName-frontend-xxx.onrender.com
    ├─ Share on:
    │  ├─ Email to stakeholders
    │  ├─ WhatsApp/Slack to team
    │  └─ Documentation
    └─ Everyone can test now! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 HELPFUL TIPS:

✓ Initial builds take longer (5-10 min)
  → Subsequent deploys are faster (1-2 min)

✓ Free tier apps go to sleep after 15 min inactivity
  → They wake up on first request (slight delay)

✓ Render auto-redeploys when you push to GitHub
  → Useful for quick updates

✓ Check logs in Render if deployment fails
  → Click on service → Logs tab

✓ Use environment variables for secrets
  → Settings → Environment → Add variable

✓ Monitor performance
  → Check Render dashboard for metrics

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 DOCUMENTATION:

• Render Docs: https://render.com/docs
• GitHub Docs: https://docs.github.com
• Spring Boot Deploy: https://spring.io/
• React Deploy: https://create-react-app.dev/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❓ TROUBLESHOOTING:

Problem: Build fails on Render
→ Check logs in Render dashboard
→ Common: Environment variables not set
→ Fix: Add missing env vars in Render settings

Problem: API calls fail
→ Check CORS settings in Spring Boot
→ Update CORS allowed origins:
   spring.web.cors.allowed-origins=https://$AppName-frontend-xxx.onrender.com

Problem: Frontend app blank
→ Check browser console (F12)
→ Look for API errors
→ Verify API_URL is correct

Problem: Database connection error
→ Render free tier may not have MySQL
→ Option 1: Use PostgreSQL (Render recommends)
→ Option 2: Add external MySQL service
→ Option 3: Use MongoDB Atlas (free)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 CONGRATS! Your app is ready to go live!

Questions? Check:
• Render dashboard logs
• GitHub repo
• Project README
• Documentation files

GOOD LUCK! 🚀

" -ForegroundColor Cyan

Write-Success "Script completed successfully!"
Write-Status "Go to https://dashboard.render.com to continue" $Info
