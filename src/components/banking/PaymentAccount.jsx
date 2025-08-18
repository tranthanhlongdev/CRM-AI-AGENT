import { useState } from "react";

function PaymentAccount() {
  const [activeSubTab, setActiveSubTab] = useState("danh-sach");

  // Data mẫu cho tài khoản thanh toán
  const paymentAccounts = [
    {
      id: 1,
      accountNumber: "1234567890123",
      accountType: "Tài khoản tiết kiệm",
      bankName: "Vietcombank",
      balance: "156,750,000 VND",
      status: "active",
      openDate: "15/03/2022",
      currency: "VND",
      interestRate: "0.5%/năm",
      branch: "Chi nhánh Hà Nội",
    },
    {
      id: 2,
      accountNumber: "9876543210987",
      accountType: "Tài khoản vãng lai",
      bankName: "Vietcombank",
      balance: "25,340,500 VND",
      status: "active",
      openDate: "08/01/2023",
      currency: "VND",
      interestRate: "0.1%/năm",
      branch: "Chi nhánh Hà Nội",
    },
    {
      id: 3,
      accountNumber: "5555666677778888",
      accountType: "Tài khoản định kỳ",
      bankName: "Vietcombank",
      balance: "500,000,000 VND",
      status: "locked",
      openDate: "10/06/2023",
      currency: "VND",
      interestRate: "6.5%/năm",
      branch: "Chi nhánh Hà Nội",
    },
  ];

  // Data mẫu cho sao kê tài khoản
  const accountStatements = [
    {
      id: 1,
      date: "28/12/2024",
      time: "14:30:25",
      description: "Chuyển tiền đến 9876***987",
      transactionType: "Chuyển tiền",
      amount: "-2,500,000",
      balance: "156,750,000",
      refNo: "FT24362123456789",
      channel: "Internet Banking",
    },
    {
      id: 2,
      date: "27/12/2024",
      time: "09:15:42",
      description: "Nhận tiền từ NGUYEN VAN A",
      transactionType: "Nhận tiền",
      amount: "+5,000,000",
      balance: "159,250,000",
      refNo: "FT24361987654321",
      channel: "ATM",
    },
    {
      id: 3,
      date: "26/12/2024",
      time: "16:45:18",
      description: "Thanh toán hóa đơn điện",
      transactionType: "Thanh toán",
      amount: "-850,000",
      balance: "154,250,000",
      refNo: "BP24360555666777",
      channel: "Mobile Banking",
    },
    {
      id: 4,
      date: "25/12/2024",
      time: "11:20:33",
      description: "Lãi tiết kiệm tháng 12",
      transactionType: "Lãi",
      amount: "+450,000",
      balance: "155,100,000",
      refNo: "IT24359111222333",
      channel: "Auto",
    },
    {
      id: 5,
      date: "24/12/2024",
      time: "08:55:17",
      description: "Rút tiền ATM",
      transactionType: "Rút tiền",
      amount: "-1,000,000",
      balance: "154,650,000",
      refNo: "WD24358444555666",
      channel: "ATM",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Simple Sub Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("danh-sach")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "danh-sach"
                ? "text-blue-600 border-blue-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Danh sách tài khoản
          </button>
          <button
            onClick={() => setActiveSubTab("sao-ke")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "sao-ke"
                ? "text-blue-600 border-blue-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Sao kê tài khoản
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Danh sách tài khoản */}
        {activeSubTab === "danh-sach" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-900">
                Danh sách tài khoản thanh toán ({paymentAccounts.length})
              </h4>
              <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm font-medium">
                + Mở tài khoản mới
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {paymentAccounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                >
                  {/* Account Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          account.status === "active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {account.accountType}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {account.bankName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Sao kê"
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
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Số tài khoản
                    </div>
                    <div className="font-mono font-semibold text-gray-900 text-sm sm:text-lg break-all">
                      {account.accountNumber}
                    </div>
                  </div>

                  {/* Account Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Số dư hiện tại
                      </div>
                      <div className="font-semibold text-green-600 text-sm">
                        {account.balance}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Ngày mở
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {account.openDate}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Lãi suất
                      </div>
                      <div className="font-medium text-orange-600 text-sm">
                        {account.interestRate}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Chi nhánh
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {account.branch}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4 flex justify-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        account.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {account.status === "active" ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sao kê tài khoản */}
        {activeSubTab === "sao-ke" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-900">
                Sao kê tài khoản
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
            <div className="block sm:hidden space-y-3">
              {accountStatements.map((statement) => (
                <div
                  key={statement.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {statement.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {statement.date} • {statement.time}
                      </p>
                    </div>
                    <div
                      className={`text-right ${
                        statement.amount.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      <p className="font-semibold text-sm">
                        {statement.amount} VND
                      </p>
                      <p className="text-xs text-gray-500">
                        Số dư: {statement.balance} VND
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Loại:</span>
                      <span className="ml-1 font-medium">
                        {statement.transactionType}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Kênh:</span>
                      <span className="ml-1 font-medium">
                        {statement.channel}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Mã GD:</span>
                      <span className="ml-1 font-mono text-xs">
                        {statement.refNo}
                      </span>
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
                      Mô tả
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại GD
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số dư
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kênh
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã GD
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accountStatements.map((statement) => (
                    <tr key={statement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{statement.date}</div>
                        <div className="text-xs text-gray-500">
                          {statement.time}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {statement.description}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {statement.transactionType}
                      </td>
                      <td
                        className={`px-4 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                          statement.amount.startsWith("+")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {statement.amount} VND
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {statement.balance} VND
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {statement.channel}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {statement.refNo}
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

export default PaymentAccount;
