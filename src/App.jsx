import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import CustomerInfo from "./components/CustomerInfo";
import CustomerForm from "./components/CustomerForm";
import CustomerManagement from "./components/CustomerManagement";
import Login from "./components/Login";
import authService from "./services/authService";
import SystemManagement from "./components/SystemManagement.jsx";
import OverviewDashboard from "./components/OverviewDashboard.jsx";
import Reports from "./components/Reports.jsx";
import IncomingCallToast from "./components/IncomingCallToast.jsx";
import ticketService from "./services/ticketService.js";
import CampaignList from "./components/CampaignList.jsx";
import CallCenter from "./components/CallCenter.jsx";
import Softphone from "./components/Softphone.jsx";
import useNotification from "./hooks/useNotification.js";
import ToastNotification from "./components/common/ToastNotification.jsx";
import SoftphoneApp from "./components/softphone/SoftphoneApp.jsx";
import IncomingCallNotification from "./components/IncomingCallNotification.jsx";
import CustomerCallPopup from "./components/CustomerCallPopup.jsx";
import callService from "./services/callService.js";
import webrtcService from "./services/webrtcService.js";
import { createCRMCallIntegration, getCRMCallIntegration } from "./services/crmCallIntegration.js";

function App() {
  const [currentView, setCurrentView] = useState("overview"); // default: overview
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [incomingCall, setIncomingCall] = useState({ open: false, data: null });
  const [callCenterStatus, setCallCenterStatus] = useState("offline"); // available | busy | offline
  const [currentCallId, setCurrentCallId] = useState(""); // Track current call ID
  const [phoneOpen, setPhoneOpen] = useState(false); // Softphone open state
  const [user, setUser] = useState(null); // Current user info
  const [prefillCustomer, setPrefillCustomer] = useState(null);
  const [showCampaignList, setShowCampaignList] = useState(true);
  const [createdCampaigns] = useState([]);
  const [isSavingTicket, setIsSavingTicket] = useState(false);
  
  // Notification hook
  const { notification, showSuccess, showError, showInfo, hideNotification } = useNotification();
  
  // Call management states
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callServiceConnected, setCallServiceConnected] = useState(false);
  
  // WebSocket call integration states
  const [crmCallIntegration, setCrmCallIntegration] = useState(null);
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const [incomingWebSocketCall, setIncomingWebSocketCall] = useState(null);
  
  // WebRTC voice call states (for agent)
  const [agentVoiceCallActive, setAgentVoiceCallActive] = useState(false);
  const [agentVoiceCallConnected, setAgentVoiceCallConnected] = useState(false);
  const [agentIsMuted, setAgentIsMuted] = useState(false);

  // Check if current path is /softphone
  const currentPath = window.location.pathname;
  const isSoftphonePage = currentPath === '/softphone';

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
        const me = await authService.me(token);
        if (me?.success !== false) {
          setIsAuthenticated(true);
          // Set user info
          const raw = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
          if (raw) {
            try {
              const userData = JSON.parse(raw);
              setUser(userData);
              
              // Initialize call service for the agent
              if (userData) {
                initializeCallService(userData);
                // Also initialize WebSocket call integration
                initializeWebSocketCallIntegration(userData);
              }
            } catch {
              setUser(null);
            }
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    init();

    // Cleanup call service and WebSocket integration on unmount
    return () => {
      if (callService.isConnected) {
        console.log('🧹 Cleaning up call service on unmount');
        callService.disconnect();
      }
      
      const integration = getCRMCallIntegration();
      if (integration && integration.isCallSystemConnected()) {
        console.log('🧹 Cleaning up WebSocket call integration on unmount');
        integration.disconnect();
      }
    };
  }, []);

  // Initialize call service for agent
  const initializeCallService = async (userData) => {
    try {
      console.log('🔌 Initializing call service for CRM agent:', userData);
      
      // Clean up any existing connection first
      if (callService.isConnected) {
        console.log('🔄 Cleaning up existing call service connection...');
        callService.disconnect();
      }

      // Setup event listeners BEFORE connecting
      setupCallServiceListeners();
      
      const agentInfo = {
        id: userData.id || userData.userId || 'crm_' + userData.username,
        username: userData.username,
        fullName: userData.fullName || userData.name || userData.username,
        type: 'crm_agent'
      };

      console.log('🚀 Connecting with agent info:', agentInfo);
      
      await callService.initializeForAgent(agentInfo);
      
      console.log('✅ Call service initialization completed');

    } catch (error) {
      console.error('❌ Failed to initialize call service:', error);
      setCallServiceConnected(false);
      
      // Show error notification
      showError(
        'Lỗi kết nối Call Service',
        'Không thể kết nối đến server cuộc gọi. Vui lòng kiểm tra backend.'
      );
    }
  };

  // Initialize WebSocket call integration
  const initializeWebSocketCallIntegration = async (userData) => {
    try {
      console.log('🔌 Initializing WebSocket call integration for CRM:', userData);
      
      // Clean up any existing integration first
      const existingIntegration = getCRMCallIntegration();
      if (existingIntegration && existingIntegration.isCallSystemConnected()) {
        console.log('🔄 Cleaning up existing WebSocket integration...');
        existingIntegration.disconnect();
      }

      const crmUserId = `crm_${userData.username}_${userData.id || userData.userId || Date.now()}`;
      
      const integration = createCRMCallIntegration({
        serverUrl: 'http://localhost:8000',
        crmUserId: crmUserId,
        
        // Event handlers
        onIncomingCall: (callData) => {
          console.log('📞 WebSocket incoming call:', callData);
          setIncomingWebSocketCall(callData);
          
          // Show notification
          showInfo(
            'Cuộc gọi từ Softphone',
            `Từ ${callData.callerNumber || 'số không xác định'}`
          );
        },
        
        onCallAnswered: (data) => {
          console.log('✅ WebSocket call answered:', data);
          setIncomingWebSocketCall(null);
          
          // Optionally set active call
          if (data.call) {
            setActiveCall({
              callId: data.call.callId,
              callerNumber: data.call.callerNumber || data.call.from,
              callerName: data.call.customerInfo?.fullName || 'Khách hàng',
              customerInfo: data.call.customerInfo,
              startTime: data.call.startTime || new Date().toISOString(),
              status: 'connected',
              source: 'websocket'
            });
          }
          
          showSuccess(
            'Cuộc gọi đã kết nối',
            'Đã chấp nhận cuộc gọi từ softphone'
          );
        },
        
        onCallEnded: (data) => {
          console.log('📴 WebSocket call ended:', data);
          setIncomingWebSocketCall(null);
          setActiveCall(null);
          
          showInfo(
            'Cuộc gọi đã kết thúc',
            `Cuộc gọi ${data.callId || ''} đã kết thúc`
          );
        },
        
        onAgentStatusUpdate: (data) => {
          console.log('👤 Agent status update:', data);
        },
        
        onConnectionChange: (connected) => {
          console.log(`🔌 WebSocket connection: ${connected ? 'Connected' : 'Disconnected'}`);
          setWebsocketConnected(connected);
          
          if (connected) {
            showSuccess('WebSocket Connected', 'Đã kết nối đến call system');
          } else {
            showError('WebSocket Disconnected', 'Mất kết nối đến call system');
          }
        }
      });

      // Initialize the connection
      integration.init();
      setCrmCallIntegration(integration);
      
      // Request notification permission
      await integration.requestNotificationPermission();
      
      console.log('✅ WebSocket call integration initialization completed');

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket call integration:', error);
      setWebsocketConnected(false);
      
      showError(
        'Lỗi kết nối WebSocket',
        'Không thể kết nối đến call system WebSocket. Vui lòng kiểm tra backend.'
      );
    }
  };

  // Setup call service event listeners
  const setupCallServiceListeners = () => {
    // Remove existing listeners to avoid duplicates
    callService.eventListeners.clear();

    callService.on('connected', () => {
      console.log('✅ Call service connected in CRM');
      setCallServiceConnected(true);
      showSuccess('Call Service', 'Đã kết nối đến server cuộc gọi');
    });

    callService.on('disconnected', () => {
      console.log('❌ Call service disconnected in CRM');
      setCallServiceConnected(false);
      showError('Call Service', 'Mất kết nối đến server cuộc gọi');
    });

    callService.on('connectionError', (data) => {
      console.error('🚨 Call service connection error:', data);
      setCallServiceConnected(false);
      showError('Lỗi kết nối', data.error || 'Không thể kết nối WebSocket');
    });

    callService.on('incomingCall', (callData) => {
      console.log('📞 Incoming call received in CRM:', callData);
      setIncomingCallData(callData);
      
      // Show notification
      showInfo(
        'Cuộc gọi đến',
        `Từ ${callData.callerNumber || 'số không xác định'}`
      );
    });

    callService.on('callConnected', async (callData) => {
      console.log('✅ Call connected in CRM:', callData);
      setActiveCall(callData);
      setIncomingCallData(null);
      
      // Initialize WebRTC voice call for agent
      if (callData.callId) {
        await initializeAgentVoiceCall(callData.callId);
      }
    });

    callService.on('callEnded', (callData) => {
      console.log('📴 Call ended in CRM:', callData);
      endAgentVoiceCall(); // End WebRTC voice call
      setActiveCall(null);
      setIncomingCallData(null);
    });

    callService.on('callFailed', (callData) => {
      console.log('❌ Call failed in CRM:', callData);
      setActiveCall(null);
      setIncomingCallData(null);
      showError('Cuộc gọi thất bại', callData.message || 'Lỗi không xác định');
    });

    callService.on('error', (data) => {
      console.error('🚨 Call service error:', data);
      showError('Lỗi Call Service', data.message || 'Lỗi không xác định');
    });
  };

  // Initialize WebRTC voice call for agent
  const initializeAgentVoiceCall = async (callId) => {
    try {
      console.log('🎙️ Initializing agent voice call for callId:', callId);
      
      // Initialize WebRTC as agent
      const success = await webrtcService.initialize(
        callService.socket,
        callId,
        'agent'
      );
      
      if (success) {
        setAgentVoiceCallActive(true);
        setupAgentWebRTCEventListeners();
        console.log('✅ Agent voice call initialized');
        
        showSuccess(
          'Voice Call Ready',
          'Cuộc gọi voice đã sẵn sàng. Bạn có thể nói chuyện trực tiếp với khách hàng.'
        );
      } else {
        console.error('❌ Failed to initialize agent voice call');
        showError(
          'Voice Call Failed',
          'Không thể khởi tạo cuộc gọi voice. Vui lòng kiểm tra microphone.'
        );
      }
    } catch (error) {
      console.error('❌ Error initializing agent voice call:', error);
      showError(
        'Voice Call Error',
        'Lỗi khởi tạo cuộc gọi voice: ' + error.message
      );
    }
  };

  // Setup WebRTC event listeners for agent
  const setupAgentWebRTCEventListeners = () => {
    webrtcService.on('voiceCallConnected', () => {
      console.log('🎵 Agent voice call connected');
      setAgentVoiceCallConnected(true);
      showSuccess(
        'Voice Connected',
        'Đã kết nối voice call với khách hàng'
      );
    });

    webrtcService.on('voiceCallDisconnected', () => {
      console.log('🎵 Agent voice call disconnected');
      setAgentVoiceCallConnected(false);
    });

    webrtcService.on('localMuted', (muted) => {
      setAgentIsMuted(muted);
    });

    webrtcService.on('error', (error) => {
      console.error('🚨 Agent WebRTC error:', error);
      if (error.type === 'microphone_access_denied') {
        showError(
          'Microphone Access',
          'Vui lòng cho phép truy cập microphone để sử dụng voice call.'
        );
      }
    });

    webrtcService.on('peerJoined', (data) => {
      console.log('👥 Customer joined voice call:', data.peerType);
      if (data.peerType === 'customer') {
        showInfo(
          'Customer Connected',
          'Khách hàng đã tham gia voice call'
        );
      }
    });

    webrtcService.on('peerLeft', (data) => {
      console.log('👥 Customer left voice call:', data.peerType);
      if (data.peerType === 'customer') {
        showInfo(
          'Customer Disconnected',
          'Khách hàng đã rời khỏi voice call'
        );
      }
    });
  };

  // End agent voice call
  const endAgentVoiceCall = () => {
    if (agentVoiceCallActive) {
      console.log('📴 Ending agent voice call');
      webrtcService.endCall();
      setAgentVoiceCallActive(false);
      setAgentVoiceCallConnected(false);
      setAgentIsMuted(false);
    }
  };

  // Toggle agent mute/unmute
  const toggleAgentMute = () => {
    if (agentVoiceCallActive) {
      if (agentIsMuted) {
        webrtcService.unmute();
      } else {
        webrtcService.mute();
      }
    }
  };

  // Polling incoming calls (demo). In production, replace by Socket.IO
  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    let polling = true;
    let timerId = null;
    const poll = async () => {
      if (!polling) return;
      try {
        // Only poll when agent is available
        if (callCenterStatus !== "available") return;
        const raw =
          localStorage.getItem("currentUser") ||
          sessionStorage.getItem("currentUser");
        const me = raw ? JSON.parse(raw) : {};
        const myUsername = me?.username;
        // Demo: expect backend to set assignment; frontend just opens toast when agent has currentCall assigned
        const mod = await import("./services/callcenterService.js");
        const list = await mod.default.listAgents();
        const mine = (list?.data?.agents || []).find(
          (a) => a.username === myUsername
        );
        if (mine && mine.currentCallId && mine.status === "on_call") {
          // Optionally fetch call detail
          try {
            const detail = await mod.default.getCallDetail(mine.currentCallId);
            const call = detail?.data?.call || {};
            setIncomingCall({
              open: true,
              data: {
                hoTen: call.customerName,
                soDienThoai: call.from,
                cifNumber: call.cifNumber,
                note: `Cuộc gọi đến từ ${call.from}`,
              },
            });
          } catch {
            setIncomingCall({
              open: true,
              data: {
                hoTen: "Khách hàng",
                soDienThoai: "—",
                cifNumber: "—",
                note: "Cuộc gọi đến",
              },
            });
          }
        }
      } catch {
        // ignore
      } finally {
        if (mounted) timerId = setTimeout(poll, 5000);
      }
    };
    poll();
    return () => {
      mounted = false;
      polling = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [isAuthenticated, callCenterStatus]);

  // If accessing /softphone, show SoftphoneApp directly without authentication
  if (isSoftphonePage) {
    return <SoftphoneApp />;
  }

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          callCenterStatus={callCenterStatus}
          onChangeCallStatus={setCallCenterStatus}
          currentCallId={currentCallId}
          onCallIdChange={setCurrentCallId}
          onPhoneToggle={() => setPhoneOpen(!phoneOpen)}
        />

        {/* Call Service Debug Panel - Disabled */}
        {false && (
          <div className="fixed top-16 right-4 z-30 bg-gray-800 text-white p-3 rounded-lg text-xs max-w-sm max-h-96 overflow-y-auto">
            <div className="mb-2 font-semibold">🔧 Call Service Debug</div>
            <div className="space-y-1">
              <div className="border-b border-gray-600 pb-1 mb-2">
                <div className="font-medium">Legacy Call Service:</div>
                <div>Status: {callServiceConnected ? '✅ Connected' : '❌ Disconnected'}</div>
                <div>Incoming Call: {incomingCallData ? '📞 Yes' : '❌ No'}</div>
                <div>Active Call: {activeCall ? '📱 Yes' : '❌ No'}</div>
              </div>
              <div className="border-b border-gray-600 pb-1 mb-2">
                <div className="font-medium">WebSocket Integration:</div>
                <div>WebSocket: {websocketConnected ? '✅ Connected' : '❌ Disconnected'}</div>
                <div>WS Call: {incomingWebSocketCall ? '📞 Yes' : '❌ No'}</div>
                <div>Integration: {crmCallIntegration ? '✅ Initialized' : '❌ None'}</div>
              </div>
              <div className="border-b border-gray-600 pb-1 mb-2">
                <div className="font-medium">User Info:</div>
                <div>User: {user?.username || 'None'}</div>
                <div>Agent ID: {user?.id || user?.userId || 'None'}</div>
              </div>
              <div className="border-b border-gray-600 pb-1 mb-2">
                <div className="font-medium">Voice Call:</div>
                <div>Voice Call: {agentVoiceCallActive ? (agentVoiceCallConnected ? '🎵 Connected' : '🎙️ Active') : '❌ No'}</div>
                <div>Agent Muted: {agentIsMuted ? '🔇 Yes' : '🔊 No'}</div>
              </div>
            </div>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => {
                  console.log('🔍 Call Service Status:', callService.getStatus());
                  console.log('📊 Current User:', user);
                  console.log('📞 Incoming Call Data:', incomingCallData);
                  console.log('📱 Active Call:', activeCall);
                  console.log('🔌 WebSocket Integration:', crmCallIntegration?.getConnectionStatus());
                  console.log('📞 WebSocket Call:', incomingWebSocketCall);
                }}
                className="bg-blue-600 px-2 py-1 rounded text-xs"
              >
                Log Status
              </button>
              <button
                onClick={() => {
                  // Simulate incoming call for testing
                  const testCall = {
                    callId: 'test_' + Date.now(),
                    callerNumber: '0987654321',
                    callerName: 'Test Caller',
                    customerInfo: {
                      hoTen: 'Test Customer',
                      soDienThoai: '0987654321',
                      cifNumber: 'TEST123',
                      chiNhanh: 'Test Branch'
                    },
                    source: 'test'
                  };
                  setIncomingCallData(testCall);
                }}
                className="bg-green-600 px-2 py-1 rounded text-xs"
              >
                Test Call
              </button>
              <button
                onClick={() => {
                  // Test WebSocket incoming call
                  const testWSCall = {
                    callId: 'ws_test_' + Date.now(),
                    callerNumber: '0987654321',
                    calledNumber: '1900',
                    assignedAgent: {
                      id: user?.id || 1,
                      userId: user?.userId || 1,
                      fullName: user?.fullName || 'Test Agent',
                      status: 'available'
                    },
                    customerInfo: {
                      id: 1,
                      fullName: 'Test Customer WS',
                      phoneNumber: '0987654321',
                      email: 'test@example.com',
                      cif: 'WS123'
                    },
                    startTime: new Date().toISOString(),
                    status: 'ringing',
                    source: 'softphone'
                  };
                  setIncomingWebSocketCall(testWSCall);
                }}
                className="bg-purple-600 px-2 py-1 rounded text-xs"
              >
                Test WS Call
              </button>
            </div>
          </div>
        )}

        {/* Conditional Content */}
        {currentView === "crm" ? (
          <>
            {/* CRM Content Area */}
            <div className="flex-1 flex overflow-hidden p-4 gap-4 bg-gray-100">
              {showCampaignList ? (
                <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <CampaignList
                    onSelectTicket={async (detail) => {
                      // detail: { cifNumber, selectedRow }
                      setCurrentView("crm");
                      setShowCampaignList(false);
                      const row = detail?.selectedRow || {};
                      const basePrefill = {
                        cifNumber: detail?.cifNumber,
                        ticketId: row.id,
                        ticketCode: row.code,
                        hoTen: row.customerName,
                        soDienThoai: row.phone,
                        chiNhanh: row.branch,
                        segmentKH: row.status?.includes("VIP")
                          ? "VIP"
                          : undefined,
                      };
                      // Nếu có ticketId, load chi tiết ticket để đổ vào form nhập liệu
                      if (row?.id) {
                        try {
                          const res = await ticketService.getTicketDetail(
                            row.id
                          );
                          const t = res?.data || {};
                          setPrefillCustomer({
                            ...basePrefill,
                            product: t.product || "",
                            operation: t.operation || "",
                            resolutionDirection:
                              t.resolutionDirection || "Tự xử lý",
                            departmentCode: t.departmentCode || "",
                            callResult: t.callResult || "KH không nghe máy",
                            discussionNotes: t.discussionNotes || "",
                            resolutionSummary: t.resolutionSummary || "",
                          });
                        } catch {
                          setPrefillCustomer(basePrefill);
                        }
                      } else {
                        setPrefillCustomer(basePrefill);
                      }
                    }}
                    extraItems={createdCampaigns}
                  />
                </div>
              ) : (
                <>
                  <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <CustomerInfo prefill={prefillCustomer} />
                  </div>
                  <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <CustomerForm
                      ref={(r) => (window.__customerFormRef = r)}
                      prefill={prefillCustomer}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Save/Cancel Buttons - Fixed at bottom */}
            {!showCampaignList && (
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowCampaignList(true);
                      setPrefillCustomer(null);
                    }}
                    className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={async () => {
                      if (isSavingTicket) return; // Prevent double click
                      
                      try {
                        setIsSavingTicket(true);
                        const payload =
                          window.__customerFormRef?.getTicketPayload?.();
                        if (!payload?.cifNumber) {
                          showError(
                            "Thiếu thông tin!",
                            "Vui lòng nhập CIF khách hàng để lưu ticket."
                          );
                          setIsSavingTicket(false);
                          return;
                        }
                        // Nếu có ticketId trong prefill => cập nhật, ngược lại => tạo mới
                        if (prefillCustomer?.ticketId) {
                          await ticketService.updateTicket(
                            prefillCustomer.ticketId,
                            payload
                          );
                          // Upload đính kèm nếu có
                          try {
                            const files =
                              window.__customerFormRef?.getAttachments?.() ||
                              [];
                            if (files.length) {
                              await ticketService.uploadTicketFiles(
                                prefillCustomer.ticketId,
                                files
                              );
                            }
                          } catch {
                            // ignore upload errors
                          }
                          
                          // Show success notification for update
                          showSuccess(
                            "Cập nhật thành công!",
                            `Ticket #${prefillCustomer.ticketId} đã được cập nhật.`
                          );
                          
                          // Redirect to ticket list after 1.5 seconds
                          setTimeout(() => {
                            setCurrentView("crm");
                            setShowCampaignList(true);
                            setPrefillCustomer(null);
                          }, 1500);
                          
                        } else {
                          const created = await ticketService.createTicket(
                            payload
                          );
                          const newId = created?.data?.id || created?.id;
                          try {
                            const files =
                              window.__customerFormRef?.getAttachments?.() ||
                              [];
                            if (newId && files.length) {
                              await ticketService.uploadTicketFiles(
                                newId,
                                files
                              );
                            }
                          } catch {
                            // ignore upload errors
                          }
                          
                          // Show success notification for create
                          showSuccess(
                            "Tạo ticket thành công!",
                            `Ticket mới đã được tạo cho khách hàng ${payload.customerName || 'N/A'}${newId ? ` (#${newId})` : ''}.`
                          );
                          
                          // Redirect to ticket list after 2 seconds
                          setTimeout(() => {
                            setCurrentView("crm");
                            setShowCampaignList(true);
                            setPrefillCustomer(null);
                          }, 2000);
                        }
                      } catch (e) {
                        showError(
                          "Lỗi lưu ticket!",
                          e?.message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại."
                        );
                      } finally {
                        setIsSavingTicket(false);
                      }
                    }}
                    disabled={isSavingTicket}
                    className={`px-6 py-2 text-white rounded-md transition-colors flex items-center gap-2 ${
                      isSavingTicket 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSavingTicket && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isSavingTicket ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : currentView === "overview" ? (
          <OverviewDashboard />
        ) : currentView === "customers" ? (
          <CustomerManagement 
            onCreateTicket={(customer) => {
              // Chuyển sang view CRM với thông tin khách hàng prefill
              setCurrentView("crm");
              setShowCampaignList(false);
              setPrefillCustomer({
                hoTen: customer.hoTen,
                name: customer.hoTen,
                cifNumber: customer.cifNumber,
                cif: customer.cifNumber,
                soDienThoai: customer.soDienThoai,
                phone: customer.soDienThoai,
                email: customer.email,
                cmnd: customer.cmnd,
                chiNhanh: customer.chiNhanh,
                segmentKH: customer.segmentKH,
                note: `Tạo ticket cho khách hàng: ${customer.hoTen} (CIF: ${customer.cifNumber})`
              });
            }}
          />
        ) : currentView === "system" ? (
          <SystemManagement />
        ) : currentView === "reports" ? (
          <Reports />
        ) : currentView === "callcenter" ? (
          <CallCenter />
        ) : null}

        {/* Softphone Component */}
        <Softphone
          isOpen={phoneOpen}
          onClose={() => setPhoneOpen(false)}
          currentUsername={user?.username || ""}
          currentCallId={currentCallId}
          onCallEnd={() => setCurrentCallId("")}
        />

        {/* Incoming call toast demo timer (20s) - mô phỏng cuộc gọi đến theo chu kỳ */}
        <IncomingCallToast
          isOpen={incomingCall.open}
          callData={incomingCall.data}
          onAccept={() => {
            // Accept: chuyển sang CRM và truyền thông tin KH vào 2 panel
            setIncomingCall({ open: false, data: null });
            setCurrentView("crm");
            setPrefillCustomer(incomingCall.data || null);
            setShowCampaignList(false);
          }}
          onDecline={() => setIncomingCall({ open: false, data: null })}
          durationMs={20000}
        />

        {/* WebSocket Call Toast Notification */}
        {incomingWebSocketCall && !incomingCall.open && (
          <IncomingCallToast
            isOpen={true}
            callData={{
              hoTen: incomingWebSocketCall.customerInfo?.fullName || 'Khách hàng từ Softphone',
              name: incomingWebSocketCall.customerInfo?.fullName || 'Khách hàng từ Softphone',
              soDienThoai: incomingWebSocketCall.callerNumber,
              phone: incomingWebSocketCall.callerNumber,
              cifNumber: incomingWebSocketCall.customerInfo?.cif || incomingWebSocketCall.customerInfo?.cifNumber,
              cif: incomingWebSocketCall.customerInfo?.cif || incomingWebSocketCall.customerInfo?.cifNumber,
              note: `Cuộc gọi từ Softphone: ${incomingWebSocketCall.callerNumber || 'số không xác định'}`
            }}
            onAccept={() => {
              // Accept WebSocket call and switch to CRM
              handleAcceptWebSocketCall(incomingWebSocketCall);
              
              // Also populate CRM form
              const customerData = {
                hoTen: incomingWebSocketCall.customerInfo?.fullName || 'Khách hàng từ Softphone',
                name: incomingWebSocketCall.customerInfo?.fullName || 'Khách hàng từ Softphone',
                soDienThoai: incomingWebSocketCall.callerNumber,
                phone: incomingWebSocketCall.callerNumber,
                cifNumber: incomingWebSocketCall.customerInfo?.cif || incomingWebSocketCall.customerInfo?.cifNumber || '',
                cif: incomingWebSocketCall.customerInfo?.cif || incomingWebSocketCall.customerInfo?.cifNumber || '',
                email: incomingWebSocketCall.customerInfo?.email || '',
                chiNhanh: incomingWebSocketCall.customerInfo?.chiNhanh || '',
                note: `Cuộc gọi từ Softphone - Call ID: ${incomingWebSocketCall.callId}`
              };
              
              setCurrentView("crm");
              setPrefillCustomer(customerData);
              setShowCampaignList(false);
            }}
            onDecline={() => {
              handleDeclineWebSocketCall(incomingWebSocketCall);
            }}
            durationMs={30000}
          />
        )}

        {/* Bỏ modal tạo campaign theo yêu cầu */}
        
        {/* Toast Notification */}
        <ToastNotification 
          notification={notification}
          onClose={hideNotification}
        />

        {/* Incoming Call Notification (Legacy) */}
        {incomingCallData && !incomingWebSocketCall && (
          <IncomingCallNotification
            incomingCall={incomingCallData}
            onAccept={() => handleAcceptCall(incomingCallData)}
            onDecline={() => handleDeclineCall(incomingCallData)}
            onClose={() => setIncomingCallData(null)}
          />
        )}

        {/* WebSocket Incoming Call Notification */}
        {incomingWebSocketCall && (
          <IncomingCallNotification
            incomingCall={incomingWebSocketCall}
            onAccept={() => handleAcceptWebSocketCall(incomingWebSocketCall)}
            onDecline={() => handleDeclineWebSocketCall(incomingWebSocketCall)}
            onClose={() => setIncomingWebSocketCall(null)}
          />
        )}

        {/* Active Call Popup */}
        {activeCall && (
          <CustomerCallPopup
            activeCall={activeCall}
            onEndCall={() => handleEndCall(activeCall)}
            onCreateTicket={(ticketData) => handleCreateTicketFromCall(ticketData)}
            onMinimize={() => {/* Could implement minimized call UI */}}
            // WebRTC voice call props
            voiceCallActive={agentVoiceCallActive}
            voiceCallConnected={agentVoiceCallConnected}
            isMuted={agentIsMuted}
            onToggleMute={toggleAgentMute}
          />
        )}
      </div>
    </div>
  );

  // Call event handlers
  function handleAcceptCall(callData) {
    try {
      console.log('📞 Accepting call:', callData);
      callService.acceptCall(callData.callId || callData.id);
      
      showSuccess(
        'Cuộc gọi đã được chấp nhận',
        `Đang kết nối với ${callData.callerNumber || 'khách hàng'}`
      );
    } catch (error) {
      console.error('❌ Failed to accept call:', error);
      showError('Lỗi chấp nhận cuộc gọi', error.message);
      setIncomingCallData(null);
    }
  }

  // WebSocket call event handlers
  function handleAcceptWebSocketCall(callData) {
    try {
      console.log('📞 Accepting WebSocket call:', callData);
      
      const integration = getCRMCallIntegration();
      if (!integration || !integration.isCallSystemConnected()) {
        throw new Error('WebSocket integration not connected');
      }
      
      const agentId = callData.assignedAgent?.id || user?.id || user?.userId;
      if (!agentId) {
        throw new Error('No agent ID available');
      }
      
      const success = integration.answerCall(callData.callId, agentId);
      if (!success) {
        throw new Error('Failed to send answer call command');
      }
      
      showSuccess(
        'Cuộc gọi đã được chấp nhận',
        `Đang kết nối với ${callData.callerNumber || 'khách hàng'}`
      );
    } catch (error) {
      console.error('❌ Failed to accept WebSocket call:', error);
      showError('Lỗi chấp nhận cuộc gọi', error.message);
      setIncomingWebSocketCall(null);
    }
  }

  function handleDeclineCall(callData) {
    try {
      console.log('📞 Declining call:', callData);
      callService.declineCall(callData.callId || callData.id, 'agent_declined');
      setIncomingCallData(null);
      
      showInfo(
        'Cuộc gọi đã bị từ chối',
        `Từ chối cuộc gọi từ ${callData.callerNumber || 'khách hàng'}`
      );
    } catch (error) {
      console.error('❌ Failed to decline call:', error);
      showError('Lỗi từ chối cuộc gọi', error.message);
      setIncomingCallData(null);
    }
  }

  function handleDeclineWebSocketCall(callData) {
    try {
      console.log('📞 Declining WebSocket call:', callData);
      
      const integration = getCRMCallIntegration();
      if (!integration || !integration.isCallSystemConnected()) {
        throw new Error('WebSocket integration not connected');
      }
      
      const success = integration.rejectCall(callData.callId, 'crm_agent_declined');
      if (!success) {
        throw new Error('Failed to send reject call command');
      }
      
      setIncomingWebSocketCall(null);
      
      showInfo(
        'Cuộc gọi đã bị từ chối',
        `Từ chối cuộc gọi từ ${callData.callerNumber || 'khách hàng'}`
      );
    } catch (error) {
      console.error('❌ Failed to decline WebSocket call:', error);
      showError('Lỗi từ chối cuộc gọi', error.message);
      setIncomingWebSocketCall(null);
    }
  }

  function handleEndCall(callData) {
    try {
      console.log('📴 Ending call:', callData);
      callService.endCall(callData.callId || callData.id);
      setActiveCall(null);
      
      showInfo(
        'Cuộc gọi đã kết thúc',
        `Kết thúc cuộc gọi với ${callData.callerNumber || 'khách hàng'}`
      );
    } catch (error) {
      console.error('❌ Failed to end call:', error);
      showError('Lỗi kết thúc cuộc gọi', error.message);
      setActiveCall(null);
    }
  }

  function handleCreateTicketFromCall(ticketData) {
    console.log('🎫 Creating ticket from call:', ticketData);
    
    // Switch to CRM view and prefill customer form
    setCurrentView("crm");
    setShowCampaignList(false);
    
    const prefillData = {
      hoTen: ticketData.customerData?.hoTen || 'Khách hàng từ cuộc gọi',
      name: ticketData.customerData?.hoTen || 'Khách hàng từ cuộc gọi',
      cifNumber: ticketData.customerData?.cifNumber || '',
      cif: ticketData.customerData?.cifNumber || '',
      soDienThoai: ticketData.callerNumber || '',
      phone: ticketData.callerNumber || '',
      email: ticketData.customerData?.email || '',
      cmnd: ticketData.customerData?.cmnd || '',
      chiNhanh: ticketData.customerData?.chiNhanh || '',
      segmentKH: ticketData.customerData?.segmentKH || '',
      note: `Tạo ticket từ cuộc gọi đến (${ticketData.callDuration || 0}s)${
        ticketData.callNotes ? '\nGhi chú: ' + ticketData.callNotes : ''
      }`,
      // Pre-fill some ticket fields
      channel: 'Inbound',
      priority: 'Normal',
      status: 'New',
      discussionNotes: ticketData.callNotes || `Cuộc gọi đến từ ${ticketData.callerNumber || 'số không xác định'}`
    };
    
    setPrefillCustomer(prefillData);
    
    showSuccess(
      'Chuyển sang tạo ticket',
      'Form tạo ticket đã được điền sẵn thông tin từ cuộc gọi'
    );
  }
}

export default App;
