import API_CONFIG from "../config/api.js";

class TicketService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.endpoints = API_CONFIG.ENDPOINTS.TICKETS;
    this.uploadEndpoints = API_CONFIG.ENDPOINTS.UPLOADS;
  }

  getFullURL(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  async handleResponse(response) {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const msg = data?.message || `HTTP ${response.status}`;
      throw new Error(msg);
    }
    return await response.json();
  }

  createRequestOptions(method = "GET", body = null, headers = {}) {
    const options = {
      method,
      headers: { ...API_CONFIG.DEFAULT_HEADERS, ...headers },
      timeout: API_CONFIG.TIMEOUT,
    };
    if (body && method !== "GET") options.body = JSON.stringify(body);
    return options;
  }

  createAuthHeaders() {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async searchTickets(params = {}) {
    const response = await fetch(
      this.getFullURL(this.endpoints.SEARCH),
      this.createRequestOptions("POST", params, this.createAuthHeaders())
    );
    return this.handleResponse(response);
  }

  async getTicketDetail(ticketId) {
    const response = await fetch(
      this.getFullURL(`${this.endpoints.DETAIL}/${ticketId}`),
      this.createRequestOptions("GET", null, this.createAuthHeaders())
    );
    return this.handleResponse(response);
  }

  async createTicket(payload) {
    const response = await fetch(
      this.getFullURL(this.endpoints.CREATE),
      this.createRequestOptions("POST", payload, this.createAuthHeaders())
    );
    return this.handleResponse(response);
  }

  async updateTicket(ticketId, payload) {
    const response = await fetch(
      this.getFullURL(`${this.endpoints.UPDATE}/${ticketId}`),
      this.createRequestOptions("PUT", payload, this.createAuthHeaders())
    );
    return this.handleResponse(response);
  }

  async deleteTicket(ticketId, body = {}) {
    const response = await fetch(
      this.getFullURL(`${this.endpoints.DELETE}/${ticketId}`),
      this.createRequestOptions("DELETE", body, this.createAuthHeaders())
    );
    return this.handleResponse(response);
  }

  async getTicketsByCif(cifNumber, limit = 5) {
    const url = new URL(this.getFullURL(this.endpoints.BY_CIF));
    url.searchParams.set("cifNumber", cifNumber);
    url.searchParams.set("limit", String(limit));
    const response = await fetch(
      url.toString(),
      this.createRequestOptions("GET", null, this.createAuthHeaders())
    );
    return this.handleResponse(response);
  }

  async uploadTicketFiles(ticketId, files = []) {
    if (!files || files.length === 0) return { success: true, data: [] };
    const form = new FormData();
    form.append("ticketId", String(ticketId || ""));
    for (const f of files) form.append("files", f);
    const headers = this.createAuthHeaders();
    // Xóa content-type để browser tự set multipart boundary
    delete headers["Content-Type"];
    const response = await fetch(
      this.getFullURL(this.uploadEndpoints.TICKET_UPLOAD),
      {
        method: "POST",
        headers,
        body: form,
        timeout: API_CONFIG.TIMEOUT,
      }
    );
    return this.handleResponse(response);
  }
}

export default new TicketService();
