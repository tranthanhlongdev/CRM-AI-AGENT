from datetime import datetime, timedelta
from typing import Optional

from flask import current_app
from flask_sqlalchemy import SQLAlchemy
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash

from .customer import db  # reuse the same SQLAlchemy instance


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120))
    email = db.Column(db.String(120), unique=True, index=True)
    role = db.Column(db.String(50), default='user')
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password, method='pbkdf2:sha256')

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)

    def to_safe_dict(self) -> dict:
        return {
            'id': self.id,
            'username': self.username,
            'fullName': self.full_name,
            'email': self.email,
            'role': self.role,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class TokenBlacklist(db.Model):
    __tablename__ = 'token_blacklist'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    token = db.Column(db.String(500), nullable=False, index=True)
    token_type = db.Column(db.String(20), nullable=False)  # 'access' | 'refresh'
    blacklisted_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)

    @staticmethod
    def is_blacklisted(token: str) -> bool:
        record = TokenBlacklist.query.filter_by(token=token).first()
        if not record:
            return False
        # if expired, we can ignore; but being present is enough to consider invalid
        return True


def _get_serializer(salt: str) -> URLSafeTimedSerializer:
    secret_key = current_app.config.get('SECRET_KEY') or 'dev-secret-key'
    return URLSafeTimedSerializer(secret_key, salt=salt)


def generate_token(payload: dict, token_type: str = 'access', expires_in_seconds: int = 7200) -> str:
    # token_type: 'access' (default 2h) or 'refresh' (e.g., 7d)
    salt = f'crm-{token_type}-token'
    s = _get_serializer(salt)
    token = s.dumps(payload)
    return token


def verify_token(token: str, token_type: str = 'access', max_age_seconds: int = 7200) -> Optional[dict]:
    try:
        if TokenBlacklist.is_blacklisted(token):
            return None
        salt = f'crm-{token_type}-token'
        s = _get_serializer(salt)
        data = s.loads(token, max_age=max_age_seconds)
        return data
    except (BadSignature, SignatureExpired):
        return None


