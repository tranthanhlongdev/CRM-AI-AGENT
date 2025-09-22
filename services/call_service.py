import uuid
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from models.customer import db, Customer
from models.user import User

# Import models sau khi db đã được khởi tạo
def get_call_models():
    from models.call import Call, Agent, CallQueue, CallStatus, AgentStatus
    return Call, Agent, CallQueue, CallStatus, AgentStatus


class CallService:
    """Service để quản lý cuộc gọi và routing"""
    
    @staticmethod
    def initiate_call(caller_number: str, called_number: str = "1900") -> Dict[str, Any]:
        """Khởi tạo cuộc gọi mới"""
        try:
            Call, Agent, CallQueue, CallStatus, AgentStatus = get_call_models()
            
            # Tạo call ID unique
            call_id = f"CALL_{uuid.uuid4().hex[:8].upper()}"
            
            # Tìm customer theo số điện thoại
            customer = Customer.query.filter_by(so_dien_thoai=caller_number).first()
            
            # Tạo cuộc gọi mới
            new_call = Call(
                call_id=call_id,
                caller_number=caller_number,
                called_number=called_number,
                customer_id=customer.id if customer else None,
                status=CallStatus.INCOMING
            )
            
            db.session.add(new_call)
            db.session.commit()
            
            # Tìm agent available
            available_agent = CallService.find_available_agent()
            
            if available_agent:
                # Assign trực tiếp nếu có agent sẵn sàng
                result = CallService.assign_call_to_agent(call_id, available_agent.id)
                return {
                    'success': True,
                    'callId': call_id,
                    'status': 'ringing',
                    'assignedAgent': available_agent.to_dict(),
                    'customer': customer.to_dict() if customer else None,
                    'message': f'Cuộc gọi được chuyển tới agent {available_agent.user.full_name}'
                }
            else:
                # Đưa vào queue nếu không có agent
                queue_result = CallService.add_to_queue(call_id, caller_number)
                return {
                    'success': True,
                    'callId': call_id,
                    'status': 'queued',
                    'queuePosition': queue_result['position'],
                    'estimatedWaitTime': queue_result['estimatedWaitTime'],
                    'customer': customer.to_dict() if customer else None,
                    'message': f'Cuộc gọi đang chờ trong hàng đợi. Vị trí: {queue_result["position"]}'
                }
                
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'message': f'Lỗi khởi tạo cuộc gọi: {str(e)}'
            }
    
    @staticmethod
    def find_available_agent():
        """Tìm agent available với priority cao nhất"""
        Call, Agent, CallQueue, CallStatus, AgentStatus = get_call_models()
        return Agent.query.filter_by(status=AgentStatus.AVAILABLE)\
                         .order_by(Agent.priority.desc(), Agent.last_activity.asc())\
                         .first()
    
    @staticmethod
    def assign_call_to_agent(call_id: str, agent_id: int) -> Dict[str, Any]:
        """Assign cuộc gọi cho agent"""
        try:
            Call, Agent, CallQueue, CallStatus, AgentStatus = get_call_models()
            call = Call.query.filter_by(call_id=call_id).first()
            agent = Agent.query.get(agent_id)
            
            if not call or not agent:
                return {'success': False, 'message': 'Call hoặc Agent không tồn tại'}
            
            if agent.status != AgentStatus.AVAILABLE:
                return {'success': False, 'message': 'Agent không available'}
            
            # Update call
            call.agent_id = agent.user_id
            call.status = CallStatus.RINGING
            
            # Update agent status
            agent.status = AgentStatus.ON_CALL
            agent.current_call_id = call_id
            agent.last_activity = datetime.utcnow()
            
            db.session.commit()
            
            return {
                'success': True,
                'call': call.to_dict(),
                'agent': agent.to_dict(),
                'message': f'Cuộc gọi đã được chuyển tới {agent.user.full_name}'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Lỗi assign call: {str(e)}'}
    
    @staticmethod
    def answer_call(call_id: str, agent_id: int) -> Dict[str, Any]:
        """Agent nhấc máy"""
        try:
            call = Call.query.filter_by(call_id=call_id).first()
            agent = Agent.query.get(agent_id)
            
            if not call or not agent:
                return {'success': False, 'message': 'Call hoặc Agent không tồn tại'}
            
            # Update call status
            call.status = CallStatus.CONNECTED
            call.answer_time = datetime.utcnow()
            
            if call.start_time:
                call.queue_time = int((call.answer_time - call.start_time).total_seconds())
            
            # Update agent
            agent.status = AgentStatus.ON_CALL
            agent.current_call_id = call_id
            
            db.session.commit()
            
            return {
                'success': True,
                'call': call.to_dict(),
                'message': 'Cuộc gọi đã được kết nối'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Lỗi answer call: {str(e)}'}
    
    @staticmethod
    def end_call(call_id: str) -> Dict[str, Any]:
        """Kết thúc cuộc gọi"""
        try:
            call = Call.query.filter_by(call_id=call_id).first()
            
            if not call:
                return {'success': False, 'message': 'Call không tồn tại'}
            
            # Update call
            call.status = CallStatus.ENDED
            call.end_time = datetime.utcnow()
            
            if call.answer_time:
                call.talk_duration = int((call.end_time - call.answer_time).total_seconds())
            
            # Free up agent
            if call.agent_id:
                agent = Agent.query.filter_by(user_id=call.agent_id).first()
                if agent:
                    agent.status = AgentStatus.AVAILABLE
                    agent.current_call_id = None
                    agent.total_calls += 1
                    agent.total_talk_time += call.talk_duration
                    
                    # Cập nhật avg handle time
                    if agent.total_calls > 0:
                        agent.avg_handle_time = agent.total_talk_time / agent.total_calls
            
            db.session.commit()
            
            # Kiểm tra queue và assign call tiếp theo
            CallService.process_queue()
            
            return {
                'success': True,
                'call': call.to_dict(),
                'message': 'Cuộc gọi đã kết thúc'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Lỗi end call: {str(e)}'}
    
    @staticmethod
    def add_to_queue(call_id: str, caller_number: str, priority: int = 1) -> Dict[str, Any]:
        """Thêm cuộc gọi vào queue"""
        try:
            # Tính position trong queue
            queue_count = CallQueue.query.count()
            position = queue_count + 1
            
            # Ước tính thời gian chờ (giả sử mỗi cuộc gọi trung bình 5 phút)
            estimated_wait = position * 300  # 5 phút = 300 giây
            
            queue_item = CallQueue(
                call_id=call_id,
                caller_number=caller_number,
                queue_position=position,
                priority=priority,
                estimated_wait_time=estimated_wait
            )
            
            db.session.add(queue_item)
            db.session.commit()
            
            return {
                'success': True,
                'position': position,
                'estimatedWaitTime': estimated_wait
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Lỗi add to queue: {str(e)}'}
    
    @staticmethod
    def process_queue():
        """Xử lý queue - assign calls cho agents available"""
        try:
            # Lấy cuộc gọi đầu tiên trong queue
            queue_item = CallQueue.query.order_by(
                CallQueue.priority.desc(), 
                CallQueue.queued_at.asc()
            ).first()
            
            if not queue_item:
                return
            
            # Tìm agent available
            available_agent = CallService.find_available_agent()
            
            if available_agent:
                # Assign call
                result = CallService.assign_call_to_agent(queue_item.call_id, available_agent.id)
                
                if result['success']:
                    # Remove từ queue
                    db.session.delete(queue_item)
                    
                    # Update positions cho các cuộc gọi khác
                    remaining_calls = CallQueue.query.filter(
                        CallQueue.queue_position > queue_item.queue_position
                    ).all()
                    
                    for call in remaining_calls:
                        call.queue_position -= 1
                        call.estimated_wait_time = max(0, call.estimated_wait_time - 300)
                    
                    db.session.commit()
                    
                    return result
            
        except Exception as e:
            db.session.rollback()
            print(f"Lỗi process queue: {str(e)}")
    
    @staticmethod
    def get_queue_status() -> List[Dict[str, Any]]:
        """Lấy trạng thái queue"""
        try:
            Call, Agent, CallQueue, CallStatus, AgentStatus = get_call_models()
            queue_items = CallQueue.query.order_by(CallQueue.queue_position.asc()).all()
            return [item.to_dict() for item in queue_items]
        except Exception as e:
            print(f"Lỗi get queue status: {str(e)}")
            return []
    
    @staticmethod
    def get_active_calls() -> List[Dict[str, Any]]:
        """Lấy danh sách cuộc gọi đang active"""
        try:
            Call, Agent, CallQueue, CallStatus, AgentStatus = get_call_models()
            active_calls = Call.query.filter(
                Call.status.in_([CallStatus.INCOMING, CallStatus.RINGING, CallStatus.CONNECTED, CallStatus.ON_HOLD])
            ).all()
            return [call.to_dict() for call in active_calls]
        except Exception as e:
            print(f"Lỗi get active calls: {str(e)}")
            return []
    
    @staticmethod
    def set_agent_status(user_id: int, status: str) -> Dict[str, Any]:
        """Cập nhật trạng thái agent"""
        try:
            Call, Agent, CallQueue, CallStatus, AgentStatus = get_call_models()
            agent = Agent.query.filter_by(user_id=user_id).first()
            
            if not agent:
                # Tạo agent profile mới nếu chưa có
                user = User.query.get(user_id)
                if not user:
                    return {'success': False, 'message': 'User không tồn tại'}
                
                agent = Agent(
                    user_id=user_id,
                    status=AgentStatus(status)
                )
                db.session.add(agent)
            else:
                agent.status = AgentStatus(status)
                agent.last_activity = datetime.utcnow()
            
            db.session.commit()
            
            # Nếu agent chuyển sang available, xử lý queue
            if status == 'available':
                CallService.process_queue()
            
            return {
                'success': True,
                'agent': agent.to_dict(),
                'message': f'Trạng thái agent đã được cập nhật: {status}'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Lỗi set agent status: {str(e)}'}
    
    @staticmethod
    def get_agents_status() -> List[Dict[str, Any]]:
        """Lấy trạng thái tất cả agents"""
        try:
            Call, Agent, CallQueue, CallStatus, AgentStatus = get_call_models()
            agents = Agent.query.join(User).all()
            return [agent.to_dict() for agent in agents]
        except Exception as e:
            print(f"Lỗi get agents status: {str(e)}")
            return []
    
    @staticmethod
    def answer_call(call_id: str, agent_id: int) -> Dict[str, Any]:
        """Agent nhấc máy"""
        try:
            Call, Agent, CallQueue, CallStatus, AgentStatus = get_call_models()
            
            call = Call.query.filter_by(call_id=call_id).first()
            if not call:
                return {'success': False, 'message': 'Cuộc gọi không tồn tại'}
            
            agent = Agent.query.get(agent_id)
            if not agent:
                return {'success': False, 'message': 'Agent không tồn tại'}
            
            # Cập nhật call status
            call.status = CallStatus.CONNECTED
            call.agent_id = agent_id
            call.answer_time = datetime.utcnow()
            
            # Cập nhật agent status
            agent.status = AgentStatus.ON_CALL
            agent.current_call_id = call_id
            
            # Remove từ queue nếu có
            queue_entry = CallQueue.query.filter_by(call_id=call_id).first()
            if queue_entry:
                db.session.delete(queue_entry)
            
            db.session.commit()
            
            return {
                'success': True,
                'call': call.to_dict(),
                'message': 'Cuộc gọi đã được kết nối'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Lỗi answer call: {str(e)}'}
    
    @staticmethod
    def end_call(call_id: str) -> Dict[str, Any]:
        """Kết thúc cuộc gọi"""
        try:
            Call, Agent, CallQueue, CallStatus, AgentStatus = get_call_models()
            
            call = Call.query.filter_by(call_id=call_id).first()
            if not call:
                return {'success': False, 'message': 'Cuộc gọi không tồn tại'}
            
            # Cập nhật call
            call.status = CallStatus.ENDED
            call.end_time = datetime.utcnow()
            if call.answer_time:
                call.talk_duration = int((call.end_time - call.answer_time).total_seconds())
            
            # Cập nhật agent nếu có
            if call.agent_id:
                agent = Agent.query.get(call.agent_id)
                if agent:
                    agent.status = AgentStatus.AVAILABLE
                    agent.current_call_id = None
                    agent.total_calls_handled += 1
                    agent.total_talk_time += call.talk_duration
                    if agent.total_calls_handled > 0:
                        agent.avg_handle_time = agent.total_talk_time // agent.total_calls_handled
            
            db.session.commit()
            
            # Process queue sau khi kết thúc call
            CallService.process_queue()
            
            return {
                'success': True,
                'call': call.to_dict(),
                'message': 'Cuộc gọi đã kết thúc'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'Lỗi end call: {str(e)}'}
