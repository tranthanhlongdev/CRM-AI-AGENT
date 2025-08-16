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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Quản lý Ticket
            </h3>
            <p className="text-xs text-gray-500">
              Danh sách ticket (lọc từ Thông tin khách hàng + Thông tin nhập
              liệu)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
              placeholder="Tìm theo tên, CIF, SĐT"
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
          <select
            value={branchFilter}
            onChange={(e) => {
              setPage(1);
              setBranchFilter(e.target.value);
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="">Tất cả chi nhánh</option>
            <option value="CN Nam Từ Liêm">CN Nam Từ Liêm</option>
            <option value="CN Cầu Giấy">CN Cầu Giấy</option>
            <option value="CN Mới">CN Mới</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md">
            <option value="">Tất cả trạng thái</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Pending</option>
            <option>Closed</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md">
            <option value="">Tất cả ưu tiên</option>
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md">
            <option value="">Tất cả kênh</option>
            <option>Inbound</option>
            <option>Outbound</option>
            <option>Digital</option>
          </select>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-md">
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
            Đang tải...
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {/* Mobile cards */}
            <div className="grid sm:hidden gap-3 p-3">
              {rows.map((r, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 bg-white shadow-sm"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {r.campaignName}
                  </div>
                  <div className="text-xs text-gray-600">
                    {r.customerName} • {r.phone}
                  </div>
                  <div className="text-xs text-gray-600">
                    CIF: {r.cif} • {r.branch}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {r.status}
                    </span>
                    <button
                      onClick={() =>
                        onSelectTicket?.({ cifNumber: r.cif, selectedRow: r })
                      }
                      className="text-sm text-blue-600"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-6">
                  Không có dữ liệu
                </div>
              )}
            </div>

            {/* Desktop table */}
            <table className="hidden sm:table min-w-full table-fixed">
              <thead className="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left w-56">Ticket</th>
                  <th className="px-3 py-2 text-left w-40">Người phụ trách</th>
                  <th className="px-3 py-2 text-left w-48">Khách hàng</th>
                  <th className="px-3 py-2 text-left w-36">SĐT</th>
                  <th className="px-3 py-2 text-left w-36">CIF</th>
                  <th className="px-3 py-2 text-left w-40">Chi nhánh</th>
                  <th className="px-3 py-2 text-left w-28">Trạng thái</th>
                  <th className="px-3 py-2 text-right w-28">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 truncate">{r.campaignName}</td>
                    <td className="px-3 py-2 truncate">{r.handler}</td>
                    <td className="px-3 py-2 truncate">{r.customerName}</td>
                    <td className="px-3 py-2 truncate">{r.phone}</td>
                    <td className="px-3 py-2 truncate">{r.cif}</td>
                    <td className="px-3 py-2 truncate">{r.branch}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() =>
                          onSelectTicket?.({ cifNumber: r.cif, selectedRow: r })
                        }
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-6 text-center text-sm text-gray-500"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
          <div className="text-xs text-gray-600">Tổng: {totalRecords}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
              disabled={page <= 1}
            >
              Trước
            </button>
            <span className="text-sm text-gray-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
              disabled={page >= totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignList;
