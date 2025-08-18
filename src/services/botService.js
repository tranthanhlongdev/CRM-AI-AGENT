import API_CONFIG from "../config/api.js";
import cardService from "./cardService.js";

class BotService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.endpoints = API_CONFIG.ENDPOINTS.BOT;
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

  /**
   * Xác thực số điện thoại và lấy thông tin khách hàng
   * @param {string} phoneNumber - Số điện thoại cần xác thực
   * @returns {Promise<Object>} - Thông tin khách hàng
   */
  async verifyPhone(phoneNumber) {
    try {
      const response = await fetch(
        this.getFullURL(this.endpoints.VERIFY_PHONE),
        this.createRequestOptions("POST", { phoneNumber })
      );

      const result = await this.handleResponse(response);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || "Không thể xác thực số điện thoại");
      }
    } catch (error) {
      console.error("Error verifying phone:", error);

      // Fallback cho development - trả về khách hàng mới
      return {
        phone: phoneNumber,
        name: "Khách hàng mới",
        isExistingCustomer: false,
      };
    }
  }

  /**
   * Gửi tin nhắn và nhận phản hồi từ bot
   * @param {string} message - Tin nhắn của người dùng
   * @param {Object} customerInfo - Thông tin khách hàng
   * @param {string} conversationId - ID cuộc trò chuyện (tùy chọn)
   * @returns {Promise<Object>} - Phản hồi từ bot
   */
  async sendMessage(message, customerInfo, conversationId = null) {
    try {
      const requestBody = {
        message,
        customerInfo,
        conversationId,
      };

      const response = await fetch(
        this.getFullURL(this.endpoints.CHAT),
        this.createRequestOptions("POST", requestBody)
      );

      const result = await this.handleResponse(response);

      if (result.success) {
        return {
          response: result.data.response,
          conversationId: result.data.conversationId,
          timestamp: new Date(result.data.timestamp),
        };
      } else {
        throw new Error(result.message || "Không thể nhận phản hồi từ bot");
      }
    } catch (error) {
      console.error("Error sending message to bot:", error);

      // Fallback response cho development
      // Lấy conversation state từ localStorage nếu có
      const conversationKey = `conversation_${customerInfo.phone || "unknown"}`;
      const savedState = JSON.parse(
        localStorage.getItem(conversationKey) || "{}"
      );

      const fallbackResult = await this.generateFallbackResponse(
        message,
        customerInfo,
        savedState
      );

      // Nếu kết quả có state, lưu lại
      if (
        fallbackResult &&
        typeof fallbackResult === "object" &&
        fallbackResult.nextStep
      ) {
        const newState = {
          intent: this.isBlockCardIntent(message)
            ? "block_card"
            : savedState.intent,
          step: fallbackResult.nextStep,
          data: fallbackResult.data,
          timestamp: new Date().toISOString(),
        };

        if (fallbackResult.nextStep === "end") {
          localStorage.removeItem(conversationKey);
        } else {
          localStorage.setItem(conversationKey, JSON.stringify(newState));
        }

        return {
          response: fallbackResult.response,
          conversationId: conversationId || `fallback_${Date.now()}`,
          timestamp: new Date(),
          state: newState,
        };
      }

      return {
        response:
          typeof fallbackResult === "string"
            ? fallbackResult
            : fallbackResult.response,
        conversationId: conversationId || `fallback_${Date.now()}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Lấy lịch sử cuộc trò chuyện
   * @param {string} conversationId - ID cuộc trò chuyện
   * @returns {Promise<Object>} - Lịch sử tin nhắn
   */
  async getConversation(conversationId) {
    try {
      const response = await fetch(
        this.getFullURL(`${this.endpoints.CONVERSATION}/${conversationId}`),
        this.createRequestOptions("GET")
      );

      const result = await this.handleResponse(response);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(
          result.message || "Không thể lấy lịch sử cuộc trò chuyện"
        );
      }
    } catch (error) {
      console.error("Error getting conversation:", error);
      return {
        conversationId,
        messages: [],
      };
    }
  }

  /**
   * Phản hồi dự phòng khi backend không khả dụng
   * @param {string} userMessage - Tin nhắn người dùng
   * @param {Object} customerInfo - Thông tin khách hàng
   * @returns {string} - Phản hồi dự phòng
   */
  /**
   * Xử lý intent khóa thẻ với conversation state
   * @param {string} userMessage - Tin nhắn người dùng
   * @param {Object} customerInfo - Thông tin khách hàng
   * @param {Object} conversationState - Trạng thái conversation
   * @returns {Promise<Object>} - Phản hồi bot với state
   */
  async handleBlockCardIntent(
    userMessage,
    customerInfo,
    conversationState = {}
  ) {
    try {
      if (!customerInfo.isExistingCustomer || !customerInfo.cif) {
        return {
          response: `Xin lỗi ${customerInfo.name}, để thực hiện khóa thẻ, tôi cần xác thực thông tin khách hàng. Vui lòng liên hệ hotline 1900 545 415 để được hỗ trợ trực tiếp.`,
          nextStep: "end",
        };
      }

      // Bước 1: Xác định intent và hiển thị danh sách thẻ
      if (!conversationState.step || conversationState.step === "start") {
        const cardsData = await cardService.getCardsByCIF(customerInfo.cif);

        if (!cardsData.cards || cardsData.cards.length === 0) {
          return {
            response: `${customerInfo.name}, tôi không tìm thấy thẻ nào trong hệ thống. Vui lòng liên hệ hotline 1900 545 415 để được hỗ trợ.`,
            nextStep: "end",
          };
        }

        let response = `Chào ${customerInfo.name}! Tôi hiểu bạn muốn khóa thẻ. Để hỗ trợ bạn tốt nhất, vui lòng cho biết lý do khóa thẻ:\n\n`;

        response += `1. 🔒 Thẻ bị mất\n`;
        response += `2. 🚨 Thẻ bị đánh cắp\n`;
        response += `3. ⏸️ Khóa tạm thời (tự nguyện)\n`;
        response += `4. ⛔ Khóa vĩnh viễn\n`;
        response += `5. ⚠️ Phát hiện giao dịch khả nghi\n\n`;

        response += `📋 Các thẻ của bạn:\n`;
        cardsData.cards.forEach((card, index) => {
          const cardIcon = card.cardType === "credit" ? "💳" : "🏧";
          const statusIcon = card.status === "active" ? "✅" : "❌";
          response += `${cardIcon} ${card.cardName}: ${card.maskedNumber} ${statusIcon}\n`;
        });

        response += `\n⚠️ Lưu ý quan trọng:\n`;
        response += `- Khóa vĩnh viễn: Không thể khôi phục, cần làm thẻ mới\n`;
        response += `- Khóa tạm thời: Có thể mở lại qua hotline\n\n`;

        response += `Vui lòng nhập số tương ứng với lý do khóa thẻ:`;

        return {
          response,
          nextStep: "select_reason",
          data: { cards: cardsData.cards },
        };
      }

      // Bước 2: Chọn lý do khóa thẻ
      if (conversationState.step === "select_reason") {
        const reasonMap = {
          1: { reason: "lost", type: "permanent", label: "Thẻ bị mất" },
          2: { reason: "stolen", type: "permanent", label: "Thẻ bị đánh cắp" },
          3: {
            reason: "customer_request",
            type: "temporary",
            label: "Khóa tạm thời",
          },
          4: {
            reason: "customer_request",
            type: "permanent",
            label: "Khóa vĩnh viễn",
          },
          5: {
            reason: "suspicious",
            type: "temporary",
            label: "Giao dịch khả nghi",
          },
        };

        const selectedReason = reasonMap[userMessage.trim()];
        if (!selectedReason) {
          return {
            response: `Vui lòng chọn một lý do hợp lệ (1-5):\n1. 🔒 Thẻ bị mất\n2. 🚨 Thẻ bị đánh cắp\n3. ⏸️ Khóa tạm thời\n4. ⛔ Khóa vĩnh viễn\n5. ⚠️ Giao dịch khả nghi`,
            nextStep: "select_reason",
            data: conversationState.data,
          };
        }

        const cards = conversationState.data?.cards || [];
        let response = `Bạn đã chọn: ${selectedReason.label}\n\n`;
        response += `📋 Vui lòng chọn thẻ cần khóa bằng cách nhập số tương ứng:\n\n`;

        cards.forEach((card, index) => {
          const cardIcon = card.cardType === "credit" ? "💳" : "🏧";
          response += `${index + 1}. ${cardIcon} ${card.cardName}: ${
            card.maskedNumber
          }\n`;
        });

        response += `\nVui lòng nhập số tương ứng với thẻ:`;

        return {
          response,
          nextStep: "select_card",
          data: {
            cards,
            selectedReason: selectedReason,
          },
        };
      }

      // Bước 3: Chọn thẻ cần khóa
      if (conversationState.step === "select_card") {
        const cardIndex = parseInt(userMessage.trim()) - 1;
        const cards = conversationState.data?.cards || [];

        if (cardIndex < 0 || cardIndex >= cards.length) {
          return {
            response: `Vui lòng chọn một thẻ hợp lệ (1-${cards.length})`,
            nextStep: "select_card",
            data: conversationState.data,
          };
        }

        const selectedCard = cards[cardIndex];
        const reason = conversationState.data?.selectedReason;

        let response = `📍 Xác nhận thông tin khóa thẻ:\n\n`;
        response += `🔸 Thẻ: ${selectedCard.cardName}\n`;
        response += `🔸 Số thẻ: ${selectedCard.maskedNumber}\n`;
        response += `🔸 Lý do: ${reason.label}\n`;
        response += `🔸 Loại khóa: ${
          reason.type === "permanent" ? "Vĩnh viễn" : "Tạm thời"
        }\n`;
        response += `🔸 Hiệu lực: Ngay lập tức\n\n`;

        response += `⚠️ Lưu ý quan trọng:\n`;
        response += `- Sau khi khóa, thẻ sẽ không thể sử dụng cho bất kỳ giao dịch nào\n`;
        if (reason.type === "permanent") {
          response += `- Khóa vĩnh viễn KHÔNG thể khôi phục, cần làm thẻ mới\n`;
        } else {
          response += `- Khóa tạm thời có thể mở lại qua hotline 1900 545 415\n`;
        }

        response += `\nBạn có chắc chắn muốn thực hiện? Vui lòng nhập:\n`;
        response += `• "XAC NHAN" để tiếp tục\n`;
        response += `• "HUY BO" để hủy bỏ`;

        return {
          response,
          nextStep: "confirm_block",
          data: {
            ...conversationState.data,
            selectedCard,
          },
        };
      }

      // Bước 4: Xác nhận và thực hiện khóa thẻ
      if (conversationState.step === "confirm_block") {
        const userResponse = userMessage.trim().toUpperCase();

        if (userResponse === "HUY BO") {
          return {
            response: `Đã hủy bỏ yêu cầu khóa thẻ. Nếu bạn cần hỗ trợ, vui lòng liên hệ hotline 1900 545 415.`,
            nextStep: "end",
          };
        }

        if (userResponse !== "XAC NHAN") {
          return {
            response: `Vui lòng nhập "XAC NHAN" để tiếp tục hoặc "HUY BO" để hủy bỏ.`,
            nextStep: "confirm_block",
            data: conversationState.data,
          };
        }

        // Thực hiện khóa thẻ
        const selectedCard = conversationState.data?.selectedCard;
        const reason = conversationState.data?.selectedReason;

        const blockRequest = cardService.createBlockRequest(
          selectedCard.cardId,
          customerInfo.cif,
          reason.reason,
          reason.type,
          {
            fullName: customerInfo.name,
            notes: `Khóa thẻ qua bot chat - ${reason.label}`,
          }
        );

        try {
          const blockResult = await cardService.blockCard(blockRequest);

          let response = `✅ Khóa thẻ thành công!\n\n`;
          response += `📋 Thông tin chi tiết:\n`;
          response += `• Thẻ: ${blockResult.maskedNumber}\n`;
          response += `• Trạng thái: Đã khóa\n`;
          response += `• Loại khóa: ${
            reason.type === "permanent" ? "Vĩnh viễn" : "Tạm thời"
          }\n`;
          response += `• Thời gian: ${new Date().toLocaleString("vi-VN")}\n`;
          response += `• Mã tham chiếu: ${blockResult.referenceNumber}\n\n`;

          response += `📌 Bước tiếp theo:\n`;
          blockResult.nextSteps.forEach((step, index) => {
            response += `${index + 1}. ${step}\n`;
          });

          response += `\nTôi có thể hỗ trợ gì thêm cho bạn không?`;

          return {
            response,
            nextStep: "end",
            success: true,
          };
        } catch (error) {
          console.error("Error blocking card:", error);
          return {
            response: `❌ Có lỗi xảy ra khi khóa thẻ. Vui lòng liên hệ hotline 1900 545 415 để được hỗ trợ ngay lập tức.\n\nMã lỗi: ${error.message}`,
            nextStep: "end",
            success: false,
          };
        }
      }

      return {
        response: `Xin lỗi, có lỗi trong quá trình xử lý. Vui lòng bắt đầu lại hoặc liên hệ hotline 1900 545 415.`,
        nextStep: "end",
      };
    } catch (error) {
      console.error("Error handling block card intent:", error);
      return {
        response: `Xin lỗi ${customerInfo.name}, tôi gặp sự cố khi xử lý yêu cầu khóa thẻ. Vui lòng liên hệ hotline 1900 545 415 để được hỗ trợ ngay lập tức.`,
        nextStep: "end",
      };
    }
  }

  /**
   * Kiểm tra intent khóa thẻ
   * @param {string} message - Tin nhắn người dùng
   * @returns {boolean} - True nếu là intent khóa thẻ
   */
  isBlockCardIntent(message) {
    const blockCardKeywords = [
      "khóa thẻ",
      "block thẻ",
      "tạm khóa thẻ",
      "dừng thẻ",
      "thẻ bị mất",
      "thẻ bị đánh cắp",
      "khóa tạm thời",
      "khóa vĩnh viễn",
      "block card",
      "stop card",
      "thẻ mất",
      "mất thẻ",
      "đánh cắp thẻ",
      "thẻ bị hack",
    ];

    const lowerMessage = message.toLowerCase();
    return blockCardKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  async generateFallbackResponse(
    userMessage,
    customerInfo,
    conversationState = {}
  ) {
    const message = userMessage.toLowerCase();
    const customerName = customerInfo.name || "bạn";

    // Kiểm tra intent khóa thẻ hoặc đang trong conversation khóa thẻ
    if (
      this.isBlockCardIntent(message) ||
      conversationState.intent === "block_card"
    ) {
      const result = await this.handleBlockCardIntent(
        userMessage,
        customerInfo,
        conversationState
      );
      return result.response || result;
    }

    // Các từ khóa và phản hồi tương ứng
    const responses = {
      "tiết kiệm": `Chào ${customerName}! HDBank có nhiều sản phẩm tiết kiệm hấp dẫn:
      
📈 Tiết kiệm có kỳ hạn:
- 6 tháng: 5.8%/năm
- 12 tháng: 6.5%/năm  
- 24 tháng: 7.2%/năm

💰 Số tiền gửi tối thiểu chỉ 500,000 VND
🎁 Tặng quà khi gửi từ 100 triệu

${customerName} muốn biết thêm về kỳ hạn nào cụ thể?`,

      "thẻ tín dụng": `Chào ${customerName}! HDBank có các loại thẻ tín dụng phù hợp với mọi nhu cầu:

💳 Thẻ Platinum: Hạn mức đến 500 triệu
💳 Thẻ Gold: Hạn mức đến 200 triệu
💳 Thẻ Classic: Hạn mức đến 50 triệu

✨ Ưu đãi:
- Miễn phí năm đầu
- Hoàn tiền đến 1.5%
- Tích điểm đổi quà

${customerName} quan tâm đến loại thẻ nào nhất?`,

      "vay mua nhà": `Chào ${customerName}! Gói vay mua nhà HDBank rất ưu đãi:

🏠 Đặc điểm nổi bật:
- Lãi suất từ 8.5%/năm
- Vay đến 85% giá trị nhà
- Thời hạn đến 25 năm
- Thủ tục đơn giản

💰 Hỗ trợ vay từ 500 triệu - 50 tỷ VND

${customerName} cần vay khoảng bao nhiêu để tôi tư vấn cụ thể hơn?`,

      "internet banking": `Chào ${customerName}! HDBank Mobile Banking - Ngân hàng số hiện đại nhất:

📱 Tính năng chính:
- Chuyển tiền miễn phí trong HDBank
- Thanh toán hóa đơn 24/7
- Quản lý thẻ tín dụng
- Đầu tư online

🔒 Bảo mật tuyệt đối với sinh trắc học

${customerName} đã có tài khoản HDBank chưa? Tôi sẽ hướng dẫn đăng ký!`,

      "sms banking": `Chào ${customerName}! SMS Banking HDBank giúp bạn:

📨 Nhận thông báo tức thì:
- Biến động số dư
- Giao dịch thẻ
- Đáo hạn tiết kiệm

💸 Phí chỉ 11,000 VND/tháng
📲 Đăng ký dễ dàng tại chi nhánh

${customerName} muốn đăng ký dịch vụ này không?`,
    };

    // Tìm từ khóa phù hợp
    for (const [keyword, response] of Object.entries(responses)) {
      if (message.includes(keyword)) {
        return response;
      }
    }

    // Phản hồi mặc định
    return `Chào ${customerName}! Cảm ơn bạn đã liên hệ với HDBank AI Assistant.

Tôi có thể hỗ trợ bạn về:
🏦 Tài khoản tiết kiệm
💳 Thẻ tín dụng & ghi nợ  
🏠 Vay mua nhà, vay tiêu dùng
📱 Internet Banking & Mobile Banking
📨 SMS Banking

Bạn có thể hỏi cụ thể về sản phẩm nào bạn quan tâm, tôi sẽ tư vấn chi tiết cho bạn!

*Lưu ý: Hiện đang sử dụng chế độ demo. Để có trải nghiệm tốt nhất, vui lòng đảm bảo backend API đang hoạt động.*`;
  }
}

// Export singleton instance
export default new BotService();
