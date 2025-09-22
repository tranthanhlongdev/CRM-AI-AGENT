import { useEffect, useState } from "react";
import PaymentAccount from "./banking/PaymentAccount";
import CardManagement from "./banking/CardManagement";
import SavingsAccount from "./banking/SavingsAccount";
import LoanManagement from "./banking/LoanManagement";
import SMSBanking from "./banking/SMSBanking";

function CustomerInfo({ prefill }) {
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [caller, setCaller] = useState(null);
  const [activeTab, setActiveTab] = useState("thong-tin-chung");
  const [activeBankingTab, setActiveBankingTab] = useState(
    "tai-khoan-thanh-toan"
  );
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
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Thông tin khách hàng
          </h3>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600 p-1">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1">
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
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto">
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
              <div className="min-w-0 flex-1">
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
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("thong-tin-chung")}
              className={`py-2 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "thong-tin-chung"
                  ? "text-blue-600 border-blue-500"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              Thông tin chung
            </button>
            <button
              onClick={() => setActiveTab("gui-y-ban")}
              className={`py-2 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "gui-y-ban"
                  ? "text-blue-600 border-blue-500"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              Gửi ý bán
            </button>
            <button
              onClick={() => setActiveTab("san-pham-dv")}
              className={`py-2 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
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
          <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
            {detailLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm sm:text-base text-gray-600">
                    Đang tải thông tin khách hàng...
                  </p>
                </div>
              </div>
            ) : detailError ? (
              <div className="py-6 sm:py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-100 text-red-600 mb-4">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Không thể tải thông tin
                </h3>
                <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                  {detailError}
                </p>
              </div>
            ) : customerDetail ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Thông tin cá nhân */}
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
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
                    <h5 className="text-base sm:text-lg font-semibold text-gray-900">
                      Thông tin cá nhân
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        Họ tên
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.personalInfo?.hoTen || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        CIF
                      </div>
                      <div className="text-sm font-mono font-semibold text-gray-900">
                        {customerDetail.personalInfo?.cifNumber || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        CMND/CCCD
                      </div>
                      <div className="text-sm font-mono font-semibold text-gray-900">
                        {customerDetail.personalInfo?.cmnd || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        Ngày sinh
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.personalInfo?.ngaySinh || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        Giới tính
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.personalInfo?.gioiTinh || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200 sm:col-span-2">
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
                <section className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
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
                    <h5 className="text-base sm:text-lg font-semibold text-gray-900">
                      Thông tin liên hệ
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                        Số điện thoại
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.contactInfo?.soDienThoai ||
                          caller?.phone ||
                          "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100 hover:shadow-md transition-shadow duration-200">
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
                <section className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
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
                    <h5 className="text-base sm:text-lg font-semibold text-gray-900">
                      Thông tin tài khoản
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Loại KH
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.accountInfo?.["loaiKhách hàng"] ||
                          customerDetail.accountInfo?.loaiKhachHang ||
                          "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Ngân hàng TK
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.accountInfo?.nganHangTaiKhoan || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Số tài khoản
                      </div>
                      <div className="text-sm font-mono font-semibold text-gray-900 break-all">
                        {customerDetail.accountInfo?.soTaiKhoan || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Số dư hiện tại
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.accountInfo?.soDuHienTai || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Ngày mở TK
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.accountInfo?.ngayMoTK || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
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
                <section className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
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
                    <h5 className="text-base sm:text-lg font-semibold text-gray-900">
                      Thông tin tài chính
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-amber-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
                        Mức thu nhập
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.financialInfo?.mucThuNhap || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-amber-100 hover:shadow-md transition-shadow duration-200">
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
                <section className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mr-3">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
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
                    <h5 className="text-base sm:text-lg font-semibold text-gray-900">
                      Thông tin quản lý
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-100 hover:shadow-md transition-shadow duration-200">
                      <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">
                        Chi nhánh
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {customerDetail.managementInfo?.chiNhanh || "—"}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-100 hover:shadow-md transition-shadow duration-200">
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
              <div className="text-center py-8 sm:py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Chưa có dữ liệu
                </h3>
                <p className="text-sm sm:text-base text-gray-500">
                  Không có thông tin khách hàng để hiển thị.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "gui-y-ban" && (
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4">
              Thông tin liên hệ
            </h4>

            {/* Số điện thoại section */}
            <div className="mb-4 sm:mb-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-blue-500 flex-shrink-0"
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
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">SĐT 1</div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {caller?.phone || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-blue-500 flex-shrink-0"
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
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">SĐT 2</div>
                    <div className="text-sm font-medium text-gray-400">—</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">SĐT 3</div>
                    <div className="text-sm font-medium text-gray-400">—</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                  <div className="min-w-0 flex-1">
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
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email
              </h5>

              {/* Email 2x2 grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">Email 1</div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {caller?.email || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">Email 2</div>
                    <div className="text-sm font-medium text-gray-400">—</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">Email 3</div>
                    <div className="text-sm font-medium text-gray-400">—</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">Email 4</div>
                    <div className="text-sm font-medium text-gray-400">—</div>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Danh sách hé cư (≤số lượng)
            </h4>

            {/* Table Header */}
            <div className="bg-gray-50 border border-gray-200 rounded-t-lg px-3 sm:px-4 py-2">
              <div className="grid grid-cols-4 gap-2 sm:gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="truncate">Tên Campaign</div>
                <div className="truncate">Nhóm số</div>
                <div className="truncate">Kích bằn</div>
                <div className="truncate">Hành động</div>
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
                    className="px-3 sm:px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleCampaign(campaign.id)}
                  >
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center text-xs">
                      <div className="flex items-center min-w-0">
                        <svg
                          className={`w-3 h-3 mr-2 transition-transform flex-shrink-0 ${
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
                        <span className="text-gray-900 truncate">
                          {campaign.name}
                        </span>
                      </div>
                      <div className="text-gray-600 truncate">
                        {campaign.user}
                      </div>
                      <div>
                        <button className="text-blue-600 hover:text-blue-800 hover:underline text-xs">
                          Tạo đây
                        </button>
                      </div>
                      <div>
                        <button className="text-blue-600 hover:text-blue-800 hover:underline text-xs">
                          Tạo đây
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Campaign Details */}
                  {expandedCampaign === campaign.id && (
                    <div className="px-3 sm:px-4 pb-4 bg-gray-50">
                      <div className="text-sm font-medium text-gray-900 mb-3 flex items-center justify-between">
                        <span className="truncate">Mở hộ sư C000668810</span>
                        <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-2 sm:gap-x-4 gap-y-3 text-xs">
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

        {activeTab === "san-pham-dv" && (
          <div className="space-y-4">
            {/* Simple Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Sản Phẩm Dịch Vụ Ngân Hàng
                </h3>
              </div>
            </div>

            {/* Flat Service Navigation */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveBankingTab("tai-khoan-thanh-toan")}
                  className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeBankingTab === "tai-khoan-thanh-toan"
                      ? "text-indigo-600 border-indigo-500"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Tài khoản thanh toán
                </button>
                <button
                  onClick={() => setActiveBankingTab("the")}
                  className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeBankingTab === "the"
                      ? "text-indigo-600 border-indigo-500"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Thẻ
                </button>
                <button
                  onClick={() => setActiveBankingTab("tiet-kiem")}
                  className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeBankingTab === "tiet-kiem"
                      ? "text-indigo-600 border-indigo-500"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Tiết kiệm
                </button>
                <button
                  onClick={() => setActiveBankingTab("khoan-vay")}
                  className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeBankingTab === "khoan-vay"
                      ? "text-indigo-600 border-indigo-500"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Khoản vay
                </button>
                <button
                  onClick={() => setActiveBankingTab("sms-banking")}
                  className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeBankingTab === "sms-banking"
                      ? "text-indigo-600 border-indigo-500"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  SMS Banking
                </button>
              </div>
            </div>

            {/* Banking Service Content - No wrapper card */}
            <div className="pt-4">
              {activeBankingTab === "tai-khoan-thanh-toan" && (
                <PaymentAccount />
              )}
              {activeBankingTab === "the" && (
                <CardManagement
                  customerCIF={
                    prefill?.cifNumber || prefill?.cif || caller?.cif
                  }
                />
              )}
              {activeBankingTab === "tiet-kiem" && <SavingsAccount />}
              {activeBankingTab === "khoan-vay" && <LoanManagement />}
              {activeBankingTab === "sms-banking" && <SMSBanking />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerInfo;
