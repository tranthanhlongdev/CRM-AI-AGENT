#!/usr/bin/env python
"""Script để query và kiểm tra database"""

from app import create_app
from models.customer import db, Customer
from models.user import User

def query_database():
    app = create_app()
    
    with app.app_context():
        print("🗄️  DATABASE OVERVIEW")
        print("=" * 50)
        
        # Kiểm tra customers
        customer_count = Customer.query.count()
        print(f"📊 Total Customers: {customer_count}")
        
        # Lấy 5 customers đầu tiên
        customers = Customer.query.limit(5).all()
        print("\n👥 First 5 Customers:")
        for customer in customers:
            print(f"  - {customer.cif_number}: {customer.ho_ten} ({customer.chi_nhanh})")
        
        # Kiểm tra users
        user_count = User.query.count()
        print(f"\n👤 Total Users: {user_count}")
        
        users = User.query.all()
        print("\n🔑 All Users:")
        for user in users:
            status = "✅ Active" if user.is_active else "❌ Inactive"
            print(f"  - {user.username} ({user.role}) - {user.email} {status}")
        
        # Thống kê theo segment
        print(f"\n📈 Customer Statistics by Segment:")
        from sqlalchemy import func
        segments = db.session.query(
            Customer.segment_kh, 
            func.count(Customer.id).label('count')
        ).group_by(Customer.segment_kh).all()
        
        for segment, count in segments:
            print(f"  - {segment.value}: {count} customers")
        
        # Thống kê theo chi nhánh
        print(f"\n🏢 Customer Statistics by Branch:")
        branches = db.session.query(
            Customer.chi_nhanh, 
            func.count(Customer.id).label('count')
        ).group_by(Customer.chi_nhanh).all()
        
        for branch, count in branches:
            print(f"  - {branch}: {count} customers")

def query_specific_data():
    """Query dữ liệu cụ thể"""
    app = create_app()
    
    with app.app_context():
        print("\n🔍 SPECIFIC QUERIES")
        print("=" * 50)
        
        # Tìm customers VIP
        vip_customers = Customer.query.filter_by(segment_kh='VIP').all()
        print(f"\n💎 VIP Customers ({len(vip_customers)}):")
        for customer in vip_customers[:5]:  # Chỉ hiển thị 5 đầu tiên
            print(f"  - {customer.cif_number}: {customer.ho_ten} - {customer.so_du_hien_tai:,} VND")
        
        # Tìm customers có email
        customers_with_email = Customer.query.filter(Customer.email.isnot(None)).count()
        print(f"\n📧 Customers with Email: {customers_with_email}")
        
        # Tìm customers theo tên
        search_result = Customer.query.filter(Customer.ho_ten.contains('Nguyễn')).count()
        print(f"👤 Customers with 'Nguyễn' in name: {search_result}")

if __name__ == '__main__':
    query_database()
    query_specific_data()
