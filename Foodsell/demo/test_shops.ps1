# Test script để kiểm tra API shops
Write-Host "Testing API shops..."

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/shops" -Method GET
    Write-Host "Success! Shops data:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/shops/names" -Method GET
    Write-Host "Success! Shop names:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error getting shop names: $($_.Exception.Message)"
}
