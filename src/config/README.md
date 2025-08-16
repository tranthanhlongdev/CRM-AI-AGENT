# 🔧 Cấu hình API

## 📖 Hướng dẫn thay đổi URL API

### 🎯 Phương pháp 1: Sử dụng Environment Variables (Khuyến nghị)

1. **Tạo file `.env` trong thư mục root của project:**

```bash
# .env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_ENV=development
```

2. **Các environment có sẵn:**

- `development`: http://localhost:5000
- `staging`: https://api-staging.yourbank.com
- `production`: https://api.yourbank.com

3. **Khởi động lại server để áp dụng thay đổi:**

```bash
npm run dev
```

### 🎯 Phương pháp 2: Chỉnh sửa trực tiếp config file

1. **Mở file `src/config/environment.js`**
2. **Thay đổi URL trong object `ENV_CONFIG`:**

```javascript
DEVELOPMENT: {
  API_BASE_URL: 'http://your-new-api-url:5000',
  DEBUG: true
}
```

### 🎯 Phương pháp 3: Override trực tiếp (Nhanh nhất)

1. **Mở file `src/config/api.js`**
2. **Thay đổi trực tiếp BASE_URL:**

```javascript
const API_CONFIG = {
  BASE_URL: "http://your-api-url:5000", // Thay đổi URL ở đây
  // ... rest of config
};
```

## 🚀 API Endpoints hiện tại

- **Tìm kiếm khách hàng:** `POST /api/customers/search-complete`
- **Chi tiết khách hàng:** `GET /api/customers/{cifNumber}`
- **Cập nhật khách hàng:** `PUT /api/customers/{cifNumber}`
- **Tạo khách hàng:** `POST /api/customers`
- **Xóa khách hàng:** `DELETE /api/customers/{cifNumber}`

## 🔍 Kiểm tra cấu hình hiện tại

Mở Developer Console trong browser và chạy:

```javascript
console.log("Current API Base URL:", import.meta.env.VITE_API_BASE_URL);
```

## 🛠️ Debugging

Nếu gặp lỗi CORS hoặc không kết nối được API:

1. **Kiểm tra API server đang chạy**
2. **Kiểm tra URL đúng format** (có http/https)
3. **Kiểm tra CORS headers từ server**
4. **Xem Network tab trong DevTools để debug request**

## 🌍 Production Deployment

Khi deploy production, đặt environment variables:

```bash
VITE_API_BASE_URL=https://your-production-api.com
VITE_APP_ENV=production
```

---

_Tạo bởi: CRM System - Banking Solution_
