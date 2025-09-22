from datetime import datetime, timedelta
import hashlib
import os
import secrets

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import or_

from models.customer import db
from models.user import User, TokenBlacklist, generate_token, verify_token


auth_bp = Blueprint('auth', __name__)


def get_token_expiry_seconds(token_type: str) -> int:
    if token_type == 'refresh':
        # default 7 days
        return int(current_app.config.get('REFRESH_TOKEN_EXPIRES_SECONDS', 7 * 24 * 3600))
    if token_type == 'reset':
        # default 15 minutes for password reset
        return int(current_app.config.get('RESET_TOKEN_EXPIRES_SECONDS', 15 * 60))
    # default 2 hours for access
    return int(current_app.config.get('ACCESS_TOKEN_EXPIRES_SECONDS', 2 * 3600))


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        username = (data.get('username') or '').strip()
        password = data.get('password') or ''

        if not username or not password:
            return jsonify({
                'success': False,
                'message': 'username và password là bắt buộc'
            }), 400

        user = User.query.filter_by(username=username, is_active=True).first()
        if not user or not user.check_password(password):
            return jsonify({
                'success': False,
                'message': 'Sai username hoặc password'
            }), 401

        access_exp = get_token_expiry_seconds('access')
        refresh_exp = get_token_expiry_seconds('refresh')

        payload = {
            'uid': user.id,
            'username': user.username,
            'role': user.role,
            'iat': int(datetime.utcnow().timestamp())
        }

        access_token = generate_token(payload, token_type='access', expires_in_seconds=access_exp)
        refresh_token = generate_token(payload, token_type='refresh', expires_in_seconds=refresh_exp)

        return jsonify({
            'success': True,
            'data': {
                'user': user.to_safe_dict(),
                'tokens': {
                    'accessToken': access_token,
                    'accessTokenExpiresIn': access_exp,
                    'refreshToken': refresh_token,
                    'refreshTokenExpiresIn': refresh_exp
                }
            },
            'message': 'Đăng nhập thành công'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    try:
        data = request.get_json() or {}
        access_token = data.get('accessToken')
        refresh_token = data.get('refreshToken')

        if not access_token and not refresh_token:
            return jsonify({
                'success': False,
                'message': 'Cần truyền accessToken hoặc refreshToken để logout'
            }), 400

        now = datetime.utcnow()

        if access_token:
            # blacklist access token
            access_exp_seconds = get_token_expiry_seconds('access')
            db.session.add(TokenBlacklist(
                token=access_token,
                token_type='access',
                expires_at=now + timedelta(seconds=access_exp_seconds)
            ))

        if refresh_token:
            # blacklist refresh token
            refresh_exp_seconds = get_token_expiry_seconds('refresh')
            db.session.add(TokenBlacklist(
                token=refresh_token,
                token_type='refresh',
                expires_at=now + timedelta(seconds=refresh_exp_seconds)
            ))

        db.session.commit()

        return jsonify({'success': True, 'message': 'Đăng xuất thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@auth_bp.route('/auth/refresh', methods=['POST'])
def refresh():
    try:
        data = request.get_json() or {}
        refresh_token = data.get('refreshToken')
        if not refresh_token:
            return jsonify({'success': False, 'message': 'Thiếu refreshToken'}), 400

        payload = verify_token(
            refresh_token,
            token_type='refresh',
            max_age_seconds=get_token_expiry_seconds('refresh')
        )
        if not payload:
            return jsonify({'success': False, 'message': 'refreshToken không hợp lệ hoặc đã hết hạn'}), 401

        # Issue new access token
        access_exp = get_token_expiry_seconds('access')
        new_access = generate_token(payload, token_type='access', expires_in_seconds=access_exp)
        return jsonify({
            'success': True,
            'data': {
                'accessToken': new_access,
                'accessTokenExpiresIn': access_exp
            },
            'message': 'Cấp mới access token thành công'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@auth_bp.route('/auth/me', methods=['POST'])
def me():
    try:
        data = request.get_json() or {}
        access_token = data.get('accessToken')
        if not access_token:
            return jsonify({'success': False, 'message': 'Thiếu accessToken'}), 400

        payload = verify_token(access_token, token_type='access', max_age_seconds=get_token_expiry_seconds('access'))
        if not payload:
            return jsonify({'success': False, 'message': 'accessToken không hợp lệ hoặc đã hết hạn'}), 401

        user = User.query.get(payload.get('uid'))
        if not user or not user.is_active:
            return jsonify({'success': False, 'message': 'Tài khoản không còn hoạt động'}), 401

        return jsonify({'success': True, 'data': user.to_safe_dict(), 'message': 'Thông tin người dùng'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


# ============== User Registration & Secret Key Utilities ==============

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """
    Tạo tài khoản người dùng mới
    Body:
    {
      "username": string (required),
      "password": string (required, >= 6),
      "fullName": string,
      "email": string,
      "role": "admin" | "user" (default: "user"),
      "isActive": boolean (default: true)
    }
    """
    try:
        data = request.get_json() or {}
        username = (data.get('username') or '').strip()
        password = data.get('password') or ''
        full_name = (data.get('fullName') or '').strip() or None
        email = (data.get('email') or '').strip() or None
        role = (data.get('role') or 'user').strip() or 'user'
        is_active = bool(data.get('isActive', True))

        # Basic validation
        if not username or not password:
            return jsonify({'success': False, 'message': 'username và password là bắt buộc'}), 400
        if len(username) < 3 or len(username) > 80:
            return jsonify({'success': False, 'message': 'username phải từ 3 đến 80 ký tự'}), 400
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'password phải có ít nhất 6 ký tự'}), 400

        # Uniqueness checks
        if User.query.filter_by(username=username).first():
            return jsonify({'success': False, 'message': 'username đã tồn tại'}), 409
        if email and User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'email đã tồn tại'}), 409

        # Create user
        user = User(username=username, full_name=full_name, email=email, role=role, is_active=is_active)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        return jsonify({
            'success': True,
            'data': user.to_safe_dict(),
            'message': 'Tạo người dùng thành công'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@auth_bp.route('/auth/secret-key', methods=['POST'])
def generate_secret_key_endpoint():
    """
    Tạo SECRET_KEY từ chuỗi bất kỳ (seed) hoặc tạo ngẫu nhiên nếu không truyền seed.
    Body (optional): { "seed": string }
    Trả về: secretKey (chuỗi an toàn để dùng trong config.py hoặc biến môi trường)
    """
    try:
        data = request.get_json() or {}
        seed = (data.get('seed') or '').strip()

        if seed:
            # Derive secret from seed + random salt for better entropy
            salt = secrets.token_bytes(16)
            derived = hashlib.pbkdf2_hmac('sha256', seed.encode('utf-8'), salt, 200_000, dklen=32)
            secret_key = derived.hex()
        else:
            # Generate a strong random secret key
            secret_key = secrets.token_urlsafe(48)

        return jsonify({
            'success': True,
            'data': {
                'secretKey': secret_key,
                'note': 'Hãy set SECRET_KEY trong biến môi trường hoặc config.py để áp dụng.'
            },
            'message': 'Tạo SECRET_KEY thành công'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@auth_bp.route('/auth/users', methods=['GET'])
def get_users():
    """
    Lấy danh sách tất cả user (có phân trang, tìm kiếm)
    Query params:
      - search: lọc theo username/fullName/email
      - page: trang hiện tại (default 1)
      - limit: số bản ghi/trang (default 10, max 100)
      - sortBy: username|createdAt (default createdAt)
      - sortOrder: asc|desc (default desc)
    """
    try:
        search = (request.args.get('search') or '').strip()
        page = max(int(request.args.get('page', 1)), 1)
        limit = min(max(int(request.args.get('limit', 10)), 1), 100)
        sort_by = (request.args.get('sortBy') or 'createdAt').strip()
        sort_order = (request.args.get('sortOrder') or 'desc').strip().lower()

        query = User.query
        if search:
            like = f"%{search}%"
            query = query.filter(or_(
                User.username.like(like),
                User.full_name.like(like),
                User.email.like(like)
            ))

        # Sorting
        if sort_by == 'username':
            order_field = User.username
        else:
            order_field = User.created_at
        query = query.order_by(order_field.asc() if sort_order == 'asc' else order_field.desc())

        total = query.count()
        records = query.offset((page - 1) * limit).limit(limit).all()

        return jsonify({
            'success': True,
            'data': {
                'users': [u.to_safe_dict() for u in records],
                'pagination': {
                    'currentPage': page,
                    'totalPages': (total + limit - 1) // limit,
                    'totalRecords': total,
                    'limit': limit
                }
            },
            'message': 'Danh sách người dùng'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@auth_bp.route('/auth/users', methods=['POST'])
def create_user():
    """
    Thêm mới user (dành cho admin)
    Body: { username, password, fullName?, email?, role?, isActive? }
    """
    try:
        data = request.get_json() or {}
        username = (data.get('username') or '').strip()
        password = data.get('password') or ''
        full_name = (data.get('fullName') or '').strip() or None
        email = (data.get('email') or '').strip() or None
        role = (data.get('role') or 'user').strip() or 'user'
        is_active = bool(data.get('isActive', True))

        if not username or not password:
            return jsonify({'success': False, 'message': 'username và password là bắt buộc'}), 400
        if len(username) < 3 or len(username) > 80:
            return jsonify({'success': False, 'message': 'username phải từ 3 đến 80 ký tự'}), 400
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'password phải có ít nhất 6 ký tự'}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({'success': False, 'message': 'username đã tồn tại'}), 409
        if email and User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'email đã tồn tại'}), 409

        user = User(username=username, full_name=full_name, email=email, role=role, is_active=is_active)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        return jsonify({'success': True, 'data': user.to_safe_dict(), 'message': 'Tạo người dùng thành công'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@auth_bp.route('/auth/users/<int:user_id>', methods=['PUT'])
def update_user(user_id: int):
    """
    Cập nhật thông tin user
    Body: { fullName?, email?, role?, isActive?, password? }
    """
    try:
        data = request.get_json() or {}
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'Không tìm thấy user'}), 404

        if 'fullName' in data:
            user.full_name = (data.get('fullName') or '').strip() or None
        if 'email' in data:
            new_email = (data.get('email') or '').strip() or None
            if new_email and User.query.filter(User.id != user.id, User.email == new_email).first():
                return jsonify({'success': False, 'message': 'email đã tồn tại'}), 409
            user.email = new_email
        if 'role' in data:
            user.role = (data.get('role') or 'user').strip() or 'user'
        if 'isActive' in data:
            user.is_active = bool(data.get('isActive'))
        if 'password' in data and (data.get('password') or ''):
            if len(data['password']) < 6:
                return jsonify({'success': False, 'message': 'password phải có ít nhất 6 ký tự'}), 400
            user.set_password(data['password'])

        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'success': True, 'data': user.to_safe_dict(), 'message': 'Cập nhật người dùng thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@auth_bp.route('/auth/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id: int):
    """
    Xóa user (hard delete). Có thể đổi thành soft delete bằng cách set isActive=false.
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'Không tìm thấy user'}), 404

        db.session.delete(user)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Xóa người dùng thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500

@auth_bp.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    """
    Bước 1: Yêu cầu đặt lại mật khẩu
    Body: { "usernameOrEmail": "string" }
    Trả về: resetToken (dùng để gọi bước 2). Trong thực tế nên gửi token qua email.
    """
    try:
        data = request.get_json() or {}
        identifier = (data.get('usernameOrEmail') or '').strip()
        if not identifier:
            return jsonify({'success': False, 'message': 'Thiếu usernameOrEmail'}), 400

        user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
        if not user:
            # Để tránh lộ thông tin, vẫn trả success
            return jsonify({'success': True, 'message': 'Nếu tài khoản tồn tại, một mã đặt lại đã được tạo.'}), 200

        payload = {
            'uid': user.id,
            'username': user.username,
            'purpose': 'password_reset',
            'iat': int(datetime.utcnow().timestamp())
        }
        ttl = get_token_expiry_seconds('reset')
        reset_token = generate_token(payload, token_type='reset', expires_in_seconds=ttl)

        # Thực tế: gửi reset_token qua email cho user.email.
        return jsonify({
            'success': True,
            'data': {
                'resetToken': reset_token,
                'expiresIn': ttl
            },
            'message': 'Tạo mã đặt lại mật khẩu thành công'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@auth_bp.route('/auth/reset-password', methods=['POST'])
def reset_password():
    """
    Bước 2: Đặt lại mật khẩu
    Body: { "resetToken": string, "newPassword": string (>=6) }
    """
    try:
        data = request.get_json() or {}
        reset_token = data.get('resetToken')
        new_password = data.get('newPassword') or ''

        if not reset_token or not new_password:
            return jsonify({'success': False, 'message': 'Thiếu resetToken hoặc newPassword'}), 400
        if len(new_password) < 6:
            return jsonify({'success': False, 'message': 'newPassword phải từ 6 ký tự trở lên'}), 400

        payload = verify_token(reset_token, token_type='reset', max_age_seconds=get_token_expiry_seconds('reset'))
        if not payload or payload.get('purpose') != 'password_reset':
            return jsonify({'success': False, 'message': 'resetToken không hợp lệ hoặc đã hết hạn'}), 400

        user = User.query.get(payload.get('uid'))
        if not user or not user.is_active:
            return jsonify({'success': False, 'message': 'Tài khoản không tồn tại hoặc không hoạt động'}), 400

        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'success': True, 'message': 'Đặt lại mật khẩu thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500

