#!/usr/bin/env python3
"""
Test script for HDBank Card Block API
"""

import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:5000/api"

def test_get_cards_by_cif():
    """Test getting cards by CIF"""
    print("=== Testing Get Cards by CIF API ===")
    
    # Test with existing CIF
    cif_number = "CIF001234567"  # Replace with actual CIF from your database
    
    response = requests.get(f"{BASE_URL}/cards/by-cif/{cif_number}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    return response.json()

def test_block_card():
    """Test blocking a card"""
    print("=== Testing Block Card API ===")
    
    # Test data - replace with actual values from your database
    payload = {
        "cardId": "CARD_123456789",
        "cifNumber": "CIF001234567",
        "blockReason": "lost",
        "blockType": "permanent",
        "customerVerification": {
            "fullName": "Nguyễn Văn A",
            "dateOfBirth": "01/01/1990",
            "idNumber": "123456789"
        },
        "notes": "Khách hàng báo mất thẻ qua bot chat"
    }
    
    response = requests.post(f"{BASE_URL}/cards/block", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    return response.json()

def test_get_card_status():
    """Test getting card status"""
    print("=== Testing Get Card Status API ===")
    
    card_id = "CARD_123456789"  # Replace with actual card ID
    
    response = requests.get(f"{BASE_URL}/cards/{card_id}/status")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    return response.json()

def test_get_block_transactions():
    """Test getting block transaction history"""
    print("=== Testing Get Block Transactions API ===")
    
    cif_number = "CIF001234567"  # Replace with actual CIF
    
    response = requests.get(f"{BASE_URL}/cards/block-transactions/{cif_number}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    return response.json()

def test_bot_card_block_intent():
    """Test bot chat with card block intent"""
    print("=== Testing Bot Chat with Card Block Intent ===")
    
    # Test with existing customer
    payload = {
        "message": "Tôi muốn khóa thẻ tín dụng",
        "customerInfo": {
            "phone": "0123456789",
            "name": "Nguyễn Văn A",
            "cif": "CIF001234567",
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
    
    # Test missing data
    payload = {
        "cardId": "CARD_123456789",
        "cifNumber": "CIF001234567"
        # Missing required fields
    }
    
    response = requests.post(f"{BASE_URL}/cards/block", json=payload)
    print(f"Missing Data - Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    # Test invalid block reason
    payload = {
        "cardId": "CARD_123456789",
        "cifNumber": "CIF001234567",
        "blockReason": "invalid_reason",
        "blockType": "permanent",
        "customerVerification": {
            "fullName": "Nguyễn Văn A",
            "dateOfBirth": "01/01/1990",
            "idNumber": "123456789"
        }
    }
    
    response = requests.post(f"{BASE_URL}/cards/block", json=payload)
    print(f"Invalid Block Reason - Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def test_with_windows_cmd():
    """Test with Windows CMD commands"""
    print("=== Windows CMD Commands ===")
    
    print("1. Get cards by CIF:")
    print(f'curl -X GET "{BASE_URL}/cards/by-cif/CIF001234567"')
    print()
    
    print("2. Block card:")
    print(f'curl -X POST "{BASE_URL}/cards/block" -H "Content-Type: application/json" -d "{{\\"cardId\\": \\"CARD_123456789\\", \\"cifNumber\\": \\"CIF001234567\\", \\"blockReason\\": \\"lost\\", \\"blockType\\": \\"permanent\\", \\"customerVerification\\": {{\\"fullName\\": \\"Nguyễn Văn A\\", \\"dateOfBirth\\": \\"01/01/1990\\", \\"idNumber\\": \\"123456789\\"}}}}"')
    print()
    
    print("3. Bot chat with card block intent:")
    print(f'curl -X POST "{BASE_URL}/bot/chat" -H "Content-Type: application/json" -d "{{\\"message\\": \\"Tôi muốn khóa thẻ\\", \\"customerInfo\\": {{\\"phone\\": \\"0123456789\\", \\"name\\": \\"Nguyễn Văn A\\", \\"cif\\": \\"CIF001234567\\", \\"isExistingCustomer\\": true}}}}"')
    print()

if __name__ == "__main__":
    print("HDBank Card Block API Test Suite")
    print("=" * 50)
    print()
    
    try:
        # Test all endpoints
        test_get_cards_by_cif()
        test_block_card()
        test_get_card_status()
        test_get_block_transactions()
        test_bot_card_block_intent()
        test_error_cases()
        test_with_windows_cmd()
        
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API server.")
        print("Make sure the Flask app is running on http://localhost:5000")
    except Exception as e:
        print(f"Error during testing: {str(e)}")
