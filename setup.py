#!/usr/bin/env python3
"""
Setup script for CRM API
"""

import subprocess
import sys
import os

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def setup_database():
    """Setup database with sample data"""
    print("Setting up database...")
    # Run the database initialization script
    os.system("python init_database.py")

def main():
    """Main setup function"""
    print("🚀 Setting up CRM API...")
    
    try:
        # Install requirements
        install_requirements()
        
        # Setup database
        setup_database()
        
        print("✅ Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Update database configuration in config.py")
        print("2. Run: python app.py")
        print("3. API will be available at: http://localhost:5000")
        print("\n🔗 Available endpoints:")
        print("- GET /health - Health check")
        print("- GET /api/customers/search - Search customers")
        print("- GET /api/customers/{cifNumber} - Get customer details")
        print("- GET /api/customers/branches - Get branches list")
        print("- GET /api/customers/stats - Get customer statistics")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
