from flask import Blueprint, request, jsonify
from models.card import Card, CardBlockTransaction
from models.customer import Customer
from models.customer import db
from services.card_block_service import CardBlockService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

cards_bp = Blueprint('cards', __name__)
card_block_service = CardBlockService()

@cards_bp.route('/cards/by-cif/<cif_number>', methods=['GET'])
def get_cards_by_cif(cif_number):
    """
    Get all cards for a customer by CIF
    """
    try:
        # Get query parameters
        full_info = request.args.get('full_info', 'false').lower() == 'true'
        
        # Verify customer exists
        customer = Customer.query.filter_by(cif_number=cif_number).first()
        if not customer:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CUSTOMER_NOT_FOUND',
                    'message': 'Không tìm thấy khách hàng với CIF này'
                }
            }), 404
        
        # Get cards with full info if requested
        cards = card_block_service.get_cards_by_cif(cif_number, full_info=full_info)
        
        # Build customer info
        customer_info = {
            'cifNumber': cif_number,
            'customerName': customer.ho_ten,
            'phone': customer.so_dien_thoai,
            'email': customer.email,
            'cmnd': customer.cmnd,
            'dateOfBirth': customer.ngay_sinh.strftime('%d/%m/%Y') if customer.ngay_sinh else None,
            'gender': customer.gioi_tinh.value if customer.gioi_tinh else None,
            'address': customer.dia_chi,
            'customerType': customer.loai_khach_hang.value if customer.loai_khach_hang else None,
            'status': customer.trang_thai_kh.value if customer.trang_thai_kh else None,
            'accountNumber': customer.so_tai_khoan,
            'balance': str(customer.so_du_hien_tai) if customer.so_du_hien_tai else '0',
            'accountOpenDate': customer.ngay_mo_tk.strftime('%d/%m/%Y') if customer.ngay_mo_tk else None
        }
        
        return jsonify({
            'success': True,
            'data': {
                'customer': customer_info,
                'cards': cards,
                'totalCards': len(cards),
                'activeCards': len([card for card in cards if card.get('status') == 'active']),
                'blockedCards': len([card for card in cards if card.get('status') == 'blocked']),
                'expiredCards': len([card for card in cards if card.get('status') == 'expired']),
                'metadata': {
                    'requestedAt': datetime.utcnow().isoformat(),
                    'fullInfo': full_info,
                    'apiVersion': '1.0'
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting cards for CIF {cif_number}: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau'
            }
        }), 500

@cards_bp.route('/cards/block', methods=['POST'])
def block_card():
    """
    Block a specific card by card ID
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_DATA',
                    'message': 'Dữ liệu yêu cầu là bắt buộc'
                }
            }), 400
        
        # Only cardId is required now
        if 'cardId' not in data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_CARD_ID',
                    'message': 'cardId là bắt buộc'
                }
            }), 400
        
        card_id = data['cardId']
        
        # Find the card
        card = Card.query.get(card_id)
        if not card:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CARD_NOT_FOUND',
                    'message': 'Không tìm thấy thẻ với ID này'
                }
            }), 404
        
        # Check if card is already blocked
        if card.status == 'blocked':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CARD_ALREADY_BLOCKED',
                    'message': 'Thẻ này đã bị khóa từ trước'
                }
            }), 400
        
        # Check if card is active
        if card.status != 'active':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CARD_NOT_ACTIVE',
                    'message': f'Thẻ không ở trạng thái hoạt động (hiện tại: {card.status})'
                }
            }), 400
        
        # Get customer info
        customer = Customer.query.filter_by(cif_number=card.cif_number).first()
        
        # Block the card
        card.status = 'blocked'
        card.updated_at = datetime.utcnow()
        
        # Commit changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã khóa thẻ thành công',
            'data': {
                'cardId': card.id,
                'cardName': card.card_name,
                'maskedNumber': card.masked_number,
                'cardType': card.card_type,
                'previousStatus': 'active',
                'currentStatus': 'blocked',
                'cifNumber': card.cif_number,
                'customerName': customer.ho_ten if customer else None,
                'blockTime': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error blocking card: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau'
            }
        }), 500

@cards_bp.route('/cards/unblock', methods=['POST'])
def unblock_card():
    """
    Unblock a specific card by card ID
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_DATA',
                    'message': 'Dữ liệu yêu cầu là bắt buộc'
                }
            }), 400
        
        # Only cardId is required
        if 'cardId' not in data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_CARD_ID',
                    'message': 'cardId là bắt buộc'
                }
            }), 400
        
        card_id = data['cardId']
        
        # Find the card
        card = Card.query.get(card_id)
        if not card:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CARD_NOT_FOUND',
                    'message': 'Không tìm thấy thẻ với ID này'
                }
            }), 404
        
        # Check if card is already active
        if card.status == 'active':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CARD_ALREADY_ACTIVE',
                    'message': 'Thẻ này đã ở trạng thái hoạt động'
                }
            }), 400
        
        # Check if card is blocked
        if card.status != 'blocked':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CARD_NOT_BLOCKED',
                    'message': f'Thẻ không ở trạng thái bị khóa (hiện tại: {card.status})'
                }
            }), 400
        
        # Get customer info
        customer = Customer.query.filter_by(cif_number=card.cif_number).first()
        
        # Unblock the card
        card.status = 'active'
        card.updated_at = datetime.utcnow()
        
        # Commit changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã mở khóa thẻ thành công',
            'data': {
                'cardId': card.id,
                'cardName': card.card_name,
                'maskedNumber': card.masked_number,
                'cardType': card.card_type,
                'previousStatus': 'blocked',
                'currentStatus': 'active',
                'cifNumber': card.cif_number,
                'customerName': customer.ho_ten if customer else None,
                'unblockTime': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error unblocking card: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau'
            }
        }), 500

