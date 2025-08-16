import API_CONFIG from "../config/api.js";

class UserService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    this.usersBase = "/api/auth/users"; // per spec
  }

  getFullURL(path) {
    return `${this.baseURL}${path}`;
  }

  createRequestOptions(method, body = null, headers = {}) {
    const options = { method, headers: { ...this.defaultHeaders, ...headers } };
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
      const msg = data?.message || `HTTP ${response.status}`;
      throw new Error(msg);
    }
    return data;
  }

  async listUsers({
    page = 1,
    limit = 10,
    search = "",
    role = "",
    isActive = "",
  } = {}) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    if (isActive !== "" && isActive !== null && isActive !== undefined)
      params.set("isActive", String(isActive));

    const res = await fetch(
      this.getFullURL(`${this.usersBase}?${params.toString()}`),
      this.createRequestOptions("GET", null, this.createAuthHeaders())
    );
    return this.handleResponse(res);
  }

  async createUser(payload) {
    const res = await fetch(
      this.getFullURL(this.usersBase),
      this.createRequestOptions("POST", payload, this.createAuthHeaders())
    );
    return this.handleResponse(res);
  }

  async updateUser(userId, payload) {
    const res = await fetch(
      this.getFullURL(`${this.usersBase}/${userId}`),
      this.createRequestOptions("PUT", payload, this.createAuthHeaders())
    );
    return this.handleResponse(res);
  }

  async deleteUser(userId) {
    const res = await fetch(
      this.getFullURL(`${this.usersBase}/${userId}`),
      this.createRequestOptions("DELETE", null, this.createAuthHeaders())
    );
    return this.handleResponse(res);
  }
}

export default new UserService();
