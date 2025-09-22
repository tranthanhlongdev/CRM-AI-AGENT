from flask import Blueprint, request, jsonify
from models.customer import Customer, db
from models.bot import BotConversation, BotMessage
from services.gemini_service import GeminiService
from services.card_block_service import CardBlockService
from typing import Dict, Any
import re
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

bot_bp = Blueprint('bot', __name__)
gemini_service = GeminiService()
card_block_service = CardBlockService()

def validate_phone_number(phone: str) -> bool:
    """Validate Vietnamese phone number format"""
    if not phone:
        return False
    
    # Remove spaces and dashes
    phone = re.sub(r'[\s\-]', '', phone)
    
    # Vietnamese phone number regex
    pattern = r'^(0|\+84)[3|5|7|8|9][0-9]{8}$'
    return bool(re.match(pattern, phone))

def normalize_phone_number(phone: str) -> str:
    """Normalize phone number format"""
    phone = re.sub(r'[\s\-]', '', phone)
    if phone.startswith('+84'):
        phone = '0' + phone[3:]
    return phone

@bot_bp.route('/bot/verify-phone', methods=['POST'])
def verify_phone():
    """
    Verify phone number and get customer information
    """
    try:
        data = request.get_json()
        if not data or 'phoneNumber' not in data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_PHONE',
                    'message': 'Số điện thoại là bắt buộc'
                }
            }), 400
        
        phone_number = data['phoneNumber'].strip()
        
        # Validate phone number
        if not validate_phone_number(phone_number):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_PHONE',
                    'message': 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ'
                }
            }), 400
        
        # Normalize phone number
        normalized_phone = normalize_phone_number(phone_number)
        
        # Search for customer in database
        customer = Customer.query.filter(
            Customer.so_dien_thoai.contains(normalized_phone)
        ).first()
        
        if customer:
            # Existing customer
            response_data = {
                'phone': normalized_phone,
                'name': customer.ho_ten,
                'cif': customer.cif_number,
                'isExistingCustomer': True,
                'customerData': {
                    'personalInfo': {
                        'hoTen': customer.ho_ten,
                        'cifNumber': customer.cif_number,
                        'cmnd': customer.cmnd,
                        'ngaySinh': customer.ngay_sinh.strftime('%d/%m/%Y') if customer.ngay_sinh else None,
                        'gioiTinh': customer.gioi_tinh.value if customer.gioi_tinh else None,
                        'diaChi': customer.dia_chi
                    },
                    'contactInfo': {
                        'soDienThoai': customer.so_dien_thoai,
                        'email': customer.email
                    },
                    'accountInfo': {
                        'loaiKhachHang': customer.loai_khach_hang.value if customer.loai_khach_hang else None,
                        'nganHangTaiKhoan': customer.ngan_hang_tai_khoan,
                        'soTaiKhoan': customer.so_tai_khoan,
                        'soDuHienTai': str(customer.so_du_hien_tai) if customer.so_du_hien_tai else '0',
                        'ngayMoTK': customer.ngay_mo_tk.strftime('%d/%m/%Y') if customer.ngay_mo_tk else None,
                        'trangThaiKH': customer.trang_thai_kh.value if customer.trang_thai_kh else None
                    }
                }
            }
        else:
            # New customer
            response_data = {
                'phone': normalized_phone,
                'name': 'Khách hàng mới',
                'isExistingCustomer': False
            }
        
        return jsonify({
            'success': True,
            'data': response_data
        })
        
    except Exception as e:
        logger.error(f"Error in verify_phone: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau'
            }
        }), 500

@bot_bp.route('/bot/chat', methods=['POST'])
def chat():
    """
    Chat with bot
    """
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_MESSAGE',
                    'message': 'Tin nhắn là bắt buộc'
                }
            }), 400
        
        message = data['message'].strip()
        customer_info = data.get('customerInfo', {})
        conversation_id = data.get('conversationId')
        
        # Validate message length
        if len(message) > 1000:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MESSAGE_TOO_LONG',
                    'message': 'Tin nhắn quá dài. Vui lòng giới hạn trong 1000 ký tự'
                }
            }), 400
        
        # Get or create conversation
        conversation = None
        if conversation_id:
            conversation = BotConversation.query.get(conversation_id)
        
        if not conversation:
            # Create new conversation
            conversation = BotConversation(
                customer_phone=customer_info.get('phone', ''),
                customer_name=customer_info.get('name', 'Khách hàng'),
                customer_cif=customer_info.get('cif'),
                is_existing_customer=customer_info.get('isExistingCustomer', False)
            )
            db.session.add(conversation)
            db.session.commit()
        
        # Save user message
        user_message = BotMessage(
            conversation_id=conversation.id,
            message_type='user',
            content=message
        )
        db.session.add(user_message)
        
        # Get conversation context (last 5 messages)
        recent_messages = BotMessage.query.filter_by(
            conversation_id=conversation.id
        ).order_by(BotMessage.created_at.desc()).limit(5).all()
        
        conversation_context = ""
        if recent_messages:
            context_messages = []
            for msg in reversed(recent_messages):
                context_messages.append(f"{msg.message_type}: {msg.content}")
            conversation_context = "\n".join(context_messages)
        
        # Check for card block intent first
        is_block_intent, detected_reason, detected_type = card_block_service.detect_block_intent(message)
        
        if is_block_intent:
            # Handle card block intent
            bot_response_text = _handle_card_block_intent(
                message, customer_info, conversation_context, 
                detected_reason, detected_type
            )
        else:
            # Generate normal bot response
            bot_response_text = gemini_service.generate_response(
                message, customer_info, conversation_context
            )
            
            if not bot_response_text:
                # Use fallback response
                bot_response_text = gemini_service.get_fallback_response(message, customer_info)
        
        # Save bot message
        bot_message = BotMessage(
            conversation_id=conversation.id,
            message_type='bot',
            content=bot_response_text
        )
        db.session.add(bot_message)
        
        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'response': bot_response_text,
                'conversationId': conversation.id,
                'timestamp': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau'
            }
        }), 500
    
