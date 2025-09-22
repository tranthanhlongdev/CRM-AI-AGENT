#!/usr/bin/env node

const { Server } = require('socket.io');
const http = require('http');
const url = require('url');

// Create HTTP server with REST API support
const server = http.createServer((req, res) => {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle REST API endpoints
  if (path === '/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      message: 'CRM API is running',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (path === '/api/realtime/agents' && method === 'GET') {
    const agentsList = Array.from(agents.values());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        agents: agentsList,
        total: agentsList.length,
        available: agentsList.filter(a => a.status === 'available').length
      }
    }));
    return;
  }

  if (path === '/api/realtime/call-stats' && method === 'GET') {
    const activeCalls = Array.from(calls.values()).filter(c => c.status === 'connected');
    const agentsList = Array.from(agents.values());
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        totalActiveCalls: activeCalls.length,
        totalQueue: queue.length,
        availableAgents: agentsList.filter(a => a.status === 'available').length,
        busyAgents: agentsList.filter(a => a.status === 'on_call').length,
        totalAgents: agentsList.length
      }
    }));
    return;
  }

  if (path === '/api/call/demo/agents' && method === 'GET') {
    // Return mock agents for demo
    const mockAgents = [
      {
        id: 'agent_1',
        username: 'agent01',
        fullName: 'Nguyễn Văn Agent',
        status: 'available',
        department: 'Call Center',
        phone: '+84901234567'
      },
      {
        id: 'agent_2', 
        username: 'agent02',
        fullName: 'Trần Thị Support',
        status: 'available',
        department: 'Customer Service',
        phone: '+84901234568'
      },
      {
        id: 'agent_3',
        username: 'agent03', 
        fullName: 'Lê Minh Help',
        status: 'busy',
        department: 'Technical Support',
        phone: '+84901234569'
      }
    ];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        agents: mockAgents,
        available: mockAgents.filter(a => a.status === 'available')
      }
    }));
    return;
  }

  if (path === '/api/call/demo/initiate' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const callId = 'AGENT_CALL_' + Date.now();
        
        console.log('📞 Demo agent call initiated:', data);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            callId,
            callerNumber: data.callerNumber,
            targetAgent: data.targetAgent,
            status: 'initiated',
            message: 'Agent call initiated successfully'
          }
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON body'
        }));
      }
    });
    return;
  }

  if (path === '/api/call/demo/status' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        service: 'VoiceBot Demo Server',
        status: 'running',
        agents: agents.size,
        calls: calls.size,
        queue: queue.length,
        uptime: process.uptime()
      }
    }));
    return;
  }

  // Default 404 response
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    success: false, 
    error: 'Endpoint not found',
    path: path,
    method: method
  }));
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active connections and calls
const agents = new Map();
const calls = new Map();
const queue = [];
const crmSystems = new Map(); // Store CRM system connections

