-- HDBank CRM - Customers Table Schema & Sample Data
-- Kiểm tra và sửa lỗi câu lệnh INSERT cho bảng customers

-- =====================================================
-- 1. TẠO BẢNG CUSTOMERS
-- =====================================================

CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cif_number VARCHAR(20) NOT NULL UNIQUE,
    ho_ten VARCHAR(255) NOT NULL,
    cmnd VARCHAR(15) NOT NULL,
    ngay_sinh DATE NOT NULL,
    gioi_tinh VARCHAR(10) DEFAULT 'Nam',
    dia_chi TEXT,
    so_dien_thoai VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    nghe_nghiep VARCHAR(255),
    tinh_trang_hon_nhan VARCHAR(50) DEFAULT 'Độc thân',
    muc_thu_nhap DECIMAL(15,2) DEFAULT 0,
    so_tai_khoan VARCHAR(30) NOT NULL,
    loai_khach_hang VARCHAR(50) DEFAULT 'Cá nhân',
    segment_kh VARCHAR(50) DEFAULT 'Basic',
    trang_thai_kh VARCHAR(50) DEFAULT 'Hoạt động',
    nhan_vien_quan_ly VARCHAR(255),
    chi_nhanh VARCHAR(255) NOT NULL,
    so_du_hien_tai DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_cif_number (cif_number),
    INDEX idx_cmnd (cmnd),
    INDEX idx_so_dien_thoai (so_dien_thoai),
    INDEX idx_email (email),
    INDEX idx_trang_thai (trang_thai_kh)
);

-- =====================================================
-- 2. TRIGGER CẬP NHẬT UPDATED_AT
-- =====================================================

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
BEGIN
    UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- 3. CÂU LỆNH INSERT CHÍNH XÁC
-- =====================================================

-- Template INSERT cho frontend
INSERT INTO customers (
    cif_number,
    ho_ten,
    cmnd,
    ngay_sinh,
    gioi_tinh,
    dia_chi,
    so_dien_thoai,
    email,
    nghe_nghiep,
    tinh_trang_hon_nhan,
    muc_thu_nhap,
    so_tai_khoan,
    loai_khach_hang,
    segment_kh,
    trang_thai_kh,
    nhan_vien_quan_ly,
    chi_nhanh,
    so_du_hien_tai
) VALUES (
    ?, -- cif_number: 'CIF001234567'
    ?, -- ho_ten: 'Nguyễn Văn A'
    ?, -- cmnd: '123456789012'
    ?, -- ngay_sinh: '1990-01-01'
    ?, -- gioi_tinh: 'Nam' hoặc 'Nữ'
    ?, -- dia_chi: 'Địa chỉ đầy đủ'
    ?, -- so_dien_thoai: '0123456789'
    ?, -- email: 'email@example.com'
    ?, -- nghe_nghiep: 'Kỹ sư'
    ?, -- tinh_trang_hon_nhan: 'Độc thân'
    ?, -- muc_thu_nhap: 15000000
    ?, -- so_tai_khoan: '1234567890123456'
    ?, -- loai_khach_hang: 'Cá nhân'
    ?, -- segment_kh: 'Basic'
    ?, -- trang_thai_kh: 'Hoạt động'
    ?, -- nhan_vien_quan_ly: 'Nguyễn Thị B'
    ?, -- chi_nhanh: 'CN Hà Nội'
    ?  -- so_du_hien_tai: 1000000
);

-- =====================================================
-- 4. SAMPLE DATA INSERT
-- =====================================================

-- Customer 1: Khách hàng cá nhân
INSERT INTO customers (
    cif_number, ho_ten, cmnd, ngay_sinh, gioi_tinh, dia_chi,
    so_dien_thoai, email, nghe_nghiep, tinh_trang_hon_nhan,
    muc_thu_nhap, so_tai_khoan, loai_khach_hang, segment_kh,
    trang_thai_kh, nhan_vien_quan_ly, chi_nhanh, so_du_hien_tai
) VALUES (
    'CIF001234567',
    'Nguyễn Văn A',
    '123456789012',
    '1990-01-01',
    'Nam',
    '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    '0123456789',
    'nguyenvana@email.com',
    'Kỹ sư phần mềm',
    'Độc thân',
    15000000.00,
    '1234567890123456',
    'Cá nhân',
    'Premium',
    'Hoạt động',
    'Trần Thị B',
    'CN TP.HCM',
    1500000.00
);

