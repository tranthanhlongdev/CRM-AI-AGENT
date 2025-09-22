from flask import Blueprint, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms
from services.call_service import CallService
from models.call import db, Call, Agent, CallStatus, AgentStatus
from models.user import User
from datetime import datetime
import json

call_center_bp = Blueprint('call_center', __name__)

# Khởi tạo SocketIO
socketio = None  # Sẽ được khởi tạo trong app factory

def init_socketio(app):
    """Khởi tạo SocketIO với app"""
    global socketio
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
    
    # Register socket events
    register_socket_events()
    
    # Register WebRTC events
    from routes.webrtc import register_webrtc_events
    register_webrtc_events()
    
    return socketio

def register_socket_events():
    """Đăng ký các socket events"""
    
    @socketio.on('connect')
    def handle_connect():
        print(f'Client connected: {request.sid}')
        emit('connected', {'message': 'Connected to call center server'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        print(f'Client disconnected: {request.sid}')
        # Cập nhật agent status nếu cần
        # TODO: Handle agent going offline
    
    @socketio.on('agent_login')
    def handle_agent_login(data):
        """Agent đăng nhập vào hệ thống"""
        try:
            user_id = data.get('userId')
            username = data.get('username')
            
            if not user_id:
                emit('error', {'message': 'Missing userId'})
                return
            
            # Join room cho agent
            join_room(f'agent_{user_id}')
            
            # Cập nhật trạng thái available
            result = CallService.set_agent_status(user_id, 'available')
            
            if result['success']:
                # Broadcast agent status update
                socketio.emit('agent_status_update', {
                    'agent': result['agent'],
                    'status': 'available'
                }, room='call_center')
                
                emit('agent_login_success', {
                    'agent': result['agent'],
                    'message': 'Đăng nhập thành công'
                })
                
                print(f'Agent {username} logged in successfully')
            else:
                emit('error', {'message': result['message']})
                
        except Exception as e:
            emit('error', {'message': f'Lỗi agent login: {str(e)}'})
    
    @socketio.on('agent_logout')
    def handle_agent_logout(data):
        """Agent đăng xuất"""
        try:
            user_id = data.get('userId')
            
            # Leave agent room
            leave_room(f'agent_{user_id}')
            
            # Cập nhật trạng thái offline
            result = CallService.set_agent_status(user_id, 'offline')
            
            if result['success']:
                socketio.emit('agent_status_update', {
                    'agent': result['agent'],
                    'status': 'offline'
                }, room='call_center')
                
                emit('agent_logout_success', {'message': 'Đăng xuất thành công'})
                
        except Exception as e:
            emit('error', {'message': f'Lỗi agent logout: {str(e)}'})
    
    @socketio.on('change_agent_status')
    def handle_change_agent_status(data):
        """Thay đổi trạng thái agent"""
        try:
            user_id = data.get('userId')
            status = data.get('status')
            
            result = CallService.set_agent_status(user_id, status)
            
            if result['success']:
                socketio.emit('agent_status_update', {
                    'agent': result['agent'],
                    'status': status
                }, room='call_center')
                
                emit('status_change_success', {
                    'agent': result['agent'],
                    'message': f'Trạng thái đã thay đổi: {status}'
                })
            else:
                emit('error', {'message': result['message']})
                
        except Exception as e:
            emit('error', {'message': f'Lỗi change status: {str(e)}'})
    
    @socketio.on('make_call')
    def handle_make_call(data):
        """Khởi tạo cuộc gọi từ softphone"""
        try:
            caller_number = data.get('callerNumber')
            called_number = data.get('calledNumber', '1900')
            
            if not caller_number:
                emit('error', {'message': 'Missing caller number'})
                return
            
            # Khởi tạo cuộc gọi
            result = CallService.initiate_call(caller_number, called_number)
            
            if result['success']:
                call_data = {
                    'callId': result['callId'],
                    'callerNumber': caller_number,
                    'calledNumber': called_number,
                    'status': result['status'],
                    'customer': result.get('customer'),
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                if result['status'] == 'ringing':
                    # Thông báo cho agent được assign
                    agent = result['assignedAgent']
                    socketio.emit('incoming_call', call_data, room=f'agent_{agent["userId"]}')
                    
                    # Thông báo cho CRM systems
                    socketio.emit('incoming_call_to_crm', {
                        'callId': result['callId'],
                        'callerNumber': caller_number,
                        'calledNumber': called_number,
                        'assignedAgent': agent,
                        'customerInfo': result.get('customer'),
                        'startTime': datetime.utcnow().isoformat(),
                        'status': 'ringing',
                        'source': 'softphone'
                    }, room='crm_systems')
                    
                    # Thông báo cho caller
                    emit('call_initiated', {
                        'callId': result['callId'],
                        'status': 'ringing',
                        'assignedAgent': agent,
                        'message': result['message']
                    })
                    
                elif result['status'] == 'queued':
                    # Thông báo caller về queue
                    emit('call_queued', {
                        'callId': result['callId'],
                        'queuePosition': result['queuePosition'],
                        'estimatedWaitTime': result['estimatedWaitTime'],
                        'message': result['message']
                    })
                
                # Broadcast call update
                socketio.emit('call_update', call_data, room='call_center')
                
            else:
                emit('error', {'message': result['message']})
                
        except Exception as e:
            emit('error', {'message': f'Lỗi make call: {str(e)}'})
    
    @socketio.on('answer_call')
    def handle_answer_call(data):
        """Agent nhấc máy"""
        try:
            call_id = data.get('callId')
            agent_id = data.get('agentId')
            
            result = CallService.answer_call(call_id, agent_id)
            
            if result['success']:
                call_data = result['call']
                
                # Thông báo cho agent
                emit('call_answered', {
                    'call': call_data,
                    'message': 'Cuộc gọi đã được kết nối'
                })
                
                # Thông báo cho caller (softphone)
                socketio.emit('call_connected', {
                    'callId': call_id,
                    'status': 'connected',
                    'agent': call_data['agentInfo'],
                    'webrtcRoom': f'call_{call_id}',
                    'message': 'Cuộc gọi đã được kết nối'
                }, room=f'call_{call_id}')
                
                # Broadcast update
                socketio.emit('call_update', call_data, room='call_center')
                
            else:
                emit('error', {'message': result['message']})
                
        except Exception as e:
            emit('error', {'message': f'Lỗi answer call: {str(e)}'})
    
    @socketio.on('end_call')
    def handle_end_call(data):
        """Kết thúc cuộc gọi"""
        try:
            call_id = data.get('callId')
            ended_by = data.get('endedBy', 'unknown')  # 'agent' hoặc 'caller'
            
            result = CallService.end_call(call_id)
            
            if result['success']:
                call_data = result['call']
                
                # Thông báo kết thúc cuộc gọi
                socketio.emit('call_ended', {
                    'callId': call_id,
                    'call': call_data,
                    'endedBy': ended_by,
                    'message': 'Cuộc gọi đã kết thúc'
                }, room='call_center')
                
                # Thông báo riêng cho agent room
                socketio.emit('call_ended', {
                    'callId': call_id,
                    'endedBy': ended_by
                }, room=f'agent_{call_data["agentId"]}')
                
                emit('call_end_success', {
                    'call': call_data,
                    'message': result['message']
                })
                
            else:
                emit('error', {'message': result['message']})
                
        except Exception as e:
            emit('error', {'message': f'Lỗi end call: {str(e)}'})
    
    @socketio.on('join_call_center')
    def handle_join_call_center(data=None):
        """Join vào room chung để nhận updates"""
        join_room('call_center')
        
        # Check if it's CRM system
        if data and data.get('userType') == 'crm_system':
            join_room('crm_systems')
            print(f"CRM system joined: {data.get('userId')}")
            emit('joined_call_center', {
                'message': 'Joined call center as CRM system',
                'userType': 'crm_system'
            })
        else:
            emit('joined_call_center', {'message': 'Joined call center room'})
    
    @socketio.on('leave_call_center')
    def handle_leave_call_center():
        """Leave room chung"""
        leave_room('call_center')
        emit('left_call_center', {'message': 'Left call center room'})
    
    @socketio.on('get_dashboard_data')
    def handle_get_dashboard_data():
        """Lấy dữ liệu dashboard"""
        try:
            dashboard_data = {
                'activeCalls': CallService.get_active_calls(),
                'queueStatus': CallService.get_queue_status(),
                'agentsStatus': CallService.get_agents_status(),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            emit('dashboard_data', dashboard_data)
            
        except Exception as e:
            emit('error', {'message': f'Lỗi get dashboard: {str(e)}'})


# REST API endpoints
@call_center_bp.route('/call-center/status', methods=['GET'])
def get_call_center_status():
    """API để lấy tổng quan hệ thống"""
    try:
        dashboard_data = {
            'activeCalls': CallService.get_active_calls(),
            'queueStatus': CallService.get_queue_status(),
            'agentsStatus': CallService.get_agents_status(),
            'stats': {
                'totalActiveCalls': len(CallService.get_active_calls()),
                'totalQueue': len(CallService.get_queue_status()),
                'availableAgents': len([a for a in CallService.get_agents_status() if a['status'] == 'available']),
                'busyAgents': len([a for a in CallService.get_agents_status() if a['status'] in ['busy', 'on_call']])
            }
        }
        
        return jsonify({
            'success': True,
            'data': dashboard_data,
            'message': 'Lấy trạng thái call center thành công'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy status: {str(e)}'
        }), 500

@call_center_bp.route('/call-center/agents', methods=['GET'])
def get_agents():
    """API lấy danh sách agents"""
    try:
        agents = CallService.get_agents_status()
        
        return jsonify({
            'success': True,
            'data': agents,
            'message': f'Lấy danh sách {len(agents)} agents thành công'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy agents: {str(e)}'
        }), 500

@call_center_bp.route('/call-center/calls/history', methods=['GET'])
def get_call_history():
    """API lấy lịch sử cuộc gọi"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        calls = Call.query.order_by(Call.created_at.desc())\
                         .paginate(page=page, per_page=limit, error_out=False)
        
        return jsonify({
            'success': True,
            'data': {
                'calls': [call.to_dict() for call in calls.items],
                'pagination': {
                    'currentPage': page,
                    'totalPages': calls.pages,
                    'totalRecords': calls.total,
                    'limit': limit
                }
            },
            'message': 'Lấy lịch sử cuộc gọi thành công'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy call history: {str(e)}'
        }), 500
