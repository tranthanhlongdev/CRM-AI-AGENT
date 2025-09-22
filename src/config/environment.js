// Environment Configuration Helper

export const ENV_CONFIG = {
  // Development environment
  DEVELOPMENT: {
    API_BASE_URL: "http://localhost:8000",
    DEBUG: true,
  },

  // Staging environment
  STAGING: {
    API_BASE_URL: "https://api-staging.yourbank.com",
    DEBUG: false,
  },

  // Production environment
  PRODUCTION: {
    API_BASE_URL: "https://api.yourbank.com",
    DEBUG: false,
  },
};

// Get current environment
export const getCurrentEnv = () => {
  return import.meta.env.VITE_APP_ENV || "development";
};

// Get environment specific config
export const getEnvConfig = () => {
  const env = getCurrentEnv().toUpperCase();
  return ENV_CONFIG[env] || ENV_CONFIG.DEVELOPMENT;
};

// Helper to get API base URL
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || getEnvConfig().API_BASE_URL;
};

export default {
  getCurrentEnv,
  getEnvConfig,
  getApiBaseUrl,
};
