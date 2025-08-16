import API_CONFIG from "../config/api.js";

class CustomerService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.endpoints = API_CONFIG.ENDPOINTS.CUSTOMERS;
  }

  // Helper method để tạo URL đầy đủ
  getFullURL(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  // Helper method để handle API response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }
    return await response.json();
  }

  // Helper method để tạo request options
  createRequestOptions(method = "GET", body = null, additionalHeaders = {}) {
    const options = {
      method,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...additionalHeaders,
      },
      timeout: API_CONFIG.TIMEOUT,
    };

    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    return options;
  }

  createAuthHeaders() {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Tìm kiếm khách hàng với các filter
   * @param {Object} searchParams - Các tham số tìm kiếm
   * @returns {Promise<Object>} - Kết quả tìm kiếm
   */
  async searchCustomers(searchParams = {}) {
    try {
      const requestBody = {
        searchTerm: searchParams.searchTerm || "",
        gioiTinh: searchParams.gioiTinh || "",
        segmentKH: searchParams.segmentKH || "",
        trangThaiKH: searchParams.trangThaiKH || "",
        chiNhanh: searchParams.chiNhanh || "",
        ngayMoTKFrom: searchParams.ngayMoTKFrom || "",
        ngayMoTKTo: searchParams.ngayMoTKTo || "",
        page: searchParams.page || 1,
        limit: searchParams.limit || 15,
        sortBy: searchParams.sortBy || "soDuHienTai",
        sortOrder: searchParams.sortOrder || "desc",
      };

      const response = await fetch(
        this.getFullURL(this.endpoints.SEARCH),
        this.createRequestOptions("POST", requestBody, this.createAuthHeaders())
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error searching customers:", error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết khách hàng theo CIF
   * @param {string} cifNumber - Mã CIF của khách hàng
   * @returns {Promise<Object>} - Thông tin chi tiết khách hàng
   */
  async getCustomerDetail(cifNumber) {
    try {
      const response = await fetch(
        this.getFullURL(`${this.endpoints.DETAIL}/${cifNumber}`),
        this.createRequestOptions("GET", null, this.createAuthHeaders())
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting customer detail:", error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết theo body (backend yêu cầu POST body)
   * @param {string} cifNumber
   * @returns {Promise<Object>}
   */
  async getCustomerDetailByBody(cifNumber) {
    try {
      const body = { cifNumber };
      const response = await fetch(
        this.getFullURL(this.endpoints.DETAIL_BY_BODY),
        this.createRequestOptions("POST", body, this.createAuthHeaders())
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting customer detail by body:", error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin khách hàng (body theo chuẩn backend)
   * @param {string} cifNumber - Mã CIF
   * @param {Object} updateData - Dữ liệu cập nhật (không bao gồm cifNumber)
   * @returns {Promise<Object>} - Thông tin khách hàng đã cập nhật
   */
  async updateCustomer(cifNumber, updateData) {
    try {
      const body = { cifNumber, updateData };
      const response = await fetch(
        this.getFullURL(this.endpoints.UPDATE),
        this.createRequestOptions("PUT", body, this.createAuthHeaders())
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }

  /**
   * Tạo khách hàng mới
   * @param {Object} customerData - Dữ liệu khách hàng mới
   * @returns {Promise<Object>} - Thông tin khách hàng đã tạo
   */
  async createCustomer(customerData) {
    try {
      const response = await fetch(
        this.getFullURL(this.endpoints.CREATE),
        this.createRequestOptions(
          "POST",
          customerData,
          this.createAuthHeaders()
        )
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

  /**
   * Xóa khách hàng với body theo chuẩn backend
   * @param {Object} payload - { cifNumber, lyDoXoa, nguoiDuyet, xacNhan }
   * @returns {Promise<Object>} - Kết quả xóa
   */
  async deleteCustomer(payload) {
    try {
      const body = {
        cifNumber: payload.cifNumber,
        lyDoXoa: payload.lyDoXoa || "",
        nguoiDuyet: payload.nguoiDuyet || "",
        xacNhan: payload.xacNhan === undefined ? true : !!payload.xacNhan,
      };

      const response = await fetch(
        this.getFullURL(this.endpoints.DELETE),
        this.createRequestOptions("DELETE", body, this.createAuthHeaders())
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }
}

// Export singleton instance
export default new CustomerService();
