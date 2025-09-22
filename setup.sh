#!/bin/bash

# Setup Script cho Dự Án CRM
# Chạy lệnh: bash setup.sh

echo "🚀 Bắt đầu setup dự án CRM..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
echo "Bước 1: Kiểm tra Node.js..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_status "Node.js đã được cài đặt: $NODE_VERSION"
    
    # Check if version is >= 18
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
        print_warning "Node.js version hiện tại là $NODE_VERSION. Khuyến nghị >= 18.0"
        print_info "Hướng dẫn cập nhật: https://nodejs.org/"
    fi
else
    print_error "Node.js chưa được cài đặt!"
    print_info "Vui lòng cài đặt Node.js từ: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
echo ""
echo "Bước 2: Kiểm tra npm..."
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_status "npm đã được cài đặt: $NPM_VERSION"
else
    print_error "npm chưa được cài đặt!"
    exit 1
fi

# Check if we're in the right directory
echo ""
echo "Bước 3: Kiểm tra thư mục dự án..."
if [ -f "package.json" ]; then
    print_status "Đã tìm thấy package.json"
else
    print_error "Không tìm thấy package.json. Đảm bảo bạn đang ở thư mục gốc của dự án."
    exit 1
fi

# Clean previous installations
echo ""
echo "Bước 4: Dọn dẹp installations cũ..."
if [ -d "node_modules" ]; then
    print_info "Xóa node_modules cũ..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    print_info "Xóa package-lock.json cũ..."
    rm -f package-lock.json
fi

# Clear npm cache
print_info "Dọn dẹp npm cache..."
npm cache clean --force

print_status "Dọn dẹp hoàn tất"

# Install dependencies
echo ""
echo "Bước 5: Cài đặt dependencies..."
print_info "Đang chạy npm install..."

if npm install; then
    print_status "Cài đặt dependencies thành công!"
else
    print_error "Lỗi khi cài đặt dependencies!"
    exit 1
fi

# Create .env file if it doesn't exist
echo ""
echo "Bước 6: Tạo file cấu hình..."
if [ ! -f ".env" ]; then
    print_info "Tạo file .env..."
    cat > .env << EOL
# Environment Configuration
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:5000

# Debug mode
VITE_DEBUG=true

# App Information
VITE_APP_NAME=CRM Application
VITE_APP_VERSION=1.0.0
EOL
    print_status "Đã tạo file .env"
else
    print_status "File .env đã tồn tại"
fi

# Setup database (if SQLite)
echo ""
echo "Bước 7: Setup database..."
if [ -f "Database_Customers_Schema.sql" ]; then
    if command -v sqlite3 >/dev/null 2>&1; then
        print_info "Tạo database từ schema..."
        sqlite3 database.db < Database_Customers_Schema.sql
        print_status "Database đã được tạo: database.db"
    else
        print_warning "SQLite3 chưa được cài đặt. Bạn có thể cài đặt sau:"
        print_info "macOS: brew install sqlite"
        print_info "Ubuntu: sudo apt-get install sqlite3"
        print_info "Windows: Download từ https://sqlite.org/"
    fi
else
    print_warning "Không tìm thấy Database_Customers_Schema.sql"
fi

# Create scripts directory and helper files
echo ""
echo "Bước 8: Tạo helper scripts..."
mkdir -p scripts

# Create development script
cat > scripts/dev.sh << 'EOL'
#!/bin/bash
echo "🚀 Starting CRM Development Server..."
echo "Frontend sẽ chạy tại: http://localhost:5173"
echo "Backend cần chạy tại: http://localhost:5000"
echo ""
echo "Nhấn Ctrl+C để dừng server"
echo ""
npm run dev
EOL

# Create build script
cat > scripts/build.sh << 'EOL'
#!/bin/bash
echo "🏗️  Building CRM for production..."
npm run build
echo "✅ Build hoàn tất! Check thư mục dist/"
EOL

# Create test script
cat > scripts/test.sh << 'EOL'
#!/bin/bash
echo "🧪 Running tests..."
echo "Testing bot integration..."
if [ -f "test-bot-integration.js" ]; then
    npm run test:bot
else
    echo "⚠️  test-bot-integration.js không tồn tại"
fi

echo "Testing cards integration..."
if [ -f "test-cards-integration.js" ]; then
    npm run test:cards:integration
else
    echo "⚠️  test-cards-integration.js không tồn tại"
fi
EOL

# Make scripts executable
chmod +x scripts/*.sh

print_status "Đã tạo helper scripts trong thư mục scripts/"

# Check for potential issues
echo ""
echo "Bước 9: Kiểm tra potential issues..."

# Check port 5173
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 5173 đang được sử dụng. Frontend có thể sử dụng port khác."
fi

# Check port 5000
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_status "Port 5000 đang được sử dụng (có thể là backend server)"
else
    print_warning "Port 5000 chưa được sử dụng. Bạn cần setup backend server."
fi

# Final summary
echo ""
echo "🎉 Setup hoàn tất!"
echo "================================"
print_status "Dự án CRM đã được setup thành công!"
echo ""
echo "📋 Bước tiếp theo:"
echo "   1. Chạy frontend: npm run dev"
echo "   2. Setup backend server tại port 5000 (xem SETUP_GUIDE.md)"
echo "   3. Truy cập: http://localhost:5173"
echo ""
echo "📁 Files đã tạo:"
echo "   - .env (cấu hình environment)"
echo "   - database.db (SQLite database)"
echo "   - scripts/ (helper scripts)"
echo "   - SETUP_GUIDE.md (hướng dẫn chi tiết)"
echo ""
echo "🔧 Helper commands:"
echo "   - npm run dev          # Start development server"
echo "   - npm run build        # Build for production"
echo "   - npm run lint         # Check code quality"
echo "   - ./scripts/dev.sh     # Quick start script"
echo ""
echo "📖 Đọc SETUP_GUIDE.md để biết thêm chi tiết!"
echo ""
print_info "Happy coding! 🚀"
