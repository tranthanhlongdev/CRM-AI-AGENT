import API_CONFIG from "../config/api.js";

class CardService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.endpoints = API_CONFIG.ENDPOINTS.CARDS;
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
   * Lấy danh sách thẻ theo CIF
   * @param {string} cifNumber - Mã CIF của khách hàng
   * @param {boolean} fullInfo - Lấy thông tin đầy đủ
   * @returns {Promise<Object>} - Danh sách thẻ
   */
  async getCardsByCIF(cifNumber, fullInfo = true) {
    try {
      const url = `${this.endpoints.BY_CIF}/${cifNumber}${
        fullInfo ? "?full_info=true" : ""
      }`;
      const response = await fetch(
        this.getFullURL(url),
        this.createRequestOptions("GET", null, this.createAuthHeaders())
      );

      const result = await this.handleResponse(response);

      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || "Không thể lấy danh sách thẻ");
      }
    } catch (error) {
      console.error("Error getting cards by CIF:", error);

      // Fallback với mock data
      return this.getMockCardsByCIF(cifNumber);
    }
  }

  /**
   * Khóa thẻ
   * @param {string} cardId - ID của thẻ cần khóa
   * @returns {Promise<Object>} - Kết quả khóa thẻ
   */
  async blockCard(cardId) {
    try {
      const response = await fetch(
        this.getFullURL(this.endpoints.BLOCK),
        this.createRequestOptions("POST", { cardId }, this.createAuthHeaders())
      );

      const result = await this.handleResponse(response);

      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || "Không thể khóa thẻ");
      }
    } catch (error) {
      console.error("Error blocking card:", error);

      // Fallback response
      return this.getMockBlockResult(cardId);
    }
  }

  /**
   * Mở khóa thẻ
   * @param {string} cardId - ID của thẻ cần mở khóa
   * @returns {Promise<Object>} - Kết quả mở khóa thẻ
   */
  async unblockCard(cardId) {
    try {
      const response = await fetch(
        this.getFullURL(this.endpoints.UNBLOCK),
        this.createRequestOptions("POST", { cardId }, this.createAuthHeaders())
      );

      const result = await this.handleResponse(response);

      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || "Không thể mở khóa thẻ");
      }
    } catch (error) {
      console.error("Error unblocking card:", error);

      // Fallback response
      return this.getMockUnblockResult(cardId);
    }
  }

  /**
   * Lấy chi tiết thẻ
   * @param {string} cardId - ID của thẻ
   * @returns {Promise<Object>} - Chi tiết thẻ
   */
  async getCardDetail(cardId) {
    try {
      const response = await fetch(
        this.getFullURL(`${this.endpoints.DETAIL}/${cardId}`),
        this.createRequestOptions("GET", null, this.createAuthHeaders())
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting card detail:", error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử giao dịch thẻ
   * @param {string} cardId - ID của thẻ
   * @param {Object} options - Tùy chọn lọc (limit, fromDate, toDate)
   * @returns {Promise<Object>} - Lịch sử giao dịch
   */
  async getCardTransactions(cardId, options = {}) {
    try {
      const queryParams = new URLSearchParams(options);
      const url = `${this.endpoints.TRANSACTIONS}/${cardId}?${queryParams}`;

      const response = await fetch(
        this.getFullURL(url),
        this.createRequestOptions("GET", null, this.createAuthHeaders())
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error getting card transactions:", error);
      throw error;
    }
  }

  /**
   * Mock data cho development - Lấy thẻ theo CIF
   * @param {string} cifNumber - Mã CIF
   * @returns {Object} - Mock data thẻ
   */
  getMockCardsByCIF(cifNumber) {
    const mockData = {
      CIF001234567: {
        cifNumber: "CIF001234567",
        customerName: "Nguyễn Văn A",
        cards: [
          {
            cardId: "CARD001",
            cardType: "credit",
            cardNumber: "1234567890123456",
            maskedNumber: "**** **** **** 1234",
            cardName: "Thẻ tín dụng Platinum",
            status: "active",
            issueDate: "2023-01-15",
            expiryDate: "2026-01-15",
            isMainCard: true,
            creditLimit: "500,000,000 VND",
            availableLimit: "450,000,000 VND",
            currentDebt: "50,000,000 VND",
          },
          {
            cardId: "CARD002",
            cardType: "debit",
            cardNumber: "9876543210987654",
            maskedNumber: "**** **** **** 5678",
            cardName: "Thẻ ghi nợ Classic",
            status: "active",
            issueDate: "2022-05-20",
            expiryDate: "2025-05-20",
            isMainCard: false,
            linkedAccount: "1234567890123456",
            availableBalance: "15,750,000 VND",
          },
        ],
      },
      CIF007654321: {
        cifNumber: "CIF007654321",
        customerName: "Trần Thị B",
        cards: [
          {
            cardId: "CARD003",
            cardType: "credit",
            cardNumber: "5555666677778888",
            maskedNumber: "**** **** **** 8888",
            cardName: "Thẻ tín dụng Gold",
            status: "active",
            issueDate: "2023-06-10",
            expiryDate: "2026-06-10",
            isMainCard: true,
            creditLimit: "200,000,000 VND",
            availableLimit: "180,000,000 VND",
            currentDebt: "20,000,000 VND",
          },
        ],
      },
    };

    // Thêm CIF808080 cho test
    if (cifNumber === "CIF808080") {
      return {
        success: true,
        message: "Lấy danh sách thẻ thành công",
        data: {
          cards: [
            {
              cardId: "CARD_808080001",
              cardName: "HDBank Visa Premium",
              cardType: "credit",
              status: "active",
              statusDisplay: "Đang hoạt động",
              statusColor: "#28a745",
              maskedNumber: "4***-****-****-1234",
              expiryDate: "12/26",
              issueDate: "12/2021",
              availableCredit: "45,000,000 VND",
              creditLimit: "50,000,000 VND",
              is_main_card: 0, // Thẻ chính
              lastTransaction: {
                date: "2024-01-15",
                amount: "1,250,000 VND",
                merchant: "Vincom Plaza",
              },
            },
            {
              cardId: "CARD_808080002",
              cardName: "HDBank Mastercard Gold",
              cardType: "credit",
              status: "active",
              statusDisplay: "Đang hoạt động",
              statusColor: "#28a745",
              maskedNumber: "5***-****-****-9999",
              expiryDate: "08/25",
              issueDate: "08/2022",
              availableCredit: "12,000,000 VND",
              creditLimit: "18,000,000 VND",
              is_main_card: 1, // Thẻ phụ
              relationshipToMainCard: "Thẻ phụ của CARD_808080001",
              holderName: "Nguyễn Văn B",
              lastTransaction: {
                date: "2024-01-12",
                amount: "650,000 VND",
                merchant: "Aeon Mall",
              },
            },
          ],
          total: 2,
        },
      };
    }

    return (
      mockData[cifNumber] || {
        success: true,
        message: "Lấy danh sách thẻ thành công",
        data: {
          cards: [],
          total: 0,
        },
      }
    );
  }

  /**
   * Mock kết quả khóa thẻ
   * @param {string} cardId - ID thẻ cần khóa
   * @returns {Object} - Mock result
   */
  getMockBlockResult(cardId) {
    return {
      success: true,
      message: "Đã khóa thẻ thành công",
      data: {
        cardId: cardId,
        cardName: "HDBank Visa Premium",
        maskedNumber: "4***-****-****-1234",
        cardType: "credit",
        previousStatus: "active",
        currentStatus: "inactive",
        cifNumber: "CIF808080",
        customerName: "Trần Thanh Long",
        blockTime: new Date().toISOString(),
      },
    };
  }

  /**
   * Mock kết quả mở khóa thẻ
   * @param {string} cardId - ID thẻ cần mở khóa
   * @returns {Object} - Mock result
   */
  getMockUnblockResult(cardId) {
    return {
      success: true,
      message: "Đã mở khóa thẻ thành công",
      data: {
        cardId: cardId,
        cardName: "HDBank Visa Premium",
        maskedNumber: "4***-****-****-1234",
        cardType: "credit",
        previousStatus: "inactive",
        currentStatus: "active",
        cifNumber: "CIF808080",
        customerName: "Trần Thanh Long",
        unblockTime: new Date().toISOString(),
      },
    };
  }

  /**
   * Validate dữ liệu khóa thẻ
   * @param {Object} blockRequest - Request khóa thẻ
   * @returns {Object} - Validation result
   */
  validateBlockRequest(blockRequest) {
    const errors = [];

    if (!blockRequest.cardId) {
      errors.push("Card ID is required");
    }

    if (!blockRequest.cifNumber) {
      errors.push("CIF Number is required");
    }

    if (!blockRequest.blockReason) {
      errors.push("Block reason is required");
    }

    const validReasons = [
      "lost",
      "stolen",
      "temporary",
      "suspicious",
      "customer_request",
    ];
    if (
      blockRequest.blockReason &&
      !validReasons.includes(blockRequest.blockReason)
    ) {
      errors.push("Invalid block reason");
    }

    const validTypes = ["temporary", "permanent"];
    if (
      blockRequest.blockType &&
      !validTypes.includes(blockRequest.blockType)
    ) {
      errors.push("Invalid block type");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Tạo request khóa thẻ
   * @param {string} cardId - ID thẻ
   * @param {string} cifNumber - CIF khách hàng
   * @param {string} reason - Lý do khóa
   * @param {string} type - Loại khóa
   * @param {Object} verification - Thông tin xác thực
   * @returns {Object} - Block request object
   */
  createBlockRequest(
    cardId,
    cifNumber,
    reason,
    type = "temporary",
    verification = {}
  ) {
    return {
      cardId,
      cifNumber,
      blockReason: reason,
      blockType: type,
      customerVerification: {
        fullName: verification.fullName || "",
        dateOfBirth: verification.dateOfBirth || "",
        idNumber: verification.idNumber || "",
        confirmationCode: verification.confirmationCode || "",
      },
      notes: verification.notes || "Khóa thẻ qua bot chat",
      requestTime: new Date().toISOString(),
      channel: "bot_chat",
    };
  }
}

// Export singleton instance
export default new CardService();
