from datetime import datetime
from enum import Enum
from models.customer import db


class CallStatus(Enum):
    INCOMING = 'incoming'       # Cuộc gọi đến
    RINGING = 'ringing'        # Đang đổ chuông
    CONNECTED = 'connected'    # Đã kết nối
    ON_HOLD = 'on_hold'       # Đang chờ
    TRANSFERRED = 'transferred' # Đã chuyển tiếp
    ENDED = 'ended'           # Đã kết thúc
    MISSED = 'missed'         # Gọi nhỡ
    BUSY = 'busy'             # Bận


class AgentStatus(Enum):
    AVAILABLE = 'available'    # Sẵn sàng nhận cuộc gọi
    BUSY = 'busy'             # Đang bận
    ON_CALL = 'on_call'       # Đang trong cuộc gọi
    AWAY = 'away'             # Tạm vắng
    OFFLINE = 'offline'       # Offline


class Call(db.Model):
    __tablename__ = 'calls'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    call_id = db.Column(db.String(50), unique=True, nullable=False, index=True)  # UUID cho cuộc gọi
    
    # Thông tin cuộc gọi
    caller_number = db.Column(db.String(20), nullable=False, index=True)  # Số gọi đến
    called_number = db.Column(db.String(20), nullable=False)              # Số được gọi (tổng đài)
    
    # Thông tin khách hàng (nếu có)
    customer_id = db.Column(db.BigInteger, db.ForeignKey('customers.id'), nullable=True)
    customer = db.relationship('Customer', backref='calls')
    
    # Thông tin agent xử lý
    agent_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=True)
    agent = db.relationship('User', backref='handled_calls')
    
    # Trạng thái cuộc gọi
    status = db.Column(db.Enum(CallStatus), default=CallStatus.INCOMING, nullable=False, index=True)
    
    # Thời gian
    start_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    answer_time = db.Column(db.DateTime, nullable=True)    # Thời gian agent nhấc máy
    end_time = db.Column(db.DateTime, nullable=True)       # Thời gian kết thúc
    
    # Metadata
    queue_time = db.Column(db.Integer, default=0)          # Thời gian chờ (giây)
    talk_duration = db.Column(db.Integer, default=0)       # Thời gian nói chuyện (giây)
    
    # Ghi chú
    notes = db.Column(db.Text, nullable=True)
    recording_url = db.Column(db.String(500), nullable=True)  # URL file ghi âm
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'callId': self.call_id,
            'callerNumber': self.caller_number,
            'calledNumber': self.called_number,
            'customerId': self.customer_id,
            'customerInfo': self.customer.to_dict() if self.customer else None,
            'agentId': self.agent_id,
            'agentInfo': {
                'id': self.agent.id,
                'username': self.agent.username,
                'fullName': self.agent.full_name
            } if self.agent else None,
            'status': self.status.value,
            'startTime': self.start_time.isoformat() if self.start_time else None,
            'answerTime': self.answer_time.isoformat() if self.answer_time else None,
            'endTime': self.end_time.isoformat() if self.end_time else None,
            'queueTime': self.queue_time,
            'talkDuration': self.talk_duration,
            'notes': self.notes,
            'recordingUrl': self.recording_url,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Call {self.call_id}: {self.caller_number} -> {self.called_number}>'


class Agent(db.Model):
    __tablename__ = 'agents'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), unique=True, nullable=False)
    user = db.relationship('User', backref='agent_profile')
    
    # Trạng thái agent
    status = db.Column(db.Enum(AgentStatus), default=AgentStatus.OFFLINE, nullable=False)
    
    # Cuộc gọi hiện tại
    current_call_id = db.Column(db.String(50), nullable=True, index=True)
    
    # Thống kê
    total_calls = db.Column(db.Integer, default=0)
    total_talk_time = db.Column(db.Integer, default=0)  # Tổng thời gian nói chuyện (giây)
    avg_handle_time = db.Column(db.Float, default=0.0)  # Thời gian xử lý trung bình
    
    # Skills và priority
    skills = db.Column(db.String(500), nullable=True)   # JSON array các kỹ năng
    priority = db.Column(db.Integer, default=1)         # Độ ưu tiên (1-10)
    
    # Thời gian
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    shift_start = db.Column(db.DateTime, nullable=True)
    shift_end = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'username': self.user.username if self.user else None,
            'fullName': self.user.full_name if self.user else None,
            'email': self.user.email if self.user else None,
            'status': self.status.value,
            'currentCallId': self.current_call_id,
            'totalCalls': self.total_calls,
            'totalTalkTime': self.total_talk_time,
            'avgHandleTime': self.avg_handle_time,
            'skills': self.skills,
            'priority': self.priority,
            'lastActivity': self.last_activity.isoformat() if self.last_activity else None,
            'shiftStart': self.shift_start.isoformat() if self.shift_start else None,
            'shiftEnd': self.shift_end.isoformat() if self.shift_end else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Agent {self.user.username if self.user else self.id}: {self.status.value}>'


class CallQueue(db.Model):
    __tablename__ = 'call_queue'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    call_id = db.Column(db.String(50), nullable=False, index=True)
    caller_number = db.Column(db.String(20), nullable=False)
    
    # Queue metadata
    queue_position = db.Column(db.Integer, nullable=False)
    priority = db.Column(db.Integer, default=1)  # 1 = thấp, 5 = cao
    estimated_wait_time = db.Column(db.Integer, default=0)  # Ước tính thời gian chờ (giây)
    
    # Timestamps
    queued_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'callId': self.call_id,
            'callerNumber': self.caller_number,
            'queuePosition': self.queue_position,
            'priority': self.priority,
            'estimatedWaitTime': self.estimated_wait_time,
            'queuedAt': self.queued_at.isoformat() if self.queued_at else None
        }
    
    def __repr__(self):
        return f'<CallQueue {self.call_id}: Position {self.queue_position}>'
