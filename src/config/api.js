import { getApiBaseUrl } from "./environment.js";

// API Configuration
const API_CONFIG = {
  // Base URL cho API - có thể thay đổi dễ dàng theo environment
  BASE_URL: getApiBaseUrl(),

  // API Endpoints
  ENDPOINTS: {
    CUSTOMERS: {
      SEARCH: "/api/customers/search-complete",
      DETAIL: "/api/customers",
      DETAIL_BY_BODY: "/api/customers/get-by-body",
      CREATE: "/api/customers/create",
      UPDATE: "/api/customers/update",
      DELETE: "/api/customers/delete",
    },
    TICKETS: {
      SEARCH: "/api/tickets/search",
      DETAIL: "/api/tickets", // GET /api/tickets/{id}
      CREATE: "/api/tickets",
      UPDATE: "/api/tickets", // PUT /api/tickets/{id}
      DELETE: "/api/tickets", // DELETE /api/tickets/{id}
      BY_CIF: "/api/tickets/by-cif",
    },
    UPLOADS: {
      TICKET_UPLOAD: "/api/uploads/tickets",
    },
    CALLCENTER: {
      AGENTS: "/api/callcenter/agents",
      AGENTS_STATUS: "/api/callcenter/agents/status",
      CALLS: {
        START: "/api/callcenter/calls/start",
        TRANSFER: "/api/callcenter/calls/transfer",
        END: "/api/callcenter/calls/end",
        DETAIL: "/api/callcenter/calls", // GET /api/callcenter/calls/{id}
      },
      INCOMING: "/api/callcenter/incoming",
    },
    AUTH: {
      LOGIN: "/api/auth/login",
      LOGOUT: "/api/auth/logout",
      REFRESH: "/api/auth/refresh",
      REGISTER: "/api/auth/register",
      ME: "/api/auth/me",
      SECRET_KEY: "/api/auth/secret-key",
      FORGOT_PASSWORD: "/api/auth/forgot-password",
      RESET_PASSWORD: "/api/auth/reset-password",
    },
    BOT: {
      VERIFY_PHONE: "/api/bot/verify-phone",
      CHAT: "/api/bot/chat",
      CONVERSATION: "/api/bot/conversation", // GET /api/bot/conversation/{id}
    },
    CARDS: {
      BY_CIF: "/api/cards/by-cif", // GET /api/cards/by-cif/{cifNumber}
      BLOCK: "/api/cards/block",
      UNBLOCK: "/api/cards/unblock",
      DETAIL: "/api/cards", // GET /api/cards/{cardId}
      TRANSACTIONS: "/api/cards/transactions", // GET /api/cards/{cardId}/transactions
    },
  },

  // Request timeout (milliseconds)
  TIMEOUT: 10000,

  // Default headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export default API_CONFIG;
