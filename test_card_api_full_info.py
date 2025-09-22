#!/usr/bin/env python3
"""
Test script for HDBank Card API with Full Information
"""

import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:5000/api"

def test_get_cards_by_cif_full_info():
    """Test getting cards by CIF with full information"""
    print("=== Testing Get Cards by CIF with Full Info ===")
    
    # Test with existing CIF - full info
    cif_number = "CIF808080"  # Your CIF number
    
    # Test with full_info=true
    response = requests.get(f"{BASE_URL}/cards/by-cif/{cif_number}?full_info=true")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    # Test with full_info=false (default)
    response = requests.get(f"{BASE_URL}/cards/by-cif/{cif_number}")
    print(f"Status Code (default): {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    return response.json()

def test_get_card_status_full_info():
    """Test getting card status with full information"""
    print("=== Testing Get Card Status with Full Info ===")
    
    # Test with actual card ID from your database
    card_id = "CARD_808080001"  # Replace with actual card ID
    
    # Test with full_info=true
    response = requests.get(f"{BASE_URL}/cards/{card_id}/status?full_info=true")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    # Test with full_info=false (default)
    response = requests.get(f"{BASE_URL}/cards/{card_id}/status")
    print(f"Status Code (default): {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    return response.json()

def test_get_block_transactions_full_info():
    """Test getting block transactions with full information"""
    print("=== Testing Get Block Transactions with Full Info ===")
    
    cif_number = "CIF808080"  # Your CIF number
    
    # Test with full_info=true and pagination
    response = requests.get(f"{BASE_URL}/cards/block-transactions/{cif_number}?full_info=true&limit=10&offset=0")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    # Test with full_info=false (default)
    response = requests.get(f"{BASE_URL}/cards/block-transactions/{cif_number}")
    print(f"Status Code (default): {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    return response.json()

def test_bot_chat_with_full_card_info():
    """Test bot chat with full card information"""
    print("=== Testing Bot Chat with Full Card Info ===")
    
    # Test with your customer info
    payload = {
        "message": "Tôi muốn khóa thẻ tín dụng Premium",
        "customerInfo": {
            "phone": "0778895646",
            "name": "Trần Thanh Long",
            "cif": "CIF808080",
            "isExistingCustomer": True
        }
    }
    
    response = requests.post(f"{BASE_URL}/bot/chat", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    return response.json()

def test_error_cases():
    """Test error cases"""
    print("=== Testing Error Cases ===")
    
    # Test with non-existent CIF
    response = requests.get(f"{BASE_URL}/cards/by-cif/INVALID_CIF?full_info=true")
    print(f"Invalid CIF - Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    # Test with non-existent card ID
    response = requests.get(f"{BASE_URL}/cards/INVALID_CARD/status?full_info=true")
    print(f"Invalid Card ID - Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def test_with_windows_cmd():
    """Test with Windows CMD commands"""
    print("=== Windows CMD Commands ===")
    
    print("1. Get cards by CIF with full info:")
    print(f'curl -X GET "{BASE_URL}/cards/by-cif/CIF808080?full_info=true"')
    print()
    
    print("2. Get card status with full info:")
    print(f'curl -X GET "{BASE_URL}/cards/CARD_808080001/status?full_info=true"')
    print()
    
    print("3. Get block transactions with full info:")
    print(f'curl -X GET "{BASE_URL}/cards/block-transactions/CIF808080?full_info=true&limit=10&offset=0"')
    print()
    
    print("4. Bot chat with card block intent:")
    print(f'curl -X POST "{BASE_URL}/bot/chat" -H "Content-Type: application/json" -d "{{\\"message\\": \\"Tôi muốn khóa thẻ\\", \\"customerInfo\\": {{\\"phone\\": \\"0778895646\\", \\"name\\": \\"Trần Thanh Long\\", \\"cif\\": \\"CIF808080\\", \\"isExistingCustomer\\": true}}}}"')
    print()

def test_api_features():
    """Test various API features"""
    print("=== Testing API Features ===")
    
    cif_number = "CIF808080"
    
    # Test pagination
    print("Testing pagination...")
    response = requests.get(f"{BASE_URL}/cards/block-transactions/{cif_number}?limit=5&offset=0")
    if response.status_code == 200:
        data = response.json()
        pagination = data.get('data', {}).get('pagination', {})
        print(f"Pagination: {pagination}")
    print()
    
    # Test different card statuses
    print("Testing different card statuses...")
    response = requests.get(f"{BASE_URL}/cards/by-cif/{cif_number}?full_info=true")
    if response.status_code == 200:
        data = response.json()
        cards = data.get('data', {}).get('cards', [])
        for card in cards:
            print(f"Card: {card.get('cardName')} - Status: {card.get('statusDisplay')} - Color: {card.get('statusColor')}")
    print()

if __name__ == "__main__":
    print("HDBank Card API Full Information Test Suite")
    print("=" * 60)
    print()
    
    try:
        # Test all endpoints with full info
        test_get_cards_by_cif_full_info()
        test_get_card_status_full_info()
        test_get_block_transactions_full_info()
        test_bot_chat_with_full_card_info()
        test_error_cases()
        test_api_features()
        test_with_windows_cmd()
        
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API server.")
        print("Make sure the Flask app is running on http://localhost:5000")
    except Exception as e:
        print(f"Error during testing: {str(e)}")