-- Customer 2: Khách hàng doanh nghiệp
INSERT INTO customers (
    cif_number, ho_ten, cmnd, ngay_sinh, gioi_tinh, dia_chi,
    so_dien_thoai, email, nghe_nghiep, tinh_trang_hon_nhan,
    muc_thu_nhap, so_tai_khoan, loai_khach_hang, segment_kh,
    trang_thai_kh, nhan_vien_quan_ly, chi_nhanh, so_du_hien_tai
) VALUES (
    'CIF007654321',
    'Công ty TNHH ABC',
    '987654321098',
    '2015-03-15',
    'Khác',
    '456 Đường DEF, Phường UVW, Quận 3, TP.HCM',
    '0987654321',
    'info@abc-company.vn',
    'Kinh doanh',
    'Khác',
    500000000.00,
    '9876543210987654',
    'Doanh nghiệp',
    'Corporate',
    'Hoạt động',
    'Lê Văn C',
    'CN TP.HCM',
    50000000.00
);

-- Customer 3: Khách hàng VIP
INSERT INTO customers (
    cif_number, ho_ten, cmnd, ngay_sinh, gioi_tinh, dia_chi,
    so_dien_thoai, email, nghe_nghiep, tinh_trang_hon_nhan,
    muc_thu_nhap, so_tai_khoan, loai_khach_hang, segment_kh,
    trang_thai_kh, nhan_vien_quan_ly, chi_nhanh, so_du_hien_tai
) VALUES (
    'CIF555666777',
    'Phạm Thị D',
    '555666777888',
    '1985-12-25',
    'Nữ',
    '789 Đường GHI, Phường RST, Quận 7, TP.HCM',
    '0555666777',
    'phamthid@email.com',
    'Bác sĩ',
    'Có gia đình',
    25000000.00,
    '5556667778889999',
    'Cá nhân',
    'VIP',
    'Hoạt động',
    'Hoàng Văn E',
    'CN Thủ Đức',
    5000000.00
);

-- =====================================================
-- 5. VALIDATION QUERIES
-- =====================================================

-- Kiểm tra dữ liệu vừa insert
SELECT 
    cif_number,
    ho_ten,
    cmnd,
    ngay_sinh,
    so_dien_thoai,
    email,
    loai_khach_hang,
    segment_kh,
    trang_thai_kh,
    chi_nhanh,
    so_du_hien_tai,
    created_at
FROM customers
ORDER BY created_at DESC;

-- Kiểm tra unique constraints
SELECT cif_number, COUNT(*) as count
FROM customers 
GROUP BY cif_number 
HAVING COUNT(*) > 1;

SELECT cmnd, COUNT(*) as count  
FROM customers
GROUP BY cmnd
HAVING COUNT(*) > 1;

-- =====================================================
-- 6. COMMON ISSUES & FIXES
-- =====================================================

-- Lỗi thường gặp và cách sửa:

-- 1. Lỗi UNIQUE constraint (CIF đã tồn tại)
-- FIX: Kiểm tra trước khi insert
SELECT COUNT(*) FROM customers WHERE cif_number = 'CIF001234567';

-- 2. Lỗi định dạng ngày tháng
-- FIX: Sử dụng format YYYY-MM-DD
-- SAI: '01/01/1990' 
-- ĐÚNG: '1990-01-01'

-- 3. Lỗi NULL constraint
-- FIX: Đảm bảo các field required không NULL
/*
Required fields (NOT NULL):
- cif_number
- ho_ten  
- cmnd
- ngay_sinh
- so_dien_thoai
- so_tai_khoan
- chi_nhanh
*/

-- 4. Lỗi kiểu dữ liệu số
-- FIX: Convert string to number
-- SAI: muc_thu_nhap = '15000000'
-- ĐÚNG: muc_thu_nhap = 15000000.00

-- =====================================================
-- 7. PREPARED STATEMENT EXAMPLES
-- =====================================================

-- Node.js với sqlite3
/*
const stmt = db.prepare(`
    INSERT INTO customers (
        cif_number, ho_ten, cmnd, ngay_sinh, gioi_tinh,
        dia_chi, so_dien_thoai, email, nghe_nghiep,
        tinh_trang_hon_nhan, muc_thu_nhap, so_tai_khoan,
        loai_khach_hang, segment_kh, trang_thai_kh,
        nhan_vien_quan_ly, chi_nhanh, so_du_hien_tai
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const result = stmt.run([
    customerData.cifNumber,
    customerData.hoTen,
    customerData.cmnd,
    customerData.ngaySinh,
    customerData.gioiTinh,
    customerData.diaChi,
    customerData.soDienThoai,
    customerData.email,
    customerData.ngheNghiep,
    customerData.tinhTrangHonNhan,
    customerData.mucThuNhap,
    customerData.soTaiKhoan,
    customerData.loaiKhachHang,
    customerData.segmentKH,
    customerData.trangThaiKH,
    customerData.nhanVienQuanLy,
    customerData.chiNhanh,
    customerData.soDuHienTai
]);
*/

