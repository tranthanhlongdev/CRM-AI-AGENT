#!/usr/bin/env python3
"""
Simple script to run the CRM API
"""

from app import create_app

if __name__ == '__main__':
    app = create_app()
    print("🚀 Starting CRM API server...")
    print("📍 Server will be available at: http://localhost:5000")
    print("📋 Available endpoints:")
    print("  - GET /health")
    print("  - GET /api/customers/search")
    print("  - GET /api/customers/{cifNumber}")
    print("  - GET /api/customers/branches")
    print("  - GET /api/customers/stats")
    print("\n🔗 Example requests:")
    print("  curl http://localhost:5000/health")
    print("  curl http://localhost:5000/api/customers/search")
    print("  curl http://localhost:5000/api/customers/CIF001234567")
    print("\n" + "="*50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
