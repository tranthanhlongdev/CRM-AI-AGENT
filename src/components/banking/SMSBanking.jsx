import { useState } from "react";

function SMSBanking() {
  const [activeSubTab, setActiveSubTab] = useState("thong-tin");

  // Data mẫu cho thông tin SMS Banking
  const smsInfo = {
    phoneNumber: "0123456789",
    status: "active",
    registrationDate: "15/03/2022",
    lastUsed: "28/12/2024 14:30",
    dailyLimit: "50,000,000 VND",
    monthlyUsage: "15 giao dịch",
    monthlyLimit: "100 giao dịch",
    services: [
      { name: "Kiểm tra số dư", enabled: true },
      { name: "Chuyển tiền", enabled: true },
      { name: "Thanh toán hóa đơn", enabled: true },
      { name: "Nạp tiền điện thoại", enabled: true },
      { name: "Mua thẻ cào", enabled: false },
      { name: "Truy vấn sao kê", enabled: true },
    ],
    securitySettings: {
      otp: true,
      transactionNotification: true,
      balanceAlert: true,
      loginNotification: true,
    },
  };

  // Data mẫu cho lịch sử tác động
  const smsHistory = [
    {
      id: 1,
      date: "28/12/2024",
      time: "14:30:25",
      command: "CK 9876543210 1000000",
      action: "Chuyển tiền",
      amount: "1,000,000 VND",
      recipient: "9876***210",
      status: "success",
      response: "GD thanh cong. So du: 15,750,000 VND. Ref: FT24362123456",
      channel: "SMS",
    },
    {
      id: 2,
      date: "27/12/2024",
      time: "09:15:42",
      command: "SD",
      action: "Kiểm tra số dư",
      amount: "N/A",
      recipient: "N/A",
      status: "success",
      response:
        "So du TK 1234***567: 16,750,000 VND. Cap nhat: 27/12/2024 09:15",
      channel: "SMS",
    },
    {
      id: 3,
      date: "26/12/2024",
      time: "16:45:18",
      command: "HD EVN 12345678 850000",
      action: "Thanh toán hóa đơn",
      amount: "850,000 VND",
      recipient: "EVN",
      status: "success",
      response: "Thanh toan HD dien thanh cong. Ma GD: BP24360555666777",
      channel: "SMS",
    },
    {
      id: 4,
      date: "25/12/2024",
      time: "11:20:33",
      command: "NAPDT 0987654321 100000",
      action: "Nạp tiền điện thoại",
      amount: "100,000 VND",
      recipient: "0987***321",
      status: "success",
      response: "Nap tien DT thanh cong. Ma GD: MT24359888999000",
      channel: "SMS",
    },
    {
      id: 5,
      date: "24/12/2024",
      time: "08:55:17",
      command: "CK 1111222233 5000000",
      action: "Chuyển tiền",
      amount: "5,000,000 VND",
      recipient: "1111***233",
      status: "failed",
      response: "GD that bai. So du khong du. Lien he CSKH: 1900 545 413",
      channel: "SMS",
    },
    {
      id: 6,
      date: "23/12/2024",
      time: "13:30:45",
      command: "SK 7",
      action: "Truy vấn sao kê",
      amount: "N/A",
      recipient: "N/A",
      status: "success",
      response: "Sao ke 7 ngay gan nhat da gui email. Kiem tra hop thu.",
      channel: "SMS",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Thành công";
      case "failed":
        return "Thất bại";
      case "pending":
        return "Đang xử lý";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sub Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-200">
          <div className="flex items-center">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500 text-white flex items-center justify-center mr-3">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                SMS Banking
              </h3>
              <p className="text-xs sm:text-sm text-blue-600">
                Quản lý dịch vụ SMS Banking
              </p>
            </div>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-4 sm:space-x-6 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab("thong-tin")}
              className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === "thong-tin"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              Thông tin SMS Banking
            </button>
            <button
              onClick={() => setActiveSubTab("lich-su")}
              className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === "lich-su"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              Lịch sử tác động
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Thông tin SMS Banking */}
          {activeSubTab === "thong-tin" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Service Status */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        smsInfo.status === "active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Trạng thái dịch vụ
                      </h4>
                      <p className="text-xs sm:text-sm text-green-600">
                        SMS Banking đang{" "}
                        {smsInfo.status === "active" ? "hoạt động" : "tạm khóa"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm font-medium">
                      Cài đặt
                    </button>
                    <button className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm font-medium">
                      Đổi PIN
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-4">
                  Thông tin cơ bản
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Số điện thoại
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {smsInfo.phoneNumber}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Ngày đăng ký
                    </div>
                    <div className="font-medium text-gray-900 text-sm">
                      {smsInfo.registrationDate}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Sử dụng lần cuối
                    </div>
                    <div className="font-medium text-gray-900 text-sm">
                      {smsInfo.lastUsed}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Hạn mức ngày
                    </div>
                    <div className="font-semibold text-blue-600 text-sm">
                      {smsInfo.dailyLimit}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Đã sử dụng tháng này
                    </div>
                    <div className="font-medium text-orange-600 text-sm">
                      {smsInfo.monthlyUsage}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Giới hạn giao dịch/tháng
                    </div>
                    <div className="font-medium text-gray-900 text-sm">
                      {smsInfo.monthlyLimit}
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-4">
                  Dịch vụ đã đăng ký
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {smsInfo.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            service.enabled ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></div>
                        <span className="text-sm text-gray-900">
                          {service.name}
                        </span>
                      </div>
                      <button
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          service.enabled
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {service.enabled ? "Tắt" : "Bật"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-4">
                  Cài đặt bảo mật
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          smsInfo.securitySettings.otp
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        Xác thực OTP
                      </span>
                    </div>
                    <button
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        smsInfo.securitySettings.otp
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {smsInfo.securitySettings.otp ? "Tắt" : "Bật"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          smsInfo.securitySettings.transactionNotification
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        Thông báo giao dịch
                      </span>
                    </div>
                    <button
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        smsInfo.securitySettings.transactionNotification
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {smsInfo.securitySettings.transactionNotification
                        ? "Tắt"
                        : "Bật"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          smsInfo.securitySettings.balanceAlert
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        Cảnh báo số dư
                      </span>
                    </div>
                    <button
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        smsInfo.securitySettings.balanceAlert
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {smsInfo.securitySettings.balanceAlert ? "Tắt" : "Bật"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          smsInfo.securitySettings.loginNotification
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        Thông báo đăng nhập
                      </span>
                    </div>
                    <button
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        smsInfo.securitySettings.loginNotification
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {smsInfo.securitySettings.loginNotification
                        ? "Tắt"
                        : "Bật"}
                    </button>
                  </div>
                </div>
              </div>

              {/* SMS Commands Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-4">
                  Hướng dẫn sử dụng
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="font-medium text-blue-600 mb-1">
                      Kiểm tra số dư:
                    </div>
                    <div className="font-mono text-gray-700">SD</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="font-medium text-blue-600 mb-1">
                      Chuyển tiền:
                    </div>
                    <div className="font-mono text-gray-700">
                      CK [STK] [SoTien]
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="font-medium text-blue-600 mb-1">
                      Thanh toán hóa đơn:
                    </div>
                    <div className="font-mono text-gray-700">
                      HD [MaDV] [MaKH] [SoTien]
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="font-medium text-blue-600 mb-1">
                      Nạp tiền điện thoại:
                    </div>
                    <div className="font-mono text-gray-700">
                      NAPDT [SDT] [SoTien]
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="font-medium text-blue-600 mb-1">
                      Truy vấn sao kê:
                    </div>
                    <div className="font-mono text-gray-700">SK [SoNgay]</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="font-medium text-blue-600 mb-1">
                      Hỗ trợ:
                    </div>
                    <div className="font-mono text-gray-700">HELP</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    <strong>Lưu ý:</strong> Gửi tin nhắn đến số{" "}
                    <strong>9029</strong> để sử dụng dịch vụ SMS Banking. Phí
                    tin nhắn theo quy định của nhà mạng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lịch sử tác động */}
          {activeSubTab === "lich-su" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                  Lịch sử tác động SMS Banking
                </h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm">
                    <option>30 ngày gần đây</option>
                    <option>60 ngày gần đây</option>
                    <option>90 ngày gần đây</option>
                  </select>
                  <button className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm font-medium">
                    Xuất Excel
                  </button>
                </div>
              </div>

              {/* Mobile View */}
              <div className="block lg:hidden space-y-3">
                {smsHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {item.action}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {getStatusText(item.status)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {item.date} • {item.time}
                        </p>
                        <p className="text-xs font-mono text-gray-700 mt-1">
                          Lệnh: {item.command}
                        </p>
                      </div>
                      {item.amount !== "N/A" && (
                        <div className="text-right">
                          <p
                            className={`font-semibold text-sm ${
                              item.status === "success"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {item.amount}
                          </p>
                          {item.recipient !== "N/A" && (
                            <p className="text-xs text-gray-500">
                              {item.recipient}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">
                        Phản hồi:
                      </div>
                      <div className="text-xs font-mono text-gray-700">
                        {item.response}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày/Giờ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lệnh SMS
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đối tượng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phản hồi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {smsHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{item.date}</div>
                          <div className="text-xs text-gray-500">
                            {item.time}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-mono text-gray-900">
                          {item.command}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {item.action}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          {item.amount !== "N/A" ? (
                            <span
                              className={`font-semibold ${
                                item.status === "success"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {item.amount}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.recipient !== "N/A" ? item.recipient : "—"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {getStatusText(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                          <div
                            className="font-mono text-xs bg-gray-50 p-2 rounded border truncate"
                            title={item.response}
                          >
                            {item.response}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SMSBanking;
