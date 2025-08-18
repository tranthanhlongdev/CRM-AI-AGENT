import { useState, useEffect } from "react";
import cardService from "../../services/cardService.js";
import Notification from "../common/Notification.jsx";
import useNotification from "../../hooks/useNotification.js";

function CardManagement({ customerCIF }) {
  const [activeSubTab, setActiveSubTab] = useState("the-chinh");
  const [cardsData, setCardsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Notification hook
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Fetch cards data từ API
  useEffect(() => {
    if (customerCIF) {
      fetchCardsData();
    }
  }, [customerCIF]);

  const fetchCardsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await cardService.getCardsByCIF(customerCIF, true);

      // Check new API structure (success, message, data.cards, total)
      if (result && result.success && result.data && result.data.cards) {
        setCardsData(result.data);
      } else {
        // Handle old format or unexpected structure
        console.warn("Unexpected API response structure:", result);
        setCardsData(getMockCardsData());
      }
    } catch (err) {
      console.error("Error fetching cards:", err);
      setError(err.message || "Không thể tải dữ liệu thẻ");
      // Fallback to mock data if API fails
      setCardsData(getMockCardsData());
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback (API format)
  const getMockCardsData = () => ({
    cards: [
      {
        cardId: "CARD001",
        cardName: "HDBank Visa Platinum",
        cardType: "credit",
        status: "active",
        statusDisplay: "Đang hoạt động",
        statusColor: "#28a745",
        maskedNumber: "4***-****-****-1234",
        expiryDate: "01/26",
        issueDate: "01/2023",
        availableCredit: "18,500,000 VND",
        creditLimit: "25,000,000 VND",
        is_main_card: 0, // Thẻ chính
        lastTransaction: {
          date: "2024-01-14",
          amount: "850,000 VND",
          merchant: "Lotte Center",
        },
      },
      {
        cardId: "CARD002",
        cardName: "HDBank Debit Classic",
        cardType: "debit",
        status: "inactive",
        statusDisplay: "Đã khóa",
        statusColor: "#dc3545",
        maskedNumber: "5***-****-****-5678",
        expiryDate: "05/25",
        issueDate: "05/2022",
        availableBalance: "12,300,000 VND",
        is_main_card: 0, // Thẻ chính
        lastTransaction: {
          date: "2024-01-10",
          amount: "500,000 VND",
          merchant: "ATM HDBank",
        },
      },
      {
        cardId: "CARD003",
        cardName: "HDBank Mastercard Gold",
        cardType: "credit",
        status: "active",
        statusDisplay: "Đang hoạt động",
        statusColor: "#28a745",
        maskedNumber: "5***-****-****-9999",
        expiryDate: "12/25",
        issueDate: "03/2022",
        availableCredit: "8,500,000 VND",
        creditLimit: "15,000,000 VND",
        is_main_card: 1, // Thẻ phụ
        relationshipToMainCard: "Thẻ phụ của CARD001",
        holderName: "Nguyễn Văn B",
        lastTransaction: {
          date: "2024-01-12",
          amount: "320,000 VND",
          merchant: "Coopmart",
        },
      },
      {
        cardId: "CARD004",
        cardName: "HDBank Debit Classic",
        cardType: "debit",
        status: "active",
        statusDisplay: "Đang hoạt động",
        statusColor: "#28a745",
        maskedNumber: "4***-****-****-7777",
        expiryDate: "08/26",
        issueDate: "08/2023",
        availableBalance: "5,200,000 VND",
        is_main_card: 1, // Thẻ phụ
        relationshipToMainCard: "Thẻ phụ của CARD002",
        holderName: "Trần Thị C",
        lastTransaction: {
          date: "2024-01-11",
          amount: "150,000 VND",
          merchant: "Circle K",
        },
      },
    ],
    total: 4,
  });

  // Separate cards by type based on is_main_card
  // is_main_card = 0: Thẻ chính, is_main_card = 1: Thẻ phụ
  const primaryCards =
    cardsData?.cards?.filter(
      (card) => card.is_main_card === 0 || card.isMainCard === true
    ) || [];
  const supplementaryCards =
    cardsData?.cards?.filter(
      (card) => card.is_main_card === 1 || card.isMainCard === false
    ) || [];

  // Format card number for display
  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return "";
    // Convert masked number to display format
    if (cardNumber.includes("*")) {
      return cardNumber;
    }
    // Format full card number with spaces
    return cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // Handle block/unblock card
  const handleToggleCardStatus = async (cardId, currentStatus) => {
    try {
      let result;

      if (currentStatus === "active") {
        // Khóa thẻ
        result = await cardService.blockCard(cardId);
        if (result && result.success) {
          showSuccess(
            "Khóa thẻ thành công! 🔒",
            `${result.message}\nThẻ ${
              result.data?.cardName || cardId
            } đã được khóa.`,
            { duration: 4000 }
          );
        } else {
          showError(
            "Khóa thẻ thất bại! ❌",
            result?.message || "Không thể khóa thẻ. Vui lòng thử lại."
          );
        }
      } else {
        // Mở khóa thẻ
        result = await cardService.unblockCard(cardId);
        if (result && result.success) {
          showSuccess(
            "Mở khóa thẻ thành công! 🔓",
            `${result.message}\nThẻ ${
              result.data?.cardName || cardId
            } đã được kích hoạt.`,
            { duration: 4000 }
          );
        } else {
          showError(
            "Mở khóa thẻ thất bại! ❌",
            result?.message || "Không thể mở khóa thẻ. Vui lòng thử lại."
          );
        }
      }

      // Refresh cards data if operation was successful
      if (result && result.success) {
        await fetchCardsData();
      }
    } catch (err) {
      console.error("Error toggling card status:", err);
      showError(
        "Lỗi hệ thống! ⚠️",
        `Có lỗi xảy ra khi ${
          currentStatus === "active" ? "khóa" : "mở khóa"
        } thẻ: ${err.message}`
      );
    }
  };

  // Loading và Error states
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Đang tải dữ liệu thẻ...</span>
        </div>
      </div>
    );
  }

  if (error && !cardsData) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Lỗi tải dữ liệu
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchCardsData}
                className="mt-2 bg-red-100 px-3 py-1 rounded text-red-800 hover:bg-red-200 text-xs"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="space-y-4">
      {/* Simple Sub Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("the-chinh")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "the-chinh"
                ? "text-purple-600 border-purple-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Thẻ chính
          </button>
          <button
            onClick={() => setActiveSubTab("the-phu")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "the-phu"
                ? "text-purple-600 border-purple-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Thẻ phụ
          </button>
          <button
            onClick={() => setActiveSubTab("giao-dich")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "giao-dich"
                ? "text-purple-600 border-purple-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Giao dịch thẻ
          </button>
          <button
            onClick={() => setActiveSubTab("tra-gop")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "tra-gop"
                ? "text-purple-600 border-purple-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Trả góp
          </button>
          <button
            onClick={() => setActiveSubTab("sao-ke")}
            className={`py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSubTab === "sao-ke"
                ? "text-purple-600 border-purple-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Sao kê thẻ
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Thẻ chính */}
        {activeSubTab === "the-chinh" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                  Danh sách thẻ chính ({primaryCards.length})
                </h4>
                {cardsData && (
                  <p className="text-xs text-gray-500 mt-1">
                    CIF: {customerCIF} • Tổng:{" "}
                    {cardsData.total || cardsData.cards?.length || 0} thẻ
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchCardsData}
                  className="px-3 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-xs sm:text-sm font-medium"
                  title="Làm mới dữ liệu"
                >
                  🔄 Làm mới
                </button>
                <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs sm:text-sm font-medium">
                  + Đăng ký thẻ mới
                </button>
              </div>
            </div>

            {primaryCards.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                  <svg
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Chưa có thẻ chính
                </h3>
                <p className="text-sm text-gray-500">
                  Khách hàng chưa có thẻ chính nào trong hệ thống.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {primaryCards.map((card) => (
                  <div
                    key={card.cardId}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full`}
                          style={{
                            backgroundColor:
                              card.statusColor ||
                              (card.status === "active"
                                ? "#28a745"
                                : "#dc3545"),
                          }}
                        ></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {card.cardName}
                          </h4>
                          <p className="text-xs sm:text-sm text-purple-600">
                            HDBank •{" "}
                            {card.cardType === "credit" ? "Tín dụng" : "Ghi nợ"}{" "}
                            •{" "}
                            {card.statusDisplay ||
                              (card.status === "active" ? "Hoạt động" : "Khóa")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleToggleCardStatus(card.cardId, card.status)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            card.status === "active"
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            card.status === "active"
                              ? "Khóa thẻ"
                              : "Mở khóa thẻ"
                          }
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
                              d={
                                card.status === "active"
                                  ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              }
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
                        {formatCardNumber(card.maskedNumber)}
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-3">
                      {card.cardType === "credit" &&
                        (card.creditLimit || card.availableCredit) && (
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
                                {card.availableCredit || card.availableLimit}
                              </div>
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Ngày phát hành
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {card.issueDate}
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

                      {/* Giao dịch cuối cùng */}
                      {card.lastTransaction && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                          <div className="text-xs text-blue-600 uppercase tracking-wide mb-2 font-medium">
                            💳 Giao dịch gần nhất
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Ngày:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {new Date(
                                  card.lastTransaction.date
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Số tiền:</span>
                              <span className="ml-1 font-medium text-blue-600">
                                {card.lastTransaction.amount}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Tại:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {card.lastTransaction.merchant}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {card.cardType === "debit" && card.linkedAccount && (
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Tài khoản liên kết
                          </div>
                          <div className="font-mono text-gray-900 text-sm">
                            {card.linkedAccount}
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
            )}
          </div>
        )}

        {/* Thẻ phụ */}
        {activeSubTab === "the-phu" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                  Danh sách thẻ phụ ({supplementaryCards.length})
                </h4>
                {cardsData && (
                  <p className="text-xs text-gray-500 mt-1">
                    CIF: {customerCIF} • Tổng: {supplementaryCards.length} thẻ
                    phụ
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchCardsData}
                  className="px-3 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-xs sm:text-sm font-medium"
                  title="Làm mới dữ liệu"
                >
                  🔄 Làm mới
                </button>
                <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs sm:text-sm font-medium">
                  + Đăng ký thẻ phụ
                </button>
              </div>
            </div>

            {supplementaryCards.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                  <svg
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Chưa có thẻ phụ
                </h3>
                <p className="text-sm text-gray-500">
                  Khách hàng chưa đăng ký thẻ phụ nào.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {supplementaryCards.map((card) => (
                  <div
                    key={card.cardId}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full`}
                          style={{
                            backgroundColor:
                              card.statusColor ||
                              (card.status === "active"
                                ? "#28a745"
                                : "#dc3545"),
                          }}
                        ></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {card.cardName}
                          </h4>
                          <p className="text-xs sm:text-sm text-purple-600">
                            HDBank •{" "}
                            {card.cardType === "credit" ? "Tín dụng" : "Ghi nợ"}{" "}
                            •{" "}
                            {card.statusDisplay ||
                              (card.status === "active" ? "Hoạt động" : "Khóa")}
                          </p>
                          {card.holderName && (
                            <p className="text-xs text-gray-500">
                              Chủ thẻ: {card.holderName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleToggleCardStatus(card.cardId, card.status)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            card.status === "active"
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            card.status === "active"
                              ? "Khóa thẻ"
                              : "Mở khóa thẻ"
                          }
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
                              d={
                                card.status === "active"
                                  ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              }
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="bg-white rounded-lg p-3 mb-4 border border-purple-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Số thẻ phụ
                      </div>
                      <div className="font-mono font-semibold text-gray-900 text-sm sm:text-lg break-all">
                        {formatCardNumber(card.maskedNumber)}
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-3">
                      {card.cardType === "credit" &&
                        (card.creditLimit || card.availableCredit) && (
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
                                {card.availableCredit || card.availableLimit}
                              </div>
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Ngày phát hành
                          </div>
                          <div className="font-medium text-gray-900 text-sm">
                            {card.issueDate}
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

                      {/* Relationship to main card */}
                      {card.relationshipToMainCard && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="text-xs text-blue-600 uppercase tracking-wide mb-1 font-medium">
                            🔗 Liên kết với thẻ chính
                          </div>
                          <div className="text-sm text-blue-700">
                            {card.relationshipToMainCard}
                          </div>
                        </div>
                      )}

                      {/* Giao dịch cuối cùng */}
                      {card.lastTransaction && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                          <div className="text-xs text-blue-600 uppercase tracking-wide mb-2 font-medium">
                            💳 Giao dịch gần nhất
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Ngày:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {new Date(
                                  card.lastTransaction.date
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Số tiền:</span>
                              <span className="ml-1 font-medium text-blue-600">
                                {card.lastTransaction.amount}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Tại:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {card.lastTransaction.merchant}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  className="bg-white border border-gray-200 rounded-lg p-4"
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
                  className={`border rounded-lg p-4 ${
                    statement.status === "current"
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Sao kê {statement.period}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Ngày sao kê: {statement.statementDate} • Hạn thanh toán:{" "}
                        {statement.dueDate}
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

      {/* Notification Component */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
        autoClose={notification.autoClose}
        duration={notification.duration}
      />
    </div>
  );
}

export default CardManagement;
