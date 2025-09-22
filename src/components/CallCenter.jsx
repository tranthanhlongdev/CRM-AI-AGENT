import { useEffect, useMemo, useState, useRef } from "react";
import callcenterService from "../services/callcenterService";
import agentDashboardService from "../services/agentDashboardService";
import useNotification from "../hooks/useNotification";

function CallCenter() {
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [error, setError] = useState("");
  const [myStatus, setMyStatus] = useState("offline");
  const [username, setUsername] = useState("");
  const [outboundTo, setOutboundTo] = useState("");
  const [currentCallId, setCurrentCallId] = useState("");
  const [transferringTo, setTransferringTo] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    totalActiveCalls: 0,
    totalQueue: 0,
    availableAgents: 0,
    busyAgents: 0
  });
  const reconnectTimeoutRef = useRef(null);
  const { showSuccess, showError, showInfo } = useNotification();

  useEffect(() => {
    const raw =
      localStorage.getItem("currentUser") ||
      sessionStorage.getItem("currentUser");
    if (raw) {
      try {
        const me = JSON.parse(raw);
        setUsername(me?.username || "");
      } catch {}
    }
  }, []);

  const refreshAgents = async () => {
    try {
      setLoadingAgents(true);
      setError("");
      const res = await callcenterService.listAgents();
      const list = res?.data?.agents || [];
      setAgents(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || "Không tải được danh sách agent");
    } finally {
      setLoadingAgents(false);
    }
  };

  // Initialize WebSocket connection for agent dashboard
  useEffect(() => {
    const initializeAgentDashboard = async () => {
      if (!username) return;

      try {
        console.log('🔌 Initializing Agent Dashboard WebSocket...');
        
        await agentDashboardService.connect({
          userId: Date.now(), // In real app, get from auth
          username: username,
          fullName: username,
          email: `${username}@company.com`,
          department: 'Call Center'
        });

        // Setup event listeners
        agentDashboardService.on('connected', () => {
          console.log('✅ Agent Dashboard connected');
          setWsConnected(true);
          showSuccess('WebSocket Connected', 'Real-time updates enabled');
        });

        agentDashboardService.on('disconnected', () => {
          console.log('❌ Agent Dashboard disconnected');
          setWsConnected(false);
          showError('WebSocket Disconnected', 'Real-time updates disabled');
          
          // Auto-reconnect
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            initializeAgentDashboard();
          }, 3000);
        });

        agentDashboardService.on('loginSuccess', (data) => {
          console.log('👤 Agent login success:', data);
          setMyStatus(data.status || 'available');
          showSuccess('Agent Login', `Logged in as ${data.username}`);
        });

        agentDashboardService.on('incomingCall', (data) => {
          console.log('📞 Incoming call:', data);
          setIncomingCall(data);
          showInfo('Incoming Call', `Call from ${data.callerNumber}`);
          // Play notification sound
          if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance('Incoming call');
            utterance.rate = 1.5;
            window.speechSynthesis.speak(utterance);
          }
        });

        agentDashboardService.on('callAnswered', (data) => {
          console.log('✅ Call answered:', data);
          setCurrentCall(data);
          setIncomingCall(null);
          setCurrentCallId(data.callId);
          setMyStatus('on_call');
          showSuccess('Call Answered', `Connected to ${data.callerNumber}`);
        });

        agentDashboardService.on('callEnded', (data) => {
          console.log('📴 Call ended:', data);
          setCurrentCall(null);
          setIncomingCall(null);
          setCurrentCallId('');
          setMyStatus('available');
          showInfo('Call Ended', 'Call completed successfully');
        });

        agentDashboardService.on('dashboardData', (data) => {
          console.log('📊 Dashboard data received:', data);
          if (data.stats) {
            setRealTimeStats(data.stats);
          }
          if (data.agentsStatus) {
            setAgents(data.agentsStatus);
          }
        });

        agentDashboardService.on('agentStatusUpdate', (data) => {
          console.log('🔄 Agent status update:', data);
          setAgents(prev => prev.map(agent => 
            agent.username === data.username 
              ? { ...agent, status: data.status }
              : agent
          ));
        });

        agentDashboardService.on('realTimeStats', (data) => {
          setRealTimeStats(prev => ({ ...prev, ...data }));
        });

        agentDashboardService.on('error', (data) => {
          console.error('🚨 Agent Dashboard error:', data);
          showError('Dashboard Error', data.message || 'Unknown error');
        });

        // Login the agent
        await agentDashboardService.login();

      } catch (error) {
        console.error('🚨 Failed to initialize Agent Dashboard:', error);
        setWsConnected(false);
        showError('Connection Failed', error.message || 'Cannot connect to server');
      }
    };

    if (username) {
      initializeAgentDashboard();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      agentDashboardService.cleanup();
    };
  }, [username, showSuccess, showError, showInfo]);

  useEffect(() => {
    refreshAgents();
  }, []);

  const onUpdateStatus = async (status) => {
    if (!username) return;
    try {
      setMyStatus(status);
      
      // Use WebSocket if connected, fallback to HTTP API
      if (wsConnected && agentDashboardService.isConnected) {
        await agentDashboardService.changeStatus(status);
      } else {
        await callcenterService.updateAgentStatus({ username, status });
        refreshAgents();
      }
    } catch (e) {
      setError(e?.message || "Không cập nhật được trạng thái");
      showError('Status Update Failed', e?.message || 'Cannot update status');
    }
  };

  const startOutbound = async () => {
    if (!username || !outboundTo) return;
    const callId = `CALL_${Date.now()}`;
    try {
      await callcenterService.startCall({
        callId,
        from: username,
        to: outboundTo,
        direction: "outbound",
      });
      setCurrentCallId(callId);
      refreshAgents();
    } catch (e) {
      setError(e?.message || "Không bắt đầu được cuộc gọi");
    }
  };

  const transfer = async () => {
    if (!currentCallId || !username || !transferringTo) return;
    try {
      await callcenterService.transferCall({
        callId: currentCallId,
        from: username,
        to: transferringTo,
      });
      refreshAgents();
    } catch (e) {
      setError(e?.message || "Không chuyển được cuộc gọi");
    }
  };

  const end = async () => {
    if (!currentCallId || !username) return;
    try {
      // Use WebSocket if connected, fallback to HTTP API
      if (wsConnected && agentDashboardService.isConnected) {
        await agentDashboardService.endCall('agent_hangup');
      } else {
        await callcenterService.endCall({ callId: currentCallId, username });
      }
      
      setCurrentCallId("");
      setCurrentCall(null);
      setMyStatus("available");
      refreshAgents();
    } catch (e) {
      setError(e?.message || "Không kết thúc được cuộc gọi");
      showError('End Call Failed', e?.message || 'Cannot end call');
    }
  };

  // Handle incoming call actions
  const answerIncomingCall = async () => {
    if (!incomingCall) return;
    
    try {
      if (wsConnected && agentDashboardService.isConnected) {
        await agentDashboardService.answerCall(incomingCall.callId);
      } else {
        // Fallback simulation
        setCurrentCall(incomingCall);
        setIncomingCall(null);
        setCurrentCallId(incomingCall.callId);
        setMyStatus('on_call');
        showSuccess('Call Answered', `Connected to ${incomingCall.callerNumber}`);
      }
    } catch (error) {
      console.error('❌ Failed to answer call:', error);
      showError('Answer Failed', error.message || 'Cannot answer call');
    }
  };

  const rejectIncomingCall = async () => {
    if (!incomingCall) return;
    
    try {
      if (wsConnected && agentDashboardService.isConnected) {
        await agentDashboardService.rejectCall(incomingCall.callId, 'agent_rejected');
      }
      
      setIncomingCall(null);
      showInfo('Call Rejected', 'Incoming call was rejected');
    } catch (error) {
      console.error('❌ Failed to reject call:', error);
      showError('Reject Failed', error.message || 'Cannot reject call');
    }
  };

  const agentsByStatus = useMemo(() => {
    const groups = new Map();
    for (const a of agents) {
      const key = a.status || "unknown";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(a);
    }
    return Array.from(groups.entries()).map(([status, list]) => ({
      status,
      list,
    }));
  }, [agents]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Call Center</h3>
            <p className="text-xs text-gray-500">Quản lý Agent và Cuộc gọi</p>
          </div>
          <div className="flex items-center gap-2">
            {/* WebSocket Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-xs text-gray-600">
                {wsConnected ? 'Real-time' : 'Offline'}
              </span>
            </div>
            
            {/* Real-time Stats */}
            <div className="hidden md:flex items-center space-x-4 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
              <span>Active: {realTimeStats.totalActiveCalls}</span>
              <span>Queue: {realTimeStats.totalQueue}</span>
              <span>Available: {realTimeStats.availableAgents}</span>
            </div>
            
            <div className="hidden sm:block text-sm text-gray-600">
              Bạn: {username || "—"}
            </div>
            <select
              value={myStatus}
              onChange={(e) => onUpdateStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
            <button
              onClick={refreshAgents}
              className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 text-sm text-red-700 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dialer */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900 mb-3">Gọi đi</div>
          <div className="flex gap-2">
            <input
              value={outboundTo}
              onChange={(e) => setOutboundTo(e.target.value)}
              placeholder="Nhập số cần gọi"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
            />
            <button
              onClick={startOutbound}
              className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Gọi
            </button>
          </div>
          {currentCallId && (
            <div className="mt-3 text-xs text-gray-600">
              Đang call: {currentCallId}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <select
              value={transferringTo}
              onChange={(e) => setTransferringTo(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md flex-1"
            >
              <option value="">— Chuyển cho —</option>
              {agents
                .filter((a) => a.username !== username)
                .map((a) => (
                  <option key={a.username} value={a.username}>
                    {a.username} ({a.status})
                  </option>
                ))}
            </select>
            <button
              onClick={transfer}
              disabled={!currentCallId || !transferringTo}
              className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Chuyển
            </button>
            <button
              onClick={end}
              disabled={!currentCallId}
              className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Kết thúc
            </button>
          </div>
        </div>

        {/* Agents by status */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900 mb-3">Agents</div>
          {loadingAgents ? (
            <div className="text-sm text-gray-600">Đang tải…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agentsByStatus.map((g) => (
                <div key={g.status} className="border rounded-lg">
                  <div className="px-3 py-2 text-xs font-semibold bg-gray-50 border-b">
                    {g.status}
                  </div>
                  <ul className="divide-y">
                    {g.list.map((a) => (
                      <li
                        key={a.username}
                        className="px-3 py-2 text-sm flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {a.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {a.currentCallId
                              ? `On ${a.currentCallId}`
                              : a.lastUpdate}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {a.status}
                        </span>
                      </li>
                    ))}
                    {g.list.length === 0 && (
                      <li className="px-3 py-2 text-xs text-gray-500">
                        Không có
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-pulse">
            <div className="text-center">
              {/* Caller Avatar */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              {/* Call Info */}
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Incoming Call
              </h3>
              <p className="text-lg text-gray-700 mb-2">
                {incomingCall.callerNumber}
              </p>
              {incomingCall.customer?.hoTen && (
                <p className="text-sm text-gray-600 mb-4">
                  {incomingCall.customer.hoTen}
                </p>
              )}
              
              {/* Call Duration (if available) */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Incoming call...</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={answerIncomingCall}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Answer</span>
                </button>
                <button
                  onClick={rejectIncomingCall}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  <span>Decline</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Call Status */}
      {currentCall && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
            <div>
              <div className="text-sm font-medium">Connected</div>
              <div className="text-xs opacity-90">
                {currentCall.callerNumber || currentCall.number}
              </div>
            </div>
            <button
              onClick={endCall}
              className="ml-4 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
            >
              End
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallCenter;
