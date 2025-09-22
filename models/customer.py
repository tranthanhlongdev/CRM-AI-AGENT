from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
from datetime import datetime
from sqlalchemy import Index, text
from enum import Enum

class GenderEnum(Enum):
    NAM = 'Nam'
    NU = 'Nữ'

class MaritalStatusEnum(Enum):
    DOC_THAN = 'Độc thân'
    DA_KET_HON = 'Đã kết hôn'
    LY_HON = 'Ly hôn'
    GOA = 'Góa'

class CustomerTypeEnum(Enum):
    CA_NHAN = 'Cá nhân'
    DOANH_NGHIEP = 'Doanh nghiệp'

class SegmentEnum(Enum):
    BASIC = 'Basic'
    STANDARD = 'Standard'
    PREMIUM = 'Premium'
    VIP = 'VIP'

class StatusEnum(Enum):
    HOAT_DONG = 'Hoạt động'
    TAM_KHOA = 'Tạm khóa'
    DONG = 'Đóng'

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    cif_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    ho_ten = db.Column(db.String(100), nullable=False)
    cmnd = db.Column(db.String(20), unique=True, nullable=False, index=True)
    ngay_sinh = db.Column(db.Date, nullable=False)
    gioi_tinh = db.Column(db.Enum(GenderEnum), nullable=False)
    dia_chi = db.Column(db.String(500))
    so_dien_thoai = db.Column(db.String(20))
    email = db.Column(db.String(100))
    nghe_nghiep = db.Column(db.String(100))
    tinh_trang_hon_nhan = db.Column(db.Enum(MaritalStatusEnum))
    muc_thu_nhap = db.Column(db.Numeric(15, 0))
    ngan_hang_tai_khoan = db.Column(db.String(50), default='MB Bank')
    so_tai_khoan = db.Column(db.String(20), unique=True, nullable=False, index=True)
    loai_khach_hang = db.Column(db.Enum(CustomerTypeEnum), default=CustomerTypeEnum.CA_NHAN)
    segment_kh = db.Column(db.Enum(SegmentEnum), default=SegmentEnum.BASIC, index=True)
    trang_thai_kh = db.Column(db.Enum(StatusEnum), default=StatusEnum.HOAT_DONG, index=True)
    ngay_mo_tk = db.Column(db.Date, nullable=False)
    nhan_vien_quan_ly = db.Column(db.String(100))
    chi_nhanh = db.Column(db.String(100), index=True)
    so_du_hien_tai = db.Column(db.Numeric(18, 0), default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'cifNumber': self.cif_number,
            'hoTen': self.ho_ten,
            'cmnd': self.cmnd,
            'ngaySinh': self.ngay_sinh.strftime('%d/%m/%Y') if self.ngay_sinh else None,
            'gioiTinh': self.gioi_tinh.value if self.gioi_tinh else None,
            'diaChi': self.dia_chi,
            'soDienThoai': self.so_dien_thoai,
            'email': self.email,
            'ngheNghiep': self.nghe_nghiep,
            'tinhTrangHonNhan': self.tinh_trang_hon_nhan.value if self.tinh_trang_hon_nhan else None,
            'mucThuNhap': str(self.muc_thu_nhap) if self.muc_thu_nhap else None,
            'nganHangTaiKhoan': self.ngan_hang_tai_khoan,
            'soTaiKhoan': self.so_tai_khoan,
            'loaiKhachHang': self.loai_khach_hang.value if self.loai_khach_hang else None,
            'segmentKH': self.segment_kh.value if self.segment_kh else None,
            'trangThaiKH': self.trang_thai_kh.value if self.trang_thai_kh else None,
            'ngayMoTK': self.ngay_mo_tk.strftime('%d/%m/%Y') if self.ngay_mo_tk else None,
            'nhanVienQuanLy': self.nhan_vien_quan_ly,
            'chiNhanh': self.chi_nhanh,
            'soDuHienTai': str(self.so_du_hien_tai) if self.so_du_hien_tai else '0'
        }
    
    def to_detail_dict(self):
        """Convert model to detailed dictionary structure"""
        return {
            'personalInfo': {
                'cifNumber': self.cif_number,
                'hoTen': self.ho_ten,
                'cmnd': self.cmnd,
                'ngaySinh': self.ngay_sinh.strftime('%d/%m/%Y') if self.ngay_sinh else None,
                'gioiTinh': self.gioi_tinh.value if self.gioi_tinh else None,
                'ngheNghiep': self.nghe_nghiep,
                'tinhTrangHonNhan': self.tinh_trang_hon_nhan.value if self.tinh_trang_hon_nhan else None,
                'diaChi': self.dia_chi
            },
            'contactInfo': {
                'soDienThoai': self.so_dien_thoai,
                'email': self.email
            },
            'financialInfo': {
                'mucThuNhap': str(self.muc_thu_nhap) if self.muc_thu_nhap else None,
                'segmentKH': self.segment_kh.value if self.segment_kh else None
            },
            'accountInfo': {
                'soTaiKhoan': self.so_tai_khoan,
                'soDuHienTai': str(self.so_du_hien_tai) if self.so_du_hien_tai else '0',
                'ngayMoTK': self.ngay_mo_tk.strftime('%d/%m/%Y') if self.ngay_mo_tk else None,
                'trangThaiKH': self.trang_thai_kh.value if self.trang_thai_kh else None,
                'loaiKhachHang': self.loai_khach_hang.value if self.loai_khach_hang else None,
                'nganHangTaiKhoan': self.ngan_hang_tai_khoan
            },
            'managementInfo': {
                'chiNhanh': self.chi_nhanh,
                'nhanVienQuanLy': self.nhan_vien_quan_ly
            }
        }
    
    def __repr__(self):
        return f'<Customer {self.cif_number}: {self.ho_ten}>'

# Create fulltext index for search (MySQL specific)
# Note: This index will be created separately after table creation
