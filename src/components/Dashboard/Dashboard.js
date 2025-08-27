// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, AlertCircle, RefreshCw, Heart } from 'lucide-react';
import StatsCards from './StatsCards';
import Charts from './Charts';
import apiService from '../../services/api';

const Dashboard = ({ ugandaStats, regionalData, isLoading, backendStatus }) => {
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthTrends, setHealthTrends] = useState(null);
  const [error, setError] = useState(null);

  // Safe array check utility
  const safeArray = (arr) => Array.isArray(arr) ? arr : [];

  // Safe object check utility
  const safeObject = (obj) => (obj && typeof obj === 'object') ? obj : {};

  // Load WHO health data on component mount
  useEffect(() => {
    const loadHealthData = async () => {
      try {
        setHealthLoading(true);
        setError(null);
        
        console.log('Loading WHO health data...');
        
        // Try to load both summary and trends data
        try {
          const [summaryResponse, trendsResponse] = await Promise.allSettled([
            apiService.getHealthData(), // Use consistent method name
            apiService.getCategoryTrends('health') // Use consistent method name
          ]);
          
          if (summaryResponse.status === 'fulfilled') {
            console.log('WHO Summary Data:', summaryResponse.value);
            setHealthData(summaryResponse.value);
          } else {
            console.warn('Health summary failed:', summaryResponse.reason);
          }
          
          if (trendsResponse.status === 'fulfilled') {
            console.log('WHO Trends Data:', trendsResponse.value);
            setHealthTrends(trendsResponse.value);
          } else {
            console.warn('Health trends failed:', trendsResponse.reason);
          }
          
        } catch (error) {
          console.error('Error loading health data:', error);
          setError(error.message);
        }
        
      } catch (error) {
        console.error('Error in loadHealthData:', error);
        setError(error.message);
      } finally {
        setHealthLoading(false);
      }
    };

    loadHealthData();
  }, []);

  // Refresh health data
  const refreshHealthData = async () => {
    try {
      setHealthLoading(true);
      setError(null);
      
      // Clear cache and reload
      apiService.clearCache();
      
      const [summaryResponse, trendsResponse] = await Promise.allSettled([
        apiService.getHealthData(),
        apiService.getCategoryTrends('health')
      ]);
      
      if (summaryResponse.status === 'fulfilled') {
        setHealthData(summaryResponse.value);
      }
      
      if (trendsResponse.status === 'fulfilled') {
        setHealthTrends(trendsResponse.value);
      }
      
    } catch (error) {
      console.error('Error refreshing health data:', error);
      setError(error.message);
    } finally {
      setHealthLoading(false);
    }
  };

  // Fallback regional data if backend is down
  const fallbackRegionalData = [
    { region: 'Central', hospitals: 45, beds: 2500 },
    { region: 'Western', hospitals: 32, beds: 1800 },
    { region: 'Eastern', hospitals: 28, beds: 1600 },
    { region: 'Northern', hospitals: 22, beds: 1200 },
  ];

  const chartData = safeArray(regionalData).length > 0 ? regionalData : fallbackRegionalData;

  return (
    <div className="space-y-6">
      {/* Loading indicator */}
      {(isLoading || healthLoading) && (
        <div className="bg-blue-600 text-white p-4 rounded-lg flex items-center">
          <RefreshCw className="animate-spin mr-3" size={20} />
          Loading data...
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="mr-3" size={20} />
            <span>Health data error: {error}</span>
          </div>
          <button 
            onClick={refreshHealthData}
            className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm"
            disabled={healthLoading}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Development Overview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <TrendingUp className="mr-3" />
          Uganda Development Overview
          {backendStatus === 'connected' && (
            <CheckCircle className="ml-3 text-green-400" size={20} />
          )}
          {backendStatus === 'disconnected' && (
            <AlertCircle className="ml-3 text-red-400" size={20} />
          )}
        </h2>
        
        <StatsCards ugandaStats={ugandaStats} />
        <Charts regionalData={chartData} />
      </div>

      {/* WHO Health Data Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="mr-3 text-red-400" />
            Uganda Health Indicators (WHO Data)
          </div>
          <button 
            onClick={refreshHealthData}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm flex items-center"
            disabled={healthLoading}
          >
            <RefreshCw className={`mr-2 ${healthLoading ? 'animate-spin' : ''}`} size={16} />
            Refresh
          </button>
        </h2>

        {healthData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* WHO Indicators */}
            {healthData?.who_data && Object.entries(healthData.who_data).map(([indicator, values]) => {
              const safeValues = safeArray(values);
              if (safeValues.length === 0) return null;
              
              const latest = safeValues[safeValues.length - 1];
              if (!latest) return null;
              
              const indicatorName = apiService.getIndicatorName(indicator);
              const displayValue = latest.display_value || apiService.formatHealthValue(latest.value, indicator);
              
              return (
                <div key={indicator} className="bg-navy bg-opacity-50 p-4 rounded-lg border border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">{indicatorName}</p>
                      <p className="text-xl font-bold text-white">{displayValue}</p>
                      <p className="text-gray-400 text-xs">Year: {latest.year || 'N/A'}</p>
                    </div>
                    <Heart className="text-red-400" size={24} />
                  </div>
                </div>
              );
            })}

            {/* World Bank Indicators */}
            {healthData?.world_bank_data && Object.entries(healthData.world_bank_data).map(([indicator, values]) => {
              const safeValues = safeArray(values);
              if (safeValues.length === 0) return null;
              
              const latest = safeValues[0]; // World Bank data is newest first
              if (!latest) return null;
              
              const displayValue = apiService.formatHealthValue(latest.value, indicator);
              
              return (
                <div key={indicator} className="bg-navy bg-opacity-50 p-4 rounded-lg border border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">{latest.indicator_name || indicator}</p>
                      <p className="text-xl font-bold text-white">{displayValue}</p>
                      <p className="text-gray-400 text-xs">Year: {latest.year || 'N/A'}</p>
                    </div>
                    <TrendingUp className="text-green-400" size={24} />
                  </div>
                </div>
              );
            })}

            {/* Handle simple data structure */}
            {healthData?.data && Object.entries(healthData.data).map(([indicator, value]) => {
              if (typeof value === 'object' && value !== null) {
                const displayValue = value.display_value || apiService.formatHealthValue(value.value, indicator);
                
                return (
                  <div key={indicator} className="bg-navy bg-opacity-50 p-4 rounded-lg border border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">{apiService.getIndicatorName(indicator)}</p>
                        <p className="text-xl font-bold text-white">{displayValue}</p>
                        <p className="text-gray-400 text-xs">Year: {value.year || 'N/A'}</p>
                      </div>
                      <Heart className="text-blue-400" size={24} />
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Health Data Status */}
        {healthData && (
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>
                Health data last updated: {
                  healthData.last_updated ? 
                    new Date(healthData.last_updated).toLocaleString() : 
                    'Unknown'
                }
              </span>
              <span>
                Country: {healthData.country || 'Uganda'} ({healthData.country_code || 'UG'})
              </span>
            </div>
          </div>
        )}

        {/* No health data message */}
        {!healthLoading && !healthData && !error && (
          <div className="text-center py-8 text-gray-400">
            <Heart className="mx-auto mb-3" size={48} />
            <p>No health data available</p>
            <button 
              onClick={refreshHealthData}
              className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
            >
              Load Health Data
            </button>
          </div>
        )}
      </div>

      {/* Health Trends Chart */}
      {healthTrends && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
          <h3 className="text-xl font-bold text-white mb-4">Health Trends Over Time</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Handle trends as direct object */}
            {healthTrends?.trends && Object.entries(healthTrends.trends).map(([indicator, values]) => {
              const safeValues = safeArray(values);
              if (safeValues.length === 0) return null;
              
              const indicatorName = apiService.getIndicatorName(indicator);
              
              return (
                <div key={indicator} className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">{indicatorName}</h4>
                  <div className="space-y-2">
                    {safeValues.slice(-5).map((item, index) => {
                      if (!item) return null;
                      
                      const displayValue = item.display_value || apiService.formatHealthValue(item.value, indicator);
                      
                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-300">{item.year || 'N/A'}</span>
                          <span className="text-white font-medium">{displayValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Handle trends as array of indicators */}
            {Array.isArray(healthTrends) && healthTrends.map((trendData, index) => {
              if (!trendData.indicator || !trendData.values) return null;
              
              const safeValues = safeArray(trendData.values);
              const indicatorName = apiService.getIndicatorName(trendData.indicator);
              
              return (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">{indicatorName}</h4>
                  <div className="space-y-2">
                    {safeValues.slice(-5).map((item, itemIndex) => {
                      if (!item) return null;
                      
                      const displayValue = item.display_value || apiService.formatHealthValue(item.value, trendData.indicator);
                      
                      return (
                        <div key={itemIndex} className="flex justify-between text-sm">
                          <span className="text-gray-300">{item.year || 'N/A'}</span>
                          <span className="text-white font-medium">{displayValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          {healthTrends?.period && (
            <div className="mt-4 text-xs text-gray-400 text-center">
              Period: {healthTrends.period} | Source: WHO Global Health Observatory
            </div>
          )}
        </div>
      )}

      {/* Debug section (only in development) */}
      {process.env.NODE_ENV === 'development' && (healthData || healthTrends) && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white font-semibold mb-2">Debug Info:</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h5 className="text-gray-300 text-sm mb-1">Health Data:</h5>
              <pre className="text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(healthData, null, 2)}
              </pre>
            </div>
            <div>
              <h5 className="text-gray-300 text-sm mb-1">Health Trends:</h5>
              <pre className="text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(healthTrends, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;