/**
 * VoiceBot CRM Call Integration
 * WebSocket integration for receiving call events in CRM frontend
 * 
 * Usage:
 * 1. Include Socket.IO: <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script>
 * 2. Import this file or copy the code
 * 3. Initialize: const crmCall = new CRMCallIntegration(options);
 */

class CRMCallIntegration {
    constructor(options = {}) {
        this.serverUrl = options.serverUrl || 'http://localhost:8000';
        this.crmUserId = options.crmUserId || 'crm_main';
        this.socket = null;
        this.currentCall = null;
        this.isConnected = false;
        
        // Callbacks - can be overridden
        this.onIncomingCall = options.onIncomingCall || this.defaultIncomingCallHandler;
        this.onCallAnswered = options.onCallAnswered || this.defaultCallAnsweredHandler;
        this.onCallEnded = options.onCallEnded || this.defaultCallEndedHandler;
        this.onAgentStatusUpdate = options.onAgentStatusUpdate || this.defaultAgentStatusHandler;
        this.onConnectionChange = options.onConnectionChange || this.defaultConnectionHandler;
        this.onError = options.onError || this.defaultErrorHandler;
        
        this.init();
    }

    /**
     * Initialize WebSocket connection
     */
    init() {
        if (!window.io) {
            console.error('Socket.IO not loaded. Please include: https://cdn.socket.io/4.0.0/socket.io.min.js');
            return;
        }
        
        this.socket = io(this.serverUrl);
        this.setupEventListeners();
    }

