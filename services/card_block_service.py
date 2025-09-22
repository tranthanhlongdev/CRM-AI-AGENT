import re
from typing import Dict, List, Optional, Tuple
from models.card import Card, CardBlockTransaction
from models.customer import Customer
from models.customer import db
import logging

logger = logging.getLogger(__name__)

class CardBlockService:
    def __init__(self):
        self.block_keywords = [
            'khóa thẻ', 'block thẻ', 'tạm khóa thẻ', 'dừng thẻ',
            'thẻ bị mất', 'thẻ bị đánh cắp', 'khóa tạm thời',
            'khóa vĩnh viễn', 'block card', 'khóa card'
        ]
        
        self.reason_mapping = {
            'mất': 'lost',
            'đánh cắp': 'stolen', 
            'tạm thời': 'temporary',
            'vĩnh viễn': 'permanent',
            'khả nghi': 'suspicious',
            'giao dịch lạ': 'suspicious',
            'hack': 'suspicious'
        }
    
    def detect_block_intent(self, message: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Detect if message contains card block intent
        Returns: (is_block_intent, detected_reason, detected_type)
        """
        message_lower = message.lower()
        
        # Check if message contains block keywords
        is_block_intent = any(keyword in message_lower for keyword in self.block_keywords)
        
        if not is_block_intent:
            return False, None, None
        
        # Detect reason
        detected_reason = None
        detected_type = None
        
        for reason_key, reason_value in self.reason_mapping.items():
            if reason_key in message_lower:
                detected_reason = reason_value
                break
        
        # Detect block type
        if 'tạm thời' in message_lower or 'tạm' in message_lower:
            detected_type = 'temporary'
        elif 'vĩnh viễn' in message_lower or 'vĩnh' in message_lower:
            detected_type = 'permanent'
        elif detected_reason in ['lost', 'stolen']:
            detected_type = 'permanent'
        elif detected_reason == 'suspicious':
            detected_type = 'temporary'
        else:
            detected_type = 'temporary'  # Default to temporary
        
        return True, detected_reason, detected_type
    
    def get_cards_by_cif(self, cif_number: str, full_info: bool = False) -> List[Dict]:
        """Get all cards for a customer by CIF"""
        try:
            cards = Card.query.filter_by(cif_number=cif_number).all()
            if full_info:
                return [card.to_full_dict() for card in cards]
            else:
                return [card.to_secure_dict() for card in cards]
        except Exception as e:
            logger.error(f"Error getting cards for CIF {cif_number}: {str(e)}")
            return []
    
    def get_card_by_last_four(self, cif_number: str, last_four: str) -> Optional[Card]:
        """Get card by last 4 digits"""
        try:
            cards = Card.query.filter_by(cif_number=cif_number).all()
            for card in cards:
                if card.card_number.endswith(last_four):
                    return card
            return None
        except Exception as e:
            logger.error(f"Error getting card by last 4 digits: {str(e)}")
            return None
    
    def verify_customer_info(self, cif_number: str, verification_data: Dict) -> bool:
        """Verify customer information"""
        try:
            customer = Customer.query.filter_by(cif_number=cif_number).first()
            if not customer:
                return False
            
            # Check name (case insensitive)
            if verification_data.get('fullName'):
                if customer.ho_ten.lower() != verification_data['fullName'].lower():
                    return False
            
            # Check date of birth
            if verification_data.get('dateOfBirth'):
                if customer.ngay_sinh:
                    customer_dob = customer.ngay_sinh.strftime('%d/%m/%Y')
                    if customer_dob != verification_data['dateOfBirth']:
                        return False
            
            # Check ID number
            if verification_data.get('idNumber'):
                if customer.cmnd != verification_data['idNumber']:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error verifying customer info: {str(e)}")
            return False
    
    def block_card(self, card_id: str, cif_number: str, block_reason: str, 
                   block_type: str, verification_data: Dict, notes: str = "") -> Optional[Dict]:
        """Block a card"""
        try:
            # Get card
            card = Card.query.get(card_id)
            if not card:
                logger.error(f"Card {card_id} not found")
                return None
            
            # Check if card belongs to customer
            if card.cif_number != cif_number:
                logger.error(f"Card {card_id} does not belong to CIF {cif_number}")
                return None
            
            # Check if card is already blocked
            if card.status == 'blocked':
                logger.warning(f"Card {card_id} is already blocked")
                return {
                    'success': False,
                    'error': 'Card already blocked',
                    'currentStatus': 'blocked'
                }
            
            # Create block transaction
            transaction = CardBlockTransaction(
                card_id=card_id,
                cif_number=cif_number,
                block_reason=block_reason,
                block_type=block_type,
                customer_verification=verification_data,
                notes=notes,
                block_status='pending'
            )
            
            # Generate reference number
            transaction.generate_reference_number()
            
            # Update card status
            card.status = 'blocked'
            card.updated_at = db.func.now()
            
            # Update transaction status
            transaction.block_status = 'blocked'
            transaction.updated_at = db.func.now()
            
            # Save to database
            db.session.add(transaction)
            db.session.commit()
            
            # Return success response
            return {
                'success': True,
                'data': {
                    'transactionId': transaction.id,
                    'cardId': card_id,
                    'maskedNumber': card.masked_number,
                    'blockStatus': 'blocked',
                    'blockType': block_type,
                    'blockReason': block_reason,
                    'blockTime': transaction.block_time.isoformat(),
                    'referenceNumber': transaction.reference_number,
                    'nextSteps': [
                        "Liên hệ hotline 1900 545 415 để làm thẻ mới",
                        "Đến chi nhánh với CMND và giấy tờ liên quan",
                        "Thẻ mới sẽ được làm trong 3-5 ngày"
                    ]
                }
            }
            
        except Exception as e:
            logger.error(f"Error blocking card: {str(e)}")
            db.session.rollback()
            return None
    
    def get_block_reason_display(self, reason: str) -> str:
        """Get Vietnamese display text for block reason"""
        reason_display = {
            'lost': 'Thẻ bị mất',
            'stolen': 'Thẻ bị đánh cắp',
            'temporary': 'Khóa tạm thời',
            'permanent': 'Khóa vĩnh viễn',
            'suspicious': 'Phát hiện giao dịch khả nghi'
        }
        return reason_display.get(reason, reason)
    
    def get_block_type_display(self, block_type: str) -> str:
        """Get Vietnamese display text for block type"""
        type_display = {
            'temporary': 'Tạm thời',
            'permanent': 'Vĩnh viễn'
        }
        return type_display.get(block_type, block_type)
