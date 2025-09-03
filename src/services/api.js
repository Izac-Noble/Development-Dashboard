// frontend/src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, url: ${url}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async requestWithCache(endpoint) {
    const cached = this.cache.get(endpoint);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Using cached data for ${endpoint}`);
      return cached.data;
    }

    const data = await this.request(endpoint);
    this.cache.set(endpoint, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  // Uganda-specific endpoints (matching your backend)
  async getUgandaHealth() {
    return this.requestWithCache('/uganda/health');
  }

  async getUgandaEconomy() {
    return this.requestWithCache('/uganda/economy');
  }

  async getUgandaEducation() {
    return this.requestWithCache('/uganda/education');
  }

  async getUgandaDemographics() {
    return this.requestWithCache('/uganda/demographics');
  }

  async getUgandaInfrastructure() {
    return this.requestWithCache('/uganda/infrastructure');
  }

  async getUgandaEnvironment() {
    return this.requestWithCache('/uganda/environment');
  }

  async getUgandaSummary() {
    return this.requestWithCache('/uganda/summary');
  }

  async getUgandaHealthTrends(years = 5) {
    return this.requestWithCache(`/uganda/trends/health?years=${years}`);
  }

  // Specific data source endpoints
  async getWHOHealthData() {
    return this.requestWithCache('/health/who');
  }

  async getWorldBankHealthData() {
    return this.requestWithCache('/health/worldbank');
  }

  async getCountryProfile() {
    return this.requestWithCache('/country-profile');
  }

  async getComprehensiveDashboard() {
    return this.requestWithCache('/dashboard');
  }

  // Utility methods
  clearCache() {
    this.cache.clear();
    console.log('API cache cleared');
  }

  getCacheSize() {
    return this.cache.size;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.request('/');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: error.message };
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Also export the class for creating new instances if needed
export { ApiService };