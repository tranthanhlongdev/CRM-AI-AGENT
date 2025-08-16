import { useCallback, useEffect, useMemo, useState } from "react";
import customerService from "../services/customerService";
import ticketService from "../services/ticketService";

function CampaignList({ onSelectTicket, extraItems = [] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      // Ưu tiên gọi API ticket search nếu đã có backend
      let res = null;
      try {
        res = await ticketService.searchTickets({
          searchTerm,
          branch: branchFilter,
          page,
          limit,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
      } catch (e) {
        // fallback: reuse customer search để hiển thị demo
        res = await customerService.searchCustomers({
          searchTerm,
          page,
          limit,
          sortBy: "ngayMoTK",
          sortOrder: "desc",
          chiNhanh: branchFilter,
        });
      }

      const list =
        res?.data?.tickets ||
        res?.data?.customers ||
        res?.data?.users ||
        res?.data ||
        [];
      const pagination = res?.data?.pagination || res?.pagination || {};
      setItems(Array.isArray(list) ? list : []);
      setPage(pagination.currentPage || page);
      setTotalPages(pagination.totalPages || 1);
      setTotalRecords(
        pagination.totalRecords || (Array.isArray(list) ? list.length : 0)
      );
      setLimit(pagination.limit || limit);
    } catch (e) {
      setError(e?.message || "Không thể tải danh sách campaign");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, limit, branchFilter]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const rows = useMemo(() => {
    // Map dữ liệu khách hàng sang bản ghi cuộc gọi campaign (demo)
    const base = items.map((c, idx) => {
      // map cho 2 trường hợp: là ticket thật hoặc fallback từ customers
      const isTicket = c?.code || c?.priority || c?.status;
      if (isTicket) {
        return {
          id: c.id,
          code: c.code,
          campaignName:
            c.code || `Ticket ${c.segment || "—"} - ${c.branch || "—"}`,
          handler: c.assignedTo || "Manual",
          customerName: c.customerName || "Khách hàng",
          phone: c.phone || "—",
          cif: c.cifNumber || "—",
          branch: c.branch || "—",
          status: c.status || "New",
          product: c.product,
          operation: c.operation,
          resolutionDirection: c.resolutionDirection,
          departmentCode: c.departmentCode,
          callResult: c.callResult,
          discussionNotes: c.discussionNotes,
          resolutionSummary: c.resolutionSummary,
        };
      }
      const cif =
        c.cifNumber || c.cif || `CIF-D${idx.toString().padStart(6, "0")}`;
      const name = c.hoTen || c.fullName || c.name || "Khách hàng";
      const phone = c.soDienThoai || c.phone || "—";
      const branch = c.chiNhanh || c.branch || "—";
      const segment = c.segmentKH || c.segment || "—";
      const campaignName = `Ticket ${segment} - ${branch}`;
      return {
        id: null,
        code: null,
        campaignName,
        handler: c.nhanVienQuanLy || "AutoDialer",
        customerName: name,
        phone,
        cif,
        branch,
        status: c.trangThaiKH || "New",
      };
    });
    const extrasMapped = (extraItems || []).map((p) => ({
      campaignName:
        p.campaignName ||
        p.name ||
        `Campaign ${p.segment || "—"} - ${p.branch || "—"}`,
      handler: p.assignedTo || "Manual",
      customerName: p.customer?.name || p.customerName || "Khách hàng",
      phone: p.customer?.phone || p.phone || "—",
      cif: p.customer?.cifNumber || p.customerCif || p.cif || "—",
      branch: p.customer?.branch || p.branch || "—",
      status: p.status || "New",
    }));
    return [...extrasMapped, ...base];
  }, [items, extraItems]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "closed":
        return "bg-green-100 text-green-800";
      case "hoạt động":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Quản lý Ticket
            </h3>
            <p className="text-xs text-gray-500">
              Danh sách ticket (lọc từ Thông tin khách hàng + Thông tin nhập
              liệu)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                value={searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setSearchTerm(e.target.value);
                }}
                placeholder="Tìm theo tên, CIF, SĐT"
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <select
            value={branchFilter}
            onChange={(e) => {
              setPage(1);
              setBranchFilter(e.target.value);
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả chi nhánh</option>
            <option value="CN Nam Từ Liêm">CN Nam Từ Liêm</option>
            <option value="CN Cầu Giấy">CN Cầu Giấy</option>
            <option value="CN Mới">CN Mới</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Tất cả trạng thái</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Pending</option>
            <option>Closed</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Tất cả ưu tiên</option>
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Tất cả kênh</option>
            <option>Inbound</option>
            <option>Outbound</option>
            <option>Digital</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Tất cả phân công</option>
            <option>AutoDialer</option>
            <option>Manual</option>
          </select>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col">
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-200">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex-1 grid place-items-center text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Đang tải...</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {/* Mobile cards */}
            <div className="grid sm:hidden gap-3 p-3">
              {rows.map((r, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {r.campaignName}
                      </h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>{r.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-3 h-3 text-gray-400"
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
                          <span>{r.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>CIF: {r.cif}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span>{r.branch}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                      <button
                        onClick={() =>
                          onSelectTicket?.({ cifNumber: r.cif, selectedRow: r })
                        }
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>Không có dữ liệu</p>
                </div>
              )}
            </div>

            {/* Desktop table */}
            <table className="hidden sm:table min-w-full">
              <thead className="bg-white border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-64">
                    Ticket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                    Người phụ trách
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">
                    SĐT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">
                    CIF
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                    Chi nhánh
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {r.campaignName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{r.handler}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {r.customerName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 font-mono">
                        {r.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-blue-600 font-mono font-medium">
                        {r.cif}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{r.branch}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          onSelectTicket?.({ cifNumber: r.cif, selectedRow: r })
                        }
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-gray-500"
                    >
                      <svg
                        className="mx-auto h-12 w-12 text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p>Không có dữ liệu</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 bg-white border-t border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">
            Tổng:{" "}
            <span className="font-medium text-gray-900">{totalRecords}</span>{" "}
            bản ghi
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page <= 1}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page >= totalPages}
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignList;
