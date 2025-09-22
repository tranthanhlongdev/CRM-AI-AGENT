/**
 * CRM Call Integration Service
 * Kết nối WebSocket với VoiceBot backend để nhận cuộc gọi từ softphone
 */

import { io } from 'socket.io-client';

class CRMCallIntegration {
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'http://localhost:8000';
    this.crmUserId = options.crmUserId || 'crm_main';
    this.socket = null;
    this.currentCall = null;
    this.isConnected = false;
    this.eventListeners = new Map();
    
    // Callbacks
    this.onIncomingCall = options.onIncomingCall || this.defaultIncomingCallHandler;
    this.onCallAnswered = options.onCallAnswered || this.defaultCallAnsweredHandler;
    this.onCallEnded = options.onCallEnded || this.defaultCallEndedHandler;
    this.onAgentStatusUpdate = options.onAgentStatusUpdate || this.defaultAgentStatusHandler;
    this.onConnectionChange = options.onConnectionChange || this.defaultConnectionHandler;
    
    // Reconnection settings
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.reconnectTimer = null;
  }

  init() {
    console.log('🚀 Initializing CRM Call Integration...');
    
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      maxHttpBufferSize: 1e6,
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ CRM connected to call system');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.onConnectionChange(true);
      this.joinCallCenter();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ CRM disconnected from call system:', reason);
      this.isConnected = false;
      this.onConnectionChange(false);
      
      // Attempt to reconnect if disconnection was unexpected
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        console.log('📴 Server initiated disconnect');
      } else {
        // Client/network issue, attempt reconnect
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 CRM connection error:', error);
      this.isConnected = false;
      this.onConnectionChange(false);
      this.onConnectionError(error);
    });

    this.socket.on('joined_call_center', (data) => {
      console.log('🏢 CRM joined call center:', data);
      this.emit('joined', data);
    });

    // Call events
    this.socket.on('incoming_call_to_crm', (data) => {
      console.log('📞 Incoming call to CRM:', data);
      this.currentCall = data;
      this.onIncomingCall(data);
      this.emit('incomingCall', data);
    });

    this.socket.on('call_answered', (data) => {
      console.log('✅ Call answered:', data);
      this.onCallAnswered(data);
      this.emit('callAnswered', data);
    });

    this.socket.on('call_ended', (data) => {
      console.log('📴 Call ended:', data);
      this.currentCall = null;
      this.onCallEnded(data);
      this.emit('callEnded', data);
    });

    this.socket.on('agent_status_update', (data) => {
      console.log('👤 Agent status update:', data);
      this.onAgentStatusUpdate(data);
      this.emit('agentStatusUpdate', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('🚨 Socket error:', error);
      this.onError(error);
      this.emit('error', error);
    });

    // Additional call events
    this.socket.on('call_connected', (data) => {
      console.log('🔗 Call connected:', data);
      this.emit('callConnected', data);
    });

    this.socket.on('call_failed', (data) => {
      console.log('❌ Call failed:', data);
      this.currentCall = null;
      this.emit('callFailed', data);
    });

    this.socket.on('call_transferred', (data) => {
      console.log('📞➡️ Call transferred:', data);
      this.emit('callTransferred', data);
    });

    this.socket.on('call_on_hold', (data) => {
      console.log('⏸️ Call on hold:', data);
      this.emit('callOnHold', data);
    });

    this.socket.on('call_resumed', (data) => {
      console.log('▶️ Call resumed:', data);
      this.emit('callResumed', data);
    });
  }

  joinCallCenter() {
    if (!this.socket || !this.isConnected) return;

    const joinData = {
      userType: 'crm_system',
      userId: this.crmUserId,
      clientInfo: {
        platform: 'web',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };

    console.log('🔗 Joining call center with data:', joinData);
    this.socket.emit('join_call_center', joinData);
  }

  // Event emitter functionality
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
    this.eventListeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // Public methods
  answerCall(callId, agentId) {
    if (!this.isConnected) {
      console.error('❌ Not connected to call system');
      return false;
    }

    if (!callId) {
      console.error('❌ Missing callId for answer call');
      return false;
    }

    const answerData = {
      callId: callId,
      agentId: agentId,
      source: 'crm_system',
      timestamp: new Date().toISOString()
    };

    console.log(`📞 CRM answering call ${callId} with agent ${agentId}`, answerData);
    this.socket.emit('answer_call', answerData);
    return true;
  }

  rejectCall(callId, reason = 'crm_reject') {
    if (!this.isConnected) {
      console.error('❌ Not connected to call system');
      return false;
    }

    if (!callId) {
      console.error('❌ Missing callId for reject call');
      return false;
    }

    const rejectData = {
      callId: callId,
      endReason: reason,
      source: 'crm_system',
      timestamp: new Date().toISOString()
    };

    console.log(`❌ CRM rejecting call ${callId}`, rejectData);
    this.socket.emit('end_call', rejectData);
    this.currentCall = null;
    return true;
  }

  endCall(callId, reason = 'crm_end') {
    if (!this.isConnected) {
      console.error('❌ Not connected to call system');
      return false;
    }

    if (!callId) {
      console.error('❌ Missing callId for end call');
      return false;
    }

    const endData = {
      callId: callId,
      endReason: reason,
      source: 'crm_system',
      timestamp: new Date().toISOString()
    };

    console.log(`📴 CRM ending call ${callId}`, endData);
    this.socket.emit('end_call', endData);
    this.currentCall = null;
    return true;
  }

  transferCall(callId, targetAgentId, reason = 'crm_transfer') {
    if (!this.isConnected) {
      console.error('❌ Not connected to call system');
      return false;
    }

    const transferData = {
      callId: callId,
      targetAgentId: targetAgentId,
      reason: reason,
      source: 'crm_system',
      timestamp: new Date().toISOString()
    };

    console.log(`📞➡️ CRM transferring call ${callId} to agent ${targetAgentId}`, transferData);
    this.socket.emit('transfer_call', transferData);
    return true;
  }

  holdCall(callId) {
    if (!this.isConnected) {
      console.error('❌ Not connected to call system');
      return false;
    }

    const holdData = {
      callId: callId,
      source: 'crm_system',
      timestamp: new Date().toISOString()
    };

    console.log(`⏸️ CRM putting call ${callId} on hold`, holdData);
    this.socket.emit('hold_call', holdData);
    return true;
  }

  resumeCall(callId) {
    if (!this.isConnected) {
      console.error('❌ Not connected to call system');
      return false;
    }

    const resumeData = {
      callId: callId,
      source: 'crm_system',
      timestamp: new Date().toISOString()
    };

    console.log(`▶️ CRM resuming call ${callId}`, resumeData);
    this.socket.emit('resume_call', resumeData);
    return true;
  }

  // Status methods
  getCurrentCall() {
    return this.currentCall;
  }

  isCallSystemConnected() {
    return this.isConnected;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      serverUrl: this.serverUrl,
      userId: this.crmUserId,
      currentCall: this.currentCall,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Reconnection logic
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.socket && !this.isConnected) {
        this.socket.connect();
      }
    }, delay);
  }

  // Default handlers (có thể override)
  defaultIncomingCallHandler(callData) {
    console.log('📞 Default incoming call handler:', callData);
    // Browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification('Cuộc gọi đến CRM', {
        body: `Từ: ${callData.callerNumber || 'Số không xác định'}`,
        icon: '/phone-icon.png',
        tag: 'incoming-call',
        requireInteraction: true
      });
    }
  }

  defaultCallAnsweredHandler(data) {
    console.log('✅ Default call answered handler:', data);
  }

  defaultCallEndedHandler(data) {
    console.log('📴 Default call ended handler:', data);
  }

  defaultAgentStatusHandler(data) {
    console.log(`👤 Default agent status handler - ${data.agentName}: ${data.status}`);
  }

  defaultConnectionHandler(connected) {
    console.log(`🔌 Default connection handler - Status: ${connected ? 'Connected' : 'Disconnected'}`);
  }

  onError(error) {
    console.error('🚨 CRM Call Integration error:', error);
  }

  onConnectionError(error) {
    console.error('🚨 CRM Connection error:', error);
  }

  // Request permissions
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Cleanup
  disconnect() {
    console.log('🧹 Disconnecting CRM Call Integration...');
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.currentCall = null;
    this.eventListeners.clear();
  }

  // Update configuration
  updateConfig(options) {
    if (options.serverUrl && options.serverUrl !== this.serverUrl) {
      this.serverUrl = options.serverUrl;
      // Reconnect with new URL
      this.disconnect();
      setTimeout(() => this.init(), 1000);
    }

    if (options.crmUserId) {
      this.crmUserId = options.crmUserId;
    }

    // Update callbacks
    if (options.onIncomingCall) this.onIncomingCall = options.onIncomingCall;
    if (options.onCallAnswered) this.onCallAnswered = options.onCallAnswered;
    if (options.onCallEnded) this.onCallEnded = options.onCallEnded;
    if (options.onAgentStatusUpdate) this.onAgentStatusUpdate = options.onAgentStatusUpdate;
    if (options.onConnectionChange) this.onConnectionChange = options.onConnectionChange;
  }

  // Utility methods
  formatCallDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getCallStatusText(status) {
    const statusMap = {
      'ringing': 'Đang đổ chuông',
      'connected': 'Đã kết nối',
      'on_hold': 'Đang giữ máy',
      'transferring': 'Đang chuyển tiếp',
      'ended': 'Đã kết thúc',
      'failed': 'Thất bại'
    };
    return statusMap[status] || status;
  }
}

// Create a singleton instance
let crmCallIntegration = null;

export const createCRMCallIntegration = (options = {}) => {
  if (crmCallIntegration) {
    crmCallIntegration.disconnect();
  }
  crmCallIntegration = new CRMCallIntegration(options);
  return crmCallIntegration;
};

export const getCRMCallIntegration = () => {
  return crmCallIntegration;
};

export default CRMCallIntegration;

