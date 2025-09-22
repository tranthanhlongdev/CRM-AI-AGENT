from datetime import datetime
import math
import json

from flask import Blueprint, request, jsonify
from sqlalchemy import or_, and_

from models.customer import db
from models.ticket import Ticket, TicketPriority, TicketStatus, TicketChannel


tickets_bp = Blueprint('tickets', __name__)


def _validate_text(s, maxlen):
    if s is None:
        return None
    s = str(s)
    return s if len(s) <= maxlen else s[:maxlen]


def _gen_code():
    now = datetime.utcnow()
    return f"TCK-{now.year}-{now.month:02d}-{int(now.timestamp())}"


def _map_enum(value, enum_cls, default_value):
    if not value:
        return default_value
    for e in enum_cls:
        if e.value == value:
            return e
    return default_value


@tickets_bp.route('/tickets/search', methods=['POST'])
def search_tickets():
    try:
        data = request.get_json() or {}
        search_term = (data.get('searchTerm') or '').strip()
        cif_number = (data.get('cifNumber') or '').strip()
        branch = (data.get('branch') or '').strip()
        status = (data.get('status') or '').strip()
        priority = (data.get('priority') or '').strip()
        channel = (data.get('channel') or '').strip()
        assigned_to = (data.get('assignedTo') or '').strip()
        segment = (data.get('segment') or '').strip()
        date_from = data.get('dateFrom')
        date_to = data.get('dateTo')
        page = max(int(data.get('page', 1)), 1)
        limit = min(max(int(data.get('limit', 15)), 1), 100)
        sort_by = (data.get('sortBy') or 'createdAt')
        sort_order = (data.get('sortOrder') or 'desc').lower()

        q = Ticket.query

        if search_term:
            like = f"%{search_term}%"
            q = q.filter(or_(
                Ticket.code.like(like),
                Ticket.cif_number.like(like),
                Ticket.customer_name.like(like),
                Ticket.phone.like(like)
            ))

        if cif_number:
            q = q.filter(Ticket.cif_number == cif_number)
        if branch:
            q = q.filter(Ticket.branch == branch)
        if status:
            q = q.filter(Ticket.status == _map_enum(status, TicketStatus, None))
        if priority:
            q = q.filter(Ticket.priority == _map_enum(priority, TicketPriority, None))
        if channel:
            q = q.filter(Ticket.channel == _map_enum(channel, TicketChannel, None))
        if assigned_to:
            q = q.filter(Ticket.assigned_to == assigned_to)
        if segment:
            q = q.filter(Ticket.segment == segment)

        def parse_dt(x):
            if not x:
                return None
            try:
                return datetime.fromisoformat(x.replace('Z','').replace('z',''))
            except Exception:
                return None

        df = parse_dt(date_from)
        dt = parse_dt(date_to)
        if df:
            q = q.filter(Ticket.created_at >= df)
        if dt:
            q = q.filter(Ticket.created_at <= dt)

        order_field = Ticket.created_at if sort_by == 'createdAt' else Ticket.created_at
        q = q.order_by(order_field.asc() if sort_order == 'asc' else order_field.desc())

        total = q.count()
        records = q.offset((page-1)*limit).limit(limit).all()

        return jsonify({
            'success': True,
            'data': {
                'tickets': [t.to_dict() for t in records],
                'pagination': {
                    'currentPage': page,
                    'totalPages': (total + limit - 1)//limit,
                    'totalRecords': total,
                    'limit': limit
                }
            },
            'message': 'Danh sách ticket'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'data': None, 'message': f'Lỗi server: {str(e)}'}), 500


@tickets_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
def get_ticket_detail(ticket_id: int):
    try:
        t = Ticket.query.get(ticket_id)
        if not t:
            return jsonify({'success': False, 'data': None, 'message': 'Không tìm thấy ticket'}), 404
        return jsonify({'success': True, 'data': t.to_dict(), 'message': 'Chi tiết ticket'}), 200
    except Exception as e:
        return jsonify({'success': False, 'data': None, 'message': f'Lỗi server: {str(e)}'}), 500


