// Fixed API service for Uganda Dashboard
class APIService {
    constructor() {
        // Backend is running on port 8000, frontend on port 3000
        this.baseUrl = 'http://localhost:8000/api';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
  
    async fetchWithCache(endpoint) {
        const cacheKey = endpoint;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log(`Using cached data for ${endpoint}`);
            return cached.data;
        }
  
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            console.log(`Fetched fresh data for ${endpoint}`);
            return data;
        } catch (error) {
            console.error(`API fetch error for ${endpoint}:`, error);
            throw error;
        }
    }
  
    // Existing upload functionality
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
  
        try {
            const response = await fetch(`${this.baseUrl}/upload`, {
                method: 'POST',
                body: formData,
            });
  
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }
  
            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
  
    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            if (!response.ok) {
                throw new Error(`Health check failed: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }
  
    // NEW COMPREHENSIVE ENDPOINTS (Updated to match your backend)
    
    async getDashboard() {
        return this.fetchWithCache('/uganda/dashboard');
    }
  
    async getEducationData() {
        return this.fetchWithCache('/uganda/education');
    }
  
    async getDemographics() {
        return this.fetchWithCache('/uganda/demographics');
    }
  
    async getEconomicData() {
        return this.fetchWithCache('/uganda/economy');
    }
  
    async getHealthData() {
        return this.fetchWithCache('/uganda/health');
    }
  
    async getInfrastructureData() {
        return this.fetchWithCache('/uganda/infrastructure');
    }
  
    async getEnvironmentData() {
        return this.fetchWithCache('/uganda/environment');
    }
  
    async getCountryProfile() {
        return this.fetchWithCache('/uganda/profile');
    }
  
    async getSummary() {
        return this.fetchWithCache('/uganda/summary');
    }
  
    async getCategoryTrends(category, years = 10) {
        return this.fetchWithCache(`/uganda/trends/${category}?years=${years}`);
    }
  
    async getDataSources() {
        return this.fetchWithCache('/data-sources');
    }
  
    // BACKWARD COMPATIBILITY (maps old method names to new endpoints)
    
    async getHealthSummary() {
        console.warn('getHealthSummary is deprecated, use getHealthData instead');
        return this.getHealthData();
    }
  
    async getHealthTrends() {
        console.warn('getHealthTrends is deprecated, use getCategoryTrends("health") instead');
        return this.getCategoryTrends('health');
    }
  
    async getSpecificIndicator(indicatorCode, startYear = 2018, endYear = 2023) {
        console.warn('getSpecificIndicator not implemented in new API, use category-specific methods instead');
        // For now, return health data and filter if needed
        const healthData = await this.getHealthData();
        return {
            indicator: indicatorCode,
            data: healthData.data || {},
            source: 'Uganda Health Data',
            period: `${startYear}-${endYear}`,
            status: 'success'
        };
    }
  
    async getAvailableIndicators() {
        return this.getDataSources();
    }
  
    // DATA PROCESSING METHODS
  
    async loadHealthData() {
        try {
            console.log('Loading health data...');
            const healthData = await this.getHealthData();
            console.log('Health data loaded successfully:', healthData);
            return healthData;
        } catch (error) {
            console.error('Error loading health data:', error);
            throw error;
        }
    }
  
    async refreshHealthData() {
        try {
            console.log('Refreshing health data...');
            this.clearCache();
            const healthData = await this.getHealthData();
            console.log('Health data refreshed successfully:', healthData);
            return healthData;
        } catch (error) {
            console.error('Error refreshing health data:', error);
            throw error;
        }
    }
  
    // Utility methods
    formatHealthValue(value, indicator) {
        if (value === null || value === undefined) return 'N/A';
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return 'N/A';
        
        // Format based on indicator type
        if (indicator.toLowerCase().includes('mortality') || indicator.includes('MORT')) {
            return `${numValue.toFixed(1)} per 1,000`;
        } else if (indicator.includes('LE') || indicator === 'WHOSIS_000001') {
            return `${numValue.toFixed(1)} years`;
        } else if (indicator.includes('PHYS')) {
            return `${numValue.toFixed(2)} per 1,000`;
        } else if (indicator.includes('MMR')) {
            return `${numValue.toFixed(1)} per 100,000`;
        } else if (indicator.toLowerCase().includes('rate') || indicator.includes('%')) {
            return `${numValue.toFixed(1)}%`;
        }
        
        return this.formatLargeNumber(numValue);
    }
  
    formatLargeNumber(value) {
        if (value === null || value === undefined) return "N/A";
        
        try {
            const numValue = parseFloat(value);
            if (numValue >= 1_000_000_000) {
                return `${(numValue/1_000_000_000).toFixed(1)}B`;
            } else if (numValue >= 1_000_000) {
                return `${(numValue/1_000_000).toFixed(1)}M`;
            } else if (numValue >= 1_000) {
                return `${(numValue/1_000).toFixed(1)}K`;
            } else {
                return numValue.toFixed(1);
            }
        } catch (e) {
            return String(value);
        }
    }
  
    getIndicatorName(code) {
        const indicators = {
            'WHOSIS_000001': 'Life Expectancy at Birth',
            'MDG_0000000001': 'Under-5 Mortality Rate',
            'WHOSIS_000015': 'Maternal Mortality Ratio',
            'WHS4_100': 'Physicians per 1000 Population',
            'M_Est_smk_curr_std': 'Current Tobacco Smoking',
            'SP.DYN.LE00.IN': 'Life Expectancy at Birth',
            'SH.STA.MORT': 'Under-5 Mortality Rate',
            'SH.STA.MMRT': 'Maternal Mortality Ratio',
            'SH.MED.PHYS.ZS': 'Physicians per 1,000 People',
            'SH.IMM.MEAS': 'Measles Immunization Coverage',
            'SP.POP.TOTL': 'Total Population',
            'NY.GDP.MKTP.CD': 'GDP (US$)',
            'NY.GDP.PCAP.CD': 'GDP per Capita',
            'SE.PRM.NENR': 'Primary School Enrollment',
            'SE.SEC.NENR': 'Secondary School Enrollment',
            'EG.ELC.ACCS.ZS': 'Access to Electricity',
            'IT.NET.USER.ZS': 'Internet Users'
        };
        return indicators[code] || code;
    }
  
    clearCache() {
        this.cache.clear();
        console.log('API cache cleared');
    }
  
    // Test connection to backend
    async testConnection() {
        try {
            console.log('Testing connection to backend...');
            const health = await this.healthCheck();
            console.log('Backend connection successful:', health);
            
            try {
                const summary = await this.getSummary();
                console.log('Summary API connection successful:', summary);
                return { backend: true, summaryApi: true };
            } catch (summaryError) {
                console.warn('Summary API not ready, trying health data:', summaryError.message);
                const healthData = await this.getHealthData();
                console.log('Health API connection successful:', healthData);
                return { backend: true, healthApi: true };
            }
            
        } catch (error) {
            console.error('Connection test failed:', error);
            return { backend: false, error: error.message };
        }
    }
  
    // Quick test method to check which endpoints work
    async testAllEndpoints() {
        const endpoints = [
            { name: 'Health Check', method: () => this.healthCheck() },
            { name: 'Summary', method: () => this.getSummary() },
            { name: 'Health Data', method: () => this.getHealthData() },
            { name: 'Education Data', method: () => this.getEducationData() },
            { name: 'Demographics', method: () => this.getDemographics() },
            { name: 'Economic Data', method: () => this.getEconomicData() },
            { name: 'Country Profile', method: () => this.getCountryProfile() },
        ];
  
        const results = {};
        
        for (const endpoint of endpoints) {
            try {
                await endpoint.method();
                results[endpoint.name] = 'Working ✅';
                console.log(`✅ ${endpoint.name}: Working`);
            } catch (error) {
                results[endpoint.name] = `Error: ${error.message} ❌`;
                console.log(`❌ ${endpoint.name}: ${error.message}`);
            }
        }
  
        return results;
    }
  }
  
  // Export singleton instance
  const apiService = new APIService();
  export default apiService;