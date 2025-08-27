// Frontend WHO Data Service
class WHODataService {
    constructor(baseUrl = 'http://localhost:8000/api') {
        this.baseUrl = baseUrl;
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            console.log(`Fetched fresh data for ${endpoint}`);
            return data;
        } catch (error) {
            console.error('API fetch error:', error);
            throw error;
        }
    }

    async getHealthSummary() {
        return this.fetchWithCache('/uganda/health-summary');
    }

    async getHealthTrends() {
        return this.fetchWithCache('/uganda/trends');
    }

    async getSpecificIndicator(indicatorCode, startYear = 2018, endYear = 2023) {
        return this.fetchWithCache(`/uganda/indicator/${indicatorCode}?start_year=${startYear}&end_year=${endYear}`);
    }

    async getAvailableIndicators() {
        return this.fetchWithCache('/uganda/health-indicators');
    }

    clearCache() {
        this.cache.clear();
        console.log('Cache cleared');
    }

    // Utility methods for data processing
    formatValue(value, indicator) {
        if (value === null || value === undefined) return 'N/A';
        
        // Format based on indicator type
        if (indicator.toLowerCase().includes('mortality') || indicator.includes('MORT')) {
            return `${parseFloat(value).toFixed(1)} per 1,000`;
        } else if (indicator.includes('LE') || indicator === 'WHOSIS_000001') {
            return `${parseFloat(value).toFixed(1)} years`;
        } else if (indicator.includes('PHYS')) {
            return `${parseFloat(value).toFixed(2)} per 1,000`;
        } else if (indicator.includes('MMR')) {
            return `${parseFloat(value).toFixed(1)} per 100,000`;
        }
        
        return parseFloat(value).toFixed(1);
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
            'SH.IMM.MEAS': 'Measles Immunization Coverage'
        };
        return indicators[code] || code;
    }

    // Process data for charts
    prepareChartData(data, indicatorCode) {
        if (!data || data.length === 0) return null;

        return {
            labels: data.map(item => item.year).sort(),
            datasets: [{
                label: this.getIndicatorName(indicatorCode),
                data: data.map(item => item.value).filter(val => val !== null),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.1
            }]
        };
    }
}

// Export for use in React components
export default WHODataService;