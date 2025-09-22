from flask import Blueprint, request, jsonify
from sqlalchemy import or_, and_, text
from models.customer import db, Customer, SegmentEnum, StatusEnum, GenderEnum, MaritalStatusEnum, CustomerTypeEnum
from datetime import datetime, date
import math

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/customers/search', methods=['GET'])
def search_customers():
    """
    Search customers with filters and pagination
    Query parameters:
    - searchTerm: text search
    - filterType: all, active, locked (status filter)
    - segmentFilter: all, VIP, Premium, Standard, Basic
    - branchFilter: all, or specific branch name
    - page: current page (default: 1)
    - limit: records per page (default: 20, max: 100)
    - sortBy: field to sort by (default: cifNumber)
    - sortOrder: asc or desc (default: asc)
    """
    try:
        # Get query parameters
        search_term = request.args.get('searchTerm', '').strip()
        filter_type = request.args.get('filterType', 'all')
        segment_filter = request.args.get('segmentFilter', 'all')
        branch_filter = request.args.get('branchFilter', 'all')
        
        # Pagination parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 20)), 100)  # Max 100 records per page
        
        # Sorting parameters
        sort_by = request.args.get('sortBy', 'cifNumber')
        sort_order = request.args.get('sortOrder', 'asc')
        
        # Build query
        query = Customer.query
        
        # Text search
        if search_term:
            # Use FULLTEXT search for better performance on large datasets
            search_conditions = or_(
                Customer.ho_ten.contains(search_term),
                Customer.cif_number.contains(search_term),
                Customer.cmnd.contains(search_term),
                Customer.so_dien_thoai.contains(search_term),
                Customer.email.contains(search_term),
                Customer.dia_chi.contains(search_term)
            )
            query = query.filter(search_conditions)
        
        # Status filter
        if filter_type != 'all':
            if filter_type == 'active':
                query = query.filter(Customer.trang_thai_kh == StatusEnum.HOAT_DONG)
            elif filter_type == 'locked':
                query = query.filter(Customer.trang_thai_kh == StatusEnum.TAM_KHOA)
        
        # Segment filter
        if segment_filter != 'all':
            if segment_filter in ['VIP', 'Premium', 'Standard', 'Basic']:
                segment_enum = getattr(SegmentEnum, segment_filter.upper())
                query = query.filter(Customer.segment_kh == segment_enum)
        
        # Branch filter
        if branch_filter != 'all':
            query = query.filter(Customer.chi_nhanh == branch_filter)
        
        # Sorting
        sort_field = getattr(Customer, get_sort_field(sort_by), Customer.cif_number)
        if sort_order.lower() == 'desc':
            query = query.order_by(sort_field.desc())
        else:
            query = query.order_by(sort_field.asc())
        
        # Get total count before pagination
        total_records = query.count()
        total_pages = math.ceil(total_records / limit)
        
        # Apply pagination
        offset = (page - 1) * limit
        customers = query.offset(offset).limit(limit).all()
        
        # Convert to response format
        customers_data = [customer.to_dict() for customer in customers]
        
        response = {
            'success': True,
            'data': {
                'customers': customers_data,
                'pagination': {
                    'currentPage': page,
                    'totalPages': total_pages,
                    'totalRecords': total_records,
                    'limit': limit
                }
            },
            'message': f'Tìm thấy {total_records} khách hàng'
        }
        
        return jsonify(response), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'data': None,
            'message': f'Tham số không hợp lệ: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'data': None,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@customers_bp.route('/customers/<string:cif_number>', methods=['GET'])
def get_customer_detail(cif_number):
    """
    Get detailed customer information by CIF number
    """
    try:
        # Find customer by CIF number
        customer = Customer.query.filter_by(cif_number=cif_number).first()
        
        if not customer:
            return jsonify({
                'success': False,
                'data': None,
                'message': f'Không tìm thấy khách hàng với mã CIF: {cif_number}'
            }), 404
        
        # Convert to detailed response format
        customer_detail = customer.to_detail_dict()
        
        response = {
            'success': True,
            'data': customer_detail,
            'message': 'Lấy thông tin khách hàng thành công'
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': None,
            'message': f'Lỗi server: {str(e)}'
        }), 500

def get_sort_field(sort_by):
    """Map frontend sort field names to database field names"""
    field_mapping = {
        'cifNumber': 'cif_number',
        'hoTen': 'ho_ten',
        'ngaySinh': 'ngay_sinh',
        'gioiTinh': 'gioi_tinh',
        'segmentKH': 'segment_kh',
        'trangThaiKH': 'trang_thai_kh',
        'ngayMoTK': 'ngay_mo_tk',
        'chiNhanh': 'chi_nhanh',
        'soDuHienTai': 'so_du_hien_tai'
    }
    return field_mapping.get(sort_by, 'cif_number')

@customers_bp.route('/customers/branches', methods=['GET'])
def get_branches():
    """Get list of all branches for filter dropdown"""
    try:
        branches = db.session.query(Customer.chi_nhanh).distinct().filter(
            Customer.chi_nhanh.isnot(None)
        ).all()
        
        branch_list = [branch[0] for branch in branches if branch[0]]
        
        return jsonify({
            'success': True,
            'data': {
                'branches': sorted(branch_list)
            },
            'message': f'Tìm thấy {len(branch_list)} chi nhánh'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': None,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@customers_bp.route('/customers/stats', methods=['GET'])
def get_customer_stats():
    """Get basic customer statistics"""
    try:
        total_customers = Customer.query.count()
        active_customers = Customer.query.filter_by(trang_thai_kh=StatusEnum.HOAT_DONG).count()
        locked_customers = Customer.query.filter_by(trang_thai_kh=StatusEnum.TAM_KHOA).count()
        
        # Segment distribution
        segment_stats = {}
        for segment in SegmentEnum:
            count = Customer.query.filter_by(segment_kh=segment).count()
            segment_stats[segment.value] = count
        
        return jsonify({
            'success': True,
            'data': {
                'total': total_customers,
                'active': active_customers,
                'locked': locked_customers,
                'segments': segment_stats
            },
            'message': 'Thống kê khách hàng'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': None,
            'message': f'Lỗi server: {str(e)}'
        }), 500
