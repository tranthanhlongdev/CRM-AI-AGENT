import { useState, useEffect, useRef, useCallback } from "react";
import voiceBotService from "../../services/voiceBotService";
import realtimeService from "../../services/realtimeService";
import webrtcService from "../../services/webrtcService";

const SoftphonePage = ({ session, onLogout }) => {
  const [currentCall, setCurrentCall] = useState(null);
  const [callStatus, setCallStatus] = useState("ready"); // ready, ringing, connected, on-hold, after-call
  const [agentStatus, setAgentStatus] = useState("Available"); // Available, Busy, Offline
  const [callDuration, setCallDuration] = useState(0);
  const [dialNumber, setDialNumber] = useState("");
  const [callHistory, setCallHistory] = useState([]);
  const [showKeypad, setShowKeypad] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [queueInfo, setQueueInfo] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [checkingAgents, setCheckingAgents] = useState(false);
  const [agentCallMode, setAgentCallMode] = useState(false);
  
  // WebRTC voice call states
  const [voiceCallActive, setVoiceCallActive] = useState(false);
  const [_voiceCallConnected, setVoiceCallConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [_microphonePermission, setMicrophonePermission] = useState(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize WebRTC voice call
  const initializeVoiceCall = useCallback(async (callId) => {
    try {
      console.log('🎙️ Initializing voice call for callId:', callId);
      
      // Check microphone permission first
      const checkMicrophonePermission = async () => {
        try {
          if (navigator.permissions) {
            const permission = await navigator.permissions.query({ name: 'microphone' });
            setMicrophonePermission(permission.state);
            
            permission.onchange = () => {
              setMicrophonePermission(permission.state);
            };
          }
        } catch (error) {
          console.warn('Could not check microphone permission:', error);
        }
      };

      const setupWebRTCEventListeners = () => {
        webrtcService.on('voiceCallConnected', () => {
          console.log('🎵 Voice call connected');
          setVoiceCallConnected(true);
        });

        webrtcService.on('voiceCallDisconnected', () => {
          console.log('🎵 Voice call disconnected');
          setVoiceCallConnected(false);
        });

        webrtcService.on('localMuted', (muted) => {
          setIsMuted(muted);
        });

        webrtcService.on('error', (error) => {
          console.error('🚨 WebRTC error:', error);
          if (error.type === 'microphone_access_denied') {
            alert('Microphone access denied. Please allow microphone access to make voice calls.');
            setMicrophonePermission('denied');
          }
        });

        webrtcService.on('peerJoined', (data) => {
          console.log('👥 Peer joined voice call:', data.peerType);
        });

        webrtcService.on('peerLeft', (data) => {
          console.log('👥 Peer left voice call:', data.peerType);
        });
      };
      
      await checkMicrophonePermission();
      
      // Initialize WebRTC as customer (Softphone)
      const success = await webrtcService.initialize(
        voiceBotService.socket,
        callId,
        'customer'
      );
      
      if (success) {
        setVoiceCallActive(true);
        setupWebRTCEventListeners();
        console.log('✅ Voice call initialized');
      } else {
        console.error('❌ Failed to initialize voice call');
      }
    } catch (error) {
      console.error('❌ Error initializing voice call:', error);
      alert('Không thể khởi tạo cuộc gọi voice. Vui lòng cho phép truy cập microphone.');
    }
  }, []);

  // End voice call
  const endVoiceCall = useCallback(() => {
    if (voiceCallActive) {
      console.log('📴 Ending voice call');
      webrtcService.endCall();
      setVoiceCallActive(false);
      setVoiceCallConnected(false);
      setIsMuted(false);
    }
  }, [voiceCallActive]);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        setConnectionError(null);
        console.log('🔌 Initializing VoiceBot WebSocket...');
        
        await voiceBotService.connect();
        
        // Setup event listeners
        voiceBotService.on('connected', () => {
          console.log('✅ VoiceBot connected');
          setWsConnected(true);
          setConnectionError(null);
        });

        voiceBotService.on('disconnected', () => {
          console.log('❌ VoiceBot disconnected');
          setWsConnected(false);
          setCallStatus('ready');
          setCurrentCall(null);
          
          // Auto-reconnect after 3 seconds
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            initializeWebSocket();
          }, 3000);
        });

        voiceBotService.on('connectionError', (data) => {
          console.error('🚨 VoiceBot connection error:', data);
          setWsConnected(false);
          setConnectionError(data.error);
        });

        voiceBotService.on('callInitiated', (data) => {
          console.log('📞 Call initiated:', data);
          setCurrentCall(data);
          setCallStatus(data.status === 'ringing' ? 'ringing' : 'calling');
          setCallDuration(0);
        });

        voiceBotService.on('callQueued', (data) => {
          console.log('⏳ Call queued:', data);
          setCallStatus('ringing');
          setQueueInfo({
            position: data.queuePosition,
            estimatedWait: data.estimatedWaitTime
          });
        });

      voiceBotService.on('callConnected', async (data) => {
        console.log('✅ Call connected:', data);
        setCallStatus('connected');
        setQueueInfo(null);
        setCurrentCall(prev => ({ ...prev, ...data }));
        
        // Initialize WebRTC voice call
        if (data.callId) {
          await initializeVoiceCall(data.callId);
        }
      });

        voiceBotService.on('callOnHold', () => {
          setCallStatus('on-hold');
        });

        voiceBotService.on('callResumed', () => {
          setCallStatus('connected');
        });

        voiceBotService.on('callEnded', (data) => {
          console.log('📴 Call ended:', data);
          setCallStatus('after-call');
          setQueueInfo(null);
          
          // End voice call
          endVoiceCall();
          
          // Add to call history
          setCallHistory(prev => {
            const endedCall = voiceBotService.currentCall || data;
            return [...prev, {
              ...endedCall,
              ...data,
              endTime: new Date(),
              duration: data.duration || 0
            }];
          });
          
          setCurrentCall(null);
          setCallDuration(0);
          
          // Auto return to ready after 5 seconds
          setTimeout(() => {
            setCallStatus('ready');
          }, 5000);
        });

        voiceBotService.on('callFailed', (data) => {
          console.log('❌ Call failed:', data);
          setCallStatus('ready');
          setCurrentCall(null);
          setQueueInfo(null);
          setCallDuration(0);
          alert('Cuộc gọi thất bại: ' + (data.message || 'Lỗi không xác định'));
        });

        voiceBotService.on('error', (data) => {
          console.error('🚨 VoiceBot error:', data);
          
          // Reset state on error
          setCallStatus('ready');
          setCurrentCall(null);
          setQueueInfo(null);
          setCallDuration(0);
          
          // Show user-friendly error message
          const errorMsg = data.message || 'Lỗi không xác định';
          if (errorMsg.includes('position')) {
            alert('Lỗi kết nối server. Vui lòng kiểm tra:\n1. Backend server có chạy trên localhost:8000?\n2. WebSocket connection có hoạt động?');
          } else {
            alert('Lỗi hệ thống: ' + errorMsg);
          }
        });

      } catch (error) {
        console.error('🚨 Failed to initialize VoiceBot:', error);
        setConnectionError(error.message);
        setWsConnected(false);
      }
    };

    initializeWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      voiceBotService.cleanup();
    };
  }, [endVoiceCall, initializeVoiceCall]);


  // Toggle mute/unmute
  const toggleMute = () => {
    if (voiceCallActive) {
      if (isMuted) {
        webrtcService.unmute();
      } else {
        webrtcService.mute();
      }
    }
  };

  // Timer for call duration
  useEffect(() => {
    let interval;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus, currentCall]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStatusChange = (status) => {
    setAgentStatus(status);
  };

  const handleCall = async (number = dialNumber) => {
    if (!number.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }

    if (!wsConnected) {
      alert('Chưa kết nối đến server VoiceBot.\n\nVui lòng kiểm tra:\n1. Backend server chạy trên localhost:8000\n2. Kết nối WebSocket');
      return;
    }

    // Force reset state if stuck
    if (callStatus !== "ready") {
      console.log('🔄 Force resetting call state from:', callStatus);
      setCallStatus("ready");
      setCurrentCall(null);
      setQueueInfo(null);
      setCallDuration(0);
      
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      console.log(`📞 Attempting call from ${session.phoneNumber} to ${number}`);
      
      await voiceBotService.makeCall(session.phoneNumber, number, {
        customerInfo: {
          phoneNumber: number,
          customerName: `Customer ${number.slice(-4)}`
        },
        priority: 'normal'
      });
      
      setDialNumber("");
    } catch (error) {
      console.error('❌ Failed to make call:', error);
      
      // Reset state on error
      setCallStatus("ready");
      setCurrentCall(null);
      setQueueInfo(null);
      setCallDuration(0);
      
      // More specific error messages
      if (error.message.includes('Another call in progress')) {
        alert('Lỗi trạng thái cuộc gọi. Đã reset về trạng thái sẵn sàng, vui lòng thử lại.');
      } else if (error.message.includes('Not connected')) {
        alert('Mất kết nối WebSocket. Đang thử kết nối lại...');
      } else {
        alert('Không thể thực hiện cuộc gọi: ' + error.message);
      }
    }
  };

  const handleAnswer = () => {
    setCallStatus("connected");
  };

  const handleHangup = async () => {
    if (!currentCall) {
      console.log('❌ No active call to end');
      return;
    }

    try {
      await voiceBotService.endCall('caller_hangup');
      endVoiceCall(); // End WebRTC voice call
    } catch (error) {
      console.error('❌ Failed to end call:', error);
      endVoiceCall(); // Ensure voice call is ended even if backend call fails
      alert('Không thể kết thúc cuộc gọi: ' + error.message);
    }
  };

  const handleHold = async () => {
    if (!currentCall) {
      alert('Không có cuộc gọi nào để tạm ngưng');
      return;
    }

    try {
      if (callStatus === "on-hold") {
        await voiceBotService.resumeCall();
      } else {
        await voiceBotService.holdCall();
      }
    } catch (error) {
      console.error('❌ Failed to hold/resume call:', error);
      alert('Không thể tạm ngưng/tiếp tục cuộc gọi: ' + error.message);
    }
  };

  const handleIncomingCall = (customerNumber) => {
    setCurrentCall({
      number: customerNumber,
      direction: "inbound",
      startTime: new Date(),
      customerName: `Customer ${customerNumber.slice(-4)}`
    });
    setCallStatus("ringing");
  };

  const keypadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  const handleKeypadClick = async (key) => {
    if (callStatus === "connected" && currentCall) {
      // Send DTMF tone during call
      try {
        await voiceBotService.sendDTMF(key);
      } catch (error) {
        console.error('❌ Failed to send DTMF:', error);
      }
    } else {
      // Add to dial number when not in call
      setDialNumber(prev => prev + key);
    }
  };

  // Check available agents in CRM
  const checkAvailableAgents = async () => {
    setCheckingAgents(true);
    try {
      console.log('🔍 Checking available agents in CRM...');
      const result = await realtimeService.checkAgentAvailability();
      
      if (result.success) {
        const agents = result.agents || [];
        const count = result.availableCount || agents.length;
        
        setAvailableAgents(agents);
        console.log(`✅ Found ${count} available agents:`, agents, 'Source:', result.source || 'unknown');
        
        if (result.hasAvailableAgents && agents.length > 0) {
          const source = result.source === 'demo_api' ? ' (Demo Mode)' : '';
          alert(`Tìm thấy ${count} agent đang sẵn sàng${source}!\n\nClick "Gọi Agent" để kết nối trực tiếp.`);
        } else {
          alert('Hiện tại không có agent nào đang sẵn sàng.\n\nVui lòng thử lại sau hoặc gọi vào 1900.');
        }
      } else {
        console.error('❌ Failed to check agents:', result.error);
        alert('Không thể kiểm tra agent. Vui lòng thử lại.\n\nLỗi: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error checking agents:', error);
      alert('Lỗi kết nối tới CRM server.\n\nVui lòng kiểm tra:\n1. Backend server có chạy?\n2. API endpoint có hoạt động?');
    } finally {
      setCheckingAgents(false);
    }
  };

  // Call directly to available agent
  const callAvailableAgent = async () => {
    if (availableAgents.length === 0) {
      alert('Không có agent nào đang sẵn sàng. Vui lòng kiểm tra lại.');
      return;
    }

    if (callStatus !== "ready") {
      alert('Không thể gọi khi đang trong cuộc gọi khác');
      return;
    }

    try {
      // Select first available agent or let user choose
      const targetAgent = availableAgents[0];
      console.log(`📞 Calling agent directly: ${targetAgent.fullName || targetAgent.username}`);

      setAgentCallMode(true);
      
      // Prepare customer info for the call
      const customerInfo = {
        hoTen: session.agentName || 'Softphone User',
        soDienThoai: session.phoneNumber || '0912345678',
        cifNumber: '', // Empty for softphone users
        chiNhanh: 'Softphone',
        segmentKH: 'Standard',
        email: '',
        cmnd: '',
        source: 'softphone'
      };

      console.log('📞 Calling agent with customer info:', customerInfo);

      // Try to initiate direct call via realtime service with customer info
      const callResult = await realtimeService.initiateDemoCall(
        session.phoneNumber,
        {
          ...targetAgent,
          customerInfo: customerInfo,
          callMetadata: {
            source: 'softphone',
            agentName: session.agentName,
            timestamp: new Date().toISOString()
          }
        }
      );

      if (callResult.success) {
        alert(`Đang kết nối đến agent: ${targetAgent.fullName || targetAgent.username}\n\nVui lòng chờ...`);
        
        // Set calling state
        setCurrentCall({
          number: targetAgent.phone || 'Agent',
          direction: "outbound",
          startTime: new Date(),
          customerName: targetAgent.fullName || targetAgent.username,
          agentId: targetAgent.id,
          callType: "agent_direct"
        });
        setCallStatus("ringing");

        // Simulate connection (in real scenario, this would come from WebSocket)
        setTimeout(() => {
          setCallStatus("connected");
          alert(`✅ Đã kết nối với agent: ${targetAgent.fullName || targetAgent.username}`);
        }, 3000);

      } else {
        throw new Error(callResult.message || 'Failed to initiate agent call');
      }

    } catch (error) {
      console.error('❌ Failed to call agent:', error);
      setAgentCallMode(false);
      alert('Không thể gọi đến agent.\n\nLỗi: ' + error.message);
    }
  };

  // Toggle agent call mode
  const handleAgentCallToggle = () => {
    if (agentCallMode) {
      setAgentCallMode(false);
      setAvailableAgents([]);
    } else {
      checkAvailableAgents();
      setAgentCallMode(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800 border-green-200";
      case "Busy": return "bg-red-100 text-red-800 border-red-200";
      case "Offline": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCallStatusColor = (status) => {
    switch (status) {
      case "connected": return "text-green-600";
      case "ringing": return "text-yellow-600";
      case "on-hold": return "text-orange-600";
      case "after-call": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Softphone</h1>
                  <p className="text-xs text-gray-500">{session.agentName}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {wsConnected ? 'Connected' : 'Disconnected'}
                </span>
                {connectionError && (
                  <span className="text-xs text-red-600" title={connectionError}>
                    (Error)
                  </span>
                )}
              </div>
              
              {/* Agent Status */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <select
                  value={agentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(agentStatus)}`}
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Call Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Call Status Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${callStatus === 'connected' ? 'bg-green-400' : callStatus === 'ringing' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-white font-medium capitalize">
                      {callStatus === "ready" ? "Ready for calls" : 
                       callStatus === "ringing" ? "Incoming call..." : 
                       callStatus === "connected" ? "Connected" :
                       callStatus === "on-hold" ? "On Hold" : "After Call Work"}
                    </span>
                  </div>
                  {callStatus === "connected" && (
                    <div className="text-white font-mono text-lg">
                      {formatDuration(callDuration)}
                    </div>
                  )}
                </div>
              </div>

              {/* Call Content */}
              <div className="p-6">
                {callStatus === "ready" && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for calls</h3>
                    <p className="text-gray-600">Waiting for incoming calls or dial a number</p>
                  </div>
                )}

                {(callStatus === "ringing" || callStatus === "connected" || callStatus === "on-hold") && currentCall && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-gray-600">
                        {currentCall?.customerName?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-1">
                      {currentCall?.customerName || 'Unknown'}
                    </h3>
                    <p className="text-gray-600 mb-2">{currentCall?.number || currentCall?.callerNumber}</p>
                    <div className="flex items-center justify-center space-x-2 mb-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCallStatusColor(callStatus)}`}>
                        {callStatus === "ringing" ? (currentCall?.direction === "inbound" ? "Incoming" : "Calling") :
                         callStatus === "connected" ? "Connected" : "On Hold"}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 text-sm">
                        {currentCall?.direction === "inbound" ? "Inbound" : "Outbound"}
                      </span>
                    </div>
                    
                    {/* Queue Information */}
                    {queueInfo && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-yellow-800">Position: #{queueInfo.position}</span>
                          </div>
                          <div className="text-yellow-700">
                            Wait: ~{queueInfo.estimatedWait}s
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {callStatus === "after-call" && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">After Call Work</h3>
                    <p className="text-gray-600">Complete your notes and wrap up</p>
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4">
                  {callStatus === "ringing" && currentCall?.direction === "inbound" && (
                    <>
                      <button
                        onClick={handleAnswer}
                        className="flex items-center justify-center w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full text-white transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </button>
                      <button
                        onClick={handleHangup}
                        className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                      </button>
                    </>
                  )}

                  {(callStatus === "connected" || callStatus === "on-hold") && (
                    <>
                      <button
                        onClick={handleHold}
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                          callStatus === "on-hold" 
                            ? "bg-orange-600 hover:bg-orange-700 text-white" 
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                        </svg>
                      </button>
                      
                      {/* Mute/Unmute Button */}
                      {voiceCallActive && (
                        <button
                          onClick={toggleMute}
                          className={`flex items-center justify-center w-12 h-12 rounded-full text-white transition-colors ${
                            isMuted ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                          }`}
                          title={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={handleHangup}
                        className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowKeypad(!showKeypad)}
                        className="flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Dialer */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dialer</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="tel"
                    value={dialNumber}
                    onChange={(e) => setDialNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCall()}
                    disabled={!dialNumber.trim() || callStatus !== "ready"}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm">VoiceBot</span>
                  </button>
                  
                  <button
                    onClick={handleAgentCallToggle}
                    disabled={callStatus !== "ready" || checkingAgents}
                    className={`flex items-center justify-center px-4 py-2 text-white rounded-lg transition-colors ${
                      agentCallMode 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:bg-gray-400`}
                  >
                    {checkingAgents ? (
                      <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                    <span className="text-sm">{agentCallMode ? 'Exit' : 'Agent'}</span>
                  </button>
                </div>

                {/* Agent Selection Panel */}
                {agentCallMode && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">Available Agents</h4>
                    {availableAgents.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-gray-500 text-sm">
                          {checkingAgents ? "Checking agents..." : "No agents available"}
                        </div>
                        <button
                          onClick={checkAvailableAgents}
                          disabled={checkingAgents}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Refresh
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableAgents.slice(0, 3).map((agent, index) => (
                          <div
                            key={agent.id || index}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {agent.fullName || agent.username || `Agent ${index + 1}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {agent.department || 'Call Center'}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => callAvailableAgent()}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                            >
                              Call
                            </button>
                          </div>
                        ))}
                        
                        {availableAgents.length > 3 && (
                          <div className="text-center pt-2">
                            <span className="text-xs text-gray-500">
                              +{availableAgents.length - 3} more agents available
                            </span>
                          </div>
                        )}
                        
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={callAvailableAgent}
                            disabled={availableAgents.length === 0}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm transition-colors"
                          >
                            Call First Available
                          </button>
                          <button
                            onClick={checkAvailableAgents}
                            disabled={checkingAgents}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm transition-colors"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Keypad */}
                {showKeypad && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {keypadNumbers.flat().map((num) => (
                      <button
                        key={num}
                        onClick={() => handleKeypadClick(num)}
                        className="aspect-square flex items-center justify-center text-lg font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleIncomingCall("+84 987 654 321")}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Simulate Incoming Call
                </button>
                <button
                  onClick={() => setShowKeypad(!showKeypad)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Toggle Keypad
                </button>
                <button
                  onClick={() => {
                    console.log('🔧 Current State:', {
                      callStatus,
                      wsConnected,
                      currentCall,
                      voiceBotStatus: voiceBotService.getStatus()
                    });
                    setCallStatus("ready");
                    setCurrentCall(null);
                    setQueueInfo(null);
                    setCallDuration(0);
                    alert('State reset to ready');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  🔧 Debug & Reset State
                </button>
                <button
                  onClick={async () => {
                    try {
                      setWsConnected(false);
                      voiceBotService.disconnect();
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      await voiceBotService.connect();
                      alert('WebSocket reconnected');
                    } catch (error) {
                      alert('Reconnection failed: ' + error.message);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  🔄 Reconnect WebSocket
                </button>
                <button
                  onClick={async () => {
                    try {
                      console.log('🧪 Starting server connectivity test...');
                      const testResult = await realtimeService.testServerConnection();
                      
                      console.log('📊 Server Test Results:', testResult);
                      
                      const summary = testResult.summary;
                      const message = `Server Test Results:\n\n` +
                        `✅ Passed: ${summary.passed}/${summary.total}\n` +
                        `❌ Failed: ${summary.failed}/${summary.total}\n\n` +
                        `Server: ${testResult.serverUrl}\n\n` +
                        `Check console for detailed results.`;
                      
                      alert(message);
                    } catch (error) {
                      alert('Test failed: ' + error.message);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  🧪 Test Server Connection
                </button>
              </div>
            </div>

            {/* Call History */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Calls</h3>
              
              <div className="space-y-3">
                {callHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent calls</p>
                ) : (
                  callHistory.slice(-5).reverse().map((call, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        call.direction === 'inbound' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{call.number}</p>
                        <p className="text-xs text-gray-500">{formatDuration(call.duration)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoftphonePage;
