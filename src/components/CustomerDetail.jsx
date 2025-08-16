import { useEffect, useState } from "react";

function CustomerDetail({
  customer,
  isOpen,
  onClose,
  onSave,
  isEditMode = false,
}) {
  const [editMode, setEditMode] = useState(isEditMode);
  const [formData, setFormData] = useState(customer || {});

  // Sync form state when incoming customer changes (e.g., open with another CIF or after API detail returns)
  useEffect(() => {
    setFormData(customer || {});
  }, [customer]);

  // Sync edit mode when parent toggles isEditMode (e.g., open directly in edit mode)
  useEffect(() => {
    setEditMode(isEditMode);
  }, [isEditMode, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData(customer);
    setEditMode(false);
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{formData.hoTen}</h2>
                <p className="text-blue-100">CIF: {formData.cifNumber}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      formData.segmentKH === "VIP"
                        ? "bg-purple-500"
                        : formData.segmentKH === "Premium"
                        ? "bg-blue-500"
                        : formData.segmentKH === "Standard"
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {formData.segmentKH}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      formData.trangThaiKH === "Hoạt động"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {formData.trangThaiKH}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                    />
                  </svg>
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  >
                    Lưu
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
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
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
                      Họ và tên
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.hoTen || ""}
                        onChange={(e) =>
                          handleInputChange("hoTen", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.hoTen}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CMND/CCCD
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.cmnd || ""}
                        onChange={(e) =>
                          handleInputChange("cmnd", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2 font-mono">
                        {formData.cmnd}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    {editMode ? (
                      <input
                        type="date"
                        value={formData.ngaySinh || ""}
                        onChange={(e) =>
                          handleInputChange("ngaySinh", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.ngaySinh}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính
                    </label>
                    {editMode ? (
                      <select
                        value={formData.gioiTinh || ""}
                        onChange={(e) =>
                          handleInputChange("gioiTinh", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{formData.gioiTinh}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nghề nghiệp
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.ngheNghiep || ""}
                        onChange={(e) =>
                          handleInputChange("ngheNghiep", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {formData.ngheNghiep}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tình trạng hôn nhân
                    </label>
                    {editMode ? (
                      <select
                        value={formData.tinhTrangHonNhan || ""}
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
                    ) : (
                      <p className="text-gray-900 py-2">
                        {formData.tinhTrangHonNhan}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  {editMode ? (
                    <textarea
                      value={formData.diaChi || ""}
                      onChange={(e) =>
                        handleInputChange("diaChi", e.target.value)
                      }
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.diaChi}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
                      Số điện thoại
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.soDienThoai || ""}
                        onChange={(e) =>
                          handleInputChange("soDienThoai", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2 font-mono">
                        {formData.soDienThoai}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  Thông tin tài chính
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mức thu nhập (VND/tháng)
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.mucThuNhap || ""}
                        onChange={(e) =>
                          handleInputChange("mucThuNhap", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2 font-semibold">
                        {formData.mucThuNhap} VND
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Segment khách hàng
                    </label>
                    {editMode ? (
                      <select
                        value={formData.segmentKH || ""}
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
                    ) : (
                      <p className="text-gray-900 py-2">{formData.segmentKH}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div className="space-y-6">
              {/* Account Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tài khoản
                    </label>
                    <p className="text-gray-900 py-2 font-mono text-lg font-semibold">
                      {formData.soTaiKhoan}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số dư hiện tại
                    </label>
                    <p className="text-green-600 py-2 text-xl font-bold">
                      {formData.soDuHienTai} VND
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày mở tài khoản
                    </label>
                    <p className="text-gray-900 py-2">{formData.ngayMoTK}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái tài khoản
                    </label>
                    {editMode ? (
                      <select
                        value={formData.trangThaiKH || ""}
                        onChange={(e) =>
                          handleInputChange("trangThaiKH", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Tạm khóa">Tạm khóa</option>
                        <option value="Đóng">Đóng</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          formData.trangThaiKH === "Hoạt động"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {formData.trangThaiKH}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Management Information */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chi nhánh
                    </label>
                    {editMode ? (
                      <select
                        value={formData.chiNhanh || ""}
                        onChange={(e) =>
                          handleInputChange("chiNhanh", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="CN Đống Đa">CN Đống Đa</option>
                        <option value="CN Cầu Giấy">CN Cầu Giấy</option>
                        <option value="CN Phú Mỹ Hưng">CN Phú Mỹ Hưng</option>
                        <option value="CN Sài Gòn">CN Sài Gòn</option>
                        <option value="CN Thủ Đức">CN Thủ Đức</option>
                        <option value="CN Tân Bình">CN Tân Bình</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{formData.chiNhanh}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhân viên quản lý
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.nhanVienQuanLy || ""}
                        onChange={(e) =>
                          handleInputChange("nhanVienQuanLy", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {formData.nhanVienQuanLy}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <svg
                    className="w-4 h-4 inline mr-2"
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
                  Tạo báo cáo
                </button>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <svg
                    className="w-4 h-4 inline mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  Lịch sử giao dịch
                </button>
                <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors">
                  <svg
                    className="w-4 h-4 inline mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Mở sản phẩm mới
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
