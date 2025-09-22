#!/usr/bin/env python3
"""
Test script for HDBank Bot API
"""

import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:5000/api"

def test_verify_phone():
    """Test phone verification API"""
    print("=== Testing Phone Verification API ===")
    
    # Test with valid phone number
    payload = {
        "phoneNumber": "0123456789"
    }
    
    response = requests.post(f"{BASE_URL}/bot/verify-phone", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    return response.json()

def test_chat_with_existing_customer():
    """Test chat API with existing customer"""
    print("=== Testing Chat API with Existing Customer ===")
    
    # First verify phone to get customer info
    customer_info = test_verify_phone()
    
    if customer_info.get('success') and customer_info['data'].get('isExistingCustomer'):
        payload = {
            "message": "Tôi muốn mở tài khoản tiết kiệm",
            "customerInfo": {
                "phone": customer_info['data']['phone'],
                "name": customer_info['data']['name'],
                "cif": customer_info['data']['cif'],
                "isExistingCustomer": True
            }
        }
        
        response = requests.post(f"{BASE_URL}/bot/chat", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
        
        return response.json()
    else:
        print("No existing customer found for testing")
        return None

def test_chat_with_new_customer():
    """Test chat API with new customer"""
    print("=== Testing Chat API with New Customer ===")
    
    payload = {
        "message": "Tôi muốn biết về thẻ tín dụng",
        "customerInfo": {
            "phone": "0999999999",
            "name": "Khách hàng mới",
            "isExistingCustomer": False
        }
    }
    
    response = requests.post(f"{BASE_URL}/bot/chat", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    return response.json()

def test_conversation_history():
    """Test conversation history API"""
    print("=== Testing Conversation History API ===")
    
    # First start a chat to get conversation ID
    chat_response = test_chat_with_new_customer()
    
    if chat_response and chat_response.get('success'):
        conversation_id = chat_response['data']['conversationId']
        
        # Get conversation history
        response = requests.get(f"{BASE_URL}/bot/conversation/{conversation_id}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print()
    else:
        print("Failed to get conversation ID for testing history")

def test_error_cases():
    """Test error cases"""
    print("=== Testing Error Cases ===")
    
    # Test invalid phone number
    payload = {
        "phoneNumber": "invalid_phone"
    }
    
    response = requests.post(f"{BASE_URL}/bot/verify-phone", json=payload)
    print(f"Invalid Phone - Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    # Test missing message
    payload = {
        "customerInfo": {
            "phone": "0123456789",
            "name": "Test Customer",
            "isExistingCustomer": False
        }
    }
    
    response = requests.post(f"{BASE_URL}/bot/chat", json=payload)
    print(f"Missing Message - Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

if __name__ == "__main__":
    print("HDBank Bot API Test Suite")
    print("=" * 50)
    print()
    
    try:
        # Test all endpoints
        test_verify_phone()
        test_chat_with_existing_customer()
        test_chat_with_new_customer()
        test_conversation_history()
        test_error_cases()
        
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API server.")
        print("Make sure the Flask app is running on http://localhost:5000")
    except Exception as e:
        print(f"Error during testing: {str(e)}")