console.log('🎧 Mock VoiceBot Server Starting...');

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Customer Events
  socket.on('make_call', (data) => {
    console.log('📞 Make call request:', data);
    
    const callId = 'CALL_' + Date.now();
    const call = {
      callId,
      callerNumber: data.callerNumber,
      calledNumber: data.calledNumber,
      customerInfo: data.customerInfo,
      status: 'initiated',
      startTime: new Date().toISOString(),
      socketId: socket.id
    };

    calls.set(callId, call);

    // Emit call initiated
    socket.emit('call_initiated', {
      callId,
      callerNumber: data.callerNumber,
      calledNumber: data.calledNumber,
      status: 'ringing',
      timestamp: new Date().toISOString()
    });

    // Check for available agents
    const availableAgents = Array.from(agents.values()).filter(a => a.status === 'available');
    
    if (availableAgents.length === 0) {
      // Add to queue
      const queuePosition = queue.length + 1;
      queue.push(call);
      
      setTimeout(() => {
        socket.emit('call_queued', {
          callId,
          queuePosition,
          estimatedWaitTime: queuePosition * 30,
          timestamp: new Date().toISOString()
        });
        console.log(`⏳ Call ${callId} queued at position ${queuePosition}`);
      }, 1000);

      // Simulate agent becoming available
      setTimeout(() => {
        const queueIndex = queue.findIndex(c => c.callId === callId);
        if (queueIndex !== -1) {
          queue.splice(queueIndex, 1);
          
          socket.emit('call_connected', {
            callId,
            agentInfo: {
              id: 'agent_mock',
              fullName: 'Mock Agent',
              username: 'agent01'
            },
            timestamp: new Date().toISOString()
          });
          
          call.status = 'connected';
          call.connectedTime = new Date().toISOString();
          console.log(`✅ Call ${callId} connected to mock agent`);
        }
      }, 5000);
    } else {
      // Direct connection
      setTimeout(() => {
        socket.emit('call_connected', {
          callId,
          agentInfo: availableAgents[0],
          timestamp: new Date().toISOString()
        });
        
        call.status = 'connected';
        call.connectedTime = new Date().toISOString();
        console.log(`✅ Call ${callId} connected directly`);
      }, 2000);
    }
  });

  socket.on('end_call', (data) => {
    console.log('📴 End call request:', data);
    
    const call = calls.get(data.callId);
    if (call) {
      const duration = call.connectedTime ? 
        Math.floor((Date.now() - new Date(call.connectedTime).getTime()) / 1000) : 0;
      
      socket.emit('call_ended', {
        callId: data.callId,
        duration,
        endReason: data.reason || 'caller_hangup',
        endedBy: data.endedBy || 'caller',
        timestamp: new Date().toISOString()
      });
      
      calls.delete(data.callId);
      console.log(`📴 Call ${data.callId} ended, duration: ${duration}s`);
    }
  });

  socket.on('send_dtmf', (data) => {
    console.log('📟 DTMF tone:', data);
    // Echo back DTMF confirmation
    socket.emit('dtmf_sent', {
      callId: data.callId,
      tone: data.tone,
      timestamp: new Date().toISOString()
    });
  });

  // Agent Events
  socket.on('agent_login', (data) => {
    console.log('👤 Agent login:', data);
    
    const agent = {
      id: data.userId,
      socketId: socket.id,
      username: data.username,
      fullName: data.fullName,
      status: 'available',
      loginTime: new Date().toISOString(),
      totalCallsHandled: 0,
      avgHandleTime: 0
    };
    
    agents.set(socket.id, agent);
    
    socket.emit('agent_login_success', {
      userId: data.userId,
      username: data.username,
      status: 'available',
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ Agent ${data.username} logged in`);
  });

  socket.on('change_agent_status', (data) => {
    console.log('🔄 Agent status change:', data);
    
    const agent = agents.get(socket.id);
    if (agent) {
      agent.status = data.status;
      
      socket.emit('status_change_success', {
        newStatus: data.status,
        previousStatus: data.previousStatus,
        timestamp: new Date().toISOString()
      });
      
      // Broadcast to all agents
      io.emit('agent_status_update', {
        agentId: agent.id,
        username: agent.username,
        status: data.status,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🔄 Agent ${agent.username} status: ${data.status}`);
    }
  });

  // CRM System Events
  socket.on('join_call_center', (data) => {
    console.log('🏢 Join call center request:', data);
    
    if (data && data.userType === 'crm_system') {
      // CRM system joining
      const crmSystem = {
        id: data.userId,
        socketId: socket.id,
        userType: 'crm_system',
        clientInfo: data.clientInfo,
        joinTime: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      crmSystems.set(socket.id, crmSystem);
      
      socket.emit('joined_call_center', {
        message: 'Joined call center as CRM system',
        userType: 'crm_system',
        userId: data.userId,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🏢 CRM system ${data.userId} joined call center`);
      
      // Send test incoming call after 5 seconds
      setTimeout(() => {
        sendTestIncomingCallToCRM(socket);
      }, 5000);
      
    } else {
      // Regular agent joining
      console.log('🏢 Agent joined call center');
      sendDashboardData(socket);
    }
  });

  socket.on('get_dashboard_data', () => {
    console.log('📊 Dashboard data requested');
    sendDashboardData(socket);
  });

  socket.on('answer_call', (data) => {
    console.log('✅ Answer call request:', data);
    
    const call = calls.get(data.callId);
    const agent = agents.get(socket.id);
    const crmSystem = crmSystems.get(socket.id);
    
    if (call) {
      call.status = 'connected';
      call.connectedTime = new Date().toISOString();
      
      if (agent) {
        // Agent answering call
        call.agentId = agent.id;
        agent.status = 'on_call';
        
        socket.emit('call_answered', {
          callId: data.callId,
          callerNumber: call.callerNumber,
          customer: call.customerInfo,
          agentId: agent.id,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Call ${data.callId} answered by agent ${agent.username}`);
        
      } else if (crmSystem) {
        // CRM system answering call
        call.agentId = data.agentId;
        call.source = 'crm_system';
        
        socket.emit('call_answered', {
          call: {
            callId: data.callId,
            callerNumber: call.callerNumber,
            customerInfo: call.customerInfo,
            status: 'connected',
            agentInfo: {
              id: data.agentId,
              source: 'crm_system'
            }
          },
          message: 'Cuộc gọi đã được kết nối',
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Call ${data.callId} answered by CRM system (Agent ${data.agentId})`);
        
        // Also notify all connected CRM systems
        for (const [socketId, crm] of crmSystems.entries()) {
          const crmSocket = io.sockets.sockets.get(socketId);
          if (crmSocket && socketId !== socket.id) {
            crmSocket.emit('call_answered', {
              call: {
                callId: data.callId,
                status: 'connected'
              },
              message: 'Cuộc gọi đã được chấp nhận bởi agent khác'
            });
          }
        }
      }
      
      // Notify customer
      const customerSocket = io.sockets.sockets.get(call.socketId);
      if (customerSocket) {
        customerSocket.emit('call_connected', {
          callId: data.callId,
          agentInfo: {
            id: call.agentId,
            fullName: agent?.fullName || 'CRM Agent',
            username: agent?.username || 'crm_agent'
          },
          timestamp: new Date().toISOString()
        });
      }
      
    } else {
      console.log(`❌ Call ${data.callId} not found for answer`);
    }
  });

  // Handle both reject_call and end_call from CRM
  socket.on('reject_call', (data) => {
    handleCallRejectOrEnd(data, 'rejected');
  });

  socket.on('end_call', (data) => {
    if (data.source === 'crm_system') {
      handleCallRejectOrEnd(data, 'ended');
    } else {
      // Original end_call logic for customers
      console.log('📴 End call request:', data);
      
      const call = calls.get(data.callId);
      if (call) {
        const duration = call.connectedTime ? 
          Math.floor((Date.now() - new Date(call.connectedTime).getTime()) / 1000) : 0;
        
        socket.emit('call_ended', {
          callId: data.callId,
          duration,
          endReason: data.reason || 'caller_hangup',
          endedBy: data.endedBy || 'caller',
          timestamp: new Date().toISOString()
        });
        
        calls.delete(data.callId);
        console.log(`📴 Call ${data.callId} ended, duration: ${duration}s`);
      }
    }
  });

  function handleCallRejectOrEnd(data, action) {
    console.log(`${action === 'rejected' ? '❌' : '📴'} CRM ${action} call:`, data);
    
    const call = calls.get(data.callId);
    if (call) {
      const duration = call.connectedTime ? 
        Math.floor((Date.now() - new Date(call.connectedTime).getTime()) / 1000) : 0;
      
      // Notify customer
      const customerSocket = io.sockets.sockets.get(call.socketId);
      if (customerSocket) {
        if (action === 'rejected') {
          customerSocket.emit('call_failed', {
            callId: data.callId,
            message: 'Call rejected by CRM agent',
            reason: data.endReason || 'agent_declined',
            timestamp: new Date().toISOString()
          });
        } else {
          customerSocket.emit('call_ended', {
            callId: data.callId,
            duration,
            endReason: data.endReason || 'agent_ended',
            endedBy: 'agent',
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Notify all CRM systems
      for (const [socketId, crm] of crmSystems.entries()) {
        const crmSocket = io.sockets.sockets.get(socketId);
        if (crmSocket) {
          crmSocket.emit('call_ended', {
            callId: data.callId,
            endReason: data.endReason || (action === 'rejected' ? 'crm_reject' : 'crm_end'),
            duration,
            message: `Cuộc gọi đã ${action === 'rejected' ? 'bị từ chối' : 'kết thúc'}`,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      calls.delete(data.callId);
      console.log(`${action === 'rejected' ? '❌' : '📴'} Call ${data.callId} ${action}, duration: ${duration}s`);
    }
  }

  socket.on('simulate_incoming_call', (data) => {
    console.log('📞 Simulating incoming call:', data);
    
    const agent = agents.get(socket.id);
    if (agent && agent.status === 'available') {
      socket.emit('incoming_call', {
        callId: data.callId || 'CALL_' + Date.now(),
        callerNumber: data.callerNumber || '+84987654321',
        customer: data.customer || {
          hoTen: 'Nguyễn Văn Test',
          cifNumber: 'CIF123456'
        },
        timestamp: new Date().toISOString()
      });
      
      console.log(`📞 Incoming call simulated for ${agent.username}`);
    }
  });

  socket.on('health_check', () => {
    socket.emit('health_check_response', {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    
    // Remove agent if exists
    const agent = agents.get(socket.id);
    if (agent) {
      agents.delete(socket.id);
      console.log(`👤 Agent ${agent.username} logged out`);
      
      // Broadcast agent status update
      io.emit('agent_status_update', {
        agentId: agent.id,
        username: agent.username,
        status: 'offline',
        timestamp: new Date().toISOString()
      });
    }
    
    // Remove CRM system if exists
    const crmSystem = crmSystems.get(socket.id);
    if (crmSystem) {
      crmSystems.delete(socket.id);
      console.log(`🏢 CRM system ${crmSystem.id} disconnected`);
    }
    
    // Handle ongoing calls
    for (const [callId, call] of calls.entries()) {
      if (call.socketId === socket.id) {
        console.log(`📴 Auto-ending call ${callId} due to disconnect`);
        calls.delete(callId);
      }
    }
  });
});

// Function to send test incoming call to CRM
function sendTestIncomingCallToCRM(socket) {
  console.log('📞 Sending test incoming call to CRM...');
  
  const testCallId = 'SOFTPHONE_CALL_' + Date.now();
  const testCall = {
    callId: testCallId,
    callerNumber: '+84987654321',
    calledNumber: '1900',
    assignedAgent: {
      id: 1,
      userId: 1,
      fullName: 'Admin User',
      status: 'available'
    },
    customerInfo: {
      id: 1,
      fullName: 'Nguyễn Văn Test',
      phoneNumber: '+84987654321',
      email: 'test@example.com',
      cif: 'CIF123456789'
    },
    startTime: new Date().toISOString(),
    status: 'ringing',
    source: 'softphone'
  };
  
  // Store the call
  calls.set(testCallId, {
    ...testCall,
    socketId: socket.id,
    testCall: true
  });
  
  // Send to CRM
  socket.emit('incoming_call_to_crm', testCall);
  
  console.log(`📞 Test call ${testCallId} sent to CRM`);
  
  // Auto-end the test call after 60 seconds if not answered
  setTimeout(() => {
    const call = calls.get(testCallId);
    if (call && call.status === 'ringing') {
      socket.emit('call_ended', {
        callId: testCallId,
        endReason: 'timeout',
        duration: 0,
        message: 'Test call timeout',
        timestamp: new Date().toISOString()
      });
      calls.delete(testCallId);
      console.log(`⏰ Test call ${testCallId} timed out`);
    }
  }, 60000);
}

// Function to send periodic demo calls to all connected CRM systems
function sendPeriodicDemoCalls() {
  if (crmSystems.size === 0) return;
  
  console.log(`📞 Sending periodic demo calls to ${crmSystems.size} CRM system(s)`);
  
  const demoCustomers = [
    {
      fullName: 'Nguyễn Văn Demo 1',
      phoneNumber: '+84901111111',
      email: 'demo1@example.com',
      cif: 'DEMO001'
    },
    {
      fullName: 'Trần Thị Demo 2', 
      phoneNumber: '+84902222222',
      email: 'demo2@example.com',
      cif: 'DEMO002'
    },
    {
      fullName: 'Lê Minh Demo 3',
      phoneNumber: '+84903333333',
      email: 'demo3@example.com',
      cif: 'DEMO003'
    }
  ];
  
  for (const [socketId, crmSystem] of crmSystems.entries()) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      const customer = demoCustomers[Math.floor(Math.random() * demoCustomers.length)];
      const callId = 'DEMO_CALL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      
      const demoCall = {
        callId,
        callerNumber: customer.phoneNumber,
        calledNumber: '1900',
        assignedAgent: {
          id: Math.floor(Math.random() * 3) + 1,
          userId: Math.floor(Math.random() * 3) + 1,
          fullName: ['Agent Demo 1', 'Agent Demo 2', 'Agent Demo 3'][Math.floor(Math.random() * 3)],
          status: 'available'
        },
        customerInfo: {
          id: Math.floor(Math.random() * 1000) + 1,
          ...customer
        },
        startTime: new Date().toISOString(),
        status: 'ringing',
        source: 'softphone'
      };
      
      // Store the call
      calls.set(callId, {
        ...demoCall,
        socketId: socketId,
        demoCall: true
      });
      
      socket.emit('incoming_call_to_crm', demoCall);
      console.log(`📞 Demo call ${callId} sent to CRM ${crmSystem.id}`);
      
      // Auto-end if not answered in 45 seconds
      setTimeout(() => {
        const call = calls.get(callId);
        if (call && call.status === 'ringing') {
          socket.emit('call_ended', {
            callId,
            endReason: 'customer_hangup',
            duration: 0,
            message: 'Demo call customer hangup',
            timestamp: new Date().toISOString()
          });
          calls.delete(callId);
          console.log(`📴 Demo call ${callId} ended by customer`);
        }
      }, 45000);
    }
  }
}

function sendDashboardData(socket) {
  const agentsList = Array.from(agents.values());
  const activeCalls = Array.from(calls.values()).filter(c => c.status === 'connected');
  const queueCount = queue.length;
  
  const stats = {
    totalActiveCalls: activeCalls.length,
    totalQueue: queueCount,
    availableAgents: agentsList.filter(a => a.status === 'available').length,
    busyAgents: agentsList.filter(a => a.status === 'on_call').length,
    totalAgents: agentsList.length
  };
  
  socket.emit('dashboard_data', {
    stats,
    activeCalls: activeCalls.map(call => ({
      callId: call.callId,
      callerNumber: call.callerNumber,
      status: call.status,
      duration: call.connectedTime ? 
        Math.floor((Date.now() - new Date(call.connectedTime).getTime()) / 1000) : 0,
      agentInfo: call.agentId ? agentsList.find(a => a.id === call.agentId) : null
    })),
    queueStatus: queue.map((call, index) => ({
      callId: call.callId,
      callerNumber: call.callerNumber,
      queuePosition: index + 1,
      waitTime: Math.floor((Date.now() - new Date(call.startTime).getTime()) / 1000),
      estimatedWaitTime: (index + 1) * 30
    })),
    agentsStatus: agentsList
  });
}

// Send real-time stats every 5 seconds
setInterval(() => {
  const stats = {
    totalActiveCalls: Array.from(calls.values()).filter(c => c.status === 'connected').length,
    totalQueue: queue.length,
    availableAgents: Array.from(agents.values()).filter(a => a.status === 'available').length,
    busyAgents: Array.from(agents.values()).filter(a => a.status === 'on_call').length,
    connectedCrmSystems: crmSystems.size
  };
  
  io.emit('real_time_stats', stats);
}, 5000);

// Send periodic demo calls every 2 minutes
setInterval(() => {
  sendPeriodicDemoCalls();
}, 120000); // 2 minutes

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`
🎧 Mock VoiceBot Server Running!
📡 Port: ${PORT}
🌐 URL: http://localhost:${PORT}
🔗 CORS: http://localhost:5173

📞 Supported Events:
   Customer: make_call, end_call, send_dtmf
   Agent: agent_login, change_agent_status, answer_call, reject_call
   CRM: join_call_center (userType: crm_system), answer_call, end_call
   Dashboard: get_dashboard_data, join_call_center

✅ Ready to receive WebSocket connections!
🏢 CRM integration enabled - incoming calls will be sent automatically!
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Mock VoiceBot Server...');
  io.close(() => {
    process.exit(0);
  });
});
