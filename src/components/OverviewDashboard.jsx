function StatCard({ title, value, delta, icon, accent = "blue" }) {
  const accentMap = {
    blue: "from-blue-500 to-indigo-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-violet-500",
    orange: "from-orange-500 to-amber-500",
  };
  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 flex items-center gap-4">
      <div
        className={`h-12 w-12 rounded-lg bg-gradient-to-br ${accentMap[accent]} text-white flex items-center justify-center`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-xl font-semibold text-gray-900">{value}</p>
          {delta && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                delta.startsWith("+")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {delta}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniBar({ label, value, max = 100, color = "bg-blue-600" }) {
  const width = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function OverviewDashboard() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top header */}
      <div className="px-6 py-5 bg-white border-b">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tổng quan</h1>
            <p className="text-sm text-gray-500">
              Tình hình hoạt động CRM hôm nay
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50">
              Xuất báo cáo
            </button>
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Tạo chiến dịch
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Tổng khách hàng"
            value="12,584"
            delta="+3.2%"
            accent="blue"
            icon={
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Khách hàng hoạt động"
            value="9,842"
            delta="+1.1%"
            accent="green"
            icon={
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Khách hàng mới"
            value="126"
            delta="+12"
            accent="purple"
            icon={
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          />
          <StatCard
            title="Doanh số (tháng)"
            value="₫8.2B"
            delta="-0.8%"
            accent="orange"
            icon={
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
                  d="M11 11V3a1 1 0 012 0v8m-9 8h16M4 15l3 3 7-7"
                />
              </svg>
            }
          />
        </div>

        {/* Charts area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                Tăng trưởng khách hàng (6 tháng)
              </h3>
              <span className="text-xs text-gray-500">Đơn vị: người</span>
            </div>
            {/* Simple bar chart placeholder */}
            <div className="h-48 flex items-end gap-3">
              {[30, 45, 38, 60, 72, 68].map((v, i) => (
                <div key={i} className="flex-1 bg-blue-100 rounded-t">
                  <div
                    className="bg-blue-600 rounded-t"
                    style={{ height: `${v}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Phân khúc khách hàng
            </h3>
            <div className="space-y-3">
              <MiniBar label="VIP" value={38} max={50} color="bg-purple-600" />
              <MiniBar
                label="Premium"
                value={62}
                max={80}
                color="bg-blue-600"
              />
              <MiniBar
                label="Standard"
                value={45}
                max={80}
                color="bg-green-600"
              />
              <MiniBar label="Basic" value={20} max={80} color="bg-gray-600" />
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Tương tác gần đây
              </h3>
              <button className="text-xs text-blue-600 hover:text-blue-700">
                Xem tất cả
              </button>
            </div>
            <div className="divide-y">
              {[
                {
                  name: "Nguyễn Văn A",
                  action: "Mở thẻ tín dụng",
                  time: "2 phút trước",
                },
                {
                  name: "Trần Thị B",
                  action: "Cập nhật thông tin",
                  time: "10 phút trước",
                },
                {
                  name: "Lê Văn C",
                  action: "Gửi yêu cầu vay",
                  time: "1 giờ trước",
                },
              ].map((r, i) => (
                <div
                  key={i}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {r.name}
                    </p>
                    <p className="text-xs text-gray-500">{r.action}</p>
                  </div>
                  <span className="text-xs text-gray-500">{r.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Thông báo</h3>
              <button className="text-xs text-blue-600 hover:text-blue-700">
                Đánh dấu đã đọc
              </button>
            </div>
            <ul className="divide-y">
              {[
                "Bảo trì hệ thống lúc 23:00",
                "Cập nhật biểu phí thẻ quốc tế",
                "Chiến dịch ưu đãi tháng 9",
              ].map((t, i) => (
                <li
                  key={i}
                  className="px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewDashboard;
