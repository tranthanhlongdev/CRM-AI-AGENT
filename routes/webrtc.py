from flask import Blueprint, request, jsonify
from flask_socketio import emit, join_room, leave_room
from routes.call_center import socketio
import json

webrtc_bp = Blueprint('webrtc', __name__)

# WebRTC signaling events
def register_webrtc_events():
    """Đăng ký WebRTC signaling events"""
    
    @socketio.on('webrtc_offer')
    def handle_webrtc_offer(data):
        """Xử lý WebRTC offer từ caller"""
        try:
            call_id = data.get('callId')
            offer = data.get('offer')
            from_peer = data.get('fromPeer')  # 'customer' hoặc 'agent'
            
            if not call_id or not offer:
                emit('webrtc_error', {'message': 'Missing callId or offer'})
                return
            
            print(f"📞 WebRTC Offer received for call {call_id} from {from_peer}")
            
            # Forward offer to the other peer in the call room
            socketio.emit('webrtc_offer_received', {
                'callId': call_id,
                'offer': offer,
                'fromPeer': from_peer
            }, room=f'call_{call_id}', include_self=False)
            
            emit('webrtc_offer_sent', {
                'callId': call_id,
                'message': 'Offer sent to peer'
            })
            
        except Exception as e:
            emit('webrtc_error', {'message': f'Error handling offer: {str(e)}'})
    
    @socketio.on('webrtc_answer')
    def handle_webrtc_answer(data):
        """Xử lý WebRTC answer từ agent"""
        try:
            call_id = data.get('callId')
            answer = data.get('answer')
            from_peer = data.get('fromPeer')  # 'customer' hoặc 'agent'
            
            if not call_id or not answer:
                emit('webrtc_error', {'message': 'Missing callId or answer'})
                return
            
            print(f"📞 WebRTC Answer received for call {call_id} from {from_peer}")
            
            # Forward answer to the other peer
            socketio.emit('webrtc_answer_received', {
                'callId': call_id,
                'answer': answer,
                'fromPeer': from_peer
            }, room=f'call_{call_id}', include_self=False)
            
            emit('webrtc_answer_sent', {
                'callId': call_id,
                'message': 'Answer sent to peer'
            })
            
        except Exception as e:
            emit('webrtc_error', {'message': f'Error handling answer: {str(e)}'})
    
    @socketio.on('webrtc_ice_candidate')
    def handle_ice_candidate(data):
        """Xử lý ICE candidates cho NAT traversal"""
        try:
            call_id = data.get('callId')
            candidate = data.get('candidate')
            from_peer = data.get('fromPeer')
            
            if not call_id or not candidate:
                emit('webrtc_error', {'message': 'Missing callId or candidate'})
                return
            
            print(f"🧊 ICE Candidate for call {call_id} from {from_peer}")
            
            # Forward ICE candidate to the other peer
            socketio.emit('webrtc_ice_candidate_received', {
                'callId': call_id,
                'candidate': candidate,
                'fromPeer': from_peer
            }, room=f'call_{call_id}', include_self=False)
            
        except Exception as e:
            emit('webrtc_error', {'message': f'Error handling ICE candidate: {str(e)}'})
    
    @socketio.on('join_call_room')
    def handle_join_call_room(data):
        """Join vào room của cuộc gọi để nhận WebRTC signals"""
        try:
            call_id = data.get('callId')
            peer_type = data.get('peerType')  # 'customer' hoặc 'agent'
            
            if not call_id:
                emit('webrtc_error', {'message': 'Missing callId'})
                return
            
            room_name = f'call_{call_id}'
            join_room(room_name)
            
            print(f"👥 {peer_type} joined call room: {room_name}")
            
            # Thông báo cho peer khác về việc join
            socketio.emit('peer_joined', {
                'callId': call_id,
                'peerType': peer_type,
                'message': f'{peer_type} joined the call'
            }, room=room_name, include_self=False)
            
            emit('call_room_joined', {
                'callId': call_id,
                'room': room_name,
                'message': f'Joined call room as {peer_type}'
            })
            
        except Exception as e:
            emit('webrtc_error', {'message': f'Error joining call room: {str(e)}'})
    
    @socketio.on('leave_call_room')
    def handle_leave_call_room(data):
        """Leave khỏi room của cuộc gọi"""
        try:
            call_id = data.get('callId')
            peer_type = data.get('peerType')
            
            if not call_id:
                emit('webrtc_error', {'message': 'Missing callId'})
                return
            
            room_name = f'call_{call_id}'
            leave_room(room_name)
            
            print(f"👋 {peer_type} left call room: {room_name}")
            
            # Thông báo cho peer khác về việc leave
            socketio.emit('peer_left', {
                'callId': call_id,
                'peerType': peer_type,
                'message': f'{peer_type} left the call'
            }, room=room_name)
            
            emit('call_room_left', {
                'callId': call_id,
                'message': f'Left call room'
            })
            
        except Exception as e:
            emit('webrtc_error', {'message': f'Error leaving call room: {str(e)}'})
    
    @socketio.on('webrtc_media_state')
    def handle_media_state(data):
        """Xử lý trạng thái media (mute/unmute, video on/off)"""
        try:
            call_id = data.get('callId')
            peer_type = data.get('peerType')
            audio_enabled = data.get('audioEnabled', True)
            video_enabled = data.get('videoEnabled', False)
            
            if not call_id:
                emit('webrtc_error', {'message': 'Missing callId'})
                return
            
            print(f"🎤 Media state for call {call_id}: audio={audio_enabled}, video={video_enabled}")
            
            # Broadcast media state to other peer
            socketio.emit('peer_media_state', {
                'callId': call_id,
                'peerType': peer_type,
                'audioEnabled': audio_enabled,
                'videoEnabled': video_enabled
            }, room=f'call_{call_id}', include_self=False)
            
        except Exception as e:
            emit('webrtc_error', {'message': f'Error handling media state: {str(e)}'})

# REST API endpoints for WebRTC info
@webrtc_bp.route('/webrtc/config', methods=['GET'])
def get_webrtc_config():
    """API trả về config WebRTC cho frontend"""
    return jsonify({
        'success': True,
        'data': {
            'iceServers': [
                {
                    'urls': ['stun:stun.l.google.com:19302']
                },
                {
                    'urls': ['stun:stun1.l.google.com:19302']
                }
            ],
            'mediaConstraints': {
                'audio': {
                    'echoCancellation': True,
                    'noiseSuppression': True,
                    'autoGainControl': True
                },
                'video': False  # Voice call only
            },
            'offerOptions': {
                'offerToReceiveAudio': True,
                'offerToReceiveVideo': False
            }
        },
        'message': 'WebRTC configuration'
    })

@webrtc_bp.route('/webrtc/call/<call_id>/info', methods=['GET'])
def get_call_webrtc_info(call_id):
    """API trả về thông tin WebRTC cho cuộc gọi cụ thể"""
    try:
        return jsonify({
            'success': True,
            'data': {
                'callId': call_id,
                'roomName': f'call_{call_id}',
                'signalingUrl': 'http://localhost:8000',
                'events': {
                    'join': 'join_call_room',
                    'offer': 'webrtc_offer',
                    'answer': 'webrtc_answer',
                    'iceCandidate': 'webrtc_ice_candidate',
                    'mediaState': 'webrtc_media_state'
                }
            },
            'message': f'WebRTC info for call {call_id}'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error getting WebRTC info: {str(e)}'
        }), 500
