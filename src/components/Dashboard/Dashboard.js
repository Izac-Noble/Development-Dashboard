// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import StatsCards from './StatsCards';
import Charts from './Charts';
import apiService from '../../services/api';

const Dashboard = () => {
  const [educationData, setEducationData] = useState(null);
  const [indicators, setIndicators] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load all dashboard data
        const [educationResponse, indicatorsResponse, categoriesResponse] = await Promise.all([
          apiService.getUgandaEducation(),
          apiService.getEducationIndicators(),
          apiService.getIndicatorsByCategory()
        ]);
        
        setEducationData(educationResponse);
        setIndicators(indicatorsResponse);
        setCategories(categoriesResponse);
        
        console.log('Dashboard data loaded successfully');
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold text-white mb-2">Uganda Education Dashboard</h1>
          <p className="text-gray-400">Loading UNESCO education data...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-700 p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-6 bg-gray-600 rounded mb-1"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-700 p-6 rounded-lg animate-pulse">
              <div className="h-6 bg-gray-600 rounded mb-4"></div>
              <div className="h-64 bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-white mb-2">Uganda Education Dashboard</h1>
        
        <div className="bg-red-900 border border-red-700 rounded-lg p-6">
          <h2 className="text-red-400 font-semibold text-lg mb-2">Error Loading Dashboard</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => apiService.clearCache()} 
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Uganda Education Dashboard</h1>
        <p className="text-gray-400">
          Comprehensive education statistics from UNESCO Institute for Statistics
        </p>
        
        {educationData?.last_updated && (
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>Last Updated: {new Date(educationData.last_updated).toLocaleString()}</span>
            <span>•</span>
            <span>Source: UNESCO Institute for Statistics</span>
            {educationData?.total_records && (
              <>
                <span>•</span>
                <span>{educationData.total_records} data points</span>
              </>
            )}
          </div>
        )}
      </div>
      
      <StatsCards />
      
      <Charts 
        educationData={educationData} 
        indicators={indicators}
        categories={categories}
      />
      
      {/* Quick Stats Summary */}
      {categories?.categories && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Data Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {indicators?.total_count || 0}
              </div>
              <div className="text-sm text-gray-400">Total Indicators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {Object.keys(categories.categories).length}
              </div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {educationData?.total_records || 0}
              </div>
              <div className="text-sm text-gray-400">Data Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">UGA</div>
              <div className="text-sm text-gray-400">Country Code</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )};