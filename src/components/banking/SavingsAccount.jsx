import { useState } from "react";

function SavingsAccount() {
  const [activeSubTab, setActiveSubTab] = useState("danh-sach");

  // Data mẫu cho tiết kiệm
  const savingsAccounts = [
    {
      id: 1,
      accountNumber: "888999000111222",
      productName: "Tiết kiệm có kỳ hạn 12 tháng",
      bankName: "Vietcombank",
      principalAmount: "500,000,000",
      currentBalance: "565,500,000",
      interestRate: "6.5%/năm",
      termLength: "12 tháng",
      openDate: "15/01/2024",
      maturityDate: "15/01/2025",
      status: "active",
      autoRenewal: true,
      accruedInterest: "65,500,000",
      nextInterestDate: "15/01/2025",
    },
    {
      id: 2,
      accountNumber: "777888999000111",
      productName: "Tiết kiệm không kỳ hạn",
      bankName: "Vietcombank",
      principalAmount: "200,000,000",
      currentBalance: "205,250,000",
      interestRate: "1.2%/năm",
      termLength: "Không kỳ hạn",
      openDate: "20/08/2023",
      maturityDate: "N/A",
      status: "active",
      autoRenewal: false,
      accruedInterest: "5,250,000",
      nextInterestDate: "20/01/2025",
    },
    {
      id: 3,
      accountNumber: "666777888999000",
      productName: "Tiết kiệm có kỳ hạn 24 tháng",
      bankName: "Vietcombank",
      principalAmount: "1,000,000,000",
      currentBalance: "1,158,400,000",
      interestRate: "7.2%/năm",
      termLength: "24 tháng",
      openDate: "10/03/2023",
      maturityDate: "10/03/2025",
      status: "active",
      autoRenewal: true,
      accruedInterest: "158,400,000",
      nextInterestDate: "10/03/2025",
    },
    {
      id: 4,
      accountNumber: "555666777888999",
      productName: "Tiết kiệm có kỳ hạn 6 tháng",
      bankName: "Vietcombank",
      principalAmount: "300,000,000",
      currentBalance: "318,500,000",
      interestRate: "5.8%/năm",
      termLength: "6 tháng",
      openDate: "15/08/2024",
      maturityDate: "15/02/2025",
      status: "matured",
      autoRenewal: false,
      accruedInterest: "18,500,000",
      nextInterestDate: "Đã đến hạn",
    },
  ];

  // Data mẫu cho lịch sử tất toán
  const closeHistory = [
    {
      id: 1,
      accountNumber: "444555666777888",
      productName: "Tiết kiệm có kỳ hạn 12 tháng",
      principalAmount: "800,000,000",
      interestReceived: "62,400,000",
      totalReceived: "862,400,000",
      openDate: "10/01/2023",
      closeDate: "10/01/2024",
      actualTerm: "12 tháng",
      interestRate: "7.8%/năm",
      earlyClose: false,
      penalty: "0",
    },
    {
      id: 2,
      accountNumber: "333444555666777",
      productName: "Tiết kiệm có kỳ hạn 24 tháng",
      principalAmount: "1,500,000,000",
      interestReceived: "95,250,000",
      totalReceived: "1,595,250,000",
      openDate: "05/06/2022",
      closeDate: "15/11/2023",
      actualTerm: "17 tháng",
      interestRate: "4.2%/năm",
      earlyClose: true,
      penalty: "12,500,000",
    },
    {
      id: 3,
      accountNumber: "222333444555666",
      productName: "Tiết kiệm không kỳ hạn",
      principalAmount: "450,000,000",
      interestReceived: "8,100,000",
      totalReceived: "458,100,000",
      openDate: "20/03/2023",
      closeDate: "25/11/2023",
      actualTerm: "8 tháng",
      interestRate: "1.8%/năm",
      earlyClose: false,
      penalty: "0",
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
                ? "text-green-600 border-green-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Danh sách tiết kiệm
          </button>
          <button
            onClick={() => setActiveSubTab("tat-toan")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "tat-toan"
                ? "text-green-600 border-green-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Lịch sử tất toán
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Danh sách tiết kiệm */}
        {activeSubTab === "danh-sach" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-900">
                Danh sách tiết kiệm ({savingsAccounts.length})
              </h4>
              <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm font-medium">
                + Mở sổ tiết kiệm
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {savingsAccounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  {/* Account Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          account.status === "active"
                            ? "bg-green-500"
                            : account.status === "matured"
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {account.productName}
                        </h4>
                        <p className="text-xs sm:text-sm text-green-600">
                          {account.bankName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Chi tiết"
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
                      {account.status === "matured" && (
                        <button
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Tất toán"
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
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                  <div className="bg-white rounded-lg p-3 mb-4 border border-green-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Số tài khoản tiết kiệm
                    </div>
                    <div className="font-mono font-semibold text-gray-900 text-sm sm:text-lg break-all">
                      {account.accountNumber}
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Số tiền gốc
                      </div>
                      <div className="font-semibold text-blue-600 text-sm">
                        {account.principalAmount} VND
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Số dư hiện tại
                      </div>
                      <div className="font-semibold text-green-600 text-sm">
                        {account.currentBalance} VND
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Lãi suất
                      </div>
                      <div className="font-semibold text-orange-600 text-sm">
                        {account.interestRate}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Kỳ hạn
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {account.termLength}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Ngày mở
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {account.openDate}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Ngày đến hạn
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {account.maturityDate}
                      </div>
                    </div>
                  </div>

                  {/* Interest Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Lãi tích lũy
                      </div>
                      <div className="font-semibold text-purple-600 text-sm">
                        {account.accruedInterest} VND
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Trả lãi tiếp theo
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {account.nextInterestDate}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Tái tục tự động
                      </div>
                      <div
                        className={`font-medium text-sm ${
                          account.autoRenewal
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {account.autoRenewal ? "Có" : "Không"}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4 flex justify-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        account.status === "active"
                          ? "bg-green-100 text-green-800"
                          : account.status === "matured"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {account.status === "active"
                        ? "Đang hoạt động"
                        : account.status === "matured"
                        ? "Đã đến hạn"
                        : "Đã đóng"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lịch sử tất toán */}
        {activeSubTab === "tat-toan" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-900">
                Lịch sử tất toán ({closeHistory.length})
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm">
                  <option>12 tháng gần đây</option>
                  <option>24 tháng gần đây</option>
                  <option>Tất cả</option>
                </select>
                <button className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm font-medium">
                  Xuất Excel
                </button>
              </div>
            </div>

            {/* Mobile View */}
            <div className="block lg:hidden space-y-4">
              {closeHistory.map((record) => (
                <div
                  key={record.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {record.productName}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono">
                        {record.accountNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.openDate} → {record.closeDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 text-sm">
                        {record.totalReceived} VND
                      </p>
                      {record.earlyClose && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Tất toán sớm
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Tiền gốc:</span>
                      <span className="ml-1 font-medium">
                        {record.principalAmount} VND
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Lãi nhận:</span>
                      <span className="ml-1 font-medium text-green-600">
                        {record.interestReceived} VND
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Lãi suất:</span>
                      <span className="ml-1 font-medium">
                        {record.interestRate}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Thời gian:</span>
                      <span className="ml-1 font-medium">
                        {record.actualTerm}
                      </span>
                    </div>
                    {record.earlyClose && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Phí tất toán sớm:</span>
                        <span className="ml-1 font-medium text-red-600">
                          {record.penalty} VND
                        </span>
                      </div>
                    )}
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
                      Số TK & Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiền gốc
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lãi nhận
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng nhận
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lãi suất
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {closeHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="font-medium">{record.productName}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {record.accountNumber}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {record.principalAmount} VND
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 text-right font-semibold">
                        {record.interestReceived} VND
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 text-right font-bold">
                        {record.totalReceived} VND
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div>
                          {record.openDate} → {record.closeDate}
                        </div>
                        <div className="text-xs text-gray-500">
                          Thực tế: {record.actualTerm}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                        {record.interestRate}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {record.earlyClose ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mb-1">
                              Tất toán sớm
                            </span>
                            <div className="text-xs text-red-600">
                              Phí: {record.penalty} VND
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Đúng hạn
                          </span>
                        )}
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

export default SavingsAccount;
