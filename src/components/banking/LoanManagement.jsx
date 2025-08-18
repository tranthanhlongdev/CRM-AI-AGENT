import { useState } from "react";

function LoanManagement() {
  const [activeSubTab, setActiveSubTab] = useState("danh-muc");

  // Data mẫu cho danh mục khoản vay
  const loanAccounts = [
    {
      id: 1,
      loanNumber: "VCB2023001234567",
      loanType: "Vay mua nhà",
      bankName: "Vietcombank",
      originalAmount: "2,500,000,000",
      outstandingBalance: "1,850,500,000",
      interestRate: "8.5%/năm",
      termLength: "240 tháng",
      remainingTerm: "158 tháng",
      monthlyPayment: "22,450,000",
      nextPaymentDate: "15/01/2025",
      disbursementDate: "15/05/2020",
      maturityDate: "15/05/2040",
      status: "active",
      collateral: "Bất động sản tại Hà Nội",
      loanPurpose: "Mua nhà ở",
      paymentMethod: "Trả gốc và lãi đều hàng tháng",
    },
    {
      id: 2,
      loanNumber: "VCB2024005678901",
      loanType: "Vay tiêu dùng",
      bankName: "Vietcombank",
      originalAmount: "500,000,000",
      outstandingBalance: "285,750,000",
      interestRate: "12.5%/năm",
      termLength: "60 tháng",
      remainingTerm: "32 tháng",
      monthlyPayment: "11,250,000",
      nextPaymentDate: "10/01/2025",
      disbursementDate: "10/08/2021",
      maturityDate: "10/08/2026",
      status: "active",
      collateral: "Không có",
      loanPurpose: "Tiêu dùng cá nhân",
      paymentMethod: "Trả gốc và lãi đều hàng tháng",
    },
    {
      id: 3,
      loanNumber: "VCB2024009876543",
      loanType: "Vay mua xe",
      bankName: "Vietcombank",
      originalAmount: "800,000,000",
      outstandingBalance: "0",
      interestRate: "7.2%/năm",
      termLength: "84 tháng",
      remainingTerm: "0 tháng",
      monthlyPayment: "0",
      nextPaymentDate: "Đã tất toán",
      disbursementDate: "20/01/2017",
      maturityDate: "20/01/2024",
      status: "closed",
      collateral: "Xe ô tô Honda Civic",
      loanPurpose: "Mua xe ô tô",
      paymentMethod: "Trả gốc và lãi đều hàng tháng",
    },
  ];

  // Data mẫu cho vay online
  const onlineLoans = [
    {
      id: 1,
      productName: "Vay tiêu dùng VCB Online",
      maxAmount: "1,000,000,000 VND",
      interestRate: "11.5% - 15.8%/năm",
      maxTerm: "60 tháng",
      processingTime: "30 phút",
      requirements: "Lương từ 8 triệu/tháng",
      features: [
        "Không cần tài sản đảm bảo",
        "Giải ngân nhanh",
        "Thủ tục đơn giản",
      ],
      isEligible: true,
      description:
        "Sản phẩm vay tiêu dùng không cần tài sản đảm bảo, thủ tục đơn giản và giải ngân nhanh chóng.",
    },
    {
      id: 2,
      productName: "Vay thấu chi VCB Online",
      maxAmount: "500,000,000 VND",
      interestRate: "13.5% - 16.8%/năm",
      maxTerm: "12 tháng",
      processingTime: "15 phút",
      requirements: "Có tài khoản lương tại VCB",
      features: [
        "Sử dụng linh hoạt",
        "Chỉ trả lãi khi sử dụng",
        "Gia hạn tự động",
      ],
      isEligible: true,
      description:
        "Hạn mức thấu chi linh hoạt, chỉ trả lãi khi sử dụng, thích hợp cho nhu cầu vốn ngắn hạn.",
    },
    {
      id: 3,
      productName: "Vay mua nhà VCB Online",
      maxAmount: "15,000,000,000 VND",
      interestRate: "7.5% - 9.5%/năm",
      maxTerm: "300 tháng",
      processingTime: "3 - 5 ngày làm việc",
      requirements: "Thu nhập ổn định, có TSĐB",
      features: [
        "Lãi suất ưu đãi",
        "Vay đến 85% giá trị BĐS",
        "Thời hạn vay dài",
      ],
      isEligible: false,
      description:
        "Sản phẩm vay mua nhà với lãi suất ưu đãi và thời hạn vay lên đến 25 năm.",
    },
  ];

  // Data mẫu cho lịch trả nợ
  const paymentSchedule = [
    {
      id: 1,
      loanNumber: "VCB2023001234567",
      period: "Tháng 01/2025",
      paymentDate: "15/01/2025",
      principalAmount: "8,450,000",
      interestAmount: "14,000,000",
      totalPayment: "22,450,000",
      outstandingBalance: "1,842,050,000",
      status: "upcoming",
      daysUntilDue: 3,
    },
    {
      id: 2,
      loanNumber: "VCB2024005678901",
      period: "Tháng 01/2025",
      paymentDate: "10/01/2025",
      principalAmount: "7,250,000",
      interestAmount: "4,000,000",
      totalPayment: "11,250,000",
      outstandingBalance: "278,500,000",
      status: "upcoming",
      daysUntilDue: -2,
    },
    {
      id: 3,
      loanNumber: "VCB2023001234567",
      period: "Tháng 12/2024",
      paymentDate: "15/12/2024",
      principalAmount: "8,400,000",
      interestAmount: "14,050,000",
      totalPayment: "22,450,000",
      outstandingBalance: "1,850,500,000",
      status: "paid",
      paidDate: "15/12/2024",
    },
    {
      id: 4,
      loanNumber: "VCB2024005678901",
      period: "Tháng 12/2024",
      paymentDate: "10/12/2024",
      principalAmount: "7,200,000",
      interestAmount: "4,050,000",
      totalPayment: "11,250,000",
      outstandingBalance: "285,750,000",
      status: "paid",
      paidDate: "10/12/2024",
    },
  ];

  // Data mẫu cho nợ quá hạn
  const overdueDebts = [
    {
      id: 1,
      loanNumber: "VCB2024005678901",
      loanType: "Vay tiêu dùng",
      overdueAmount: "11,250,000",
      penaltyAmount: "562,500",
      totalOverdue: "11,812,500",
      overdueDays: 2,
      originalDueDate: "10/01/2025",
      penaltyRate: "150% lãi suất gốc",
      status: "overdue",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Simple Sub Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("danh-muc")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "danh-muc"
                ? "text-orange-600 border-orange-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Danh mục khoản vay
          </button>
          <button
            onClick={() => setActiveSubTab("vay-online")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "vay-online"
                ? "text-orange-600 border-orange-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Vay online
          </button>
          <button
            onClick={() => setActiveSubTab("lich-tra")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "lich-tra"
                ? "text-orange-600 border-orange-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Lịch trả nợ
          </button>
          <button
            onClick={() => setActiveSubTab("no-qua-han")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "no-qua-han"
                ? "text-orange-600 border-orange-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Nợ quá hạn
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Danh mục khoản vay */}
        {activeSubTab === "danh-muc" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-900">
                Danh mục khoản vay (
                {loanAccounts.filter((loan) => loan.status === "active").length}{" "}
                đang hoạt động)
              </h4>
              <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm font-medium">
                + Đăng ký vay mới
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {loanAccounts.map((loan) => (
                <div
                  key={loan.id}
                  className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${
                    loan.status === "active"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {/* Loan Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          loan.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {loan.loanType}
                        </h4>
                        <p className="text-xs sm:text-sm text-orange-600">
                          {loan.bankName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
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
                      {loan.status === "active" && (
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Lịch trả nợ"
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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

                  {/* Loan Number */}
                  <div className="bg-white rounded-lg p-3 mb-4 border border-orange-200">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Số hợp đồng vay
                    </div>
                    <div className="font-mono font-semibold text-gray-900 text-sm sm:text-lg break-all">
                      {loan.loanNumber}
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Số tiền vay
                      </div>
                      <div className="font-semibold text-blue-600 text-sm">
                        {loan.originalAmount} VND
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Dư nợ hiện tại
                      </div>
                      <div
                        className={`font-semibold text-sm ${
                          loan.status === "active"
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {loan.outstandingBalance} VND
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Lãi suất
                      </div>
                      <div className="font-semibold text-orange-600 text-sm">
                        {loan.interestRate}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Trả hàng tháng
                      </div>
                      <div
                        className={`font-semibold text-sm ${
                          loan.status === "active"
                            ? "text-purple-600"
                            : "text-gray-500"
                        }`}
                      >
                        {loan.monthlyPayment} VND
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Thời hạn còn lại
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {loan.remainingTerm}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Kỳ trả tiếp theo
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {loan.nextPaymentDate}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Mục đích vay
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {loan.loanPurpose}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Tài sản đảm bảo
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {loan.collateral}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Active Loans */}
                  {loan.status === "active" && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">
                          Tiến độ trả nợ
                        </span>
                        <span className="text-xs text-gray-500">
                          {parseInt(loan.termLength) -
                            parseInt(loan.remainingTerm)}
                          /{parseInt(loan.termLength)} tháng
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{
                            width: `${
                              ((parseInt(loan.termLength) -
                                parseInt(loan.remainingTerm)) /
                                parseInt(loan.termLength)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mt-4 flex justify-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        loan.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {loan.status === "active" ? "Đang vay" : "Đã tất toán"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vay online */}
        {activeSubTab === "vay-online" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-900">
                Sản phẩm vay online ({onlineLoans.length})
              </h4>
              <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm font-medium">
                Kiểm tra điều kiện vay
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {onlineLoans.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${
                    product.isEligible
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {/* Product Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {product.productName}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {product.description}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        product.isEligible
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.isEligible
                        ? "Đủ điều kiện"
                        : "Chưa đủ điều kiện"}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Hạn mức tối đa
                      </div>
                      <div className="font-semibold text-blue-600 text-sm">
                        {product.maxAmount}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Lãi suất
                      </div>
                      <div className="font-semibold text-orange-600 text-sm">
                        {product.interestRate}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Thời hạn tối đa
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {product.maxTerm}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Thời gian xử lý
                      </div>
                      <div className="font-medium text-green-600 text-sm">
                        {product.processingTime}
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Điều kiện
                    </div>
                    <div className="text-sm text-gray-900">
                      {product.requirements}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Đặc điểm nổi bật
                    </div>
                    <div className="space-y-1">
                      {product.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-900"
                        >
                          <svg
                            className="w-3 h-3 text-green-500 mr-2 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    <button
                      className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                        product.isEligible
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={!product.isEligible}
                    >
                      {product.isEligible
                        ? "Đăng ký ngay"
                        : "Chưa đủ điều kiện"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lịch trả nợ */}
        {activeSubTab === "lich-tra" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-900">
                Lịch trả nợ
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm">
                  <option>6 tháng tới</option>
                  <option>12 tháng tới</option>
                  <option>Tất cả</option>
                </select>
                <button className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm font-medium">
                  Xuất lịch trả nợ
                </button>
              </div>
            </div>

            {/* Mobile View */}
            <div className="block lg:hidden space-y-3">
              {paymentSchedule.map((payment) => (
                <div
                  key={payment.id}
                  className={`border rounded-lg p-4 ${
                    payment.status === "upcoming"
                      ? "bg-yellow-50 border-yellow-200"
                      : payment.status === "overdue"
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {payment.period}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {payment.loanNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ngày: {payment.paymentDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600 text-sm">
                        {payment.totalPayment} VND
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === "upcoming"
                            ? "bg-yellow-100 text-yellow-800"
                            : payment.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {payment.status === "upcoming"
                          ? "Sắp đến hạn"
                          : payment.status === "overdue"
                          ? "Quá hạn"
                          : "Đã thanh toán"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Gốc:</span>
                      <span className="ml-1 font-medium">
                        {payment.principalAmount} VND
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Lãi:</span>
                      <span className="ml-1 font-medium">
                        {payment.interestAmount} VND
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Dư nợ sau trả:</span>
                      <span className="ml-1 font-medium">
                        {payment.outstandingBalance} VND
                      </span>
                    </div>
                    {payment.daysUntilDue !== undefined && (
                      <div className="col-span-2">
                        <span className="text-gray-500">
                          {payment.daysUntilDue > 0
                            ? `Còn ${payment.daysUntilDue} ngày`
                            : payment.daysUntilDue < 0
                            ? `Quá hạn ${Math.abs(payment.daysUntilDue)} ngày`
                            : "Đến hạn hôm nay"}
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
                      Kỳ hạn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hợp đồng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiền gốc
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiền lãi
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng trả
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dư nợ sau trả
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentSchedule.map((payment) => (
                    <tr
                      key={payment.id}
                      className={`hover:bg-gray-50 ${
                        payment.status === "upcoming"
                          ? "bg-yellow-50"
                          : payment.status === "overdue"
                          ? "bg-red-50"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div>{payment.period}</div>
                        <div className="text-xs text-gray-500">
                          {payment.paymentDate}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-mono">
                        {payment.loanNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {payment.principalAmount} VND
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {payment.interestAmount} VND
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-orange-600 text-right font-semibold">
                        {payment.totalPayment} VND
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {payment.outstandingBalance} VND
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === "upcoming"
                              ? "bg-yellow-100 text-yellow-800"
                              : payment.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {payment.status === "upcoming"
                            ? "Sắp đến hạn"
                            : payment.status === "overdue"
                            ? "Quá hạn"
                            : "Đã thanh toán"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Nợ quá hạn */}
        {activeSubTab === "no-qua-han" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-900">
                Nợ quá hạn ({overdueDebts.length})
              </h4>
              {overdueDebts.length > 0 && (
                <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium">
                  Thanh toán tất cả
                </button>
              )}
            </div>

            {overdueDebts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 text-green-600 mb-4">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
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
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Không có nợ quá hạn
                </h3>
                <p className="text-sm sm:text-base text-gray-500">
                  Tất cả khoản vay của bạn đều được thanh toán đúng hạn.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {overdueDebts.map((debt) => (
                  <div
                    key={debt.id}
                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {debt.loanType}
                          </h4>
                          <p className="text-xs sm:text-sm font-mono text-red-600">
                            {debt.loanNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600 text-lg">
                          {debt.totalOverdue} VND
                        </p>
                        <p className="text-xs sm:text-sm text-red-500">
                          Quá hạn {debt.overdueDays} ngày
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-red-200">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Số tiền gốc + lãi
                        </div>
                        <div className="font-semibold text-red-600 text-sm">
                          {debt.overdueAmount} VND
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-red-200">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Phí phạt
                        </div>
                        <div className="font-semibold text-orange-600 text-sm">
                          {debt.penaltyAmount} VND
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-red-200">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Ngày đến hạn gốc
                        </div>
                        <div className="font-medium text-gray-900 text-sm">
                          {debt.originalDueDate}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-red-200 mb-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Lãi suất phạt
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {debt.penaltyRate}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button className="w-full sm:flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                        Thanh toán ngay
                      </button>
                      <button className="w-full sm:w-auto py-2 px-4 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanManagement;