@tickets_bp.route('/tickets', methods=['POST'])
def create_ticket():
    try:
        data = request.get_json() or {}
        # Validation
        if not (data.get('cifNumber') or '').strip():
            return jsonify({'success': False, 'data': None, 'message': 'cifNumber là bắt buộc'}), 400

        text_max = 255
        notes_max = 2000

        ticket = Ticket(
            code=_gen_code(),
            cif_number=(data.get('cifNumber') or '').strip(),
            customer_name=_validate_text(data.get('customerName'), text_max),
            phone=_validate_text(data.get('phone'), text_max),
            priority=_map_enum(data.get('priority'), TicketPriority, TicketPriority.NORMAL),
            channel=_map_enum(data.get('channel'), TicketChannel, TicketChannel.INBOUND),
            assigned_to=_validate_text(data.get('assignedTo'), 120),
            status=_map_enum(data.get('status'), TicketStatus, TicketStatus.NEW),
            product=_validate_text(data.get('product'), text_max),
            operation=_validate_text(data.get('operation'), text_max),
            resolution_direction=_validate_text(data.get('resolutionDirection'), text_max),
            department_code=_validate_text(data.get('departmentCode'), 50),
            call_result=_validate_text(data.get('callResult'), text_max),
            discussion_notes=_validate_text(data.get('discussionNotes'), notes_max),
            resolution_summary=_validate_text(data.get('resolutionSummary'), notes_max),
            attachments_json=json.dumps(data.get('attachments') or []),
            branch=_validate_text(data.get('branch'), 120),
            segment=_validate_text(data.get('segment'), 50)
        )

        db.session.add(ticket)
        db.session.commit()

        return jsonify({'success': True, 'data': ticket.to_dict(), 'message': 'Tạo ticket thành công'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'data': None, 'message': f'Lỗi server: {str(e)}'}), 500


@tickets_bp.route('/tickets/<int:ticket_id>', methods=['PUT'])
def update_ticket(ticket_id: int):
    try:
        data = request.get_json() or {}
        t = Ticket.query.get(ticket_id)
        if not t:
            return jsonify({'success': False, 'data': None, 'message': 'Không tìm thấy ticket'}), 404

        text_max = 255
        notes_max = 2000

        # Update allowed fields
        if 'status' in data:
            t.status = _map_enum(data.get('status'), TicketStatus, t.status)
        if 'priority' in data:
            t.priority = _map_enum(data.get('priority'), TicketPriority, t.priority)
        if 'assignedTo' in data:
            t.assigned_to = _validate_text(data.get('assignedTo'), 120)
        for key, attr, limit in [
            ('product', 'product', text_max),
            ('operation', 'operation', text_max),
            ('resolutionDirection', 'resolution_direction', text_max),
            ('departmentCode', 'department_code', 50),
            ('callResult', 'call_result', text_max),
            ('discussionNotes', 'discussion_notes', notes_max),
            ('resolutionSummary', 'resolution_summary', notes_max),
            ('branch', 'branch', 120),
            ('segment', 'segment', 50),
        ]:
            if key in data:
                setattr(t, attr, _validate_text(data.get(key), limit))

        if 'attachments' in data:
            t.attachments_json = json.dumps(data.get('attachments') or [])

        t.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'success': True, 'data': {'id': t.id, 'status': t.status.value if t.status else None}, 'message': 'Cập nhật ticket thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'data': None, 'message': f'Lỗi server: {str(e)}'}), 500


@tickets_bp.route('/tickets/<int:ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id: int):
    try:
        data = request.get_json() or {}
        t = Ticket.query.get(ticket_id)
        if not t:
            return jsonify({'success': False, 'data': None, 'message': 'Không tìm thấy ticket'}), 404

        db.session.delete(t)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Xóa ticket thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'data': None, 'message': f'Lỗi server: {str(e)}'}), 500


@tickets_bp.route('/tickets/by-cif', methods=['GET'])
def get_tickets_by_cif():
    try:
        cif = (request.args.get('cifNumber') or '').strip()
        limit = min(max(int(request.args.get('limit', 5)), 1), 50)
        if not cif:
            return jsonify({'success': False, 'data': None, 'message': 'Thiếu cifNumber'}), 400

        records = Ticket.query.filter_by(cif_number=cif).order_by(Ticket.created_at.desc()).limit(limit).all()
        return jsonify({'success': True, 'data': {'tickets': [ {'id': t.id, 'code': t.code, 'status': t.status.value if t.status else None} for t in records]}, 'message': 'Danh sách ticket theo CIF'}), 200
    except Exception as e:
        return jsonify({'success': False, 'data': None, 'message': f'Lỗi server: {str(e)}'}), 500


