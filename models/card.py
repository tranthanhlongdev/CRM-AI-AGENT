from datetime import datetime
import uuid
from .customer import db

class Card(db.Model):
    __tablename__ = 'cards'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: f"CARD_{uuid.uuid4().hex[:12]}")
    card_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    masked_number = db.Column(db.String(20), nullable=False)
    card_type = db.Column(db.Enum('credit', 'debit'), nullable=False)
    card_name = db.Column(db.String(100), nullable=False)
    cif_number = db.Column(db.String(20), db.ForeignKey('customers.cif_number'), nullable=False)
    status = db.Column(db.Enum('active', 'inactive', 'blocked', 'expired', 'cancelled'), default='active')
    issue_date = db.Column(db.Date, nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    is_main_card = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    customer = db.relationship('Customer', backref='cards')
    block_transactions = db.relationship('CardBlockTransaction', backref='card', lazy=True)
    
    def to_dict(self):
        return {
            'cardId': self.id,
            'cardType': self.card_type,
            'cardNumber': self.card_number,
            'maskedNumber': self.masked_number,
            'cardName': self.card_name,
            'status': self.status,
            'issueDate': self.issue_date.strftime('%Y-%m-%d') if self.issue_date else None,
            'expiryDate': self.expiry_date.strftime('%Y-%m-%d') if self.expiry_date else None,
            'isMainCard': self.is_main_card
        }
    
    def to_secure_dict(self):
        """Return card info without sensitive data"""
        return {
            'cardId': self.id,
            'cardType': self.card_type,
            'maskedNumber': self.masked_number,
            'cardName': self.card_name,
            'status': self.status,
            'issueDate': self.issue_date.strftime('%Y-%m-%d') if self.issue_date else None,
            'expiryDate': self.expiry_date.strftime('%Y-%m-%d') if self.expiry_date else None,
            'isMainCard': self.is_main_card
        }
    
    def to_full_dict(self):
        """Return full card info for UI display"""
        return {
            'cardId': self.id,
            'cardNumber': self.card_number,
            'maskedNumber': self.masked_number,
            'cardType': self.card_type,
            'cardName': self.card_name,
            'status': self.status,
            'issueDate': self.issue_date.strftime('%Y-%m-%d') if self.issue_date else None,
            'expiryDate': self.expiry_date.strftime('%Y-%m-%d') if self.expiry_date else None,
            'isMainCard': self.is_main_card,
            'cifNumber': self.cif_number,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'statusDisplay': self.get_status_display(),
            'typeDisplay': self.get_type_display(),
            'cardIcon': self.get_card_icon(),
            'statusColor': self.get_status_color(),
            'canBlock': self.status == 'active',
            'canUnblock': self.status == 'blocked',
            'blockReason': self.get_latest_block_reason()
        }
    
    def get_status_display(self):
        """Get Vietnamese display text for card status"""
        status_display = {
            'active': 'Hoạt động',
            'inactive': 'Đã khóa',
            'blocked': 'Đã khóa',
            'expired': 'Hết hạn',
            'cancelled': 'Đã hủy'
        }
        return status_display.get(self.status, self.status)
    
    def get_type_display(self):
        """Get Vietnamese display text for card type"""
        type_display = {
            'credit': 'Thẻ tín dụng',
            'debit': 'Thẻ ghi nợ'
        }
        return type_display.get(self.card_type, self.card_type)
    
    def get_card_icon(self):
        """Get appropriate icon for card type"""
        icon_map = {
            'credit': '💳',
            'debit': '🏦'
        }
        return icon_map.get(self.card_type, '💳')
    
    def get_status_color(self):
        """Get color for card status"""
        color_map = {
            'active': 'success',
            'inactive': 'danger',
            'blocked': 'danger',
            'expired': 'warning',
            'cancelled': 'secondary'
        }
        return color_map.get(self.status, 'info')
    
    def get_latest_block_reason(self):
        """Get latest block reason if card is blocked"""
        if self.status == 'blocked' and self.block_transactions:
            latest_transaction = max(self.block_transactions, key=lambda x: x.created_at)
            return latest_transaction.block_reason
        return None

class CardBlockTransaction(db.Model):
    __tablename__ = 'card_block_transactions'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: f"TXN_{uuid.uuid4().hex[:12]}")
    card_id = db.Column(db.String(50), db.ForeignKey('cards.id'), nullable=False)
    cif_number = db.Column(db.String(20), nullable=False)
    block_reason = db.Column(db.Enum('lost', 'stolen', 'temporary', 'permanent', 'suspicious'), nullable=False)
    block_type = db.Column(db.Enum('temporary', 'permanent'), nullable=False)
    block_status = db.Column(db.Enum('pending', 'blocked', 'failed'), default='pending')
    customer_verification = db.Column(db.JSON)  # Store verification data
    notes = db.Column(db.Text)
    reference_number = db.Column(db.String(20), unique=True)
    block_time = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'transactionId': self.id,
            'cardId': self.card_id,
            'blockStatus': self.block_status,
            'blockType': self.block_type,
            'blockReason': self.block_reason,
            'blockTime': self.block_time.isoformat() if self.block_time else None,
            'referenceNumber': self.reference_number,
            'notes': self.notes,
            'cifNumber': self.cif_number,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_full_dict(self):
        """Return full transaction info for UI display"""
        return {
            'transactionId': self.id,
            'cardId': self.card_id,
            'blockStatus': self.block_status,
            'blockType': self.block_type,
            'blockReason': self.block_reason,
            'blockTime': self.block_time.isoformat() if self.block_time else None,
            'referenceNumber': self.reference_number,
            'notes': self.notes,
            'cifNumber': self.cif_number,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'statusDisplay': self.get_status_display(),
            'typeDisplay': self.get_type_display(),
            'reasonDisplay': self.get_reason_display(),
            'statusColor': self.get_status_color(),
            'canUnblock': self.block_status == 'blocked' and self.block_type == 'temporary',
            'customerVerification': self.customer_verification or {}
        }
    
    def get_status_display(self):
        """Get Vietnamese display text for block status"""
        status_display = {
            'pending': 'Đang xử lý',
            'blocked': 'Đã khóa',
            'failed': 'Thất bại'
        }
        return status_display.get(self.block_status, self.block_status)
    
    def get_type_display(self):
        """Get Vietnamese display text for block type"""
        type_display = {
            'temporary': 'Tạm thời',
            'permanent': 'Vĩnh viễn'
        }
        return type_display.get(self.block_type, self.block_type)
    
    def get_reason_display(self):
        """Get Vietnamese display text for block reason"""
        reason_display = {
            'lost': 'Thẻ bị mất',
            'stolen': 'Thẻ bị đánh cắp',
            'temporary': 'Khóa tạm thời',
            'permanent': 'Khóa vĩnh viễn',
            'suspicious': 'Giao dịch khả nghi'
        }
        return reason_display.get(self.block_reason, self.block_reason)
    
    def get_status_color(self):
        """Get color for block status"""
        color_map = {
            'pending': 'warning',
            'blocked': 'danger',
            'failed': 'secondary'
        }
        return color_map.get(self.block_status, 'info')
    
    def generate_reference_number(self):
        """Generate unique reference number"""
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        random_part = uuid.uuid4().hex[:6].upper()
        self.reference_number = f"REF{timestamp}{random_part}"
        return self.reference_number
