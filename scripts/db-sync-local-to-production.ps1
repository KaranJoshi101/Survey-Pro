param(
    [string]$ProductionUrl = $env:PRODUCTION_DATABASE_URL,
    [string]$EnvFile = ".env",
    [string]$BackupDir = "backups"
)

$ErrorActionPreference = 'Stop'

function Parse-EnvFile {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        throw "Env file not found: $Path"
    }

    $values = @{}
    Get-Content $Path | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -match '^\s*$') {
            return
        }

        $parts = $_.Split('=', 2)
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            $values[$key] = $value
        }
    }

    return $values
}

function Ensure-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found in PATH: $Name"
    }
}

function Get-CountsOutput {
    param(
        [string]$Command,
        [string]$Label
    )

    Write-Host "[$Label] collecting counts"
    $output = Invoke-Expression $Command

    if ($LASTEXITCODE -ne 0) {
        throw "Failed collecting counts for $Label"
    }

    return ($output | Where-Object { $_ -and $_.Trim().Length -gt 0 } | ForEach-Object { $_.Trim() })
}

Ensure-Command "pg_dump"
Ensure-Command "pg_restore"
Ensure-Command "psql"

if (-not $ProductionUrl) {
    throw "Production URL is required. Set PRODUCTION_DATABASE_URL or pass -ProductionUrl."
}

$envValues = Parse-EnvFile -Path $EnvFile
$localHost = $envValues['DB_HOST']
$localPort = $envValues['DB_PORT']
$localName = $envValues['DB_NAME']
$localUser = $envValues['DB_USER']
$localPass = $envValues['DB_PASSWORD']

if (-not $localHost -or -not $localPort -or -not $localName -or -not $localUser -or -not $localPass) {
    throw "Missing one or more local DB settings in $EnvFile (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)."
}

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$productionBackupPath = Join-Path $BackupDir "prod_pre_sync_$timestamp.dump"
$localDumpPath = Join-Path $BackupDir "local_sync_$timestamp.dump"

try {
    Write-Output "[1/4] Backing up production database"
    $env:PGSSLMODE = 'require'
    pg_dump --format=custom --no-owner --no-privileges --file "$productionBackupPath" "$ProductionUrl"
    if ($LASTEXITCODE -ne 0) {
        throw "Production backup failed"
    }

    Write-Output "[2/4] Dumping local database"
    $env:PGSSLMODE = 'disable'
    $env:PGPASSWORD = $localPass
    pg_dump --format=custom --clean --if-exists --no-owner --no-privileges --host "$localHost" --port "$localPort" --username "$localUser" --dbname "$localName" --file "$localDumpPath"
    if ($LASTEXITCODE -ne 0) {
        throw "Local database dump failed"
    }

    Write-Output "[3/4] Restoring local dump to production"
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    $env:PGSSLMODE = 'require'
    pg_restore --clean --if-exists --no-owner --no-privileges --single-transaction --dbname "$ProductionUrl" "$localDumpPath"
    if ($LASTEXITCODE -ne 0) {
        throw "Production restore failed"
    }

    Write-Output "[4/4] Verifying local and production counts"
    $countsQuery = "select 'users='||count(*) from users; select 'surveys='||count(*) from surveys; select 'questions='||count(*) from questions; select 'articles='||count(*) from articles; select 'consulting_requests='||count(*) from consulting_requests;"

    $env:PGSSLMODE = 'disable'
    $env:PGPASSWORD = $localPass
    $localCommand = "psql -h $localHost -p $localPort -U $localUser -d $localName -t -A -c `"$countsQuery`""
    $localCounts = Get-CountsOutput -Command $localCommand -Label "local"

    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    $env:PGSSLMODE = 'require'
    $productionCommand = "psql `"$ProductionUrl`" -t -A -c `"$countsQuery`""
    $productionCounts = Get-CountsOutput -Command $productionCommand -Label "production"

    Write-Output "Local counts:"
    $localCounts | ForEach-Object { Write-Output "  $_" }

    Write-Output "Production counts:"
    $productionCounts | ForEach-Object { Write-Output "  $_" }

    if (($localCounts -join "\n") -ne ($productionCounts -join "\n")) {
        throw "Post-sync verification mismatch: local and production counts differ."
    }

    Write-Output "Sync completed successfully"
    Write-Output "Production backup: $productionBackupPath"
    Write-Output "Local dump: $localDumpPath"
}
finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
