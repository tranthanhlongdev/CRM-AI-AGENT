import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import userService from "../services/userService";

const CustomerForm = forwardRef(function CustomerForm({ prefill }, ref) {
  const callerName = prefill?.hoTen || prefill?.name || "";
  const callerPhone = prefill?.soDienThoai || prefill?.phone || "";
  const callerCif = prefill?.cifNumber || prefill?.cif || "";

  // Form state (Thông tin nhập liệu)
  const [product, setProduct] = useState(prefill?.product || "");
  const [operation, setOperation] = useState(prefill?.operation || "");
  const [resolutionDirection, setResolutionDirection] = useState(
    prefill?.resolutionDirection || "Tự xử lý"
  );
  const [departmentCode, setDepartmentCode] = useState(
    prefill?.departmentCode || ""
  );
  const [callResult, setCallResult] = useState(
    prefill?.callResult || "KH không nghe máy"
  );
  const [discussionNotes, setDiscussionNotes] = useState(
    prefill?.discussionNotes || ""
  );
  const [resolutionSummary, setResolutionSummary] = useState(
    prefill?.resolutionSummary || ""
  );
  const [files, setFiles] = useState([]);
  const [priority, setPriority] = useState(prefill?.priority || "Normal");
  const [status, setStatus] = useState(prefill?.status || "New");
  const [channel, setChannel] = useState(prefill?.channel || "Inbound");
  const [assignedTo, setAssignedTo] = useState(prefill?.assignedTo || "");
  const [agentOptions, setAgentOptions] = useState([]);

  // Sync when prefill changes (e.g., load ticket detail after click)
  useEffect(() => {
    setProduct(prefill?.product || "");
    setOperation(prefill?.operation || "");
    setResolutionDirection(prefill?.resolutionDirection || "Tự xử lý");
    setDepartmentCode(prefill?.departmentCode || "");
    setCallResult(prefill?.callResult || "KH không nghe máy");
    setDiscussionNotes(prefill?.discussionNotes || "");
    setResolutionSummary(prefill?.resolutionSummary || "");
    setPriority(prefill?.priority || "Normal");
    setStatus(prefill?.status || "New");
    setChannel(prefill?.channel || "Inbound");
    setAssignedTo(prefill?.assignedTo || "");
  }, [prefill?.ticketId, prefill?.product, prefill?.operation, prefill?.resolutionDirection, prefill?.departmentCode, prefill?.callResult, prefill?.discussionNotes, prefill?.resolutionSummary]);

  // Load agent options for assignment
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await userService.listUsers({
          page: 1,
          limit: 50,
          isActive: true,
        });
        if (!mounted) return;
        const users = res?.data?.users || [];
        setAgentOptions(
          users.map((u) => ({
            username: u.username,
            fullName: u.fullName || u.username,
          }))
        );
      } catch {
        setAgentOptions([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Expose payload for saving ticket
  useImperativeHandle(ref, () => ({
    getTicketPayload: () => ({
      cifNumber: callerCif || undefined,
      customerName: callerName || undefined,
      phone: callerPhone || undefined,
      // Quản trị ticket
      priority: priority || "Normal",
      channel: channel || "Inbound",
      assignedTo: assignedTo || null,
      status: status || "New",
      // From form
      product: product || null,
      operation: operation || null,
      resolutionDirection: resolutionDirection || null,
      departmentCode: departmentCode || null,
      callResult: callResult || null,
      discussionNotes: discussionNotes || null,
      resolutionSummary: resolutionSummary || null,
      attachments: [],
      // Optional context
      branch: prefill?.chiNhanh || null,
      segment: prefill?.segmentKH || null,
    }),
    getAttachments: () => files,
  }));
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Thông tin nhập liệu
          </h3>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600">
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
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
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Thông tin chung header */}
        <div className="border-b border-gray-200 pb-2">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900">
              Thông tin chung
            </h4>
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Nội dung 1 with blue bar and controls */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Nội dung 1
              </span>
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
          <div className="w-full h-2 bg-blue-600 rounded"></div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Sản phẩm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sản phẩm*
            </label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="nhập sản phẩm"
            />
          </div>

          {/* Nghiệp vụ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nghiệp vụ*
            </label>
            <input
              type="text"
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="nhập nghiệp vụ"
            />
          </div>
        </div>

        {/* Quản trị ticket: Ưu tiên, Trạng thái, Kênh, Người phụ trách */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ưu tiên
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Low</option>
              <option>Normal</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>New</option>
              <option>In Progress</option>
              <option>Pending</option>
              <option>Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kênh
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Inbound</option>
              <option>Outbound</option>
              <option>Digital</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Người phụ trách
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Chọn —</option>
              {agentOptions.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.fullName} ({u.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto-filled caller info */}


        {/* Two column layout row 2 */}
        <div className="grid grid-cols-2 gap-4">
          {/* Hướng xử lý */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hướng xử lý*
            </label>
            <select
              value={resolutionDirection}
              onChange={(e) => setResolutionDirection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Tự xử lý</option>
              <option>Chuyển tiếp</option>
              <option>Tư vấn</option>
            </select>
          </div>

          {/* Mã phòng ban xử lý */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã phòng ban xử lý
            </label>
            <select
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Chọn mã phòng ban xử lý</option>
              <option value="PB001">PB001</option>
              <option value="PB002">PB002</option>
            </select>
          </div>
        </div>

        {/* Đính kèm file */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đính kèm file
          </label>
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center bg-blue-50">
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="block w-full text-sm text-gray-700"
            />
            {files?.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                Đã chọn {files.length} tệp
              </div>
            )}
          </div>
        </div>

        {/* Kết quả cuộc gọi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kết quả cuộc gọi*
          </label>
          <select
            value={callResult}
            onChange={(e) => setCallResult(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>KH không nghe máy</option>
            <option>KH quan tâm</option>
            <option>KH từ chối</option>
            <option>Không liên hệ được</option>
          </select>
        </div>

        {/* Nội dung trao đổi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung trao đổi
          </label>
          <textarea
            value={discussionNotes}
            onChange={(e) => setDiscussionNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
            placeholder="‹nội dung trao đổi›"
          />
        </div>

        {/* Tóm tắt cách xử lý */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tóm tắt cách xử lý
          </label>
          <textarea
            value={resolutionSummary}
            onChange={(e) => setResolutionSummary(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
            placeholder="‹tóm tắt cách xử lý›"
          />
        </div>
      </div>

      {/* Action Buttons */}
      {/* <div className="p-4 border-t border-gray-200">
        <div className="w-full bg-gray-300 h-8 rounded"></div>
      </div> */}
    </div>
  );
});

export default CustomerForm;
