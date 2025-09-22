from flask import Blueprint, request, jsonify
from services.call_service_simple import CallServiceSimple
from services.call_service import CallService
from models.call import Agent, AgentStatus
from models.user import User
from models.customer import db

call_simple_bp = Blueprint('call_simple', __name__)

@call_simple_bp.route('/call/demo/status', methods=['GET'])
def get_demo_status():
    """API demo lấy trạng thái call center"""
    try:
        data = CallServiceSimple.get_dashboard_data()
        
        return jsonify({
            'success': True,
            'data': data,
            'message': 'Lấy trạng thái demo thành công'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }), 500

@call_simple_bp.route('/call/demo/initiate', methods=['POST'])
def initiate_demo_call():
    """API demo khởi tạo cuộc gọi"""
    try:
        data = request.get_json() or {}
        caller_number = data.get('callerNumber', '')
        called_number = data.get('calledNumber', '1900')
        
        if not caller_number:
            return jsonify({
                'success': False,
                'message': 'Thiếu số điện thoại'
            }), 400
        
        # Khởi tạo cuộc gọi
        call_result = CallServiceSimple.initiate_call_simple(caller_number, called_number)
        
        # Giả lập phân phối agent
        agent_result = CallServiceSimple.simulate_agent_assignment()
        
        # Combine results
        result = {**call_result, **agent_result}
        
        return jsonify({
            'success': True,
            'data': result,
            'message': 'Cuộc gọi demo đã được khởi tạo'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khởi tạo cuộc gọi: {str(e)}'
        }), 500

@call_simple_bp.route('/call/demo/agents', methods=['GET'])
def get_demo_agents():
    """API demo lấy danh sách agents"""
    try:
        data = CallServiceSimple.get_dashboard_data()
        agents = data['agentsStatus']
        
        return jsonify({
            'success': True,
            'data': {
                'agents': agents,
                'total': len(agents),
                'available': len([a for a in agents if a['status'] == 'available']),
                'busy': len([a for a in agents if a['status'] in ['on_call', 'busy']])
            },
            'message': f'Lấy danh sách {len(agents)} agents thành công'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy agents: {str(e)}'
        }), 500

@call_simple_bp.route('/call/demo/test-websocket', methods=['GET'])
def test_websocket_info():
    """API trả về thông tin để test WebSocket"""
    return jsonify({
        'success': True,
        'data': {
            'websocketUrl': 'http://localhost:8000',
            'events': {
                'connect': 'Kết nối WebSocket',
                'make_call': 'Tạo cuộc gọi',
                'agent_login': 'Agent đăng nhập',
                'join_call_center': 'Join room call center'
            },
            'samplePayloads': {
                'make_call': {
                    'callerNumber': '0912345678',
                    'calledNumber': '1900'
                },
                'agent_login': {
                    'userId': 1,
                    'username': 'agent01'
                }
            }
        },
        'message': 'Thông tin WebSocket test'
    })

# ===== AGENT STATUS APIS =====

@call_simple_bp.route('/agents/status', methods=['GET'])
def get_agents_status():
    """API lấy trạng thái tất cả agents"""
    try:
        agents_data = CallService.get_agents_status()
        
        # Tính toán statistics
        total = len(agents_data)
        available = len([a for a in agents_data if a.get('status') == 'available'])
        busy = len([a for a in agents_data if a.get('status') in ['on_call', 'busy']])
        away = len([a for a in agents_data if a.get('status') == 'away'])
        offline = len([a for a in agents_data if a.get('status') == 'offline'])
        
        return jsonify({
            'success': True,
            'data': {
                'agents': agents_data,
                'stats': {
                    'total': total,
                    'available': available,
                    'busy': busy,
                    'away': away,
                    'offline': offline
                }
            },
            'message': f'Lấy trạng thái {total} agents thành công'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy trạng thái agents: {str(e)}'
        }), 500

