#!/usr/bin/env python3
"""
Easy startup script for CRM API
"""

import os
import sys
import subprocess
import time

def check_database():
    """Check if database is initialized"""
    try:
        from app import create_app
        from models.customer import db, Customer
        
        app = create_app()
        with app.app_context():
            count = Customer.query.count()
            return count > 0
    except:
        return False

def setup_and_run():
    """Setup database if needed and run the API"""
    print("🚀 CRM API Startup")
    print("=" * 40)
    
    # Check if database has data
    if not check_database():
        print("📊 Database needs initialization...")
        print("🔧 Setting up database with sample data...")
        try:
            from init_database import main as init_db
            init_db()
            print("✅ Database setup completed!")
        except Exception as e:
            print(f"❌ Database setup failed: {e}")
            print("Please run: python init_database.py")
            return
    else:
        print("✅ Database already initialized")
    
    print("\n🌐 Starting Flask API server...")
    print("📍 Server will be available at: http://localhost:5000")
    print("\n📋 Available API endpoints:")
    endpoints = [
        "GET /health - Health check",
        "GET /api/customers/search - Search customers", 
        "GET /api/customers/{cifNumber} - Customer details",
        "GET /api/customers/branches - List branches",
        "GET /api/customers/stats - Customer statistics"
    ]
    for endpoint in endpoints:
        print(f"  • {endpoint}")
    
    print("\n🔗 Quick test commands:")
    print("  curl http://localhost:5000/health")
    print("  curl http://localhost:5000/api/customers/search")
    print("  curl http://localhost:5000/api/customers/CIF001234567")
    
    print("\n" + "=" * 40)
    print("Press Ctrl+C to stop the server")
    print("=" * 40)
    
    # Start the Flask app
    from app import create_app
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    setup_and_run()
