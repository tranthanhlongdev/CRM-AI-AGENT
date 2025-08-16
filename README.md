# CRM Application

Ứng dụng CRM được xây dựng bằng React, Vite và Tailwind CSS.

## Cấu trúc dự án

```
src/
├── components/
│   ├── Sidebar.jsx          # Thanh điều hướng bên trái
│   ├── Header.jsx           # Header với tìm kiếm và thông tin user
│   ├── TabNavigation.jsx    # Điều hướng tabs
│   ├── MainContent.jsx      # Nội dung chính với bảng dữ liệu
│   └── CustomerForm.jsx     # Form thông tin khách hàng
├── styles/
│   └── globals.css          # CSS tùy chỉnh
├── App.jsx                  # Component chính
├── main.jsx                 # Entry point
└── index.css               # Tailwind CSS imports
```

## Tính năng

- ✅ Sidebar với menu điều hướng
- ✅ Header với tìm kiếm và thông tin user
- ✅ System tabs (Thông tin chung, Gửi y bán, Sản phẩm dịch vụ)
- ✅ Bảng dữ liệu campaign với phân trang
- ✅ Form thông tin khách hàng
- ✅ Responsive design
- ✅ Hover effects và transitions

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

## Technologies

- **React 19.1.1** - Frontend framework
- **Vite 7.1.0** - Build tool
- **Tailwind CSS 4.1.11** - Styling
- **PostCSS & Autoprefixer** - CSS processing

## Component Architecture

### Sidebar

- Logo và tên ứng dụng
- Menu navigation với active states
- Badge cho notifications

### Header

- Hamburger menu button
- Page title
- Search functionality
- User avatar và thông tin

### TabNavigation

- Tab switching logic
- Active tab highlighting
- Responsive tab display

### MainContent

- Dynamic content based on active tab
- Contact information display
- Campaign list table
- Campaign details grid

### CustomerForm

- Customer information inputs
- Form validation ready
- Action buttons
- Status display

## Customization

Để tùy chỉnh giao diện, chỉnh sửa các file:

- `src/styles/globals.css` - Custom CSS
- `tailwind.config.js` - Tailwind configuration
- Component files trong `src/components/`

## Screenshot

Giao diện CRM bao gồm:

- Sidebar bên trái với các menu navigation
- Header với tìm kiếm và thông tin user
- Khu vực chính với tabs và bảng dữ liệu
- Form thông tin khách hàng bên phải
