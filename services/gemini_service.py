import requests
import json
import os
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY', 'AIzaSyAYJGwp3bKclMpln-viL7ZU1CMHhUiyGxU')
        self.model = os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash')
        self.api_url = os.environ.get('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent')
        self.timeout = int(os.environ.get('GEMINI_TIMEOUT', '30'))
    
    def generate_response(self, message: str, customer_info: Dict[str, Any], conversation_context: str = "") -> Optional[str]:
        """
        Generate response using Gemini AI
        """
        try:
            # Banking context prompt
            banking_context = """
Bạn là AI Assistant của HDBank (Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh), một trong những ngân hàng hàng đầu tại Việt Nam. 
Nhiệm vụ của bạn là tư vấn và hỗ trợ khách hàng về các sản phẩm, dịch vụ ngân hàng một cách chuyên nghiệp, thân thiện.

THÔNG TIN VỀ CÁC SẢN PHẨM DỊCH VỤ CHÍNH:

1. TÀI KHOẢN TIẾT KIỆM:
- Tiết kiệm có kỳ hạn: 1, 3, 6, 12, 18, 24 tháng
- Lãi suất từ 4.5% - 7.2%/năm tùy kỳ hạn
- Tiết kiệm không kỳ hạn: 1.2%/năm
- Số tiền gửi tối thiểu: 500,000 VND

2. THẺ TÍN DỤNG:
- Thẻ Platinum: Hạn mức đến 500 triệu
- Thẻ Gold: Hạn mức đến 200 triệu  
- Thẻ Classic: Hạn mức đến 50 triệu
- Miễn phí năm đầu, ưu đãi mua sắm, tích điểm

3. VAY MUA NHÀ:
- Lãi suất từ 8.5%/năm
- Thời hạn vay đến 25 năm
- Vay đến 85% giá trị tài sản
- Không cần chứng minh thu nhập với một số sản phẩm

4. INTERNET BANKING & MOBILE BANKING:
- HDBank Mobile Banking: Ứng dụng di động hiện đại
- Chuyển tiền miễn phí trong hệ thống HDBank
- Thanh toán hóa đơn, nạp tiền điện thoại
- Quản lý tài khoản 24/7

5. SMS BANKING:
- Nhận thông báo giao dịch
- Kiểm tra số dư qua SMS
- Chuyển tiền nhanh chóng
- Phí dịch vụ: 11,000 VND/tháng

6. KHÓA THẺ:
- Khóa tạm thời: Có thể mở lại qua hotline
- Khóa vĩnh viễn: Thẻ bị mất, đánh cắp
- Khóa do giao dịch khả nghi: Tạm thời, cần xác minh
- Hotline khóa thẻ: 1900 545 415 (24/7)

Nguyên tắc trả lời:
- Luôn thân thiện, chuyên nghiệp
- Cung cấp thông tin chính xác, cập nhật
- Hỏi thêm thông tin nếu cần làm rõ
- Đề xuất sản phẩm phù hợp với nhu cầu khách hàng
- Kết thúc bằng việc hỏi còn gì cần hỗ trợ thêm không
"""

            # Customer greeting
            customer_name = customer_info.get('name', 'Khách hàng')
            if customer_info.get('isExistingCustomer', False):
                greeting = f"Chào anh/chị {customer_name}!"
            else:
                greeting = "Chào khách hàng vãng lai!"
            
            # Build prompt
            prompt = f"""
{banking_context}

{greeting}

Tin nhắn của khách hàng: {message}

Thông tin khách hàng: {json.dumps(customer_info, ensure_ascii=False)}

Lịch sử hội thoại: {conversation_context}

Hãy trả lời một cách thân thiện, chuyên nghiệp và hữu ích. Trả lời bằng tiếng Việt.
"""

            # Prepare request payload
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1024
                }
            }

            # Make API request
            headers = {
                'Content-Type': 'application/json',
            }
            
            params = {
                'key': self.api_key
            }
            
            response = requests.post(
                self.api_url,
                params=params,
                headers=headers,
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and len(result['candidates']) > 0:
                    content = result['candidates'][0]['content']
                    if 'parts' in content and len(content['parts']) > 0:
                        return content['parts'][0]['text']
            
            logger.error(f"Gemini API error: {response.status_code} - {response.text}")
            return None
            
        except requests.exceptions.Timeout:
            logger.error("Gemini API timeout")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Gemini API request error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Gemini service error: {str(e)}")
            return None
    
    def get_fallback_response(self, message: str, customer_info: Dict[str, Any]) -> str:
        """
        Get fallback response when Gemini AI is not available
        """
        customer_name = customer_info.get('name', 'Khách hàng')
        
        # Simple keyword-based responses
        message_lower = message.lower()
        
        if any(keyword in message_lower for keyword in ['tiết kiệm', 'gửi tiết kiệm', 'lãi suất']):
            return f"""Chào {customer_name}! HDBank có nhiều sản phẩm tiết kiệm hấp dẫn:

📈 Tiết kiệm có kỳ hạn:
- 6 tháng: 5.8%/năm
- 12 tháng: 6.5%/năm  
- 24 tháng: 7.2%/năm

💰 Số tiền gửi tối thiểu chỉ 500,000 VND
🎁 Tặng quà khi gửi từ 100 triệu

{customer_name} muốn biết thêm về kỳ hạn nào cụ thể?"""
        
        elif any(keyword in message_lower for keyword in ['thẻ tín dụng', 'thẻ credit', 'thẻ']):
            return f"""Chào {customer_name}! HDBank có các loại thẻ tín dụng phù hợp với mọi nhu cầu:

💳 Thẻ Platinum: Hạn mức đến 500 triệu
💳 Thẻ Gold: Hạn mức đến 200 triệu
💳 Thẻ Classic: Hạn mức đến 50 triệu

✨ Ưu đãi:
- Miễn phí năm đầu
- Hoàn tiền đến 1.5%
- Tích điểm đổi quà

{customer_name} quan tâm đến loại thẻ nào nhất?"""
        
        elif any(keyword in message_lower for keyword in ['vay', 'vay tiền', 'vay mua nhà']):
            return f"""Chào {customer_name}! HDBank có các sản phẩm vay phù hợp:

🏠 Vay mua nhà:
- Lãi suất từ 8.5%/năm
- Thời hạn vay đến 25 năm
- Vay đến 85% giá trị tài sản

💳 Vay tín chấp:
- Lãi suất từ 12%/năm
- Hạn mức đến 500 triệu
- Thủ tục đơn giản

{customer_name} cần tư vấn về sản phẩm vay nào?"""
        
        else:
            return f"""Chào {customer_name}! Cảm ơn bạn đã liên hệ với HDBank AI Assistant.

Tôi có thể hỗ trợ bạn về:
🏦 Tài khoản tiết kiệm
💳 Thẻ tín dụng & ghi nợ
🏠 Vay mua nhà, vay tiêu dùng
📱 Internet Banking & Mobile Banking
📨 SMS Banking

Bạn có thể hỏi cụ thể về sản phẩm nào bạn quan tâm, tôi sẽ tư vấn chi tiết cho bạn!"""
