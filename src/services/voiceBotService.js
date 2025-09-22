import { io } from 'socket.io-client';

class VoiceBotService {
  constructor() {
    this.socket = null;
    this.currentCall = null;
    this.callStatus = 'idle'; // idle, calling, ringing, connected, ended
    this.callbacks = {};
    this.isConnected = false;
    this.config = {
      serverUrl: 'http://localhost:8000',
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    };
  }

  // Initialize WebSocket connection
  connect() {
    if (this.socket && this.socket.connected) {
      console.log('🔌 Already connected to VoiceBot server');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.serverUrl, {
          transports: ['websocket', 'polling'],
          autoConnect: true,
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: this.config.reconnectionAttempts,
          reconnectionDelay: this.config.reconnectionDelay,
          timeout: this.config.timeout
        });

        this.setupSocketEvents();

        // Wait for connection
        this.socket.on('connect', () => {
          console.log('✅ Connected to VoiceBot server:', this.socket.id);
          this.isConnected = true;
          this.trigger('connected', { socketId: this.socket.id });
          resolve(this.socket);
        });

        // Handle connection errors
        this.socket.on('connect_error', (error) => {
          console.error('🚨 VoiceBot connection failed:', error);
          this.isConnected = false;
          this.trigger('connectionError', { error: error.message });
          reject(error);
        });

      } catch (error) {
        console.error('🚨 Failed to initialize VoiceBot connection:', error);
        reject(error);
      }
    });
  }

  // Setup all socket event listeners
  setupSocketEvents() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('❌ VoiceBot disconnected:', reason);
      this.isConnected = false;
      this.trigger('disconnected', { reason });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 VoiceBot reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.trigger('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🚨 VoiceBot reconnection failed:', error);
      this.trigger('reconnectionError', { error: error.message });
    });

    // Call lifecycle events
    this.socket.on('call_initiated', (data) => {
      console.log('📞 Call initiated:', data);
      this.currentCall = data;
      this.callStatus = data.status || 'calling';
      this.trigger('callInitiated', data);
    });

    this.socket.on('call_queued', (data) => {
      console.log('⏳ Call queued:', data);
      this.callStatus = 'queued';
      this.currentCall = { ...this.currentCall, ...data };
      this.trigger('callQueued', data);
    });

    this.socket.on('call_connected', (data) => {
      console.log('✅ Call connected:', data);
      this.callStatus = 'connected';
      this.currentCall = { ...this.currentCall, ...data };
      this.trigger('callConnected', data);
    });

    this.socket.on('call_ended', (data) => {
      console.log('📴 Call ended:', data);
      this.callStatus = 'idle';
      const endedCall = { ...this.currentCall, ...data };
      this.currentCall = null;
      this.trigger('callEnded', endedCall);
    });

    this.socket.on('call_failed', (data) => {
      console.log('❌ Call failed:', data);
      this.callStatus = 'idle';
      const failedCall = { ...this.currentCall, ...data };
      this.currentCall = null;
      this.trigger('callFailed', failedCall);
    });

    this.socket.on('call_transfer', (data) => {
      console.log('🔄 Call transferred:', data);
      this.currentCall = { ...this.currentCall, ...data };
      this.trigger('callTransferred', data);
    });

    this.socket.on('call_hold', (data) => {
      console.log('⏸️ Call on hold:', data);
      this.callStatus = 'on-hold';
      this.trigger('callOnHold', data);
    });

    this.socket.on('call_resume', (data) => {
      console.log('▶️ Call resumed:', data);
      this.callStatus = 'connected';
      this.trigger('callResumed', data);
    });

    // Error handling
    this.socket.on('error', (data) => {
      console.error('🚨 VoiceBot error:', data);
      this.trigger('error', data);
    });

    // Queue updates
    this.socket.on('queue_update', (data) => {
      console.log('📊 Queue update:', data);
      this.trigger('queueUpdate', data);
    });

    // Agent status updates
    this.socket.on('agent_status_update', (data) => {
      console.log('👤 Agent status update:', data);
      this.trigger('agentStatusUpdate', data);
    });
  }

  // Event subscription system
  on(event, callback) {
    this.callbacks[event] = callback;
  }

  off(event) {
    delete this.callbacks[event];
  }

  trigger(event, data) {
    if (this.callbacks[event]) {
      try {
        this.callbacks[event](data);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    }
  }

  // Make a call to VoiceBot
  async makeCall(callerNumber, calledNumber = '1900', options = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to VoiceBot server');
    }

    if (this.callStatus !== 'idle') {
      throw new Error('Cannot make call: Another call in progress');
    }

    console.log(`📞 Making call from ${callerNumber} to ${calledNumber}`);
    this.callStatus = 'calling';

    const callData = {
      callerNumber: callerNumber,
      calledNumber: calledNumber,
      timestamp: new Date().toISOString(),
      customerInfo: options.customerInfo || null,
      priority: options.priority || 'normal',
      ...options
    };

    this.socket.emit('make_call', callData);
    this.trigger('callStarted', callData);

    return callData;
  }

  // End current call
  async endCall(reason = 'caller_hangup') {
    if (!this.currentCall) {
      console.log('❌ No active call to end');
      return false;
    }

    if (!this.isConnected) {
      throw new Error('Not connected to VoiceBot server');
    }

    console.log('📴 Ending call:', this.currentCall.callId);

    const endData = {
      callId: this.currentCall.callId,
      endedBy: 'caller',
      reason: reason,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('end_call', endData);
    this.trigger('callEndRequested', endData);

    return true;
  }

  // Hold/Resume call
  async holdCall() {
    if (!this.currentCall || this.callStatus !== 'connected') {
      throw new Error('No active call to hold');
    }

    this.socket.emit('hold_call', {
      callId: this.currentCall.callId,
      timestamp: new Date().toISOString()
    });
  }

  async resumeCall() {
    if (!this.currentCall || this.callStatus !== 'on-hold') {
      throw new Error('No call on hold to resume');
    }

    this.socket.emit('resume_call', {
      callId: this.currentCall.callId,
      timestamp: new Date().toISOString()
    });
  }

  // Send DTMF tones
  async sendDTMF(tone) {
    if (!this.currentCall || this.callStatus !== 'connected') {
      throw new Error('No active call to send DTMF');
    }

    this.socket.emit('send_dtmf', {
      callId: this.currentCall.callId,
      tone: tone,
      timestamp: new Date().toISOString()
    });

    this.trigger('dtmfSent', { tone });
  }

  // Transfer call
  async transferCall(targetNumber, transferType = 'blind') {
    if (!this.currentCall) {
      throw new Error('No active call to transfer');
    }

    this.socket.emit('transfer_call', {
      callId: this.currentCall.callId,
      targetNumber: targetNumber,
      transferType: transferType,
      timestamp: new Date().toISOString()
    });
  }

  // Get current call status
  getStatus() {
    return {
      status: this.callStatus,
      currentCall: this.currentCall,
      connected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }

  // Get call history
  async getCallHistory(limit = 20) {
    if (!this.isConnected) {
      throw new Error('Not connected to VoiceBot server');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('get_call_history', { limit });
      
      this.socket.once('call_history_response', (data) => {
        resolve(data);
      });

      this.socket.once('call_history_error', (error) => {
        reject(new Error(error.message));
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);
    });
  }

  // Get queue status
  async getQueueStatus() {
    if (!this.isConnected) {
      throw new Error('Not connected to VoiceBot server');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('get_queue_status');
      
      this.socket.once('queue_status_response', (data) => {
        resolve(data);
      });

      this.socket.once('queue_status_error', (error) => {
        reject(new Error(error.message));
      });

      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);
    });
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from VoiceBot server');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.callStatus = 'idle';
    this.currentCall = null;
  }

  // Clean up all event listeners
  cleanup() {
    this.callbacks = {};
    this.disconnect();
  }

  // Utility method to format call duration
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected) {
      return { status: 'disconnected' };
    }

    return new Promise((resolve) => {
      this.socket.emit('health_check');
      
      this.socket.once('health_check_response', (data) => {
        resolve({ status: 'connected', ...data });
      });

      setTimeout(() => {
        resolve({ status: 'timeout' });
      }, 3000);
    });
  }
}

// Create singleton instance
const voiceBotService = new VoiceBotService();
export default voiceBotService;