@cards_bp.route('/cards/<card_id>/status', methods=['GET'])
def get_card_status(card_id):
    """
    Get card status with full information
    """
    try:
        # Get query parameters
        full_info = request.args.get('full_info', 'false').lower() == 'true'
        
        card = Card.query.get(card_id)
        if not card:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CARD_NOT_FOUND',
                    'message': 'Không tìm thấy thẻ'
                }
            }), 404
        
        # Get customer info
        customer = Customer.query.filter_by(cif_number=card.cif_number).first()
        customer_info = {
            'cifNumber': customer.cif_number if customer else None,
            'customerName': customer.ho_ten if customer else None,
            'phone': customer.so_dien_thoai if customer else None
        } if customer else None
        
        # Get card data
        card_data = card.to_full_dict() if full_info else card.to_secure_dict()
        
        # Get latest block transaction if card is blocked
        block_info = None
        if card.status == 'blocked' and card.block_transactions:
            latest_transaction = max(card.block_transactions, key=lambda x: x.created_at)
            block_info = latest_transaction.to_full_dict() if full_info else latest_transaction.to_dict()
        
        return jsonify({
            'success': True,
            'data': {
                'card': card_data,
                'customer': customer_info,
                'blockInfo': block_info,
                'metadata': {
                    'requestedAt': datetime.utcnow().isoformat(),
                    'fullInfo': full_info,
                    'apiVersion': '1.0'
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting card status: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau'
            }
        }), 500

@cards_bp.route('/cards/block-transactions/<cif_number>', methods=['GET'])
def get_block_transactions(cif_number):
    """
    Get block transaction history for a customer
    """
    try:
        # Get query parameters
        full_info = request.args.get('full_info', 'false').lower() == 'true'
        limit = request.args.get('limit', type=int, default=50)
        offset = request.args.get('offset', type=int, default=0)
        
        # Verify customer exists
        customer = Customer.query.filter_by(cif_number=cif_number).first()
        if not customer:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CUSTOMER_NOT_FOUND',
                    'message': 'Không tìm thấy khách hàng với CIF này'
                }
            }), 404
        
        # Get transactions with pagination
        transactions_query = CardBlockTransaction.query.filter_by(cif_number=cif_number)
        total_transactions = transactions_query.count()
        
        transactions = transactions_query.order_by(
            CardBlockTransaction.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        # Get transaction data
        if full_info:
            transactions_data = [txn.to_full_dict() for txn in transactions]
        else:
            transactions_data = [txn.to_dict() for txn in transactions]
        
        # Get customer info
        customer_info = {
            'cifNumber': customer.cif_number,
            'customerName': customer.ho_ten,
            'phone': customer.so_dien_thoai,
            'email': customer.email
        }
        
        # Get summary statistics
        status_counts = {}
        reason_counts = {}
        for txn in transactions:
            status = txn.block_status
            reason = txn.block_reason
            status_counts[status] = status_counts.get(status, 0) + 1
            reason_counts[reason] = reason_counts.get(reason, 0) + 1
        
        return jsonify({
            'success': True,
            'data': {
                'customer': customer_info,
                'transactions': transactions_data,
                'pagination': {
                    'total': total_transactions,
                    'limit': limit,
                    'offset': offset,
                    'hasMore': offset + limit < total_transactions
                },
                'summary': {
                    'totalTransactions': total_transactions,
                    'statusCounts': status_counts,
                    'reasonCounts': reason_counts
                },
                'metadata': {
                    'requestedAt': datetime.utcnow().isoformat(),
                    'fullInfo': full_info,
                    'apiVersion': '1.0'
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting block transactions for CIF {cif_number}: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau'
            }
        }), 500
