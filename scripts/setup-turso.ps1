# Run from anywhere:
#   powershell -ExecutionPolicy Bypass -File .\scripts\setup-turso.ps1
#
# Or from repo root:
#   .\scripts\setup-turso.ps1

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $root ".env.turso"

if (-not (Test-Path $envFile)) {
  Write-Error ".env.turso not found at $envFile"
}

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim().Trim('"')
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
  }
}

if (-not $env:DATABASE_URL -or -not $env:TURSO_AUTH_TOKEN) {
  Write-Error "DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.turso"
}

if ($env:TURSO_AUTH_TOKEN -match '\.\.\.') {
  Write-Error "TURSO_AUTH_TOKEN looks truncated (contains ...). Paste the full token from Turso dashboard."
}

Write-Host "Testing Turso connection..." -ForegroundColor Cyan
Push-Location (Join-Path $root "packages\db")
pnpm run db:test:turso
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }

Write-Host "Generating SQL from Prisma schema..." -ForegroundColor Cyan
pnpm exec prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script -o turso-init.sql
Pop-Location

Write-Host "Applying schema to $($env:DATABASE_URL)..." -ForegroundColor Cyan
Push-Location (Join-Path $root "packages\db")
pnpm run db:push:turso
Pop-Location

Write-Host ""
Write-Host "Done. Copy vars from .env.turso to Vercel Environment Variables." -ForegroundColor Green
