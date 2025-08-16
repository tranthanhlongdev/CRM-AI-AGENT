import { useEffect, useMemo, useState } from "react";
import ticketService from "../services/ticketService";

function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const res = await ticketService.searchTickets({
          searchTerm,
          branch: branchFilter,
          page: 1,
          limit,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        const list = res?.data?.tickets || res?.data || [];
        setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        setItems([]);
        setError(e?.message || "Không thể tải dữ liệu báo cáo");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, branchFilter, limit]);

  const metrics = useMemo(() => {
    const byStatus = new Map();
    const byPriority = new Map();
    const byBranch = new Map();
    for (const t of items) {
      const status = t?.status || "Unknown";
      const prio = t?.priority || "Unknown";
      const branch = t?.branch || "—";
      byStatus.set(status, (byStatus.get(status) || 0) + 1);
      byPriority.set(prio, (byPriority.get(prio) || 0) + 1);
      byBranch.set(branch, (byBranch.get(branch) || 0) + 1);
    }
    const toArr = (m) =>
      Array.from(m.entries()).map(([k, v]) => ({ key: k, value: v }));
    return {
      total: items.length,
      byStatus: toArr(byStatus),
      byPriority: toArr(byPriority),
      byBranch: toArr(byBranch)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
    };
  }, [items]);

  const exportToCsv = () => {
    const headers = [
      "ID",
      "Mã Ticket",
      "Khách hàng",
      "SĐT",
      "CIF",
      "Chi nhánh",
      "Trạng thái",
      "Ưu tiên",
      "Sản phẩm",
      "Nghiệp vụ",
      "Hướng xử lý",
      "Phòng ban",
      "KQ cuộc gọi",
      "Ghi chú",
    ];
    const rows = items.map((t) => [
      t?.id ?? "",
      t?.code ?? "",
      t?.customerName ?? "",
      t?.phone ?? "",
      t?.cifNumber ?? "",
      t?.branch ?? "",
      t?.status ?? "",
      t?.priority ?? "",
      t?.product ?? "",
      t?.operation ?? "",
      t?.resolutionDirection ?? "",
      t?.departmentCode ?? "",
      t?.callResult ?? "",
      (t?.discussionNotes || t?.resolutionSummary || "")
        .toString()
        .replace(/\n/g, " "),
    ]);

    const csvContent = [headers, ...rows]
      .map((r) =>
        r
          .map((v) => {
            const s = v == null ? "" : String(v);
            if (s.includes(",") || s.includes("\n") || s.includes('"')) {
              return '"' + s.replace(/"/g, '""') + '"';
            }
            return s;
          })
          .join(",")
      )
      .join("\n");

    // BOM để Excel hiển thị Unicode đúng
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Báo cáo Ticket
            </h3>
            <p className="text-xs text-gray-500">Xem tổng hợp và xuất Excel</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, CIF, SĐT, mã ticket"
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="">Tất cả chi nhánh</option>
              <option value="CN Nam Từ Liêm">CN Nam Từ Liêm</option>
              <option value="CN Cầu Giấy">CN Cầu Giấy</option>
              <option value="CN Mới">CN Mới</option>
            </select>
            <button
              onClick={() => exportToCsv()}
              className="px-3 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 text-sm text-red-700 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500">Tổng số ticket</div>
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? "…" : metrics.total}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-2">Theo trạng thái</div>
            <div className="flex flex-wrap gap-2">
              {metrics.byStatus.map((s) => (
                <span
                  key={s.key}
                  className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700"
                >
                  {s.key}: {s.value}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-2">Theo ưu tiên</div>
            <div className="flex flex-wrap gap-2">
              {metrics.byPriority.map((s) => (
                <span
                  key={s.key}
                  className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-700"
                >
                  {s.key}: {s.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Top branches */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900 mb-2">
            Top chi nhánh theo số ticket
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.byBranch.map((b) => (
              <span
                key={b.key}
                className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-700 border"
              >
                {b.key}: {b.value}
              </span>
            ))}
            {!loading && metrics.byBranch.length === 0 && (
              <span className="text-xs text-gray-500">Không có dữ liệu</span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-auto">
          <table className="min-w-full table-fixed">
            <thead className="bg-gray-50 text-xs text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left w-36">Mã Ticket</th>
                <th className="px-3 py-2 text-left w-40">Khách hàng</th>
                <th className="px-3 py-2 text-left w-32">SĐT</th>
                <th className="px-3 py-2 text-left w-32">CIF</th>
                <th className="px-3 py-2 text-left w-40">Chi nhánh</th>
                <th className="px-3 py-2 text-left w-28">Trạng thái</th>
                <th className="px-3 py-2 text-left w-28">Ưu tiên</th>
                <th className="px-3 py-2 text-left w-48">Sản phẩm</th>
                <th className="px-3 py-2 text-left w-48">Nghiệp vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-6 text-center text-sm text-gray-600"
                  >
                    Đang tải…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-6 text-center text-sm text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                items.map((t, i) => (
                  <tr key={t?.id || i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 truncate">{t?.code || "—"}</td>
                    <td className="px-3 py-2 truncate">
                      {t?.customerName || "—"}
                    </td>
                    <td className="px-3 py-2 truncate">{t?.phone || "—"}</td>
                    <td className="px-3 py-2 truncate">
                      {t?.cifNumber || "—"}
                    </td>
                    <td className="px-3 py-2 truncate">{t?.branch || "—"}</td>
                    <td className="px-3 py-2 truncate">
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {t?.status || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 truncate">{t?.priority || "—"}</td>
                    <td className="px-3 py-2 truncate">{t?.product || "—"}</td>
                    <td className="px-3 py-2 truncate">
                      {t?.operation || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
