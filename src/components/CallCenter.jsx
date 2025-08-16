import { useEffect, useMemo, useState } from "react";
import callcenterService from "../services/callcenterService";

function CallCenter() {
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [error, setError] = useState("");
  const [myStatus, setMyStatus] = useState("offline");
  const [username, setUsername] = useState("");
  const [outboundTo, setOutboundTo] = useState("");
  const [currentCallId, setCurrentCallId] = useState("");
  const [transferringTo, setTransferringTo] = useState("");

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

  useEffect(() => {
    refreshAgents();
  }, []);

  const onUpdateStatus = async (status) => {
    if (!username) return;
    try {
      setMyStatus(status);
      await callcenterService.updateAgentStatus({ username, status });
      refreshAgents();
    } catch (e) {
      setError(e?.message || "Không cập nhật được trạng thái");
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
      await callcenterService.endCall({ callId: currentCallId, username });
      setCurrentCallId("");
      refreshAgents();
    } catch (e) {
      setError(e?.message || "Không kết thúc được cuộc gọi");
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
    </div>
  );
}

export default CallCenter;
