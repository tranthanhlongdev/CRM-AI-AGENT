from flask import Flask, render_template
from flask_cors import CORS
from config import config
import os

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    from models.customer import db
    db.init_app(app)
    CORS(app)
    
    # Initialize SocketIO
    from routes.call_center import init_socketio
    socketio = init_socketio(app)
    
    # Register blueprints
    from routes.customers import customers_bp
    from routes.customers_body_api import customers_body_bp
    from routes.auth import auth_bp
    from routes.tickets import tickets_bp
    from routes.realtime import realtime_bp
    from routes.bot import bot_bp
    from routes.cards import cards_bp
    from routes.call_simple import call_simple_bp
    from routes.call_center import call_center_bp
    from routes.webrtc import webrtc_bp
    
    app.register_blueprint(customers_bp, url_prefix='/api')
    app.register_blueprint(customers_body_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(tickets_bp, url_prefix='/api')
    app.register_blueprint(realtime_bp, url_prefix='/api')
    app.register_blueprint(bot_bp, url_prefix='/api')
    app.register_blueprint(cards_bp, url_prefix='/api')
    app.register_blueprint(call_simple_bp, url_prefix='/api')
    app.register_blueprint(call_center_bp, url_prefix='/api')
    app.register_blueprint(webrtc_bp, url_prefix='/api')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'CRM API is running'}, 200
    
    @app.route('/softphone')
    def softphone():
        """Softphone test page"""
        return render_template('softphone.html')
    
    @app.route('/agent-dashboard')
    def agent_dashboard():
        """Agent dashboard test page"""
        return render_template('agent_dashboard.html')
    
    @app.route('/crm-demo')
    def crm_demo():
        """CRM system demo with call integration"""
        return render_template('crm_demo.html')
    
    # Store socketio instance in app for access from other modules
    app.socketio = socketio
    
    return app

if __name__ == '__main__':
    app = create_app()
    socketio = app.socketio
    socketio.run(app, debug=True, host='0.0.0.0', port=8000)
