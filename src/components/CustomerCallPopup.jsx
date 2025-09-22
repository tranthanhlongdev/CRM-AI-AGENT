import { useState, useEffect } from 'react';
import customerService from '../services/customerService';
import ticketService from '../services/ticketService';

function CustomerCallPopup({ 
  activeCall, 
  onEndCall, 
  onCreateTicket,
  onMinimize,
  // WebRTC voice call props
  voiceCallActive = false,
  voiceCallConnected = false,
  isMuted = false,
  onToggleMute = null
}) {
  const [customerData, setCustomerData] = useState(null);
  const [customerTickets, setCustomerTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'tickets', 'notes'
  const [callNotes, setCallNotes] = useState('');

  useEffect(() => {
    if (!activeCall) return;

    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Load customer data
    loadCustomerData();

    return () => {
      clearInterval(timer);
    };
  }, [activeCall]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to find customer by phone number first
      const phoneNumber = activeCall.callerNumber;
      if (phoneNumber) {
        const customers = await customerService.searchCustomers({ 
          search: phoneNumber,
          searchField: 'soDienThoai' 
        });
        
        if (customers.data && customers.data.length > 0) {
          const customer = customers.data[0];
          setCustomerData(customer);
          
          // Load tickets for this customer
          if (customer.cifNumber) {
            const tickets = await ticketService.getTicketsByCif(customer.cifNumber);
            setCustomerTickets(tickets.data || []);
          }
        }
      }

      // If no customer found, try to get from activeCall.customerInfo
      if (!customerData && activeCall.customerInfo) {
        setCustomerData(activeCall.customerInfo);
        
        if (activeCall.customerInfo.cifNumber) {
          const tickets = await ticketService.getTicketsByCif(activeCall.customerInfo.cifNumber);
          setCustomerTickets(tickets.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load customer data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (callNotes.trim()) {
      // You can save call notes here
      console.log('Call ended with notes:', callNotes);
    }
    onEndCall();
  };

  const handleCreateTicket = () => {
    const ticketData = {
      customerData: customerData,
      callerNumber: activeCall.callerNumber,
      callDuration: callDuration,
      callNotes: callNotes,
      source: 'incoming_call'
    };
    onCreateTicket(ticketData);
  };

  if (!activeCall) return null;

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-green-500 text-white rounded-lg p-3 shadow-lg flex items-center space-x-3 min-w-64">
          <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {customerData?.hoTen || activeCall.callerNumber}
            </p>
            <p className="text-xs opacity-90">{formatDuration(callDuration)}</p>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </button>
          <button
            onClick={handleEndCall}
            className="bg-red-500 hover:bg-red-600 text-white rounded p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 21v-4a3 3 0 013-3h4l2 1h6a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-300 rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-lg font-semibold">Cuộc gọi đang kết nối</h3>
                <p className="text-sm opacity-90">
                  {customerData?.hoTen || activeCall.callerNumber} • {formatDuration(callDuration)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Voice Call Status Indicator */}
              {voiceCallActive && (
                <div className="flex items-center space-x-2 mr-2">
                  <div className={`w-2 h-2 rounded-full ${voiceCallConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                  <span className="text-xs opacity-90">
                    {voiceCallConnected ? 'Voice Connected' : 'Connecting...'}
                  </span>
                </div>
              )}
              
              {/* Mute/Unmute Button */}
              {voiceCallActive && onToggleMute && (
                <button
                  onClick={onToggleMute}
                  className={`p-1 rounded text-white hover:bg-opacity-80 transition-colors ${
                    isMuted ? 'bg-red-600' : 'bg-green-600'
                  }`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              )}
              
              <button
                onClick={() => setIsMinimized(true)}
                className="text-white hover:text-gray-200 p-1"
                title="Thu nhỏ"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={handleEndCall}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1 text-sm font-semibold"
              >
                Kết thúc
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-96">
          {/* Left Panel - Customer Info */}
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">
                <p>Lỗi tải dữ liệu</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : customerData ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-xl font-semibold">
                      {customerData.hoTen?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-lg">{customerData.hoTen}</h4>
                  <p className="text-gray-600 text-sm">CIF: {customerData.cifNumber}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm">{customerData.soDienThoai}</span>
                  </div>

                  {customerData.email && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <span className="text-sm">{customerData.email}</span>
                    </div>
                  )}

                  {customerData.chiNhanh && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-sm">{customerData.chiNhanh}</span>
                    </div>
                  )}

                  {customerData.segmentKH && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-sm">{customerData.segmentKH}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCreateTicket}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  Tạo Ticket
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p>Không tìm thấy thông tin khách hàng</p>
                <p className="text-sm">Số điện thoại: {activeCall.callerNumber}</p>
                <button
                  onClick={handleCreateTicket}
                  className="mt-3 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  Tạo Khách Hàng Mới
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Tabs */}
          <div className="flex-1 flex flex-col">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`px-4 py-2 font-semibold ${
                    activeTab === 'tickets'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Tickets ({customerTickets.length})
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 font-semibold ${
                    activeTab === 'notes'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Ghi chú cuộc gọi
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {activeTab === 'tickets' && (
                <div className="space-y-3">
                  {customerTickets.length > 0 ? (
                    customerTickets.map((ticket) => (
                      <div key={ticket.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-sm">Ticket #{ticket.id}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === 'New' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {ticket.discussionNotes || 'Không có ghi chú'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Chưa có ticket nào</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="h-full flex flex-col">
                  <textarea
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="Nhập ghi chú về cuộc gọi này..."
                    className="flex-1 w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Ghi chú sẽ được lưu khi kết thúc cuộc gọi
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerCallPopup;
