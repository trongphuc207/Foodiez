<#
Run migration helper: backup DB, run migration SQL, and verify columns.

Usage examples:
  # Prompt for password interactively
  .\run_migration.ps1 -SqlServer localhost -Port 1433 -User sa -Database food_delivery_db10

  # Provide password on the command line (not recommended for secrets)
  .\run_migration.ps1 -SqlServer localhost -Port 1433 -User sa -Password 1234 -Database food_delivery_db10 -BackupDir C:\backups

This script expects the migration file `add_cancel_columns_and_created_at.sql` to be in the same folder.
#>

param(
    [string]$SqlServer = "localhost",
    [int]$Port = 1433,
    [string]$User = "sa",
    [string]$Password = "",
    [string]$Database = "food_delivery_db10",
    [string]$MigrationFile = "add_cancel_columns_and_created_at.sql",
    [string]$BackupDir = "C:\backups"
)

function Write-Log { param($m) Write-Host "[run_migration] $m" }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

if ([string]::IsNullOrWhiteSpace($Password)) {
    $secure = Read-Host -Prompt "Enter DB password for $User@$SqlServer" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
}

$instance = "$SqlServer,$Port"

if (-Not (Test-Path $BackupDir)) {
    try { New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null } catch { Write-Log "Could not create backup dir $BackupDir. Error: $_"; exit 1 }
}

$timestamp = (Get-Date).ToString('yyyyMMdd_HHmmss')
$backupFile = Join-Path $BackupDir "$($Database)_pre_migration_$timestamp.bak"

Write-Log "Backing up database '$Database' to '$backupFile'..."
$backupSql = "BACKUP DATABASE [$Database] TO DISK = N'$backupFile' WITH INIT;"
& sqlcmd -S $instance -U $User -P $Password -Q $backupSql
if ($LASTEXITCODE -ne 0) { Write-Log "Backup failed (sqlcmd exit code $LASTEXITCODE). Aborting."; exit 2 }

Write-Log "Running migration file: $MigrationFile"
$migrationPath = Join-Path $scriptDir $MigrationFile
if (-Not (Test-Path $migrationPath)) { Write-Log "Migration file not found at $migrationPath"; exit 3 }

& sqlcmd -S $instance -U $User -P $Password -d $Database -i $migrationPath
if ($LASTEXITCODE -ne 0) { Write-Log "Migration failed (sqlcmd exit code $LASTEXITCODE). Aborting."; exit 4 }

Write-Log "Verifying columns were added..."
$verifyQ = "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='orders' AND COLUMN_NAME IN ('created_at','is_cancelled','cancelled_at','cancelled_by','cancel_reason');"
& sqlcmd -S $instance -U $User -P $Password -d $Database -Q $verifyQ
if ($LASTEXITCODE -ne 0) { Write-Log "Verification query failed (sqlcmd exit code $LASTEXITCODE)."; exit 5 }

Write-Log "Migration script finished. If the verification output above shows the new columns, you're done." 
Write-Log "If you used a temporary DB user or changed permissions, remember to roll them back." 

exit 0
