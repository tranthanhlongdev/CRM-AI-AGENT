from datetime import datetime
from flask import Blueprint, request, jsonify

from models.customer import db
from models.user import User
from realtime_state import AGENTS, set_agent_status, pick_available_agent


realtime_bp = Blueprint('realtime', __name__)

# Example schema:
# AGENTS["agent_username"] = {
#   "status": "available|on_call|busy|offline",
#   "lastUpdate": iso_string,
#   "currentCallId": "string|null"
# }


def _now_iso():
    # Backward compatibility if imported directly
    from datetime import datetime as _dt
    return _dt.utcnow().isoformat() + 'Z'


@realtime_bp.route('/callcenter/agents/status', methods=['POST'])
def set_agent_status():
    """
    Set agent presence status
    Body: { "username": string, "status": "available|busy|on_call|offline" }
    """
    try:
        data = request.get_json() or {}
        username = (data.get('username') or '').strip()
        status = (data.get('status') or '').strip()
        if not username or status not in ['available','busy','on_call','offline']:
            return jsonify({'success': False, 'message': 'Thiếu username hoặc status không hợp lệ'}), 400

        AGENTS.setdefault(username, {})
        AGENTS[username].update({'status': status, 'lastUpdate': _now_iso()})
        return jsonify({'success': True, 'data': {'agent': {**AGENTS[username], 'username': username}}, 'message': 'Cập nhật trạng thái thành công'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@realtime_bp.route('/callcenter/agents', methods=['GET'])
def list_agents():
    try:
        agents = []
        for uname, info in AGENTS.items():
            agents.append({'username': uname, **info})
        return jsonify({'success': True, 'data': {'agents': agents}, 'message': 'Danh sách agent'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@realtime_bp.route('/callcenter/calls/start', methods=['POST'])
def start_call():
    """
    Begin a call session (signaling init)
    Body: { "callId": string, "from": username, "to": username|phone, "direction": "outbound|inbound" }
    """
    try:
        data = request.get_json() or {}
        call_id = (data.get('callId') or '').strip()
        caller = (data.get('from') or '').strip()
        callee = (data.get('to') or '').strip()
        direction = (data.get('direction') or 'outbound').strip()
        if not call_id or not caller or not callee or direction not in ['outbound','inbound']:
            return jsonify({'success': False, 'message': 'Thiếu callId/from/to hoặc direction không hợp lệ'}), 400

        # Update agent state
        AGENTS.setdefault(caller, {})
        AGENTS[caller].update({'status': 'on_call', 'currentCallId': call_id, 'lastUpdate': _now_iso()})
        return jsonify({'success': True, 'data': {'call': {'callId': call_id, 'from': caller, 'to': callee, 'direction': direction}}, 'message': 'Bắt đầu cuộc gọi'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@realtime_bp.route('/callcenter/calls/end', methods=['POST'])
def end_call():
    """
    End a call session
    Body: { "callId": string, "username": string }
    """
    try:
        data = request.get_json() or {}
        call_id = (data.get('callId') or '').strip()
        username = (data.get('username') or '').strip()
        if not call_id or not username:
            return jsonify({'success': False, 'message': 'Thiếu callId hoặc username'}), 400
        if username in AGENTS and AGENTS[username].get('currentCallId') == call_id:
            AGENTS[username]['status'] = 'available'
            AGENTS[username]['currentCallId'] = None
            AGENTS[username]['lastUpdate'] = _now_iso()
        return jsonify({'success': True, 'message': 'Kết thúc cuộc gọi'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@realtime_bp.route('/callcenter/calls/transfer', methods=['POST'])
def transfer_call():
    """
    Transfer an active call to another agent
    Body: { "callId": string, "from": username, "to": username }
    """
    try:
        data = request.get_json() or {}
        call_id = (data.get('callId') or '').strip()
        from_user = (data.get('from') or '').strip()
        to_user = (data.get('to') or '').strip()
        if not call_id or not from_user or not to_user:
            return jsonify({'success': False, 'message': 'Thiếu callId/from/to'}), 400
        if from_user in AGENTS and AGENTS[from_user].get('currentCallId') == call_id:
            AGENTS[from_user]['status'] = 'available'
            AGENTS[from_user]['currentCallId'] = None
            AGENTS[from_user]['lastUpdate'] = _now_iso()
        AGENTS.setdefault(to_user, {})
        AGENTS[to_user].update({'status': 'on_call', 'currentCallId': call_id, 'lastUpdate': _now_iso()})
        return jsonify({'success': True, 'message': 'Chuyển cuộc gọi thành công'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


@realtime_bp.route('/callcenter/incoming', methods=['POST'])
def incoming_call():
    """
    API khách hàng gọi vào tổng đài.
    Body: { "callerNumber": string, "cifNumber": string|null }
    - Hệ thống tự chọn agent đang available đầu tiên.
    - Gán trạng thái agent đó thành on_call và tạo callId.
    Trả về: call info + agent nhận cuộc gọi, để popup thông báo.
    """
    try:
        data = request.get_json() or {}
        caller_number = (data.get('callerNumber') or '').strip()
        cif_number = (data.get('cifNumber') or '').strip() or None
        if not caller_number:
            return jsonify({'success': False, 'message': 'Thiếu callerNumber'}), 400

        agent = pick_available_agent()
        if not agent:
            return jsonify({'success': False, 'message': 'Hiện không có agent nào sẵn sàng'}), 200

        call_id = f"INC-{int(datetime.utcnow().timestamp())}"
        AGENTS.setdefault(agent, {})
        AGENTS[agent].update({'status': 'on_call', 'currentCallId': call_id, 'lastUpdate': _now_iso()})

        # Response cho UI agent popup nhận cuộc gọi
        return jsonify({
            'success': True,
            'data': {
                'call': {
                    'callId': call_id,
                    'direction': 'inbound',
                    'from': caller_number,
                    'to': agent,
                    'cifNumber': cif_number
                },
                'agent': {
                    'username': agent,
                    **AGENTS[agent]
                }
            },
            'message': 'Cuộc gọi đến - đã phân bổ cho agent'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


