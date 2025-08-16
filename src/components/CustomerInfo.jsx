import { useEffect, useState } from "react";

function CustomerInfo({ prefill }) {
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [caller, setCaller] = useState(null);
  const [activeTab, setActiveTab] = useState("thong-tin-chung");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [customerDetail, setCustomerDetail] = useState(null);

  const campaigns = [
    { id: 1, name: "HO_Thetindung_Dichvu_220...", user: "tungns3" },
    { id: 2, name: "HO_Thetindung_Dichvu_220...", user: "tungns3" },
    { id: 3, name: "HO_Thetindung_Dichvu_220...", user: "tungns3" },
    { id: 4, name: "HO_Thetindung_Dichvu_220...", user: "tungns3" },
    { id: 5, name: "HO_Thetindung_Dichvu_220...", user: "hoadq1" },
    { id: 6, name: "HO_Thetindung_Dichvu_220...", user: "hoadq1" },
  ];

  // Data mẫu cho sản phẩm dịch vụ ngân hàng
  const bankProducts = {
    debitCards: [
      {
        id: 1,
        cardNumber: "1234 5678 9012 3456",
        cardType: "Thẻ ATM nội địa",
        status: "active",
        issueDate: "01/01/2023",
        expiryDate: "01/01/2028",
        dailyLimit: "50,000,000 VND",
        balance: "15,000,000 VND",
        bank: "Vietcombank",
      },
      {
        id: 2,
        cardNumber: "9876 5432 1098 7654",
        cardType: "Thẻ ATM quốc tế",
        status: "blocked",
        issueDate: "15/03/2023",
        expiryDate: "15/03/2028",
        dailyLimit: "100,000,000 VND",
        balance: "25,000,000 VND",
        bank: "Vietcombank",
      },
    ],
    creditCards: [
      {
        id: 1,
        cardNumber: "1111 2222 3333 4444",
        cardType: "Thẻ tín dụng chuẩn",
        status: "active",
        issueDate: "01/06/2023",
        expiryDate: "01/06/2028",
        creditLimit: "100,000,000 VND",
        availableCredit: "75,000,000 VND",
        currentBalance: "25,000,000 VND",
        bank: "Vietcombank",
      },
      {
        id: 2,
        cardNumber: "5555 6666 7777 8888",
        cardType: "Thẻ tín dụng bạch kim",
        status: "active",
        issueDate: "01/09/2023",
        expiryDate: "01/09/2028",
        creditLimit: "500,000,000 VND",
        availableCredit: "400,000,000 VND",
        currentBalance: "100,000,000 VND",
        bank: "Vietcombank",
      },
    ],
    loans: [
      {
        id: 1,
        loanNumber: "LOAN001",
        loanType: "Vay tiêu dùng",
        status: "active",
        issueDate: "01/01/2023",
        maturityDate: "01/01/2026",
        loanAmount: "200,000,000 VND",
        outstandingBalance: "150,000,000 VND",
        interestRate: "12.5%",
        monthlyPayment: "8,500,000 VND",
        bank: "Vietcombank",
      },
      {
        id: 2,
        loanNumber: "LOAN002",
        loanType: "Vay mua nhà",
        status: "active",
        issueDate: "01/03/2023",
        maturityDate: "01/03/2033",
        loanAmount: "2,000,000,000 VND",
        outstandingBalance: "1,800,000,000 VND",
        interestRate: "8.5%",
        monthlyPayment: "25,000,000 VND",
        bank: "Vietcombank",
      },
    ],
  };

  const toggleCampaign = (campaignId) => {
    setExpandedCampaign(expandedCampaign === campaignId ? null : campaignId);
  };

  useEffect(() => {
    if (prefill) {
      setCaller({
        name: prefill.hoTen || prefill.name,
        phone: prefill.soDienThoai || prefill.phone,
        cif: prefill.cifNumber || prefill.cif,
        note: prefill.note,
      });
    } else {
      setCaller(null);
    }
  }, [prefill]);

  // Fetch chi tiết khách hàng theo CIF khi ở tab "Thông tin chung"
  useEffect(() => {
    const doFetch = async () => {
      if (activeTab !== "thong-tin-chung") return;
      const cif = prefill?.cifNumber || prefill?.cif || caller?.cif;
      if (!cif) return;
      try {
        setDetailLoading(true);
        setDetailError("");
        const mod = await import("../services/customerService.js");
        const res = await mod.default.getCustomerDetailByBody(cif);
        setCustomerDetail(res?.data || null);
      } catch (e) {
        setDetailError(e?.message || "Không thể tải thông tin khách hàng");
        setCustomerDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, prefill?.cifNumber]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Thông tin khách hàng
          </h3>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {caller && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                {(caller.name || "KH")
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {caller.name || "Khách hàng"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {caller.phone} • CIF: {caller.cif}
                </p>
              </div>
            </div>
            {caller.note && (
              <p className="mt-2 text-xs text-gray-700">{caller.note}</p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("thong-tin-chung")}
              className={`py-2 text-sm font-medium border-b-2 ${
                activeTab === "thong-tin-chung"
                  ? "text-blue-600 border-blue-500"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              Thông tin chung
            </button>
            <button
              onClick={() => setActiveTab("gui-y-ban")}
              className={`py-2 text-sm font-medium border-b-2 ${
                activeTab === "gui-y-ban"
                  ? "text-blue-600 border-blue-500"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              Gửi ý bán
            </button>
            <button
              onClick={() => setActiveTab("san-pham-dv")}
              className={`py-2 text-sm font-medium border-b-2 ${
                activeTab === "san-pham-dv"
                  ? "text-blue-600 border-blue-500"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              Sản phẩm dịch vụ
            </button>
          </div>
        </div>

        {/* Tab content: Thông tin chung */}
        {activeTab === "thong-tin-chung" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    Đang tải thông tin khách hàng...
                  </p>
                </div>
              </div>
            ) : detailError ? (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không thể tải thông tin
                </h3>
                <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                  {detailError}
                </p>
              </div>
            ) : customerDetail ? (
              <div className="space-y-6">
                {/* Thông tin cá nhân */}
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h5 className="text-lg font-semibold text-gray-900">
                      Thông tin cá nhân
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        Họ tên
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.personalInfo?.hoTen || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        CIF
                      </div>
                      <div className="text-sm font-mono font-semibold text-gray-900">
                        {customerDetail.personalInfo?.cifNumber || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        CMND/CCCD
                      </div>
                      <div className="text-sm font-mono font-semibold text-gray-900">
                        {customerDetail.personalInfo?.cmnd || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        Ngày sinh
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.personalInfo?.ngaySinh || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        Giới tính
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.personalInfo?.gioiTinh || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200 md:col-span-2">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        Địa chỉ
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.personalInfo?.diaChi || "—"}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Liên hệ */}
                <section className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <h5 className="text-lg font-semibold text-gray-900">
                      Thông tin liên hệ
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                        Số điện thoại
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.contactInfo?.soDienThoai ||
                          caller?.phone ||
                          "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                        Email
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.contactInfo?.email || "—"}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Tài khoản */}
                <section className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <h5 className="text-lg font-semibold text-gray-900">
                      Thông tin tài khoản
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Loại KH
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.accountInfo?.["loaiKhách hàng"] ||
                          customerDetail.accountInfo?.loaiKhachHang ||
                          "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Ngân hàng TK
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.accountInfo?.nganHangTaiKhoan || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Số tài khoản
                      </div>
                      <div className="text-sm font-mono font-semibold text-gray-900">
                        {customerDetail.accountInfo?.soTaiKhoan || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Số dư hiện tại
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.accountInfo?.soDuHienTai || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Ngày mở TK
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.accountInfo?.ngayMoTK || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Trạng thái KH
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.accountInfo?.trangThaiKH || "—"}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Tài chính */}
                <section className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <h5 className="text-lg font-semibold text-gray-900">
                      Thông tin tài chính
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
                        Mức thu nhập
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.financialInfo?.mucThuNhap || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
                        Segment KH
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.financialInfo?.segmentKH || "—"}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Quản lý */}
                <section className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mr-3">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <h5 className="text-lg font-semibold text-gray-900">
                      Thông tin quản lý
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-slate-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">
                        Chi nhánh
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.managementInfo?.chiNhanh || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">
                        Nhân viên quản lý
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.managementInfo?.nhanVienQuanLy || "—"}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có dữ liệu
                </h3>
                <p className="text-gray-500">
                  Không có thông tin khách hàng để hiển thị.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "gui-y-ban" && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Thông tin liên hệ
            </h4>

            {/* Số điện thoại section */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <svg
                  className="w-4 h-4 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Số điện thoại
              </h5>

              {/* Phone numbers 2x2 grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">SĐT 1</div>
                    <div className="text-sm font-medium text-gray-900">
                      {caller?.phone || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">SĐT 2</div>
                    <div className="text-sm font-medium text-gray-400">—</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">SĐT 3</div>
                    <div className="text-sm font-medium text-gray-400">—</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">SĐT 4</div>
                    <div className="text-sm font-medium text-gray-400">—</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email section */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <svg
                  className="w-4 h-4 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Email
              </h5>

              {/* Email 2x2 grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Email 1</div>
                    <div className="text-sm font-medium text-gray-900">
                      {caller?.email || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Email 2</div>
                    <div className="text-sm font-medium text-gray-400">—</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Email 3</div>
                    <div className="text-sm font-medium text-gray-400">—</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Email 4</div>
                    <div className="text-sm font-medium text-gray-400">—</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "gui-y-ban" && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Danh sách hé cư (≤số lượng)
            </h4>

            {/* Table Header */}
            <div className="bg-gray-50 border border-gray-200 rounded-t-lg px-4 py-2">
              <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div>Tên Campaign</div>
                <div>Nhóm số</div>
                <div>Kích bằn</div>
                <div>Hành động</div>
              </div>
            </div>

            {/* Campaign List */}
            <div className="border-l border-r border-b border-gray-200 rounded-b-lg">
              {campaigns.map((campaign, index) => (
                <div
                  key={campaign.id}
                  className={`${index > 0 ? "border-t border-gray-200" : ""}`}
                >
                  {/* Campaign Row */}
                  <div
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleCampaign(campaign.id)}
                  >
                    <div className="grid grid-cols-4 gap-4 items-center text-xs">
                      <div className="flex items-center">
                        <svg
                          className={`w-3 h-3 mr-2 transition-transform ${
                            expandedCampaign === campaign.id ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <span className="text-gray-900">{campaign.name}</span>
                      </div>
                      <div className="text-gray-600">{campaign.user}</div>
                      <div>
                        <button className="text-blue-600 hover:text-blue-800 hover:underline">
                          Tạo đây
                        </button>
                      </div>
                      <div>
                        <button className="text-blue-600 hover:text-blue-800 hover:underline">
                          Tạo đây
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Campaign Details */}
                  {expandedCampaign === campaign.id && (
                    <div className="px-4 pb-4 bg-gray-50">
                      <div className="text-sm font-medium text-gray-900 mb-3 flex items-center justify-between">
                        <span>Mở hộ sư C000668810</span>
                        <button className="text-gray-400 hover:text-gray-600">
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-4 gap-x-4 gap-y-3 text-xs">
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              TÊN KH
                            </div>
                            <div className="text-gray-600">«Tên KH»</div>
                          </div>
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              TRANS_DETAILS
                            </div>
                            <div className="text-gray-600">«THÔNG TIN»</div>
                          </div>
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              EMAIL
                            </div>
                            <div className="text-gray-600">«email»</div>
                          </div>
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              NGAY_SINH
                            </div>
                            <div className="text-gray-600">dd/mm/yyyy</div>
                          </div>
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              SĐT_1
                            </div>
                            <div className="text-gray-600">«số điện thoại»</div>
                          </div>
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              ID
                            </div>
                            <div className="text-gray-600">«ID»</div>
                          </div>
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              LOAI_THE
                            </div>
                            <div className="text-gray-600">«loại thẻ»</div>
                          </div>
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              AUTH_CODE
                            </div>
                            <div className="text-gray-600">«code»</div>
                          </div>
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              GIA_TRI_GIAO_DICH
                            </div>
                            <div className="text-gray-600">xxx.xxx</div>
                          </div>
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              DA_TRA_GOP
                            </div>
                            <div className="text-gray-600">«thông tin»</div>
                          </div>
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              TRANS_DATE
                            </div>
                            <div className="text-gray-600">dd/mm/yyyy</div>
                          </div>
                          <div>
                            <div className="text-gray-400 font-medium mb-1">
                              GIA_TRI_GD
                            </div>
                            <div className="text-gray-600">«gia tri»</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab content: Sản phẩm dịch vụ */}
        {activeTab === "san-pham-dv" && (
          <div className="space-y-6">
            {/* Thẻ ATM/Ghi nợ */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5"
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Thẻ ATM/Ghi nợ
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quản lý thẻ ATM và thẻ ghi nợ
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {bankProducts.debitCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            card.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">
                          {card.cardType}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({card.bank})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {card.status === "active" ? (
                          <>
                            <button className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors">
                              Khóa thẻ
                            </button>
                            <button className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors">
                              Giới hạn giao dịch
                            </button>
                          </>
                        ) : (
                          <button className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors">
                            Mở khóa thẻ
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Số thẻ
                        </div>
                        <div className="font-mono font-medium text-gray-900">
                          {card.cardNumber}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Ngày phát hành
                        </div>
                        <div className="font-medium text-gray-900">
                          {card.issueDate}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Hạn sử dụng
                        </div>
                        <div className="font-medium text-gray-900">
                          {card.expiryDate}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Hạn mức ngày
                        </div>
                        <div className="font-medium text-gray-900">
                          {card.dailyLimit}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Số dư hiện tại
                        </div>
                        <div className="font-medium text-gray-900">
                          {card.balance}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Trạng thái
                        </div>
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            card.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {card.status === "active" ? "Hoạt động" : "Đã khóa"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Thẻ tín dụng */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5"
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Thẻ tín dụng
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quản lý thẻ tín dụng và hạn mức
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {bankProducts.creditCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            card.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">
                          {card.cardType}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({card.bank})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {card.status === "active" ? (
                          <>
                            <button className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors">
                              Khóa thẻ
                            </button>
                            <button className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors">
                              Giới hạn giao dịch
                            </button>
                            <button className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 hover:border-orange-300 transition-colors">
                              Điều chỉnh hạn mức
                            </button>
                          </>
                        ) : (
                          <button className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors">
                            Mở khóa thẻ
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Số thẻ
                        </div>
                        <div className="font-mono font-medium text-gray-900">
                          {card.cardNumber}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Hạn mức tín dụng
                        </div>
                        <div className="font-medium text-gray-900">
                          {card.creditLimit}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Hạn mức khả dụng
                        </div>
                        <div className="font-medium text-gray-900">
                          {card.availableCredit}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Dư nợ hiện tại
                        </div>
                        <div className="font-medium text-gray-900">
                          {card.currentBalance}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Ngày phát hành
                        </div>
                        <div className="font-medium text-gray-900">
                          {card.issueDate}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Hạn sử dụng
                        </div>
                        <div className="font-medium text-gray-900">
                          {card.expiryDate}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Khoản vay */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Khoản vay
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quản lý các khoản vay và trả nợ
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {bankProducts.loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            loan.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">
                          {loan.loanType}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({loan.bank})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors">
                          Xem chi tiết
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors">
                          Lịch sử trả nợ
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 hover:border-orange-300 transition-colors">
                          Điều chỉnh lãi suất
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Mã khoản vay
                        </div>
                        <div className="font-mono font-medium text-gray-900">
                          {loan.loanNumber}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Số tiền vay
                        </div>
                        <div className="font-medium text-gray-900">
                          {loan.loanAmount}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Dư nợ hiện tại
                        </div>
                        <div className="font-medium text-gray-900">
                          {loan.outstandingBalance}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Lãi suất
                        </div>
                        <div className="font-medium text-gray-900">
                          {loan.interestRate}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Ngày vay
                        </div>
                        <div className="font-medium text-gray-900">
                          {loan.issueDate}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Ngày đáo hạn
                        </div>
                        <div className="font-medium text-gray-900">
                          {loan.maturityDate}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Trả nợ hàng tháng
                        </div>
                        <div className="font-medium text-gray-900">
                          {loan.monthlyPayment}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Trạng thái
                        </div>
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            loan.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {loan.status === "active"
                            ? "Đang vay"
                            : "Đã tất toán"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerInfo;
