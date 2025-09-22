from datetime import datetime
from enum import Enum
import json

from .customer import db


class TicketPriority(Enum):
    URGENT = 'Urgent'
    HIGH = 'High'
    NORMAL = 'Normal'
    LOW = 'Low'


class TicketStatus(Enum):
    NEW = 'New'
    IN_PROGRESS = 'In Progress'
    PENDING = 'Pending'
    CLOSED = 'Closed'


class TicketChannel(Enum):
    INBOUND = 'Inbound'
    OUTBOUND = 'Outbound'
    DIGITAL = 'Digital'


class Ticket(db.Model):
    __tablename__ = 'tickets'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    code = db.Column(db.String(40), unique=True, index=True)
    cif_number = db.Column(db.String(20), nullable=False, index=True)
    customer_name = db.Column(db.String(255))
    phone = db.Column(db.String(50))

    priority = db.Column(db.Enum(TicketPriority), default=TicketPriority.NORMAL, index=True)
    channel = db.Column(db.Enum(TicketChannel), default=TicketChannel.INBOUND, index=True)
    assigned_to = db.Column(db.String(120))
    status = db.Column(db.Enum(TicketStatus), default=TicketStatus.NEW, index=True)

    product = db.Column(db.String(255))
    operation = db.Column(db.String(255))
    resolution_direction = db.Column(db.String(255))
    department_code = db.Column(db.String(50))
    call_result = db.Column(db.String(255))

    discussion_notes = db.Column(db.Text)  # up to notesMaxLen 2000 per validation
    resolution_summary = db.Column(db.Text)
    attachments_json = db.Column(db.Text)  # JSON array string

    branch = db.Column(db.String(120))
    segment = db.Column(db.String(50))

    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'code': self.code,
            'cifNumber': self.cif_number,
            'customerName': self.customer_name,
            'phone': self.phone,
            'priority': self.priority.value if self.priority else None,
            'channel': self.channel.value if self.channel else None,
            'assignedTo': self.assigned_to,
            'status': self.status.value if self.status else None,
            'product': self.product,
            'operation': self.operation,
            'resolutionDirection': self.resolution_direction,
            'departmentCode': self.department_code,
            'callResult': self.call_result,
            'discussionNotes': self.discussion_notes,
            'resolutionSummary': self.resolution_summary,
            'attachments': json.loads(self.attachments_json) if self.attachments_json else [],
            'branch': self.branch,
            'segment': self.segment,
            'createdAt': (self.created_at.isoformat() + 'Z') if self.created_at else None,
            'updatedAt': (self.updated_at.isoformat() + 'Z') if self.updated_at else None,
        }


