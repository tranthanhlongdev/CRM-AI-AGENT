# Setup Script cho Dự Án CRM - Windows PowerShell
# Chạy lệnh: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "🚀 Bắt đầu setup dự án CRM..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Check if Node.js is installed
Write-Host "Bước 1: Kiểm tra Node.js..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js đã được cài đặt: $nodeVersion"
    
    # Check if version is >= 18
    $majorVersion = [int]($nodeVersion -replace "v", "" -split "\.")[0]
    if ($majorVersion -lt 18) {
        Write-Warning "Node.js version hiện tại là $nodeVersion. Khuyến nghị >= 18.0"
        Write-Info "Hướng dẫn cập nhật: https://nodejs.org/"
    }
} catch {
    Write-Error "Node.js chưa được cài đặt!"
    Write-Info "Vui lòng cài đặt Node.js từ: https://nodejs.org/"
    exit 1
}

# Check if npm is installed
Write-Host ""
Write-Host "Bước 2: Kiểm tra npm..."
try {
    $npmVersion = npm --version
    Write-Success "npm đã được cài đặt: $npmVersion"
} catch {
    Write-Error "npm chưa được cài đặt!"
    exit 1
}

# Check if we're in the right directory
Write-Host ""
Write-Host "Bước 3: Kiểm tra thư mục dự án..."
if (Test-Path "package.json") {
    Write-Success "Đã tìm thấy package.json"
} else {
    Write-Error "Không tìm thấy package.json. Đảm bảo bạn đang ở thư mục gốc của dự án."
    exit 1
}

# Clean previous installations
Write-Host ""
Write-Host "Bước 4: Dọn dẹp installations cũ..."
if (Test-Path "node_modules") {
    Write-Info "Xóa node_modules cũ..."
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "package-lock.json") {
    Write-Info "Xóa package-lock.json cũ..."
    Remove-Item "package-lock.json"
}

# Clear npm cache
Write-Info "Dọn dẹp npm cache..."
npm cache clean --force

Write-Success "Dọn dẹp hoàn tất"

# Install dependencies
Write-Host ""
Write-Host "Bước 5: Cài đặt dependencies..."
Write-Info "Đang chạy npm install..."

$installResult = npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Cài đặt dependencies thành công!"
} else {
    Write-Error "Lỗi khi cài đặt dependencies!"
    exit 1
}

# Create .env file if it doesn't exist
Write-Host ""
Write-Host "Bước 6: Tạo file cấu hình..."
if (-not (Test-Path ".env")) {
    Write-Info "Tạo file .env..."
    @"
# Environment Configuration
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:5000

# Debug mode
VITE_DEBUG=true

# App Information
VITE_APP_NAME=CRM Application
VITE_APP_VERSION=1.0.0
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Success "Đã tạo file .env"
} else {
    Write-Success "File .env đã tồn tại"
}

# Setup database (if SQLite)
Write-Host ""
Write-Host "Bước 7: Setup database..."
if (Test-Path "Database_Customers_Schema.sql") {
    try {
        sqlite3 --version | Out-Null
        Write-Info "Tạo database từ schema..."
        sqlite3 database.db ".read Database_Customers_Schema.sql"
        Write-Success "Database đã được tạo: database.db"
    } catch {
        Write-Warning "SQLite3 chưa được cài đặt. Bạn có thể cài đặt sau:"
        Write-Info "Windows: Download từ https://sqlite.org/"
        Write-Info "Hoặc sử dụng: winget install SQLite.SQLite"
    }
} else {
    Write-Warning "Không tìm thấy Database_Customers_Schema.sql"
}

# Create scripts directory and helper files
Write-Host ""
Write-Host "Bước 8: Tạo helper scripts..."
if (-not (Test-Path "scripts")) {
    New-Item -ItemType Directory -Name "scripts"
}

# Create development script
@"
@echo off
echo 🚀 Starting CRM Development Server...
echo Frontend sẽ chạy tại: http://localhost:5173
echo Backend cần chạy tại: http://localhost:5000
echo.
echo Nhấn Ctrl+C để dừng server
echo.
npm run dev
"@ | Out-File -FilePath "scripts\dev.bat" -Encoding UTF8

# Create build script
@"
@echo off
echo 🏗️  Building CRM for production...
npm run build
echo ✅ Build hoàn tất! Check thư mục dist/
pause
"@ | Out-File -FilePath "scripts\build.bat" -Encoding UTF8

Write-Success "Đã tạo helper scripts trong thư mục scripts/"

# Check for potential issues
Write-Host ""
Write-Host "Bước 9: Kiểm tra potential issues..."

# Check port 5173
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Warning "Port 5173 đang được sử dụng. Frontend có thể sử dụng port khác."
}

# Check port 5000
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Success "Port 5000 đang được sử dụng (có thể là backend server)"
} else {
    Write-Warning "Port 5000 chưa được sử dụng. Bạn cần setup backend server."
}

# Final summary
Write-Host ""
Write-Host "🎉 Setup hoàn tất!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Success "Dự án CRM đã được setup thành công!"
Write-Host ""
Write-Host "📋 Bước tiếp theo:"
Write-Host "   1. Chạy frontend: npm run dev"
Write-Host "   2. Setup backend server tại port 5000 (xem SETUP_GUIDE.md)"
Write-Host "   3. Truy cập: http://localhost:5173"
Write-Host ""
Write-Host "📁 Files đã tạo:"
Write-Host "   - .env (cấu hình environment)"
Write-Host "   - database.db (SQLite database)"
Write-Host "   - scripts/ (helper scripts)"
Write-Host "   - SETUP_GUIDE.md (hướng dẫn chi tiết)"
Write-Host ""
Write-Host "🔧 Helper commands:"
Write-Host "   - npm run dev              # Start development server"
Write-Host "   - npm run build            # Build for production"
Write-Host "   - npm run lint             # Check code quality"
Write-Host "   - scripts\dev.bat          # Quick start script"
Write-Host ""
Write-Host "📖 Đọc SETUP_GUIDE.md để biết thêm chi tiết!"
Write-Host ""
Write-Info "Happy coding! 🚀"

Write-Host ""
Write-Host "Nhấn phím bất kỳ để đóng..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