    /**
     * Setup WebSocket event listeners
     */
    setupEventListeners() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ CRM connected to call system');
            this.isConnected = true;
            this.onConnectionChange(true);
            this.joinCallCenter();
        });

        this.socket.on('disconnect', () => {
            console.log('❌ CRM disconnected from call system');
            this.isConnected = false;
            this.onConnectionChange(false);
        });

        this.socket.on('joined_call_center', (data) => {
            console.log('🏢 CRM joined call center:', data);
        });

        // Call events
        this.socket.on('incoming_call_to_crm', (data) => {
            console.log('📞 Incoming call to CRM:', data);
            this.currentCall = data;
            this.onIncomingCall(data);
        });

        this.socket.on('call_answered', (data) => {
            console.log('✅ Call answered:', data);
            this.onCallAnswered(data);
        });

        this.socket.on('call_ended', (data) => {
            console.log('📴 Call ended:', data);
            this.currentCall = null;
            this.onCallEnded(data);
        });

        this.socket.on('agent_status_update', (data) => {
            console.log('👤 Agent status update:', data);
            this.onAgentStatusUpdate(data);
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.onError(error);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.isConnected = false;
            this.onConnectionChange(false);
            this.onError(error);
        });
    }

    /**
     * Join call center as CRM system
     */
    joinCallCenter() {
        this.socket.emit('join_call_center', {
            userType: 'crm_system',
            userId: this.crmUserId,
            clientInfo: {
                platform: 'web',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            }
        });
    }

    /**
     * Answer call from CRM
     * @param {string} callId - Call ID
     * @param {number} agentId - Agent ID to assign
     * @returns {boolean} Success status
     */
    answerCall(callId, agentId) {
        if (!this.isConnected) {
            console.error('Not connected to call system');
            return false;
        }

        if (!callId || !agentId) {
            console.error('Missing callId or agentId');
            return false;
        }

        this.socket.emit('answer_call', {
            callId: callId,
            agentId: parseInt(agentId),
            source: 'crm_system'
        });

        console.log(`📞 CRM answering call ${callId} with agent ${agentId}`);
        return true;
    }

    /**
     * Reject call from CRM
     * @param {string} callId - Call ID
     * @param {string} reason - Rejection reason
     * @returns {boolean} Success status
     */
    rejectCall(callId, reason = 'crm_reject') {
        if (!this.isConnected) {
            console.error('Not connected to call system');
            return false;
        }

        if (!callId) {
            console.error('Missing callId');
            return false;
        }

        this.socket.emit('end_call', {
            callId: callId,
            endReason: reason,
            source: 'crm_system'
        });

        console.log(`❌ CRM rejecting call ${callId}`);
        return true;
    }

    /**
     * Get current incoming call
     * @returns {object|null} Current call data
     */
    getCurrentCall() {
        return this.currentCall;
    }

    /**
     * Check if connected to call system
     * @returns {boolean} Connection status
     */
    isCallSystemConnected() {
        return this.isConnected;
    }

    /**
     * Load customer information by phone number
     * @param {string} phoneNumber - Customer phone number
     * @returns {Promise<object|null>} Customer data
     */
    async loadCustomerInfo(phoneNumber) {
        try {
            const response = await fetch(`${this.serverUrl}/api/customers/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    exactMatch: true
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.data.customers.length > 0) {
                return result.data.customers[0];
            }
            
            return null;
        } catch (error) {
            console.error('Error loading customer info:', error);
            return null;
        }
    }

    /**
     * Load available agents
     * @returns {Promise<array>} Available agents list
     */
    async loadAvailableAgents() {
        try {
            const response = await fetch(`${this.serverUrl}/api/agents/available`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            }
            
            return [];
        } catch (error) {
            console.error('Error loading agents:', error);
            return [];
        }
    }

    /**
     * Load call center statistics
     * @returns {Promise<object>} Call center stats
     */
    async loadCallStats() {
        try {
            const response = await fetch(`${this.serverUrl}/api/call-center/status`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            }
            
            return null;
        } catch (error) {
            console.error('Error loading call stats:', error);
            return null;
        }
    }

    // Default event handlers (can be overridden)
    defaultIncomingCallHandler(callData) {
        alert(`📞 Cuộc gọi đến từ: ${callData.callerNumber}`);
        console.log('Incoming call data:', callData);
    }

    defaultCallAnsweredHandler(data) {
        console.log('✅ Call answered by agent:', data);
    }

    defaultCallEndedHandler(data) {
        console.log('📴 Call ended:', data);
    }

    defaultAgentStatusHandler(data) {
        console.log(`👤 Agent ${data.agentName} status: ${data.status}`);
    }

    defaultConnectionHandler(connected) {
        console.log(`🔌 Connection status: ${connected ? 'Connected' : 'Disconnected'}`);
    }

    defaultErrorHandler(error) {
        console.error('❌ CRM Call Integration Error:', error);
    }

    /**
     * Disconnect from call system
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
            this.currentCall = null;
        }
    }

    /**
     * Reconnect to call system
     */
    reconnect() {
        if (this.socket) {
            this.socket.connect();
        }
    }
}

// Helper functions for UI integration
class CRMCallUI {
    constructor(crmCallIntegration) {
        this.crmCall = crmCallIntegration;
        this.setupUI();
    }

    setupUI() {
        this.createIncomingCallModal();
        this.createConnectionStatus();
        this.setupNotifications();
    }

    createIncomingCallModal() {
        if (document.getElementById('crmCallModal')) return;

        const modal = document.createElement('div');
        modal.id = 'crmCallModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 9999;
            display: none;
            justify-content: center;
            align-items: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
                padding: 30px;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                max-width: 500px;
                width: 90%;
                color: white;
                text-align: center;
                animation: crmCallPopup 0.3s ease-out;
            ">
                <div style="font-size: 3em; margin-bottom: 20px;">📞</div>
                <h2 style="margin: 0 0 20px 0;">Cuộc gọi đến</h2>
                
                <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px; margin: 20px 0; text-align: left;">
                    <p><strong>📱 Số điện thoại:</strong> <span id="crmCallerNumber">-</span></p>
                    <p><strong>🆔 Call ID:</strong> <span id="crmCallId">-</span></p>
                    <p><strong>👤 Agent:</strong> <span id="crmAssignedAgent">-</span></p>
                    <p><strong>⏰ Thời gian:</strong> <span id="crmCallTime">-</span></p>
                </div>
                
                <div id="crmCustomerInfo" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin: 15px 0; text-align: left;">
                    <!-- Customer info will be populated here -->
                </div>
                
                <div style="margin: 25px 0;">
                    <select id="crmAgentSelect" style="width: 100%; padding: 12px; border: none; border-radius: 8px; font-size: 1em; margin-bottom: 15px;">
                        <option value="">Chọn Agent...</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center;">
                    <button id="crmAnswerBtn" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 50px;
                        font-size: 1.1em;
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">📞 Trả lời</button>
                    
                    <button id="crmRejectBtn" style="
                        background: #f44336;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 50px;
                        font-size: 1.1em;
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">❌ Từ chối</button>
                </div>
            </div>
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes crmCallPopup {
                from { transform: scale(0.8) rotate(-5deg); opacity: 0; }
                to { transform: scale(1) rotate(0deg); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Setup event listeners
        document.getElementById('crmAnswerBtn').onclick = () => this.answerCall();
        document.getElementById('crmRejectBtn').onclick = () => this.rejectCall();
    }

    createConnectionStatus() {
        if (document.getElementById('crmConnectionStatus')) return;

        const status = document.createElement('div');
        status.id = 'crmConnectionStatus';
        status.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            z-index: 1000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
        `;
        status.textContent = '🔴 Disconnected';
        status.style.background = '#f44336';
        status.style.color = 'white';

        document.body.appendChild(status);
    }

    async showIncomingCallModal(callData) {
        const modal = document.getElementById('crmCallModal');
        
        // Update call info
        document.getElementById('crmCallerNumber').textContent = callData.callerNumber;
        document.getElementById('crmCallId').textContent = callData.callId;
        document.getElementById('crmAssignedAgent').textContent = 
            callData.assignedAgent ? callData.assignedAgent.fullName : 'Chưa assign';
        document.getElementById('crmCallTime').textContent = new Date().toLocaleTimeString();
        
        // Load and display customer info
        let customerInfo = callData.customerInfo;
        if (!customerInfo) {
            customerInfo = await this.crmCall.loadCustomerInfo(callData.callerNumber);
        }
        
        const customerInfoEl = document.getElementById('crmCustomerInfo');
        if (customerInfo) {
            customerInfoEl.innerHTML = `
                <h4 style="margin: 0 0 10px 0;">💼 Thông tin khách hàng:</h4>
                <p style="margin: 5px 0;"><strong>Tên:</strong> ${customerInfo.fullName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${customerInfo.email || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>CIF:</strong> ${customerInfo.cif || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${customerInfo.address || 'N/A'}</p>
            `;
        } else {
            customerInfoEl.innerHTML = `
                <h4 style="margin: 0 0 10px 0;">🆕 Khách hàng mới:</h4>
                <p>Không tìm thấy trong hệ thống CRM</p>
            `;
        }
        
        // Load available agents
        await this.updateAgentSelect();
        
        // Show modal
        modal.style.display = 'flex';
        
        // Show browser notification
        this.showBrowserNotification(callData);
    }

    hideIncomingCallModal() {
        const modal = document.getElementById('crmCallModal');
        modal.style.display = 'none';
    }

    async updateAgentSelect() {
        const select = document.getElementById('crmAgentSelect');
        select.innerHTML = '<option value="">Chọn Agent...</option>';
        
        const agents = await this.crmCall.loadAvailableAgents();
        agents.forEach(agent => {
            if (agent.status === 'available') {
                const option = document.createElement('option');
                option.value = agent.id;
                option.textContent = `${agent.fullName} (${agent.status})`;
                select.appendChild(option);
            }
        });
        
        // Pre-select assigned agent
        const currentCall = this.crmCall.getCurrentCall();
        if (currentCall && currentCall.assignedAgent) {
            select.value = currentCall.assignedAgent.id;
        }
    }

    updateConnectionStatus(connected) {
        const status = document.getElementById('crmConnectionStatus');
        if (connected) {
            status.textContent = '🟢 Connected';
            status.style.background = '#4CAF50';
        } else {
            status.textContent = '🔴 Disconnected';
            status.style.background = '#f44336';
        }
    }

    answerCall() {
        const currentCall = this.crmCall.getCurrentCall();
        if (!currentCall) return;
        
        const selectedAgentId = document.getElementById('crmAgentSelect').value;
        const agentId = selectedAgentId || (currentCall.assignedAgent ? currentCall.assignedAgent.id : null);
        
        if (!agentId) {
            alert('Vui lòng chọn agent');
            return;
        }
        
        this.crmCall.answerCall(currentCall.callId, parseInt(agentId));
    }

    rejectCall() {
        const currentCall = this.crmCall.getCurrentCall();
        if (!currentCall) return;
        
        this.crmCall.rejectCall(currentCall.callId, 'crm_user_reject');
    }

    setupNotifications() {
        // Request notification permission
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    showBrowserNotification(callData) {
        if (Notification.permission === 'granted') {
            new Notification('📞 Cuộc gọi đến CRM', {
                body: `Từ: ${callData.callerNumber}\nAgent: ${callData.assignedAgent ? callData.assignedAgent.fullName : 'Chưa assign'}`,
                icon: '/phone-icon.png',
                requireInteraction: true,
                tag: callData.callId
            });
        }
    }
}

// Quick setup function
function setupCRMCallIntegration(options = {}) {
    const crmCall = new CRMCallIntegration({
        serverUrl: options.serverUrl || 'http://localhost:8000',
        crmUserId: options.crmUserId || 'crm_frontend',
        
        onIncomingCall: function(callData) {
            if (window.crmCallUI) {
                window.crmCallUI.showIncomingCallModal(callData);
            }
        },
        
        onCallAnswered: function(data) {
            if (window.crmCallUI) {
                window.crmCallUI.hideIncomingCallModal();
            }
            console.log('✅ Call answered:', data);
        },
        
        onCallEnded: function(data) {
            if (window.crmCallUI) {
                window.crmCallUI.hideIncomingCallModal();
            }
            console.log('📴 Call ended:', data);
        },
        
        onConnectionChange: function(connected) {
            if (window.crmCallUI) {
                window.crmCallUI.updateConnectionStatus(connected);
            }
            console.log(`Connection: ${connected ? 'Connected' : 'Disconnected'}`);
        },
        
        ...options
    });
    
    // Create UI helper
    window.crmCallUI = new CRMCallUI(crmCall);
    window.crmCall = crmCall;
    
    return crmCall;
}

// Auto-setup if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.setupCRMCallIntegration = setupCRMCallIntegration;
    });
} else {
    window.setupCRMCallIntegration = setupCRMCallIntegration;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CRMCallIntegration, CRMCallUI, setupCRMCallIntegration };
}
