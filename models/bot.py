from datetime import datetime
import uuid
from .customer import db

class BotConversation(db.Model):
    __tablename__ = 'bot_conversations'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: f"conv_{uuid.uuid4().hex[:12]}")
    customer_phone = db.Column(db.String(15), nullable=False, index=True)
    customer_name = db.Column(db.String(100))
    customer_cif = db.Column(db.String(20))
    is_existing_customer = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    messages = db.relationship('BotMessage', backref='conversation', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'customerPhone': self.customer_phone,
            'customerName': self.customer_name,
            'customerCif': self.customer_cif,
            'isExistingCustomer': self.is_existing_customer,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class BotMessage(db.Model):
    __tablename__ = 'bot_messages'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: f"msg_{uuid.uuid4().hex[:12]}")
    conversation_id = db.Column(db.String(50), db.ForeignKey('bot_conversations.id'), nullable=False)
    message_type = db.Column(db.Enum('user', 'bot'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'conversationId': self.conversation_id,
            'type': self.message_type,
            'content': self.content,
            'timestamp': self.created_at.isoformat() if self.created_at else None
        }