-- =====================================================
-- 8. FRONTEND-BACKEND MAPPING
-- =====================================================

/*
Frontend field name → Database column name:
- cifNumber → cif_number
- hoTen → ho_ten  
- cmnd → cmnd
- ngaySinh → ngay_sinh
- gioiTinh → gioi_tinh
- diaChi → dia_chi
- soDienThoai → so_dien_thoai
- email → email
- ngheNghiep → nghe_nghiep
- tinhTrangHonNhan → tinh_trang_hon_nhan
- mucThuNhap → muc_thu_nhap (convert to number)
- soTaiKhoan → so_tai_khoan
- loaiKhachHang → loai_khach_hang
- segmentKH → segment_kh
- trangThaiKH → trang_thai_kh
- nhanVienQuanLy → nhan_vien_quan_ly
- chiNhanh → chi_nhanh
- soDuHienTai → so_du_hien_tai (convert to number)
*/

-- =====================================================
-- 9. ERROR HANDLING EXAMPLES
-- =====================================================

-- Kiểm tra trước khi insert để tránh lỗi
-- Step 1: Validate CIF format
SELECT CASE 
    WHEN 'CIF001234567' REGEXP '^CIF[0-9]{6,}$' THEN 'Valid'
    ELSE 'Invalid CIF format'
END as cif_validation;

-- Step 2: Check if CIF already exists
SELECT CASE
    WHEN EXISTS(SELECT 1 FROM customers WHERE cif_number = 'CIF001234567') 
    THEN 'CIF already exists'
    ELSE 'CIF available'
END as cif_check;

-- Step 3: Validate phone format  
SELECT CASE
    WHEN '0123456789' REGEXP '^[0-9]{10,11}$' THEN 'Valid'
    ELSE 'Invalid phone format'
END as phone_validation;

-- Step 4: Validate email format
SELECT CASE
    WHEN 'test@email.com' REGEXP '^[^@]+@[^@]+\.[^@]+$' THEN 'Valid'
    ELSE 'Invalid email format'  
END as email_validation;

-- =====================================================
-- 10. PERFORMANCE OPTIMIZATION
-- =====================================================

-- Tạo indexes cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_customers_cif ON customers(cif_number);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(so_dien_thoai);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_cmnd ON customers(cmnd);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(trang_thai_kh);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment_kh);
CREATE INDEX IF NOT EXISTS idx_customers_branch ON customers(chi_nhanh);

-- Optimize queries với EXPLAIN QUERY PLAN
EXPLAIN QUERY PLAN 
SELECT * FROM customers WHERE cif_number = 'CIF001234567';

EXPLAIN QUERY PLAN
SELECT * FROM customers WHERE so_dien_thoai = '0123456789';

-- =====================================================
-- 11. BACKUP & RESTORE
-- =====================================================

-- Backup data before testing
CREATE TABLE customers_backup AS SELECT * FROM customers;

-- Restore if needed
DROP TABLE customers;
ALTER TABLE customers_backup RENAME TO customers;

-- =====================================================
-- 12. TESTING COMMANDS
-- =====================================================

-- Test INSERT với data từ frontend
INSERT INTO customers (
    cif_number, ho_ten, cmnd, ngay_sinh, gioi_tinh, dia_chi,
    so_dien_thoai, email, nghe_nghiep, tinh_trang_hon_nhan,
    muc_thu_nhap, so_tai_khoan, loai_khach_hang, segment_kh,
    trang_thai_kh, nhan_vien_quan_ly, chi_nhanh, so_du_hien_tai
) VALUES (
    'CIF999888777',
    'Test Customer',
    '999888777666',
    '1995-06-15',
    'Nam',
    'Test Address',
    '0999888777',
    'test@test.com',
    'Test Job',
    'Độc thân',
    10000000,
    '9998887776665555',
    'Cá nhân',
    'Basic',
    'Hoạt động',
    'Test Manager',
    'Test Branch',
    500000
);

-- Verify insert
SELECT * FROM customers WHERE cif_number = 'CIF999888777';

-- Cleanup test data
DELETE FROM customers WHERE cif_number = 'CIF999888777';
