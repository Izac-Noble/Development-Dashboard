// src/components/Dashboard/StatsCards.js
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Building, GraduationCap, BookOpen, Activity } from 'lucide-react';
import apiService from '../../services/api';

const StatsCards = () => {
  const [educationData, setEducationData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEducationData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both education data and summary
        const [educationResponse, summaryResponse] = await Promise.all([
          apiService.getUgandaEducation(),
          apiService.getEducationSummary()
        ]);
        
        setEducationData(educationResponse);
        setSummary(summaryResponse);
        
        console.log('Education data loaded:', educationResponse);
        console.log('Summary loaded:', summaryResponse);
        
      } catch (error) {
        console.error('Error loading education data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadEducationData();
  }, []);

  // Helper function to find specific indicators from education data
  const findIndicatorValue = (searchTerms, fallback = 'N/A') => {
    if (!educationData || !educationData.data) return fallback;
    
    const indicator = educationData.data.find(item => 
      searchTerms.some(term => 
        item.indicator_name && item.indicator_name.toLowerCase().includes(term.toLowerCase())
      )
    );
    
    if (indicator && indicator.value !== null && indicator.value !== undefined) {
      return apiService.formatEducationValue(indicator.value, indicator.unit);
    }
    
    return fallback;
  };

  // Helper function to get latest value for a category
  const getLatestCategoryValue = (category, fallback = 'N/A') => {
    if (!educationData || !educationData.data) return fallback;
    
    const categoryData = educationData.data
      .filter(item => item.category === category && item.value !== null)
      .sort((a, b) => parseInt(b.year) - parseInt(a.year));
    
    if (categoryData.length > 0) {
      return apiService.formatEducationValue(categoryData[0].value, categoryData[0].unit);
    }
    
    return fallback;
  };

  const statsData = [
    {
      title: 'Total Indicators',
      value: loading ? 'Loading...' : (summary?.summary?.total_indicators || 0),
      icon: Activity,
      category: 'overview'
    },
    {
      title: 'Data Points',
      value: loading ? 'Loading...' : (summary?.summary?.data_points || 0),
      icon: Building,
      category: 'overview'
    },
    {
      title: 'Literacy Rate',
      value: loading ? 'Loading...' : 
        findIndicatorValue(['literacy', 'literate'], getLatestCategoryValue('literacy')),
      icon: BookOpen,
      category: 'literacy'
    },
    {
      title: 'Enrollment',
      value: loading ? 'Loading...' : 
        findIndicatorValue(['enrollment', 'enrol'], getLatestCategoryValue('enrollment')),
      icon: GraduationCap,
      category: 'enrollment'
    },
    {
      title: 'Teachers',
      value: loading ? 'Loading...' : 
        findIndicatorValue(['teacher', 'instructor'], getLatestCategoryValue('teachers')),
      icon: Users,
      category: 'teachers'
    },
    {
      title: 'Education Budget',
      value: loading ? 'Loading...' : 
        findIndicatorValue(['expenditure', 'spending', 'budget'], getLatestCategoryValue('expenditure')),
      icon: TrendingUp,
      category: 'expenditure'
    }
  ];

  // Color scheme based on category
  const getCategoryColors = (category) => {
    switch (category) {
      case 'overview':
        return { border: 'border-blue-500', icon: 'text-blue-400' };
      case 'literacy':
        return { border: 'border-green-500', icon: 'text-green-400' };
      case 'enrollment':
        return { border: 'border-purple-500', icon: 'text-purple-400' };
      case 'teachers':
        return { border: 'border-yellow-500', icon: 'text-yellow-400' };
      case 'expenditure':
        return { border: 'border-red-500', icon: 'text-red-400' };
      default:
        return { border: 'border-gray-500', icon: 'text-gray-400' };
    }
  };

  if (error) {
    return (
      <div className="mb-8 p-4 bg-red-900 border border-red-700 rounded-lg">
        <h3 className="text-red-400 font-semibold mb-2">Error Loading Data</h3>
        <p className="text-red-300 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 text-white text-sm rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Uganda Education Statistics</h2>
        <p className="text-gray-400 text-sm">
          Data from UNESCO Institute for Statistics
          {summary?.last_updated && (
            <span className="ml-2">
              • Last updated: {new Date(summary.last_updated).toLocaleDateString()}
            </span>
          )}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getCategoryColors(stat.category);
          
          return (
            <div 
              key={index} 
              className={`bg-navy bg-opacity-50 p-4 rounded-lg ${colors.border} border hover:bg-opacity-70 transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-300 text-sm mb-1">{stat.title}</p>
                  <p className={`text-xl font-bold text-white ${loading ? 'animate-pulse' : ''}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">UNESCO Data</p>
                </div>
                <Icon className={`${colors.icon} ml-3`} size={28} />
              </div>
            </div>
          );
        })}
      </div>

      {summary?.summary?.categories && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(summary.summary.categories).map(([category, count]) => (
            <div key={category} className="bg-gray-700 p-3 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">{category}</span>
                <span className="text-white font-semibold">{count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatsCards;