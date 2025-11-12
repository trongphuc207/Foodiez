# PowerShell helper to run the metadata SQL and save output to a file
# Adjust paths if you moved the SQL file
$scriptPath = "$(Split-Path -Parent $MyInvocation.MyCommand.Definition)\list_order_product_shipper_details.sql"
$outFile = "$(Split-Path -Parent $MyInvocation.MyCommand.Definition)\list_tables_output.txt"

# SQL Server connection settings (from application.properties)
$server = 'tcp:localhost,1433'
$database = 'food_delivery_db10'
$user = 'sa'
$pass = '1234'

Write-Host "Running metadata script against $server / $database ..."

# Use sqlcmd. Ensure it is installed and in PATH. If you prefer Windows auth, replace -U/-P with -E and remove $user/$pass.
$sqlcmd = @(
    '-S', $server,
    '-d', $database,
    '-U', $user,
    '-P', $pass,
    '-i', $scriptPath,
    '-o', $outFile,
    '-y', '65000'
)

# Launch sqlcmd
& sqlcmd @sqlcmd
if ($LASTEXITCODE -eq 0) {
    Write-Host "Script executed. Output written to: $outFile"
} else {
    Write-Host "sqlcmd exited with code $LASTEXITCODE. Check sqlcmd availability and credentials." -ForegroundColor Red
}

Write-Host "If you prefer SSMS: open the .sql file and run it with database set to $database."