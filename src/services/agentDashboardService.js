import { io } from 'socket.io-client';

class AgentDashboardService {
  constructor() {
    this.socket = null;
    this.agentInfo = null;
    this.agentStatus = 'offline';
    this.currentCall = null;
    this.incomingCall = null;
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
  async connect(agentInfo) {
    if (this.socket && this.socket.connected) {
      console.log('🔌 Already connected to agent dashboard');
      return Promise.resolve();
    }

    this.agentInfo = agentInfo;

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

        this.socket.on('connect', () => {
          console.log('✅ Agent dashboard connected:', this.socket.id);
          this.isConnected = true;
          this.trigger('connected', { socketId: this.socket.id });
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('🚨 Agent dashboard connection failed:', error);
          this.isConnected = false;
          this.trigger('connectionError', { error: error.message });
          reject(error);
        });

      } catch (error) {
        console.error('🚨 Failed to initialize agent dashboard:', error);
        reject(error);
      }
    });
  }

  // Setup socket event listeners
  setupSocketEvents() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Agent dashboard disconnected:', reason);
      this.isConnected = false;
      this.trigger('disconnected', { reason });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Agent dashboard reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.trigger('reconnected', { attemptNumber });
      // Re-login after reconnection
      if (this.agentInfo) {
        this.login();
      }
    });

    // Agent authentication events
    this.socket.on('agent_login_success', (data) => {
      console.log('👤 Agent login success:', data);
      this.agentStatus = data.status || 'available';
      this.joinCallCenter();
      this.trigger('loginSuccess', data);
    });

    this.socket.on('agent_login_failed', (data) => {
      console.error('❌ Agent login failed:', data);
      this.trigger('loginFailed', data);
    });

    // Call handling events
    this.socket.on('incoming_call', (data) => {
      console.log('📞 Incoming call:', data);
      this.incomingCall = data;
      this.trigger('incomingCall', data);
    });

    this.socket.on('call_answered', (data) => {
      console.log('✅ Call answered:', data);
      this.currentCall = data;
      this.incomingCall = null;
      this.agentStatus = 'on_call';
      this.trigger('callAnswered', data);
    });

    this.socket.on('call_ended', (data) => {
      console.log('📴 Call ended:', data);
      const endedCall = { ...this.currentCall, ...data };
      this.currentCall = null;
      this.agentStatus = 'available';
      this.trigger('callEnded', endedCall);
    });

    this.socket.on('call_transferred_to_agent', (data) => {
      console.log('🔄 Call transferred to agent:', data);
      this.currentCall = data;
      this.agentStatus = 'on_call';
      this.trigger('callTransferred', data);
    });

    this.socket.on('call_hold', (data) => {
      console.log('⏸️ Call on hold:', data);
      this.trigger('callOnHold', data);
    });

    this.socket.on('call_resume', (data) => {
      console.log('▶️ Call resumed:', data);
      this.trigger('callResumed', data);
    });

    // Status and dashboard events
    this.socket.on('agent_status_update', (data) => {
      console.log('🔄 Agent status update:', data);
      if (data.agentId === this.agentInfo?.userId) {
        this.agentStatus = data.status;
      }
      this.trigger('agentStatusUpdate', data);
    });

    this.socket.on('status_change_success', (data) => {
      console.log('✅ Status changed:', data);
      this.agentStatus = data.newStatus;
      this.trigger('statusChanged', data);
    });

    this.socket.on('status_change_failed', (data) => {
      console.error('❌ Status change failed:', data);
      this.trigger('statusChangeFailed', data);
    });

    // Dashboard data events
    this.socket.on('dashboard_data', (data) => {
      console.log('📈 Dashboard data received');
      this.trigger('dashboardData', data);
    });

    this.socket.on('call_update', (data) => {
      console.log('📊 Call update:', data);
      this.trigger('callUpdate', data);
    });

    this.socket.on('queue_update', (data) => {
      console.log('📊 Queue update:', data);
      this.trigger('queueUpdate', data);
    });

    this.socket.on('real_time_stats', (data) => {
      console.log('📊 Real-time stats:', data);
      this.trigger('realTimeStats', data);
    });

    // Error handling
    this.socket.on('error', (data) => {
      console.error('🚨 Agent dashboard error:', data);
      this.trigger('error', data);
    });

    // Notification events
    this.socket.on('notification', (data) => {
      console.log('🔔 Notification:', data);
      this.trigger('notification', data);
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

  // Agent login
  async login() {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    if (!this.agentInfo) {
      throw new Error('Agent info not provided');
    }

    console.log('👤 Logging in agent:', this.agentInfo.username);
    
    this.socket.emit('agent_login', {
      userId: this.agentInfo.userId,
      username: this.agentInfo.username,
      fullName: this.agentInfo.fullName,
      email: this.agentInfo.email || null,
      phoneNumber: this.agentInfo.phoneNumber || null,
      department: this.agentInfo.department || null,
      skills: this.agentInfo.skills || [],
      timestamp: new Date().toISOString()
    });
  }

  // Join call center room for real-time updates
  joinCallCenter() {
    if (!this.isConnected) return;
    
    console.log('🏢 Joining call center room');
    this.socket.emit('join_call_center', {
      agentId: this.agentInfo.userId,
      timestamp: new Date().toISOString()
    });
    
    // Request initial dashboard data
    this.getDashboardData();
  }

  // Change agent status
  async changeStatus(newStatus) {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    // Validate status
    const validStatuses = ['available', 'busy', 'away', 'offline'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    console.log(`🔄 Changing status from ${this.agentStatus} to: ${newStatus}`);
    
    this.socket.emit('change_agent_status', {
      userId: this.agentInfo.userId,
      status: newStatus,
      previousStatus: this.agentStatus,
      timestamp: new Date().toISOString()
    });
  }

  // Answer incoming call
  async answerCall(callId = null) {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    const targetCallId = callId || this.incomingCall?.callId;
    if (!targetCallId) {
      throw new Error('No incoming call to answer');
    }

    console.log(`✅ Answering call: ${targetCallId}`);
    
    this.socket.emit('answer_call', {
      callId: targetCallId,
      agentId: this.agentInfo.userId,
      timestamp: new Date().toISOString()
    });
  }

  // Reject incoming call
  async rejectCall(callId = null, reason = 'agent_rejected') {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    const targetCallId = callId || this.incomingCall?.callId;
    if (!targetCallId) {
      throw new Error('No incoming call to reject');
    }

    console.log(`❌ Rejecting call: ${targetCallId}`);
    
    this.socket.emit('reject_call', {
      callId: targetCallId,
      agentId: this.agentInfo.userId,
      reason: reason,
      timestamp: new Date().toISOString()
    });

    this.incomingCall = null;
  }

  // End current call
  async endCall(reason = 'agent_hangup') {
    if (!this.currentCall) {
      console.log('❌ No active call to end');
      return false;
    }

    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    console.log(`📴 Ending call: ${this.currentCall.callId}`);
    
    this.socket.emit('end_call', {
      callId: this.currentCall.callId,
      endedBy: 'agent',
      agentId: this.agentInfo.userId,
      reason: reason,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  // Hold/Resume call
  async holdCall() {
    if (!this.currentCall) {
      throw new Error('No active call to hold');
    }

    this.socket.emit('hold_call', {
      callId: this.currentCall.callId,
      agentId: this.agentInfo.userId,
      timestamp: new Date().toISOString()
    });
  }

  async resumeCall() {
    if (!this.currentCall) {
      throw new Error('No call to resume');
    }

    this.socket.emit('resume_call', {
      callId: this.currentCall.callId,
      agentId: this.agentInfo.userId,
      timestamp: new Date().toISOString()
    });
  }

  // Transfer call
  async transferCall(targetAgentId, transferType = 'blind') {
    if (!this.currentCall) {
      throw new Error('No active call to transfer');
    }

    this.socket.emit('transfer_call', {
      callId: this.currentCall.callId,
      fromAgentId: this.agentInfo.userId,
      targetAgentId: targetAgentId,
      transferType: transferType,
      timestamp: new Date().toISOString()
    });
  }

  // Send DTMF
  async sendDTMF(tone) {
    if (!this.currentCall) {
      throw new Error('No active call to send DTMF');
    }

    this.socket.emit('send_dtmf', {
      callId: this.currentCall.callId,
      agentId: this.agentInfo.userId,
      tone: tone,
      timestamp: new Date().toISOString()
    });
  }

  // Make outbound call
  async makeOutboundCall(targetNumber, customerInfo = null) {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    if (this.currentCall) {
      throw new Error('Agent already on a call');
    }

    this.socket.emit('make_outbound_call', {
      agentId: this.agentInfo.userId,
      targetNumber: targetNumber,
      customerInfo: customerInfo,
      timestamp: new Date().toISOString()
    });
  }

  // Get dashboard data
  async getDashboardData() {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    console.log('📊 Requesting dashboard data');
    this.socket.emit('get_dashboard_data', {
      agentId: this.agentInfo.userId,
      timestamp: new Date().toISOString()
    });
  }

  // Get agent performance data
  async getAgentPerformance(period = 'today') {
    if (!this.isConnected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('get_agent_performance', {
        agentId: this.agentInfo.userId,
        period: period
      });

      this.socket.once('agent_performance_response', (data) => {
        resolve(data);
      });

      this.socket.once('agent_performance_error', (error) => {
        reject(new Error(error.message));
      });

      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);
    });
  }

  // Get current state
  getState() {
    return {
      agentInfo: this.agentInfo,
      status: this.agentStatus,
      currentCall: this.currentCall,
      incomingCall: this.incomingCall,
      connected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }

  // Logout agent
  async logout() {
    if (this.agentInfo) {
      await this.changeStatus('offline');
    }
    
    if (this.socket) {
      this.socket.emit('agent_logout', {
        userId: this.agentInfo?.userId,
        timestamp: new Date().toISOString()
      });
    }
    
    this.disconnect();
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting agent dashboard');
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.agentStatus = 'offline';
    this.currentCall = null;
    this.incomingCall = null;
  }

  // Clean up
  cleanup() {
    this.callbacks = {};
    this.disconnect();
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected) {
      return { status: 'disconnected' };
    }

    return new Promise((resolve) => {
      this.socket.emit('agent_health_check', {
        agentId: this.agentInfo?.userId
      });
      
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
const agentDashboardService = new AgentDashboardService();
export default agentDashboardService;
