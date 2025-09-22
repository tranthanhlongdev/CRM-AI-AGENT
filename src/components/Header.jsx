import { useEffect, useRef, useState } from "react";
import callcenterService from "../services/callcenterService";

function Header({
  callCenterStatus = "offline",
  onChangeCallStatus,
  currentCallId,
  onCallIdChange,
  onPhoneToggle,
}) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [ccAgents, setCcAgents] = useState([]);
  const [ccLoading, setCcLoading] = useState(false);
  const [ccError, setCcError] = useState("");

  const menuRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const raw =
      localStorage.getItem("currentUser") ||
      sessionStorage.getItem("currentUser");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("currentUser");
    window.location.reload();
  };

  const displayName = user?.fullName || user?.username || "Người dùng";
  const initials =
    (displayName.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase() ||
    "U";
  const role = user?.role || "user";

  // Đóng menu khi click ra ngoài, tăng z-index và sticky header
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuOpen) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  // Callcenter status label & dot
  const statusLabel =
    callCenterStatus === "available"
      ? "Available"
      : callCenterStatus === "busy"
      ? "Busy"
      : "Offline";
  const statusDot =
    callCenterStatus === "available"
      ? "bg-green-500"
      : callCenterStatus === "busy"
      ? "bg-amber-500"
      : "bg-gray-400";

  // Close status dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!statusOpen) return;
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [statusOpen]);



  const refreshCcAgents = async () => {
    try {
      setCcLoading(true);
      setCcError("");
      const res = await callcenterService.listAgents();
      const list = res?.data?.agents || [];
      setCcAgents(Array.isArray(list) ? list : []);
    } catch (e) {
      setCcError(e?.message || "Không tải được agent");
    } finally {
      setCcLoading(false);
    }
  };

  const currentUsername = user?.username || "";

  const handleStartCallToAgent = async (targetUsername) => {
    if (!currentUsername || !targetUsername) return;
    const callId = `CALL_${Date.now()}`;
    try {
      await callcenterService.startCall({
        callId,
        from: currentUsername,
        to: targetUsername,
        direction: "internal",
      });
      onCallIdChange?.(callId);
      await refreshCcAgents();
    } catch (e) {
      setCcError(e?.message || "Không thể bắt đầu cuộc gọi");
    }
  };

  const handleEndCall = async () => {
    if (!currentCallId || !currentUsername) return;
    try {
      await callcenterService.endCall({
        callId: currentCallId,
        username: currentUsername,
      });
      onCallIdChange?.("");
      await refreshCcAgents();
    } catch (e) {
      setCcError(e?.message || "Không thể kết thúc cuộc gọi");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: menu + callcenter status */}
        <div className="flex items-center gap-3">
          <button className="text-gray-500 hover:text-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {/* Softphone trigger */}
          <div className="relative">
            <button
              onClick={() => {
                onPhoneToggle?.();
                refreshCcAgents();
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Softphone"
            >
              <svg
                className="w-4 h-4 text-gray-600"
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
              <span className="hidden sm:inline">Phone</span>
            </button>
          </div>
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${statusDot}`}
              />
              <span className="hidden sm:inline">Trạng thái</span>
              <strong>{statusLabel}</strong>
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {statusOpen && (
              <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {["available", "busy", "offline"].map((st) => (
                  <button
                    key={st}
                    onClick={async () => {
                      onChangeCallStatus?.(st);
                      setStatusOpen(false);
                      try {
                        const raw =
                          localStorage.getItem("currentUser") ||
                          sessionStorage.getItem("currentUser");
                        const me = raw ? JSON.parse(raw) : {};
                        const username = me?.username;
                        if (username) {
                          await callcenterService.updateAgentStatus({
                            username,
                            status: st,
                          });
                        }
                      } catch {}
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                      callCenterStatus === st ? "bg-gray-50" : ""
                    }`}
                  >
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        st === "available"
                          ? "bg-green-500"
                          : st === "busy"
                          ? "bg-amber-500"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="capitalize">{st}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: search + user */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              aria-label="Tìm kiếm"
              className="pl-8 pr-3 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-2.5 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-gray-800">
                  {displayName}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 capitalize">
                  {role}
                </span>
              </div>
              <svg
                className="w-4 h-4 text-gray-500 hidden sm:block"
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

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "Đã xác thực"}
                  </p>
                </div>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                  Hồ sơ cá nhân
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}

export default Header;