@call_simple_bp.route('/agents/<int:agent_id>/status', methods=['GET'])
def get_agent_status(agent_id):
    """API lấy trạng thái một agent cụ thể"""
    try:
        agent = Agent.query.get(agent_id)
        
        if not agent:
            return jsonify({
                'success': False,
                'message': 'Agent không tồn tại'
            }), 404
        
        return jsonify({
            'success': True,
            'data': agent.to_dict(),
            'message': f'Lấy trạng thái agent {agent_id} thành công'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy trạng thái agent: {str(e)}'
        }), 500

@call_simple_bp.route('/agents/user/<int:user_id>/status', methods=['GET'])
def get_agent_status_by_user(user_id):
    """API lấy trạng thái agent theo user ID"""
    try:
        agent = Agent.query.filter_by(user_id=user_id).first()
        
        if not agent:
            return jsonify({
                'success': False,
                'message': 'Agent không tồn tại cho user này'
            }), 404
        
        return jsonify({
            'success': True,
            'data': agent.to_dict(),
            'message': f'Lấy trạng thái agent cho user {user_id} thành công'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy trạng thái agent: {str(e)}'
        }), 500

@call_simple_bp.route('/agents/<int:agent_id>/status', methods=['PUT'])
def update_agent_status(agent_id):
    """API cập nhật trạng thái agent"""
    try:
        data = request.get_json() or {}
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({
                'success': False,
                'message': 'Thiếu trạng thái mới'
            }), 400
        
        # Validate status
        valid_statuses = ['available', 'busy', 'on_call', 'away', 'offline']
        if new_status not in valid_statuses:
            return jsonify({
                'success': False,
                'message': f'Trạng thái không hợp lệ. Chỉ chấp nhận: {", ".join(valid_statuses)}'
            }), 400
        
        agent = Agent.query.get(agent_id)
        if not agent:
            return jsonify({
                'success': False,
                'message': 'Agent không tồn tại'
            }), 404
        
        # Cập nhật trạng thái
        result = CallService.set_agent_status(agent.user_id, new_status)
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': result['agent'],
                'message': f'Cập nhật trạng thái agent thành công'
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi cập nhật trạng thái agent: {str(e)}'
        }), 500

@call_simple_bp.route('/agents/available', methods=['GET'])
def get_available_agents():
    """API lấy danh sách agents đang available"""
    try:
        agents_data = CallService.get_agents_status()
        available_agents = [a for a in agents_data if a.get('status') == 'available']
        
        return jsonify({
            'success': True,
            'data': {
                'agents': available_agents,
                'count': len(available_agents)
            },
            'message': f'Có {len(available_agents)} agents đang sẵn sàng'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy agents available: {str(e)}'
        }), 500

@call_simple_bp.route('/agents/create', methods=['POST'])
def create_agent():
    """API tạo agent profile cho user"""
    try:
        data = request.get_json() or {}
        user_id = data.get('userId')
        status = data.get('status', 'offline')
        priority = data.get('priority', 1)
        
        if not user_id:
            return jsonify({
                'success': False,
                'message': 'Thiếu userId'
            }), 400
        
        # Kiểm tra user tồn tại
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User không tồn tại'
            }), 404
        
        # Kiểm tra agent đã tồn tại chưa
        existing_agent = Agent.query.filter_by(user_id=user_id).first()
        if existing_agent:
            return jsonify({
                'success': False,
                'message': 'Agent đã tồn tại cho user này'
            }), 409
        
        # Tạo agent mới
        try:
            status_enum = AgentStatus(status)
        except ValueError:
            return jsonify({
                'success': False,
                'message': f'Trạng thái không hợp lệ: {status}'
            }), 400
        
        new_agent = Agent(
            user_id=user_id,
            status=status_enum,
            priority=priority,
            total_calls=0,
            total_talk_time=0,
            avg_handle_time=0.0
        )
        
        db.session.add(new_agent)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': new_agent.to_dict(),
            'message': 'Agent đã được tạo thành công'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Lỗi tạo agent: {str(e)}'
        }), 500
