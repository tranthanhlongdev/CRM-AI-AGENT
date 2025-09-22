import { useState } from "react";

function AddCustomerModal({ isOpen, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cifNumber: "",
    hoTen: "",
    cmnd: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    diaChi: "",
    soDienThoai: "",
    email: "",
    ngheNghiep: "",
    tinhTrangHonNhan: "Độc thân",
    mucThuNhap: "",
    soTaiKhoan: "",
    loaiKhachHang: "Cá nhân",
    segmentKH: "Basic",
    trangThaiKH: "Hoạt động",
    nhanVienQuanLy: "",
    chiNhanh: "",
    soDuHienTai: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    const requiredFields = [
      { key: "cifNumber", label: "Mã CIF" },
      { key: "hoTen", label: "Họ tên" },
      { key: "cmnd", label: "CMND/CCCD" },
      { key: "ngaySinh", label: "Ngày sinh" },
      { key: "soDienThoai", label: "Số điện thoại" },
      { key: "email", label: "Email" },
      { key: "soTaiKhoan", label: "Số tài khoản" },
      { key: "chiNhanh", label: "Chi nhánh" },
      { key: "nhanVienQuanLy", label: "Nhân viên quản lý" },
    ];

    requiredFields.forEach((field) => {
      if (!formData[field.key]?.trim()) {
        newErrors[field.key] = `${field.label} không được để trống`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    // Phone validation
    if (formData.soDienThoai && !/^[0-9]{10,11}$/.test(formData.soDienThoai)) {
      newErrors.soDienThoai = "Số điện thoại phải có 10-11 chữ số";
    }

    // CMND validation
    if (formData.cmnd && !/^[0-9]{9,12}$/.test(formData.cmnd)) {
      newErrors.cmnd = "CMND/CCCD phải có 9-12 chữ số";
    }

    // CIF number validation
    if (formData.cifNumber && !/^CIF[0-9]{6,}$/.test(formData.cifNumber)) {
      newErrors.cifNumber =
        "Mã CIF phải có định dạng CIF + ít nhất 6 chữ số (VD: CIF808080)";
    }

    // Account number validation
    if (formData.soTaiKhoan && !/^[0-9]{10,20}$/.test(formData.soTaiKhoan)) {
      newErrors.soTaiKhoan = "Số tài khoản phải có 10-20 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const customerData = {
        ...formData,
        mucThuNhap: parseInt(formData.mucThuNhap) || 0,
        soDuHienTai: parseInt(formData.soDuHienTai) || 0,
      };

      await onSave(customerData);

      // Reset form sau khi tạo thành công
      setFormData({
        cifNumber: "",
        hoTen: "",
        cmnd: "",
        ngaySinh: "",
        gioiTinh: "Nam",
        diaChi: "",
        soDienThoai: "",
        email: "",
        ngheNghiep: "",
        tinhTrangHonNhan: "Độc thân",
        mucThuNhap: "",
        soTaiKhoan: "",
        loaiKhachHang: "Cá nhân",
        segmentKH: "Basic",
        trangThaiKH: "Hoạt động",
        nhanVienQuanLy: "",
        chiNhanh: "",
        soDuHienTai: "",
      });
      setErrors({});

      // Parent component sẽ đóng modal và hiển thị thông báo
      // Không cần gọi onClose() ở đây
    } catch (error) {
      console.error("Error creating customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      cifNumber: "",
      hoTen: "",
      cmnd: "",
      ngaySinh: "",
      gioiTinh: "Nam",
      diaChi: "",
      soDienThoai: "",
      email: "",
      ngheNghiep: "",
      tinhTrangHonNhan: "Độc thân",
      mucThuNhap: "",
      soTaiKhoan: "",
      loaiKhachHang: "Cá nhân",
      segmentKH: "Basic",
      trangThaiKH: "Hoạt động",
      nhanVienQuanLy: "",
      chiNhanh: "",
      soDuHienTai: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">
              Thêm khách hàng mới
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)]"
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Thông tin cá nhân */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
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
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã CIF <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cifNumber}
                    onChange={(e) =>
                      handleInputChange("cifNumber", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cifNumber ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập mã CIF (VD: CIF808080)"
                  />
                  {errors.cifNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cifNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.hoTen}
                    onChange={(e) => handleInputChange("hoTen", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.hoTen ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.hoTen && (
                    <p className="text-red-500 text-xs mt-1">{errors.hoTen}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CMND/CCCD <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cmnd}
                    onChange={(e) => handleInputChange("cmnd", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cmnd ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập CMND/CCCD"
                  />
                  {errors.cmnd && (
                    <p className="text-red-500 text-xs mt-1">{errors.cmnd}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.ngaySinh}
                    onChange={(e) =>
                      handleInputChange("ngaySinh", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.ngaySinh ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.ngaySinh && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.ngaySinh}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formData.gioiTinh}
                    onChange={(e) =>
                      handleInputChange("gioiTinh", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nghề nghiệp
                  </label>
                  <input
                    type="text"
                    value={formData.ngheNghiep}
                    onChange={(e) =>
                      handleInputChange("ngheNghiep", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập nghề nghiệp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tình trạng hôn nhân
                  </label>
                  <select
                    value={formData.tinhTrangHonNhan}
                    onChange={(e) =>
                      handleInputChange("tinhTrangHonNhan", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Độc thân">Độc thân</option>
                    <option value="Đã kết hôn">Đã kết hôn</option>
                    <option value="Ly hôn">Ly hôn</option>
                    <option value="Góa">Góa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  value={formData.diaChi}
                  onChange={(e) => handleInputChange("diaChi", e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              {/* Thông tin liên hệ */}
              <h3 className="text-lg font-semibold text-gray-900 flex items-center pt-4">
                <svg
                  className="w-5 h-5 mr-2"
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
                Thông tin liên hệ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.soDienThoai}
                    onChange={(e) =>
                      handleInputChange("soDienThoai", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.soDienThoai ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.soDienThoai && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.soDienThoai}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Thông tin tài khoản */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
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
                Thông tin tài khoản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tài khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.soTaiKhoan}
                    onChange={(e) =>
                      handleInputChange("soTaiKhoan", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.soTaiKhoan ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập số tài khoản"
                  />
                  {errors.soTaiKhoan && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.soTaiKhoan}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số dư hiện tại (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.soDuHienTai}
                    onChange={(e) =>
                      handleInputChange("soDuHienTai", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số dư"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại khách hàng
                  </label>
                  <select
                    value={formData.loaiKhachHang}
                    onChange={(e) =>
                      handleInputChange("loaiKhachHang", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cá nhân">Cá nhân</option>
                    <option value="Doanh nghiệp">Doanh nghiệp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segment khách hàng
                  </label>
                  <select
                    value={formData.segmentKH}
                    onChange={(e) =>
                      handleInputChange("segmentKH", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái tài khoản
                  </label>
                  <select
                    value={formData.trangThaiKH}
                    onChange={(e) =>
                      handleInputChange("trangThaiKH", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm khóa">Tạm khóa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức thu nhập (VND/tháng)
                  </label>
                  <input
                    type="number"
                    value={formData.mucThuNhap}
                    onChange={(e) =>
                      handleInputChange("mucThuNhap", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mức thu nhập"
                    min="0"
                  />
                </div>
              </div>

              {/* Thông tin quản lý */}
              <h3 className="text-lg font-semibold text-gray-900 flex items-center pt-4">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0h2m0 0H9m11 0V9a2 2 0 00-2-2M9 21V9a2 2 0 012-2h2a2 2 0 012 2v12m-6 0h6m-6 0H9"
                  />
                </svg>
                Thông tin quản lý
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chi nhánh <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.chiNhanh}
                    onChange={(e) =>
                      handleInputChange("chiNhanh", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.chiNhanh ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Chọn chi nhánh</option>
                    <option value="CN Đống Đa">CN Đống Đa</option>
                    <option value="CN Cầu Giấy">CN Cầu Giấy</option>
                    <option value="CN Hoàn Kiếm">CN Hoàn Kiếm</option>
                    <option value="CN Thanh Xuân">CN Thanh Xuân</option>
                    <option value="CN Nam Từ Liêm">CN Nam Từ Liêm</option>
                    <option value="CN Test">CN Test</option>
                  </select>
                  {errors.chiNhanh && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.chiNhanh}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhân viên quản lý <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nhanVienQuanLy}
                    onChange={(e) =>
                      handleInputChange("nhanVienQuanLy", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.nhanVienQuanLy
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Nhập tên nhân viên quản lý"
                  />
                  {errors.nhanVienQuanLy && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.nhanVienQuanLy}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 order-2 sm:order-1"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center order-1 sm:order-2"
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading ? "Đang tạo..." : "Tạo khách hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCustomerModal;
