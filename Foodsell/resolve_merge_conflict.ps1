# Script to resolve git merge conflict
# Run this script in PowerShell

Write-Host "=== Resolving Git Merge Conflict ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a git repository. Please run this script in the project root." -ForegroundColor Red
    exit 1
}

# Step 1: Check git status
Write-Host "Step 1: Checking git status..." -ForegroundColor Yellow
Write-Host ""

# Try to find git
$gitPath = $null
$possiblePaths = @(
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\git.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $gitPath = $path
        break
    }
}

if ($null -eq $gitPath) {
    Write-Host "❌ Git not found. Please install Git or add it to PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "1. Open Git Bash or Command Prompt with Git"
    Write-Host "2. Run: git add demo/src/main/resources/application.properties"
    Write-Host "3. Run: git status"
    Write-Host "4. Run: git commit -m 'Resolve merge conflict: keep application.properties from mergecode branch'"
    exit 1
}

# Use full path to git
function Invoke-Git {
    param([string[]]$Arguments)
    & $gitPath $Arguments
    return $LASTEXITCODE
}

# Check status first
Write-Host "Checking git status..." -ForegroundColor Cyan
$statusOutput = Invoke-Git @("status", "--porcelain")
Write-Host $statusOutput

# Check for unmerged files
$unmergedFiles = Invoke-Git @("diff", "--name-only", "--diff-filter=U")
if ($unmergedFiles) {
    Write-Host ""
    Write-Host "Unmerged files found:" -ForegroundColor Yellow
    $unmergedFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
}

# Step 2: Add resolved file
Write-Host "Step 2: Adding resolved file (application.properties)..." -ForegroundColor Yellow
$result = Invoke-Git @("add", "demo/src/main/resources/application.properties")

if ($result -eq 0) {
    Write-Host "✓ File added successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to add file. Exit code: $result" -ForegroundColor Red
    exit 1
}

# Step 3: Check if there are other conflicts
Write-Host ""
Write-Host "Step 3: Checking for other conflicts..." -ForegroundColor Yellow
$remainingConflicts = Invoke-Git @("diff", "--name-only", "--diff-filter=U")

if ($remainingConflicts) {
    Write-Host "⚠️  Other conflicts found:" -ForegroundColor Yellow
    $remainingConflicts | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "Please resolve these conflicts manually before committing." -ForegroundColor Yellow
} else {
    Write-Host "✓ No other conflicts found" -ForegroundColor Green
}

# Step 4: Commit merge
Write-Host ""
Write-Host "Step 4: Committing merge..." -ForegroundColor Yellow
$commitResult = Invoke-Git @("commit", "-m", "Resolve merge conflict: keep application.properties from mergecode branch")

if ($commitResult -eq 0) {
    Write-Host ""
    Write-Host "✓ Merge conflict resolved successfully!" -ForegroundColor Green
    Write-Host "You can now continue working." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Commit failed. Exit code: $commitResult" -ForegroundColor Yellow
    Write-Host "This might be because:" -ForegroundColor Yellow
    Write-Host "  1. There are other unresolved conflicts" -ForegroundColor Yellow
    Write-Host "  2. No changes to commit" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run 'git status' to see what needs to be resolved." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Current git status:" -ForegroundColor Cyan
Invoke-Git @("status")

