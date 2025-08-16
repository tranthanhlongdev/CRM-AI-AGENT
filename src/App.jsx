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
              setUser(JSON.parse(raw));
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
  }, []);

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
                      try {
                        const payload =
                          window.__customerFormRef?.getTicketPayload?.();
                        if (!payload?.cifNumber) {
                          alert("Thiếu CIF để lưu ticket");
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
                          alert("Cập nhật ticket thành công");
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
                          alert("Tạo ticket mới thành công");
                        }
                      } catch (e) {
                        alert(e?.message || "Lỗi lưu ticket");
                      }
                    }}
                    className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            )}
          </>
        ) : currentView === "overview" ? (
          <OverviewDashboard />
        ) : currentView === "customers" ? (
          <CustomerManagement />
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

        {/* Bỏ modal tạo campaign theo yêu cầu */}
      </div>
    </div>
  );
}

export default App;
