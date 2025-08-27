// src/hooks/useApiData.js
import { useState, useEffect } from 'react';
import apiService from '../services/api';

const useApiData = () => {
  const [ugandaStats, setUgandaStats] = useState(null);
  const [regionalData, setRegionalData] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check backend health using the apiService
  const checkBackendHealth = async () => {
    try {
      const health = await apiService.healthCheck();
      console.log('Backend health check successful:', health);
      setBackendStatus('connected');
      return true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus('disconnected');
      return false;
    }
  };

  // Mock Uganda stats - keeping as fallback
  const getMockUgandaStats = () => {
    return {
      healthcare: {
        hospitals: 127,
        health_centers: 892,
        dispensaries: 2156
      },
      education: {
        primary_schools: 15420,
        secondary_schools: 2960,
        universities: 45
      },
      population: {
        total: 47100000,
        urban_percentage: 24.4,
        growth_rate: 3.0
      },
      economy: {
        gdp_growth: 5.2,
        gdp_per_capita: 794,
        inflation_rate: 2.8
      }
    };
  };

  // Mock regional data - keeping as fallback
  const getMockRegionalData = () => {
    return [
      { region: 'Central', hospitals: 45, beds: 2500, population: 15000000 },
      { region: 'Western', hospitals: 32, beds: 1800, population: 12000000 },
      { region: 'Eastern', hospitals: 28, beds: 1600, population: 11000000 },
      { region: 'Northern', hospitals: 22, beds: 1200, population: 9100000 },
    ];
  };

  // Fetch real data from backend using apiService
  const fetchRealData = async () => {
    try {
      console.log('Fetching real data from backend...');
      
      // Try to get summary data first
      try {
        const summaryData = await apiService.getSummary();
        if (summaryData) {
          console.log('Summary data received:', summaryData);
          
          // Extract stats from summary if available
          if (summaryData.stats) {
            setUgandaStats(summaryData.stats);
          }
          
          // Extract regional data if available
          if (summaryData.regional_data) {
            setRegionalData(summaryData.regional_data);
          }
        }
      } catch (summaryError) {
        console.warn('Summary endpoint not available, trying individual endpoints:', summaryError.message);
        
        // Try individual endpoints
        const [healthResponse, economicResponse] = await Promise.allSettled([
          apiService.getHealthData(),
          apiService.getEconomicData()
        ]);
        
        if (healthResponse.status === 'fulfilled') {
          console.log('Health data received:', healthResponse.value);
          setHealthData(healthResponse.value);
        }
        
        if (economicResponse.status === 'fulfilled') {
          console.log('Economic data received:', economicResponse.value);
          // Process economic data into ugandaStats format if needed
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error fetching real data:', error);
      return false;
    }
  };

  // Fetch WHO health data specifically
  const fetchHealthData = async () => {
    try {
      console.log('Fetching WHO health data...');
      const data = await apiService.getHealthData(); // Using the consistent method name
      console.log('WHO health data received:', data);
      setHealthData(data);
      return data;
    } catch (error) {
      console.error('Error fetching WHO health data:', error);
      return null;
    }
  };

  // Load data with fallback strategy
  const loadData = async () => {
    try {
      // First try to load real data
      const realDataSuccess = await fetchRealData();
      
      if (!realDataSuccess) {
        console.log('Real data failed, using mock data as fallback');
        setUgandaStats(getMockUgandaStats());
        setRegionalData(getMockRegionalData());
      }
      
      // Always try to fetch health data
      await fetchHealthData();
      
    } catch (error) {
      console.error('Error in loadData:', error);
      // Use mock data as final fallback
      setUgandaStats(getMockUgandaStats());
      setRegionalData(getMockRegionalData());
    }
  };

  // Upload file using apiService
  const uploadFile = async (file) => {
    try {
      setIsLoading(true);
      const result = await apiService.uploadFile(file);
      
      console.log('File uploaded successfully:', result);
      
      // Add to uploaded files list
      setUploadedFiles(prev => [...prev, {
        filename: result.filename,
        size: result.size,
        uploaded_at: new Date().toISOString()
      }]);
      
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    
    try {
      const backendHealthy = await checkBackendHealth();
      
      if (backendHealthy) {
        await loadData();
      } else {
        console.log('Backend not healthy, using fallback data');
        setUgandaStats(getMockUgandaStats());
        setRegionalData(getMockRegionalData());
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test connection using apiService
  const testConnection = async () => {
    try {
      const result = await apiService.testConnection();
      console.log('Connection test result:', result);
      
      if (result.backend) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('disconnected');
      }
      
      return result;
    } catch (error) {
      console.error('Connection test failed:', error);
      setBackendStatus('disconnected');
      return { backend: false, error: error.message };
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('Loading initial data...');
      setIsLoading(true);
      
      try {
        // Check backend health first
        const backendHealthy = await checkBackendHealth();
        
        if (backendHealthy) {
          console.log('Backend is healthy, loading real data...');
          await loadData();
        } else {
          console.log('Backend is not healthy, using fallback data...');
          setUgandaStats(getMockUgandaStats());
          setRegionalData(getMockRegionalData());
        }
      } catch (error) {
        console.error('Error in initial data load:', error);
        // Final fallback
        setUgandaStats(getMockUgandaStats());
        setRegionalData(getMockRegionalData());
      } finally {
        setIsLoading(false);
        console.log('Initial data loading complete');
      }
    };

    loadInitialData();
  }, []);

  return {
    ugandaStats,
    regionalData,
    uploadedFiles,
    healthData,
    isLoading,
    backendStatus,
    uploadFile,
    refreshData,
    checkBackendHealth,
    fetchHealthData,
    testConnection, // NEW: expose connection testing
    loadData // NEW: expose data loading function
  };
};

export default useApiData;