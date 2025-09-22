import API_CONFIG from "../config/api.js";

class CallCenterService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.endpoints = API_CONFIG.ENDPOINTS.CALLCENTER;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
  }

  getFullURL(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  createAuthHeaders() {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async handleResponse(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.message || `HTTP ${response.status}`;
      throw new Error(msg);
    }
    return data;
  }

  async updateAgentStatus({ username, status }) {
    const res = await fetch(this.getFullURL(this.endpoints.AGENTS_STATUS), {
      method: "POST",
      headers: { ...this.defaultHeaders, ...this.createAuthHeaders() },
      body: JSON.stringify({ username, status }),
    });
    return this.handleResponse(res);
  }

  async listAgents() {
    const res = await fetch(this.getFullURL(this.endpoints.AGENTS), {
      method: "GET",
      headers: { ...this.defaultHeaders, ...this.createAuthHeaders() },
    });
    return this.handleResponse(res);
  }

  async startCall({ callId, from, to, direction }) {
    const res = await fetch(this.getFullURL(this.endpoints.CALLS.START), {
      method: "POST",
      headers: { ...this.defaultHeaders, ...this.createAuthHeaders() },
      body: JSON.stringify({ callId, from, to, direction }),
    });
    return this.handleResponse(res);
  }

  async transferCall({ callId, from, to }) {
    const res = await fetch(this.getFullURL(this.endpoints.CALLS.TRANSFER), {
      method: "POST",
      headers: { ...this.defaultHeaders, ...this.createAuthHeaders() },
      body: JSON.stringify({ callId, from, to }),
    });
    return this.handleResponse(res);
  }

  async endCall({ callId, username }) {
    const res = await fetch(this.getFullURL(this.endpoints.CALLS.END), {
      method: "POST",
      headers: { ...this.defaultHeaders, ...this.createAuthHeaders() },
      body: JSON.stringify({ callId, username }),
    });
    return this.handleResponse(res);
  }

  async incoming({ callerNumber, cifNumber }) {
    const res = await fetch(this.getFullURL(this.endpoints.INCOMING), {
      method: "POST",
      headers: { ...this.defaultHeaders, ...this.createAuthHeaders() },
      body: JSON.stringify({ callerNumber, cifNumber }),
    });
    return this.handleResponse(res);
  }

  async getCallDetail(callId) {
    const res = await fetch(
      this.getFullURL(
        `${this.endpoints.CALLS.DETAIL}/${encodeURIComponent(callId)}`
      ),
      {
        method: "GET",
        headers: { ...this.defaultHeaders, ...this.createAuthHeaders() },
      }
    );
    return this.handleResponse(res);
  }
}

export default new CallCenterService();
