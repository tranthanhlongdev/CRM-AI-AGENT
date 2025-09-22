import uuid
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any


class CallServiceSimple:
    """Service đơn giản để quản lý cuộc gọi"""
    
    @staticmethod
    def create_call_id() -> str:
        """Tạo call ID unique"""
        return f"CALL_{uuid.uuid4().hex[:8].upper()}"
    
    @staticmethod
    def initiate_call_simple(caller_number: str, called_number: str = "1900") -> Dict[str, Any]:
        """Khởi tạo cuộc gọi đơn giản"""
        call_id = CallServiceSimple.create_call_id()
        
        return {
            'success': True,
            'callId': call_id,
            'callerNumber': caller_number,
            'calledNumber': called_number,
            'status': 'initiated',
            'timestamp': datetime.utcnow().isoformat(),
            'message': 'Cuộc gọi đã được khởi tạo'
        }
    
    @staticmethod
    def simulate_agent_assignment() -> Dict[str, Any]:
        """Giả lập phân phối agent"""
        import random
        
        # Giả lập có agent available
        if random.choice([True, False]):
            return {
                'success': True,
                'status': 'ringing',
                'assignedAgent': {
                    'id': 1,
                    'username': 'agent01',
                    'fullName': 'Agent Demo',
                    'status': 'available'
                },
                'message': 'Cuộc gọi được chuyển tới agent'
            }
        else:
            return {
                'success': True,
                'status': 'queued',
                'queuePosition': random.randint(1, 5),
                'estimatedWaitTime': random.randint(60, 300),
                'message': 'Cuộc gọi đang chờ trong hàng đợi'
            }
    
    @staticmethod
    def get_dashboard_data() -> Dict[str, Any]:
        """Lấy dữ liệu dashboard giả lập"""
        return {
            'activeCalls': [
                {
                    'callId': 'CALL_12345678',
                    'callerNumber': '0912345678',
                    'status': 'connected',
                    'agentName': 'Agent Demo',
                    'duration': 120
                }
            ],
            'queueStatus': [
                {
                    'callId': 'CALL_87654321',
                    'callerNumber': '0987654321',
                    'queuePosition': 1,
                    'waitTime': 45
                }
            ],
            'agentsStatus': [
                {
                    'id': 1,
                    'username': 'agent01',
                    'fullName': 'Agent Demo',
                    'status': 'available',
                    'currentCallId': None
                },
                {
                    'id': 2,
                    'username': 'agent02', 
                    'fullName': 'Agent 2',
                    'status': 'on_call',
                    'currentCallId': 'CALL_12345678'
                }
            ],
            'stats': {
                'totalActiveCalls': 1,
                'totalQueue': 1,
                'availableAgents': 1,
                'busyAgents': 1
            }
        }
