from flask import Blueprint, request, jsonify
from sqlalchemy import or_, and_, text
from models.customer import db, Customer, SegmentEnum, StatusEnum, GenderEnum, MaritalStatusEnum, CustomerTypeEnum
from datetime import datetime, date
import math

customers_body_bp = Blueprint('customers_body', __name__)

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

@customers_body_bp.route('/customers/search-complete', methods=['POST'])
def search_customers_complete():
    """
    Tìm kiếm khách hàng với ĐẦY ĐỦ tất cả filter có thể
    Request Body:
    {
        "searchTerm": "string",                    // Tìm kiếm text trong tên, CIF, CMND, SĐT, email, địa chỉ
        "cifNumber": "string",                     // Tìm theo CIF cụ thể
        "hoTen": "string",                         // Tìm theo tên
        "cmnd": "string",                          // Tìm theo CMND/CCCD
        "soDienThoai": "string",                   // Tìm theo số điện thoại
        "email": "string",                         // Tìm theo email
        "diaChi": "string",                        // Tìm theo địa chỉ
        "soTaiKhoan": "string",                    // Tìm theo số tài khoản
        "gioiTinh": "Nam|Nữ",                      // Filter theo giới tính
        "ngheNghiep": "string",                    // Filter theo nghề nghiệp
        "tinhTrangHonNhan": "Độc thân|Đã kết hôn|Ly hôn|Góa",  // Filter theo tình trạng hôn nhân
        "loaiKhachHang": "Cá nhân|Doanh nghiệp",   // Filter theo loại khách hàng
        "segmentKH": "Basic|Standard|Premium|VIP", // Filter theo segment
        "trangThaiKH": "Hoạt động|Tạm khóa|Đóng",  // Filter theo trạng thái
        "chiNhanh": "string",                      // Filter theo chi nhánh
        "nhanVienQuanLy": "string",                // Filter theo nhân viên quản lý
        "nganHangTaiKhoan": "string",              // Filter theo ngân hàng
        "mucThuNhapMin": number,                   // Thu nhập tối thiểu
        "mucThuNhapMax": number,                   // Thu nhập tối đa
        "soDuMin": number,                         // Số dư tối thiểu
        "soDuMax": number,                         // Số dư tối đa
        "ngaySinhFrom": "DD/MM/YYYY",              // Ngày sinh từ
        "ngaySinhTo": "DD/MM/YYYY",                // Ngày sinh đến
        "ngayMoTKFrom": "DD/MM/YYYY",              // Ngày mở TK từ
        "ngayMoTKTo": "DD/MM/YYYY",                // Ngày mở TK đến
        "tuoiMin": number,                         // Tuổi tối thiểu
        "tuoiMax": number,                         // Tuổi tối đa
        "page": number,                            // Trang hiện tại (default: 1)
        "limit": number,                           // Số record/trang (default: 20)
        "sortBy": "string",                        // Sắp xếp theo field
        "sortOrder": "asc|desc"                    // Thứ tự sắp xếp (default: asc)
    }
    """
    try:
        data = request.get_json()
        if not data:
            data = {}  # Cho phép request body rỗng

        # Lấy tất cả filter parameters từ request body
        search_term = data.get('searchTerm', '').strip()
        cif_number = data.get('cifNumber', '').strip()
        ho_ten = data.get('hoTen', '').strip()
        cmnd = data.get('cmnd', '').strip()
        so_dien_thoai = data.get('soDienThoai', '').strip()
        email = data.get('email', '').strip()
        dia_chi = data.get('diaChi', '').strip()
        so_tai_khoan = data.get('soTaiKhoan', '').strip()
        gioi_tinh = data.get('gioiTinh', '').strip()
        nghe_nghiep = data.get('ngheNghiep', '').strip()
        tinh_trang_hon_nhan = data.get('tinhTrangHonNhan', '').strip()
        loai_khach_hang = data.get('loaiKhachHang', '').strip()
        segment_kh = data.get('segmentKH', '').strip()
        trang_thai_kh = data.get('trangThaiKH', '').strip()
        chi_nhanh = data.get('chiNhanh', '').strip()
        nhan_vien_quan_ly = data.get('nhanVienQuanLy', '').strip()
        ngan_hang_tai_khoan = data.get('nganHangTaiKhoan', '').strip()
        
        # Range filters với validation
        def parse_number(value, field_name):
            """Parse và validate số"""
            if value is None or value == "" or value == "":
                return None
            try:
                return int(value) if isinstance(value, (int, float, str)) and str(value).strip() != "" else None
            except (ValueError, TypeError):
                raise ValueError(f"Trường {field_name} phải là số nguyên hợp lệ")

        try:
            muc_thu_nhap_min = parse_number(data.get('mucThuNhapMin'), 'mucThuNhapMin')
            muc_thu_nhap_max = parse_number(data.get('mucThuNhapMax'), 'mucThuNhapMax')
            so_du_min = parse_number(data.get('soDuMin'), 'soDuMin')
            so_du_max = parse_number(data.get('soDuMax'), 'soDuMax')
            tuoi_min = parse_number(data.get('tuoiMin'), 'tuoiMin')
            tuoi_max = parse_number(data.get('tuoiMax'), 'tuoiMax')
            page = parse_number(data.get('page', 1), 'page') or 1
            limit = parse_number(data.get('limit', 20), 'limit') or 20
        except ValueError as e:
            return jsonify({
                'success': False,
                'data': None,
                'message': str(e)
            }), 400

        # Validation cho các giá trị số
        if muc_thu_nhap_min is not None and muc_thu_nhap_min < 0:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'mucThuNhapMin phải >= 0'
            }), 400

        if muc_thu_nhap_max is not None and muc_thu_nhap_max < 0:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'mucThuNhapMax phải >= 0'
            }), 400

        if muc_thu_nhap_min is not None and muc_thu_nhap_max is not None and muc_thu_nhap_min > muc_thu_nhap_max:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'mucThuNhapMin không được lớn hơn mucThuNhapMax'
            }), 400

        if so_du_min is not None and so_du_min < 0:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'soDuMin phải >= 0'
            }), 400

        if so_du_max is not None and so_du_max < 0:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'soDuMax phải >= 0'
            }), 400

        if so_du_min is not None and so_du_max is not None and so_du_min > so_du_max:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'soDuMin không được lớn hơn soDuMax'
            }), 400

        if tuoi_min is not None and (tuoi_min < 0 or tuoi_min > 120):
            return jsonify({
                'success': False,
                'data': None,
                'message': 'tuoiMin phải từ 0 đến 120'
            }), 400

        if tuoi_max is not None and (tuoi_max < 0 or tuoi_max > 120):
            return jsonify({
                'success': False,
                'data': None,
                'message': 'tuoiMax phải từ 0 đến 120'
            }), 400

        if tuoi_min is not None and tuoi_max is not None and tuoi_min > tuoi_max:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'tuoiMin không được lớn hơn tuoiMax'
            }), 400

        if page < 1:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'page phải >= 1'
            }), 400

        if limit < 1 or limit > 100:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'limit phải từ 1 đến 100'
            }), 400
        
        # Date filters
        ngay_sinh_from = data.get('ngaySinhFrom', '').strip()
        ngay_sinh_to = data.get('ngaySinhTo', '').strip()
        ngay_mo_tk_from = data.get('ngayMoTKFrom', '').strip()
        ngay_mo_tk_to = data.get('ngayMoTKTo', '').strip()

        # Đã được xử lý ở trên trong phần validation

        # Sorting parameters
        sort_by = data.get('sortBy', 'cifNumber')
        sort_order = data.get('sortOrder', 'asc')
        
        # Validate sorting parameters
        valid_sort_fields = ['cifNumber', 'hoTen', 'ngaySinh', 'gioiTinh', 'segmentKH', 'trangThaiKH', 'ngayMoTK', 'chiNhanh', 'soDuHienTai', 'mucThuNhap']
        if sort_by not in valid_sort_fields:
            return jsonify({
                'success': False,
                'data': None,
                'message': f'sortBy không hợp lệ. Phải là một trong: {", ".join(valid_sort_fields)}'
            }), 400
        
        if sort_order not in ['asc', 'desc']:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'sortOrder phải là "asc" hoặc "desc"'
            }), 400

        # Build query
        query = Customer.query

        # General text search (tìm kiếm tổng quát)
        if search_term:
            search_conditions = or_(
                Customer.ho_ten.contains(search_term),
                Customer.cif_number.contains(search_term),
                Customer.cmnd.contains(search_term),
                Customer.so_dien_thoai.contains(search_term),
                Customer.email.contains(search_term),
                Customer.dia_chi.contains(search_term),
                Customer.so_tai_khoan.contains(search_term)
            )
            query = query.filter(search_conditions)

        # Specific field filters (tìm kiếm chính xác theo từng trường)
        if cif_number:
            query = query.filter(Customer.cif_number.contains(cif_number))
        
        if ho_ten:
            query = query.filter(Customer.ho_ten.contains(ho_ten))
        
        if cmnd:
            query = query.filter(Customer.cmnd.contains(cmnd))
        
        if so_dien_thoai:
            query = query.filter(Customer.so_dien_thoai.contains(so_dien_thoai))
        
        if email:
            query = query.filter(Customer.email.contains(email))
        
        if dia_chi:
            query = query.filter(Customer.dia_chi.contains(dia_chi))
        
        if so_tai_khoan:
            query = query.filter(Customer.so_tai_khoan.contains(so_tai_khoan))
        
        if nghe_nghiep:
            query = query.filter(Customer.nghe_nghiep.contains(nghe_nghiep))
        
        if nhan_vien_quan_ly:
            query = query.filter(Customer.nhan_vien_quan_ly.contains(nhan_vien_quan_ly))
        
        if ngan_hang_tai_khoan:
            query = query.filter(Customer.ngan_hang_tai_khoan.contains(ngan_hang_tai_khoan))

        # Enum filters (filter theo giá trị enum)
        if gioi_tinh:
            if gioi_tinh == 'Nam':
                query = query.filter(Customer.gioi_tinh == GenderEnum.NAM)
            elif gioi_tinh == 'Nữ':
                query = query.filter(Customer.gioi_tinh == GenderEnum.NU)

        if tinh_trang_hon_nhan:
            tinh_trang_mapping = {
                'Độc thân': MaritalStatusEnum.DOC_THAN,
                'Đã kết hôn': MaritalStatusEnum.DA_KET_HON,
                'Ly hôn': MaritalStatusEnum.LY_HON,
                'Góa': MaritalStatusEnum.GOA
            }
            if tinh_trang_hon_nhan in tinh_trang_mapping:
                query = query.filter(Customer.tinh_trang_hon_nhan == tinh_trang_mapping[tinh_trang_hon_nhan])

        if loai_khach_hang:
            loai_kh_mapping = {
                'Cá nhân': CustomerTypeEnum.CA_NHAN,
                'Doanh nghiệp': CustomerTypeEnum.DOANH_NGHIEP
            }
            if loai_khach_hang in loai_kh_mapping:
                query = query.filter(Customer.loai_khach_hang == loai_kh_mapping[loai_khach_hang])

        if segment_kh:
            segment_mapping = {
                'Basic': SegmentEnum.BASIC,
                'Standard': SegmentEnum.STANDARD,
                'Premium': SegmentEnum.PREMIUM,
                'VIP': SegmentEnum.VIP
            }
            if segment_kh in segment_mapping:
                query = query.filter(Customer.segment_kh == segment_mapping[segment_kh])

        if trang_thai_kh:
            status_mapping = {
                'Hoạt động': StatusEnum.HOAT_DONG,
                'Tạm khóa': StatusEnum.TAM_KHOA,
                'Đóng': StatusEnum.DONG
            }
            if trang_thai_kh in status_mapping:
                query = query.filter(Customer.trang_thai_kh == status_mapping[trang_thai_kh])

        if chi_nhanh:
            query = query.filter(Customer.chi_nhanh.contains(chi_nhanh))

        # Range filters (filter theo khoảng giá trị)
        if muc_thu_nhap_min is not None:
            query = query.filter(Customer.muc_thu_nhap >= muc_thu_nhap_min)
        if muc_thu_nhap_max is not None:
            query = query.filter(Customer.muc_thu_nhap <= muc_thu_nhap_max)

        if so_du_min is not None:
            query = query.filter(Customer.so_du_hien_tai >= so_du_min)
        if so_du_max is not None:
            query = query.filter(Customer.so_du_hien_tai <= so_du_max)

        # Date range filters (filter theo khoảng ngày)
        if ngay_sinh_from:
            try:
                ngay_sinh_from_date = datetime.strptime(ngay_sinh_from, '%d/%m/%Y').date()
                query = query.filter(Customer.ngay_sinh >= ngay_sinh_from_date)
            except:
                pass

        if ngay_sinh_to:
            try:
                ngay_sinh_to_date = datetime.strptime(ngay_sinh_to, '%d/%m/%Y').date()
                query = query.filter(Customer.ngay_sinh <= ngay_sinh_to_date)
            except:
                pass

        if ngay_mo_tk_from:
            try:
                ngay_mo_tk_from_date = datetime.strptime(ngay_mo_tk_from, '%d/%m/%Y').date()
                query = query.filter(Customer.ngay_mo_tk >= ngay_mo_tk_from_date)
            except:
                pass

        if ngay_mo_tk_to:
            try:
                ngay_mo_tk_to_date = datetime.strptime(ngay_mo_tk_to, '%d/%m/%Y').date()
                query = query.filter(Customer.ngay_mo_tk <= ngay_mo_tk_to_date)
            except:
                pass

        # Age range filters (filter theo tuổi)
        if tuoi_min is not None or tuoi_max is not None:
            from datetime import date
            today = date.today()
            
            if tuoi_max is not None:
                # Tuổi tối đa -> ngày sinh tối thiểu
                ngay_sinh_min = date(today.year - tuoi_max - 1, today.month, today.day)
                query = query.filter(Customer.ngay_sinh >= ngay_sinh_min)
            
            if tuoi_min is not None:
                # Tuổi tối thiểu -> ngày sinh tối đa
                ngay_sinh_max = date(today.year - tuoi_min, today.month, today.day)
                query = query.filter(Customer.ngay_sinh <= ngay_sinh_max)

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

    except Exception as e:
        return jsonify({
            'success': False,
            'data': None,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@customers_body_bp.route('/customers/create', methods=['POST'])
def create_customer():
    """
    Tạo khách hàng mới với dữ liệu từ request body
    Request Body:
    {
        "cifNumber": "CIF001234999",
        "hoTen": "Nguyễn Văn Test",
        "cmnd": "123456789999",
        "ngaySinh": "01/01/1990",
        "gioiTinh": "Nam",
        "diaChi": "123 Test Street",
        "soDienThoai": "0912345999",
        "email": "test@email.com",
        "ngheNghiep": "Kỹ sư",
        "tinhTrangHonNhan": "Độc thân",
        "mucThuNhap": 20000000,
        "soTaiKhoan": "9999999999999",
        "loaiKhachHang": "Cá nhân",
        "segmentKH": "Standard",
        "trangThaiKH": "Hoạt động",
        "nhanVienQuanLy": "Manager Test",
        "chiNhanh": "CN Test",
        "soDuHienTai": 10000000
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'Request body không hợp lệ'
            }), 400

        # Validate required fields
        required_fields = ['cifNumber', 'hoTen', 'cmnd', 'ngaySinh', 'soTaiKhoan']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'data': None,
                    'message': f'Trường {field} là bắt buộc'
                }), 400

        # Validate numeric fields
        def validate_number_field(value, field_name, min_val=0, max_val=None):
            if value is not None:
                try:
                    num_value = int(value) if value != "" else 0
                    if num_value < min_val:
                        return f'{field_name} phải >= {min_val}'
                    if max_val and num_value > max_val:
                        return f'{field_name} phải <= {max_val:,}'
                    return None
                except (ValueError, TypeError):
                    return f'{field_name} phải là số nguyên hợp lệ'
            return None

        # Validate mucThuNhap (DECIMAL(15,0) - max 15 digits)
        if 'mucThuNhap' in data and data['mucThuNhap'] not in [None, "", 0]:
            error = validate_number_field(data['mucThuNhap'], 'mucThuNhap', 0, 999999999999999)  # 15 chữ số 9
            if error:
                return jsonify({
                    'success': False,
                    'data': None,
                    'message': error
                }), 400

        # Validate soDuHienTai (DECIMAL(18,0) - max 18 digits)
        if 'soDuHienTai' in data and data['soDuHienTai'] not in [None, "", 0]:
            error = validate_number_field(data['soDuHienTai'], 'soDuHienTai', 0, 999999999999999999)  # 18 chữ số 9
            if error:
                return jsonify({
                    'success': False,
                    'data': None,
                    'message': error
                }), 400

        # Validate string lengths
        string_validations = {
            'cifNumber': 20,
            'hoTen': 100,
            'cmnd': 20,
            'diaChi': 500,
            'soDienThoai': 20,
            'email': 100,
            'ngheNghiep': 100,
            'soTaiKhoan': 20,
            'nganHangTaiKhoan': 50,
            'nhanVienQuanLy': 100,
            'chiNhanh': 100
        }

        for field, max_length in string_validations.items():
            if field in data and data[field] and len(str(data[field])) > max_length:
                return jsonify({
                    'success': False,
                    'data': None,
                    'message': f'{field} không được vượt quá {max_length} ký tự'
                }), 400

        # Check if customer already exists
        existing_cif = Customer.query.filter_by(cif_number=data['cifNumber']).first()
        if existing_cif:
            return jsonify({
                'success': False,
                'data': None,
                'message': f'Khách hàng với CIF {data["cifNumber"]} đã tồn tại'
            }), 400

        existing_cmnd = Customer.query.filter_by(cmnd=data['cmnd']).first()
        if existing_cmnd:
            return jsonify({
                'success': False,
                'data': None,
                'message': f'Khách hàng với CMND {data["cmnd"]} đã tồn tại'
            }), 400

        existing_account = Customer.query.filter_by(so_tai_khoan=data['soTaiKhoan']).first()
        if existing_account:
            return jsonify({
                'success': False,
                'data': None,
                'message': f'Số tài khoản {data["soTaiKhoan"]} đã tồn tại'
            }), 400

        # Parse date
        try:
            ngay_sinh = datetime.strptime(data['ngaySinh'], '%d/%m/%Y').date()
        except:
            try:
                ngay_sinh = datetime.strptime(data['ngaySinh'], '%Y-%m-%d').date()
            except:
                return jsonify({
                    'success': False,
                    'data': None,
                    'message': 'Định dạng ngày sinh không hợp lệ (DD/MM/YYYY hoặc YYYY-MM-DD)'
                }), 400

        # Parse ngayMoTK
        if 'ngayMoTK' in data:
            try:
                ngay_mo_tk = datetime.strptime(data['ngayMoTK'], '%d/%m/%Y').date()
            except:
                try:
                    ngay_mo_tk = datetime.strptime(data['ngayMoTK'], '%Y-%m-%d').date()
                except:
                    ngay_mo_tk = date.today()
        else:
            ngay_mo_tk = date.today()

        # Map enum values
        gioi_tinh = GenderEnum.NAM if data.get('gioiTinh') == 'Nam' else GenderEnum.NU
        
        tinh_trang_mapping = {
            'Độc thân': MaritalStatusEnum.DOC_THAN,
            'Đã kết hôn': MaritalStatusEnum.DA_KET_HON,
            'Ly hôn': MaritalStatusEnum.LY_HON,
            'Góa': MaritalStatusEnum.GOA
        }
        tinh_trang_hon_nhan = tinh_trang_mapping.get(data.get('tinhTrangHonNhan'), MaritalStatusEnum.DOC_THAN)
        
        loai_kh_mapping = {
            'Cá nhân': CustomerTypeEnum.CA_NHAN,
            'Doanh nghiệp': CustomerTypeEnum.DOANH_NGHIEP
        }
        loai_khach_hang = loai_kh_mapping.get(data.get('loaiKhachHang'), CustomerTypeEnum.CA_NHAN)
        
        segment_mapping = {
            'Basic': SegmentEnum.BASIC,
            'Standard': SegmentEnum.STANDARD,
            'Premium': SegmentEnum.PREMIUM,
            'VIP': SegmentEnum.VIP
        }
        segment_kh = segment_mapping.get(data.get('segmentKH'), SegmentEnum.BASIC)
        
        status_mapping = {
            'Hoạt động': StatusEnum.HOAT_DONG,
            'Tạm khóa': StatusEnum.TAM_KHOA,
            'Đóng': StatusEnum.DONG
        }
        trang_thai_kh = status_mapping.get(data.get('trangThaiKH'), StatusEnum.HOAT_DONG)

        # Create new customer
        customer = Customer(
            cif_number=data['cifNumber'],
            ho_ten=data['hoTen'],
            cmnd=data['cmnd'],
            ngay_sinh=ngay_sinh,
            gioi_tinh=gioi_tinh,
            dia_chi=data.get('diaChi'),
            so_dien_thoai=data.get('soDienThoai'),
            email=data.get('email'),
            nghe_nghiep=data.get('ngheNghiep'),
            tinh_trang_hon_nhan=tinh_trang_hon_nhan,
            muc_thu_nhap=data.get('mucThuNhap', 0),
            so_tai_khoan=data['soTaiKhoan'],
            loai_khach_hang=loai_khach_hang,
            segment_kh=segment_kh,
            trang_thai_kh=trang_thai_kh,
            ngay_mo_tk=ngay_mo_tk,
            nhan_vien_quan_ly=data.get('nhanVienQuanLy'),
            chi_nhanh=data.get('chiNhanh'),
            so_du_hien_tai=data.get('soDuHienTai', 0)
        )

        db.session.add(customer)
        db.session.commit()

        return jsonify({
            'success': True,
            'data': customer.to_dict(),
            'message': 'Tạo khách hàng thành công'
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'data': None,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@customers_body_bp.route('/customers/get-by-body', methods=['POST'])
def get_customer_by_body():
    """
    Lấy chi tiết khách hàng với CIF từ request body
    Request Body:
    {
        "cifNumber": "CIF001234567"
    }
    """
    try:
        data = request.get_json()
        if not data or 'cifNumber' not in data:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'CIF Number là bắt buộc trong request body'
            }), 400

        customer = Customer.query.filter_by(cif_number=data['cifNumber']).first()
        
        if not customer:
            return jsonify({
                'success': False,
                'data': None,
                'message': f'Không tìm thấy khách hàng với mã CIF: {data["cifNumber"]}'
            }), 404

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

@customers_body_bp.route('/customers/update', methods=['PUT'])
def update_customer():
    """
    Cập nhật thông tin khách hàng với dữ liệu từ request body
    Request Body:
    {
        "cifNumber": "CIF001234567",
        "updateData": {
            "hoTen": "Nguyễn Văn An Updated",
            "diaChi": "456 Updated Street",
            "soDienThoai": "0987654321",
            "email": "updated@email.com",
            "ngheNghiep": "Senior Engineer",
            "mucThuNhap": 30000000,
            "segmentKH": "Premium",
            "nhanVienQuanLy": "Manager Updated",
            "chiNhanh": "CN Updated"
        }
    }
    """
    try:
        data = request.get_json()
        if not data or 'cifNumber' not in data:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'CIF Number là bắt buộc'
            }), 400

        customer = Customer.query.filter_by(cif_number=data['cifNumber']).first()
        if not customer:
            return jsonify({
                'success': False,
                'data': None,
                'message': f'Không tìm thấy khách hàng với CIF: {data["cifNumber"]}'
            }), 404

        update_data = data.get('updateData', {})
        
        # Update fields if provided
        if 'hoTen' in update_data:
            customer.ho_ten = update_data['hoTen']
        if 'diaChi' in update_data:
            customer.dia_chi = update_data['diaChi']
        if 'soDienThoai' in update_data:
            customer.so_dien_thoai = update_data['soDienThoai']
        if 'email' in update_data:
            customer.email = update_data['email']
        if 'ngheNghiep' in update_data:
            customer.nghe_nghiep = update_data['ngheNghiep']
        if 'mucThuNhap' in update_data:
            customer.muc_thu_nhap = update_data['mucThuNhap']
        if 'segmentKH' in update_data:
            segment_mapping = {
                'Basic': SegmentEnum.BASIC,
                'Standard': SegmentEnum.STANDARD,
                'Premium': SegmentEnum.PREMIUM,
                'VIP': SegmentEnum.VIP
            }
            customer.segment_kh = segment_mapping.get(update_data['segmentKH'], customer.segment_kh)
        if 'nhanVienQuanLy' in update_data:
            customer.nhan_vien_quan_ly = update_data['nhanVienQuanLy']
        if 'chiNhanh' in update_data:
            customer.chi_nhanh = update_data['chiNhanh']
        if 'soDuHienTai' in update_data:
            customer.so_du_hien_tai = update_data['soDuHienTai']

        customer.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'success': True,
            'data': customer.to_dict(),
            'message': 'Cập nhật thông tin khách hàng thành công'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'data': None,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@customers_body_bp.route('/customers/delete', methods=['DELETE'])
def delete_customer():
    """
    Xóa khách hàng với CIF từ request body
    Request Body:
    {
        "cifNumber": "CIF001234567",
        "lyDoXoa": "Khách hàng yêu cầu đóng tài khoản",
        "nguoiDuyet": "Branch Manager",
        "xacNhan": true
    }
    """
    try:
        data = request.get_json()
        if not data or 'cifNumber' not in data:
            return jsonify({
                'success': False,
                'data': None,
                'message': 'CIF Number là bắt buộc'
            }), 400

        if not data.get('xacNhan', False):
            return jsonify({
                'success': False,
                'data': None,
                'message': 'Cần xác nhận để xóa khách hàng'
            }), 400

        customer = Customer.query.filter_by(cif_number=data['cifNumber']).first()
        if not customer:
            return jsonify({
                'success': False,
                'data': None,
                'message': f'Không tìm thấy khách hàng với CIF: {data["cifNumber"]}'
            }), 404

        customer_info = customer.to_dict()
        db.session.delete(customer)
        db.session.commit()

        return jsonify({
            'success': True,
            'data': {
                'deletedCustomer': customer_info,
                'lyDoXoa': data.get('lyDoXoa'),
                'nguoiDuyet': data.get('nguoiDuyet'),
                'ngayXoa': datetime.utcnow().strftime('%d/%m/%Y %H:%M:%S')
            },
            'message': 'Xóa khách hàng thành công'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'data': None,
            'message': f'Lỗi server: {str(e)}'
        }), 500
