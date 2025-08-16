import API_CONFIG from "../config/api.js";

class AuthService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.endpoints = API_CONFIG.ENDPOINTS.AUTH;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
  }

  getFullURL(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  createRequestOptions(method, body = null, headers = {}) {
    const options = {
      method,
      headers: { ...this.defaultHeaders, ...headers },
    };
    if (body) options.body = JSON.stringify(body);
    return options;
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
      const message = data?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }
    return data;
  }

  async login(username, password) {
    const res = await fetch(
      this.getFullURL(this.endpoints.LOGIN),
      this.createRequestOptions("POST", { username, password })
    );
    return this.handleResponse(res);
  }

  async register({
    username,
    password,
    fullName,
    email,
    role = "user",
    isActive = true,
  }) {
    const body = { username, password, fullName, email, role, isActive };
    const res = await fetch(
      this.getFullURL(this.endpoints.REGISTER),
      this.createRequestOptions("POST", body)
    );
    return this.handleResponse(res);
  }

  async me(accessToken) {
    const res = await fetch(
      this.getFullURL(this.endpoints.ME),
      this.createRequestOptions("POST", { accessToken })
    );
    return this.handleResponse(res);
  }

  async refresh(refreshToken) {
    const res = await fetch(
      this.getFullURL(this.endpoints.REFRESH),
      this.createRequestOptions("POST", { refreshToken })
    );
    return this.handleResponse(res);
  }

  async logout(tokens) {
    const res = await fetch(
      this.getFullURL(this.endpoints.LOGOUT),
      this.createRequestOptions("POST", tokens, this.createAuthHeaders())
    );
    return this.handleResponse(res);
  }

  async forgotPassword(usernameOrEmail) {
    const res = await fetch(
      this.getFullURL(this.endpoints.FORGOT_PASSWORD),
      this.createRequestOptions("POST", { usernameOrEmail })
    );
    return this.handleResponse(res);
  }

  async resetPassword(resetToken, newPassword) {
    const res = await fetch(
      this.getFullURL(this.endpoints.RESET_PASSWORD),
      this.createRequestOptions("POST", { resetToken, newPassword })
    );
    return this.handleResponse(res);
  }
}

export default new AuthService();
