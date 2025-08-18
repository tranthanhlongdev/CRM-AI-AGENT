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
      response: "So du TK: 15,750,000 VND. Cap nhat: 27/12/2024 09:15",
      channel: "SMS",
    },
    {
      id: 3,
      date: "26/12/2024",
      time: "16:45:18",
      command: "BILL DIEN 123456789",
      action: "Thanh toán hóa đơn",
      amount: "850,000 VND",
      recipient: "EVN HANOI",
      status: "success",
      response: "Thanh toan thanh cong. So du: 14,900,000 VND",
      channel: "SMS",
    },
    {
      id: 4,
      date: "25/12/2024",
      time: "11:20:33",
      command: "TOPUP 0987654321 50000",
      action: "Nạp tiền điện thoại",
      amount: "50,000 VND",
      recipient: "0987***321",
      status: "failed",
      response: "Giao dich that bai. Ma loi: E001",
      channel: "SMS",
    },
    {
      id: 5,
      date: "24/12/2024",
      time: "08:55:17",
      command: "SAOKE 01/12/2024 31/12/2024",
      action: "Truy vấn sao kê",
      amount: "N/A",
      recipient: "N/A",
      status: "success",
      response: "Sao ke da gui den email. Kiem tra email cua ban",
      channel: "SMS",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Simple Sub Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("thong-tin")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "thong-tin"
                ? "text-blue-600 border-blue-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Thông tin SMS Banking
          </button>
          <button
            onClick={() => setActiveSubTab("lich-su")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "lich-su"
                ? "text-blue-600 border-blue-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Lịch sử tác động
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Thông tin SMS Banking */}
        {activeSubTab === "thong-tin" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-base font-medium text-gray-900">
                Thông tin SMS Banking
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                  Cài đặt
                </button>
                <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium">
                  Hủy dịch vụ
                </button>
              </div>
            </div>

            {/* Service Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin cơ bản
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Số điện thoại:</span>
                    <span className="font-medium">{smsInfo.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        smsInfo.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {smsInfo.status === "active" ? "Hoạt động" : "Tạm khóa"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ngày đăng ký:</span>
                    <span className="font-medium">
                      {smsInfo.registrationDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lần sử dụng cuối:</span>
                    <span className="font-medium">{smsInfo.lastUsed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hạn mức ngày:</span>
                    <span className="font-medium text-blue-600">
                      {smsInfo.dailyLimit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sử dụng tháng này:</span>
                    <span className="font-medium">
                      {smsInfo.monthlyUsage} / {smsInfo.monthlyLimit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Available Services */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">
                  Dịch vụ khả dụng
                </h5>
                <div className="space-y-3">
                  {smsInfo.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-700">{service.name}</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          service.enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {service.enabled ? "Bật" : "Tắt"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">
                Cài đặt bảo mật
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Xác thực OTP</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      smsInfo.securitySettings.otp
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {smsInfo.securitySettings.otp ? "Bật" : "Tắt"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Thông báo giao dịch</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      smsInfo.securitySettings.transactionNotification
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {smsInfo.securitySettings.transactionNotification
                      ? "Bật"
                      : "Tắt"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Cảnh báo số dư</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      smsInfo.securitySettings.balanceAlert
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {smsInfo.securitySettings.balanceAlert ? "Bật" : "Tắt"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Thông báo đăng nhập</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      smsInfo.securitySettings.loginNotification
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {smsInfo.securitySettings.loginNotification ? "Bật" : "Tắt"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lịch sử tác động */}
        {activeSubTab === "lich-su" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-base font-medium text-gray-900">
                Lịch sử tác động SMS Banking
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>30 ngày gần đây</option>
                  <option>60 ngày gần đây</option>
                  <option>90 ngày gần đây</option>
                </select>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                  Xuất Excel
                </button>
              </div>
            </div>

            {/* Mobile View */}
            <div className="block sm:hidden space-y-3">
              {smsHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {item.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.date} • {item.time}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Lệnh: {item.command}
                      </p>
                    </div>
                    <div className="text-right">
                      {item.amount !== "N/A" && (
                        <p className="font-semibold text-blue-600 text-sm">
                          {item.amount}
                        </p>
                      )}
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status === "success" ? "Thành công" : "Thất bại"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs">
                    <div className="mb-2">
                      <span className="text-gray-500">Phản hồi:</span>
                      <p className="mt-1 text-gray-700 bg-gray-50 p-2 rounded">
                        {item.response}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
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
                        <div className="text-xs text-gray-500">{item.time}</div>
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-gray-900">
                        {item.command}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.action}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-600">
                        {item.amount}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status === "success"
                            ? "Thành công"
                            : "Thất bại"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate">{item.response}</div>
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
  );
}

export default SMSBanking;
