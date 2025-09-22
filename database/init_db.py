#!/usr/bin/env python3
"""
Database initialization script
Creates the database and inserts sample data
"""

import sys
import os
from datetime import datetime, date
import random

# Add parent directory to path so we can import from the project root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models.customer import db, Customer, GenderEnum, MaritalStatusEnum, CustomerTypeEnum, SegmentEnum, StatusEnum

def create_database():
    """Create database tables"""
    print("Creating database tables...")
    db.create_all()
    print("Database tables created successfully!")

def insert_sample_data():
    """Insert sample customer data"""
    print("Inserting sample data...")
    
    sample_customers = [
        {
            'cif_number': 'CIF001234567',
            'ho_ten': 'Nguyễn Văn An',
            'cmnd': '123456789012',
            'ngay_sinh': date(1985, 3, 15),
            'gioi_tinh': GenderEnum.NAM,
            'dia_chi': '123 Đường Láng, Quận Đống Đa, Hà Nội',
            'so_dien_thoai': '0912345678',
            'email': 'nguyenvanan@email.com',
            'nghe_nghiep': 'Kỹ sư CNTT',
            'tinh_trang_hon_nhan': MaritalStatusEnum.DA_KET_HON,
            'muc_thu_nhap': 25000000,
            'so_tai_khoan': '1234567890123',
            'loai_khach_hang': CustomerTypeEnum.CA_NHAN,
            'segment_kh': SegmentEnum.PREMIUM,
            'trang_thai_kh': StatusEnum.HOAT_DONG,
            'ngay_mo_tk': date(2020, 1, 15),
            'nhan_vien_quan_ly': 'Trần Thị Bình',
            'chi_nhanh': 'CN Đống Đa',
            'so_du_hien_tai': 150000000
        },
        {
            'cif_number': 'CIF001234568',
            'ho_ten': 'Lê Thị Bích',
            'cmnd': '123456789013',
            'ngay_sinh': date(1990, 7, 22),
            'gioi_tinh': GenderEnum.NU,
            'dia_chi': '456 Phố Huế, Quận Hai Bà Trưng, Hà Nội',
            'so_dien_thoai': '0987654321',
            'email': 'lethibich@email.com',
            'nghe_nghiep': 'Bác sĩ',
            'tinh_trang_hon_nhan': MaritalStatusEnum.DOC_THAN,
            'muc_thu_nhap': 30000000,
            'so_tai_khoan': '2345678901234',
            'loai_khach_hang': CustomerTypeEnum.CA_NHAN,
            'segment_kh': SegmentEnum.VIP,
            'trang_thai_kh': StatusEnum.HOAT_DONG,
            'ngay_mo_tk': date(2019, 5, 10),
            'nhan_vien_quan_ly': 'Phạm Văn Cường',
            'chi_nhanh': 'CN Cầu Giấy',
            'so_du_hien_tai': 280000000
        },
        {
            'cif_number': 'CIF001234569',
            'ho_ten': 'Hoàng Minh Đức',
            'cmnd': '123456789014',
            'ngay_sinh': date(1982, 11, 8),
            'gioi_tinh': GenderEnum.NAM,
            'dia_chi': '789 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
            'so_dien_thoai': '0968123456',
            'email': 'hoangminhduc@email.com',
            'nghe_nghiep': 'Giám đốc kinh doanh',
            'tinh_trang_hon_nhan': MaritalStatusEnum.DA_KET_HON,
            'muc_thu_nhap': 45000000,
            'so_tai_khoan': '3456789012345',
            'loai_khach_hang': CustomerTypeEnum.CA_NHAN,
            'segment_kh': SegmentEnum.VIP,
            'trang_thai_kh': StatusEnum.HOAT_DONG,
            'ngay_mo_tk': date(2018, 3, 20),
            'nhan_vien_quan_ly': 'Nguyễn Thị Lan',
            'chi_nhanh': 'CN Thanh Xuân',
            'so_du_hien_tai': 520000000
        },
        {
            'cif_number': 'CIF001234570',
            'ho_ten': 'Võ Thị Hương',
            'cmnd': '123456789015',
            'ngay_sinh': date(1995, 2, 14),
            'gioi_tinh': GenderEnum.NU,
            'dia_chi': '321 Lê Văn Lương, Quận Nam Từ Liêm, Hà Nội',
            'so_dien_thoai': '0912987654',
            'email': 'vothihuong@email.com',
            'nghe_nghiep': 'Nhân viên văn phòng',
            'tinh_trang_hon_nhan': MaritalStatusEnum.DOC_THAN,
            'muc_thu_nhap': 12000000,
            'so_tai_khoan': '4567890123456',
            'loai_khach_hang': CustomerTypeEnum.CA_NHAN,
            'segment_kh': SegmentEnum.STANDARD,
            'trang_thai_kh': StatusEnum.HOAT_DONG,
            'ngay_mo_tk': date(2021, 8, 5),
            'nhan_vien_quan_ly': 'Đỗ Văn Hùng',
            'chi_nhanh': 'CN Nam Từ Liêm',
            'so_du_hien_tai': 45000000
        },
        {
            'cif_number': 'CIF001234571',
            'ho_ten': 'Trần Quốc Việt',
            'cmnd': '123456789016',
            'ngay_sinh': date(1988, 9, 30),
            'gioi_tinh': GenderEnum.NAM,
            'dia_chi': '654 Trần Duy Hưng, Quận Cầu Giấy, Hà Nội',
            'so_dien_thoai': '0945678912',
            'email': 'tranquocviet@email.com',
            'nghe_nghiep': 'Giáo viên',
            'tinh_trang_hon_nhan': MaritalStatusEnum.DA_KET_HON,
            'muc_thu_nhap': 15000000,
            'so_tai_khoan': '5678901234567',
            'loai_khach_hang': CustomerTypeEnum.CA_NHAN,
            'segment_kh': SegmentEnum.BASIC,
            'trang_thai_kh': StatusEnum.TAM_KHOA,
            'ngay_mo_tk': date(2022, 1, 12),
            'nhan_vien_quan_ly': 'Lê Thị Mai',
            'chi_nhanh': 'CN Cầu Giấy',
            'so_du_hien_tai': 8500000
        }
    ]
    
    # Add more sample data
    branches = ['CN Đống Đa', 'CN Cầu Giấy', 'CN Thanh Xuân', 'CN Nam Từ Liêm', 'CN Hoàn Kiếm']
    managers = ['Trần Thị Bình', 'Phạm Văn Cường', 'Nguyễn Thị Lan', 'Đỗ Văn Hùng', 'Lê Thị Mai']
    
    for i in range(6, 51):  # Add 45 more customers
        cif_num = f'CIF00123{i:04d}'
        customer_data = {
            'cif_number': cif_num,
            'ho_ten': f'Khách hàng {i:02d}',
            'cmnd': f'12345678{i:04d}',
            'ngay_sinh': date(random.randint(1970, 2000), random.randint(1, 12), random.randint(1, 28)),
            'gioi_tinh': random.choice([GenderEnum.NAM, GenderEnum.NU]),
            'dia_chi': f'{i} Đường {random.choice(["Láng", "Huế", "Trãi", "Lương"])}, Hà Nội',
            'so_dien_thoai': f'09{random.randint(10000000, 99999999)}',
            'email': f'customer{i}@email.com',
            'nghe_nghiep': random.choice(['Nhân viên', 'Kỹ sư', 'Bác sĩ', 'Giáo viên', 'Kinh doanh']),
            'tinh_trang_hon_nhan': random.choice(list(MaritalStatusEnum)),
            'muc_thu_nhap': random.randint(8000000, 50000000),
            'so_tai_khoan': f'{i:013d}',
            'loai_khach_hang': CustomerTypeEnum.CA_NHAN,
            'segment_kh': random.choice(list(SegmentEnum)),
            'trang_thai_kh': random.choice([StatusEnum.HOAT_DONG, StatusEnum.HOAT_DONG, StatusEnum.TAM_KHOA]),  # More active customers
            'ngay_mo_tk': date(random.randint(2018, 2023), random.randint(1, 12), random.randint(1, 28)),
            'nhan_vien_quan_ly': random.choice(managers),
            'chi_nhanh': random.choice(branches),
            'so_du_hien_tai': random.randint(1000000, 500000000)
        }
        sample_customers.append(customer_data)
    
    # Insert all customers
    for customer_data in sample_customers:
        # Check if customer already exists
        existing = Customer.query.filter_by(cif_number=customer_data['cif_number']).first()
        if not existing:
            customer = Customer(**customer_data)
            db.session.add(customer)
    
    try:
        db.session.commit()
        print(f"Successfully inserted {len(sample_customers)} sample customers!")
    except Exception as e:
        db.session.rollback()
        print(f"Error inserting sample data: {e}")

def main():
    """Main function to initialize database"""
    app = create_app()
    
    with app.app_context():
        # Create tables
        create_database()
        
        # Insert sample data
        insert_sample_data()
        
        # Verify data
        customer_count = Customer.query.count()
        print(f"Total customers in database: {customer_count}")

if __name__ == '__main__':
    main()
