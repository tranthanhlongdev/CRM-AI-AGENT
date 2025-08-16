import { useState, useEffect, useCallback } from "react";
import CustomerDetail from "./CustomerDetail";
import AddCustomerModal from "./AddCustomerModal";
import DeleteCustomerModal from "./DeleteCustomerModal";
import SuccessNotification from "./SuccessNotification";
import customerService from "../services/customerService";

function CustomerManagement() {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  // Modal states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // API data states
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(5);

  // Sort states
  const [sortBy] = useState("soDuHienTai");
  const [sortOrder] = useState("desc");

  // Function to fetch customers from API
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = {
        searchTerm,
        gioiTinh: "",
        segmentKH: segmentFilter === "all" ? "" : segmentFilter,
        trangThaiKH:
          filterType === "all"
            ? ""
            : filterType === "active"
            ? "Hoạt động"
            : "Tạm khóa",
        chiNhanh: branchFilter === "all" ? "" : branchFilter,
        ngayMoTKFrom: "",
        ngayMoTKTo: "",
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
      };

      const response = await customerService.searchCustomers(searchParams);

      if (response.success) {
        setCustomers(response.data.customers);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.totalRecords);
      } else {
        setError("Không thể tải danh sách khách hàng");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    filterType,
    segmentFilter,
    branchFilter,
    currentPage,
    sortBy,
    sortOrder,
    limit,
  ]);

  // Load customers on component mount and when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCustomers();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    filterType,
    segmentFilter,
    branchFilter,
    currentPage,
    sortBy,
    sortOrder,
    fetchCustomers,
  ]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setSegmentFilter("all");
    setBranchFilter("all");
    setCurrentPage(1);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsEditMode(false);
    setIsDetailOpen(true);
  };

  const handleEditCustomer = async (customer) => {
    try {
      setLoading(true);
      setError(null);
      // Lấy chi tiết mới nhất từ API bằng body (đúng theo yêu cầu backend)
      const res = await customerService.getCustomerDetailByBody(
        customer.cifNumber
      );
      const apiData = res?.data;
      const detail = apiData
        ? {
            // personalInfo
            cifNumber: apiData.personalInfo?.cifNumber || customer.cifNumber,
            hoTen: apiData.personalInfo?.hoTen || customer.hoTen,
            cmnd: apiData.personalInfo?.cmnd || customer.cmnd,
            ngaySinh: apiData.personalInfo?.ngaySinh || customer.ngaySinh,
            gioiTinh: apiData.personalInfo?.gioiTinh || customer.gioiTinh,
            ngheNghiep: apiData.personalInfo?.ngheNghiep || customer.ngheNghiep,
            tinhTrangHonNhan:
              apiData.personalInfo?.tinhTrangHonNhan ||
              customer.tinhTrangHonNhan,
            diaChi: apiData.personalInfo?.diaChi || customer.diaChi,
            // contactInfo
            soDienThoai:
              apiData.contactInfo?.soDienThoai || customer.soDienThoai,
            email: apiData.contactInfo?.email || customer.email,
            // financialInfo
            mucThuNhap:
              apiData.financialInfo?.mucThuNhap || customer.mucThuNhap,
            segmentKH: apiData.financialInfo?.segmentKH || customer.segmentKH,
            // accountInfo
            loaiKhachHang:
              apiData.accountInfo?.loaiKhachHang || customer.loaiKhachHang,
            nganHangTaiKhoan:
              apiData.accountInfo?.nganHangTaiKhoan ||
              customer.nganHangTaiKhoan,
            ngayMoTK: apiData.accountInfo?.ngayMoTK || customer.ngayMoTK,
            soDuHienTai:
              apiData.accountInfo?.soDuHienTai || customer.soDuHienTai,
            soTaiKhoan: apiData.accountInfo?.soTaiKhoan || customer.soTaiKhoan,
            trangThaiKH:
              apiData.accountInfo?.trangThaiKH || customer.trangThaiKH,
            // managementInfo
            chiNhanh: apiData.managementInfo?.chiNhanh || customer.chiNhanh,
            nhanVienQuanLy:
              apiData.managementInfo?.nhanVienQuanLy || customer.nhanVienQuanLy,
          }
        : customer;
      setSelectedCustomer(detail);
      setIsEditMode(true);
      setIsDetailOpen(true);
    } catch (e) {
      // Fallback mở modal với dữ liệu sẵn có nếu call lỗi
      setSelectedCustomer(customer);
      setIsEditMode(true);
      setIsDetailOpen(true);
      setError(e?.message || "Không lấy được chi tiết khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomer = async (updatedCustomer) => {
    try {
      const { cifNumber, ...rest } = updatedCustomer || {};
      const response = await customerService.updateCustomer(cifNumber, rest);

      if (response.success) {
        // Refresh the customer list
        fetchCustomers();
        setIsDetailOpen(false);
        setSuccessMessage("Cập nhật thông tin khách hàng thành công!");
        setShowSuccess(true);
      } else {
        setError("Không thể cập nhật thông tin khách hàng");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi cập nhật");
      console.error("Error updating customer:", err);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCustomer(null);
    setIsEditMode(false);
  };

  const handleAddCustomer = async (customerData) => {
    try {
      const response = await customerService.createCustomer(customerData);

      if (response.success) {
        // Refresh the customer list
        fetchCustomers();
        setIsAddModalOpen(false);
        setSuccessMessage(`Tạo khách hàng "${customerData.hoTen}" thành công!`);
        setShowSuccess(true);
      } else {
        setError("Không thể tạo khách hàng mới");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi tạo khách hàng");
      console.error("Error creating customer:", err);
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openDeleteModal = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCustomerToDelete(null);
  };

  const handleConfirmDelete = async ({
    cifNumber,
    lyDoXoa,
    nguoiDuyet,
    xacNhan,
  }) => {
    try {
      setError(null);
      const res = await customerService.deleteCustomer({
        cifNumber,
        lyDoXoa,
        nguoiDuyet,
        xacNhan,
      });
      if (res?.success) {
        setSuccessMessage(
          `Đã xóa khách hàng ${res.data?.deletedCustomer?.hoTen || cifNumber}`
        );
        setShowSuccess(true);
        closeDeleteModal();
        fetchCustomers();
      } else {
        setError(res?.message || "Xóa khách hàng thất bại");
      }
    } catch (e) {
      setError(e?.message || "Xóa khách hàng thất bại");
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 sm:p-2 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Quản lý khách hàng
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            <span className="hidden sm:inline">Thêm khách hàng</span>
            <span className="sm:hidden">Thêm KH</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <svg
              className="w-5 h-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
        {/* Search Input - Full width on mobile */}
        <div className="mb-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-3 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, CIF, CMND, SĐT..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* Status Filter */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1 sm:hidden">
              Trạng thái
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Tạm khóa</option>
            </select>
          </div>

          {/* Segment Filter */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1 sm:hidden">
              Segment
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
            >
              <option value="all">Tất cả segment</option>
              <option value="VIP">VIP</option>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
              <option value="Basic">Basic</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1 sm:hidden">
              Chi nhánh
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="all">Tất cả chi nhánh</option>
              <option value="CN Đống Đa">CN Đống Đa</option>
              <option value="CN Cầu Giấy">CN Cầu Giấy</option>
              <option value="CN Phú Mỹ Hưng">CN Phú Mỹ Hưng</option>
              <option value="CN Sài Gòn">CN Sài Gòn</option>
              <option value="CN Thủ Đức">CN Thủ Đức</option>
              <option value="CN Tân Bình">CN Tân Bình</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="sm:col-span-1">
            <button
              className="w-full px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
              onClick={handleClearFilters}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">Xóa bộ lọc</span>
              <span className="sm:hidden">Reset</span>
            </button>
          </div>

          {/* Export Button */}
          <div className="sm:col-span-1">
            <button className="w-full px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="hidden sm:inline">Xuất Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Table Content - Scrollable */}
        <div className="flex-1 overflow-auto">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {customers.length > 0 ? (
              <div className="p-4 space-y-4 pb-0">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {customer.hoTen}
                        </h3>
                        <p className="text-sm text-blue-600">
                          {customer.cifNumber}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.segmentKH === "VIP"
                            ? "bg-purple-100 text-purple-800"
                            : customer.segmentKH === "Premium"
                            ? "bg-blue-100 text-blue-800"
                            : customer.segmentKH === "Standard"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {customer.segmentKH}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">SĐT:</span>
                        <p className="font-medium">{customer.soDienThoai}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-medium truncate">{customer.email}</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="text-blue-600 hover:text-blue-800 p-2"
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
                        onClick={() => handleEditCustomer(customer)}
                        className="text-green-600 hover:text-green-800 p-2"
                        title="Chỉnh sửa"
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
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => openDeleteModal(customer)}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="Xóa khách hàng"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Không tìm thấy khách hàng
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                </p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <table className="hidden sm:table min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CIF
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HỌ TÊN
                </th>
                <th className="hidden lg:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CMND/CCCD
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SỐ ĐIỆN THOẠI
                </th>
                <th className="hidden xl:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMAIL
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SEGMENT
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TRẠNG THÁI
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HÀNH ĐỘNG
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                    {customer.cifNumber}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="max-w-32 truncate">{customer.hoTen}</div>
                  </td>
                  <td className="hidden lg:table-cell px-3 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">
                    {customer.cmnd}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600">
                    {customer.soDienThoai}
                  </td>
                  <td className="hidden xl:table-cell px-3 py-3 whitespace-nowrap text-sm text-gray-600">
                    <div className="max-w-40 truncate">{customer.email}</div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.segmentKH === "VIP"
                          ? "bg-purple-100 text-purple-800"
                          : customer.segmentKH === "Premium"
                          ? "bg-blue-100 text-blue-800"
                          : customer.segmentKH === "Standard"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {customer.segmentKH}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.trangThaiKH === "Hoạt động"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {customer.trangThaiKH}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="text-blue-600 hover:text-blue-800 p-1"
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
                        onClick={() => handleEditCustomer(customer)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Chỉnh sửa"
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
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => openDeleteModal(customer)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Xóa khách hàng"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state */}
          {!loading && customers.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Không tìm thấy khách hàng
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
              </p>
            </div>
          )}
        </div>

        {/* Pagination - Fixed at bottom */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center justify-center sm:justify-start">
              <div className="text-sm text-gray-700">
                Tổng: <span className="font-medium">{totalRecords}</span> khách
                hàng
              </div>
              {loading && (
                <div className="flex items-center text-sm text-gray-500 ml-4">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
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
                  <span className="hidden sm:inline">Đang tải...</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">Trước</span>
              </button>
              <div className="flex items-center">
                <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded">
                  {currentPage} / {totalPages}
                </span>
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <span className="hidden sm:inline">Sau</span>
                <svg
                  className="w-4 h-4 ml-1"
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
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetail
        key={selectedCustomer?.cifNumber || (isDetailOpen ? "open" : "closed")}
        customer={selectedCustomer}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onSave={handleSaveCustomer}
        isEditMode={isEditMode}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleAddCustomer}
      />

      {/* Delete Customer Modal */}
      <DeleteCustomerModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        customer={customerToDelete}
      />

      {/* Success Notification */}
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}

export default CustomerManagement;
