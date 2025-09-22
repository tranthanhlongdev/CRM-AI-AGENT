import { useState, useEffect } from 'react';

function IncomingCallNotification({ 
  incomingCall, 
  onAccept, 
  onDecline, 
  onClose 
}) {
  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(true);

  useEffect(() => {
    if (!incomingCall) return;

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Auto decline after 30 seconds
    const autoDeclineTimer = setTimeout(() => {
      onDecline();
    }, 30000);

    // Ringing animation
    const ringTimer = setInterval(() => {
      setIsRinging(prev => !prev);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoDeclineTimer);
      clearInterval(ringTimer);
    };
  }, [incomingCall, onDecline]);

  if (!incomingCall) return null;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      {/* Incoming Call Modal */}
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
        isRinging ? 'scale-105' : 'scale-100'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full animate-pulse ${
                isRinging ? 'bg-yellow-300' : 'bg-green-300'
              }`}></div>
              <h3 className="text-lg font-semibold">Cuộc gọi đến</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Call Info */}
        <div className="p-6 text-center">
          {/* Caller Avatar */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          {/* Caller Info */}
          <h4 className="text-xl font-semibold text-gray-800 mb-2">
            {incomingCall.customerInfo?.fullName || incomingCall.callerName || 'Khách hàng'}
          </h4>
          <p className="text-gray-600 mb-1">
            📞 {incomingCall.callerNumber || 'Không xác định'}
          </p>
          {incomingCall.calledNumber && (
            <p className="text-gray-600 mb-1">
              📞 Gọi đến: {incomingCall.calledNumber}
            </p>
          )}
          {incomingCall.customerInfo && (
            <>
              <p className="text-gray-600 mb-1">
                🆔 CIF: {incomingCall.customerInfo.cif || incomingCall.customerInfo.cifNumber || 'N/A'}
              </p>
              {incomingCall.customerInfo.email && (
                <p className="text-gray-600 mb-1">
                  📧 Email: {incomingCall.customerInfo.email}
                </p>
              )}
              <p className="text-gray-600 mb-1">
                🏢 Chi nhánh: {incomingCall.customerInfo.chiNhanh || 'N/A'}
              </p>
            </>
          )}

          {/* Call Duration */}
          <div className="bg-gray-100 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-600">Thời gian đổ chuông</p>
            <p className="text-lg font-mono font-semibold text-gray-800">
              {formatDuration(callDuration)}
            </p>
          </div>

          {/* Source Info */}
          <div className="text-xs text-gray-500 mb-4">
            {incomingCall.source === 'softphone' && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                📱 Softphone
              </span>
            )}
            {incomingCall.assignedAgent && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full ml-2">
                👤 {incomingCall.assignedAgent.fullName} (#{incomingCall.assignedAgent.id})
              </span>
            )}
            {incomingCall.status && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                📞 {incomingCall.status}
              </span>
            )}
            {incomingCall.callId && (
              <div className="mt-1">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  🆔 Call ID: {incomingCall.callId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 p-6 pt-0">
          {/* Decline Button */}
          <button
            onClick={onDecline}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 21v-4a3 3 0 013-3h4l2 1h6a3 3 0 013 3v1" />
            </svg>
            <span>Từ chối</span>
          </button>

          {/* Accept Button */}
          <button
            onClick={onAccept}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Bắt máy</span>
          </button>
        </div>

        {/* Auto decline warning */}
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-500 text-center">
            Cuộc gọi sẽ tự động bị từ chối sau {30 - callDuration} giây
          </p>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallNotification;
