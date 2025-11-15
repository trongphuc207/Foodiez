# 🚀 DEPLOY TỰ ĐỘNG - HƯỚNG DẪN NHANH (5 PHÚT)

---

## 📋 CHUẨN BỊ (Chỉ Làm 1 Lần)

### Bước 1: Tạo GitHub Token

```
1. Đi: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Token name: render-deploy
4. Scopes: ✅ repo
5. Click "Generate"
6. Copy token (lưu vào notepad)
```

### Bước 2: Tạo Render Account

```
1. Đi: https://render.com
2. Sign up with GitHub
3. Done! (Render token không cần ngay)
```

---

## 🎯 CHẠY DEPLOY (Chỉ 3 BƯỚC)

### Bước 1: Mở PowerShell

```powershell
# Windows Key + R
powershell

# Hoặc: Right-click → PowerShell
```

### Bước 2: Navigate đến Project

```powershell
cd E:\ProjectTestFer202\Foodsell
```

### Bước 3: Chạy Script

```powershell
.\deploy-to-render.ps1 -GitHubToken "ghp_xxxxxxxxxxxx" -AppName "foodiez"
```

**Thay `ghp_xxxxxxxxxxxx` = GitHub token bạn copy ở bước chuẩn bị**

---

## ⏳ CHỜ SCRIPT CHẠY (5-10 phút)

Script sẽ tự động:

```
✅ Build Backend (Maven)
✅ Build Frontend (npm)
✅ Commit code
✅ Push lên GitHub
✅ Display Render setup instructions
```

---

## 📱 Sau Khi Script Xong - Làm Trên Render Dashboard

### Step 1: Tạo Backend Service (5 phút)

```
1. https://dashboard.render.com
2. New → Web Service
3. Connect GitHub repo → Foodiez
4. Settings:
   - Name: foodiez-backend
   - Root Directory: demo
   - Build Command: ./mvnw clean package -DskipTests
   - Start Command: java -jar target/demo-0.0.1-SNAPSHOT.jar
   - Environment: Java
5. Create
⏳ Wait for build...
📋 Copy URL: https://foodiez-backend-xxx.onrender.com
```

### Step 2: Tạo Frontend Service (3 phút)

```
1. New → Static Site
2. Connect GitHub repo → Foodiez (same)
3. Settings:
   - Name: foodiez-frontend
   - Root Directory: foodsystem
   - Build Command: npm install --legacy-peer-deps && npm run build
   - Publish Directory: build
4. Create
⏳ Wait for build...
📋 Copy URL: https://foodiez-frontend-xxx.onrender.com
```

### Step 3: Update API URL (1 phút)

```
1. Edit file: foodsystem/src/api/axiosConfig.js
2. Change: const API_URL = 'https://foodiez-backend-xxx.onrender.com'
3. Save
4. Commit & push:
   git add .
   git commit -m "Update API endpoint"
   git push
5. ⏳ Render auto-redeploys (~2 min)
```

### Step 4: Done! 🎉

```
Open: https://foodiez-frontend-xxx.onrender.com
Share link with anyone!
```

---

## 🔧 NẾU CÓ LỖI

### Lỗi: PowerShell không cho chạy script

```powershell
# Chạy lệnh này 1 lần:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Sau đó chạy lại script
```

### Lỗi: Maven not found

```powershell
# Chuyển vào thư mục demo
cd demo

# Chạy Maven trực tiếp
.\mvnw clean package -DskipTests

# Về thư mục cha
cd ..
```

### Lỗi: npm install fail

```powershell
# Clear node_modules
cd foodsystem
rm -r node_modules
rm package-lock.json

# Cài lại
npm install --legacy-peer-deps
```

---

## 📊 CHEATSHEET - Lệnh Hay Dùng

```powershell
# Xem status git
git status

# Xem commit logs
git log --oneline

# Undo commit (chưa push)
git reset --soft HEAD~1

# Force push (sử dụng cẩn thận!)
git push origin main --force

# Check nhánh hiện tại
git branch

# Tạo nhánh mới
git checkout -b feature/new-feature

# Quay lại nhánh main
git checkout main
```

---

## 🎯 SUMMARY

```
1️⃣  Run: .\deploy-to-render.ps1 -GitHubToken "..." -AppName "foodiez"
    ↓
2️⃣  Wait: Script build + push (~5-10 phút)
    ↓
3️⃣  Manual: Create 2 services on Render dashboard (~10 phút)
    ↓
4️⃣  Update: API URL in React (~1 phút)
    ↓
✅ LIVE: https://foodiez-frontend-xxx.onrender.com
```

**Total time: ~20 phút**

---

## 💡 LƯU Ý

- **Free tier**: App sleep sau 15 phút inactivity (wake on first request)
- **Auto-deploy**: Push code → Render tự rebuild
- **Logs**: Check Render dashboard nếu build fail
- **Environment**: Add env vars trong Render settings

---

**READY? Let's do this! 🚀**

```powershell
cd E:\ProjectTestFer202\Foodsell
.\deploy-to-render.ps1 -GitHubToken "ghp_..." -AppName "foodiez"
```
