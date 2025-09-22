import { io } from 'socket.io-client';

class CallService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.agentId = null;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  // Initialize connection for CRM agent
  async initializeForAgent(agentInfo) {
    try {
      this.agentId = agentInfo.id || agentInfo.userId || 'crm_agent';
      
      console.log('🔌 Initializing call service for agent:', this.agentId, agentInfo);
      
      // Connect to WebSocket server
      this.socket = io('http://localhost:8000', {
        transports: ['websocket'],
        autoConnect: true,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 10000,
        query: {
          type: 'agent',
          agentId: this.agentId,
          source: 'crm',
          username: agentInfo.username || 'unknown'
        }
      });

      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('❌ Call service connection timeout');
          reject(new Error('Connection timeout after 10 seconds'));
        }, 10000);

        this.socket.once('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('✅ Call service connected for agent:', this.agentId);
          
          // Register as available agent
          this.socket.emit('agent:register', {
            agentId: this.agentId,
            username: agentInfo.username,
            fullName: agentInfo.fullName,
            status: 'available',
            capabilities: ['voice', 'chat'],
            source: 'crm',
            type: agentInfo.type || 'crm_agent'
          });
          
          console.log('📝 Agent registered with server');
          resolve();
        });

        this.socket.once('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ Call service connection failed:', error);
          this.isConnected = false;
          reject(error);
        });

        this.socket.once('disconnect', (reason) => {
          clearTimeout(timeout);
          console.log('❌ Call service disconnected during initialization:', reason);
          this.isConnected = false;
        });
      });
    } catch (error) {
      console.error('❌ Failed to initialize call service:', error);
      this.isConnected = false;
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✅ Call service connected');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('❌ Call service disconnected');
      this.emit('disconnected');
      this.attemptReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Call service connection error:', error);
      this.emit('connectionError', { error: error.message });
    });

    // Incoming call events
    this.socket.on('call:incoming', (data) => {
      console.log('📞 Incoming call received in CallService:', data);
      this.emit('incomingCall', data);
    });

    this.socket.on('call:connected', (data) => {
      console.log('✅ Call connected in CallService:', data);
      this.emit('callConnected', data);
    });

    this.socket.on('call:ended', (data) => {
      console.log('📴 Call ended in CallService:', data);
      this.emit('callEnded', data);
    });

    this.socket.on('call:failed', (data) => {
      console.log('❌ Call failed in CallService:', data);
      this.emit('callFailed', data);
    });

    // Additional call events that might be sent from backend
    this.socket.on('incoming_call', (data) => {
      console.log('📞 Incoming call (legacy event) received:', data);
      this.emit('incomingCall', data);
    });

    this.socket.on('call_incoming', (data) => {
      console.log('📞 Call incoming (alt event) received:', data);
      this.emit('incomingCall', data);
    });

    // Generic message/event listener for debugging
    this.socket.onAny((eventName, ...args) => {
      if (!eventName.startsWith('ping') && !eventName.startsWith('pong')) {
        console.log('🔍 WebSocket event received:', eventName, args);
      }
    });

    // Agent status events
    this.socket.on('agent:statusUpdated', (data) => {
      console.log('👤 Agent status updated:', data);
      this.emit('agentStatusUpdated', data);
    });

    // Error handling
    this.socket.on('error', (data) => {
      console.error('🚨 Call service error:', data);
      this.emit('error', data);
    });
  }

  // Accept incoming call
  acceptCall(callId) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Call service not connected');
    }

    console.log('📞 Accepting call:', callId);
    this.socket.emit('call:accept', {
      callId: callId,
      agentId: this.agentId
    });
  }

  // Decline incoming call
  declineCall(callId, reason = 'declined') {
    if (!this.socket || !this.isConnected) {
      throw new Error('Call service not connected');
    }

    console.log('📞 Declining call:', callId);
    this.socket.emit('call:decline', {
      callId: callId,
      agentId: this.agentId,
      reason: reason
    });
  }

  // End active call
  endCall(callId) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Call service not connected');
    }

    console.log('📴 Ending call:', callId);
    this.socket.emit('call:end', {
      callId: callId,
      agentId: this.agentId
    });
  }

  // Update agent status
  updateAgentStatus(status) {
    if (!this.socket || !this.isConnected) {
      console.warn('Call service not connected, cannot update status');
      return;
    }

    console.log('👤 Updating agent status:', status);
    this.socket.emit('agent:updateStatus', {
      agentId: this.agentId,
      status: status
    });
  }

  // Send call notes or data
  sendCallData(callId, data) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Call service not connected');
    }

    this.socket.emit('call:data', {
      callId: callId,
      agentId: this.agentId,
      data: data
    });
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event);
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // Reconnection logic
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('reconnectFailed');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        this.socket.connect();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting call service...');
      
      // Update agent status to offline before disconnecting
      if (this.isConnected) {
        this.updateAgentStatus('offline');
      }
      
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.agentId = null;
    this.eventListeners.clear();
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      agentId: this.agentId,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Export singleton instance
export default new CallService();
