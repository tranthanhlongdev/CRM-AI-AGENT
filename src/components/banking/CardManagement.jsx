import { useState } from "react";

function CardManagement() {
  const [activeSubTab, setActiveSubTab] = useState("the-chinh");

  // Data mẫu cho thẻ chính
  const primaryCards = [
    {
      id: 1,
      cardNumber: "1234 5678 9012 3456",
      cardType: "Thẻ tín dụng Platinum",
      bankName: "Vietcombank",
      status: "active",
      issueDate: "15/03/2022",
      expiryDate: "15/03/2027",
      creditLimit: "100,000,000 VND",
      availableLimit: "75,500,000 VND",
      currentDebt: "24,500,000 VND",
      minPayment: "1,225,000 VND",
      dueDate: "15/01/2025",
    },
    {
      id: 2,
      cardNumber: "9876 5432 1098 7654",
      cardType: "Thẻ ghi nợ ATM",
      bankName: "Vietcombank",
      status: "active",
      issueDate: "08/01/2023",
      expiryDate: "08/01/2028",
      dailyLimit: "50,000,000 VND",
      currentBalance: "15,750,000 VND",
    },
  ];

  // Data mẫu cho thẻ phụ
  const supplementaryCards = [
    {
      id: 1,
      cardNumber: "1234 5678 9012 7890",
      cardType: "Thẻ tín dụng Platinum - Phụ",
      primaryCardNumber: "1234 5678 9012 3456",
      holderName: "NGUYEN THI B",
      relationship: "Vợ",
      status: "active",
      issueDate: "20/04/2022",
      expiryDate: "15/03/2027",
      creditLimit: "50,000,000 VND",
      availableLimit: "48,200,000 VND",
    },
  ];

  // Data mẫu cho giao dịch thẻ
  const cardTransactions = [
    {
      id: 1,
      date: "28/12/2024",
      time: "14:30:25",
      description: "SHOPEE*VIETNAM",
      amount: "-1,250,000",
      cardNumber: "1234***3456",
      merchant: "E-commerce",
      status: "completed",
      authCode: "123456",
      location: "Hà Nội, VN",
    },
    {
      id: 2,
      date: "27/12/2024",
      time: "18:45:12",
      description: "GRAB*VIETNAM",
      amount: "-185,000",
      cardNumber: "1234***3456",
      merchant: "Transportation",
      status: "completed",
      authCode: "789012",
      location: "Hà Nội, VN",
    },
    {
      id: 3,
      date: "26/12/2024",
      time: "12:20:33",
      description: "LOTTE MART",
      amount: "-750,000",
      cardNumber: "9876***7654",
      merchant: "Supermarket",
      status: "completed",
      authCode: "345678",
      location: "Hà Nội, VN",
    },
    {
      id: 4,
      date: "25/12/2024",
      time: "08:15:45",
      description: "ATM WITHDRAWAL",
      amount: "-2,000,000",
      cardNumber: "9876***7654",
      merchant: "ATM",
      status: "completed",
      authCode: "901234",
      location: "ATM Vincom Bà Triệu",
    },
  ];

  // Data mẫu cho trả góp
  const installmentPlans = [
    {
      id: 1,
      merchantName: "THEGIOIDIDONG",
      productName: "iPhone 15 Pro Max 256GB",
      totalAmount: "32,990,000",
      installmentTerm: "12 tháng",
      monthlyPayment: "2,832,500",
      interestRate: "0%",
      remainingTerm: "8 tháng",
      remainingAmount: "22,660,000",
      status: "active",
      startDate: "15/05/2024",
      endDate: "15/05/2025",
    },
    {
      id: 2,
      merchantName: "HONDA VIETNAM",
      productName: "Honda City 1.5L",
      totalAmount: "589,000,000",
      installmentTerm: "36 tháng",
      monthlyPayment: "18,500,000",
      interestRate: "7.2%",
      remainingTerm: "28 tháng",
      remainingAmount: "518,000,000",
      status: "active",
      startDate: "10/01/2024",
      endDate: "10/01/2027",
    },
  ];

  // Data mẫu cho sao kê thẻ
  const cardStatements = [
    {
      id: 1,
      period: "Tháng 12/2024",
      statementDate: "15/12/2024",
      dueDate: "10/01/2025",
      previousBalance: "22,800,000",
      newCharges: "5,650,000",
      payments: "-3,950,000",
      currentBalance: "24,500,000",
      minPayment: "1,225,000",
      totalDue: "24,500,000",
      status: "current",
    },
    {
      id: 2,
      period: "Tháng 11/2024",
      statementDate: "15/11/2024",
      dueDate: "10/12/2024",
      previousBalance: "18,200,000",
      newCharges: "7,800,000",
      payments: "-3,200,000",
      currentBalance: "22,800,000",
      minPayment: "1,140,000",
      totalDue: "22,800,000",
      status: "paid",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sub Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-200">
          <div className="flex items-center">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-purple-500 text-white flex items-center justify-center mr-3">
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
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Quản Lý Thẻ
              </h3>
              <p className="text-xs sm:text-sm text-purple-600">
                Quản lý thẻ chính, thẻ phụ và giao dịch
              </p>
            </div>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-2 sm:space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab("the-chinh")}
              className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === "the-chinh"
                  ? "bg-purple-500 text-white"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              Thẻ chính
            </button>
            <button
              onClick={() => setActiveSubTab("the-phu")}
              className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === "the-phu"
                  ? "bg-purple-500 text-white"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              Thẻ phụ
            </button>
            <button
              onClick={() => setActiveSubTab("giao-dich")}
              className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === "giao-dich"
                  ? "bg-purple-500 text-white"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              Giao dịch thẻ
            </button>
            <button
              onClick={() => setActiveSubTab("tra-gop")}
              className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === "tra-gop"
                  ? "bg-purple-500 text-white"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              Trả góp
            </button>
            <button
              onClick={() => setActiveSubTab("sao-ke")}
              className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === "sao-ke"
                  ? "bg-purple-500 text-white"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              Sao kê thẻ
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Thẻ chính */}
          {activeSubTab === "the-chinh" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                  Danh sách thẻ chính ({primaryCards.length})
                </h4>
                <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs sm:text-sm font-medium">
                  + Đăng ký thẻ mới
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {primaryCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:shadow-md transition-all duration-200"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            card.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {card.cardType}
                          </h4>
                          <p className="text-xs sm:text-sm text-purple-600">
                            {card.bankName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Khóa/Mở thẻ"
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
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="bg-white rounded-lg p-3 mb-4 border border-purple-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Số thẻ
                      </div>
                      <div className="font-mono font-semibold text-gray-900 text-sm sm:text-lg break-all">
                        {card.cardNumber}
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-3">
                      {card.creditLimit && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Hạn mức tín dụng
                            </div>
                            <div className="font-semibold text-purple-600 text-sm">
                              {card.creditLimit}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Hạn mức khả dụng
                            </div>
                            <div className="font-semibold text-green-600 text-sm">
                              {card.availableLimit}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            {card.currentDebt
                              ? "Dư nợ hiện tại"
                              : "Số dư hiện tại"}
                          </div>
                          <div
                            className={`font-semibold text-sm ${
                              card.currentDebt
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {card.currentDebt || card.currentBalance}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Hạn sử dụng
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {card.expiryDate}
                          </div>
                        </div>
                      </div>

                      {card.minPayment && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Thanh toán tối thiểu
                            </div>
                            <div className="font-semibold text-orange-600 text-sm">
                              {card.minPayment}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Hạn thanh toán
                            </div>
                            <div className="font-medium text-gray-900 text-sm">
                              {card.dueDate}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="mt-4 flex justify-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          card.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {card.status === "active" ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thẻ phụ */}
          {activeSubTab === "the-phu" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                  Danh sách thẻ phụ ({supplementaryCards.length})
                </h4>
                <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs sm:text-sm font-medium">
                  + Đăng ký thẻ phụ
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {supplementaryCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          card.status === "active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {card.cardType}
                        </h4>
                        <p className="text-xs sm:text-sm text-purple-600">
                          Chủ thẻ: {card.holderName}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 mb-4 border border-purple-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Số thẻ phụ
                      </div>
                      <div className="font-mono font-semibold text-gray-900 text-sm sm:text-lg break-all">
                        {card.cardNumber}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Thẻ chính
                          </div>
                          <div className="font-mono text-gray-900 text-sm">
                            {card.primaryCardNumber}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Mối quan hệ
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {card.relationship}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Hạn mức
                          </div>
                          <div className="font-semibold text-purple-600 text-sm">
                            {card.creditLimit}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Khả dụng
                          </div>
                          <div className="font-semibold text-green-600 text-sm">
                            {card.availableLimit}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Giao dịch thẻ */}
          {activeSubTab === "giao-dich" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                  Giao dịch thẻ gần đây
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
                {cardTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.date} • {transaction.time}
                        </p>
                        <p className="text-xs text-gray-500">
                          Thẻ: {transaction.cardNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600 text-sm">
                          {transaction.amount} VND
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {transaction.status === "completed"
                            ? "Thành công"
                            : "Đang xử lý"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Loại:</span>
                        <span className="ml-1 font-medium">
                          {transaction.merchant}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Mã ủy quyền:</span>
                        <span className="ml-1 font-mono">
                          {transaction.authCode}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Địa điểm:</span>
                        <span className="ml-1">{transaction.location}</span>
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
                        Thẻ
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Địa điểm
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cardTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{transaction.date}</div>
                          <div className="text-xs text-gray-500">
                            {transaction.time}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {transaction.cardNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                          {transaction.amount} VND
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {transaction.status === "completed"
                              ? "Thành công"
                              : "Đang xử lý"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {transaction.location}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trả góp */}
          {activeSubTab === "tra-gop" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                  Kế hoạch trả góp ({installmentPlans.length})
                </h4>
                <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs sm:text-sm font-medium">
                  + Đăng ký trả góp
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {installmentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg sm:rounded-xl p-4 sm:p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              plan.status === "active"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                              {plan.productName}
                            </h4>
                            <p className="text-xs sm:text-sm text-orange-600">
                              {plan.merchantName}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          <div className="bg-white rounded-lg p-3 border border-orange-200">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Tổng tiền
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {plan.totalAmount} VND
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-orange-200">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Hàng tháng
                            </div>
                            <div className="font-semibold text-orange-600 text-sm">
                              {plan.monthlyPayment} VND
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-orange-200">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Kỳ hạn
                            </div>
                            <div className="font-medium text-gray-900 text-sm">
                              {plan.installmentTerm}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-orange-200">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Lãi suất
                            </div>
                            <div className="font-medium text-green-600 text-sm">
                              {plan.interestRate}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-64">
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Còn lại
                            </div>
                            <div className="font-semibold text-red-600 text-lg">
                              {plan.remainingAmount} VND
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {plan.remainingTerm} còn lại
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    ((parseInt(plan.installmentTerm) -
                                      parseInt(plan.remainingTerm)) /
                                      parseInt(plan.installmentTerm)) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-center">
                              {parseInt(plan.installmentTerm) -
                                parseInt(plan.remainingTerm)}
                              /{parseInt(plan.installmentTerm)} kỳ
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sao kê thẻ */}
          {activeSubTab === "sao-ke" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                  Sao kê thẻ tín dụng
                </h4>
                <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm font-medium">
                  Tải PDF
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {cardStatements.map((statement) => (
                  <div
                    key={statement.id}
                    className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${
                      statement.status === "current"
                        ? "bg-gradient-to-r from-red-50 to-red-100 border-red-200"
                        : "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                          Sao kê {statement.period}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Ngày sao kê: {statement.statementDate} • Hạn thanh
                          toán: {statement.dueDate}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          statement.status === "current"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {statement.status === "current"
                          ? "Chưa thanh toán"
                          : "Đã thanh toán"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Dư nợ đầu kỳ
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {statement.previousBalance} VND
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Phát sinh mới
                        </div>
                        <div className="font-semibold text-red-600 text-sm">
                          {statement.newCharges} VND
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Thanh toán
                        </div>
                        <div className="font-semibold text-green-600 text-sm">
                          {statement.payments} VND
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Dư nợ cuối kỳ
                        </div>
                        <div className="font-semibold text-red-600 text-sm">
                          {statement.currentBalance} VND
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Thanh toán tối thiểu
                        </div>
                        <div className="font-semibold text-orange-600 text-sm">
                          {statement.minPayment} VND
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Tổng phải trả
                        </div>
                        <div className="font-semibold text-purple-600 text-sm">
                          {statement.totalDue} VND
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CardManagement;
