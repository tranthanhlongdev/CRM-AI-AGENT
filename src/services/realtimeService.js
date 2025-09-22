import API_CONFIG from "../config/api.js";

class RealtimeService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  getFullURL(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  async createRequestOptions(method = "GET", body = null, headers = {}) {
    const options = {
      method,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...headers,
      },
      timeout: this.timeout,
    };

    // Add authentication token if available
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  }

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return { success: true, data: await response.text() };
  }

  // Get list of available agents using new API
  async getAvailableAgents() {
    try {
      // Try the new agents API first
      const url = this.getFullURL("/api/agents/available");
      const options = await this.createRequestOptions("GET");
      
      console.log('🔍 Fetching available agents from:', url);
      console.log('🔧 Request options:', options);
      
      const response = await fetch(url, options);
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      const result = await this.handleResponse(response);
      
      console.log('📊 Available agents API Response:', result);
      
      if (result.success) {
        const agents = result.data?.agents || [];
        return {
          success: true,
          data: result.data,
          availableAgents: agents,
          source: 'agents_api'
        };
      }
      
      return {
        success: false,
        error: result.message || 'No agents available',
        availableAgents: []
      };
    } catch (error) {
      console.error("❌ Failed to get available agents:", error);
      return {
        success: false,
        error: error.message,
        availableAgents: []
      };
    }
  }

  // Get all agents status
  async getAllAgentsStatus() {
    try {
      const url = this.getFullURL("/api/agents/status");
      const options = await this.createRequestOptions("GET");
      
      console.log('🔍 Fetching all agents status from:', url);
      
      const response = await fetch(url, options);
      const result = await this.handleResponse(response);
      
      console.log('📊 All agents status:', result);
      
      if (result.success) {
        const allAgents = result.data?.agents || [];
        const availableAgents = allAgents.filter(agent => agent.status === 'available');
        
        return {
          success: true,
          data: result.data,
          allAgents: allAgents,
          availableAgents: availableAgents,
          stats: result.data?.stats,
          source: 'agents_status_api'
        };
      }
      
      return {
        success: false,
        error: result.message || 'Failed to get agents status',
        allAgents: [],
        availableAgents: []
      };
    } catch (error) {
      console.error("❌ Failed to get agents status:", error);
      return {
        success: false,
        error: error.message,
        allAgents: [],
        availableAgents: []
      };
    }
  }

  // Get call center statistics
  async getCallStats() {
    try {
      const response = await fetch(
        this.getFullURL("/api/realtime/call-stats"),
        await this.createRequestOptions("GET")
      );
      
      const result = await this.handleResponse(response);
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      console.error("❌ Failed to get call stats:", error);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }

  // Update agent status
  async updateAgentStatus(agentId, status) {
    try {
      const response = await fetch(
        this.getFullURL("/api/realtime/agent-status"),
        await this.createRequestOptions("POST", {
          agentId,
          status,
          timestamp: new Date().toISOString()
        })
      );
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error("❌ Failed to update agent status:", error);
      throw error;
    }
  }

  // Initiate direct call to agent
  async initiateAgentCall(callerNumber, targetAgentId, customerInfo = null) {
    try {
      const response = await fetch(
        this.getFullURL("/api/call/agent/initiate"),
        await this.createRequestOptions("POST", {
          callerNumber,
          targetAgentId,
          customerInfo,
          callType: "agent_direct",
          timestamp: new Date().toISOString()
        })
      );
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error("❌ Failed to initiate agent call:", error);
      throw error;
    }
  }

  // Check if any agents are available for direct call
  async checkAgentAvailability() {
    try {
      console.log('🔍 Starting agent availability check...');
      
      // Strategy 1: Try new agents API
      let agentsResult = await this.getAvailableAgents();
      
      if (agentsResult.success && agentsResult.availableAgents.length > 0) {
        console.log('✅ Found agents via agents API:', agentsResult.availableAgents.length);
        return {
          success: true,
          hasAvailableAgents: true,
          availableCount: agentsResult.availableAgents.length,
          agents: agentsResult.availableAgents,
          message: `${agentsResult.availableAgents.length} agent(s) available`,
          source: agentsResult.source || 'agents_api'
        };
      }
      
      // Strategy 2: Try all agents status API
      console.log('🔄 Agents API failed, trying all agents status...');
      const allAgentsResult = await this.getAllAgentsStatus();
      
      if (allAgentsResult.success && allAgentsResult.availableAgents.length > 0) {
        console.log('✅ Found agents via status API:', allAgentsResult.availableAgents.length);
        return {
          success: true,
          hasAvailableAgents: true,
          availableCount: allAgentsResult.availableAgents.length,
          agents: allAgentsResult.availableAgents,
          message: `${allAgentsResult.availableAgents.length} agent(s) available`,
          source: allAgentsResult.source || 'status_api',
          stats: allAgentsResult.stats
        };
      }
      
      // Strategy 3: Try demo endpoints
      console.log('🔄 Status API failed, trying demo endpoints...');
      const demoResult = await this.getDemoAgents();
      
      if (demoResult.success) {
        const allAgents = demoResult.data?.agents || [];
        const availableAgents = demoResult.data?.available || allAgents.filter(a => a.status === 'available');
        
        console.log('📊 Demo API response:', {
          allAgents: allAgents.length,
          availableAgents: availableAgents.length,
          data: demoResult.data
        });
        
        return {
          success: true,
          hasAvailableAgents: availableAgents.length > 0,
          availableCount: availableAgents.length,
          agents: availableAgents,
          message: availableAgents.length > 0 
            ? `${availableAgents.length} agent(s) available (demo mode)`
            : "No agents currently available",
          source: 'demo_api'
        };
      }
      
      // Strategy 4: Last resort mock data
      console.log('🔄 All APIs failed, using mock data...');
      const mockAgents = [
        {
          id: 'mock_agent_1',
          userId: 999,
          username: 'mock01',
          fullName: 'Mock Agent (Offline)',
          status: 'available',
          department: 'Demo Department',
          priority: 1
        }
      ];
      
      return {
        success: true,
        hasAvailableAgents: true,
        availableCount: 1,
        agents: mockAgents,
        message: "1 mock agent available (offline mode)",
        source: 'mock_data'
      };
      
    } catch (error) {
      console.error("❌ Failed to check agent availability:", error);
      
      // Final fallback
      return {
        success: false,
        hasAvailableAgents: false,
        availableCount: 0,
        agents: [],
        message: "Cannot check agent availability: " + error.message,
        error: error.message
      };
    }
  }

  // Get agent details by ID
  async getAgentDetails(agentId) {
    try {
      const response = await fetch(
        this.getFullURL(`/api/realtime/agents/${agentId}`),
        await this.createRequestOptions("GET")
      );
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error("❌ Failed to get agent details:", error);
      throw error;
    }
  }

  // Health check for realtime services
  async healthCheck() {
    try {
      const response = await fetch(
        this.getFullURL("/health"),
        await this.createRequestOptions("GET")
      );
      
      const result = await this.handleResponse(response);
      return {
        success: true,
        status: "healthy",
        data: result
      };
    } catch (error) {
      console.error("❌ Realtime service health check failed:", error);
      return {
        success: false,
        status: "unhealthy",
        error: error.message
      };
    }
  }

  // Test server connectivity with detailed info
  async testServerConnection() {
    console.log('🔍 Testing server connectivity...');
    
    const tests = [
      { name: 'Health Check', endpoint: '/health' },
      { name: 'Available Agents', endpoint: '/api/agents/available' },
      { name: 'All Agents Status', endpoint: '/api/agents/status' },
      { name: 'Demo Agents', endpoint: '/api/call/demo/agents' },
      { name: 'Demo Status', endpoint: '/api/call/demo/status' }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        const url = this.getFullURL(test.endpoint);
        console.log(`🧪 Testing ${test.name}: ${url}`);
        
        const startTime = Date.now();
        const response = await fetch(url, await this.createRequestOptions("GET"));
        const duration = Date.now() - startTime;
        
        const result = await this.handleResponse(response);
        
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          url: url,
          status: response.status,
          success: response.ok,
          duration: duration + 'ms',
          data: result
        });
        
        console.log(`✅ ${test.name}: ${response.status} (${duration}ms)`);
      } catch (error) {
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          url: this.getFullURL(test.endpoint),
          status: 'ERROR',
          success: false,
          error: error.message
        });
        
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
    
    return {
      serverUrl: this.baseURL,
      timestamp: new Date().toISOString(),
      tests: results,
      summary: {
        total: tests.length,
        passed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };
  }

  // Demo endpoints for testing
  async getDemoAgents() {
    try {
      const url = this.getFullURL("/api/call/demo/agents");
      console.log('🎭 Fetching demo agents from:', url);
      
      const response = await fetch(url, await this.createRequestOptions("GET"));
      
      console.log('🎭 Demo response status:', response.status, response.statusText);
      
      const result = await this.handleResponse(response);
      
      console.log('🎭 Demo agents response:', result);
      
      return result;
    } catch (error) {
      console.error("❌ Failed to get demo agents:", error);
      throw error;
    }
  }

  async getDemoStatus() {
    try {
      const response = await fetch(
        this.getFullURL("/api/call/demo/status"),
        await this.createRequestOptions("GET")
      );
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error("❌ Failed to get demo status:", error);
      throw error;
    }
  }

  async initiateDemoCall(callerNumber, targetAgentOrInfo = null) {
    try {
      // Handle both old format (just agent) and new format (with customer info)
      let targetAgent = null;
      let customerInfo = null;
      let callMetadata = null;
      
      if (targetAgentOrInfo) {
        if (targetAgentOrInfo.customerInfo) {
          // New format: { ...agent, customerInfo, callMetadata }
          targetAgent = { ...targetAgentOrInfo };
          customerInfo = targetAgentOrInfo.customerInfo;
          callMetadata = targetAgentOrInfo.callMetadata;
          delete targetAgent.customerInfo;
          delete targetAgent.callMetadata;
        } else {
          // Old format: just agent object
          targetAgent = targetAgentOrInfo;
        }
      }
      
      const payload = {
        callerNumber,
        targetAgent,
        callType: "demo_agent_direct",
        timestamp: new Date().toISOString(),
        ...(customerInfo && { customerInfo }),
        ...(callMetadata && { metadata: callMetadata })
      };
      
      console.log('📞 Initiating demo call with payload:', payload);
      
      const response = await fetch(
        this.getFullURL("/api/call/demo/initiate"),
        await this.createRequestOptions("POST", payload)
      );
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error("❌ Failed to initiate demo call:", error);
      throw error;
    }
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();
export default realtimeService;
