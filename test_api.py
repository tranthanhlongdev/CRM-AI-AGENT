#!/usr/bin/env python3
"""
Quick API testing script
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(url, description):
    """Test an API endpoint"""
    print(f"\n🧪 Testing: {description}")
    print(f"URL: {url}")
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            if 'data' in data and 'customers' in data['data']:
                print(f"Found {len(data['data']['customers'])} customers")
            elif 'data' in data and 'branches' in data['data']:
                print(f"Found {len(data['data']['branches'])} branches")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def main():
    """Test all API endpoints"""
    print("🚀 Testing CRM API Endpoints")
    print("="*50)
    
    # Test health endpoint
    test_endpoint(f"{BASE_URL}/health", "Health Check")
    
    # Test customer search
    test_endpoint(f"{BASE_URL}/api/customers/search", "Customer Search - All")
    test_endpoint(f"{BASE_URL}/api/customers/search?limit=5", "Customer Search - Limited")
    test_endpoint(f"{BASE_URL}/api/customers/search?searchTerm=Nguyễn", "Customer Search - By Name")
    test_endpoint(f"{BASE_URL}/api/customers/search?segmentFilter=VIP", "Customer Search - VIP Segment")
    test_endpoint(f"{BASE_URL}/api/customers/search?filterType=active", "Customer Search - Active Only")
    
    # Test customer detail
    test_endpoint(f"{BASE_URL}/api/customers/CIF001234567", "Customer Detail - Valid CIF")
    test_endpoint(f"{BASE_URL}/api/customers/INVALID", "Customer Detail - Invalid CIF")
    
    # Test additional endpoints
    test_endpoint(f"{BASE_URL}/api/customers/branches", "Get Branches")
    test_endpoint(f"{BASE_URL}/api/customers/stats", "Customer Statistics")
    
    print("\n" + "="*50)
    print("🎉 API Testing Completed!")

if __name__ == '__main__':
    main()
