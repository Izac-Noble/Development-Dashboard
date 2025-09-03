// src/services/whoDataService.js
import apiService from './api';

export class WhoDataService {
  // Get comprehensive health data for Uganda
  static async getUgandaHealthData() {
    try {
      const response = await apiService.get('/uganda/health');
      return response;
    } catch (error) {
      console.error('Error fetching Uganda health data:', error);
      throw error;
    }
  }

  // Get health summary statistics
  static async getHealthSummary() {
    try {
      const response = await apiService.get('/uganda/summary');
      return response;
    } catch (error) {
      console.error('Error fetching health summary:', error);
      throw error;
    }
  }

  // Get trend data for charts
  static async getTrendData() {
    try {
      const response = await apiService.get('/uganda/trends');
      return response;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      throw error;
    }
  }

  // Get specific health indicators
  static async getHealthIndicators(indicator = null) {
    try {
      const endpoint = indicator ? `/uganda/indicators/${indicator}` : '/uganda/indicators';
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching health indicators:', error);
      throw error;
    }
  }

  // Get regional data
  static async getRegionalData() {
    try {
      const response = await apiService.get('/uganda/regional');
      return response;
    } catch (error) {
      console.error('Error fetching regional data:', error);
      throw error;
    }
  }
}

export default WhoDataService;