def _handle_card_block_intent(message: str, customer_info: Dict[str, Any], 
                             conversation_context: str, detected_reason: str, 
                             detected_type: str) -> str:
        """
        Handle card block intent with conversation flow
        """
        try:
            # Get customer CIF if available
            cif_number = customer_info.get('cif')
            customer_name = customer_info.get('name', 'Khách hàng')
            
            if not cif_number:
                return f"""Chào {customer_name}! Tôi hiểu bạn muốn khóa thẻ.

Để hỗ trợ bạn khóa thẻ, tôi cần xác thực thông tin khách hàng trước. Vui lòng:
1. Liên hệ hotline 1900 545 415 (24/7)
2. Hoặc đến chi nhánh HDBank gần nhất với CMND/CCCD

Hotline sẽ hỗ trợ bạn khóa thẻ ngay lập tức và hướng dẫn các bước tiếp theo."""
            
            # Get customer's cards with full info for UI
            cards = card_block_service.get_cards_by_cif(cif_number, full_info=True)
            
            if not cards:
                return f"""Chào {customer_name}! Tôi hiểu bạn muốn khóa thẻ.

Tôi không tìm thấy thẻ nào trong hệ thống của bạn. Vui lòng:
1. Liên hệ hotline 1900 545 415 để kiểm tra
2. Hoặc đến chi nhánh HDBank gần nhất

Hotline sẽ hỗ trợ bạn kiểm tra và khóa thẻ nếu cần thiết."""
            
            # Build response based on detected reason and type
            reason_display = card_block_service.get_block_reason_display(detected_reason or 'temporary')
            type_display = card_block_service.get_block_type_display(detected_type or 'temporary')
            
            response = f"""Chào {customer_name}! Tôi hiểu bạn muốn khóa thẻ.

📍 **Thông tin khóa thẻ:**
- Lý do: {reason_display}
- Loại khóa: {type_display}

🔍 **Thẻ của bạn:**
"""
            
            for i, card in enumerate(cards, 1):
                status_emoji = "🟢" if card['status'] == 'active' else "🔴"
                response += f"{i}. {status_emoji} {card['cardName']}: {card['maskedNumber']} ({card['status']})\n"
            
            response += f"""

⚠️ **Lưu ý quan trọng:**
- Khóa thẻ sẽ ngăn mọi giao dịch
- {type_display}: {'Có thể mở lại qua hotline' if detected_type == 'temporary' else 'Không thể mở lại, cần làm thẻ mới'}

📞 **Hỗ trợ khóa thẻ:**
- Hotline 24/7: 1900 545 415
- Chi nhánh gần nhất: HDBank sẽ tìm chi nhánh gần bạn

Bạn có muốn tôi hướng dẫn chi tiết quy trình khóa thẻ không?"""
            
            return response
            
        except Exception as e:
            logger.error(f"Error handling card block intent: {str(e)}")
            return f"""Chào {customer_info.get('name', 'Khách hàng')}! Tôi hiểu bạn muốn khóa thẻ.

Để đảm bảo an toàn, vui lòng liên hệ trực tiếp:
📞 Hotline 24/7: 1900 545 415
🏦 Chi nhánh HDBank gần nhất

Hotline sẽ hỗ trợ bạn khóa thẻ ngay lập tức."""

@bot_bp.route('/bot/conversation/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    """
    Get conversation history
    """
    try:
        conversation = BotConversation.query.get(conversation_id)
        if not conversation:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CONVERSATION_NOT_FOUND',
                    'message': 'Không tìm thấy cuộc hội thoại'
                }
            }), 404
        
        # Get messages
        messages = BotMessage.query.filter_by(
            conversation_id=conversation_id
        ).order_by(BotMessage.created_at.asc()).all()
        
        messages_data = [msg.to_dict() for msg in messages]
        
        return jsonify({
            'success': True,
            'data': {
                'conversationId': conversation.id,
                'messages': messages_data
            }
        })
        
    except Exception as e:
        logger.error(f"Error in get_conversation: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau'
            }
        }), 500
