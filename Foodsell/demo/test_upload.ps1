# Script test upload ảnh sản phẩm
Write-Host "🧪 Testing Product Image Upload..." -ForegroundColor Green

# Kiểm tra xem backend có chạy không
Write-Host "`n1. Kiểm tra backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method GET
    Write-Host "✅ Backend đang chạy. Có $($response.Count) sản phẩm." -ForegroundColor Green
} catch {
    Write-Host "❌ Backend chưa chạy. Hãy chạy: cd demo && mvn spring-boot:run" -ForegroundColor Red
    exit 1
}

# Test upload ảnh cho sản phẩm ID 1
Write-Host "`n2. Test upload ảnh cho sản phẩm ID 1..." -ForegroundColor Yellow

# Tạo file ảnh test (nếu chưa có)
$testImagePath = "test-image.jpg"
if (-not (Test-Path $testImagePath)) {
    Write-Host "⚠️  Không tìm thấy file test-image.jpg" -ForegroundColor Yellow
    Write-Host "Hãy tạo file ảnh test-image.jpg trong thư mục demo/" -ForegroundColor Yellow
    Write-Host "Hoặc sử dụng trang admin: http://localhost:3000/admin" -ForegroundColor Cyan
    exit 0
}

try {
    # Upload ảnh
    $form = @{
        file = Get-Item $testImagePath
    }
    
    $uploadResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/products/1/upload-image" -Method POST -Form $form
    Write-Host "✅ Upload thành công!" -ForegroundColor Green
    Write-Host "📷 Ảnh URL: $($uploadResponse.data.imageUrl)" -ForegroundColor Cyan
    
    # Kiểm tra sản phẩm đã được cập nhật
    Write-Host "`n3. Kiểm tra sản phẩm đã cập nhật..." -ForegroundColor Yellow
    $products = Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method GET
    $product1 = $products | Where-Object { $_.id -eq 1 }
    
    if ($product1.imageUrl) {
        Write-Host "✅ Sản phẩm ID 1 đã có ảnh: $($product1.imageUrl)" -ForegroundColor Green
        Write-Host "🌐 Truy cập ảnh: $($product1.imageUrl)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Sản phẩm ID 1 chưa có ảnh" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Lỗi upload: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Test hoàn thành!" -ForegroundColor Green
Write-Host "📝 Hướng dẫn:" -ForegroundColor Yellow
Write-Host "1. Truy cập: http://localhost:3000/admin để upload ảnh qua giao diện" -ForegroundColor Cyan
Write-Host "2. Hoặc sử dụng Postman với endpoint: POST /api/products/{id}/upload-image" -ForegroundColor Cyan
Write-Host "3. Ảnh sẽ được lưu trong: demo/uploads/product-images/" -ForegroundColor Cyan
