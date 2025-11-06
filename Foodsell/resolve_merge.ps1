# Script to resolve git merge conflict
# Run this script in PowerShell

Write-Host "=== Resolving Git Merge Conflict ===" -ForegroundColor Cyan

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git not found in PATH. Please add Git to your PATH or run commands manually." -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "1. git add demo/src/main/resources/application.properties"
    Write-Host "2. git status  (check for other conflicts)"
    Write-Host "3. git commit -m 'Resolve merge conflict: keep application.properties from mergecode branch'"
    exit 1
}

# Step 1: Add the resolved file
Write-Host "`nStep 1: Adding resolved file..." -ForegroundColor Yellow
git add demo/src/main/resources/application.properties

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ File added successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to add file" -ForegroundColor Red
    exit 1
}

# Step 2: Check status
Write-Host "`nStep 2: Checking git status..." -ForegroundColor Yellow
git status

# Step 3: Commit merge
Write-Host "`nStep 3: Committing merge..." -ForegroundColor Yellow
git commit -m "Resolve merge conflict: keep application.properties from mergecode branch"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Merge conflict resolved successfully!" -ForegroundColor Green
    Write-Host "You can now continue working." -ForegroundColor Green
} else {
    Write-Host "`n✗ Failed to commit. Please check for other conflicts." -ForegroundColor Red
    Write-Host "Run 'git status' to see what needs to be resolved." -ForegroundColor Yellow
}

