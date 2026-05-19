# ─────────────────────────────────────────────────────────────────────────────
# ShopHub E-Commerce Platform — Dev Startup Script
# Run this from the project root:  .\start-dev.ps1
# ─────────────────────────────────────────────────────────────────────────────

$Root   = $PSScriptRoot
$Svc    = Join-Path $Root "services\product-service"
$Front  = Join-Path $Root "frontend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ShopHub Platform — Starting Services  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check MongoDB is reachable ─────────────────────────────────────────────
Write-Host "[ 1/3 ] Checking MongoDB (localhost:27017)..." -ForegroundColor Yellow
try {
    $conn = New-Object System.Net.Sockets.TcpClient
    $conn.Connect("127.0.0.1", 27017)
    $conn.Close()
    Write-Host "        ✓ MongoDB is running" -ForegroundColor Green
} catch {
    Write-Host "        ✗ MongoDB is NOT running on port 27017!" -ForegroundColor Red
    Write-Host "          Please start MongoDB first, then re-run this script." -ForegroundColor Red
    Write-Host "          (Install: https://www.mongodb.com/try/download/community)" -ForegroundColor Gray
    exit 1
}

# ── 2. Product Service (port 4002) ────────────────────────────────────────────
Write-Host ""
Write-Host "[ 2/3 ] Starting Product Service on :4002 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$Svc'; Write-Host 'Product Service' -ForegroundColor Cyan; npm run dev"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# ── 3. Frontend (port 3000) ───────────────────────────────────────────────────
Write-Host "[ 3/3 ] Starting Frontend on :3000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$Front'; Write-Host 'Frontend (Vite)' -ForegroundColor Cyan; npm run dev"
) -WindowStyle Normal

Start-Sleep -Seconds 4

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "  Frontend  →  http://localhost:3000" -ForegroundColor Green
Write-Host "  Products  →  http://localhost:4002/products" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "TIP: To seed the database run:" -ForegroundColor Gray
Write-Host "     cd services\product-service && npm run seed" -ForegroundColor Gray
Write-Host ""
