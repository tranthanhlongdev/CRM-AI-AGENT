import { useMemo, useState } from "react";

const MOCK_PRODUCTS = [
  {
    code: "TKTT",
    name: "Tài khoản thanh toán",
    category: "Tiền gửi",
    status: "Đang cung cấp",
  },
  {
    code: "TKTK",
    name: "Tiết kiệm có kỳ hạn",
    category: "Tiền gửi",
    status: "Đang cung cấp",
  },
  {
    code: "TDTC",
    name: "Thẻ tín dụng Platinum",
    category: "Thẻ",
    status: "Tạm dừng",
  },
  {
    code: "KHCN",
    name: "Khoản vay cá nhân",
    category: "Tín dụng",
    status: "Đang cung cấp",
  },
];

function ProductAdmin() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const okSearch = `${p.code} ${p.name}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const okCategory = category === "all" || p.category === category;
      const okStatus = status === "all" || p.status === status;
      return okSearch && okCategory && okStatus;
    });
  }, [search, category, status]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã/tên sản phẩm"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả nhóm</option>
            <option value="Tiền gửi">Tiền gửi</option>
            <option value="Thẻ">Thẻ</option>
            <option value="Tín dụng">Tín dụng</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang cung cấp">Đang cung cấp</option>
            <option value="Tạm dừng">Tạm dừng</option>
          </select>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                MÃ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                TÊN SẢN PHẨM
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                NHÓM
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                TRẠNG THÁI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                HÀNH ĐỘNG
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((p) => (
              <tr key={p.code} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-blue-600">{p.code}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      p.status === "Đang cung cấp"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      title="Xem"
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
                    <button
                      className="text-green-600 hover:text-green-800"
                      title="Sửa"
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
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      title="Ngừng cung cấp"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductAdmin;
