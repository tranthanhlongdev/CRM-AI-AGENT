import { useState, useEffect, useRef } from "react";
import callcenterService from "../services/callcenterService";

function Softphone({ isOpen, onClose, currentUsername, onCallEnd }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callStatus, setCallStatus] = useState("idle"); // idle, dialing, connected, incoming
  const [callDuration, setCallDuration] = useState(0);
  const [ccAgents, setCcAgents] = useState([]);
  const [ccLoading, setCcLoading] = useState(false);
  const [ccError, setCcError] = useState("");
  const [activeCall, setActiveCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isHold, setIsHold] = useState(false);
  const [isAgentsExpanded, setIsAgentsExpanded] = useState(false);

  const durationInterval = useRef(null);

  // Load agents list
  const refreshCcAgents = async () => {
    try {
      setCcLoading(true);
      setCcError("");
      const res = await callcenterService.listAgents();
      if (res.success) {
        setCcAgents(res.data.agents || []);
      } else {
        setCcError(res.message || "Không thể tải danh sách agent");
      }
    } catch {
      setCcError("Lỗi kết nối");
    } finally {
      setCcLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshCcAgents();
    }
  }, [isOpen]);

  // Handle call duration timer
  useEffect(() => {
    if (callStatus === "connected" && activeCall) {
      durationInterval.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    }
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [callStatus, activeCall]);

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle dialpad input
  const handleDialpadInput = (digit) => {
    if (callStatus === "idle") {
      setPhoneNumber((prev) => prev + digit);
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    if (callStatus === "idle") {
      setPhoneNumber((prev) => prev.slice(0, -1));
    }
  };

  // Handle clear
  const handleClear = () => {
    if (callStatus === "idle") {
      setPhoneNumber("");
    }
  };

  // Start outbound call
  const handleStartCall = async () => {
    if (!phoneNumber.trim()) return;

    try {
      setCallStatus("dialing");
      const res = await callcenterService.startCall({
        callId: `OUT-${Date.now()}`,
        from: currentUsername,
        to: phoneNumber,
        direction: "outbound",
      });

      if (res.success) {
        setActiveCall(res.data.call);
        setCallStatus("connected");
        setCallDuration(0);
      } else {
        setCallStatus("idle");
        setCcError(res.message || "Không thể thực hiện cuộc gọi");
      }
    } catch {
      setCallStatus("idle");
      setCcError("Lỗi kết nối");
    }
  };

  // Start internal call
  const handleInternalCall = async (agentUsername) => {
    if (agentUsername === currentUsername) return;

    try {
      setCallStatus("dialing");
      const res = await callcenterService.startCall({
        callId: `INT-${Date.now()}`,
        from: currentUsername,
        to: agentUsername,
        direction: "internal",
      });

      if (res.success) {
        setActiveCall(res.data.call);
        setCallStatus("connected");
        setCallDuration(0);
      } else {
        setCallStatus("idle");
        setCcError(res.message || "Không thể thực hiện cuộc gọi");
      }
    } catch {
      setCallStatus("idle");
      setCcError("Lỗi kết nối");
    }
  };

  // End call
  const handleEndCall = async () => {
    if (!activeCall) return;

    try {
      await callcenterService.endCall({
        callId: activeCall.callId,
        username: currentUsername,
      });

      setCallStatus("idle");
      setActiveCall(null);
      setCallDuration(0);
      setPhoneNumber("");
      onCallEnd?.();
      await refreshCcAgents();
    } catch {
      setCcError("Lỗi khi kết thúc cuộc gọi");
    }
  };

  // Transfer call
  const handleTransferCall = async (agentUsername) => {
    if (!activeCall || agentUsername === currentUsername) return;

    try {
      await callcenterService.transferCall({
        callId: activeCall.callId,
        from: currentUsername,
        to: agentUsername,
      });

      setCallStatus("idle");
      setActiveCall(null);
      setCallDuration(0);
      setPhoneNumber("");
      onCallEnd?.();
      await refreshCcAgents();
    } catch {
      setCcError("Lỗi khi chuyển cuộc gọi");
    }
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // TODO: Implement actual mute functionality
  };

  // Handle speaker toggle
  const handleSpeakerToggle = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // TODO: Implement actual speaker functionality
  };

  // Handle hold toggle
  const handleHoldToggle = () => {
    setIsHold(!isHold);
    // TODO: Implement actual hold functionality
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300 ease-in-out z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Softphone */}
      <div className="fixed bottom-4 left-4 z-50">
        <div
          className={`bg-white rounded-2xl shadow-2xl w-80 max-h-[85vh] overflow-hidden transform transition-all duration-300 ease-in-out ${
            isOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-full opacity-0 scale-95"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold">Softphone</h2>
                  <p className="text-xs text-blue-100">
                    {callStatus === "idle" && "Sẵn sàng"}
                    {callStatus === "dialing" && "Đang gọi..."}
                    {callStatus === "connected" &&
                      `Đang gọi - ${formatDuration(callDuration)}`}
                    {callStatus === "incoming" && "Cuộc gọi đến"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Call Display */}
          <div className="px-4 py-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-gray-800 mb-2 tracking-wider">
                {callStatus === "connected"
                  ? activeCall?.to
                  : phoneNumber || "Number"}
              </div>
              {callStatus === "connected" && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-700">
                    {formatDuration(callDuration)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {ccError && (
            <div className="px-4 py-2">
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                {ccError}
              </div>
            </div>
          )}

          {/* Call Controls */}
          {callStatus === "connected" && (
            <div className="px-4 py-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleMuteToggle}
                  className={`group relative h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                    isMuted
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 shadow-lg"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMuted ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    )}
                  </svg>
                  <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {isMuted ? "Bỏ tắt tiếng" : "Tắt tiếng"}
                  </span>
                </button>

                <button
                  onClick={handleHoldToggle}
                  className={`group relative h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                    isHold
                      ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 shadow-lg"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {isHold ? "Tiếp tục" : "Tạm dừng"}
                  </span>
                </button>

                <button
                  onClick={handleSpeakerToggle}
                  className={`group relative h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                    isSpeakerOn
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 shadow-lg"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                  <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {isSpeakerOn ? "Tắt loa" : "Bật loa"}
                  </span>
                </button>

                <button
                  onClick={handleEndCall}
                  className="group relative h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg shadow-red-500/30"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Kết thúc
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Dialpad */}
          {callStatus === "idle" && (
            <div className="px-4 py-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
              <div className="grid grid-cols-3 gap-3 justify-items-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleDialpadInput(digit)}
                    className="h-12 w-12 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 shadow-md"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={() => handleDialpadInput("*")}
                  className="h-12 w-12 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 shadow-md"
                >
                  *
                </button>
                <button
                  onClick={() => handleDialpadInput(0)}
                  className="h-12 w-12 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 shadow-md"
                >
                  0
                </button>
                <button
                  onClick={() => handleDialpadInput("#")}
                  className="h-12 w-12 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-lg flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 shadow-md"
                >
                  #
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={handleBackspace}
                  className="h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 012.828 0L21 12M4.5 12H19.5"
                    />
                  </svg>
                </button>

                <button
                  onClick={handleClear}
                  className="h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleStartCall}
                disabled={!phoneNumber.trim()}
                className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-base hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/30 disabled:shadow-none"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Gọi ngay
              </button>
            </div>
          )}

          {/* Agents List - Collapsible */}
          <div className="bg-gradient-to-b from-gray-50 to-white">
            {/* Agents Header with Toggle */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsAgentsExpanded(!isAgentsExpanded)}
                  className="flex items-center gap-2 text-gray-800 hover:text-blue-600 transition-colors duration-200"
                >
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Agents Online
                  </h3>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isAgentsExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={refreshCcAgents}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors duration-200 flex items-center gap-1"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Làm mới
                </button>
              </div>
            </div>

            {/* Agents Content - Collapsible */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isAgentsExpanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-4 py-3 max-h-48 overflow-auto">
                {ccLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-full border border-blue-200">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-xs font-medium text-blue-700">
                        Đang tải...
                      </span>
                    </div>
                  </div>
                ) : ccAgents.length > 0 ? (
                  <div className="space-y-2">
                    {ccAgents
                      .filter((agent) => agent.username !== currentUsername)
                      .map((agent) => (
                        <div
                          key={agent.username}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg">
                                {agent.username.charAt(0).toUpperCase()}
                              </div>
                              <div
                                className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                                  agent.status === "available"
                                    ? "bg-green-500"
                                    : agent.status === "on_call"
                                    ? "bg-red-500"
                                    : agent.status === "busy"
                                    ? "bg-yellow-500"
                                    : "bg-gray-400"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {agent.username}
                              </div>
                              <div className="text-xs text-gray-600">
                                {agent.status === "available"
                                  ? "Sẵn sàng"
                                  : agent.status === "on_call"
                                  ? "Đang gọi"
                                  : agent.status === "busy"
                                  ? "Bận"
                                  : "Offline"}
                                {agent.currentCallId &&
                                  ` • ${agent.currentCallId}`}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {callStatus === "connected" ? (
                              <button
                                onClick={() =>
                                  handleTransferCall(agent.username)
                                }
                                disabled={agent.status !== "available"}
                                className="px-3 py-1 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/30 font-medium disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                              >
                                Chuyển
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleInternalCall(agent.username)
                                }
                                disabled={agent.status !== "available"}
                                className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg shadow-green-500/30 font-medium disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                              >
                                Gọi ngay
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full border border-gray-200">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">
                        Không có agent nào online
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Softphone;
